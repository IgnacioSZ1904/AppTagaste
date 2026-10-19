import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { membersLine, useDeleteGroup, useGroup } from '@/api/groups'
import { useAuth } from '@/auth/context'
import { canManageUsers } from '@/auth/roles'
import { AddChildrenForm } from '@/components/AddChildrenForm'
import { ChildrenList } from '@/components/ChildrenList'
import { GroupForm } from '@/components/GroupForm'
import { MembersEditor } from '@/components/MembersEditor'

export function GroupPage() {
  const id = Number(useParams().id)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: group, error, isPending } = useGroup(id)
  const remove = useDeleteGroup()
  const [renaming, setRenaming] = useState(false)
  const isAdmin = canManageUsers(user)

  if (isPending) return <p className="text-slate-500">Cargando…</p>
  if (error) {
    return (
      <p role="alert" className="bg-brand-50 text-brand-700 rounded-lg p-3">
        No se pudo cargar el grupo: {error.message}
      </p>
    )
  }

  // Los niños solo los ven el admin y los responsables del grupo
  const canManage = isAdmin || group.members.some((m) => m.id === user?.id)

  const handleDelete = () => {
    const children =
      group.children_count === 1 ? '1 niño' : `${group.children_count} niños`
    if (
      window.confirm(
        `¿Borrar el grupo "${group.name}" y sus ${children}? No se puede deshacer.`,
      )
    ) {
      remove.mutate(group.id, { onSuccess: () => navigate('/grupos') })
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="space-y-1">
        <Link to="/grupos" className="text-sm text-slate-500 hover:underline">
          ← {isAdmin ? 'Grupos' : 'Mis grupos'}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-brand-700 text-2xl font-bold">{group.name}</h1>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setRenaming(true)}
              >
                Renombrar
              </button>
              <button
                type="button"
                className="btn-danger"
                disabled={remove.isPending}
                onClick={handleDelete}
              >
                Borrar grupo
              </button>
            </div>
          )}
        </div>
        {remove.error && (
          <p role="alert" className="text-brand-700 text-sm">
            {remove.error.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Responsables</h2>
        {isAdmin ? (
          <MembersEditor group={group} />
        ) : (
          <p className="text-slate-600">
            {membersLine(group.members) || 'Sin responsables asignados'}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Niños ({group.children_count})
        </h2>
        {canManage ? (
          <>
            <ChildrenList groupId={group.id} />
            <AddChildrenForm groupId={group.id} />
            <p className="text-xs text-slate-500">
              Son datos de menores: solo los ven el administrador y los
              responsables del grupo. Se borran al acabar el curso.
            </p>
          </>
        ) : (
          <p className="text-slate-500">
            Solo el administrador y los responsables del grupo ven su lista de
            niños.
          </p>
        )}
      </div>

      {renaming && (
        <GroupForm group={group} onClose={() => setRenaming(false)} />
      )}
    </section>
  )
}
