# Devlog: 14-biblioteca-documentos

## 2026-10-20
- Rediseño de la Fase 3 con Ignacio: documentos elegidos del Drive de cada uno desde la app, con curso escolar, grupo y etiquetas, y buscador de texto completo. BACKLOG reescrito (14 biblioteca-documentos, 15 selector-drive, 16 buscador, 17 pantalla, 18 etiquetas con LLM). Decisión: guardar una copia del fichero en la app.
- Análisis validado: curso "2025-2026"; grupo elegido entre los existentes (se copia su nombre); también desde el ordenador; documentos de solo lectura, sin editar ni borrar en la app; solo backend. Planificación aprobada.
- Implementado: modelos `Document`, `DocumentFile`, `Tag` y `document_tags`, migración `0008_biblioteca`; servicio con validación de tipo, tamaño y curso y etiquetas normalizadas; endpoints de documentos, fichero, filtros y etiquetas; dependencia `Librarian`; `python-multipart`; sección "Biblioteca" en el README.
- Verificado en la nube: 156 tests (20 nuevos), ruff OK, `alembic check` limpio, `0008` aplica, revierte y vuelve a aplicar.
- Prueba manual de Ignacio en local (Swagger): OK.

## [2026-10-20] — Arreglo: editar y eliminar documentos
- Ignacio pide poder corregir curso, grupo y etiquetas y eliminar documentos subidos por accidente. Cambia la decisión de "solo lectura": el fichero sigue sin cambiarse, sus datos sí. Se hace como arreglo, sin carpeta de feature
- `PATCH /documents/{id}` (título, curso, grupo y etiquetas; solo lo enviado; recalcula `search_vector`) y `DELETE /documents/{id}` (204, borra la copia en cascada; libera el `drive_file_id`)
- Permisos: quien lo subió, coordinadores y admin (`can_edit` en `DocumentRead`); el resto, 403
- Sin migración. 179 tests y ruff en verde
- La 18 (etiquetas con LLM) queda descartada
