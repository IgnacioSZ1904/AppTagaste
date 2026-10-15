# Lecciones aprendidas: 07-calendario-frontend

## [2026-10-14] — Verificar siempre las copias al PC
- **Qué pasó:** tres veces la copia al PC dejó la versión anterior del fichero (`Layout.tsx`, `CalendarPage.tsx`, `BACKLOG.md`, `01_analisis.md`); Ignacio vio que el cambio "no se había aplicado".
- **Corrección:** tras cada copia, comparar tamaños con los del PC y volver a copiar si no coinciden.
- **Aplicar en:** todas las features.

## [2026-10-14] — Enseñar la interfaz antes de darla por buena
- **Qué pasó:** con lint y tests en verde, Ignacio pidió dos cambios visuales (mes sin scroll; agenda sin cortar eventos de varios días y con los próximos eventos).
- **Corrección:** capturas con datos simulados (Playwright + rutas de la API falsas) en escritorio y móvil antes de pasar el código.
- **Aplicar en:** cualquier feature de frontend: compartir capturas en cuanto haya pantalla.

## [2026-10-14] — Revisar la versión real de las librerías
- **Qué pasó:** FullCalendar v7 cambió de paquetes (`@fullcalendar/react/daygrid`, temas como plugins, `temporal-polyfill`) y opciones (`buttonText` ya no existe).
- **Corrección:** leer el README y los tipos del paquete instalado antes de escribir el código.
- **Aplicar en:** cualquier dependencia nueva.

## [2026-10-14] — Fechas de la API como texto local
- **Qué pasó:** la API da hora de España como `AAAA-MM-DD HH:MM`; pasarlas a FullCalendar como `AAAA-MM-DDTHH:MM` sin zona evita conversiones.
- **Aplicar en:** feature 09 (iCal) y cualquier vista con fechas.
