import { useQuery } from '@tanstack/react-query'

import { getToken } from '@/auth/token'

import { API_URL, ApiError, apiFetch } from './client'

/** Periodo con fechas "AAAA-MM-DD" (ambas incluidas). */
export type Period = { from: string; to: string }

export type EventStats = {
  event_id: number
  title: string
  starts_at: string
  present: number
  absent: number
  /** false = aún no se ha pasado lista. */
  taken: boolean
}

export type ChildStats = {
  child_id: number
  full_name: string
  present: number
  absent: number
  /** % de asistencia; null si no hay ninguna lista pasada. */
  rate: number | null
}

export type GroupStats = Period & {
  group_id: number
  events: EventStats[]
  children: ChildStats[]
}

export type GroupSummary = {
  group_id: number
  name: string
  children_count: number
  events_taken: number
  rate: number | null
}

export const formatRate = (rate: number | null) =>
  rate === null ? '—' : `${rate} %`

const pad = (n: number) => String(n).padStart(2, '0')
const isoDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** Curso actual: del 1 de septiembre a hoy (igual que la API por defecto). */
export function currentCourse(today = new Date()): Period {
  const year =
    today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1
  return { from: `${year}-09-01`, to: isoDate(today) }
}

export const useGroupsStats = (period: Period) =>
  useQuery({
    queryKey: ['stats', 'groups', period],
    queryFn: () =>
      apiFetch<GroupSummary[]>(`/stats/groups?${new URLSearchParams(period)}`),
  })

export const useGroupStats = (groupId: number, period: Period) =>
  useQuery({
    queryKey: ['stats', groupId, period],
    queryFn: () =>
      apiFetch<GroupStats>(
        `/groups/${groupId}/stats?${new URLSearchParams(period)}`,
      ),
  })

/** Descarga el CSV con el token (un enlace normal no lo enviaría). */
export async function downloadGroupCsv(groupId: number, period: Period) {
  const token = getToken()
  const response = await fetch(
    `${API_URL}/groups/${groupId}/stats.csv?${new URLSearchParams(period)}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  )
  if (!response.ok) {
    throw new ApiError(response.status, `Error ${response.status}`)
  }
  const name =
    /filename="([^"]+)"/.exec(
      response.headers.get('Content-Disposition') ?? '',
    )?.[1] ?? 'asistencia.csv'
  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}
