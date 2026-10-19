import { useState } from 'react'

import type { User } from '@/api/auth'
import { useGroups, useMyGroups } from '@/api/groups'
import { getSavedGroup, saveGroup, type SavedGroup } from '@/lib/selectedGroup'

/**
 * Grupo del calendario: el último elegido; si nunca se eligió, el primer grupo
 * propio para monitores y coordinadores, o "Todos" para el resto.
 */
export function useCalendarGroup(user: User | null) {
  const [saved, setSaved] = useState<SavedGroup>(getSavedGroup)
  const { data: groups = [], isSuccess } = useGroups()
  const isResponsible = user?.role === 'monitor' || user?.role === 'coordinador'
  const { data: mine } = useMyGroups(saved === null && isResponsible)

  let groupId = saved === 'all' ? null : (saved ?? mine?.[0]?.id ?? null)
  // Un grupo guardado que ya no existe vuelve a "Todos"
  if (groupId !== null && isSuccess && !groups.some((g) => g.id === groupId)) {
    groupId = null
  }

  const select = (id: number | null) => {
    const value = id ?? 'all'
    saveGroup(value)
    setSaved(value)
  }

  return {
    groups,
    groupId,
    group: groups.find((g) => g.id === groupId) ?? null,
    select,
  }
}
