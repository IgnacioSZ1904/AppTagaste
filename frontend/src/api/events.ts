import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toApiDate } from '@/lib/dates'

import { apiFetch } from './client'

export const EVENT_TYPES = [
  'reunion',
  'convivencia',
  'eucaristia',
  'otro',
] as const
export type EventType = (typeof EVENT_TYPES)[number]

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  reunion: 'Reunión',
  convivencia: 'Convivencia',
  eucaristia: 'Eucaristía',
  otro: 'Otro',
}

/** Fechas en hora de España: "AAAA-MM-DD HH:MM". */
export type CalendarEvent = {
  id: number
  title: string
  description: string | null
  type: EventType
  starts_at: string
  ends_at: string
  location: string | null
}

export type EventInput = Omit<CalendarEvent, 'id'>

export type DateRange = { from: string; to: string }

export const useEvents = (range: DateRange | null, type: EventType | null) =>
  useQuery({
    queryKey: ['events', range, type],
    queryFn: () => {
      const params = new URLSearchParams(range ?? {})
      if (type) params.set('type', type)
      return apiFetch<CalendarEvent[]>(`/events?${params}`)
    },
    enabled: range !== null,
    placeholderData: (previous) => previous,
  })

/** Próximos eventos (los que aún no han terminado), ordenados por inicio. */
export const useUpcomingEvents = (type: EventType | null, limit = 15) =>
  useQuery({
    queryKey: ['events', 'upcoming', type],
    queryFn: () => {
      const params = new URLSearchParams({ from: toApiDate(new Date()) })
      if (type) params.set('type', type)
      return apiFetch<CalendarEvent[]>(`/events?${params}`)
    },
    select: (events) => events.slice(0, limit),
  })

function useEventMutation<V>(mutationFn: (variables: V) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })
}

export const useCreateEvent = () =>
  useEventMutation((data: EventInput) =>
    apiFetch<CalendarEvent>('/events', { method: 'POST', json: data }),
  )

export const useUpdateEvent = () =>
  useEventMutation(({ id, data }: { id: number; data: EventInput }) =>
    apiFetch<CalendarEvent>(`/events/${id}`, { method: 'PATCH', json: data }),
  )

export const useDeleteEvent = () =>
  useEventMutation((id: number) =>
    apiFetch<void>(`/events/${id}`, { method: 'DELETE' }),
  )
