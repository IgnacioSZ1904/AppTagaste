import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'

const links = [{ to: '/', label: 'Inicio' }]

export function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900">
      <header className="bg-indigo-700 text-white shadow">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="text-lg font-semibold">
            AppTagaste
          </NavLink>
          <button
            type="button"
            className="rounded p-2 hover:bg-indigo-600 md:hidden"
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
          <nav className={`${open ? 'block' : 'hidden'} md:block`}>
            <ul className="flex gap-4">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      isActive ? 'underline' : 'hover:underline'
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
