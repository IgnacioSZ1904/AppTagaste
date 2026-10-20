import { useGoogleLogin } from '@react-oauth/google'
import { useRef, useState } from 'react'

import {
  AddDocumentsModal,
  type PendingFile,
} from '@/components/AddDocumentsModal'
import { LibraryBrowser } from '@/components/library/LibraryBrowser'
import { pickDriveFiles } from '@/lib/googlePicker'

// Solo los ficheros que el usuario elige en el selector (Google no exige verificar la app)
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'

export function LibraryPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<PendingFile[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const driveReady = Boolean(import.meta.env.VITE_GOOGLE_API_KEY)

  const openDrive = useGoogleLogin({
    scope: DRIVE_SCOPE,
    onSuccess: async ({ access_token }) => {
      try {
        const files = await pickDriveFiles(access_token)
        if (files.length > 0) {
          setPending(
            files.map((file) => ({ kind: 'drive', file, token: access_token })),
          )
        }
      } catch (e) {
        setError((e as Error).message)
      }
    },
    onError: () => setError('No se pudo acceder a Google Drive'),
  })

  const handleLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files ?? [])]
    if (files.length > 0)
      setPending(files.map((file) => ({ kind: 'local', file })))
    e.target.value = ''
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-brand-700 text-2xl font-bold">Biblioteca</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary"
            disabled={!driveReady}
            onClick={() => {
              setError(null)
              openDrive()
            }}
          >
            Añadir desde Drive
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => inputRef.current?.click()}
          >
            Subir desde el ordenador
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            data-testid="local-files"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleLocal}
          />
        </div>
      </div>
      {!driveReady && (
        <p className="text-sm text-slate-500">
          Para añadir desde Drive falta configurar{' '}
          <code>VITE_GOOGLE_API_KEY</code> (ver docs/guia.md).
        </p>
      )}
      {error && (
        <p role="alert" className="bg-brand-50 text-brand-700 rounded-lg p-3">
          {error}
        </p>
      )}
      <p className="text-slate-600">
        Recursos de reuniones y convivencias de todos los cursos: PDF, Word y
        Google Docs de hasta 10 MB.
      </p>
      <LibraryBrowser />

      {pending && (
        <AddDocumentsModal files={pending} onClose={() => setPending(null)} />
      )}
    </section>
  )
}
