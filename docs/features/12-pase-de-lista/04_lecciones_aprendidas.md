# Lecciones aprendidas: 12-pase-de-lista

## [2026-10-19] — Distinguir "ver" de "modificar" en los permisos por grupo
- **Qué pasó:** `ManagedGroup` deja pasar a admin y coordinadores, pero solo los monitores deben pasar lista.
- **Corrección:** nueva dependencia `MonitoredGroup` (`is_monitored_by`) para el `PUT`; el `GET` sigue con `ManagedGroup`. Test de matriz rol × responsable para las dos.
- **Aplicar en:** estadísticas (13) y cualquier acción de escritura sobre un grupo.

## [2026-10-19] — Guardar la lista entera con un upsert
- **Qué pasó:** guardar niño a niño deja listas a medias y obliga a borrar filas.
- **Corrección:** `PUT` con `present_child_ids`; `INSERT ... ON CONFLICT DO UPDATE` para todos los niños del grupo. Sin fila = "sin pasar lista", así un niño nuevo sale pendiente.
- **Aplicar en:** cualquier formulario que guarde un conjunto completo.

## [2026-10-19] — Fin de línea distinto en backend y frontend
- **Qué pasó:** en el PC el frontend está en LF (lo exige Prettier) y el backend y los docs en CRLF.
- **Corrección:** copiar cada fichero con el fin de línea que ya tiene en el repo.
- **Aplicar en:** cada entrega de ficheros al PC.
