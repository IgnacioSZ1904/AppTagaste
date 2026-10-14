const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Llama a la API y devuelve el JSON. Lanza ApiError si la respuesta no es 2xx. */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new ApiError(0, 'No se puede conectar con la API')
  }

  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const detail =
      body &&
      typeof body === 'object' &&
      'detail' in body &&
      typeof body.detail === 'string'
        ? body.detail
        : `Error ${response.status}`
    throw new ApiError(response.status, detail)
  }
  return body as T
}
