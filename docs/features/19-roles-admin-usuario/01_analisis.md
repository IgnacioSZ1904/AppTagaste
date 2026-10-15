# Análisis: 19-roles-admin-usuario

## 1. Petición original
> "vamos alla con la 19" → feature 19 del backlog: `roles-admin-usuario` (P0). Cambio de producto del 2026-10-14: sin cuentas de niños; roles admin, coordinador, monitor y usuario.

## 2. Objetivo
Pasar de dos roles (coordinador, monitor) a cuatro: **admin** (todo + gestión de usuarios), **coordinador** (CRUD de eventos), **monitor** y **usuario** (solo ver el calendario). Cualquier cuenta de Google podrá entrar como usuario sin estar dada de alta.

## 3. Estado actual del proyecto
- Features 05, 06 y 07 mergeadas en `develop` (PR #7).
- `Role` = `coordinador` | `monitor`, guardado como `VARCHAR` + check `ck_users_role`.
- Login con Google solo para emails dados de alta (lista blanca) → 403 si no.
- Gestión de usuarios (`/users`) y escritura de eventos: solo coordinador.
- CLI `create-coordinator` para el primer usuario.
- Frontend (07): botones de edición si `role === 'coordinador'` y etiqueta del rol en la cabecera. Se ajusta en la 20 (decisión de Ignacio).

## 4. Alcance
### Dentro de alcance
- `Role` con `admin`, `coordinador`, `monitor`, `usuario`. Migración `0004`: nuevo check y paso de los coordinadores actuales a admin.
- Login con Google: si el email no existe, se crea un usuario con rol `usuario` (nombre de Google). Los desactivados siguen sin poder entrar (403).
- Permisos:
  - `/users` (listar, dar de alta, cambiar rol, activar/desactivar): solo admin.
  - Escritura de eventos: admin y coordinador.
  - Lectura de eventos: cualquier usuario autenticado (incluido `usuario`).
- CLI: `create-admin` en lugar de `create-coordinator`.
- Tests y README.

### Fuera de alcance
- Pantalla de gestión de usuarios y ajustes de roles en el frontend (20).
- Grupos y niños (10), pase de lista (12).

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Hasta la 20, el admin no ve los botones de edición en el frontend (la API sí le deja) | Alta | Bajo | La 20 va justo después; mientras, editar desde `/docs` |
| Cualquiera con Google entra y ve el calendario | — | Medio | Decisión de producto; el admin puede desactivar cuentas |
| Quedarse sin admin | Baja | Alto | No se puede quitar el rol admin ni desactivarse a uno mismo (regla actual) |

## 6. Preguntas abiertas
- [x] ¿Los coordinadores actuales pasan a admin en la migración? → **Sí** (ahora solo está Ignacio).
- [x] ¿Un admin puede nombrar a otros admin? → **Sí**, desde `PATCH /users/{id}`.
- [x] ¿El monitor tiene algún permiso extra ahora? → **No**; de momento ve lo mismo que un usuario. Sus permisos llegan con grupos (10) y pase de lista (12).
- [x] ¿Alta automática como `usuario` activa desde el primer login? → **Sí**, activa; el admin puede desactivarla después.
- [x] ¿Se mantiene `POST /users` para dar de alta por email con un rol (p. ej. un monitor antes de que entre)? → **Sí**.

## 7. Criterios de aceptación
- [x] Un email desconocido entra con Google y queda como `usuario`; puede leer eventos y recibe 403 al escribir o al gestionar usuarios.
- [x] Un usuario desactivado recibe 403 al entrar.
- [x] Admin y coordinador pueden crear, editar y borrar eventos; monitor y usuario no.
- [x] Solo el admin gestiona usuarios; el coordinador recibe 403.
- [x] La migración `0004` convierte los coordinadores en admin, sube y baja sin errores.
- [x] `create-admin` crea el primer admin.
- [x] Tests y ruff en verde en la CI.
