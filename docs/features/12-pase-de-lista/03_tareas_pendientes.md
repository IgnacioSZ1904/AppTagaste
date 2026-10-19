# Tareas pendientes: 12-pase-de-lista

> Estado: ✅ Completada
> Última actualización: 2026-10-19

## Bloque 1 — Preparación
- [x] T1.1 (manual, Ignacio) — `git checkout develop && git pull && git checkout -b feature/12-pase-de-lista`

## Bloque 2 — Backend
- [x] T2.1 — Modelo `Attendance` y migración `0007_asistencia`
- [x] T2.2 — Esquemas, servicio y endpoints; dependencia `MonitoredGroup`
- [x] T2.3 — `test_attendance.py` y matriz de `test_roles.py`

## Bloque 3 — Frontend
- [x] T3.1 — `api/attendance.ts` y `canTakeAttendance`
- [x] T3.2 — `AttendancePage` y ruta
- [x] T3.3 — Sección "Pase de lista" en `GroupPage` y botón en `EventModal`
- [x] T3.4 — `AttendancePage.test.tsx`

## Bloque 4 — Pruebas (manual, Ignacio)
- [x] T4.1 — `docker compose up --build -d`, `pytest`, ruff, `npm run lint`, `npm test`, `npm run build`
- [x] T4.2 — Como monitor, pasar lista en un evento desde el grupo y desde el calendario

## Bloque 5 — Documentación y cierre
- [x] T5.1 — README, devlog, lecciones, criterios y BACKLOG (antes del commit)
