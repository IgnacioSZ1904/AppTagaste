import type { Role, User } from '@/api/auth'
import { useUpdateUser, type UserChanges } from '@/api/users'
import { ROLE_LABELS, ROLES } from '@/auth/roles'

type Props = { user: User; isSelf: boolean }

/** Pregunta antes de los cambios delicados: dar o quitar admin y desactivar. */
function confirmChange(user: User, changes: UserChanges) {
  if (changes.is_active === false) {
    return window.confirm(
      `¿Desactivar a ${user.full_name}? No podrá entrar en la app.`,
    )
  }
  if (changes.role === 'admin' || (changes.role && user.role === 'admin')) {
    const action = changes.role === 'admin' ? 'dar' : 'quitar'
    return window.confirm(
      `¿Seguro que quieres ${action} el rol de administrador a ${user.full_name}?`,
    )
  }
  return true
}

/** Usuario como fila de tabla (escritorio) o tarjeta (móvil). */
export function UserRow({ user, isSelf }: Props) {
  const update = useUpdateUser()
  const disabled = isSelf || update.isPending

  const change = (changes: UserChanges) => {
    if (confirmChange(user, changes)) update.mutate({ id: user.id, changes })
  }

  return (
    <li
      className={`grid gap-2 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-[2fr_2fr_10rem_9rem] md:items-center md:rounded-none md:border-0 md:border-b md:p-3 ${user.is_active ? '' : 'opacity-60'}`}
    >
      <div className="min-w-0">
        <p className="truncate font-medium">
          {user.full_name}
          {isSelf && <span className="ml-1 text-sm text-slate-500">(tú)</span>}
        </p>
        {!user.is_active && (
          <span className="text-brand-700 text-xs font-medium">
            Desactivado
          </span>
        )}
      </div>
      <p className="truncate text-sm text-slate-600">{user.email}</p>
      <label className="flex items-center gap-2 md:block">
        <span className="text-sm text-slate-500 md:sr-only">Rol</span>
        <select
          aria-label={`Rol de ${user.full_name}`}
          className="field py-1"
          value={user.role}
          disabled={disabled}
          onChange={(e) => change({ role: e.target.value as Role })}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </label>
      <div className="md:text-right">
        <button
          type="button"
          className={
            user.is_active
              ? 'btn-danger py-1 text-sm'
              : 'btn-secondary py-1 text-sm'
          }
          disabled={disabled}
          onClick={() => change({ is_active: !user.is_active })}
        >
          {user.is_active ? 'Desactivar' : 'Activar'}
        </button>
      </div>
      {update.error && (
        <p role="alert" className="text-brand-700 text-sm md:col-span-4">
          {update.error.message}
        </p>
      )}
    </li>
  )
}
