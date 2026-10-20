# 0005. Fechas en hora de España en la API

- **Estado:** Aceptado
- **Fecha:** 2026-10-14
- **Feature:** [06-eventos-crud](../features/06-eventos-crud/)

## Contexto
Todos los eventos son en España. Pedir zonas horarias o ISO 8601 con desfase al frontend y a quien use la API añade errores (horario de verano) sin aportar nada.

## Decisión
- La API recibe y devuelve fechas como texto `AAAA-MM-DD HH:MM` en hora de España (`Europe/Madrid`).
- En la base de datos se guardan con zona horaria (`timestamptz`); la conversión se hace en un tipo Pydantic propio (`LocalDateTime`).

## Alternativas
- **ISO 8601 en UTC:** estándar, pero obliga al frontend a convertir y a FullCalendar a configurar la zona.
- **Guardar sin zona:** más simple, pero ambiguo en los cambios de hora y en el feed iCal.

## Consecuencias
- Formularios y pantallas usan la hora tal cual llega.
- Si algún día hubiera eventos fuera de España, habría que añadir la zona al evento.
