# Análisis: 14-biblioteca-documentos

## 1. Petición original
> Rediseño de la Fase 3 (Ignacio, 2026-10-20): "acceder a tu drive desde la aplicación y seleccionar los documentos que quieres subir a la biblioteca de recursos; cada vez que introduzcas un documento debes indicar año y grupo. Posteriormente en la biblioteca puedes acceder a los documentos por años, por cursos e incluso que haya un buscador de texto".
> Decisiones: el grupo no se elimina con el curso; se mantienen las etiquetas; los documentos los abre cualquier monitor o coordinador; Google Docs, PDF y Word; se guarda una **copia del fichero en la app**.

## 2. Objetivo
Base de la biblioteca: guardar documentos con su curso escolar, grupo y etiquetas, con una copia propia del fichero para que no se pierdan, y listarlos por curso, grupo y etiqueta.

## 3. Estado actual del proyecto
- Roles admin, coordinador, monitor y usuario. Última migración: `0007_asistencia`; la nueva será **`0008`**.
- Disco de Render efímero: la copia del fichero va en la base de datos (Neon gratis: 0,5 GB).
- El selector de Drive es la 15, el buscador la 16 y la pantalla completa la 17.

## 4. Alcance
### Dentro de alcance
- Tablas `documents` (nombre, curso escolar, grupo como texto, tipo de fichero, tamaño, origen en Drive opcional, quién y cuándo), `document_files` (contenido, aparte para no cargarlo en los listados), `tags` y `document_tags`. Migración `0008`.
- Añadir un documento con su fichero (solo lectura: sin editar ni borrar en la app) y descargar o abrir la copia.
- Listar filtrando por curso, grupo y etiquetas, y listas de cursos, grupos y etiquetas usados.
- Permisos, tests y README.

### Fuera de alcance
- Selector de Drive (15), extracción de texto y buscador (16), pantalla completa (17), etiquetas automáticas (18).

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Llenar los 0,5 GB de Neon | Media | Alto | Máximo 10 MB por fichero; el README explica cómo ver el espacio usado |
| Un documento subido por error | Media | Bajo | No hay borrado en la app (decisión de Ignacio); si hiciera falta, el admin lo borra en la base de datos |
| Ficheros no permitidos | Media | Bajo | Solo Google Docs (exportados a .docx), PDF y .docx; si no, 422 |

## 6. Preguntas abiertas
- [x] 1. ¿Formato del curso escolar? → **"2025-2026"**, elegido de una lista (el actual y los anteriores), por defecto el actual.
- [x] 2. ¿Cómo se indica el grupo? → **se elige entre los grupos existentes**. Se guarda también su nombre, para que el documento siga clasificado aunque el grupo se borre.
- [x] 3. ¿Se puede añadir también un fichero desde el ordenador, además de desde Drive (15)? → **sí**.
- [x] 4. ¿Quién edita o borra un documento? → **nadie en la app**: los documentos se editan en Drive y se suben ya terminados, solo como recursos de lectura.
- [x] 5. ¿Pantalla en esta feature? → **no**, la 14 es solo backend; la pantalla es la 17.

## 7. Criterios de aceptación
- [x] Un monitor añade un documento con fichero, curso, grupo y etiquetas; las etiquetas nuevas se crean solas y "Perdón" y "perdon" son la misma.
- [x] La lista filtra por curso, grupo y etiquetas (los que tienen todas) y no carga el contenido de los ficheros.
- [x] Monitores, coordinadores y admin descargan la copia; los usuarios reciben 403.
- [x] Ficheros de más de 10 MB o de otro tipo → 422.
- [x] Migración `0008` aplica y revierte sin errores. Tests y ruff en verde en la CI.
