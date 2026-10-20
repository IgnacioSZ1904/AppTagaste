import { useEffect, useRef, useState } from 'react'

import { fetchDocumentFile, type LibraryDocument } from '@/api/documents'

import { Modal } from '../Modal'

type Props = {
  doc: LibraryDocument
  onDownload: () => void
  onClose: () => void
}

/** PDF con el visor del navegador; Word convertido a página con docx-preview. */
export function DocumentPreview({ doc, onDownload, onClose }: Props) {
  const wordRef = useRef<HTMLDivElement>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')
  const isPdf = doc.mime_type === 'application/pdf'

  useEffect(() => {
    let cancelled = false
    let url: string | null = null
    ;(async () => {
      try {
        const blob = await fetchDocumentFile(doc.id)
        if (cancelled) return
        if (isPdf) {
          url = URL.createObjectURL(
            new Blob([blob], { type: 'application/pdf' }),
          )
          setPdfUrl(url)
        } else {
          // docx-preview pesa: solo se descarga al previsualizar un Word
          const { renderAsync } = await import('docx-preview')
          if (cancelled || !wordRef.current) return
          await renderAsync(blob, wordRef.current, undefined, {
            inWrapper: false,
            ignoreLastRenderedPageBreak: true,
          })
        }
        if (!cancelled) setState('ready')
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message)
          setState('error')
        }
      }
    })()
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [doc.id, isPdf])

  return (
    <Modal title={doc.title} onClose={onClose} size="wide">
      <div className="flex h-[70dvh] flex-col gap-3">
        {state === 'loading' && (
          <p className="text-slate-500">Cargando vista previa…</p>
        )}
        {state === 'error' && (
          <p role="alert" className="bg-brand-50 text-brand-700 rounded-lg p-3">
            No se pudo mostrar la vista previa: {error}. Prueba a descargarlo.
          </p>
        )}
        {isPdf ? (
          pdfUrl && (
            <iframe
              title={`Vista previa de ${doc.title}`}
              src={pdfUrl}
              className="min-h-0 w-full flex-1 rounded border border-slate-200"
            />
          )
        ) : (
          <div
            ref={wordRef}
            data-testid="word-preview"
            className="docx-preview min-h-0 flex-1 overflow-auto rounded border border-slate-200 bg-white p-4"
          />
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button type="button" className="btn-primary" onClick={onDownload}>
            Descargar
          </button>
        </div>
      </div>
    </Modal>
  )
}
