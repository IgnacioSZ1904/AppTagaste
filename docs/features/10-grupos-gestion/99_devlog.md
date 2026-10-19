# Devlog: 10-grupos-gestion

## 2026-10-19
- Análisis validado: grupo = solo nombre; varios responsables por grupo (monitores o coordinadores, los asigna el admin); niños = nombre y apellidos; los niños solo los ven y gestionan el admin y los responsables del grupo; borrar un grupo borra sus niños; añadir la 21 `grupos-frontend`. Planificación aprobada.
- Implementado: modelos `Group`, `group_members`, `Child` y migración `0005_grupos`; servicio y endpoints de grupos, responsables y niños; dependencia `ManagedGroup` en `deps.py`; `GET /me/groups`; sección Grupos en el README; 21 `grupos-frontend` en el BACKLOG.
- Decisión: `children_count` como `column_property` (subconsulta), para que la lista pública de grupos no cargue los nombres de los niños.
- Decisión: un responsable que deja de ser monitor o coordinador pierde el acceso aunque siga asignado (se comprueba el rol en cada petición).
- Verificado en la nube: 99 tests en verde (31 nuevos), ruff OK, `alembic check` limpio, `0005` aplica, revierte y vuelve a aplicar.
- Probado por Ignacio en local (tests, ruff y prueba desde `/docs`); PR #14 mergeada en `develop`.
