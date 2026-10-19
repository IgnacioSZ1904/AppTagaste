# Análisis: 09-exportacion-ical

## 1. Petición original
> "vamos con la siguiente" → feature 09 del backlog: `exportacion-ical` (P1), "Feed iCal por grupo para suscribirse desde el móvil".

## 2. Objetivo
Que cualquiera con cuenta pueda suscribirse al calendario de AppTagaste desde Google Calendar o el calendario del iPhone y ver los eventos sin abrir la app; los cambios llegan solos.

## 3. Estado actual del proyecto
- Eventos (06): título, descripción, tipo, inicio, fin, lugar. Todos los usuarios activos pueden verlos (`GET /events`).
- La API solo acepta `Authorization: Bearer <token>`, y el token caduca. Las apps de calendario **no pueden enviar ese header**: solo descargan una URL cada cierto tiempo.
- Aún no existen los grupos (llegan en la 10), así que el feed "por grupo" no es posible todavía.
- En producción la API está en Render gratis (se duerme) y se llega a ella por `https://app-tagaste.vercel.app/api/...`.

## 4. Alcance
### Dentro de alcance
- Endpoint público (sin login) que devuelve los eventos en formato iCalendar (`.ics`).
- Tests y guía en el README para suscribirse en Google Calendar e iPhone.

### Fuera de alcance
- Botón "Suscribirse" en la web (es frontend: lo hace el hilo de frontend después).
- Filtro por grupo (cuando exista la 10 se añade un parámetro `?grupo=`).
- Sincronización en dos sentidos (editar eventos desde el móvil).

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Google Calendar refresca los feeds cada 8–24 h, no al momento | Alta | Medio | Asumirlo y avisarlo en el README; el iPhone permite elegir la frecuencia |
| Render dormido: Google puede abandonar la descarga si tarda ~1 min | Media | Medio | Reintenta solo en el siguiente refresco; si molesta, mantener la API despierta más adelante |
| Cualquiera con la URL ve títulos, horarios y lugares | Alta | Bajo | Decisión de Ignacio: el acceso a los lugares ya es privado. No poner datos de niños en los eventos |

## 6. Preguntas abiertas
- [x] ¿Feed con token privado por usuario? → **no: URL pública única** (`/api/v1/calendar.ics`). El acceso a los lugares de las reuniones ya es privado.
- [x] Como aún no hay grupos, ¿un único feed con todos los eventos? → **sí**, y en la 10 añadimos el filtro por grupo.
- [x] ¿Qué eventos incluye? → **los de los últimos 3 meses y todos los futuros**, para que el feed no crezca sin fin.
- [x] ¿Cómo se ve cada evento en el móvil? → título del evento, con el tipo (Reunión, Convivencia…) como categoría y al principio de la descripción; lugar en "ubicación".
- [x] ¿Librería `icalendar` o generar el texto a mano? → **`icalendar`** (estándar, evita errores de formato).

## 7. Criterios de aceptación
- [x] `GET /api/v1/calendar.ics` devuelve un `.ics` válido con los eventos de los últimos 3 meses y futuros, sin autenticación.
- [x] Las horas salen bien en el móvil (hora de España).
- [x] Suscripción probada en Google Calendar o iPhone con la app desplegada.
- [x] Tests y ruff en verde en la CI.
