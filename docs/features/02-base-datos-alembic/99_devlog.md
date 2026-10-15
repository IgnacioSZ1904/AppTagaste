# Devlog: 02-base-datos-alembic

---

## [2026-10-13 18:01] — Inicio del evolutivo
- Análisis redactado

## [2026-10-13 18:03] — Análisis aprobado
- Decisiones: migraciones manuales, `/health` comprueba la BD, migración baseline vacía
- Planificación redactada (SQLAlchemy síncrono, montar `./backend` entero)

## [2026-10-13 18:07] — Planificación aprobada
- Feature 01 ya mergeada en `develop`; la rama 02 parte de `develop`
- Tareas pendientes redactadas (14 tareas en 4 bloques)

## [2026-10-13 18:20] — Ejecución de tareas (ficheros)
- Hechas T2.1–T2.7 y T4.1: `db/base.py`, `db/session.py`, `models/__init__.py`, Alembic (`alembic.ini`, `env.py`, `script.py.mako`), `0001_baseline`, `/health` con BD, `Dockerfile`, `docker-compose.yml`, README
- Verificado en la nube contra Postgres 16 (sin Docker): `upgrade head` → `0001 (head)`, autogenerate sin cambios → migración vacía, `/health` → 200 `db: ok`, sin BD → 503, `downgrade base` OK

## [2026-10-14 08:12] — Pruebas manuales completadas (Ignacio)
- T1.1 rama creada; T3.1–T3.4 OK en local: `upgrade head` → `0001`, `alembic_version` con 1 fila, `/health` → 200 `db: ok`, con `db` parada → 503
- T3.5 (autogenerate vacío) verificada en la nube
- Incidencia: `docker compose up --build` falló con "failed to execute bake" (Docker Desktop no listo); se resolvió reintentando

## [2026-10-14 08:15] — Cierre del evolutivo
- Tareas, criterios de aceptación y BACKLOG actualizados (sin review HTML, por decisión de Ignacio)
- Resumen: la API ya usa PostgreSQL con SQLAlchemy 2.0 y el esquema se versiona con Alembic; las siguientes features solo añaden modelos y migraciones
