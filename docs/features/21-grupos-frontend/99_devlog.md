# Devlog: 21-grupos-frontend

---

## [2026-10-19] — Inicio del evolutivo
- Features 08, 09 y 10 hechas; la 10 (grupos en backend) en `develop` (PR #14)
- Análisis redactado

## [2026-10-19] — Análisis aprobado
- Resumen de Ignacio: los usuarios eligen grupo y ven su calendario con los responsables; coordinador y monitor solo ven sus grupos; alta de niños pegando una lista; apartado del monitor con la lista de niños; botón "Suscribirse" pendiente de la 09
- Los eventos no tenían grupo: Ignacio decide hacerlo **todo en el 21** (backend y frontend)
- Evento con varios grupos o ninguno (general, sale en todos); selector para todos los roles; iCal por grupo
- Planificación redactada

## [2026-10-19] — Planificación aprobada
- Tareas pendientes redactadas (27 tareas en 5 bloques)

## [2026-10-19] — Ejecución de tareas (ficheros)
- Tareas aprobadas; hechas T2.1–T2.7, T3.1–T3.8 y T5.1
- Backend: `event_groups` (migración `0006`, probada arriba y abajo), `group_ids`/`groups` en eventos, filtro `in_group` compartido por `/events` y el iCal; `make_group` pasa a `conftest.py`. 107 tests y ruff en verde
- Frontend: selector de grupo (`useCalendarGroup`, recordado en `localStorage`), "Suscribirse" (`webcal://`), chips de grupos en el formulario, `/grupos` y `/grupos/:id` (responsables, niños pegando una lista). 42 tests, lint y build en verde
- El primer test del calendario a veces pasaba de 1 s en frío (import diferido de FullCalendar): espera ampliada a 5 s
- Capturas en escritorio y 375 px con la API simulada

## [2026-10-19] — Pruebas manuales y cierre
- Ignacio probó grupos, responsables, niños pegando una lista, calendario por grupo y "Suscribirse": "esta magnifico"
- Criterios de aceptación marcados (falta CI en GitHub Actions), lecciones escritas y BACKLOG con la 21 hecha
- Pendiente: push, PR a `develop`, merge y migración `0006` en el despliegue
