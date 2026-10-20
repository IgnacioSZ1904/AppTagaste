import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { schoolYears, type LibraryDocument } from '@/api/documents'
import {
  admin,
  getHandler,
  groupA,
  groupB,
  meHandler,
  mockApi,
  monitor,
  renderRoute,
  requests,
  usuario,
} from '@/test/render'

vi.mock('docx-preview', () => ({
  renderAsync: async (_blob: Blob, container: HTMLElement) => {
    container.textContent = 'Contenido del Word'
  },
}))

const WORD =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const libDoc = (
  id: number,
  title: string,
  extra: Partial<LibraryDocument> = {},
): LibraryDocument => ({
  id,
  title,
  school_year: '2025-2026',
  group_id: groupA.id,
  group_name: groupA.name,
  filename: `${title}.pdf`,
  mime_type: 'application/pdf',
  size: 2048,
  tags: [{ id: 1, name: 'perdón' }],
  created_by: 'Luis Pérez',
  created_at: '2026-10-01T10:00:00Z',
  has_text: true,
  can_edit: false,
  ...extra,
})

const reunion = libDoc(1, 'Reunión del perdón')
const oracion = libDoc(2, 'Oración final', {
  mime_type: WORD,
  filename: 'Oración final.docx',
  tags: [],
})
const antiguo = libDoc(3, 'Convivencia', {
  school_year: '2024-2025',
  group_name: 'Confirmación B',
  has_text: false,
})

/** Responde a GET /documents filtrando como la API (curso, grupo, q y etiquetas). */
const documentsHandler =
  (docs: LibraryDocument[]) => (url: URL, init: RequestInit) => {
    if (url.pathname === '/api/v1/documents/filters')
      return {
        body: {
          school_years: [],
          groups: [],
          tags: [
            { id: 1, name: 'perdón' },
            { id: 2, name: 'amistad' },
          ],
        },
      }
    if (
      url.pathname !== '/api/v1/documents' ||
      (init.method ?? 'GET') !== 'GET'
    )
      return undefined
    const p = url.searchParams
    const q = p.get('q')?.toLowerCase()
    return {
      body: docs
        .filter(
          (d) =>
            !p.get('school_year') || d.school_year === p.get('school_year'),
        )
        .filter((d) => !p.get('group') || d.group_name === p.get('group'))
        .filter((d) =>
          p.getAll('tag').every((t) => d.tags.some((x) => x.name === t)),
        )
        .filter((d) => !q || d.title.toLowerCase().includes(q))
        .map((d) =>
          q ? { ...d, snippet: `la <mark>${q}</mark> <b>en</b> grupo` } : d,
        ),
    }
  }

