import { Navigate, Outlet, useLocation } from 'react-router'

import { useAuth } from './context'

/** Deja pasar solo con sesión; si no, lleva al login. */
export function RequireAuth() {
  const { isAuthenticated, isLoading, user, error, logout } = useAuth()
  const location = useLocation()

  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />
  if (error) {
    return (
      <div role="alert" className="space-y-3 p-6 text-center">
        <p className="text-brand-700">
          No se pudo cargar tu sesión: {error.message}
        </p>
        <button type="button" className="btn-secondary" onClick={logout}>
          Volver al login
        </button>
      </div>
    )
  }
  if (isLoading || !user) {
    return <p className="p-6 text-center text-slate-500">Cargando…</p>
  }
  return <Outlet />
}
