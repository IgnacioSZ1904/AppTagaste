import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { coordinator, meHandler, mockApi, renderRoute } from '@/test/render'

const healthHandler = (status: number, body: unknown) => (url: URL) =>
  url.pathname === '/api/v1/health' ? { status, body } : undefined

describe('StatusPage', () => {
  it('muestra el estado de la API cuando responde ok', async () => {
    mockApi(
      meHandler(coordinator),
      healthHandler(200, { status: 'ok', db: 'ok' }),
    )
    renderRoute('/estado', { token: 't' })
    expect(await screen.findByText('API: ok')).toBeInTheDocument()
  })

  it('muestra el detalle del error cuando la API falla', async () => {
    mockApi(
      meHandler(coordinator),
      healthHandler(503, { detail: 'Base de datos no disponible' }),
    )
    renderRoute('/estado', { token: 't' })
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Base de datos no disponible',
    )
  })

  it('muestra un error claro si no hay conexión', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new TypeError('Failed to fetch'),
    )
    renderRoute('/estado', { token: 't' })
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se puede conectar con la API',
    )
  })
})
