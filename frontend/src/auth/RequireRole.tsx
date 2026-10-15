import { Outlet } from 'react-router'

import type { User } from '@/api/auth'

import { useAuth } from './context'

/** Deja pasar solo si el usuario cumple el permiso; si no, muestra un aviso. */
export function RequireRole({
  allow,
}: {
  allow: (user: User | null) => boolean
}) {
  const { user } = useAuth()
  if (!allow(user)) {
    return (
      <section className="space-y-2 text-center">
        <h1 className="text-brand-700 text-2xl font-bold">No tienes permiso</h1>
        <p className="text-slate-600">
          Esta sección es solo para administradores.
        </p>
      </section>
    )
  }
  return <Outlet />
}
