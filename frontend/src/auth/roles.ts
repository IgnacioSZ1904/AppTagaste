import type { Role, User } from '@/api/auth'

export const ROLES: Role[] = ['admin', 'coordinador', 'monitor', 'usuario']

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  coordinador: 'Coordinador',
  monitor: 'Monitor',
  usuario: 'Usuario',
}

/** Crear, editar y borrar eventos. */
export const canEditEvents = (user: User | null) =>
  user?.role === 'admin' || user?.role === 'coordinador'

/** Gestionar usuarios y roles. */
export const canManageUsers = (user: User | null) => user?.role === 'admin'

/** Ver la sección de grupos: el admin todos, monitores y coordinadores los suyos. */
export const canSeeGroups = (user: User | null) =>
  user?.role === 'admin' ||
  user?.role === 'coordinador' ||
  user?.role === 'monitor'

/** Pasar lista: solo los monitores (en los grupos de los que son responsables). */
export const canTakeAttendance = (user: User | null) => user?.role === 'monitor'

/** Estadísticas de asistencia de todos los grupos. */
export const canSeeStats = (user: User | null) =>
  user?.role === 'admin' || user?.role === 'coordinador'

/** Biblioteca de recursos: ver, abrir y añadir documentos. */
export const canUseLibrary = (user: User | null) =>
  user?.role === 'admin' ||
  user?.role === 'coordinador' ||
  user?.role === 'monitor'
