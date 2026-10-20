import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { LegalLinks } from './LegalLinks'

type Props = { title: string; updated: string; children: ReactNode }

/** Página pública de texto: se ve con o sin sesión. */
export function LegalLayout({ title, updated, children }: Props) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="border-brand-500 border-b-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/escudo.png" alt="" className="size-10" />
            <span className="text-brand-700 text-lg font-bold">AppTagaste</span>
          </Link>
          <Link to="/" className="btn-secondary px-3 py-1 text-sm">
            Volver
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <article className="legal space-y-4 text-slate-700">
          <h1 className="text-brand-700 text-2xl font-bold">{title}</h1>
          <p className="text-sm text-slate-500">
            Última actualización: {updated}
          </p>
          {children}
        </article>
      </main>
      <footer className="border-t border-slate-200 py-4 text-center">
        <LegalLinks />
      </footer>
    </div>
  )
}
