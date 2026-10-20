import { useQuery } from '@tanstack/react-query'

import { apiFetch, apiFile } from './client'

export type LibraryDocument = {
  id: number
  title: string
  school_year: string
  group_id: number | null
  group_name: string
  filename: string
  mime_type: string
  size: number
  tags: { id: number; name: string }[]
  created_by: string | null
  created_at: string
  /** false: no se pudo sacar el texto (p. ej. PDF escaneado). */
  has_text: boolean
  /** Solo al buscar: trozo del texto con lo encontrado entre <mark> y </mark> (sin escapar). */
  snippet?: string | null
}

export type LibraryFilters = {
  school_years: string[]
  groups: string[]
  tags: { id: number; name: string }[]
}

export type DocumentQuery = {
  schoolYear?: string
  group?: string
  q?: string
  tags?: string[]
}

export const useDocuments = ({
  schoolYear,
  group,
  q,
  tags = [],
}: DocumentQuery) =>
  useQuery({
    queryKey: ['documents', 'list', { schoolYear, group, q, tags }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (schoolYear) params.set('school_year', schoolYear)
      if (group) params.set('group', group)
      if (q) params.set('q', q)
      for (const tag of tags) params.append('tag', tag)
      return apiFetch<LibraryDocument[]>(`/documents?${params}`)
    },
    placeholderData: (previous) => previous,
  })

export const useLibraryFilters = () =>
  useQuery({
    queryKey: ['documents', 'filters'],
    queryFn: () => apiFetch<LibraryFilters>('/documents/filters'),
  })

export const fetchDocumentFile = (id: number) =>
  apiFile(`/documents/${id}/file`)

/** Guarda el fichero con su nombre original. */
export async function downloadDocument(doc: LibraryDocument) {
  const url = URL.createObjectURL(await fetchDocumentFile(doc.id))
  const link = document.createElement('a')
  link.href = url
  link.download = doc.filename
  document.body.append(link)
  link.click()
  link.remove()
  // Se libera después: algunos navegadores aún no han empezado la descarga
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export type DocumentUpload = {
  file: File
  schoolYear: string
  groupId: number
  tags: string
  /** Solo si viene de Drive: evita añadir dos veces el mismo fichero. */
  driveFileId?: string
}

export function uploadDocument(upload: DocumentUpload) {
  const form = new FormData()
  form.append('file', upload.file)
  form.append('school_year', upload.schoolYear)
  form.append('group_id', String(upload.groupId))
  form.append('tags', upload.tags)
  if (upload.driveFileId) form.append('drive_file_id', upload.driveFileId)
  return apiFetch<LibraryDocument>('/documents', { method: 'POST', form })
}

/** "2025-2026": el curso actual (empieza en septiembre) y los 9 anteriores. */
export function schoolYears(today = new Date()): string[] {
  const start =
    today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1
  return Array.from({ length: 10 }, (_, i) => `${start - i}-${start - i + 1}`)
}
