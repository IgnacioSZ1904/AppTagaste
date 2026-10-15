import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { User } from '@/api/auth'
import {
  admin,
  coordinator,
  eventsHandler,
  meHandler,
  mockApi,
  monitor,
  renderRoute,
  usuario,
} from '@/test/render'

const jose: User = {
  ...monitor,
  id: 5,
  email: 'jose@ejemplo.com',
  full_name: 'José Martín',
}
const people = [admin, coordinator, monitor, jose]

const usersHandler = (url: URL, init: RequestInit) =>
  url.pathname === '/api/v1/users' && (init.method ?? 'GET') === 'GET'
    ? { body: people }
    : undefined

const calls = (fetchMock: ReturnType<typeof mockApi>, method: string) =>
  fetchMock.mock.calls.filter(([, init]) => init?.method === method)

const rowOf = async (name: string) =>
  (
    await within(
      await screen.findByRole('list', { name: 'Usuarios' }),
    ).findByText(
      (_, el) =>
        el?.tagName === 'P' && el.textContent?.startsWith(name) === true,
    )
  ).closest('li') as HTMLElement

describe('UsersPage', () => {
  beforeEach(() => vi.spyOn(window, 'confirm').mockReturnValue(true))
  afterEach(() => vi.restoreAllMocks())

  it('solo el admin ve el enlace "Usuarios"', async () => {
    mockApi(meHandler(admin), eventsHandler([]))
    renderRoute('/', { token: 't' })
    expect(
      await screen.findByRole('link', { name: 'Usuarios' }),
    ).toBeInTheDocument()
  })

  it.each([coordinator, monitor, usuario])(
    '$role no ve el enlace y /usuarios le muestra "No tienes permiso"',
    async (user) => {
      mockApi(meHandler(user), eventsHandler([]))
      renderRoute('/usuarios', { token: 't' })
      expect(await screen.findByText('No tienes permiso')).toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: 'Usuarios' }),
      ).not.toBeInTheDocument()
    },
  )

  it('busca sin tildes y filtra por rol', async () => {
    mockApi(meHandler(admin), usersHandler)
    renderRoute('/usuarios', { token: 't' })
    await screen.findByText('José Martín')

    await userEvent.type(
      screen.getByLabelText('Buscar por nombre o email'),
      'jose',
    )
    const list = screen.getByRole('list', { name: 'Usuarios' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(1)

    await userEvent.clear(screen.getByLabelText('Buscar por nombre o email'))
    await userEvent.click(screen.getByRole('button', { name: 'Monitor' }))
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('2 de 4 usuarios')).toBeInTheDocument()
  })

  it('cambia el rol con PATCH', async () => {
    const fetchMock = mockApi(meHandler(admin), usersHandler, (_url, init) =>
      init.method === 'PATCH'
        ? { body: { ...monitor, role: 'coordinador' } }
        : undefined,
    )
    renderRoute('/usuarios', { token: 't' })
    await userEvent.selectOptions(
      within(await rowOf('Luis Pérez')).getByLabelText('Rol de Luis Pérez'),
      'coordinador',
    )
    await waitFor(() => expect(calls(fetchMock, 'PATCH')).toHaveLength(1))
    const [url, init] = calls(fetchMock, 'PATCH')[0]
    expect(String(url)).toContain('/users/2')
    expect(JSON.parse(String(init?.body))).toEqual({ role: 'coordinador' })
    expect(window.confirm).not.toHaveBeenCalled()
  })

  it('pide confirmación al desactivar y no hace nada si se cancela', async () => {
    vi.mocked(window.confirm).mockReturnValue(false)
    const fetchMock = mockApi(meHandler(admin), usersHandler)
    renderRoute('/usuarios', { token: 't' })
    await userEvent.click(
      within(await rowOf('Luis Pérez')).getByRole('button', {
        name: 'Desactivar',
      }),
    )
    expect(window.confirm).toHaveBeenCalled()
    expect(calls(fetchMock, 'PATCH')).toHaveLength(0)
  })

  it('la fila propia está bloqueada', async () => {
    mockApi(meHandler(admin), usersHandler)
    renderRoute('/usuarios', { token: 't' })
    const row = await rowOf('Marta Ruiz')
    expect(within(row).getByText('(tú)')).toBeInTheDocument()
    expect(within(row).getByLabelText('Rol de Marta Ruiz')).toBeDisabled()
    expect(
      within(row).getByRole('button', { name: 'Desactivar' }),
    ).toBeDisabled()
  })

  it('añade un usuario y muestra el error si el email ya existe', async () => {
    let status = 201
    const fetchMock = mockApi(meHandler(admin), usersHandler, (_url, init) =>
      init.method === 'POST'
        ? status === 409
          ? { status, body: { detail: 'Ya existe un usuario con ese email' } }
          : { status, body: jose }
        : undefined,
    )
    renderRoute('/usuarios', { token: 't' })
    const open = async () => {
      await userEvent.click(
        await screen.findByRole('button', { name: '+ Añadir usuario' }),
      )
      await userEvent.type(screen.getByLabelText('Email'), 'jose@ejemplo.com')
      await userEvent.type(screen.getByLabelText('Nombre'), 'José Martín')
      await userEvent.click(screen.getByRole('button', { name: 'Añadir' }))
    }

    await open()
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(JSON.parse(String(calls(fetchMock, 'POST')[0][1]?.body))).toEqual({
      email: 'jose@ejemplo.com',
      full_name: 'José Martín',
      role: 'monitor',
    })

    status = 409
    await open()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya existe un usuario',
    )
  })
})
