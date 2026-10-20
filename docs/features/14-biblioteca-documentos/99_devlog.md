# Devlog: 14-biblioteca-documentos

## 2026-10-20
- Rediseño de la Fase 3 con Ignacio: documentos elegidos del Drive de cada uno desde la app, con curso escolar, grupo y etiquetas, y buscador de texto completo. BACKLOG reescrito (14 biblioteca-documentos, 15 selector-drive, 16 buscador, 17 pantalla, 18 etiquetas con LLM). Decisión: guardar una copia del fichero en la app.
- Análisis validado: curso "2025-2026"; grupo elegido entre los existentes (se copia su nombre); también desde el ordenador; documentos de solo lectura, sin editar ni borrar en la app; solo backend. Planificación aprobada.
- Implementado: modelos `Document`, `DocumentFile`, `Tag` y `document_tags`, migración `0008_biblioteca`; servicio con validación de tipo, tamaño y curso y etiquetas normalizadas; endpoints de documentos, fichero, filtros y etiquetas; dependencia `Librarian`; `python-multipart`; sección "Biblioteca" en el README.
- Verificado en la nube: 156 tests (20 nuevos), ruff OK, `alembic check` limpio, `0008` aplica, revierte y vuelve a aplicar.
- Prueba manual de Ignacio en local (Swagger): OK.
