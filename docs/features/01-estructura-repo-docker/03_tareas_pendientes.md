# Tareas pendientes: 01-estructura-repo-docker

> Estado: 🟡 En curso
> Última actualización: 2026-10-13

## Bloque 1 — Preparación
- [ ] T1.1 — Crear rama `feature/01-estructura-repo-docker` (manual, Ignacio)
- [x] T1.2 — Sacar `.env` de Git (`git rm --cached .env`) y completar `.gitignore` (`venv/`, `.idea/`, `.vscode/`, `*.pyc`, `.pytest_cache/`)
- [x] T1.3 — Actualizar `.env.example` con valores de ejemplo no sensibles y comentarios
- [x] T1.4 — Fijar versiones en `backend/requirements.txt` y crear `backend/requirements-dev.txt`
- [x] T1.5 — Añadir `backend/.dockerignore`

## Bloque 2 — Implementación
- [x] T2.1 — Crear `backend/app/core/config.py` con `Settings` (pydantic-settings) y `get_settings()` cacheado
- [x] T2.2 — Crear paquetes `api/v1/endpoints/`, `db/`, `models/`, `schemas/`, `services/` con `__init__.py`
- [x] T2.3 — Mover health a `api/v1/endpoints/health.py` y crear `api/v1/router.py`
- [x] T2.4 — Refactorizar `main.py`: app con `settings.app_name` e `include_router` bajo `/api/v1`

## Bloque 3 — Pruebas
- [ ] T3.1 (manual, Ignacio) — `docker compose up --build` arranca `db` y `api` sin errores
- [ ] T3.2 (manual, Ignacio) — `GET /api/v1/health` → `{"status":"ok"}` y `/docs` muestra el endpoint
- [ ] T3.3 (manual, Ignacio) — `git status` no muestra `.env`

## Bloque 4 — Documentación
- [ ] T4.1 — Mover el brief a `docs/brief.md` (manual: `git mv`)
- [x] T4.2 — Escribir `README.md` (descripción, stack, requisitos, arranque, estructura, enlace al backlog)
- [ ] T4.3 (manual, Ignacio) — Commit(s) y push de la rama
