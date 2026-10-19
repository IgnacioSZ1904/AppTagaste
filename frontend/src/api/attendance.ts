import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from './client'

export type AttendanceChild = {
  child_id: number
  full_name: string
  /** null = aún no se ha pasado lista a este niño. */
  present: boolean | null
}

export type Attendance = {
  event_id: number
  group_id: number
  children: AttendanceChild[]
  marked_by: string | null
  /** "AAAA-MM-DD HH:MM" o null si nadie ha pasado lista. */
  marked_at: string | null
}

const path = (groupId: number, eventId: number) =>
  `/groups/${groupId}/events/${eventId}/attendance`

export const useAttendance = (groupId: number, eventId: number) =>
  useQuery({
    queryKey: ['attendance', groupId, eventId],
    queryFn: () => apiFetch<Attendance>(path(groupId, eventId)),
  })

/** Guarda la lista entera: los niños no marcados quedan ausentes. */
export const useSaveAttendance = (groupId: number, eventId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (presentChildIds: number[]) =>
      apiFetch<Attendance>(path(groupId, eventId), {
        method: 'PUT',
        json: { present_child_ids: presentChildIds },
      }),
    onSuccess: (data) =>
      queryClient.setQueryData(['attendance', groupId, eventId], data),
  })
}
