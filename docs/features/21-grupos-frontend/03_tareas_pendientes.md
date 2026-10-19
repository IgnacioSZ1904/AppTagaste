# Tareas pendientes: 21-grupos-frontend

> Estado: ✅ Completada (falta PR y merge)
> Última actualización: 2026-10-19

## Bloque 1 — Preparación
- [ ] T1.1 (manual, Ignacio) — `git checkout develop; git pull; git checkout -b feature/21-grupos-frontend`

## Bloque 2 — Backend
- [x] T2.1 — Tabla `event_groups` y `Event.groups` (`models/event.py`)
- [x] T2.2 — Migración `0006_eventos_grupos`
- [x] T2.3 — Esquemas: `group_ids` al crear y editar, `groups` al leer
- [x] T2.4 — Servicio: asignar grupos (422 si no existe) y filtro `in_group` (grupo + generales)
- [x] T2.5 — `GET /events?group_id=` (404 si el grupo no existe)
- [x] T2.6 — iCal `?group_id=` con nombre del grupo en el calendario
- [x] T2.7 — Tests de eventos con grupos e iCal filtrado

## Bloque 3 — Frontend
- [x] T3.1 — `api/events.ts` (grupos y filtro) y `api/groups.ts` (grupos, responsables y niños)
- [x] T3.2 — `canSeeGroups`, ruta `/grupos` y `/grupos/:id`, enlace "Grupos"/"Mis grupos"
- [x] T3.3 — Formulario de evento con chips de grupos; detalle con grupos o "General"
- [x] T3.4 — `GroupPicker` en el calendario (recordado, responsables debajo) y filtro en "Próximos"
- [x] T3.5 — `SubscribeModal`: copiar enlace y abrir con `webcal://`
- [x] T3.6 — `GroupsPage` y `GroupForm` (crear, renombrar)
- [x] T3.7 — `GroupPage`: borrar grupo, `MembersEditor`, `ChildrenList`, `AddChildrenForm`
- [x] T3.8 — Tests (permisos, selector, formulario, grupos, niños, suscripción)

## Bloque 4 — Pruebas (manual, Ignacio)
- [x] T4.1 — `docker compose up -d --build api` + `docker compose exec api alembic upgrade head`
- [x] T4.2 — `docker compose exec api pytest -v` y `ruff check .`
- [x] T4.3 — Admin: crear grupos, asignar responsables, eventos de un grupo y generales
- [x] T4.4 — Calendario: cambiar de grupo, ver responsables, "Suscribirse"
- [x] T4.5 — Monitor: "Mis grupos", pegar una lista de niños, renombrar y borrar
- [x] T4.6 — Rol usuario: selector de grupo sí, "Grupos" no
- [x] T4.7 — Móvil (375 px) en DevTools
- [x] T4.8 — `npm run lint`, `npm test`, `npm run build`
- [ ] T4.9 — Push y PR a `develop` → CI en verde

## Bloque 5 — Documentación
- [x] T5.1 — README: grupos en eventos, filtro, iCal por grupo, pantallas
- [x] T5.2 — Devlog, lecciones y BACKLOG
- [ ] T5.3 (manual, Ignacio) — Merge de la PR; en el despliegue, la migración `0006`
