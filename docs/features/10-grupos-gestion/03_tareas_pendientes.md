# Tareas pendientes: 10-grupos-gestion

> Estado: 🔄 En curso (pruebas en local)
> Última actualización: 2026-10-19

## Bloque 1 — Preparación
- [x] T1.1 (manual, Ignacio) — `git checkout develop && git pull && git checkout -b feature/10-grupos-gestion`

## Bloque 2 — Implementación
- [x] T2.1 — Modelos `Group`, `group_members`, `Child` y migración `0005_grupos`
- [x] T2.2 — Esquemas y servicio de grupos
- [x] T2.3 — Endpoints de grupos, responsables y niños; dependencia `GroupManager`; `GET /me/groups`
- [x] T2.4 — `test_groups.py` y matriz de `test_roles.py`
- [x] T2.5 — README (sección Grupos) y BACKLOG (añadir la 21 `grupos-frontend`)

## Bloque 3 — Pruebas (manual, Ignacio)
- [ ] T3.1 — `docker compose up --build -d`, `alembic upgrade head`, `pytest` y ruff en verde
- [ ] T3.2 — Crear un grupo, asignar un monitor y añadir un niño desde `/docs`

## Bloque 4 — Documentación y cierre
- [ ] T4.1 — Devlog, lecciones, criterios y BACKLOG (antes del commit)
