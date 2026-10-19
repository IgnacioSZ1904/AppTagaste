import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Role } from './auth'
import { apiFetch } from './client'

export type GroupMember = { id: number; full_name: string; role: Role }

export type Group = {
  id: number
  name: string
  members: GroupMember[]
  children_count: number
}

export type Child = { id: number; group_id: number; full_name: string }

/** "Monitores: Ana, Luis · Coordinadores: Marta" (vacío si no tiene responsables). */
export function membersLine(members: GroupMember[]) {
  const names = (role: Role) =>
    members.filter((m) => m.role === role).map((m) => m.full_name)
  return [
    ['Monitores', names('monitor')],
    ['Coordinadores', names('coordinador')],
  ]
    .filter(([, list]) => list.length > 0)
    .map(([label, list]) => `${label}: ${(list as string[]).join(', ')}`)
    .join(' · ')
}

export const useGroups = (enabled = true) =>
  useQuery({
    queryKey: ['groups'],
    queryFn: () => apiFetch<Group[]>('/groups'),
    enabled,
  })

/** Grupos de los que el usuario es responsable. */
export const useMyGroups = (enabled = true) =>
  useQuery({
    queryKey: ['groups', 'mine'],
    queryFn: () => apiFetch<Group[]>('/me/groups'),
    enabled,
  })

export const useGroup = (id: number) =>
  useQuery({
    queryKey: ['groups', id],
    queryFn: () => apiFetch<Group>(`/groups/${id}`),
  })

export const useChildren = (groupId: number, enabled: boolean) =>
  useQuery({
    queryKey: ['groups', groupId, 'children'],
    queryFn: () => apiFetch<Child[]>(`/groups/${groupId}/children`),
    enabled,
  })

/** Tras cualquier cambio se recargan los grupos y los eventos (que muestran sus nombres). */
function useGroupMutation<V, R>(mutationFn: (variables: V) => Promise<R>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['groups'] }),
        queryClient.invalidateQueries({ queryKey: ['events'] }),
      ]),
  })
}

export const useCreateGroup = () =>
  useGroupMutation((name: string) =>
    apiFetch<Group>('/groups', { method: 'POST', json: { name } }),
  )

export const useRenameGroup = () =>
  useGroupMutation(({ id, name }: { id: number; name: string }) =>
    apiFetch<Group>(`/groups/${id}`, { method: 'PATCH', json: { name } }),
  )

export const useDeleteGroup = () =>
  useGroupMutation((id: number) =>
    apiFetch<void>(`/groups/${id}`, { method: 'DELETE' }),
  )

type MemberVars = { groupId: number; userId: number }

export const useAddMember = () =>
  useGroupMutation(({ groupId, userId }: MemberVars) =>
    apiFetch<Group>(`/groups/${groupId}/members`, {
      method: 'POST',
      json: { user_id: userId },
    }),
  )

export const useRemoveMember = () =>
  useGroupMutation(({ groupId, userId }: MemberVars) =>
    apiFetch<void>(`/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
    }),
  )

/** Da de alta varios niños, uno detrás de otro; si alguno falla, dice cuáles faltan. */
export const useAddChildren = () =>
  useGroupMutation(
    async ({ groupId, names }: { groupId: number; names: string[] }) => {
      for (const [i, full_name] of names.entries()) {
        try {
          await apiFetch<Child>(`/groups/${groupId}/children`, {
            method: 'POST',
            json: { full_name },
          })
        } catch (error) {
          const missing = names.slice(i).join(', ')
          throw new Error(
            `No se pudieron añadir: ${missing} (${(error as Error).message})`,
          )
        }
      }
      return names.length
    },
  )

type ChildVars = { groupId: number; id: number }

export const useRenameChild = () =>
  useGroupMutation(
    ({ groupId, id, full_name }: ChildVars & { full_name: string }) =>
      apiFetch<Child>(`/groups/${groupId}/children/${id}`, {
        method: 'PATCH',
        json: { full_name },
      }),
  )

export const useDeleteChild = () =>
  useGroupMutation(({ groupId, id }: ChildVars) =>
    apiFetch<void>(`/groups/${groupId}/children/${id}`, { method: 'DELETE' }),
  )
