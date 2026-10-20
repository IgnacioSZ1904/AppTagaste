# Planificación: 23-calidad-transversal

## 1. Enfoque
Tres bloques independientes, cada uno con sus commits. Sin cambios en la base de datos. Los mensajes `detail` actuales no cambian (los tests existentes lo garantizan); solo cambian el formato de los 422 de validación y el 500.

## 2. Bloque A — ADRs
- `docs/adr/README.md`: qué es un ADR, plantilla (Estado, Contexto, Decisión, Alternativas, Consecuencias) e índice.
- `docs/adr/0001-stack.md` … `0009-ical-publico.md`, con fecha real de cada decisión (sacada de los devlogs) y enlace a la feature donde se tomó.

## 3. Bloque B — Errores y logging
### Backend
- `app/core/errors.py`:
  - `AppError(Exception)` con `status_code` y `detail` (clase), y subclases genéricas `NotFoundError` (404), `ConflictError` (409), `ValidationAppError` (422), `TooLargeError` (413), `ForbiddenError` (403).
  - Manejadores: `AppError` → `{"detail": ...}` con su estado; `RequestValidationError` → 422 con `detail` en español ("title: debe tener al menos 1 carácter"; varios errores separados por "; "); `Exception` → 500 `{"detail": "Error interno del servidor", "request_id": ...}` y `logger.exception`.
- Las excepciones de los servicios (19 clases en `users`, `groups`, `events`, `attendance`, `documents`, `stats`, `core/google`) pasan a heredar de la subclase adecuada con su mensaje; los `try/except` de los endpoints desaparecen. `deps.py` sigue con `HTTPException` (401/403 de autenticación).
- Traducción de los errores de validación más comunes de Pydantic (`missing`, `string_too_short`, `string_too_long`, `string_pattern_mismatch`, `int_parsing`, `enum`, `value_error`…); el resto, con el mensaje original.
- `app/core/logging.py`: `setup_logging(level)` con formato `2026-10-20 16:30:00 INFO [request_id] mensaje`; `LOG_LEVEL` en `Settings` (por defecto `INFO`).
- Middleware `app/core/middleware.py`: genera o respeta `X-Request-ID`, lo guarda en un `contextvar` (para que salga en todas las líneas) y lo devuelve en la respuesta; al acabar, una línea `GET /api/v1/events 200 12 ms usuario=3`. `/health` en nivel DEBUG para no llenar el log.
- `main.py` registra logging, middleware y manejadores.

### Frontend
- `apiFetch`: si la respuesta trae `request_id`, lo añade al mensaje ("Error interno del servidor (ref. ab12cd)").
- `components/ErrorPage.tsx` como `errorElement` de la raíz: "Algo ha fallado", "Recargar" y "Volver al inicio"; para un 404 de ruta, el mensaje de "Página no encontrada".

## 4. Bloque C — OpenAPI
- `FastAPI(title, description, version="1.0.0", contact, openapi_tags=[...])` con descripción en español de cada tag (auth, users, events, calendar, groups, attendance, stats, documents, health).
- `summary` en las 36 rutas.
- `app/schemas/errors.py`: `ErrorRead {detail, request_id?}`; respuestas comunes (`401`, `403`, `404`, `409`, `413`, `422`) añadidas a los routers con `responses=` según corresponda.
- README: enlace a `/docs` en local y producción y sección "Errores y logs" (formato, `X-Request-ID`, `LOG_LEVEL`).

## 5. Ficheros
- Nuevos: `backend/app/core/errors.py`, `backend/app/core/logging.py`, `backend/app/core/middleware.py`, `backend/app/schemas/errors.py`, `backend/tests/test_errors.py`, `frontend/src/components/ErrorPage.tsx`, `docs/adr/*`.
- Modificados: `backend/app/main.py`, `backend/app/core/config.py`, `backend/app/core/google.py`, `backend/app/services/*.py` (excepciones), `backend/app/api/v1/endpoints/*.py` (sin `try/except`, `summary`, `responses`), `frontend/src/api/client.ts`, `frontend/src/router.tsx`, tests de frontend, `.env.example`, `render.yaml` (`LOG_LEVEL`), `README.md`.

## 6. Tests
- Backend: `AppError` de un servicio → estado y `detail`; 422 de validación en español; ruta que lanza una excepción inesperada → 500 con `request_id` y traza en el log (`caplog`); `X-Request-ID` generado y respetado; línea de log por petición; `/openapi.json` con versión, tags descritos y `summary` en todas las rutas.
- Frontend: página de error al fallar una pantalla; mensaje con referencia en un 500.
- Los 179 + 71 tests actuales sin cambios en sus `detail`.

## 7. Commits previstos
1. `docs(adr): registro de decisiones de arquitectura`
2. `refactor(api): errores de servicio con AppError y manejadores globales`
3. `feat(api): logging por petición con X-Request-ID`
4. `test(api): errores, validación y logging`
5. `feat(frontend): página de error y referencia de la petición`
6. `docs(api): OpenAPI con descripción, tags, resúmenes y errores`
7. `docs: README y documentación de la feature 23`
