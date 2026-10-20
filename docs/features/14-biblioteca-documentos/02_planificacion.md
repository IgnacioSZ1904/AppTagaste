# Planificación: 14-biblioteca-documentos

> Estado: pendiente de aprobación
> Basado en: 01_analisis.md (preguntas abiertas resueltas el 2026-10-20)

## 1. Modelo de datos (migración `0008_biblioteca`)
- `documents`: `title`, `school_year` ("2025-2026"), `group_id` (FK a `groups`, `ON DELETE SET NULL`) y `group_name` (copia del nombre, para que siga clasificado aunque se borre el grupo), `filename`, `mime_type`, `size`, `drive_file_id` (opcional, para la 15), `created_by_id` (FK a `users`, `SET NULL`), `created_at`.
- `document_files`: `document_id` (PK, FK `CASCADE`) y `content` (bytes). Tabla aparte para que los listados no carguen los ficheros.
- `tags`: `name` (como se escribió la primera vez) y `slug` único (minúsculas y sin tildes: "Perdón" = "perdon").
- `document_tags`: N:M entre documentos y etiquetas.
- Sin edición ni borrado en la app: los documentos son de solo lectura.

## 2. Permisos
- Ver, descargar y añadir: **admin, coordinadores y monitores** (nueva dependencia `Librarian`). Usuarios → 403.

## 3. API (`/api/v1`)
| Método y ruta | Qué hace |
|---------------|----------|
| `POST /documents` (multipart) | Campos: `file`, `school_year`, `group_id`, `title` (opcional; por defecto el nombre del fichero), `tags` (separadas por comas). Devuelve el documento (201) |
| `GET /documents?school_year=&group=&tag=&tag=` | Lista sin contenido, del más nuevo al más antiguo. `group` filtra por nombre guardado; varias `tag` = los que tienen todas |
| `GET /documents/{id}` | Datos del documento |
| `GET /documents/{id}/file` | La copia del fichero, para abrirla en el navegador (`inline`) |
| `GET /documents/filters` | Cursos, grupos y etiquetas usados en la biblioteca (para los filtros de la 17) |
| `GET /tags` | Todas las etiquetas |

- Tipos admitidos: **PDF y Word (.docx)**, comprobando también los primeros bytes del fichero. Los Google Docs llegarán en la 15 exportados a .docx. Otro tipo → 422; más de 10 MB → 413.
- `school_year` con formato `AAAA-AAAA` y años seguidos; grupo inexistente → 422.
- Nueva dependencia `python-multipart` (la necesita FastAPI para recibir ficheros).

## 4. Tests
- `test_documents.py`: añadir PDF y .docx, etiquetas nuevas y repetidas con o sin tilde, filtros (curso, grupo, varias etiquetas), descargar el fichero, tipo no admitido, tamaño máximo, curso mal escrito, grupo inexistente, el documento conserva el nombre del grupo al borrarlo.
- `test_roles.py`: matriz de permisos.
- Migración: aplica, revierte y `alembic check` limpio.

## 5. Documentación
- README: sección "Biblioteca" (endpoints, tipos y límite, espacio en Neon).
