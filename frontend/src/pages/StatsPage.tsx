import { useState } from 'react'
import { Link } from 'react-router'

import { currentCourse, formatRate, useGroupsStats } from '@/api/stats'
import { PeriodFilter } from '@/components/PeriodFilter'

/** Asistencia de todos los grupos (admin y coordinadores). */
export function StatsPage() {
  const [period, setPeriod] = useState(currentCourse)
  const { data: groups, error, isPending } = useGroupsStats(period)

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-brand-700 text-2xl font-bold">Estadísticas</h1>
      <PeriodFilter period={period} onChange={setPeriod} />

      {isPending && <p className="text-slate-500">Cargando…</p>}
      {error && (
        <p role="alert" className="bg-brand-50 text-brand-700 rounded-lg p-3">
          No se pudieron cargar las estadísticas: {error.message}
        </p>
      )}
      {groups?.length === 0 && (
        <p className="text-slate-500">Aún no hay grupos.</p>
      )}
      {groups && groups.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table aria-label="Asistencia por grupo" className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2">Grupo</th>
                <th className="px-3 py-2 text-right">Niños</th>
                <th className="px-3 py-2 text-right">Listas pasadas</th>
                <th className="px-3 py-2 text-right">Asistencia</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {groups.map((g) => (
                <tr key={g.group_id}>
                  <td className="px-3 py-2">
                    <Link
                      to={`/grupos/${g.group_id}`}
                      className="text-brand-700 hover:underline"
                    >
                      {g.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-right">{g.children_count}</td>
                  <td className="px-3 py-2 text-right">{g.events_taken}</td>
                  <td className="px-3 py-2 text-right">{formatRate(g.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
