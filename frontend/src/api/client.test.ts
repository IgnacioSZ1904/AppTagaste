import { afterEach, describe, expect, it, vi } from 'vitest'

import { apiFetch } from './client'

const respond = (status: number, body: unknown) =>
  vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(Response.json(body, { status }))

describe('apiFetch', () => {
  afterEach(() => vi.restoreAllMocks())

  it('usa el mensaje de la API', async () => {
    respond(409, { detail: 'Ya existe un grupo con ese nombre' })

    await expect(apiFetch('/groups')).rejects.toMatchObject({
      status: 409,
      message: 'Ya existe un grupo con ese nombre',
    })
  })

  it('en un error interno añade la referencia para buscarlo en el log', async () => {
    respond(500, { detail: 'Error interno del servidor', request_id: 'ab12cd' })

    await expect(apiFetch('/groups')).rejects.toThrow(
      'Error interno del servidor (ref. ab12cd)',
    )
  })

  it('sin mensaje, el código de estado', async () => {
    respond(502, null)

    await expect(apiFetch('/groups')).rejects.toThrow('Error 502')
  })
})
