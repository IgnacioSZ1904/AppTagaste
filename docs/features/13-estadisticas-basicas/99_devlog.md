# Devlog: 13-estadisticas-basicas

## 2026-10-19
- Análisis validado: solo admin y coordinadores (de todos los grupos); por evento (presentes / total) y por niño (asistencias, faltas, %); filtro de fechas, por defecto el curso actual; exportación CSV; pantalla en esta misma feature; resumen de todos los grupos. Planificación aprobada.
- Implementado backend, sin migración: `services/stats.py` (periodo por defecto, cálculo por grupo, resumen y CSV), endpoints `/stats/groups`, `/groups/{id}/stats` y `/groups/{id}/stats.csv` con la dependencia `EventEditor`; sección "Estadísticas" en el README.
- Implementado frontend: `api/stats.ts` (con descarga autenticada del CSV), página `/estadisticas` con enlace en la cabecera, sección "Estadísticas" en la ficha del grupo, `PeriodFilter` y `canSeeStats`.
- Verificado en la nube: 136 tests de backend (14 nuevos) y 51 de frontend (4 nuevos), ruff, lint y build OK.
- Prueba manual de Ignacio en local: OK.
