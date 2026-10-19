# Devlog: 12-pase-de-lista

## 2026-10-19
- Análisis validado: eventos del grupo y generales; asistió / no asistió, sin fila = sin pasar lista; se guarda la lista entera; sin límite de fechas; solo los monitores responsables guardan, admin y coordinadores responsables solo ven; la pantalla se hace en esta misma feature. Planificación aprobada.
- Implementado backend: modelo `Attendance` y migración `0007_asistencia`; servicio y endpoints `GET/PUT /groups/{id}/events/{event_id}/attendance`; dependencia `MonitoredGroup`; sección "Pase de lista" en el README.
- Implementado frontend: `api/attendance.ts`, `AttendancePage` (`/grupos/:id/eventos/:eventId/lista`) con "Marcar todos" y "Guardar"; sección "Pase de lista" en la ficha del grupo (4 semanas atrás y 1 vista, con estado); botón "Pasar lista" en el evento para monitores; `canTakeAttendance`.
- Verificado en la nube: 122 tests de backend (15 nuevos) y 47 de frontend (5 nuevos), ruff, lint y build OK; `0007` aplica, revierte y vuelve a aplicar.
- Prueba manual de Ignacio en local: OK.
