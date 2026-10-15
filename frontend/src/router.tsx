import type { RouteObject } from 'react-router'

import { RequireAuth } from '@/auth/RequireAuth'
import { RequireRole } from '@/auth/RequireRole'
import { canManageUsers } from '@/auth/roles'
import { Layout } from '@/components/Layout'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { StatusPage } from '@/pages/StatusPage'
import { UsersPage } from '@/pages/UsersPage'

export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            // FullCalendar pesa: se descarga solo al entrar en el calendario
            lazy: async () => ({
              Component: (await import('@/pages/CalendarPage')).CalendarPage,
            }),
          },
          {
            element: <RequireRole allow={canManageUsers} />,
            children: [{ path: 'usuarios', element: <UsersPage /> }],
          },
          { path: 'estado', element: <StatusPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]
