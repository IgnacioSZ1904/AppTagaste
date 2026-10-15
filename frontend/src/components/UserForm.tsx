import { useState, type FormEvent } from 'react'

import type { Role } from '@/api/auth'
import { useCreateUser } from '@/api/users'
import { ROLE_LABELS, ROLES } from '@/auth/roles'

import { Modal } from './Modal'

export function UserForm({ onClose }: { onClose: () => void }) {
  const create = useCreateUser()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<Role>('monitor')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    create.mutate(
      { email: email.trim(), full_name: fullName.trim(), role },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal title="Añadir usuario" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">
          Usa el email de su cuenta de Google. Al entrar por primera vez tendrá
          ya este rol.
        </p>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            className="field"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Nombre</span>
          <input
            className="field"
            required
            maxLength={120}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Rol</span>
          <select
            className="field"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </label>
        {create.error && (
          <p
            role="alert"
            className="bg-brand-50 text-brand-700 rounded-lg p-3 text-sm"
          >
            {create.error.message}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={create.isPending}
          >
            {create.isPending ? 'Guardando…' : 'Añadir'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
