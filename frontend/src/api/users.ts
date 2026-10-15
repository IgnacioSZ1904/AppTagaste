import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Role, User } from './auth'
import { apiFetch } from './client'

export type UserInput = { email: string; full_name: string; role: Role }
export type UserChanges = Partial<Pick<User, 'role' | 'is_active'>>

export const useUsers = () =>
  useQuery({ queryKey: ['users'], queryFn: () => apiFetch<User[]>('/users') })

function useUserMutation<V>(mutationFn: (variables: V) => Promise<User>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export const useCreateUser = () =>
  useUserMutation((data: UserInput) =>
    apiFetch<User>('/users', { method: 'POST', json: data }),
  )

export const useUpdateUser = () =>
  useUserMutation(({ id, changes }: { id: number; changes: UserChanges }) =>
    apiFetch<User>(`/users/${id}`, { method: 'PATCH', json: changes }),
  )
