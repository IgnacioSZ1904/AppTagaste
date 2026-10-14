import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { getToken } from '@/auth/token'
import {
  coordinator,
  eventsHandler,
  meHandler,
  mockApi,
  renderRoute,
} from '@/test/render'

const loginHandler = (status: number, body: unknown) => (url: URL) =>
  url.pathname === '/api/v1/auth/google' ? { status, body } : undefined

describe('Autenticación', () => {
  it('sin sesión, cualquier ruta lleva al login', async () => {
    renderRoute('/')
    expect(
      await screen.findByRole('button', { name: 'Iniciar sesión con Google' }),
    ).toBeVisible()
  })

  it('entra con Google, guarda el token y muestra el usuario', async () => {
    const fetchMock = mockApi(
      loginHandler(200, { access_token: 'jwt-api', token_type: 'bearer' }),
      meHandler(coordinator),
      eventsHandler([]),
    )
    renderRoute('/login')
    await userEvent.click(
      await screen.findByRole('button', { name: 'Iniciar sesión con Google' }),
    )

    expect(await screen.findByText('Ana López')).toBeVisible()
    expect(screen.getByText('Coordinador')).toBeVisible()
    expect(getToken()).toBe('jwt-api')
    const [, init] = fetchMock.mock.calls.find(([url]) =>
      String(url).endsWith('/auth/google'),
    )!
    expect(JSON.parse(String(init?.body))).toEqual({
      credential: 'google-id-token',
    })
  })

  it('muestra el error si la cuenta no está dada de alta', async () => {
    mockApi(
      loginHandler(403, {
        detail: 'Tu cuenta no está dada de alta. Pide acceso a un coordinador.',
      }),
    )
    renderRoute('/login')
    await userEvent.click(
      await screen.findByRole('button', { name: 'Iniciar sesión con Google' }),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Tu cuenta no está dada de alta',
    )
    expect(getToken()).toBeNull()
  })

  it('envía el token en las peticiones', async () => {
    const fetchMock = mockApi(meHandler(coordinator), eventsHandler([]))
    renderRoute('/', { token: 'jwt-api' })
    await screen.findByText('Ana López')
    const [, init] = fetchMock.mock.calls[0]
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer jwt-api' })
  })

  it('con el token caducado (401) vuelve al login y borra la sesión', async () => {
    mockApi((url) =>
      url.pathname === '/api/v1/auth/me'
        ? { status: 401, body: { detail: 'No autenticado' } }
        : undefined,
    )
    renderRoute('/', { token: 'caducado' })
    expect(
      await screen.findByRole('button', { name: 'Iniciar sesión con Google' }),
    ).toBeVisible()
    expect(getToken()).toBeNull()
  })

  it('"Salir" cierra la sesión', async () => {
    mockApi(meHandler(coordinator), eventsHandler([]))
    renderRoute('/', { token: 'jwt-api' })
    await userEvent.click(await screen.findByRole('button', { name: 'Salir' }))
    await waitFor(() => expect(getToken()).toBeNull())
    expect(
      await screen.findByRole('button', { name: 'Iniciar sesión con Google' }),
    ).toBeVisible()
  })
})
