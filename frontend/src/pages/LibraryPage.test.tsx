import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { schoolYears } from '@/api/documents'
import {
  getHandler,
  groupA,
  groupB,
  meHandler,
  mockApi,
  monitor,
  renderRoute,
  usuario,
} from '@/test/render'

const pdf = (name: string) =>
  new File(['%PDF-1.4'], name, { type: 'application/pdf' })

const uploads = (fetchMock: ReturnType<typeof mockApi>) =>
  fetchMock.mock.calls
    .filter(([, init]) => init?.method === 'POST')
    .map(([, init]) => Object.fromEntries(init!.body as FormData))

describe('Biblioteca', () => {
  afterEach(() => vi.restoreAllMocks())

  it('los cursos van del actual hacia atrás', () => {
    const years = schoolYears(new Date(2026, 9, 20))
    expect(years[0]).toBe('2026-2027')
    expect(years[1]).toBe('2025-2026')
    expect(years).toHaveLength(10)
    expect(schoolYears(new Date(2027, 1, 1))[0]).toBe('2026-2027')
  })

  it('el monitor sube ficheros del ordenador con curso, grupo y etiquetas', async () => {
    let calls = 0
    const fetchMock = mockApi(
      meHandler(monitor),
      getHandler('/groups', [groupA, groupB]),
      (url, init) => {
        if (url.pathname !== '/api/v1/documents' || init.method !== 'POST')
          return undefined
        calls += 1
        return calls === 1
          ? { status: 201, body: { id: 1 } }
          : {
              status: 409,
              body: { detail: 'Ya está en la biblioteca: «Reunión»' },
            }
      },
    )
    renderRoute('/biblioteca', { token: 't' })

    await userEvent.upload(await screen.findByTestId('local-files'), [
      pdf('Reunión 1.pdf'),
      pdf('Reunión 2.pdf'),
    ])
    const dialog = await screen.findByRole('dialog')
    await userEvent.selectOptions(
      within(dialog).getByLabelText('Curso escolar'),
      schoolYears()[1],
    )
    await userEvent.selectOptions(
      await within(dialog).findByRole('combobox', { name: 'Grupo' }),
      groupA.name,
    )
    await userEvent.type(
      within(dialog).getByLabelText(/Etiquetas/),
      'perdón, amistad',
    )
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Añadir 2' }),
    )

    expect(await within(dialog).findByText('Añadido')).toBeInTheDocument()
    expect(
      await within(dialog).findByText('Ya está en la biblioteca: «Reunión»'),
    ).toBeInTheDocument()
    await waitFor(() => expect(uploads(fetchMock)).toHaveLength(2))
    const [first] = uploads(fetchMock)
    expect(first.school_year).toBe(schoolYears()[1])
    expect(first.group_id).toBe(String(groupA.id))
    expect(first.tags).toBe('perdón, amistad')
    expect((first.file as File).name).toBe('Reunión 1.pdf')
    expect(first.drive_file_id).toBeUndefined()
    expect(
      within(dialog).getByRole('button', { name: 'Reintentar' }),
    ).toBeInTheDocument()
  })

  it('sin clave de API el botón de Drive está desactivado', async () => {
    mockApi(meHandler(monitor))
    renderRoute('/biblioteca', { token: 't' })

    expect(
      await screen.findByRole('button', { name: 'Añadir desde Drive' }),
    ).toBeDisabled()
  })

  it('un usuario no ve la biblioteca', async () => {
    mockApi(meHandler(usuario))
    renderRoute('/biblioteca', { token: 't' })

    expect(
      await screen.findByText(
        'La biblioteca es para monitores, coordinadores y administradores.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Biblioteca' }),
    ).not.toBeInTheDocument()
  })
})
