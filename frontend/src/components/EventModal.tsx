import { useState } from 'react'
import { Link } from 'react-router'

import {
  EVENT_TYPE_LABELS,
  useCreateEvent,
  useDeleteEvent,
  useUpdateEvent,
  type CalendarEvent,
  type EventInput,
} from '@/api/events'
import { useGroups, useMyGroups } from '@/api/groups'
import { useAuth } from '@/auth/context'
import { canEditEvents, canTakeAttendance } from '@/auth/roles'
import { formatApiDate } from '@/lib/dates'

import { EventForm } from './EventForm'
import { Modal } from './Modal'

type Props =
  | { mode: 'view'; event: CalendarEvent; onClose: () => void }
  | {
      mode: 'create'
      defaults: { startsAt: string; endsAt: string; groupIds: number[] }
      onClose: () => void
    }

export function EventModal(props: Props) {
  const { user } = useAuth()
  const canEdit = canEditEvents(user)
  const [editing, setEditing] = useState(props.mode === 'create')
  const create = useCreateEvent()
  const update = useUpdateEvent()
  const remove = useDeleteEvent()
  const { data: groups } = useGroups(editing)
  const isMonitor = canTakeAttendance(user)
  const { data: myGroups } = useMyGroups(isMonitor && props.mode === 'view')

  const save = (data: EventInput) => {
    const options = { onSuccess: props.onClose }
    if (props.mode === 'create') create.mutate(data, options)
    else update.mutate({ id: props.event.id, data }, options)
  }

  const handleDelete = () => {
    if (props.mode !== 'view') return
    if (window.confirm(`¿Borrar "${props.event.title}"?`)) {
      remove.mutate(props.event.id, { onSuccess: props.onClose })
    }
  }

  if (editing) {
    const mutation = props.mode === 'create' ? create : update
    return (
      <Modal
        title={props.mode === 'create' ? 'Nuevo evento' : 'Editar evento'}
        onClose={props.onClose}
      >
        <EventForm
          event={props.mode === 'view' ? props.event : undefined}
          defaults={props.mode === 'create' ? props.defaults : undefined}
          groups={groups}
          submitting={mutation.isPending}
          error={mutation.error?.message ?? null}
          onSubmit={save}
          onCancel={
            props.mode === 'create' ? props.onClose : () => setEditing(false)
          }
        />
      </Modal>
    )
  }

  if (props.mode !== 'view') return null
  const { event } = props
  // Grupos del monitor a los que afecta el evento (los suyos o todos si es general)
  const listGroups = (myGroups ?? []).filter(
    (g) =>
      event.groups.length === 0 || event.groups.some((eg) => eg.id === g.id),
  )

  return (
    <Modal title={event.title} onClose={props.onClose}>
      <dl className="space-y-3">
        <div>
          <dt className="text-sm text-slate-500">Tipo</dt>
          <dd>
            <span className={`event-chip event-${event.type}`}>
              {EVENT_TYPE_LABELS[event.type]}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Cuándo</dt>
          <dd>
            {formatApiDate(event.starts_at)} – {formatApiDate(event.ends_at)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Grupos</dt>
          <dd>
            {event.groups.length === 0
              ? 'General (todos los grupos)'
              : event.groups.map((g) => g.name).join(', ')}
          </dd>
        </div>
        {event.location && (
          <div>
            <dt className="text-sm text-slate-500">Lugar</dt>
            <dd>{event.location}</dd>
          </div>
        )}
        {event.description && (
          <div>
            <dt className="text-sm text-slate-500">Descripción</dt>
            <dd className="whitespace-pre-line">{event.description}</dd>
          </div>
        )}
      </dl>
      {remove.error && (
        <p
          role="alert"
          className="bg-brand-50 text-brand-700 mt-4 rounded-lg p-3 text-sm"
        >
          {remove.error.message}
        </p>
      )}
      {isMonitor && listGroups.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {listGroups.map((g) => (
            <Link
              key={g.id}
              to={`/grupos/${g.id}/eventos/${event.id}/lista`}
              className="btn-primary"
            >
              {listGroups.length === 1
                ? 'Pasar lista'
                : `Pasar lista · ${g.name}`}
            </Link>
          ))}
        </div>
      )}
      {canEdit && (
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="btn-danger"
            onClick={handleDelete}
            disabled={remove.isPending}
          >
            Borrar
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setEditing(true)}
          >
            Editar
          </button>
        </div>
      )}
    </Modal>
  )
}
