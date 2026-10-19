import { useState } from 'react'

import { useAddMember, useRemoveMember, type Group } from '@/api/groups'
import { useUsers } from '@/api/users'
import { ROLE_LABELS } from '@/auth/roles'

/** Responsables del grupo (solo admin): monitores y coordinadores activos. */
export function MembersEditor({ group }: { group: Group }) {
  const { data: users } = useUsers()
  const add = useAddMember()
  const remove = useRemoveMember()
  const [userId, setUserId] = useState('')

  const candidates = (users ?? []).filter(
    (u) =>
      u.is_active &&
      (u.role === 'monitor' || u.role === 'coordinador') &&
      !group.members.some((m) => m.id === u.id),
  )
  const error = add.error ?? remove.error

  return (
    <div className="space-y-3">
      {group.members.length === 0 ? (
        <p className="text-slate-500">Sin responsables asignados.</p>
      ) : (
        <ul aria-label="Responsables" className="flex flex-wrap gap-2">
          {group.members.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pr-1 pl-3 text-sm"
            >
              <span>
                {m.full_name}{' '}
                <span className="text-slate-500">({ROLE_LABELS[m.role]})</span>
              </span>
              <button
                type="button"
                aria-label={`Quitar a ${m.full_name}`}
                className="hover:bg-brand-50 text-brand-700 rounded-full px-2"
                disabled={remove.isPending}
                onClick={() =>
                  remove.mutate({ groupId: group.id, userId: m.id })
                }
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!userId) return
          add.mutate(
            { groupId: group.id, userId: Number(userId) },
            { onSuccess: () => setUserId('') },
          )
        }}
      >
        <select
          aria-label="Responsable a añadir"
          className="field w-auto flex-1"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        >
          <option value="">Elige un monitor o coordinador…</option>
          {candidates.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name} ({ROLE_LABELS[u.role]})
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="btn-secondary"
          disabled={!userId || add.isPending}
        >
          Añadir responsable
        </button>
      </form>
      {error && (
        <p role="alert" className="text-brand-700 text-sm">
          {error.message}
        </p>
      )}
    </div>
  )
}
