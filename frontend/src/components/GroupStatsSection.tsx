import { useState } from 'react'

import {
  currentCourse,
  downloadGroupCsv,
  formatRate,
  useGroupStats,
} from '@/api/stats'
import { formatApiDate } from '@/lib/dates'

import { PeriodFilter } from './PeriodFilter'

/** Asistencia de un grupo por evento y por niño, con descarga en CSV. */
export function GroupStatsSection({ groupId }: { groupId: number }) {
  const [period, setPeriod] = useState(currentCourse)
  const { data: stats, error, isPending } = useGroupStats(groupId, period)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const download = () => {
    setDownloadError(null)
    downloadGroupCsv(groupId, period).catch((e: Error) =>
      setDownloadError(e.message),
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PeriodFilter period={period} onChange={setPeriod} />
        <button type="button" className="btn-secondary" onClick={download}>
          Descargar CSV
        </button>
      </div>
      {downloadError && (
        <p role="alert" className="text-brand-700 text-sm">
          No se pudo descargar: {downloadError}
        </p>
      )}

      {isPending && <p className="text-slate-500">Cargando…</p>}
      {error && (
        <p role="alert" className="text-brand-700 text-sm">
          No se pudieron cargar las estadísticas: {error.message}
        </p>
      )}
      {stats && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table
              aria-label="Asistencia por evento"
              className="w-full text-sm"
            >
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2">Evento</th>
                  <th className="px-3 py-2 text-right">Presentes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.events.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-3 py-2 text-slate-500">
                      No hay eventos en estas fechas.
                    </td>
                  </tr>
                )}
                {stats.events.map((e) => (
                  <tr key={e.event_id}>
                    <td className="px-3 py-2">
                      {e.title}{' '}
                      <span className="text-slate-500">
                        · {formatApiDate(e.starts_at)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {e.taken ? (
                        `${e.present} / ${e.present + e.absent}`
                      ) : (
                        <span className="text-slate-400">sin pasar</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table aria-label="Asistencia por niño" className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2">Niño</th>
                  <th className="px-3 py-2 text-right">Asistencias</th>
                  <th className="px-3 py-2 text-right">Faltas</th>
                  <th className="px-3 py-2 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.children.map((c) => (
                  <tr key={c.child_id}>
                    <td className="px-3 py-2">{c.full_name}</td>
                    <td className="px-3 py-2 text-right">{c.present}</td>
                    <td className="px-3 py-2 text-right">{c.absent}</td>
                    <td className="px-3 py-2 text-right">
                      {formatRate(c.rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="text-xs text-slate-500">
        Son datos de menores: no compartas el CSV fuera del equipo de
        catequesis.
      </p>
    </div>
  )
}
