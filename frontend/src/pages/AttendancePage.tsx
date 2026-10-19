import { useState } from 'react'
import { Link, useParams } from 'react-router'

import { useAttendance, useSaveAttendance } from '@/api/attendance'
import { useEvent } from '@/api/events'
import { useGroup } from '@/api/groups'
import { useAuth } from '@/auth/context'
import { canTakeAttendance } from '@/auth/roles'
import { formatApiDate } from '@/lib/dates'

export function AttendancePage() {
  const params = useParams()
  const groupId = Number(params.id)
  const eventId = Number(params.eventId)
  const { user } = useAuth()
  const { data: group } = useGroup(groupId)
  const { data: event } = useEvent(eventId)
  const { data: attendance, error, isPending } = useAttendance(groupId, eventId)
  const save = useSaveAttendance(groupId, eventId)
  // Marcas en pantalla; null = aún sin tocar (se parte de lo guardado)
  const [marked, setMarked] = useState<Set<number> | null>(null)

  const canSave =
    canTakeAttendance(user) &&
    (group?.members.some((m) => m.id === user?.id) ?? false)

  const back = (
    <Link
      to={`/grupos/${groupId}`}
      className="text-sm text-slate-500 hover:underline"
    >
      ← {group?.name ?? 'Grupo'}
    </Link>
  )

  if (isPending) return <p className="text-slate-500">Cargando…</p>
  if (error) {
    return (
      <section className="space-y-2">
        {back}
        <p role="alert" className="bg-brand-50 text-brand-700 rounded-lg p-3">
          No se pudo cargar la lista: {error.message}
        </p>
      </section>
    )
  }

  const present =
    marked ??
    new Set(attendance.children.filter((c) => c.present).map((c) => c.child_id))
  const toggle = (id: number) => {
    const next = new Set(present)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setMarked(next)
  }
  const allMarked = present.size === attendance.children.length

  return (
    <section className="flex flex-col gap-4">
      <div className="space-y-1">
        {back}
        <h1 className="text-brand-700 text-2xl font-bold">Pase de lista</h1>
        {event && (
          <p className="text-slate-600">
            {event.title} · {formatApiDate(event.starts_at)}
          </p>
        )}
        <p className="text-sm text-slate-500">
          {attendance.marked_at
            ? `Guardado por ${attendance.marked_by ?? 'un usuario borrado'} el ${formatApiDate(attendance.marked_at)}`
            : 'Aún no se ha pasado lista'}
        </p>
      </div>

      {attendance.children.length === 0 ? (
        <p className="text-slate-500">Este grupo no tiene niños.</p>
      ) : (
        <ul aria-label="Niños" className="divide-y rounded-lg border bg-white">
          {attendance.children.map((c) => (
            <li key={c.child_id} className="px-3 py-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="size-5"
                  checked={present.has(c.child_id)}
                  disabled={!canSave}
                  onChange={() => toggle(c.child_id)}
                />
                <span>{c.full_name}</span>
                {!canSave && c.present === null && (
                  <span className="text-xs text-slate-400">sin pasar</span>
                )}
              </label>
            </li>
          ))}
        </ul>
      )}

      {save.error && (
        <p role="alert" className="text-brand-700 text-sm">
          {save.error.message}
        </p>
      )}
      {canSave ? (
        attendance.children.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="mr-auto text-sm text-slate-500">
              {present.size} de {attendance.children.length} presentes
            </span>
            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                setMarked(
                  allMarked
                    ? new Set()
                    : new Set(attendance.children.map((c) => c.child_id)),
                )
              }
            >
              {allMarked ? 'Desmarcar todos' : 'Marcar todos'}
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={save.isPending}
              onClick={() =>
                save.mutate([...present], { onSuccess: () => setMarked(null) })
              }
            >
              Guardar
            </button>
          </div>
        )
      ) : (
        <p className="text-xs text-slate-500">
          Solo los monitores del grupo pueden pasar lista.
        </p>
      )}
    </section>
  )
}
