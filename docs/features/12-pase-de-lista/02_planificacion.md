# Planificación: 12-pase-de-lista

> Estado: pendiente de aprobación
> Basado en: 01_analisis.md (preguntas abiertas resueltas el 2026-10-19)

## 1. Modelo de datos (migración `0007_asistencia`)
- `attendance`: `event_id` (FK, `ON DELETE CASCADE`), `child_id` (FK, `ON DELETE CASCADE`), clave primaria compuesta; `present` (bool); `marked_by_id` (FK a `users`, `ON DELETE SET NULL`); `marked_at` (timestamptz).
- Un niño sin fila en un evento = "sin pasar lista".

## 2. Permisos
| Acción | Quién |
|--------|-------|
| Ver la lista de un grupo en un evento | Admin y responsables del grupo (`ManagedGroup`) |
| Guardar la lista | Solo los **monitores** responsables del grupo (nueva dependencia `GroupMonitor`) |

## 3. API (`/api/v1`)
| Método y ruta | Respuesta |
|---------------|-----------|
| `GET /groups/{id}/events/{event_id}/attendance` | `{event_id, group_id, children: [{child_id, full_name, present: true/false/null}], marked_by, marked_at}` |
| `PUT /groups/{id}/events/{event_id}/attendance` `{present_child_ids: [...]}` | Guarda a todos los niños del grupo: los de la lista asistieron, el resto no. Devuelve lo mismo que el `GET` |

- Evento que no es del grupo ni general → 404. Un id que no es un niño del grupo → 422.
- `marked_by` y `marked_at`: quién guardó por última vez y cuándo (hora de España, `AAAA-MM-DD HH:MM`).

## 4. Frontend
- `api/attendance.ts`: `useAttendance` y `useSaveAttendance` (React Query).
- Página `/grupos/:id/eventos/:eventId/lista` (`AttendancePage`): título del evento y fecha, una casilla por niño, "Marcar todos", "Guardar" y "Guardado por X el …". Para admin y coordinadores, la misma lista en solo lectura.
- Entradas a la página:
  - En la ficha del grupo (`GroupPage`), sección "Pase de lista" con los eventos del grupo de las últimas 4 semanas y la próxima, cada uno con su estado (pendiente / pasada).
  - En el evento del calendario (`EventModal`), botón "Pasar lista" para los monitores, con un botón por grupo si tiene varios.
- `roles.ts`: `canTakeAttendance` (monitor).

## 5. Tests
- Backend `test_attendance.py`: ver y guardar, volver a guardar sustituye, evento general y de otro grupo, niño de otro grupo, borrado en cascada, quién y cuándo. `test_roles.py`: matriz de permisos.
- Migración: aplica, revierte y `alembic check` limpio.
- Frontend `AttendancePage.test.tsx`: marca casillas y envía los ids; vista de solo lectura sin botón "Guardar".

## 6. Documentación
- README: sección "Pase de lista". BACKLOG: 12 con la pantalla incluida.
