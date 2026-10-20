import type { LibraryDocument } from '@/api/documents'

import { Snippet } from './Snippet'

const KIND: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'Word',
}

const size = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`

type Props = {
  doc: LibraryDocument
  /** Mostrar curso y grupo (en los resultados de búsqueda). */
  showFolder: boolean
  activeTags: string[]
  onTag: (tag: string) => void
  onPreview: () => void
  onDownload: () => void
  downloading: boolean
  onEdit: () => void
  onDelete: () => void
}

export function DocumentCard({
  doc,
  showFolder,
  activeTags,
  onTag,
  onPreview,
  onDownload,
  downloading,
  onEdit,
  onDelete,
}: Props) {
  return (
    <li className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold">{doc.title}</p>
          <p className="text-sm text-slate-500">
            {[
              KIND[doc.mime_type] ?? 'Fichero',
              size(doc.size),
              ...(showFolder ? [doc.school_year, doc.group_name] : []),
              doc.created_by && `añadido por ${doc.created_by}`,
              doc.created_at.slice(0, 10).split('-').reverse().join('/'),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary py-1 text-sm"
            aria-label={`Vista previa de ${doc.title}`}
            onClick={onPreview}
          >
            Vista previa
          </button>
          <button
            type="button"
            className="btn-secondary py-1 text-sm"
            aria-label={`Descargar ${doc.title}`}
            disabled={downloading}
            onClick={onDownload}
          >
            {downloading ? 'Descargando…' : 'Descargar'}
          </button>
          {doc.can_edit && (
            <>
              <button
                type="button"
                className="btn-secondary py-1 text-sm"
                aria-label={`Editar ${doc.title}`}
                onClick={onEdit}
              >
                Editar
              </button>
              <button
                type="button"
                className="btn-danger py-1 text-sm"
                aria-label={`Eliminar ${doc.title}`}
                onClick={onDelete}
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>
      {doc.snippet && <Snippet text={doc.snippet} />}
      {doc.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {doc.tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              title={`Filtrar por ${tag.name}`}
              className="event-chip aria-pressed:border-brand-500 aria-pressed:bg-brand-50 aria-pressed:text-brand-700 px-2 py-0.5 text-xs"
              aria-pressed={activeTags.includes(tag.name)}
              onClick={() => onTag(tag.name)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
      {!doc.has_text && (
        <p className="text-xs text-slate-500">
          No se pudo leer su texto: solo se encuentra por título y etiquetas.
        </p>
      )}
    </li>
  )
}
