# Planificación: 01-estructura-repo-docker

## 1. Enfoque técnico
Reorganizar `backend/app` en capas (api → services → models/db) con una configuración única basada en `pydantic-settings`. `main.py` queda como punto de montaje: crea la app y registra los routers bajo `/api/v1`. El entorno de desarrollo sigue siendo `docker compose up` con hot reload. Se saca `.env` de Git y se deja `.env.example` como fuente de verdad de las variables.

## 2. Decisiones de diseño
| Decisión | Alternativas consideradas | Justificación |
|----------|---------------------------|---------------|
| Estructura por capas (`api/`, `core/`, `db/`, `models/`, `schemas/`, `services/`) | Por módulo de dominio (`calendar/`, `library/`...) | Es la convención más común en FastAPI y fácil de explicar en entrevistas; se puede migrar a dominios si crece |
| `pydantic-settings` con `Settings` cacheado (`@lru_cache`) | `os.getenv` disperso | Validación de tipos, un único punto de configuración, fácil de sobrescribir en tests |
| Prefijo `/api/v1` | Sin prefijo | Separa API del front en el despliegue y permite versionar |
| Versiones fijadas en `requirements.txt` + `requirements-dev.txt` | Poetry / uv | Mantiene el setup simple; se puede migrar a uv más adelante (ADR) |
| `.env` fuera de Git, sin reescribir historial | `git filter-repo` | Las credenciales son solo locales; basta con dejar de versionarlo y cambiar la contraseña local |

## 3. Cambios por módulo
### `backend/app/`
- Añadir `core/config.py` (`Settings`: `app_name`, `environment`, `database_url`, `api_v1_prefix`).
- Añadir `api/v1/router.py` y `api/v1/endpoints/health.py`.
- Añadir paquetes vacíos `db/`, `models/`, `schemas/`, `services/` (con `__init__.py`).
- Modificar `main.py`: crear la app con `settings.app_name` e incluir el router v1. Eliminar el endpoint inline.

### `backend/`
- `requirements.txt`: fijar versiones.
- Añadir `requirements-dev.txt` (`-r requirements.txt`, base para pytest/ruff en la feature 03).
- Añadir `.dockerignore`.

### Raíz
- `git rm --cached .env`; revisar `.gitignore` (añadir `venv/`, `.idea/`, `.vscode/`, `*.pyc`, `.pytest_cache/`).
- `.env.example`: valores de ejemplo no sensibles y comentarios.
- `docker-compose.yml`: sin cambios funcionales (revisar que siga funcionando).
- Mover el brief a `docs/brief.md`.
- `README.md`: descripción, stack, requisitos, arranque en local, estructura y enlace al backlog.

## 4. Modelo de datos / contratos
- `GET /api/v1/health` → `200 {"status": "ok"}`.
- Se elimina `GET /health` (no hay consumidores).
- `/docs` (OpenAPI) sigue disponible.

## 5. Plan de pruebas
- Unitarios: ninguno en esta feature (pytest llega en la 03).
- Validación manual:
  1. Copiar `.env.example` a `.env` y ejecutar `docker compose up --build`.
  2. `curl http://localhost:8000/api/v1/health` → `{"status":"ok"}`.
  3. Abrir `http://localhost:8000/docs` y ver el endpoint.
  4. `git status` no muestra `.env`.

## 6. Plan de despliegue / migración
- Pasos previos: cambiar la contraseña de tu Postgres local tras sacar `.env` de Git (opcional pero recomendable).
- Durante: `docker compose down` y `docker compose up --build` para reconstruir con las nuevas dependencias.
- Rollback: revertir el commit de la rama `feature/01-estructura-repo-docker`.

## 7. Estimación de complejidad
- Nº aproximado de tareas: 8
- Áreas de mayor incertidumbre: compatibilidad de versiones fijadas; rutas de import en el contenedor (`app.` como paquete raíz).
