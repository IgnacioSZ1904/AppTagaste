import type { RouteObject } from 'react-router'

import { RequireAuth } from '@/auth/RequireAuth'
import { RequireRole } from '@/auth/RequireRole'
import {
  canManageUsers,
  canSeeGroups,
  canSeeStats,
  canUseLibrary,
} from '@/auth/roles'
import { Layout } from '@/components/Layout'
import { AttendancePage } from '@/pages/AttendancePage'
import { GroupPage } from '@/pages/GroupPage'
import { GroupsPage } from '@/pages/GroupsPage'
import { LibraryPage } from '@/pages/LibraryPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { StatsPage } from '@/pages/StatsPage'
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
            element: (
              <RequireRole
                allow={canSeeGroups}
                message="Esta sección es para monitores, coordinadores y administradores."
              />
            ),
            children: [
              { path: 'grupos', element: <GroupsPage /> },
              { path: 'grupos/:id', element: <GroupPage /> },
              {
                path: 'grupos/:id/eventos/:eventId/lista',
                element: <AttendancePage />,
              },
            ],
          },
          {
            element: (
              <RequireRole
                allow={canUseLibrary}
                message="La biblioteca es para monitores, coordinadores y administradores."
              />
            ),
            children: [{ path: 'biblioteca', element: <LibraryPage /> }],
          },
          {
            element: (
              <RequireRole
                allow={canSeeStats}
                message="Las estadísticas son para coordinadores y administradores."
              />
            ),
            children: [{ path: 'estadisticas', element: <StatsPage /> }],
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
