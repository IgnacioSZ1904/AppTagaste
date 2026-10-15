# Tareas pendientes: 20-gestion-usuarios-frontend

> Estado: ✅ Completada (falta PR y merge)
> Última actualización: 2026-10-15

## Bloque 1 — Preparación
- [ ] T1.1 (manual, Ignacio) — `git checkout develop; git pull; git checkout -b feature/20-gestion-usuarios-frontend`

## Bloque 2 — Implementación
- [x] T2.1 — Tipo `Role` con los 4 roles (`api/auth.ts`)
- [x] T2.2 — `auth/roles.ts`: `ROLES`, `ROLE_LABELS`, `canEditEvents`, `canManageUsers`
- [x] T2.3 — Calendario y modal: editan admin y coordinador (`canEditEvents`)
- [x] T2.4 — `RequireRole` (pantalla "No tienes permiso")
- [x] T2.5 — `Layout`: enlace "Usuarios" solo para admin y etiqueta de los 4 roles
- [x] T2.6 — `api/users.ts`: `useUsers`, `useCreateUser`, `useUpdateUser`
- [x] T2.7 — `UserRow`: rol en desplegable, Activar/Desactivar, confirmaciones, fila propia bloqueada
- [x] T2.8 — `UsersPage`: búsqueda sin tildes, chips de rol, tabla en escritorio y tarjetas en móvil
- [x] T2.9 — `UserForm`: alta manual (email, nombre, rol; por defecto monitor) y error 409
- [x] T2.10 — Ruta `/usuarios` bajo `RequireRole`
- [x] T2.11 — Tests (permisos por rol, enlace y guard, búsqueda/filtro, PATCH, confirmación, fila propia, POST y 409)

## Bloque 3 — Pruebas (manual, Ignacio)
- [x] T3.1 — `npm run dev` con la API levantada; entrar como admin → "Usuarios"
- [x] T3.2 — Cambiar el rol de una cuenta, desactivarla y reactivarla
- [x] T3.3 — Añadir un usuario a mano; repetir el email → error
- [x] T3.4 — Con una cuenta usuario/monitor: sin enlace, `/usuarios` → "No tienes permiso", sin botones de edición
- [x] T3.5 — Móvil (375 px) en DevTools
- [x] T3.6 — `npm run lint`, `npm test`, `npm run build`
- [ ] T3.7 — Push y PR a `develop` → CI en verde

## Bloque 4 — Documentación
- [x] T4.1 — README: sección de gestión de usuarios
- [x] T4.2 — Devlog, lecciones y BACKLOG
- [ ] T4.3 (manual, Ignacio) — Merge de la PR
