import { screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { currentCourse, type GroupStats } from '@/api/stats'
import {
  admin,
  coordinator,
  getHandler,
  groupA,
  meHandler,
  mockApi,
  monitor,
  renderRoute,
} from '@/test/render'

const stats: GroupStats = {
  group_id: groupA.id,
  from: '2026-09-01',
  to: '2026-10-19',
  events: [
    {
      event_id: 5,
      title: 'Reunión semanal',
      starts_at: '2026-10-03 17:00',
      present: 1,
      absent: 1,
      taken: true,
    },
    {
      event_id: 6,
      title: 'Convivencia',
      starts_at: '2026-10-10 10:00',
      present: 0,
      absent: 0,
      taken: false,
    },
  ],
  children: [
    {
      child_id: 1,
      full_name: 'Lucía García',
      present: 1,
      absent: 0,
      rate: 100,
    },
    {
      child_id: 2,
      full_name: 'Marcos Ruiz',
      present: 0,
      absent: 0,
      rate: null,
    },
  ],
}

describe('Estadísticas', () => {
  afterEach(() => vi.restoreAllMocks())

  it('el curso empieza el 1 de septiembre', () => {
    expect(currentCourse(new Date(2026, 9, 19))).toEqual({
      from: '2026-09-01',
      to: '2026-10-19',
    })
    expect(currentCourse(new Date(2027, 2, 5)).from).toBe('2026-09-01')
  })

  it('el coordinador ve la asistencia de todos los grupos', async () => {
    const fetchMock = mockApi(
      meHandler(coordinator),
      getHandler('/stats/groups', [
        {
          group_id: groupA.id,
          name: groupA.name,
          children_count: 2,
          events_taken: 3,
          rate: 75,
        },
      ]),
    )
    renderRoute('/estadisticas', { token: 't' })

    const table = await screen.findByRole('table', {
      name: 'Asistencia por grupo',
    })
    expect(
      within(table).getByRole('link', { name: groupA.name }),
    ).toHaveAttribute('href', `/grupos/${groupA.id}`)
    expect(within(table).getByText('75 %')).toBeInTheDocument()
    const url = new URL(String(fetchMock.mock.calls.at(-1)?.[0]), 'http://x')
    expect(url.searchParams.get('from')).toMatch(/^\d{4}-09-01$/)
  })

  it('la ficha del grupo muestra la asistencia por evento y por niño', async () => {
    mockApi(
      meHandler(admin),
      getHandler(`/groups/${groupA.id}`, groupA),
      getHandler(`/groups/${groupA.id}/children`, []),
      getHandler('/events', []),
      getHandler(`/groups/${groupA.id}/stats`, stats),
    )
    renderRoute(`/grupos/${groupA.id}`, { token: 't' })

    const events = await screen.findByRole('table', {
      name: 'Asistencia por evento',
    })
    expect(within(events).getByText('1 / 2')).toBeInTheDocument()
    expect(within(events).getByText('sin pasar')).toBeInTheDocument()
    const children = screen.getByRole('table', { name: 'Asistencia por niño' })
    expect(within(children).getByText('100 %')).toBeInTheDocument()
    expect(within(children).getByText('—')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Descargar CSV' }),
    ).toBeInTheDocument()
  })

  it('un monitor no ve las estadísticas', async () => {
    const fetchMock = mockApi(
      meHandler(monitor),
      getHandler(`/groups/${groupA.id}`, groupA),
      getHandler(`/groups/${groupA.id}/children`, []),
      getHandler('/events', []),
    )
    renderRoute(`/grupos/${groupA.id}`, { token: 't' })

    expect(
      await screen.findByRole('heading', { name: groupA.name }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Estadísticas' }),
    ).not.toBeInTheDocument()
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([u]) => String(u).includes('/stats')),
      ).toBe(false),
    )
    expect(
      screen.queryByRole('link', { name: 'Estadísticas' }),
    ).not.toBeInTheDocument()
  })
})
