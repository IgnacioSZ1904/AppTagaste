import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// El botón real de Google carga un script externo: en los tests es un botón simple
vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  GoogleLogin: ({
    onSuccess,
  }: {
    onSuccess: (r: { credential: string }) => void
  }) => (
    <button
      type="button"
      onClick={() => onSuccess({ credential: 'google-id-token' })}
    >
      Iniciar sesión con Google
    </button>
  ),
  // Permiso de Drive: en los tests no se abre la ventana de Google
  useGoogleLogin: () => () => {},
}))

beforeEach(() => {
  vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id')
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.unstubAllEnvs()
})
