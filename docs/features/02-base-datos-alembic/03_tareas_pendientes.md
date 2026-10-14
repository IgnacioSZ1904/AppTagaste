# Tareas pendientes: 02-base-datos-alembic

> Estado: ✅ Completada
> Última actualización: 2026-10-14

## Bloque 1 — Preparación
- [x] T1.1 (manual, Ignacio) — `git checkout develop && git pull && git checkout -b feature/02-base-datos-alembic`

## Bloque 2 — Implementación
- [x] T2.1 — `app/db/base.py`: `Base` con convención de nombres
- [x] T2.2 — `app/db/session.py`: `engine`, `SessionLocal`, `get_db()`
- [x] T2.3 — `app/models/__init__.py`: exportar `Base` para autogenerate
- [x] T2.4 — Alembic: `alembic.ini`, `alembic/env.py`, `script.py.mako`, `versions/`
- [x] T2.5 — Migración `0001_baseline` vacía
- [x] T2.6 — `/api/v1/health` con comprobación de BD (503 si falla)
- [x] T2.7 — `Dockerfile` (`COPY . .`) y `docker-compose.yml` (volumen `./backend:/code`)

## Bloque 3 — Pruebas (manual, Ignacio)
- [x] T3.1 — `docker compose up --build`
- [x] T3.2 — `docker compose exec api alembic upgrade head`
- [x] T3.3 — `alembic_version` tiene 1 fila
- [x] T3.4 — `/api/v1/health` → `db: ok`; con `db` parada → 503
- [x] T3.5 — `alembic revision --autogenerate -m prueba` → vacía (borrarla) (verificada en la nube)

## Bloque 4 — Documentación
- [x] T4.1 — README: sección "Migraciones"
- [x] T4.2 — Actualizar `99_devlog.md` y lecciones aprendidas
- [ ] T4.3 (manual, Ignacio) — Commit, push y PR a `develop`
