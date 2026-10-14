import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { getMe, loginWithGoogle } from '@/api/auth'

import { AuthContext } from './context'
import { clearToken, getToken, onUnauthorized, setToken } from './token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setTokenState] = useState(getToken)

  const me = useQuery({
    queryKey: ['me', token],
    queryFn: getMe,
    enabled: token !== null,
  })

  const login = useCallback(async (credential: string) => {
    const { access_token } = await loginWithGoogle(credential)
    setToken(access_token)
    setTokenState(access_token)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setTokenState(null)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => onUnauthorized(logout), [logout])

  const value = useMemo(
    () => ({
      user: me.data ?? null,
      isLoading: token !== null && me.isPending,
      isAuthenticated: token !== null,
      error: me.error,
      login,
      logout,
    }),
    [me.data, me.isPending, me.error, token, login, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
