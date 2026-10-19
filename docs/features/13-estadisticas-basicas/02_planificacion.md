# Planificación: 13-estadisticas-basicas

> Estado: pendiente de aprobación
> Basado en: 01_analisis.md (preguntas abiertas resueltas el 2026-10-19)

## 1. Modelo de datos
- Sin migración: todo se calcula con `attendance` (12), `children` y `events`.

## 2. Permisos
- Solo **admin y coordinadores** (dependencia existente `EventEditor`, de todos los grupos). Monitores y usuarios → 403.

## 3. API (`/api/v1`)
Parámetros comunes: `from` y `to` (`AAAA-MM-DD`, ambos incluidos). Por defecto, del 1 de septiembre del curso actual a hoy. Eventos del grupo **y generales** que empiezan en el periodo.

| Método y ruta | Respuesta |
|---------------|-----------|
| `GET /stats/groups` | `[{group_id, name, children_count, events_taken, rate}]`: % de asistencia de cada grupo |
| `GET /groups/{id}/stats` | `{group_id, from, to, events: [{event_id, title, starts_at, present, absent, taken}], children: [{child_id, full_name, present, absent, rate}]}` |
| `GET /groups/{id}/stats.csv` | El mismo resumen en CSV: una fila por niño, una columna por evento (Sí / No / vacío), asistencias, faltas y % |

- `rate` = asistencias / (asistencias + faltas), en %, redondeado a entero; `null` si no hay ninguna lista pasada.
- Los eventos sin lista pasada salen con `taken: false` y no cuentan en el %.
- CSV preparado para Excel en español: separador `;` y UTF-8 con BOM (para las tildes). Nombre: `asistencia-<grupo>-<desde>-<hasta>.csv`.
- `from` posterior a `to` → 422.

## 4. Frontend
- `api/stats.ts`: `useGroupsStats`, `useGroupStats` y descarga del CSV (con el token, como blob).
- Página `/estadisticas` (admin y coordinadores, enlace en la cabecera): filtro de fechas y tabla con el % de cada grupo, que enlaza a su ficha.
- Ficha del grupo (`GroupPage`): sección "Estadísticas" para admin y coordinadores: filtro de fechas, tabla por evento, tabla por niño y botón "Descargar CSV". Aviso de privacidad.
- `roles.ts`: `canSeeStats` (admin y coordinador).

## 5. Tests
- Backend `test_stats.py`: cálculo por evento y por niño, eventos sin lista, eventos generales y de otro grupo, periodo por defecto y `from > to`, CSV (cabecera, `;`, BOM, Sí/No). `test_roles.py`: matriz de permisos.
- Frontend `StatsPage.test.tsx`: tabla de grupos; sección del grupo con sus tablas; oculta para monitores.

## 6. Documentación
- README: sección "Estadísticas". BACKLOG: 13 con la pantalla incluida.
