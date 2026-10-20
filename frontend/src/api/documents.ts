import { apiFetch } from './client'

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
