import { afterEach, describe, expect, it, vi } from 'vitest'

import { DOCX, downloadDriveFile, GOOGLE_DOC, PDF } from './driveFiles'

describe('Descarga de Drive', () => {
  afterEach(() => vi.restoreAllMocks())

  it('exporta un Google Doc a .docx con el token', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('docx'))

    const file = await downloadDriveFile(
      { id: 'doc1', name: 'Reunión', mimeType: GOOGLE_DOC },
      'token-drive',
    )

    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toBe(
      `https://www.googleapis.com/drive/v3/files/doc1/export?mimeType=${encodeURIComponent(DOCX)}`,
    )
    expect(init?.headers).toEqual({ Authorization: 'Bearer token-drive' })
    expect(file.name).toBe('Reunión.docx')
    expect(file.type).toBe(DOCX)
  })

  it('descarga un PDF tal cual', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('%PDF'))

    const file = await downloadDriveFile(
      { id: 'pdf1', name: 'Dinámica.pdf', mimeType: PDF },
      't',
    )

    expect(String(fetchMock.mock.calls[0][0])).toBe(
      'https://www.googleapis.com/drive/v3/files/pdf1?alt=media',
    )
    expect(file.name).toBe('Dinámica.pdf')
  })

  it('avisa si Drive falla', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 404 }),
    )

    await expect(
      downloadDriveFile({ id: 'x', name: 'x.pdf', mimeType: PDF }, 't'),
    ).rejects.toThrow('No se pudo descargar de Drive (error 404)')
  })
})
