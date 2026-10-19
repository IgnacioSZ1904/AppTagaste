# Análisis: 12-pase-de-lista

## 1. Petición original
> "vamos con el siguiente" → feature 12 del backlog: `pase-de-lista` (P0), "En cada evento, el monitor marca qué niños de su grupo asistieron".

## 2. Objetivo
Que los responsables de cada grupo pasen lista en cada evento desde el móvil, y que quede guardado quién asistió, para las estadísticas de la 13.

## 3. Estado actual del proyecto
- Grupos (10): responsables (monitores o coordinadores) y niños (solo nombre). Dependencia `ManagedGroup`: admin o responsable del grupo.
- Eventos por grupo (21): un evento tiene uno o varios grupos; sin grupos es **general** (sale en el calendario de todos). Migración `0006`; la nueva será **`0007`**.
- Calendario por grupo (`?group_id=`) e iCal por grupo ya hechos en la 21.

## 4. Alcance
### Dentro de alcance
- Tabla `attendance` (evento, niño, asistió sí/no, quién y cuándo lo marcó). Migración `0007`.
- Ver la lista de un grupo en un evento (todos sus niños con su estado) y guardarla de una vez.
- Pantalla de pase de lista en el frontend (decisión de Ignacio: en esta misma feature).
- Permisos, tests y README.

### Fuera de alcance
- Resúmenes e informes de asistencia (13 `estadisticas-basicas`).

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Datos de menores (asistencia) visibles para quien no debe | Media | Alto | Mismo permiso que los niños: admin y responsables del grupo; tests por rol |
| Pasar lista en un evento que no es del grupo | Media | Bajo | Solo eventos del grupo o generales; si no, 404 |
| Dos monitores pasan lista a la vez | Baja | Bajo | Gana el último guardado; se guarda quién y cuándo |

## 6. Preguntas abiertas
- [x] ¿En qué eventos se pasa lista? → en los del grupo **y en los generales** (los que el grupo ve en su calendario).
- [x] ¿Qué estados tiene la asistencia? → **asistió / no asistió**. Un niño sin marcar aparece como "sin pasar lista".
- [x] ¿Cómo se guarda? → el monitor marca las casillas de los que han venido y pulsa guardar: se guarda la lista entera de una vez (los no marcados quedan como "no asistió").
- [x] ¿Se puede pasar lista antes de que empiece el evento o cambiarla días después? → **sí, sin límites** (para corregir errores). Se guarda quién la modificó por última vez.
- [x] ¿Quién pasa lista? → **los monitores del grupo**. El admin y los coordinadores responsables del grupo pueden ver la lista, pero no marcarla.
- [x] ¿Pantalla en otra feature? → **no: se hace en esta misma**.

## 7. Criterios de aceptación
- [x] Un monitor del grupo ve la lista en un evento: todos los niños con asistió / no asistió / sin pasar lista.
- [x] Guarda la lista de una vez; volver a guardarla la sustituye.
- [x] Un evento que no es del grupo ni general devuelve 404; un niño de otro grupo, 422.
- [x] Solo los monitores del grupo guardan la lista; admin y coordinadores del grupo la ven; el resto recibe 403.
- [x] Pantalla: desde el grupo o el evento, el monitor marca las casillas y guarda.
- [x] Borrar un evento o un niño borra su asistencia.
- [x] Migración `0007` aplica y revierte sin errores. Tests y ruff en verde en la CI.
