# Planificación: 20-gestion-usuarios-frontend

## 1. Enfoque técnico
Primero se centralizan los roles en el frontend (tipo, etiquetas y permisos en un único módulo) para que el admin pueda gestionar eventos. Después, una página `/usuarios` protegida por rol con la lista de usuarios (tabla en escritorio, tarjetas en móvil), búsqueda y filtro en el navegador, cambios de rol y estado que se guardan al momento con TanStack Query y un modal para el alta manual.

## 2. Decisiones de diseño
| Decisión | Alternativas | Justificación |
|----------|--------------|---------------|
| `src/auth/roles.ts` con `ROLE_LABELS` y permisos (`canEditEvents`, `canManageUsers`) | Comparar roles en cada componente | Un solo sitio para cambiar permisos; los componentes preguntan "¿puede?" en vez de "¿qué rol es?" |
| Guard `<RequireRole allow={canManageUsers}>` en la ruta | Comprobarlo dentro de la página | Reutilizable para grupos (10) y pase de lista (12) |
| Enlace "Usuarios" en la navegación solo si `canManageUsers` | Mostrarlo a todos | Evita enlaces que llevan a "No tienes permiso" |
| `useUsers`, `useCreateUser`, `useUpdateUser` en `api/users.ts`, invalidando `['users']` | Estado local | Mismo patrón que eventos |
| Cambios en línea: `<select>` de rol y botón "Activar/Desactivar"; la fila se bloquea mientras guarda | Modal de edición | Decidido en el análisis |
| `window.confirm` al dar/quitar admin y al desactivar | Modal propio | Simple y accesible; ya se usa al borrar eventos |
| Tu propia fila: controles deshabilitados con el texto "(tú)" | Ocultarla | Se ve tu rol y queda claro por qué no se puede tocar |
| Búsqueda (nombre o email, sin tildes ni mayúsculas) y chips de rol, en el navegador | Parámetros en la API | Pocos usuarios; sin cambios en el backend |
| Tabla en `md:` y tarjetas en móvil con el mismo componente de fila | Tabla con scroll horizontal | Legible a 375 px |
| Estado inactivo: fila atenuada y etiqueta "Desactivado" | Ocultar inactivos | El admin necesita verlos para reactivarlos |

## 3. Cambios por módulo
### `frontend/`
- `src/api/auth.ts`: `Role` con 4 valores.
- `src/auth/roles.ts`: `ROLES`, `ROLE_LABELS`, `canEditEvents(user)`, `canManageUsers(user)`.
- `src/auth/RequireRole.tsx`: muestra "No tienes permiso" si no cumple.
- `src/components/Layout.tsx`: etiquetas desde `ROLE_LABELS`; enlace "Usuarios" solo para admin.
- `src/pages/CalendarPage.tsx` y `src/components/EventModal.tsx`: usar `canEditEvents`.
- `src/api/users.ts`: tipos y hooks (`useUsers`, `useCreateUser`, `useUpdateUser`).
- `src/pages/UsersPage.tsx`: cabecera con búsqueda, chips de rol y "Añadir usuario"; lista; contador.
- `src/components/UserRow.tsx`: fila/tarjeta con rol, estado y acciones.
- `src/components/UserForm.tsx`: modal de alta (email, nombre, rol; por defecto `monitor`).
- `src/router.tsx`: ruta `usuarios` bajo `RequireRole`.
- Tests: permisos de eventos por rol, enlace y guard de `/usuarios`, lista con búsqueda y filtro, cambio de rol (PATCH), confirmación al desactivar, propia fila bloqueada, alta (POST) y error 409.

### Backend
- Sin cambios.

### Raíz
- `README.md`: sección de usuarios (gestión desde la web en `/usuarios`).

## 4. Modelo de datos / contratos
Sin cambios. Usa `GET /users`, `POST /users {email, full_name, role}`, `PATCH /users/{id} {role?, is_active?}` → `UserRead {id, email, full_name, role, is_active, created_at}`.

## 5. Plan de pruebas
- Verificación en la nube: lint, tests, build y capturas (escritorio y móvil).
- Manual (Ignacio):
  1. `git pull` de `develop` y rama `feature/20-gestion-usuarios-frontend`.
  2. `npm run dev` con la API levantada; entrar como admin.
  3. "Usuarios" en la navegación; buscar y filtrar.
  4. Dar de alta a alguien como monitor; cambiar su rol; desactivarlo y reactivarlo.
  5. Comprobar que tu fila está bloqueada.
  6. Entrar con otra cuenta (usuario): no ve "Usuarios" ni los botones de eventos; `/usuarios` → "No tienes permiso".
  7. Móvil (375 px); `npm run lint`, `npm test`, `npm run build`; PR con CI en verde.

## 6. Plan de despliegue / migración
- Rama `feature/20-gestion-usuarios-frontend` desde `develop` (la creas tú).
- Sin migraciones. Rollback: revertir el commit.

## 7. Estimación
- Tareas: ~16
- Incertidumbre: baja; la API ya está hecha y probada.
