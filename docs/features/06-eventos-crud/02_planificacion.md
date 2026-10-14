# Planificación: 06-eventos-crud

## 1. Enfoque técnico
Mismo patrón que usuarios (05): modelo SQLAlchemy + migración Alembic, esquemas Pydantic, lógica en `services/events.py` y router fino en `api/v1/endpoints/events.py`. Lectura para cualquier `CurrentUser`; escritura con `require_role(Role.COORDINADOR)`.

## 2. Decisiones de diseño
| Decisión | Alternativas | Justificación |
|----------|--------------|---------------|
| `EventType` StrEnum en `VARCHAR` + check | Enum nativo / tabla de tipos | Igual que `Role`; añadir un tipo es una migración sencilla |
| `starts_at` y `ends_at` obligatorios, `TIMESTAMPTZ` | Fecha + duración / día completo | Tu respuesta: siempre rango de inicio y fin; con zona para que el iCal (09) salga bien |
| La API usa hora de España en formato simple de 24 h (`2026-11-13 17:00`) al enviar y al recibir; si llega con zona, se convierte (cambio pedido por Ignacio tras las pruebas) | Exigir ISO con zona | Todas las reuniones son en España; más legible. La BD sigue guardando `TIMESTAMPTZ` |
| Check en BD `ends_at > starts_at` además de validar en Pydantic | Solo Pydantic | La BD protege también ante errores en el código |
| Filtro por rango = eventos que **se solapan** con `[from, to)` | Solo los que empiezan dentro | Una convivencia que empieza el 30 debe salir en el mes siguiente |
| `created_by_id` FK a `users` con `ON DELETE SET NULL` | Sin autor | Saber quién lo creó; los usuarios no se borran, pero no bloquea si algún día se hace |
| `PATCH` parcial; valida inicio < fin con los valores resultantes | `PUT` completo | Editar solo la hora sin reenviar todo |
| Índice en `starts_at` | Sin índice | El calendario consulta siempre por fecha |

## 3. Cambios por módulo
### `backend/app/`
- `models/event.py`: `EventType` y `Event`. Registrar en `models/__init__.py`.
- `schemas/event.py`: `EventCreate`, `EventUpdate`, `EventRead`.
- `services/events.py`: `list_events(db, from_, to, type_)`, `create_event`, `update_event` (lanza `InvalidEventRangeError`), `delete_event`.
- `api/v1/endpoints/events.py`: rutas de la tabla de abajo.
- `api/v1/router.py`: incluir el router de eventos.

### `backend/`
- Migración `0003_events` (autogenerate, revisada a mano: check de rango e índice).
- `tests/conftest.py`: fixture `make_event`.
- `tests/test_events.py`.

### Raíz
- `README.md`: tabla de endpoints de eventos.

## 4. Modelo de datos / contratos
Tabla `events`: `id` PK, `title` varchar(150), `description` text nullable, `type` varchar(20) + check, `starts_at` timestamptz (índice), `ends_at` timestamptz, `location` varchar(150) nullable, `created_by_id` FK `users.id` nullable (`SET NULL`), `created_at` y `updated_at` timestamptz (now). Check `ends_at > starts_at`.

| Método y ruta | Quién | Respuesta |
|---------------|-------|-----------|
| `GET /api/v1/events?from=&to=&type=` | Autenticado | `200 [EventRead]` ordenados por inicio · 401 |
| `GET /api/v1/events/{id}` | Autenticado | `200 EventRead` · 404 |
| `POST /api/v1/events` | Coordinador | `201 EventRead` · 403 · 422 |
| `PATCH /api/v1/events/{id}` | Coordinador | `200 EventRead` · 404 · 422 |
| `DELETE /api/v1/events/{id}` | Coordinador | `204` · 404 |

## 5. Plan de pruebas
- Integración: crear, leer, editar y borrar como coordinador; monitor 403 al escribir y 200 al leer; sin token 401; 404.
- Validación: fin ≤ inicio → 422 (en `POST` y en `PATCH` cambiando solo una fecha); fecha sin zona → 422; tipo inválido → 422.
- Filtros: rango con eventos que se solapan por los bordes, filtro por tipo, orden por inicio.
- Migración `0003` sube y baja; verificación en la nube con Postgres 16 antes de pasarte los ficheros.
- Manual (Ignacio): `alembic upgrade head`, crear y listar eventos desde `/docs` con `dev-token`.

## 6. Plan de despliegue / migración
- Rama `feature/06-eventos-crud` desde `develop`.
- `docker compose up --build` y `alembic upgrade head`.
- Rollback: `alembic downgrade 0002` y revertir el commit.

## 7. Estimación
- Tareas: ~10
- Incertidumbre: baja.
