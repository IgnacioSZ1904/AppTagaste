# Tareas pendientes: 03-calidad-ci

> Estado: ✅ Completada
> Última actualización: 2026-10-14

## Bloque 1 — Preparación
- [x] T1.1 (manual, Ignacio) — `git checkout develop && git pull && git checkout -b feature/03-calidad-ci`
- [x] T1.2 — `requirements-dev.txt`: pytest, httpx, ruff con versión fijada
- [x] T1.3 — `Dockerfile`: instalar `requirements-dev.txt`
- [x] T1.4 — `pyproject.toml`: configuración de ruff y pytest

## Bloque 2 — Implementación
- [x] T2.1 — `alembic/env.py`: respetar una URL ya fijada en la config
- [x] T2.2 — `tests/conftest.py`: BD `_test` (crear + migrar), rollback por test, `client`
- [x] T2.3 — `tests/test_health.py`: 200 con BD y 503 simulando fallo
- [x] T2.4 — Corregir lo que marque ruff en el código existente
- [x] T2.5 — `.github/workflows/ci.yml`: jobs `lint` y `test` (Postgres 16 como servicio)

## Bloque 3 — Pruebas (manual, Ignacio)
- [x] T3.1 — `docker compose up --build`
- [x] T3.2 — `docker compose exec api pytest -v` → verde
- [x] T3.3 — `docker compose exec api ruff check .` y `ruff format --check .` → sin errores
- [x] T3.4 — Push y PR a `develop` → GitHub Actions en verde

## Bloque 4 — Documentación
- [x] T4.1 — README: sección "Tests y calidad"
- [x] T4.2 — Devlog, lecciones y BACKLOG
- [x] T4.3 (manual, Ignacio) — Merge de la PR
