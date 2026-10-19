import { useState, type FormEvent } from 'react'

import { useCreateGroup, useRenameGroup, type Group } from '@/api/groups'

import { Modal } from './Modal'

/** Crear un grupo o renombrarlo (si recibe `group`). */
export function GroupForm({
  group,
  onClose,
}: {
  group?: Group
  onClose: () => void
}) {
  const create = useCreateGroup()
  const rename = useRenameGroup()
  const mutation = group ? rename : create
  const [name, setName] = useState(group?.name ?? '')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const options = { onSuccess: onClose }
    if (group) rename.mutate({ id: group.id, name: name.trim() }, options)
    else create.mutate(name.trim(), options)
  }

  return (
    <Modal title={group ? 'Renombrar grupo' : 'Nuevo grupo'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Nombre</span>
          <input
            className="field"
            required
            maxLength={80}
            placeholder="p. ej. 1º Confirmación A"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        {mutation.error && (
          <p
            role="alert"
            className="bg-brand-50 text-brand-700 rounded-lg p-3 text-sm"
          >
            {mutation.error.message}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
