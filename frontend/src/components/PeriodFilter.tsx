import type { Period } from '@/api/stats'

/** Filtro de fechas "desde" y "hasta" (ambas incluidas). */
export function PeriodFilter({
  period,
  onChange,
}: {
  period: Period
  onChange: (period: Period) => void
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <label className="space-y-1 text-sm">
        <span className="text-slate-600">Desde</span>
        <input
          type="date"
          className="field"
          value={period.from}
          max={period.to}
          onChange={(e) =>
            e.target.value && onChange({ ...period, from: e.target.value })
          }
        />
      </label>
      <label className="space-y-1 text-sm">
        <span className="text-slate-600">Hasta</span>
        <input
          type="date"
          className="field"
          value={period.to}
          min={period.from}
          onChange={(e) =>
            e.target.value && onChange({ ...period, to: e.target.value })
          }
        />
      </label>
    </div>
  )
}
