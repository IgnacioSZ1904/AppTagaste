import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  eventsHandler,
  meHandler,
  mockApi,
  monitor,
  renderRoute,
} from '@/test/render'

describe('Páginas legales', () => {
  afterEach(() => vi.restoreAllMocks())

  it('la política de privacidad se ve sin iniciar sesión', async () => {
    mockApi()
    const { router } = renderRoute('/privacidad')

    expect(
      await screen.findByRole('heading', { name: 'Política de Privacidad' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/privacidad')
    expect(screen.getByText(/Uso limitado/)).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'segovia.ignacio1904@gmail.com' })[0],
    ).toHaveAttribute('href', 'mailto:segovia.ignacio1904@gmail.com')
  })

  it('las condiciones se ven sin iniciar sesión y enlazan la privacidad', async () => {
    mockApi()
    const { router } = renderRoute('/condiciones')

    expect(
      await screen.findByRole('heading', { name: 'Condiciones del Servicio' }),
    ).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('link', { name: 'Política de Privacidad' }),
    )
    expect(router.state.location.pathname).toBe('/privacidad')
  })

  it('el login describe la app y enlaza las dos páginas', async () => {
    mockApi()
    renderRoute('/login')

    expect(
      await screen.findByText(/Organiza la catequesis del colegio/),
    ).toBeInTheDocument()
    const legal = screen.getByRole('navigation', { name: 'Información legal' })
    expect(
      within(legal).getByRole('link', { name: 'Privacidad' }),
    ).toHaveAttribute('href', '/privacidad')
    expect(
      within(legal).getByRole('link', { name: 'Condiciones' }),
    ).toHaveAttribute('href', '/condiciones')
  })

  it('con sesión, la app enlaza las páginas legales', async () => {
    mockApi(meHandler(monitor), eventsHandler([]))
    renderRoute('/estado', { token: 't' })

    const legal = await screen.findByRole('navigation', {
      name: 'Información legal',
    })
    expect(
      within(legal).getByRole('link', { name: 'Privacidad' }),
    ).toBeInTheDocument()
  })
})
