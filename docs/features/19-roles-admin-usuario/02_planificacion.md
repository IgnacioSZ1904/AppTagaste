# Planificación: 19-roles-admin-usuario

## 1. Enfoque técnico
Ampliar el `Role` existente y ajustar los permisos con `require_role`, sin tocar el flujo de tokens. El cambio de lista blanca a alta automática vive en `services/users.login_with_google`. Una migración de datos convierte los coordinadores actuales en admin.

## 2. Decisiones de diseño
| Decisión | Alternativas | Justificación |
|----------|--------------|---------------|
| Cuatro valores en el mismo `Role` (VARCHAR + check) | Tabla de roles / permisos por recurso | Pocos roles y fijos; ya estaba previsto que añadir uno fuese una migración sencilla |
| Alias de dependencia `Admin` y `EventEditor` (admin o coordinador) en `api/deps.py` | Repetir `require_role(...)` en cada router | Un único sitio para saber quién puede qué |
| Alta automática con rol `usuario` y el nombre de Google (si no viene, la parte del email antes de `@`) | Pedir el nombre en el frontend | Sin pasos extra para quien solo quiere ver el calendario |
| Se mantiene el 403 para cuentas desactivadas; nuevo mensaje "Tu cuenta está desactivada" | Borrar la cuenta | El admin puede bloquear a alguien sin perder el registro |
| Migración `0004`: nuevo check con los 4 roles y `UPDATE` coordinador → admin. Bajada: admin → coordinador y usuario → monitor | Bajada que borra usuarios | La bajada no pierde datos ni da permisos de más |
| CLI `create-admin` sustituye a `create-coordinator` | Mantener los dos | Solo hace falta para el primer admin; los demás roles se asignan desde `/users` |
| Se mantienen las reglas de `PATCH /users/{id}` (no cambiar el rol propio ni desactivarse) | Contar admins | Garantiza que siempre queda al menos un admin |

## 3. Cambios por módulo
### `backend/app/`
- `models/user.py`: `Role.ADMIN`, `Role.USUARIO`.
- `api/deps.py`: `Admin` y `EventEditor`.
- `api/v1/endpoints/users.py`: usar `Admin`.
- `api/v1/endpoints/events.py`: usar `EventEditor`.
- `api/v1/endpoints/auth.py`: mensaje de cuenta desactivada.
- `services/users.py`: `login_with_google` crea el usuario si no existe; `UserNotAllowedError` pasa a `UserInactiveError`.
- `cli.py`: `create-admin`.

### `backend/`
- Migración `0004_roles_admin_usuario` (a mano: cambia el check y migra datos).
- `tests/`: alta automática, desactivado, permisos de los 4 roles en `/users` y `/events`; `make_user` sigue igual.

### Raíz
- `README.md`: roles, `create-admin` y tabla de endpoints actualizada.

## 4. Modelo de datos / contratos
Tabla `users`: sin columnas nuevas; check `ck_users_role` con `admin`, `coordinador`, `monitor`, `usuario`.

| Método y ruta | Quién (antes → ahora) |
|---------------|-----------------------|
| `POST /api/v1/auth/google` | Público; email desconocido: 403 → **alta como `usuario`**; desactivado: 403 |
| `GET /api/v1/auth/me` | Autenticado |
| `GET/POST /api/v1/users`, `PATCH /api/v1/users/{id}` | Coordinador → **Admin** |
| `GET /api/v1/events`, `GET /api/v1/events/{id}` | Autenticado (incluye `usuario`) |
| `POST/PATCH/DELETE /api/v1/events…` | Coordinador → **Admin o coordinador** |

## 5. Plan de pruebas
- Login: email desconocido → 200 y usuario creado con rol `usuario` y nombre de Google; segundo login reutiliza la cuenta; desactivado → 403.
- Permisos: matriz de los 4 roles contra `/users` (solo admin) y escritura de `/events` (admin y coordinador).
- Un admin nombra a otro admin; no puede quitarse el rol a sí mismo.
- Migración `0004`: sube con un coordinador existente y queda admin; baja y vuelve a subir.
- Verificación en la nube con Postgres 16 antes de pasarte los ficheros.
- Manual (Ignacio): `alembic upgrade head` y comprobar que pasas a admin (`/auth/me`), login con otra cuenta de Google → entra como usuario y solo ve el calendario.

## 6. Plan de despliegue / migración
- Rama `feature/19-roles-admin-usuario` desde `develop`.
- `docker compose up --build -d` y `alembic upgrade head`.
- Rollback: `alembic downgrade 0003` y revertir el commit.
- Hasta la 20, en el frontend el admin no ve los botones de edición (decidido).

## 7. Estimación
- Tareas: ~10
- Incertidumbre: baja.
