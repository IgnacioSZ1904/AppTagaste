# Lecciones aprendidas: 09-exportacion-ical

## [2026-10-19] — Las apps de calendario no pueden iniciar sesión
- **Qué pasó:** la API solo acepta `Authorization: Bearer`, y Google Calendar o el iPhone solo descargan una URL.
- **Corrección:** feed público sin login (decisión de Ignacio); la alternativa era un token secreto en la URL.
- **Aplicar en:** cualquier integración externa que lea por URL (feeds, webhooks).

## [2026-10-19] — Exportar en UTC evita definir zonas horarias
- **Qué pasó:** con `TZID=Europe/Madrid` habría que incluir la definición `VTIMEZONE` en el fichero.
- **Corrección:** `DTSTART`/`DTEND` en UTC (`...Z`); cada móvil lo pasa a su hora local y el cambio de hora sale bien.
- **Aplicar en:** exportaciones de fechas a otros formatos (informes, CSV de la 13).

## [2026-10-19] — iCalendar no guarda microsegundos
- **Qué pasó:** un test comparaba la hora del `.ics` con la de la BD y fallaba por los microsegundos.
- **Corrección:** en los tests, crear los eventos con horas redondeadas al minuto.
- **Aplicar en:** tests que comparen fechas tras pasar por otro formato.

## [2026-10-19] — Un UID estable evita duplicados
- **Qué pasó:** si el UID cambiara, el móvil vería cada edición como un evento nuevo.
- **Corrección:** `evento-<id>@apptagaste`, fijo para cada evento.
- **Aplicar en:** el filtro por grupo de la 10 (mismo UID en todos los feeds).
