import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { ApiError } from '@/api/client'
import { schoolYears, uploadDocument } from '@/api/documents'
import { useGroups } from '@/api/groups'
import { downloadDriveFile, type DriveFile } from '@/lib/driveFiles'

import { Modal } from './Modal'

/** Fichero elegido: del ordenador o de Drive (se descarga al añadirlo). */
export type PendingFile =
  | { kind: 'local'; file: File }
  | { kind: 'drive'; file: DriveFile; token: string }

type Status =
  | { state: 'waiting' }
  | { state: 'uploading' }
  | { state: 'done' }
  | { state: 'error'; message: string }

const STATUS_LABELS = {
  waiting: '',
  uploading: 'Añadiendo…',
  done: 'Añadido',
} as const

export function AddDocumentsModal({
  files,
  onClose,
}: {
  files: PendingFile[]
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const years = schoolYears()
  const { data: groups } = useGroups()
  const [schoolYear, setSchoolYear] = useState(years[0])
  const [groupId, setGroupId] = useState('')
  const [tags, setTags] = useState('')
  const [statuses, setStatuses] = useState<Status[]>(() =>
    files.map(() => ({ state: 'waiting' })),
  )
  const [running, setRunning] = useState(false)
  const finished = statuses.every((s) => s.state === 'done')
  const failed = statuses.some((s) => s.state === 'error')

  const setStatus = (i: number, status: Status) =>
    setStatuses((current) => current.map((s, j) => (j === i ? status : s)))

  // Uno detrás de otro: así cada fichero muestra su resultado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRunning(true)
    for (const [i, pending] of files.entries()) {
      if (statuses[i].state === 'done') continue
      setStatus(i, { state: 'uploading' })
      try {
        const file =
          pending.kind === 'local'
            ? pending.file
            : await downloadDriveFile(pending.file, pending.token)
        await uploadDocument({
          file,
          schoolYear,
          groupId: Number(groupId),
          tags,
          driveFileId: pending.kind === 'drive' ? pending.file.id : undefined,
        })
        setStatus(i, { state: 'done' })
      } catch (error) {
        setStatus(i, {
          state: 'error',
          message:
            error instanceof ApiError || error instanceof Error
              ? error.message
              : 'Error desconocido',
        })
      }
    }
    setRunning(false)
    await queryClient.invalidateQueries({ queryKey: ['documents'] })
  }

  return (
    <Modal title="Añadir a la biblioteca" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <ul aria-label="Ficheros" className="divide-y rounded-lg border">
          {files.map((pending, i) => {
            const status = statuses[i]
            return (
              <li key={i} className="space-y-0.5 px-3 py-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="truncate">{pending.file.name}</span>
                  {status.state !== 'error' && (
                    <span
                      className={
                        status.state === 'done'
                          ? 'text-green-700'
                          : 'text-slate-500'
                      }
                    >
                      {STATUS_LABELS[status.state]}
                    </span>
                  )}
                </div>
                {status.state === 'error' && (
                  <p role="alert" className="text-brand-700">
                    {status.message}
                  </p>
                )}
              </li>
            )
          })}
        </ul>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Curso escolar</span>
          <select
            className="field"
            value={schoolYear}
            onChange={(e) => setSchoolYear(e.target.value)}
          >
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Grupo</span>
          <select
            className="field"
            required
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          >
            <option value="">Elige un grupo</option>
            {groups?.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Etiquetas</span>
          <input
            className="field"
            placeholder="perdón, amistad, oración"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <span className="text-xs text-slate-500">Separadas por comas.</span>
        </label>
        <p className="text-xs text-slate-500">
          Los documentos son de solo lectura: súbelos terminados. Se guarda una
          copia, así que no se pierden aunque los borres de Drive.
        </p>

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {finished ? 'Cerrar' : 'Cancelar'}
          </button>
          {!finished && (
            <button type="submit" className="btn-primary" disabled={running}>
              {failed
                ? 'Reintentar'
                : files.length === 1
                  ? 'Añadir'
                  : `Añadir ${files.length}`}
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}
