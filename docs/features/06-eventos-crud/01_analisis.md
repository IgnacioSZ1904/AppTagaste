# Análisis: 06-eventos-crud

## 1. Petición original
> "vamos con el feature de eventos" → feature 06 del backlog: `eventos-crud` (P0).

## 2. Objetivo
Que los coordinadores puedan crear, editar y borrar eventos y reuniones, y que cualquier usuario autenticado pueda consultarlos. Es la fuente de datos del calendario (07), del iCal (09) y, más adelante, de inscripciones y pase de lista (11, 12).

## 3. Estado actual del proyecto
- Features 01–05 mergeadas en `develop` (PR #5: login con Google, JWT, `CurrentUser`, `require_role`).
- Modelos existentes: `User`. Migraciones `0001` (baseline) y `0002` (users).
- No existe modelo `Grupo` (feature 10).
- Brief: "eventos y reuniones con fecha, tipo y grupo"; las reuniones tendrán inscripción y asistencia; los eventos (convivencias, misas…) no necesariamente.

## 4. Alcance
### Dentro de alcance
- Modelo `Event`: título, descripción (opcional), tipo, inicio y fin (fecha y hora, obligatorios), lugar (opcional), creado por (`User`), fechas de alta y modificación. Migración `0003`.
- Tipo como StrEnum guardado como VARCHAR + CHECK (igual que `Role`).
- Endpoints en `/api/v1/events`:
  - `GET /events` (cualquier usuario autenticado), filtros `desde`, `hasta` y `tipo`, ordenado por inicio.
  - `GET /events/{id}`.
  - `POST`, `PATCH /{id}` y `DELETE /{id}`: solo coordinador.
- Validación: `fin` posterior a `inicio`. Un evento puede durar horas o varios días (sin campo de día completo).
- Tests de CRUD, filtros y permisos.

### Fuera de alcance
- Grupos (feature 10).
- Inscripciones y asistencia (11, 12).
- Eventos recurrentes.
- Calendario en el frontend (07) e iCal (09).

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Zonas horarias mal guardadas | Media | Alto | `TIMESTAMPTZ` y fechas con zona en la API |
| Cambiar el campo grupo en la 10 obliga a migrar datos | Baja | Bajo | Columna `group_id` nullable añadida en la 10 |
| Borrar un evento con inscripciones (fase 2) | Baja | Medio | Se decidirá en la 11 (borrado lógico o bloqueo) |

## 6. Preguntas abiertas
- [x] ¿Qué tipos de evento? → **`reunion`, `convivencia`, `eucaristia`, `otro`**.
- [x] ¿Grupo en esta feature? → **No**; se añade `group_id` en la 10. Hasta entonces, los eventos son de todos.
- [x] ¿Los monitores ven todos los eventos? → **Sí**; todos los autenticados leen, solo el coordinador escribe.
- [x] ¿Borrado físico o lógico? → **Físico**; se revisa en la 11.
- [x] ¿Eventos de día completo? → **No**; siempre fecha y hora de inicio y fin (de 5 horas a 3 días, por ejemplo).

## 7. Criterios de aceptación
- [x] Un coordinador puede crear, editar y borrar eventos; un monitor recibe 403.
- [x] Cualquier usuario autenticado lista eventos filtrando por rango de fechas y tipo; sin token, 401.
- [x] `fin` anterior a `inicio` devuelve 422.
- [x] Las fechas se guardan con zona horaria y la API las usa en hora de España, formato `AAAA-MM-DD HH:MM`.
- [x] Migración `0003` aplica y revierte sin errores.
- [x] Tests y ruff en verde en la CI.
