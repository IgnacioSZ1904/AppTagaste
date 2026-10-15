import { useQuery } from '@tanstack/react-query'

import { apiFetch } from './client'

export type Health = { status: string; db: string }

export const getHealth = () => apiFetch<Health>('/health')

export const useHealth = () =>
  useQuery({ queryKey: ['health'], queryFn: getHealth, retry: false })
