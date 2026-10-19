# Planificación: 09-exportacion-ical

> Estado: aprobada (2026-10-19)
> Basado en: 01_analisis.md (preguntas abiertas resueltas el 2026-10-19)

## 1. Enfoque
Un endpoint público `GET /api/v1/calendar.ics` genera el calendario con la librería `icalendar` a partir de los eventos de la BD. No hay tablas nuevas ni migración. Los móviles se suscriben con `webcal://app-tagaste.vercel.app/api/v1/calendar.ics` (Vercel ya redirige `/api/*` a Render).

## 2. Diseño
### Endpoint
- `GET /api/v1/calendar.ics`, sin autenticación.
- Respuesta `200`, `Content-Type: text/calendar; charset=utf-8`, `Content-Disposition: inline; filename="apptagaste.ics"`.

### Contenido del calendario
- `VCALENDAR`: `PRODID:-//AppTagaste//ES`, `VERSION:2.0`, `X-WR-CALNAME:AppTagaste`, `X-WR-TIMEZONE:Europe/Madrid`, `REFRESH-INTERVAL`/`X-PUBLISHED-TTL` de 1 hora (sugerencia para los clientes que lo respetan).
- Un `VEVENT` por evento con `ends_at` posterior a hoy menos 90 días:
  - `UID`: `evento-<id>@apptagaste` (estable: si el evento cambia, el móvil lo actualiza en vez de duplicarlo).
  - `SUMMARY`: título. `LOCATION`: lugar (si hay).
  - `DESCRIPTION`: `Tipo: Convivencia` + salto de línea + descripción (si hay). `CATEGORIES`: tipo.
  - `DTSTART`/`DTEND` en UTC (formato `...Z`): el móvil los muestra en su hora local, sin tener que incluir la definición de zona horaria.
  - `DTSTAMP` y `LAST-MODIFIED`: `updated_at`.

### Código
- `services/calendar.py`: `build_calendar(events) -> bytes` (sin acceso a BD, fácil de testear) y la consulta de eventos desde hace 90 días.
- `api/v1/endpoints/calendar.py` y registro en `router.py`.
- `requirements.txt`: añadir `icalendar==7.3.0`.

## 3. Tests (`tests/test_calendar.py`)
- Sin token responde 200 y `text/calendar`.
- Contiene los eventos futuros y los de hace menos de 90 días; no los más antiguos.
- Campos correctos: UID, título, lugar, tipo en la descripción, horas en UTC (un evento a las 18:00 de España en octubre sale `160000Z`).
- El resultado se parsea de nuevo con `icalendar` sin errores.

## 4. Documentación
- README: sección "Suscribirse al calendario" (Google Calendar: *Otros calendarios → Desde URL*; iPhone: *Ajustes → Calendario → Cuentas → Añadir calendario suscrito*), con el aviso de que Google refresca cada 8–24 h.
