# 0009. Feed iCal público sin token

- **Estado:** Aceptado
- **Fecha:** 2026-10-19
- **Feature:** [09-exportacion-ical](../features/09-exportacion-ical/)

## Contexto
Las familias quieren ver los eventos en el calendario del móvil (Google Calendar, iPhone). Esas apps se suscriben a una URL y no envían cabeceras de autenticación.

## Decisión
- `GET /api/v1/calendar.ics` es **público** (sin login) y devuelve los eventos de los últimos 3 meses y los futuros; con `?group_id=`, los del grupo más los generales.
- El botón "Suscribirse" de la web da el enlace `webcal://`.

## Alternativas
- **URL con token personal por usuario:** más privada, pero hay que generarlos, mostrarlos y revocarlos.
- **Sin feed:** obliga a entrar en la web para ver el calendario.

## Consecuencias
- Cualquiera con el enlace ve los eventos: solo llevan título, tipo, fecha, lugar y descripción, nunca datos de niños.
- Si en el futuro hubiera eventos privados, se pasaría a tokens por usuario (nuevo ADR).
