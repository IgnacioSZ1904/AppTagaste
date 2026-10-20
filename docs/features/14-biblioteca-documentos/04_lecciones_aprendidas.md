# Lecciones aprendidas: 14-biblioteca-documentos

## [2026-10-20] — Pensar dónde viven los ficheros antes de diseñar
- **Qué pasó:** Render gratis borra su disco en cada despliegue, y dejar el fichero solo en el Drive del autor permitía perderlo o no poder abrirlo.
- **Corrección:** copia del fichero en la base de datos (máx. 10 MB), en la tabla `document_files`, aparte de `documents` para que los listados no la carguen.
- **Aplicar en:** la 15 (los ficheros de Drive se descargan y se guardan igual) y la 16 (el texto extraído se guarda junto al documento).

## [2026-10-20] — Copiar el dato que debe sobrevivir a su origen
- **Qué pasó:** los grupos se borran al acabar el curso, pero los recursos de otros años deben seguir clasificados.
- **Corrección:** `group_id` con `ON DELETE SET NULL` más `group_name` copiado al subir; test que borra el grupo.
- **Aplicar en:** cualquier histórico que dependa de datos que se borran.

## [2026-10-20] — Comprobar el tipo por el contenido, no por el nombre
- **Qué pasó:** el navegador manda el tipo y el nombre que quiera.
- **Corrección:** PDF por `%PDF-`; .docx por ser un zip con `word/document.xml`. Si no, 422.
- **Aplicar en:** cualquier subida de ficheros.

## [2026-10-20] — Rutas fijas antes que rutas con parámetro
- **Qué pasó:** `/documents/filters` debe ir antes de `/documents/{document_id}`, o "filters" se interpretaría como id.
- **Corrección:** se declara antes, con un comentario.
- **Aplicar en:** cualquier router con rutas fijas y con parámetros en el mismo nivel.
