import { API_URL } from '@/api/client'
import type { Group } from '@/api/groups'

/** URL pública del iCal: la del grupo (sus eventos y los generales) o la de todos. */
export function calendarUrl(group: Group | null) {
  const url = new URL(`${API_URL}/calendar.ics`, window.location.origin)
  if (group) url.searchParams.set('group_id', String(group.id))
  return url.toString()
}
