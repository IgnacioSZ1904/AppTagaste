import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/react/daygrid'
import esLocale from '@fullcalendar/react/locales/es'
import classicThemePlugin from '@fullcalendar/react/themes/classic'
import { useMemo, useState } from 'react'

import {
  EVENT_TYPE_LABELS,
  EVENT_TYPES,
  useEvents,
  type CalendarEvent,
  type DateRange,
  type EventType,
} from '@/api/events'
import { useAuth } from '@/auth/context'
import { canEditEvents } from '@/auth/roles'
import { EventModal } from '@/components/EventModal'
import { UpcomingList } from '@/components/UpcomingList'
import { apiToInput, toApiDate } from '@/lib/dates'

const EVENT_COLORS: Record<EventType, string> = {
  reunion: 'var(--color-event-reunion)',
  convivencia: 'var(--color-event-convivencia)',
  eucaristia: 'var(--color-event-eucaristia)',
  otro: 'var(--color-event-otro)',
}

const isMobile = () =>
  window.matchMedia?.('(max-width: 640px)').matches ?? false

/** Valores por defecto de un evento nuevo: mañana de 17:00 a 18:30. */
function newEventDefaults() {
  const day = new Date()
  day.setDate(day.getDate() + 1)
  const date = toApiDate(day).slice(0, 10)
  return { startsAt: `${date}T17:00`, endsAt: `${date}T18:30` }
}

type View = 'month' | 'agenda'

const VIEWS: { value: View; label: string }[] = [
  { value: 'month', label: 'Mes' },
  { value: 'agenda', label: 'Próximos' },
]

type Selected =
  | { mode: 'view'; event: CalendarEvent }
  | { mode: 'create'; defaults: { startsAt: string; endsAt: string } }

export function CalendarPage() {
  const { user } = useAuth()
  const [range, setRange] = useState<DateRange | null>(null)
  const [type, setType] = useState<EventType | null>(null)
  const [view, setView] = useState<View>(isMobile() ? 'agenda' : 'month')
  const [selected, setSelected] = useState<Selected | null>(null)
  const {
    data: events,
    error,
    isFetching,
  } = useEvents(view === 'month' ? range : null, type)

  const calendarEvents = useMemo(
    () =>
      (events ?? []).map((event) => ({
        id: String(event.id),
        title: event.title,
        start: apiToInput(event.starts_at),
        end: apiToInput(event.ends_at),
        color: EVENT_COLORS[event.type],
      })),
    [events],
  )

  const openEvent = (id: string) => {
    const event = events?.find((e) => String(e.id) === id)
    if (event) setSelected({ mode: 'view', event })
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      <h1 className="sr-only">Calendario</h1>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Filtrar por tipo"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            className="event-chip"
            aria-pressed={type === null}
            onClick={() => setType(null)}
          >
            Todos
          </button>
          {EVENT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={`event-chip event-${t}`}
              aria-pressed={type === t}
              onClick={() => setType(type === t ? null : t)}
            >
              {EVENT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Vista"
            className="border-brand-500 flex overflow-hidden rounded-lg border"
          >
            {VIEWS.map((v) => (
              <button
                key={v.value}
                type="button"
                aria-pressed={view === v.value}
                onClick={() => setView(v.value)}
                className="aria-pressed:bg-brand-500 text-brand-700 hover:bg-brand-50 aria-pressed:hover:bg-brand-600 px-3 py-2 text-sm font-medium aria-pressed:text-white"
              >
                {v.label}
              </button>
            ))}
          </div>
          {canEditEvents(user) && (
            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                setSelected({ mode: 'create', defaults: newEventDefaults() })
              }
            >
              + Nuevo evento
            </button>
          )}
        </div>
      </div>

      {view === 'agenda' ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <UpcomingList
            type={type}
            onSelect={(event) => setSelected({ mode: 'view', event })}
          />
        </div>
      ) : (
        <>
          {error && (
            <p
              role="alert"
              className="bg-brand-50 text-brand-700 rounded-lg p-3"
            >
              No se pudieron cargar los eventos: {error.message}
            </p>
          )}

          <div
            className={`min-h-0 flex-1 transition-opacity ${isFetching ? 'opacity-70' : ''}`}
          >
            <FullCalendar
              plugins={[dayGridPlugin, classicThemePlugin]}
              locale={esLocale}
              initialView="dayGridMonth"
              headerToolbar={{
                start: 'prev,next today',
                center: 'title',
                end: '',
              }}
              height="100%"
              dayMaxEvents
              events={calendarEvents}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }}
              noEventsText="No hay eventos este mes"
              datesSet={({ view }) =>
                setRange({
                  from: toApiDate(view.activeStart),
                  to: toApiDate(view.activeEnd),
                })
              }
              eventClick={({ event, jsEvent }) => {
                jsEvent.preventDefault()
                openEvent(event.id)
              }}
            />
          </div>
        </>
      )}

      {selected && (
        <EventModal {...selected} onClose={() => setSelected(null)} />
      )}
    </section>
  )
}
