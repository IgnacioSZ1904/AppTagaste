import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'

import { EventForm } from './EventForm'

it('no envía si la fecha de fin no es posterior a la de inicio', async () => {
  const onSubmit = vi.fn()
  render(
    <EventForm
      defaults={{ startsAt: '2026-11-13T18:00', endsAt: '2026-11-13T17:00' }}
      submitting={false}
      error={null}
      onSubmit={onSubmit}
      onCancel={() => {}}
    />,
  )
  await userEvent.type(screen.getByLabelText('Título'), 'Reunión')
  await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

  expect(screen.getByRole('alert')).toHaveTextContent(
    'La fecha de fin debe ser posterior',
  )
  expect(onSubmit).not.toHaveBeenCalled()
})
