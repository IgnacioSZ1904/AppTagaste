# 0003. Cuatro roles y niños sin cuenta

- **Estado:** Aceptado
- **Fecha:** 2026-10-14
- **Feature:** [19-roles-admin-usuario](../features/19-roles-admin-usuario/), [10-grupos-gestion](../features/10-grupos-gestion/)

## Contexto
La idea inicial incluía cuentas para los niños e inscripciones. Son menores: cuentas propias complican el consentimiento y la privacidad, y no aportan para organizar las reuniones.

## Decisión
- Roles: **admin** (todo y gestión de usuarios), **coordinador** (eventos), **monitor** (sus grupos, niños y pase de lista) y **usuario** (solo calendario; alta automática al entrar con Google).
- Los niños **no tienen cuenta**: solo su nombre dentro de un grupo, visible únicamente para los responsables del grupo y el admin.
- Los permisos se comprueban en el backend con dependencias (`Admin`, `EventEditor`, `ManagedGroup`, `MonitoredGroup`, `Librarian`).

## Alternativas
- **Cuentas para niños o familias con inscripción:** descartado por privacidad y por no ser necesario.
- **Lista blanca de emails:** más control, pero obliga al admin a dar de alta a todos solo para ver el calendario.

## Consecuencias
- Datos de menores mínimos (nombre y asistencia), con borrado al acabar el curso.
- Cualquier cuenta de Google puede ver el calendario; el resto lo abre el admin cambiando el rol.
- Se eliminaron la antigua Fase 4 y la feature 11 (inscripciones).
