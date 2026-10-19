import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { vi } from 'vitest'

import type { User } from '@/api/auth'
import type { CalendarEvent } from '@/api/events'
import type { Group } from '@/api/groups'
import { AuthProvider } from '@/auth/AuthProvider'
import { setToken } from '@/auth/token'
import { routes } from '@/router'

export const coordinator: User = {
  id: 1,
  email: 'ana@ejemplo.com',
  full_name: 'Ana López',
  role: 'coordinador',
  is_active: true,
}

export const monitor: User = {
  ...coordinator,
  id: 2,
  full_name: 'Luis Pérez',
  role: 'monitor',
}

type Route = { status?: number; body?: unknown }
type Handler = (url: URL, init: RequestInit) => Route | undefined

/** Simula la API: cada handler devuelve una respuesta o undefined para pasar al siguiente. */
export function mockApi(...handlers: Handler[]) {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (input, init = {}) => {
      const url = new URL(String(input), 'http://localhost')
      for (const handler of handlers) {
        const route = handler(url, init)
        if (route) {
          const status = route.status ?? 200
          return status === 204
            ? new Response(null, { status })
            : Response.json(route.body, { status })
        }
      }
      return Response.json({ detail: 'No encontrado' }, { status: 404 })
    })
}

export const meHandler =
  (user: User): Handler =>
  (url) =>
    url.pathname === '/api/v1/auth/me' ? { body: user } : undefined

export const eventsHandler =
  (events: CalendarEvent[]): Handler =>
  (url, init) =>
    url.pathname === '/api/v1/events' && (init.method ?? 'GET') === 'GET'
      ? { body: events }
      : undefined

/** Renderiza la app completa en la ruta indicada, opcionalmente con sesión iniciada. */
export function renderRoute(path: string, { token }: { token?: string } = {}) {
  if (token) setToken(token)
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return {
    router,
    ...render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>,
    ),
  }
}

export const admin: User = {
  ...coordinator,
  id: 3,
  email: 'admin@ejemplo.com',
  full_name: 'Marta Ruiz',
  role: 'admin',
}

export const usuario: User = {
  ...coordinator,
  id: 4,
  email: 'pepe@ejemplo.com',
  full_name: 'Pepe Gómez',
  role: 'usuario',
}

/** Grupo de prueba con Luis (monitor) y Ana (coordinadora) como responsables. */
export const groupA: Group = {
  id: 10,
  name: 'Confirmación A',
  members: [
    { id: monitor.id, full_name: monitor.full_name, role: 'monitor' },
    {
      id: coordinator.id,
      full_name: coordinator.full_name,
      role: 'coordinador',
    },
  ],
  children_count: 2,
}

export const groupB: Group = {
  id: 11,
  name: 'Postcomunión B',
  members: [],
  children_count: 0,
}

/** GET de una ruta exacta con el cuerpo dado. */
export const getHandler =
  (path: string, body: unknown): Handler =>
  (url, init) =>
    url.pathname === `/api/v1${path}` && (init.method ?? 'GET') === 'GET'
      ? { body }
      : undefined

/** Peticiones hechas con un método (para comprobar escrituras). */
export const requests = (
  fetchMock: ReturnType<typeof mockApi>,
  method: string,
) =>
  fetchMock.mock.calls
    .filter(([, init]) => init?.method === method)
    .map(([url, init]) => ({
      path: new URL(String(url), 'http://localhost').pathname,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    }))
