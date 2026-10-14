import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { CalendarEvent } from '@/api/events'
import { toApiDate } from '@/lib/dates'
import {
  coordinator,
  eventsHandler,
  meHandler,
  mockApi,
  monitor,
  renderRoute,
} from '@/test/render'

// Un evento el día 15 del mes actual, para que salga en la vista inicial
const day = toApiDate(
  new Date(new Date().getFullYear(), new Date().getMonth(), 15),
).slice(0, 10)
const reunion: CalendarEvent = {
  id: 7,
  title: 'Reunión de monitores',
  description: 'Preparar la convivencia',
  type: 'reunion',
  starts_at: `${day} 17:00`,
  ends_at: `${day} 18:30`,
  location: 'Sala 2',
}

const eventsRequests = (fetchMock: ReturnType<typeof mockApi>) =>
  fetchMock.mock.calls
    .map(([url, init]) => ({
      url: new URL(String(url), 'http://localhost'),
      init,
    }))
    .filter(({ url }) => url.pathname.startsWith('/api/v1/events'))

describe('CalendarPage', () => {
  it('pide los eventos del rango visible y los pinta', async () => {
    const fetchMock = mockApi(meHandler(monitor), eventsHandler([reunion]))
    renderRoute('/', { token: 't' })

    expect(await screen.findByText('Reunión de monitores')).toBeInTheDocument()
    const { url } = eventsRequests(fetchMock)[0]
    expect(url.searchParams.get('from')).toMatch(/^\d{4}-\d{2}-\d{2} 00:00$/)
    expect(url.searchParams.get('to')).toMatch(/^\d{4}-\d{2}-\d{2} 00:00$/)
  })

  it('filtra por tipo', async () => {
    const fetchMock = mockApi(meHandler(monitor), eventsHandler([]))
    renderRoute('/', { token: 't' })
    await userEvent.click(
      await screen.findByRole('button', { name: 'Eucaristía' }),
    )

    await waitFor(() =>
      expect(
        eventsRequests(fetchMock).at(-1)?.url.searchParams.get('type'),
      ).toBe('eucaristia'),
    )
    expect(screen.getByRole('button', { name: 'Eucaristía' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('el monitor ve el detalle pero no puede editar', async () => {
    mockApi(meHandler(monitor), eventsHandler([reunion]))
    renderRoute('/', { token: 't' })
    await screen.findByText('Luis Pérez')

    expect(
      screen.queryByRole('button', { name: '+ Nuevo evento' }),
    ).not.toBeInTheDocument()
    await userEvent.click(await screen.findByText('Reunión de monitores'))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Sala 2')).toBeVisible()
    expect(
      within(dialog).queryByRole('button', { name: 'Editar' }),
    ).not.toBeInTheDocument()
  })

  it('el coordinador crea un evento', async () => {
    const fetchMock = mockApi(
      meHandler(coordinator),
      eventsHandler([]),
      (url, init) =>
        url.pathname === '/api/v1/events' && init.method === 'POST'
          ? { status: 201, body: { ...reunion, id: 8 } }
          : undefined,
    )
    renderRoute('/', { token: 't' })
    await userEvent.click(
      await screen.findByRole('button', { name: '+ Nuevo evento' }),
    )
    const dialog = await screen.findByRole('dialog')
    await userEvent.type(
      within(dialog).getByLabelText('Título'),
      'Convivencia de otoño',
    )
    await userEvent.selectOptions(
      within(dialog).getByLabelText('Tipo'),
      'convivencia',
    )
    await userEvent.type(within(dialog).getByLabelText('Lugar'), 'Albergue')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Guardar' }),
    )

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    const post = eventsRequests(fetchMock).find(
      ({ init }) => init?.method === 'POST',
    )!
    expect(JSON.parse(String(post.init?.body))).toMatchObject({
      title: 'Convivencia de otoño',
      type: 'convivencia',
      location: 'Albergue',
      starts_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2} 17:00$/),
      ends_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2} 18:30$/),
    })
  })

  it('el coordinador edita y borra un evento', async () => {
    const fetchMock = mockApi(
      meHandler(coordinator),
      eventsHandler([reunion]),
      (url, init) =>
        url.pathname === '/api/v1/events/7' && init.method === 'PATCH'
          ? { body: { ...reunion, title: 'Reunión movida' } }
          : undefined,
      (url, init) =>
        url.pathname === '/api/v1/events/7' && init.method === 'DELETE'
          ? { status: 204 }
          : undefined,
    )
    window.confirm = () => true
    renderRoute('/', { token: 't' })

    await userEvent.click(await screen.findByText('Reunión de monitores'))
    await userEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Editar',
      }),
    )
    const title = within(screen.getByRole('dialog')).getByLabelText('Título')
    await userEvent.clear(title)
    await userEvent.type(title, 'Reunión movida')
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Guardar',
      }),
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )

    await userEvent.click(await screen.findByText('Reunión de monitores'))
    await userEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Borrar',
      }),
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )

    const methods = eventsRequests(fetchMock).map(
      ({ init }) => init?.method ?? 'GET',
    )
    expect(methods).toEqual(expect.arrayContaining(['PATCH', 'DELETE']))
  })

  it('la vista Próximos lista los siguientes eventos sin partirlos por días', async () => {
    const multiDay: CalendarEvent = {
      ...reunion,
      id: 9,
      title: 'Convivencia de otoño',
      type: 'convivencia',
      starts_at: '2099-11-14 10:00',
      ends_at: '2099-11-15 18:00',
    }
    const many = Array.from({ length: 20 }, (_, i) => ({
      ...reunion,
      id: 100 + i,
      title: `Catequesis ${i + 1}`,
      starts_at: '2099-12-01 17:00',
      ends_at: '2099-12-01 18:00',
    }))
    const fetchMock = mockApi(
      meHandler(monitor),
      eventsHandler([multiDay, ...many]),
    )
    renderRoute('/', { token: 't' })
    await userEvent.click(
      await screen.findByRole('button', { name: 'Próximos' }),
    )

    const list = await screen.findByRole('list', { name: 'Próximos eventos' })
    expect(within(list).getAllByText('Convivencia de otoño')).toHaveLength(1)
    expect(within(list).getByText(/^14\/11 10:00 – 15\/11 18:00/)).toBeVisible()
    expect(within(list).getAllByRole('button')).toHaveLength(15)

    const { url } = eventsRequests(fetchMock).at(-1)!
    expect(url.searchParams.get('from')).toMatch(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
    )
    expect(url.searchParams.has('to')).toBe(false)
  })
})
