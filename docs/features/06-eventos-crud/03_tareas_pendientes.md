# Tareas pendientes: 06-eventos-crud

> Estado: ✅ Completada
> Última actualización: 2026-10-14

## Bloque 1 — Preparación
- [x] T1.1 (manual, Ignacio) — `git checkout develop && git pull && git checkout -b feature/06-eventos-crud`

## Bloque 2 — Implementación
- [x] T2.1 — `models/event.py` (`EventType`, `Event`) y registro en `models/__init__.py`
- [x] T2.2 — Migración `0003_events` (check `ends_at > starts_at` e índice en `starts_at`)
- [x] T2.3 — `schemas/event.py`: `EventCreate`, `EventUpdate`, `EventRead`
- [x] T2.4 — `services/events.py`: listar con filtros (solape de rango y tipo), crear, editar, borrar
- [x] T2.5 — `api/v1/endpoints/events.py` y registro en el router
- [x] T2.6 — Tests: fixture `make_event` y `test_events.py`

## Bloque 3 — Pruebas (manual, Ignacio)
- [x] T3.1 — `docker compose up --build -d` y `docker compose exec api alembic upgrade head`
- [x] T3.2 — `docker compose exec api pytest -v` y ruff → verde
- [x] T3.3 — Con `dev-token` del coordinador en `/docs`: crear, listar con filtros, editar y borrar un evento
- [x] T3.4 — Con `dev-token` de un monitor: `GET /events` OK y `POST /events` da 403

## Bloque 4 — Documentación y cierre
- [x] T4.1 — README: endpoints de eventos
- [x] T4.2 — Devlog, lecciones, criterios y BACKLOG (antes del commit)
- [ ] T4.3 (manual, Ignacio) — Commit, push y PR a `develop` con CI en verde
