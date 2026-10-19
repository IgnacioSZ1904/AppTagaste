const KEY = 'apptagaste.group'

/** Grupo elegido en el calendario: un id, "all" (todos) o null si nunca se eligió. */
export type SavedGroup = number | 'all' | null

export function getSavedGroup(): SavedGroup {
  try {
    const value = localStorage.getItem(KEY)
    if (value === null) return null
    return value === 'all' ? 'all' : Number(value)
  } catch {
    return null
  }
}

export function saveGroup(group: number | 'all') {
  try {
    localStorage.setItem(KEY, String(group))
  } catch {
    // Sin almacenamiento (modo privado): se elige de nuevo en cada visita
  }
}
