import { createContext, use } from 'react'

import type { User } from '@/api/auth'

export type AuthState = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: Error | null
  login: (credential: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
  const auth = use(AuthContext)
  if (!auth) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return auth
}
