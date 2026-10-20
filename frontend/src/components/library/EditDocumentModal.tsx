import { useState } from 'react'

import {
  schoolYears,
  useUpdateDocument,
  type LibraryDocument,
} from '@/api/documents'
import { useGroups } from '@/api/groups'

import { Modal } from '../Modal'

type Props = { doc: LibraryDocument; onClose: () => void }

/** Cambia título, curso, grupo y etiquetas; el fichero no se toca. */
export function EditDocumentModal({ doc, onClose }: Props) {
  const update = useUpdateDocument()
  const { data: groups } = useGroups()
  // Un curso antiguo que ya no sale en la lista se mantiene como opción
  const years = schoolYears()
  if (!years.includes(doc.school_year)) years.push(doc.school_year)
  const [title, setTitle] = useState(doc.title)
  const [schoolYear, setSchoolYear] = useState(doc.school_year)
  // '' = grupo original borrado: se conserva su nombre si no se elige otro
  const [groupId, setGroupId] = useState(doc.group_id?.toString() ?? '')
  const [tags, setTags] = useState(doc.tags.map((t) => t.name).join(', '))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    update.mutate(
      {
        id: doc.id,
        changes: {
          title: title.trim(),
          school_year: schoolYear,
          group_id: groupId ? Number(groupId) : undefined,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        },
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal title="Editar documento" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="truncate text-sm text-slate-500">{doc.filename}</p>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Título</span>
          <input
            className="field"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
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
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          >
            {doc.group_id === null && (
              <option value="">{doc.group_name} (grupo borrado)</option>
            )}
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
        {update.isError && (
          <p role="alert" className="bg-brand-50 text-brand-700 rounded-lg p-3">
            {update.error.message}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={update.isPending}
          >
            {update.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
