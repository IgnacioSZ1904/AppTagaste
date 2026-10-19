# Planificación: 10-grupos-gestion

> Estado: aprobada (2026-10-19)
> Basado en: 01_analisis.md (preguntas abiertas resueltas el 2026-10-19)

## 1. Modelo de datos (migración `0005_grupos`)
- `groups`: `id`, `name` (VARCHAR 80, único), `created_at`.
- `group_members`: `group_id` (FK, `ON DELETE CASCADE`), `user_id` (FK, `ON DELETE CASCADE`), clave primaria compuesta. Son los **responsables** del grupo (monitores o coordinadores).
- `children`: `id`, `group_id` (FK, `ON DELETE CASCADE`, índice), `full_name` (VARCHAR 120), `created_at`.

Borrar un grupo borra sus responsables asignados y sus niños; borrar un usuario lo quita de los grupos.

## 2. Permisos
| Acción | Quién |
|--------|-------|
| Ver grupos y sus responsables | Cualquier usuario con sesión |
| Crear, renombrar y borrar grupos; añadir y quitar responsables | Admin |
| Ver, añadir, editar y borrar niños de un grupo | Admin y responsables de ese grupo |

- "Responsable" = está en `group_members` **y** su rol actual es monitor o coordinador. Si el admin le cambia el rol a `usuario`, pierde el acceso aunque siga en la tabla.
- Solo se pueden asignar usuarios con rol monitor o coordinador (si no, 422).

## 3. API (`/api/v1`)
| Método y ruta | Respuesta |
|---------------|-----------|
| `GET /groups` | Lista de grupos con responsables (`id`, `full_name`, `role`) y número de niños |
| `GET /groups/{id}` | Un grupo |
| `POST /groups` `{name}` | 201; nombre repetido → 409 |
| `PATCH /groups/{id}` `{name}` | Renombrar; repetido → 409 |
| `DELETE /groups/{id}` | 204 |
| `POST /groups/{id}/members` `{user_id}` | 201; rol no válido → 422; ya asignado → 409 |
| `DELETE /groups/{id}/members/{user_id}` | 204 |
| `GET /groups/{id}/children` | Niños ordenados por nombre |
| `POST /groups/{id}/children` `{full_name}` | 201 |
| `PATCH /groups/{id}/children/{child_id}` `{full_name}` | 200 |
| `DELETE /groups/{id}/children/{child_id}` | 204 |
| `GET /me/groups` | Grupos de los que soy responsable |

## 4. Código
- `models/group.py` (`Group`, `group_members`, `Child`), `schemas/group.py`, `services/groups.py`, `api/v1/endpoints/groups.py`.
- Dependencia `GroupManager` en `deps.py`: carga el grupo (404) y comprueba admin o responsable (403).
- `GET /me/groups` en el router de usuarios o auth, junto a `/auth/me`.

## 5. Tests
- `test_groups.py`: CRUD de grupos, nombre repetido, asignar y quitar responsables (rol válido e inválido), niños, borrado en cascada, `/me/groups`.
- `test_roles.py`: añadir los endpoints nuevos a la matriz de permisos (admin, coordinador, monitor, usuario; responsable y no responsable).
- Migración: `alembic upgrade head` y `downgrade -1` sin errores; `alembic check` limpio.

## 6. Documentación
- README: sección "Grupos" con la tabla de permisos y la nota de privacidad.
- BACKLOG: añadir `21 grupos-frontend` (hilo de frontend).
