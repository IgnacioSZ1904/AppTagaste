import { useEffect, type ReactNode } from 'react'

type Props = {
  title: string
  onClose: () => void
  children: ReactNode
  /** wide: para vistas previas de documentos. */
  size?: 'normal' | 'wide'
}

export function Modal({ title, onClose, children, size = 'normal' }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`border-brand-500 max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border-t-4 bg-white p-5 shadow-xl sm:rounded-2xl ${size === 'wide' ? 'sm:max-w-4xl' : 'sm:max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-brand-700 text-xl font-bold">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            className="rounded p-1 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
