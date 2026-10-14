import { useState, type FormEvent } from 'react'

import {
  EVENT_TYPE_LABELS,
  EVENT_TYPES,
  type CalendarEvent,
  type EventInput,
  type EventType,
} from '@/api/events'
import { apiToInput, inputToApi } from '@/lib/dates'

type Props = {
  event?: CalendarEvent
  /** Valores iniciales de inicio y fin para un evento nuevo ("AAAA-MM-DDTHH:MM"). */
  defaults?: { startsAt: string; endsAt: string }
  submitting: boolean
  error: string | null
  onSubmit: (data: EventInput) => void
  onCancel: () => void
}

export function EventForm({
  event,
  defaults,
  submitting,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(event?.title ?? '')
  const [type, setType] = useState<EventType>(event?.type ?? 'reunion')
  const [startsAt, setStartsAt] = useState(
    event ? apiToInput(event.starts_at) : (defaults?.startsAt ?? ''),
  )
  const [endsAt, setEndsAt] = useState(
    event ? apiToInput(event.ends_at) : (defaults?.endsAt ?? ''),
  )
  const [location, setLocation] = useState(event?.location ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (endsAt <= startsAt) {
      setLocalError('La fecha de fin debe ser posterior a la de inicio')
      return
    }
    setLocalError(null)
    onSubmit({
      title: title.trim(),
      type,
      starts_at: inputToApi(startsAt),
      ends_at: inputToApi(endsAt),
      location: location.trim() || null,
      description: description.trim() || null,
    })
  }

  const shownError = localError ?? error

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block space-y-1">
        <span className="text-sm font-medium">Título</span>
        <input
          className="field"
          required
          maxLength={150}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Tipo</span>
        <select
          className="field"
          value={type}
          onChange={(e) => setType(e.target.value as EventType)}
        >
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {EVENT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Inicio</span>
          <input
            type="datetime-local"
            className="field"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Fin</span>
          <input
            type="datetime-local"
            className="field"
            required
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Lugar</span>
        <input
          className="field"
          maxLength={150}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Descripción</span>
        <textarea
          className="field"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      {shownError && (
        <p
          role="alert"
          className="bg-brand-50 text-brand-700 rounded-lg p-3 text-sm"
        >
          {shownError}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
