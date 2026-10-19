import { useState } from 'react'

import type { Group } from '@/api/groups'
import { calendarUrl } from '@/lib/calendarUrl'

import { Modal } from './Modal'

export function SubscribeModal({
  group,
  onClose,
}: {
  group: Group | null
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const url = calendarUrl(group)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Modal title="Suscribirse al calendario" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-slate-600">
          Añade los eventos{' '}
          {group ? (
            <>
              de <strong>{group.name}</strong> (y los generales)
            </>
          ) : (
            'de todos los grupos'
          )}{' '}
          a tu calendario. Se actualiza solo.
        </p>
        <input
          readOnly
          aria-label="Enlace del calendario"
          className="field text-sm"
          value={url}
          onFocus={(e) => e.target.select()}
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={copy}>
            {copied ? '¡Copiado!' : 'Copiar enlace'}
          </button>
          <a className="btn-primary" href={url.replace(/^https?:/, 'webcal:')}>
            Abrir en el calendario
          </a>
        </div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>iPhone o Mac: pulsa «Abrir en el calendario».</li>
          <li>
            Google Calendar: en calendar.google.com, «Otros calendarios» → «+» →
            «Desde URL» y pega el enlace.
          </li>
        </ul>
      </div>
    </Modal>
  )
}
