# Lecciones aprendidas: 20-gestion-usuarios-frontend

## [2026-10-15] — Permisos en un solo sitio
- **Qué pasó:** con 4 roles, comprobar `user.role === 'coordinador'` en cada componente habría dejado fuera al admin.
- **Corrección:** funciones `canEditEvents` y `canManageUsers` en `auth/roles.ts`, y `RequireRole` recibe una de ellas.
- **Aplicar en:** features 10 y 12 (monitores): añadir una función nueva en vez de comparar roles sueltos.

## [2026-10-15] — Buscar texto en los tests sin ambigüedad
- **Qué pasó:** el nombre del admin sale en la cabecera y en su fila (con "(tú)"), y el test encontró el de la cabecera.
- **Corrección:** buscar dentro de la lista `Usuarios` con `within(...)`.
- **Aplicar en:** tests de pantallas que repiten datos del usuario logueado.

## [2026-10-15] — Preparar el código mientras se aprueba el plan
- **Qué pasó:** escribir el código en paralelo (sin copiarlo hasta tener la aprobación) dejó la feature lista para probar justo al aprobar las tareas.
- **Aplicar en:** features pequeñas con el plan claro.
