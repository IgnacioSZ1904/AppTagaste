import { GoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { Navigate, useLocation } from 'react-router'

import { useAuth } from '@/auth/context'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (isAuthenticated) {
    const from =
      (location.state as { from?: Location } | null)?.from?.pathname ?? '/'
    return <Navigate to={from} replace />
  }

  const handleCredential = async (credential?: string) => {
    if (!credential) return setError('Google no devolvió credenciales')
    setError(null)
    setLoading(true)
    try {
      await login(credential)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-brand-50 flex min-h-dvh items-center justify-center px-4">
      <div className="border-brand-500 w-full max-w-sm space-y-6 rounded-2xl border-t-4 bg-white p-8 text-center shadow-lg">
        <img
          src="/escudo.png"
          alt="Escudo del colegio"
          className="mx-auto size-28"
        />
        <div>
          <h1 className="text-brand-700 text-2xl font-bold">AppTagaste</h1>
          <p className="text-slate-600">Calendario de catequesis</p>
        </div>
        {googleClientId ? (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(response) => handleCredential(response.credential)}
              onError={() => setError('No se pudo iniciar sesión con Google')}
              text="signin_with"
              shape="pill"
            />
          </div>
        ) : (
          <p className="text-sm text-amber-700">
            Falta configurar <code>VITE_GOOGLE_CLIENT_ID</code> en{' '}
            <code>frontend/.env</code>.
          </p>
        )}
        {loading && <p className="text-slate-500">Entrando…</p>}
        {error && (
          <p
            role="alert"
            className="bg-brand-50 text-brand-700 rounded-lg p-3 text-sm"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
