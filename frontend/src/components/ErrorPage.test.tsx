import { screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import {
  eventsHandler,
  meHandler,
  mockApi,
  monitor,
  renderRoute,
} from '@/test/render'

// Una pantalla que falla al pintarse
vi.mock('@/pages/CalendarPage', () => ({
  CalendarPage: () => {
    throw new Error('Fallo al pintar el calendario')
  },
}))

afterEach(() => vi.restoreAllMocks())

it('si una pantalla falla se ve la página de error, no la traza', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  mockApi(meHandler(monitor), eventsHandler([]))
  renderRoute('/', { token: 't' })

  expect(
    await screen.findByRole('heading', { name: 'Algo ha fallado' }),
  ).toBeInTheDocument()
  expect(screen.getByText('Fallo al pintar el calendario')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Recargar' })).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'Volver al inicio' }),
  ).toHaveAttribute('href', '/')
})
