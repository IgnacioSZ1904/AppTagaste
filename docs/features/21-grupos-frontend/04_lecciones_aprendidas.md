# Lecciones aprendidas: 21-grupos-frontend

## [2026-10-19] — Comprobar el backend antes de prometer una pantalla
- **Qué pasó:** Ignacio pidió "el calendario de cada grupo", pero los eventos no tenían grupo (la 10 lo dejó fuera).
- **Corrección:** revisar el modelo en `develop` antes de cerrar el análisis y plantear la decisión (backend antes, en dos partes o todo junto). Eligió todo en el 21.
- **Aplicar en:** cualquier feature de frontend que dependa de datos nuevos.

## [2026-10-19] — Coordinar migraciones entre hilos
- **Qué pasó:** el hilo de backend seguirá con la 12 mientras la 21 añade la migración `0006`.
- **Corrección:** anotar en la memoria del proyecto el número de migración y los ficheros tocados para que la 12 empiece después de `0006`.
- **Aplicar en:** features que tocan el backend desde el hilo de frontend.

## [2026-10-19] — Tests en frío
- **Qué pasó:** el primer test del calendario a veces pasaba de 1 s en frío (import diferido de FullCalendar).
- **Corrección:** espera de 5 s solo en ese `findBy`.
- **Aplicar en:** tests que abren rutas con `lazy`.

## [2026-10-19] — Varios ids en un mismo test
- **Qué pasó:** dos botones "Añadir" (responsables y niños) hacían ambigua la búsqueda en el test.
- **Corrección:** textos de botón que dicen qué añaden ("Añadir responsable").
- **Aplicar en:** pantallas con varios formularios.
