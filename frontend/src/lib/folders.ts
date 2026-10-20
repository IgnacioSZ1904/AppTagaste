import type { LibraryDocument } from '@/api/documents'

export type Folder = { name: string; count: number }

function countBy(docs: LibraryDocument[], key: (d: LibraryDocument) => string) {
  const counts = new Map<string, number>()
  for (const doc of docs) counts.set(key(doc), (counts.get(key(doc)) ?? 0) + 1)
  return [...counts].map(([name, count]) => ({ name, count }))
}

/** Una carpeta por curso, del más reciente al más antiguo ("2025-2026" se ordena como texto). */
export const yearFolders = (docs: LibraryDocument[]): Folder[] =>
  countBy(docs, (d) => d.school_year).sort((a, b) =>
    b.name.localeCompare(a.name),
  )

/** Una carpeta por grupo, por orden alfabético. */
export const groupFolders = (docs: LibraryDocument[]): Folder[] =>
  countBy(docs, (d) => d.group_name).sort((a, b) =>
    a.name.localeCompare(b.name, 'es'),
  )

/** Los más recientes primero. */
export const newestFirst = (docs: LibraryDocument[]) =>
  [...docs].sort((a, b) => b.created_at.localeCompare(a.created_at))
