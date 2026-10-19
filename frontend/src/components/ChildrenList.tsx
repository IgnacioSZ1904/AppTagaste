import { useState } from 'react'

import {
  useChildren,
  useDeleteChild,
  useRenameChild,
  type Child,
} from '@/api/groups'

function ChildRow({ child }: { child: Child }) {
  const rename = useRenameChild()
  const remove = useDeleteChild()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(child.full_name)
  const ids = { groupId: child.group_id, id: child.id }

  return (
    <li className="flex flex-wrap items-center gap-2 border-b border-slate-200 py-2 last:border-0">
      {editing ? (
        <form
          className="flex flex-1 flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            rename.mutate(
              { ...ids, full_name: name.trim() },
              { onSuccess: () => setEditing(false) },
            )
          }}
        >
          <input
            aria-label={`Nombre de ${child.full_name}`}
            className="field flex-1 py-1"
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="submit"
            className="btn-primary py-1 text-sm"
            disabled={rename.isPending}
          >
            Guardar
          </button>
          <button
            type="button"
            className="btn-secondary py-1 text-sm"
            onClick={() => {
              setName(child.full_name)
              setEditing(false)
            }}
          >
            Cancelar
          </button>
        </form>
      ) : (
        <>
          <span className="flex-1">{child.full_name}</span>
          <button
            type="button"
            className="btn-secondary py-1 text-sm"
            aria-label={`Editar a ${child.full_name}`}
            onClick={() => setEditing(true)}
          >
            Editar
          </button>
          <button
            type="button"
            className="btn-danger py-1 text-sm"
            aria-label={`Borrar a ${child.full_name}`}
            disabled={remove.isPending}
            onClick={() => {
              if (window.confirm(`¿Borrar a ${child.full_name} del grupo?`)) {
                remove.mutate(ids)
              }
            }}
          >
            Borrar
          </button>
        </>
      )}
      {(rename.error ?? remove.error) && (
        <p role="alert" className="text-brand-700 w-full text-sm">
          {(rename.error ?? remove.error)?.message}
        </p>
      )}
    </li>
  )
}

export function ChildrenList({ groupId }: { groupId: number }) {
  const { data: children, error, isPending } = useChildren(groupId, true)

  if (isPending) return <p className="text-slate-500">Cargando…</p>
  if (error) {
    return (
      <p role="alert" className="bg-brand-50 text-brand-700 rounded-lg p-3">
        No se pudo cargar la lista de niños: {error.message}
      </p>
    )
  }
  if (children.length === 0) {
    return <p className="text-slate-500">Aún no hay niños en este grupo.</p>
  }
  return (
    <ul
      aria-label="Niños"
      className="rounded-lg border border-slate-200 bg-white px-3"
    >
      {children.map((child) => (
        <ChildRow key={child.id} child={child} />
      ))}
    </ul>
  )
}
