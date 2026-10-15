# Devlog: 20-gestion-usuarios-frontend

---

## [2026-10-15] — Inicio del evolutivo
- Feature 19 (roles en backend) mergeada en `develop` (PR #8)
- Análisis redactado

## [2026-10-15] — Análisis aprobado
- Decisiones: cambios en línea con confirmación al dar/quitar admin y al desactivar; alta manual sí; búsqueda y filtro en el navegador; el nombre no se edita
- Planificación redactada

## [2026-10-15] — Planificación aprobada
- Tareas pendientes redactadas (21 tareas en 4 bloques)

## [2026-10-15] — Ejecución de tareas (ficheros)
- Tareas aprobadas; hechas T2.1–T2.11 y T4.1
- Permisos centralizados en `auth/roles.ts`; `RequireRole` recibe una función (`allow`) para reutilizarlo con monitores en las features 10 y 12
- Búsqueda sin tildes con `normalize('NFD')` + `\p{Diacritic}`
- Lint, 26 tests y build en verde; capturas en escritorio y 375 px

## [2026-10-15] — Pruebas manuales y cierre
- Ignacio probó la pantalla de usuarios, los permisos con una cuenta normal y el móvil: todo correcto
- Criterios de aceptación marcados (falta CI en GitHub Actions), lecciones escritas y BACKLOG con la 20 hecha
- Pendiente: push, PR a `develop` y merge
