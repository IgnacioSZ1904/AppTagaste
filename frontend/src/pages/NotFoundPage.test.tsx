import { screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import { coordinator, meHandler, mockApi, renderRoute } from '@/test/render'

it('muestra la página 404 en una ruta desconocida', async () => {
  mockApi(meHandler(coordinator))
  renderRoute('/no-existe', { token: 't' })
  expect(
    await screen.findByRole('heading', { name: 'Página no encontrada' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'Volver al inicio' }),
  ).toHaveAttribute('href', '/')
})