const documentRequests = (fetchMock: ReturnType<typeof mockApi>) =>
  fetchMock.mock.calls
    .map(([input]) => new URL(String(input), 'http://localhost'))
    .filter((url) => url.pathname === '/api/v1/documents')

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

  it('navega por carpetas: cursos, grupos y documentos', async () => {
    mockApi(meHandler(monitor), documentsHandler([reunion, oracion, antiguo]))
    const { router } = renderRoute('/biblioteca', { token: 't' })

    const years = await screen.findByRole('list', { name: 'Cursos' })
    const links = within(years).getAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual([
      '2025-20262 documentos',
      '2024-20251 documento',
    ])
    await userEvent.click(links[0])

    const groups = await screen.findByRole('list', { name: 'Grupos' })
    await userEvent.click(
      within(groups).getByRole('link', { name: /Confirmación A/ }),
    )
    expect(router.state.location.pathname).toBe(
      '/biblioteca/2025-2026/Confirmaci%C3%B3n%20A',
    )

    const docs = await screen.findByRole('list', { name: 'Documentos' })
    expect(within(docs).getByText('Reunión del perdón')).toBeInTheDocument()
    expect(within(docs).getByText('Oración final')).toBeInTheDocument()

    await userEvent.click(
      within(screen.getByRole('navigation', { name: 'Ruta' })).getByRole(
        'link',
        { name: 'Biblioteca' },
      ),
    )
    expect(
      await screen.findByRole('list', { name: 'Cursos' }),
    ).toBeInTheDocument()
  })

  it('la URL abre directamente una carpeta y avisa del documento sin texto', async () => {
    mockApi(meHandler(admin), documentsHandler([reunion, antiguo]))
    renderRoute('/biblioteca/2024-2025/Confirmaci%C3%B3n%20B', { token: 't' })

    expect(await screen.findByText('Convivencia')).toBeInTheDocument()
    expect(screen.queryByText('Reunión del perdón')).not.toBeInTheDocument()
    expect(screen.getByText(/No se pudo leer su texto/)).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Ruta' })).toHaveTextContent(
      'Biblioteca›2024-2025›Confirmación B',
    )
  })

  it('busca dentro de la carpeta, resalta el fragmento y deja buscar en toda la biblioteca', async () => {
    const fetchMock = mockApi(
      meHandler(monitor),
      documentsHandler([reunion, oracion, antiguo]),
    )
    const { router } = renderRoute('/biblioteca/2025-2026', { token: 't' })

    await userEvent.type(
      await screen.findByRole('searchbox', { name: 'Buscar en la biblioteca' }),
      'reunión',
    )
    expect((await screen.findByText('reunión')).tagName).toBe('MARK')
    const docs = screen.getByRole('list', { name: 'Documentos' })
    // El HTML del documento se pinta como texto
    expect(within(docs).getByText(/<b>en<\/b> grupo/)).toBeInTheDocument()
    expect(screen.getByText('1 resultado')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?q=reuni%C3%B3n')
    const last = documentRequests(fetchMock).at(-1)!
    expect(last.searchParams.get('school_year')).toBe('2025-2026')
    expect(last.searchParams.get('q')).toBe('reunión')

    await userEvent.click(
      screen.getByRole('link', { name: 'Buscar en toda la biblioteca' }),
    )
    expect(router.state.location.pathname).toBe('/biblioteca')
    await waitFor(() =>
      expect(
        documentRequests(fetchMock).at(-1)!.searchParams.get('school_year'),
      ).toBeNull(),
    )
  })

  it('filtra por etiquetas desde los chips y desde la tarjeta', async () => {
    mockApi(meHandler(monitor), documentsHandler([reunion, oracion, antiguo]))
    const { router } = renderRoute('/biblioteca', { token: 't' })

    const chips = await screen.findByRole('group', { name: 'Etiquetas' })
    await userEvent.click(within(chips).getByRole('button', { name: 'perdón' }))

    const docs = await screen.findByRole('list', { name: 'Documentos' })
    expect(within(docs).getByText('Reunión del perdón')).toBeInTheDocument()
    expect(within(docs).queryByText('Oración final')).not.toBeInTheDocument()
    expect(router.state.location.search).toBe('?tag=perd%C3%B3n')

    await userEvent.click(
      within(docs).getAllByRole('button', { name: 'perdón', pressed: true })[0],
    )
    expect(
      await screen.findByRole('list', { name: 'Cursos' }),
    ).toBeInTheDocument()
  })

  it('previsualiza un PDF y un Word y descarga con su nombre', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:fichero')
    URL.revokeObjectURL = vi.fn()
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    const fetchMock = mockApi(
      meHandler(monitor),
      documentsHandler([reunion, oracion]),
      (url) =>
        /^\/api\/v1\/documents\/\d+\/file$/.test(url.pathname)
          ? { body: 'contenido' }
          : undefined,
    )
    renderRoute('/biblioteca/2025-2026/Confirmaci%C3%B3n%20A', { token: 't' })

    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Vista previa de Reunión del perdón',
      }),
    )
    let dialog = await screen.findByRole('dialog')
    expect(
      await within(dialog).findByTitle('Vista previa de Reunión del perdón'),
    ).toHaveAttribute('src', 'blob:fichero')
    const [, init] = fetchMock.mock.calls.find(([input]) =>
      String(input).endsWith('/documents/1/file'),
    )!
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer t')

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Descargar' }),
    )
    await waitFor(() => expect(click).toHaveBeenCalled())
    const link = click.mock.contexts[0] as HTMLAnchorElement
    expect(link.download).toBe('Reunión del perdón.pdf')
    await userEvent.click(
      within(dialog).getAllByRole('button', { name: 'Cerrar' })[0],
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Vista previa de Oración final' }),
    )
    dialog = await screen.findByRole('dialog')
    expect(
      await within(dialog).findByText('Contenido del Word'),
    ).toBeInTheDocument()
  })

  it('biblioteca vacía', async () => {
    mockApi(meHandler(monitor), documentsHandler([]))
    renderRoute('/biblioteca', { token: 't' })

    expect(await screen.findByText(/Aún no hay documentos/)).toBeInTheDocument()
  })

  it('edita curso, grupo, título y etiquetas de un documento propio', async () => {
    const mine = { ...reunion, can_edit: true }
    const fetchMock = mockApi(
      meHandler(monitor),
      getHandler('/groups', [groupA, groupB]),
      documentsHandler([mine, oracion]),
      (url, init) =>
        url.pathname === `/api/v1/documents/${mine.id}` &&
        init.method === 'PATCH'
          ? { body: { ...mine, title: 'Nuevo' } }
          : undefined,
    )
    renderRoute('/biblioteca/2025-2026/Confirmaci%C3%B3n%20A', { token: 't' })

    // Solo en el que puede editar
    await screen.findByRole('button', { name: 'Editar Reunión del perdón' })
    expect(
      screen.queryByRole('button', { name: 'Editar Oración final' }),
    ).not.toBeInTheDocument()
    const listsBefore = documentRequests(fetchMock).length

    await userEvent.click(
      screen.getByRole('button', { name: 'Editar Reunión del perdón' }),
    )
    const dialog = await screen.findByRole('dialog')
    const title = within(dialog).getByLabelText('Título')
    await userEvent.clear(title)
    await userEvent.type(title, 'Nuevo')
    await userEvent.selectOptions(
      within(dialog).getByLabelText('Curso escolar'),
      '2024-2025',
    )
    await userEvent.selectOptions(
      await within(dialog).findByRole('combobox', { name: 'Grupo' }),
      groupB.name,
    )
    const tags = within(dialog).getByLabelText(/Etiquetas/)
    await userEvent.clear(tags)
    await userEvent.type(tags, 'amistad, oración')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Guardar' }),
    )

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    const [, init] = fetchMock.mock.calls.find(
      ([, i]) => i?.method === 'PATCH',
    )!
    expect(JSON.parse(init!.body as string)).toEqual({
      title: 'Nuevo',
      school_year: '2024-2025',
      group_id: groupB.id,
      tags: ['amistad', 'oración'],
    })
    // La biblioteca se vuelve a pedir
    await waitFor(() =>
      expect(documentRequests(fetchMock).length).toBeGreaterThan(listsBefore),
    )
  })

  it('elimina un documento tras confirmar', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false)
    const mine = { ...reunion, can_edit: true }
    const fetchMock = mockApi(
      meHandler(admin),
      documentsHandler([mine]),
      (url, init) =>
        url.pathname === `/api/v1/documents/${mine.id}` &&
        init.method === 'DELETE'
          ? { status: 204 }
          : undefined,
    )
    renderRoute('/biblioteca/2025-2026/Confirmaci%C3%B3n%20A', { token: 't' })
    const button = await screen.findByRole('button', {
      name: 'Eliminar Reunión del perdón',
    })

    await userEvent.click(button)
    expect(confirm).toHaveBeenCalledWith(
      '¿Eliminar «Reunión del perdón» de la biblioteca? No se puede deshacer.',
    )
    expect(requests(fetchMock, 'DELETE')).toHaveLength(0)

    confirm.mockReturnValueOnce(true)
    await userEvent.click(button)
    await waitFor(() => expect(requests(fetchMock, 'DELETE')).toHaveLength(1))
  })
})
