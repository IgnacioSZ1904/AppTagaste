import { describe, expect, it } from 'vitest'

import type { LibraryDocument } from '@/api/documents'

import { groupFolders, newestFirst, yearFolders } from './folders'

const doc = (
  id: number,
  school_year: string,
  group_name: string,
  created_at = '2026-10-01T10:00:00Z',
) => ({ id, school_year, group_name, created_at }) as LibraryDocument

const docs = [
  doc(1, '2024-2025', 'Confirmación B'),
  doc(2, '2025-2026', 'Confirmación B', '2026-10-03T10:00:00Z'),
  doc(3, '2025-2026', 'Confirmación A', '2026-10-02T10:00:00Z'),
  doc(4, '2025-2026', 'Confirmación B'),
]

describe('carpetas', () => {
  it('cursos del más reciente al más antiguo, con su número de documentos', () => {
    expect(yearFolders(docs)).toEqual([
      { name: '2025-2026', count: 3 },
      { name: '2024-2025', count: 1 },
    ])
  })

  it('grupos por orden alfabético', () => {
    expect(groupFolders(docs)).toEqual([
      { name: 'Confirmación A', count: 1 },
      { name: 'Confirmación B', count: 3 },
    ])
  })

  it('documentos más recientes primero', () => {
    expect(newestFirst(docs).map((d) => d.id)).toEqual([2, 3, 1, 4])
  })
})
