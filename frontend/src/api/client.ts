import { getToken, notifyUnauthorized } from '@/auth/token'

export const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** `json` para enviar JSON; `form` para enviar ficheros (multipart). */
type ApiInit = Omit<RequestInit, 'body'> & { json?: unknown; form?: FormData }

/** Hace la petición con el token de sesión; avisa si la sesión ha caducado. */
async function request(
  path: string,
  { json, form, headers, ...init }: ApiInit,
): Promise<Response> {
  const token = getToken()
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        // Con FormData el navegador pone el Content-Type con su separador
        ...(form ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: form ?? (json === undefined ? undefined : JSON.stringify(json)),
    })
  } catch {
    throw new ApiError(0, 'No se puede conectar con la API')
  }

  if (response.status === 401 && token) notifyUnauthorized()
  return response
}

/**
 * Llama a la API y devuelve el JSON (o undefined si no hay cuerpo).
 * Añade el token de sesión y lanza ApiError si la respuesta no es 2xx.
 */
export async function apiFetch<T>(
  path: string,
  init: ApiInit = {},
): Promise<T> {
  const response = await request(path, init)
  const body: unknown =
    response.status === 204
      ? undefined
      : await response.json().catch(() => null)
  if (!response.ok)
    throw new ApiError(response.status, errorMessage(body, response.status))
  return body as T
}

/** Descarga un fichero de la API (con el token) como Blob. */
export async function apiFile(path: string): Promise<Blob> {
  const response = await request(path, {})
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null)
    throw new ApiError(response.status, errorMessage(body, response.status))
  }
  return response.blob()
}

function errorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object' && 'detail' in body) {
    const { detail } = body
    if (typeof detail === 'string') {
      // Los 500 traen una referencia para buscar el error en el log del servidor
      return 'request_id' in body && typeof body.request_id === 'string'
        ? `${detail} (ref. ${body.request_id})`
        : detail
    }
  }
  return `Error ${status}`
}
