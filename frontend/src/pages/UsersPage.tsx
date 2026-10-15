import { useMemo, useState } from 'react'

import type { Role } from '@/api/auth'
import { useUsers } from '@/api/users'
import { useAuth } from '@/auth/context'
import { ROLE_LABELS, ROLES } from '@/auth/roles'
import { UserForm } from '@/components/UserForm'
import { UserRow } from '@/components/UserRow'

/** Minúsculas y sin tildes, para buscar "jose" y encontrar "José". */
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export function UsersPage() {
  const { user: me } = useAuth()
  const { data: users, error, isPending } = useUsers()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<Role | null>(null)
  const [adding, setAdding] = useState(false)

  const filtered = useMemo(() => {
    const query = normalize(search.trim())
    return (users ?? []).filter(
      (u) =>
        (role === null || u.role === role) &&
        normalize(`${u.full_name} ${u.email}`).includes(query),
    )
  }, [users, search, role])

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-brand-700 text-2xl font-bold">Usuarios</h1>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setAdding(true)}
        >
          + Añadir usuario
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          aria-label="Buscar por nombre o email"
          placeholder="Buscar por nombre o email"
          className="field max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div
          role="group"
          aria-label="Filtrar por rol"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            className="event-chip"
            aria-pressed={role === null}
            onClick={() => setRole(null)}
          >
            Todos
          </button>
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              className="event-chip"
              aria-pressed={role === r}
              onClick={() => setRole(role === r ? null : r)}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {isPending && <p className="text-slate-500">Cargando…</p>}
      {error && (
        <p role="alert" className="bg-brand-50 text-brand-700 rounded-lg p-3">
          No se pudieron cargar los usuarios: {error.message}
        </p>
      )}

      {users && (
        <>
          <p className="text-sm text-slate-500">
            {filtered.length} de {users.length} usuarios
          </p>
          <div className="md:rounded-lg md:border md:border-slate-200">
            <div className="hidden grid-cols-[2fr_2fr_10rem_9rem] border-b border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-600 md:grid">
              <span>Nombre</span>
              <span>Email</span>
              <span>Rol</span>
              <span className="text-right">Estado</span>
            </div>
            <ul aria-label="Usuarios" className="space-y-2 md:space-y-0">
              {filtered.map((u) => (
                <UserRow key={u.id} user={u} isSelf={u.id === me?.id} />
              ))}
            </ul>
            {filtered.length === 0 && (
              <p className="p-3 text-slate-500">
                Ningún usuario coincide con la búsqueda.
              </p>
            )}
          </div>
        </>
      )}

      {adding && <UserForm onClose={() => setAdding(false)} />}
    </section>
  )
}
