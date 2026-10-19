import {
  EVENT_TYPE_LABELS,
  useUpcomingEvents,
  type CalendarEvent,
  type EventType,
} from '@/api/events'
import { formatApiRange } from '@/lib/dates'

const MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]

type Props = {
  type: EventType | null
  groupId: number | null
  onSelect: (event: CalendarEvent) => void
}

/** Agenda: los próximos eventos, uno por fila aunque duren varios días. */
export function UpcomingList({ type, groupId, onSelect }: Props) {
  const { data: events, error, isPending } = useUpcomingEvents(type, groupId)

  if (isPending) return <p className="text-slate-500">Cargando…</p>
  if (error) {
    return (
      <p role="alert" className="bg-brand-50 text-brand-700 rounded-lg p-3">
        No se pudieron cargar los eventos: {error.message}
      </p>
    )
  }
  if (events.length === 0) {
    return <p className="text-slate-500">No hay próximos eventos.</p>
  }

  return (
    <ul aria-label="Próximos eventos" className="space-y-2">
      {events.map((event) => {
        const [year, month, day] = event.starts_at.slice(0, 10).split('-')
        return (
          <li key={event.id}>
            <button
              type="button"
              onClick={() => onSelect(event)}
              className={`event-${event.type} flex w-full items-center gap-3 rounded-lg border border-l-4 border-slate-200 bg-white p-3 text-left hover:bg-slate-50`}
              style={{ borderLeftColor: 'var(--event-color)' }}
            >
              <span className="w-12 shrink-0 text-center leading-tight">
                <span className="text-brand-700 block text-2xl font-bold">
                  {Number(day)}
                </span>
                <span className="block text-xs text-slate-500 uppercase">
                  {MONTHS[Number(month) - 1]} {year.slice(2)}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{event.title}</span>
                <span className="block text-sm text-slate-600">
                  {formatApiRange(event.starts_at, event.ends_at)}
                  {event.location && ` · ${event.location}`}
                </span>
              </span>
              <span className="event-chip hidden text-xs sm:inline-flex">
                {EVENT_TYPE_LABELS[event.type]}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
