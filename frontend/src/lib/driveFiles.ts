// Descarga de ficheros de Drive desde el navegador: el token nunca llega a nuestra API.

export const GOOGLE_DOC = 'application/vnd.google-apps.document'
export const DOCX =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
export const PDF = 'application/pdf'

/** Tipos que se pueden elegir en el selector. */
export const DRIVE_MIME_TYPES = [GOOGLE_DOC, PDF, DOCX]

export type DriveFile = { id: string; name: string; mimeType: string }

const API = 'https://www.googleapis.com/drive/v3/files'

/** Los Google Docs se exportan a .docx; los PDF y Word se descargan tal cual. */
export async function downloadDriveFile(
  file: DriveFile,
  token: string,
): Promise<File> {
  const isDoc = file.mimeType === GOOGLE_DOC
  const url = isDoc
    ? `${API}/${file.id}/export?mimeType=${encodeURIComponent(DOCX)}`
    : `${API}/${file.id}?alt=media`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(`No se pudo descargar de Drive (error ${response.status})`)
  }
  const name =
    isDoc && !file.name.toLowerCase().endsWith('.docx')
      ? `${file.name}.docx`
      : file.name
  return new File([await response.blob()], name, {
    type: isDoc ? DOCX : file.mimeType,
  })
}
