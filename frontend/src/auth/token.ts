const KEY = 'apptagaste.token'

export const getToken = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export const setToken = (token: string) => localStorage.setItem(KEY, token)

export const clearToken = () => localStorage.removeItem(KEY)

type Listener = () => void
const listeners = new Set<Listener>()

/** Avisa cuando la API responde 401 (token caducado o no válido). */
export function onUnauthorized(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const notifyUnauthorized = () =>
  listeners.forEach((listener) => listener())
