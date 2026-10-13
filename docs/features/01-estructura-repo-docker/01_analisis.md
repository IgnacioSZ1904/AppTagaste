# Análisis: 01-estructura-repo-docker

## 1. Petición original
> "okey, antes de empezar con los features hagamos un pequeño backlog [...]" → backlog aprobado: "esta perfecto vamos a ello". Feature 01 del backlog: estructura del repo y Docker.

## 2. Objetivo
Dejar una base de backend ordenada y reproducible sobre la que construir el resto de features: estructura de carpetas por capas, configuración centralizada desde variables de entorno y un arranque con un solo comando (`docker compose up`) documentado en el README.

## 3. Estado actual del proyecto
- `backend/app/main.py`: FastAPI con un único endpoint `GET /health`.
- `backend/requirements.txt`: fastapi, uvicorn, sqlalchemy 2, psycopg, alembic, pydantic-settings (sin versiones fijadas).
- `backend/Dockerfile`: python:3.12-slim, `uvicorn --reload` (modo desarrollo).
- `docker-compose.yml`: servicios `db` (postgres:16, healthcheck) y `api` (puerto 8000, volumen con hot reload).
- `.env.example` con `POSTGRES_*` y `DATABASE_URL`.
- **`.env` está versionado en Git** (commits `b9aaa3c` y `dde1db2`) aunque `.gitignore` lo excluye.
- `README.md` vacío. No hay tests, ni carpeta `frontend/` en el repo, ni `docs/`.

## 4. Alcance
### Dentro de alcance
- Estructura `backend/app/`: `core/` (config), `api/` (routers), `models/`, `schemas/`, `services/`, `db/`.
- `core/config.py` con `pydantic-settings` leyendo `.env`.
- Router `health` movido a `api/` y versionado bajo `/api/v1`.
- Fijar versiones en `requirements.txt` y separar `requirements-dev.txt`.
- Quitar `.env` del repo (`git rm --cached`) y mantener `.env.example`.
- `.dockerignore` y `.gitignore` completos.
- README con descripción, stack y cómo arrancar en local.
- Mover el brief a `docs/`.

### Fuera de alcance
- Conexión real a BD y Alembic (feature 02).
- Tests, linter y CI (feature 03).
- Frontend (feature 04).
- Dockerfile de producción (feature 08).

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Credenciales de `.env` ya publicadas en el historial de GitHub | Alta (ya ocurre) | Bajo si son solo locales | Sacar `.env` del repo y cambiar la contraseña local; no reutilizarla en producción |
| Romper el arranque actual al mover ficheros | Media | Bajo | Verificar `docker compose up` y `/api/v1/health` al final |
| Versiones sin fijar rompen builds futuros | Media | Medio | Fijar versiones |

## 6. Preguntas abiertas
- [x] ¿Las credenciales de `.env` son solo de tu Postgres local? → Sí (solo local).
- [x] ¿Prefijo `/api/v1`? → Sí.
- [x] ¿Mover el brief a `docs/brief.md`? → Sí.

## 7. Criterios de aceptación
- [ ] `docker compose up` arranca `db` y `api` sin errores desde un clon limpio + `.env` copiado de `.env.example`.
- [ ] `GET /api/v1/health` devuelve `{"status": "ok"}`.
- [ ] La configuración se lee desde `app/core/config.py` (ningún valor sensible en código).
- [ ] `.env` ya no está en Git y `.env.example` está actualizado.
- [ ] README explica cómo arrancar el proyecto en menos de 5 pasos.
