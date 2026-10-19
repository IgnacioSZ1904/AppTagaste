# Devlog: 09-exportacion-ical

## 2026-10-19
- Análisis validado: URL pública única (el acceso a los lugares ya es privado), un solo feed hasta que existan los grupos, últimos 3 meses + futuros, tipo en la descripción, librería `icalendar`. Planificación aprobada.
- Implementado: `services/calendar.py` (consulta + `build_calendar`), endpoint público `GET /api/v1/calendar.ics`, `icalendar==7.3.0` en `requirements.txt`, sección "Suscribirse al calendario" en el README.
- Tests (`test_calendar.py`): acceso sin login, filtro de 90 días, campos del evento y horas en UTC (18:00 de España en octubre → `160000Z`).
- Encontrado al probar: iCalendar no guarda microsegundos; el test compara con una hora redondeada.
- Verificado en la nube: 68 tests en verde y ruff OK.
