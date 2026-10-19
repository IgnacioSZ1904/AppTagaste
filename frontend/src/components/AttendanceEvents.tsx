import { Link } from 'react-router'

import { useAttendance } from '@/api/attendance'
import { useAttendanceEvents, type CalendarEvent } from '@/api/events'
import { formatApiDate } from '@/lib/dates'

/** Eventos recientes y próximos del grupo, cada uno con su estado de pase de lista. */
export function AttendanceEvents({ groupId }: { groupId: number }) {
  const { data: events, error, isPending } = useAttendanceEvents(groupId)

  if (isPending) return <p className="text-slate-500">Cargando…</p>
  if (error) {
    return (
      <p role="alert" className="text-brand-700 text-sm">
        No se pudieron cargar los eventos: {error.message}
      </p>
    )
  }
  if (events.length === 0) {
    return (
      <p className="text-slate-500">
        No hay eventos en las últimas 4 semanas ni en la próxima.
      </p>
    )
  }

  return (
    <ul aria-label="Eventos" className="divide-y rounded-lg border bg-white">
      {[...events].reverse().map((event) => (
        <AttendanceRow key={event.id} groupId={groupId} event={event} />
      ))}
    </ul>
  )
}

function AttendanceRow({
  groupId,
  event,
}: {
  groupId: number
  event: CalendarEvent
}) {
  const { data } = useAttendance(groupId, event.id)
  const done = data?.marked_at != null
  const present = data?.children.filter((c) => c.present).length ?? 0

  return (
    <li>
      <Link
        to={`/grupos/${groupId}/eventos/${event.id}/lista`}
        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 hover:bg-slate-50"
      >
        <span>
          {event.title}{' '}
          <span className="text-sm text-slate-500">
            · {formatApiDate(event.starts_at)}
          </span>
        </span>
        {data && (
          <span
            className={`text-sm ${done ? 'text-green-700' : 'text-slate-400'}`}
          >
            {done ? `Hecho (${present}/${data.children.length})` : 'Pendiente'}
          </span>
        )}
      </Link>
    </li>
  )
}
