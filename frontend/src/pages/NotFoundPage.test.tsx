import { screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import { renderRoute } from '@/test/render'

it('muestra la página 404 en una ruta desconocida', () => {
  renderRoute('/no-existe')
  expect(
    screen.getByRole('heading', { name: 'Página no encontrada' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'Volver al inicio' }),
  ).toHaveAttribute('href', '/')
})
