import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Attendance } from '@/api/attendance'
import type { CalendarEvent } from '@/api/events'
import {
  admin,
  coordinator,
  getHandler,
  groupA,
  meHandler,
  mockApi,
  monitor,
  renderRoute,
  requests,
} from '@/test/render'

const event: CalendarEvent = {
  id: 5,
  title: 'Reunión semanal',
  description: null,
  type: 'reunion',
  starts_at: '2026-11-07 17:00',
  ends_at: '2026-11-07 18:00',
  location: null,
  groups: [],
}

const pending: Attendance = {
  event_id: event.id,
  group_id: groupA.id,
  children: [
    { child_id: 1, full_name: 'Lucía García', present: null },
    { child_id: 2, full_name: 'Marcos Ruiz', present: null },
  ],
  marked_by: null,
  marked_at: null,
}

const PATH = `/groups/${groupA.id}/events/${event.id}/attendance`
const ROUTE = `/grupos/${groupA.id}/eventos/${event.id}/lista`

const handlers = (attendance: Attendance) => [
  getHandler(`/groups/${groupA.id}`, groupA),
  getHandler(`/events/${event.id}`, event),
  getHandler(PATH, attendance),
]

describe('Pase de lista', () => {
  afterEach(() => vi.restoreAllMocks())

  it('el monitor marca a los niños y guarda la lista', async () => {
    const saved: Attendance = {
      ...pending,
      children: [
        { child_id: 1, full_name: 'Lucía García', present: true },
        { child_id: 2, full_name: 'Marcos Ruiz', present: false },
      ],
      marked_by: monitor.full_name,
      marked_at: '2026-11-07 17:05',
    }
    const fetchMock = mockApi(
      meHandler(monitor),
      ...handlers(pending),
      (url, init) =>
        url.pathname === `/api/v1${PATH}` && init.method === 'PUT'
          ? { body: saved }
          : undefined,
    )
    renderRoute(ROUTE, { token: 't' })

    expect(
      await screen.findByText('Aún no se ha pasado lista'),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('Lucía García'))
    expect(screen.getByText('1 de 2 presentes')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(requests(fetchMock, 'PUT')).toEqual([
        { path: `/api/v1${PATH}`, body: { present_child_ids: [1] } },
      ]),
    )
    expect(
      await screen.findByText('Guardado por Luis Pérez el 07/11/2026 17:05'),
    ).toBeInTheDocument()
  })

  it('"Marcar todos" marca a todos los niños', async () => {
    mockApi(meHandler(monitor), ...handlers(pending))
    renderRoute(ROUTE, { token: 't' })

    await userEvent.click(
      await screen.findByRole('button', { name: 'Marcar todos' }),
    )

    const list = screen.getByRole('list', { name: 'Niños' })
    for (const box of within(list).getAllByRole('checkbox')) {
      expect(box).toBeChecked()
    }
    expect(
      screen.getByRole('button', { name: 'Desmarcar todos' }),
    ).toBeInTheDocument()
  })

  it.each([
    ['el admin', admin],
    ['el coordinador', coordinator],
  ])('%s solo ve la lista, sin poder guardarla', async (_, user) => {
    mockApi(meHandler(user), ...handlers(pending))
    renderRoute(ROUTE, { token: 't' })

    expect(
      await screen.findByRole('checkbox', { name: /Lucía García/ }),
    ).toBeDisabled()
    expect(screen.getAllByText('sin pasar')).toHaveLength(2)
    expect(
      screen.queryByRole('button', { name: 'Guardar' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('Solo los monitores del grupo pueden pasar lista.'),
    ).toBeInTheDocument()
  })

  it('la ficha del grupo muestra si cada evento tiene la lista pasada', async () => {
    mockApi(
      meHandler(monitor),
      getHandler(`/groups/${groupA.id}`, groupA),
      getHandler(`/groups/${groupA.id}/children`, []),
      getHandler('/events', [event]),
      getHandler(PATH, pending),
    )
    renderRoute(`/grupos/${groupA.id}`, { token: 't' })

    const list = await screen.findByRole('list', { name: 'Eventos' })
    expect(await within(list).findByText('Pendiente')).toBeInTheDocument()
    expect(within(list).getByRole('link')).toHaveAttribute('href', ROUTE)
  })
})
