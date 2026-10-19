# Tareas pendientes: 09-exportacion-ical

> Estado: 🔄 En curso (pruebas en local)
> Última actualización: 2026-10-19

## Bloque 1 — Preparación
- [x] T1.1 (manual, Ignacio) — `git checkout develop && git pull && git checkout -b feature/09-exportacion-ical`

## Bloque 2 — Implementación
- [x] T2.1 — Añadir `icalendar` a las dependencias
- [x] T2.2 — `services/calendar.py` (consulta y generación del `.ics`)
- [x] T2.3 — Endpoint `GET /api/v1/calendar.ics` y registro en el router
- [x] T2.4 — `tests/test_calendar.py`
- [x] T2.5 — README: suscribirse desde Google Calendar e iPhone

## Bloque 3 — Pruebas (manual, Ignacio)
- [ ] T3.1 — `docker compose up --build -d`, `pytest` y ruff en verde
- [ ] T3.2 — Abrir `http://localhost:8000/api/v1/calendar.ics` y comprobar que descarga los eventos
- [ ] T3.3 — Tras desplegar, suscribirse en el móvil con la URL de producción

## Bloque 4 — Documentación y cierre
- [ ] T4.1 — Devlog, lecciones, criterios y BACKLOG (antes del commit)
