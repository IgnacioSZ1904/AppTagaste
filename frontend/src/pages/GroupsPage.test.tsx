import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  admin,
  coordinator,
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

const children = [
  { id: 1, group_id: groupA.id, full_name: 'Lucía García' },
  { id: 2, group_id: groupA.id, full_name: 'Marcos Ruiz' },
]

describe('Grupos', () => {
  beforeEach(() => vi.spyOn(window, 'confirm').mockReturnValue(true))
  afterEach(() => vi.restoreAllMocks())

  it('el admin ve todos los grupos y crea uno', async () => {
    const fetchMock = mockApi(
      meHandler(admin),
      getHandler('/groups', [groupA, groupB]),
      (url, init) =>
        url.pathname === '/api/v1/groups' && init.method === 'POST'
          ? { status: 201, body: { ...groupB, id: 12, name: 'Nuevo' } }
          : undefined,
    )
    renderRoute('/grupos', { token: 't' })

    expect(
      await screen.findByRole('link', { name: 'Grupos' }),
    ).toBeInTheDocument()
    const list = await screen.findByRole('list', { name: 'Grupos' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
    expect(
      screen.getByText('Monitores: Luis Pérez · Coordinadores: Ana López'),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '+ Nuevo grupo' }))
    await userEvent.type(screen.getByLabelText('Nombre'), ' Nuevo ')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(requests(fetchMock, 'POST')).toEqual([
        { path: '/api/v1/groups', body: { name: 'Nuevo' } },
      ]),
    )
  })

  it('muestra el error si el nombre ya existe', async () => {
    mockApi(meHandler(admin), getHandler('/groups', []), (_url, init) =>
      init.method === 'POST'
        ? { status: 409, body: { detail: 'Ya existe un grupo con ese nombre' } }
        : undefined,
    )
    renderRoute('/grupos', { token: 't' })

    expect(await screen.findByText(/Aún no hay grupos/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '+ Nuevo grupo' }))
    await userEvent.type(screen.getByLabelText('Nombre'), 'A')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya existe un grupo con ese nombre',
    )
  })

  it('el monitor ve "Mis grupos" con solo los suyos', async () => {
    const fetchMock = mockApi(
      meHandler(monitor),
      getHandler('/me/groups', [groupA]),
    )
    renderRoute('/grupos', { token: 't' })

    expect(
      await screen.findByRole('heading', { name: 'Mis grupos' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mis grupos' })).toBeInTheDocument()
    expect(await screen.findByText('Confirmación A')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '+ Nuevo grupo' }),
    ).not.toBeInTheDocument()
    const paths = fetchMock.mock.calls.map(
      ([url]) => new URL(String(url), 'http://localhost').pathname,
    )
    expect(paths).not.toContain('/api/v1/groups')
  })

  it('avisa al coordinador que aún no tiene grupos', async () => {
    mockApi(meHandler(coordinator), getHandler('/me/groups', []))
    renderRoute('/grupos', { token: 't' })

    expect(
      await screen.findByText(/Aún no tienes grupos asignados/),
    ).toBeInTheDocument()
  })

  it('el rol usuario no ve el apartado', async () => {
    mockApi(meHandler(usuario), getHandler('/groups', []))
    renderRoute('/grupos', { token: 't' })

    expect(await screen.findByText('No tienes permiso')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /grupos/i }),
    ).not.toBeInTheDocument()
  })

  it('el responsable añade niños pegando una lista', async () => {
    const fetchMock = mockApi(
      meHandler(monitor),
      getHandler(`/groups/${groupA.id}`, groupA),
      getHandler(`/groups/${groupA.id}/children`, children),
      (_url, init) =>
        init.method === 'POST'
          ? {
              status: 201,
              body: { id: 3, group_id: groupA.id, full_name: 'x' },
            }
          : undefined,
    )
    renderRoute(`/grupos/${groupA.id}`, { token: 't' })

    expect(await screen.findByText('Lucía García')).toBeInTheDocument()
    await userEvent.type(
      screen.getByLabelText('Añadir niños (uno por línea)'),
      'Ana Gil{Enter}{Enter}  Luis  Mora {Enter}ana gil',
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Añadir 2 niños' }),
    )

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Añadidos 2 niños.',
    )
    expect(requests(fetchMock, 'POST').map((r) => r.body)).toEqual([
      { full_name: 'Ana Gil' },
      { full_name: 'Luis Mora' },
    ])
  })

  it('el responsable renombra y borra un niño', async () => {
    const fetchMock = mockApi(
      meHandler(monitor),
      getHandler(`/groups/${groupA.id}`, groupA),
      getHandler(`/groups/${groupA.id}/children`, children),
      (_url, init) =>
        init.method === 'PATCH'
          ? { body: { ...children[0], full_name: 'Lucía García Pérez' } }
          : init.method === 'DELETE'
            ? { status: 204 }
            : undefined,
    )
    renderRoute(`/grupos/${groupA.id}`, { token: 't' })

    await userEvent.click(
      await screen.findByRole('button', { name: 'Editar a Lucía García' }),
    )
    await userEvent.type(
      screen.getByLabelText('Nombre de Lucía García'),
      ' Pérez',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    await userEvent.click(
      screen.getByRole('button', { name: 'Borrar a Marcos Ruiz' }),
    )

    await waitFor(() => expect(requests(fetchMock, 'DELETE')).toHaveLength(1))
    expect(requests(fetchMock, 'PATCH')).toEqual([
      {
        path: `/api/v1/groups/${groupA.id}/children/1`,
        body: { full_name: 'Lucía García Pérez' },
      },
    ])
    expect(requests(fetchMock, 'DELETE')[0].path).toBe(
      `/api/v1/groups/${groupA.id}/children/2`,
    )
  })

  it('un monitor que no es responsable no ve los niños', async () => {
    const fetchMock = mockApi(
      meHandler({ ...monitor, id: 99 }),
      getHandler(`/groups/${groupA.id}`, groupA),
    )
    renderRoute(`/grupos/${groupA.id}`, { token: 't' })

    expect(
      await screen.findByText(/Solo el administrador y los responsables/),
    ).toBeInTheDocument()
    const paths = fetchMock.mock.calls.map(([url]) => String(url))
    expect(paths.some((p) => p.includes('/children'))).toBe(false)
  })

  it('el admin gestiona responsables y borra el grupo', async () => {
    const extra = { ...monitor, id: 20, full_name: 'Sara Díaz' }
    const fetchMock = mockApi(
      meHandler(admin),
      getHandler(`/groups/${groupA.id}`, groupA),
      getHandler(`/groups/${groupA.id}/children`, children),
      getHandler('/users', [admin, coordinator, monitor, extra, usuario]),
      getHandler('/groups', []),
      (_url, init) =>
        init.method === 'POST'
          ? { status: 201, body: groupA }
          : init.method === 'DELETE'
            ? { status: 204 }
            : undefined,
    )
    const { router } = renderRoute(`/grupos/${groupA.id}`, { token: 't' })

    // Solo se ofrecen monitores y coordinadores que aún no son responsables
    const select = await screen.findByLabelText('Responsable a añadir')
    await waitFor(() =>
      expect(within(select).getAllByRole('option')).toHaveLength(2),
    )
    await userEvent.selectOptions(select, String(extra.id))
    await userEvent.click(
      screen.getByRole('button', { name: 'Añadir responsable' }),
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Quitar a Luis Pérez' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Borrar grupo' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/grupos'))
    expect(requests(fetchMock, 'POST')).toEqual([
      {
        path: `/api/v1/groups/${groupA.id}/members`,
        body: { user_id: extra.id },
      },
    ])
    expect(requests(fetchMock, 'DELETE').map((r) => r.path)).toEqual([
      `/api/v1/groups/${groupA.id}/members/${monitor.id}`,
      `/api/v1/groups/${groupA.id}`,
    ])
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('2 niños'),
    )
  })
})
