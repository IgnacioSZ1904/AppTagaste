import { useState } from 'react'
import { Link } from 'react-router'

import { membersLine, useGroups, useMyGroups } from '@/api/groups'
import { useAuth } from '@/auth/context'
import { canManageUsers } from '@/auth/roles'
import { GroupForm } from '@/components/GroupForm'

/** El admin ve y gestiona todos los grupos; monitores y coordinadores, los suyos. */
export function GroupsPage() {
  const { user } = useAuth()
  const isAdmin = canManageUsers(user)
  const all = useGroups(isAdmin)
  const mine = useMyGroups(!isAdmin)
  const { data: groups, error, isPending } = isAdmin ? all : mine
  const [creating, setCreating] = useState(false)

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-brand-700 text-2xl font-bold">
          {isAdmin ? 'Grupos' : 'Mis grupos'}
        </h1>
        {isAdmin && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => setCreating(true)}
          >
            + Nuevo grupo
          </button>
        )}
      </div>

      {isPending && <p className="text-slate-500">Cargando…</p>}
      {error && (
        <p role="alert" className="bg-brand-50 text-brand-700 rounded-lg p-3">
          No se pudieron cargar los grupos: {error.message}
        </p>
      )}
      {groups?.length === 0 && (
        <p className="text-slate-500">
          {isAdmin
            ? 'Aún no hay grupos. Crea el primero con «+ Nuevo grupo».'
            : 'Aún no tienes grupos asignados. Pide al administrador que te añada a uno.'}
        </p>
      )}

      {groups && groups.length > 0 && (
        <ul
          aria-label="Grupos"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                to={`/grupos/${group.id}`}
                className="hover:border-brand-500 block h-full rounded-lg border border-slate-200 bg-white p-4"
              >
                <p className="text-brand-700 font-semibold">{group.name}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {membersLine(group.members) || 'Sin responsables asignados'}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {group.children_count === 1
                    ? '1 niño'
                    : `${group.children_count} niños`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {creating && <GroupForm onClose={() => setCreating(false)} />}
    </section>
  )
}
