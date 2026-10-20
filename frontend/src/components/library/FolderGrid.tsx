import { Link } from 'react-router'

import type { Folder } from '@/lib/folders'

type Props = { label: string; folders: Folder[]; to: (name: string) => string }

export function FolderGrid({ label, folders, to }: Props) {
  return (
    <ul aria-label={label} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {folders.map((folder) => (
        <li key={folder.name}>
          <Link
            to={to(folder.name)}
            className="hover:border-brand-500 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="text-brand-500 size-8 shrink-0"
              fill="currentColor"
            >
              <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h4.2l2 2.2h6.8A2.5 2.5 0 0 1 21 8.7v8.8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z" />
            </svg>
            <span className="min-w-0">
              <span className="block truncate font-semibold">
                {folder.name}
              </span>
              <span className="block text-sm text-slate-500">
                {folder.count === 1
                  ? '1 documento'
                  : `${folder.count} documentos`}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
