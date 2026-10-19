import { useState, type FormEvent } from 'react'

import {
  EVENT_TYPE_LABELS,
  EVENT_TYPES,
  type CalendarEvent,
  type EventInput,
  type EventType,
} from '@/api/events'
import type { Group } from '@/api/groups'
import { apiToInput, inputToApi } from '@/lib/dates'

type Props = {
  event?: CalendarEvent
  /** Valores iniciales de un evento nuevo (fechas "AAAA-MM-DDTHH:MM" y grupos). */
  defaults?: { startsAt: string; endsAt: string; groupIds?: number[] }
  /** Grupos que se pueden elegir. */
  groups?: Group[]
  submitting: boolean
  error: string | null
  onSubmit: (data: EventInput) => void
  onCancel: () => void
}

export function EventForm({
  event,
  defaults,
  groups = [],
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
  const [groupIds, setGroupIds] = useState<number[]>(
    event ? event.groups.map((g) => g.id) : (defaults?.groupIds ?? []),
  )

  const toggleGroup = (id: number) =>
    setGroupIds((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    )
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
      group_ids: groupIds,
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
      {groups.length > 0 && (
        <fieldset className="space-y-1">
          <legend className="text-sm font-medium">Grupos</legend>
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                className="event-chip aria-pressed:border-brand-500 aria-pressed:bg-brand-50 aria-pressed:text-brand-700"
                aria-pressed={groupIds.includes(g.id)}
                onClick={() => toggleGroup(g.id)}
              >
                {g.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            {groupIds.length === 0
              ? 'Sin grupos: evento general, lo ven todos los grupos.'
              : 'Solo lo ven los grupos marcados.'}
          </p>
        </fieldset>
      )}
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
