import { useState, type FormEvent } from 'react'

import { useAddChildren } from '@/api/groups'
import { parseNames } from '@/lib/names'

export function AddChildrenForm({ groupId }: { groupId: number }) {
  const add = useAddChildren()
  const [text, setText] = useState('')
  const [added, setAdded] = useState<number | null>(null)
  const names = parseNames(text)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setAdded(null)
    add.mutate(
      { groupId, names },
      {
        onSuccess: (count) => {
          setText('')
          setAdded(count)
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="block space-y-1">
        <span className="text-sm font-medium">
          Añadir niños (uno por línea)
        </span>
        <textarea
          className="field"
          rows={4}
          placeholder={'Lucía García Pérez\nMarcos Ruiz López'}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="btn-primary"
          disabled={names.length === 0 || add.isPending}
        >
          {add.isPending
            ? 'Añadiendo…'
            : names.length > 1
              ? `Añadir ${names.length} niños`
              : 'Añadir'}
        </button>
        {added !== null && (
          <p role="status" className="text-sm text-slate-600">
            {added === 1 ? 'Añadido 1 niño.' : `Añadidos ${added} niños.`}
          </p>
        )}
      </div>
      {add.error && (
        <p
          role="alert"
          className="bg-brand-50 text-brand-700 rounded-lg p-3 text-sm"
        >
          {add.error.message}
        </p>
      )}
    </form>
  )
}
