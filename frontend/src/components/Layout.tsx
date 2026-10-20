import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'

import { useAuth } from '@/auth/context'
import {
  canManageUsers,
  canSeeGroups,
  canSeeStats,
  canUseLibrary,
  ROLE_LABELS,
} from '@/auth/roles'

export function Layout() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/', label: 'Calendario', show: true },
    {
      to: '/grupos',
      label: canManageUsers(user) ? 'Grupos' : 'Mis grupos',
      show: canSeeGroups(user),
    },
    { to: '/biblioteca', label: 'Biblioteca', show: canUseLibrary(user) },
    { to: '/estadisticas', label: 'Estadísticas', show: canSeeStats(user) },
    { to: '/usuarios', label: 'Usuarios', show: canManageUsers(user) },
    { to: '/estado', label: 'Estado', show: true },
  ]

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white text-slate-900">
      <header className="border-brand-500 border-b-4 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <NavLink to="/" className="flex items-center gap-2">
            <img src="/escudo.png" alt="" className="size-10" />
            <span className="text-brand-700 text-lg font-bold">AppTagaste</span>
          </NavLink>
          <button
            type="button"
            className="text-brand-700 hover:bg-brand-50 rounded p-2 md:hidden"
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <nav
            className={`${open ? 'flex' : 'hidden'} w-full flex-col gap-3 pb-2 md:flex md:w-auto md:flex-row md:items-center md:gap-6 md:pb-0`}
          >
            <ul className="flex flex-col gap-2 md:flex-row md:gap-4">
              {links
                .filter((link) => link.show)
                .map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      end={link.to === '/'}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        isActive
                          ? 'text-brand-700 font-semibold underline decoration-2 underline-offset-4'
                          : 'hover:text-brand-700 text-slate-700'
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
            </ul>
            {user && (
              <div className="flex items-center gap-3 border-t border-slate-200 pt-2 md:border-0 md:pt-0">
                <div className="text-sm leading-tight">
                  <p className="font-medium">{user.full_name}</p>
                  <p className="text-brand-700">{ROLE_LABELS[user.role]}</p>
                </div>
                <button
                  type="button"
                  className="btn-secondary px-3 py-1 text-sm"
                  onClick={logout}
                >
                  Salir
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-y-auto px-4 py-3 sm:py-4">
        <Outlet />
      </main>
    </div>
  )
}
