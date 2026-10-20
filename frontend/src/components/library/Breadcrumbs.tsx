import { Link } from 'react-router'

import { libraryPath } from '@/lib/libraryPath'

type Props = { year?: string; group?: string; search: string }

/** Biblioteca › 2025-2026 › Confirmación A (manteniendo la búsqueda). */
export function Breadcrumbs({ year, group, search }: Props) {
  const crumbs = [
    { label: 'Biblioteca', to: libraryPath() },
    ...(year ? [{ label: year, to: libraryPath(year) }] : []),
    ...(year && group ? [{ label: group, to: libraryPath(year, group) }] : []),
  ]
  return (
    <nav aria-label="Ruta">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1
          return (
            <li key={crumb.to} className="flex items-center gap-1">
              {i > 0 && <span className="text-slate-400">›</span>}
              {last ? (
                <span aria-current="page" className="font-semibold">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.to + search}
                  className="text-brand-700 hover:underline"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
