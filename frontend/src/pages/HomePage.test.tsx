import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderRoute } from '@/test/render'

const mockFetch = (status: number, body: unknown) =>
  vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(Response.json(body, { status }))

describe('HomePage', () => {
  it('muestra el estado de la API cuando responde ok', async () => {
    mockFetch(200, { status: 'ok', db: 'ok' })
    renderRoute('/')
    expect(await screen.findByText('API: ok')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/v1/health', expect.anything())
  })

  it('muestra el detalle del error cuando la API falla', async () => {
    mockFetch(503, { detail: 'Base de datos no disponible' })
    renderRoute('/')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Base de datos no disponible',
    )
  })

  it('muestra un error claro si no hay conexión', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new TypeError('Failed to fetch'),
    )
    renderRoute('/')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se puede conectar con la API',
    )
  })
})
