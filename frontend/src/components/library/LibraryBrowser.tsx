import { useCallback, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'

import {
  downloadDocument,
  useDocuments,
  useLibraryFilters,
  type LibraryDocument,
} from '@/api/documents'
import { groupFolders, newestFirst, yearFolders } from '@/lib/folders'
import { libraryPath } from '@/lib/libraryPath'

import { Breadcrumbs } from './Breadcrumbs'
import { DocumentCard } from './DocumentCard'
import { DocumentPreview } from './DocumentPreview'
import { FolderGrid } from './FolderGrid'
import { LibrarySearch } from './LibrarySearch'

/** Carpetas por curso y grupo, buscador y documentos; todo guardado en la URL. */
export function LibraryBrowser() {
  const { curso, grupo } = useParams()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const tags = params.getAll('tag')
  const searching = q !== '' || tags.length > 0
  const search = params.size > 0 ? `?${params}` : ''

  const docs = useDocuments({ schoolYear: curso, group: grupo, q, tags })
  const filters = useLibraryFilters()
  const [preview, setPreview] = useState<LibraryDocument | null>(null)
  const [downloading, setDownloading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSearch = useCallback(
    (text: string) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (text) next.set('q', text)
          else next.delete('q')
          return next
        },
        { replace: true },
      ),
    [setParams],
  )

  const toggleTag = (tag: string) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      const current = next.getAll('tag')
      next.delete('tag')
      const updated = current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag]
      for (const t of updated) next.append('tag', t)
      return next
    })

  const download = async (doc: LibraryDocument) => {
    setError(null)
    setDownloading(doc.id)
    try {
      await downloadDocument(doc)
    } catch (e) {
      setError(`No se pudo descargar «${doc.title}»: ${(e as Error).message}`)
    } finally {
      setDownloading(null)
    }
  }

  const list = docs.data ?? []
  const folder = curso && grupo ? `${curso} › ${grupo}` : curso

  let content
  if (docs.isPending) {
    content = <p className="text-slate-500">Cargando…</p>
  } else if (docs.isError) {
    content = (
      <p role="alert" className="bg-brand-50 text-brand-700 rounded-lg p-3">
        No se pudo cargar la biblioteca: {docs.error.message}
      </p>
    )
  } else if (list.length === 0) {
    content = (
      <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">
        {searching
          ? 'No hay documentos que coincidan con la búsqueda.'
          : curso
            ? 'Esta carpeta está vacía.'
            : 'Aún no hay documentos. Añade el primero desde Drive o desde tu ordenador.'}
      </p>
    )
  } else if (!searching && !curso) {
    content = (
      <FolderGrid
        label="Cursos"
        folders={yearFolders(list)}
        to={(name) => libraryPath(name)}
      />
    )
  } else if (!searching && !grupo) {
    content = (
      <FolderGrid
        label="Grupos"
        folders={groupFolders(list)}
        to={(name) => libraryPath(curso, name)}
      />
    )
  } else {
    // Con texto, el orden es el de relevancia que da la API
    const shown = q ? list : newestFirst(list)
    content = (
      <>
        {searching && (
          <p className="text-sm text-slate-500">
            {shown.length === 1 ? '1 resultado' : `${shown.length} resultados`}
          </p>
        )}
        <ul aria-label="Documentos" className="space-y-3">
          {shown.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              showFolder={!grupo}
              activeTags={tags}
              onTag={toggleTag}
              onPreview={() => setPreview(doc)}
              onDownload={() => download(doc)}
              downloading={downloading === doc.id}
            />
          ))}
        </ul>
      </>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs year={curso} group={grupo} search={search} />
      <LibrarySearch
        q={q}
        tags={tags}
        allTags={(filters.data?.tags ?? []).map((t) => t.name)}
        onSearch={onSearch}
        onToggleTag={toggleTag}
      />
      {searching && folder && (
        <p className="text-sm text-slate-600">
          Buscando en <strong>{folder}</strong>.{' '}
          <Link
            to={libraryPath() + search}
            className="text-brand-700 font-semibold hover:underline"
          >
            Buscar en toda la biblioteca
          </Link>
        </p>
      )}
      {error && (
        <p role="alert" className="bg-brand-50 text-brand-700 rounded-lg p-3">
          {error}
        </p>
      )}
      {content}
      {preview && (
        <DocumentPreview
          doc={preview}
          onDownload={() => download(preview)}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  )
}
