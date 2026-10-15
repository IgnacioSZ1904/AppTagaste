import { getToken, notifyUnauthorized } from '@/auth/token'

const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type ApiInit = Omit<RequestInit, 'body'> & { json?: unknown }

/**
 * Llama a la API y devuelve el JSON (o undefined si no hay cuerpo).
 * Añade el token de sesión y lanza ApiError si la respuesta no es 2xx.
 */
export async function apiFetch<T>(
  path: string,
  { json, headers, ...init }: ApiInit = {},
): Promise<T> {
  const token = getToken()
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: json === undefined ? undefined : JSON.stringify(json),
    })
  } catch {
    throw new ApiError(0, 'No se puede conectar con la API')
  }

  if (response.status === 401 && token) notifyUnauthorized()

  const body: unknown =
    response.status === 204
      ? undefined
      : await response.json().catch(() => null)
  if (!response.ok)
    throw new ApiError(response.status, errorMessage(body, response.status))
  return body as T
}

function errorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object' && 'detail' in body) {
    const { detail } = body
    if (typeof detail === 'string') return detail
    // Errores de validación de FastAPI: [{ msg: "..." }, ...]
    if (Array.isArray(detail) && typeof detail[0]?.msg === 'string') {
      return detail[0].msg.replace(/^Value error, /, '')
    }
  }
  return `Error ${status}`
}
