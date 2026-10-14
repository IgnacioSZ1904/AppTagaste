import { apiFetch } from './client'

export type Role = 'coordinador' | 'monitor'

export type User = {
  id: number
  email: string
  full_name: string
  role: Role
  is_active: boolean
}

type Token = { access_token: string; token_type: string }

export const loginWithGoogle = (credential: string) =>
  apiFetch<Token>('/auth/google', { method: 'POST', json: { credential } })

export const getMe = () => apiFetch<User>('/auth/me')
