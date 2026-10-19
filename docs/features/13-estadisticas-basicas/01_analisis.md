# Análisis: 13-estadisticas-basicas

## 1. Petición original
> "seguimos" → siguiente feature del backlog: 13 `estadisticas-basicas` (P2), "Asistencia por grupo y evento para admin y coordinador; informes exportables".

## 2. Objetivo
Ver de un vistazo cuánto asiste cada grupo y cada niño, y sacar un informe para el colegio o las familias.

## 3. Estado actual del proyecto
- Pase de lista (12): tabla `attendance` (evento, niño, asistió sí/no). Sin fila = sin pasar lista.
- Permisos por grupo: `ManagedGroup` (admin y responsables del grupo).
- No hace falta migración nueva: todo se calcula con lo que ya hay.

## 4. Alcance
### Dentro de alcance
- Resumen por grupo en un periodo: por evento (presentes / total) y por niño (asistencias / eventos con lista pasada, %).
- Exportar el resumen.
- Pantalla en el frontend (si se aprueba la pregunta 5).
- Permisos, tests y README.

### Fuera de alcance
- Gráficas avanzadas, comparativas entre cursos, avisos automáticos por faltas.

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Datos de menores en un fichero exportado que circula | Media | Alto | Solo admin y coordinadores exportan; aviso de privacidad en la pantalla |
| Los coordinadores verán nombres de niños de grupos de los que no son responsables | Segura | Medio | Decisión de Ignacio (pregunta 1); solo en estadísticas, no en la gestión de niños |
| Eventos sin lista pasada falsean el % | Alta | Medio | No cuentan en el %; se muestran como "sin pasar" |

## 6. Preguntas abiertas
- [x] 1. ¿Quién ve las estadísticas? → **admin y coordinadores** (de todos los grupos). Los monitores no.
- [x] 2. ¿Qué se muestra? → **por evento** (presentes / total) y **por niño** (asistencias, faltas y %).
- [x] 3. ¿Qué periodo? → **filtro de fechas**, por defecto el curso actual (desde el 1 de septiembre hasta hoy).
- [x] 4. ¿Formato del informe? → **CSV** (se abre en Excel). PDF fuera de alcance.
- [x] 5. ¿Pantalla en esta misma feature? → **sí**, una sección "Estadísticas" en la ficha del grupo.
- [x] 6. ¿Resumen de todos los grupos juntos? → **sí**, una tabla con el % de cada grupo (admin y coordinadores).

## 7. Criterios de aceptación
- [x] El resumen de un grupo devuelve, en el periodo, cada evento con presentes / total y cada niño con asistencias, faltas y %.
- [x] Los eventos sin lista pasada no cuentan en el % y aparecen como "sin pasar".
- [x] Exportar descarga un CSV que se abre bien en Excel (tildes incluidas).
- [x] Solo admin y coordinadores ven las estadísticas; monitores y usuarios reciben 403.
- [x] Tests, ruff, lint y build en verde en la CI.
