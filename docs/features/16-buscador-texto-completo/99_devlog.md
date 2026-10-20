# Devlog: 16-buscador-texto-completo

## 2026-10-20
- Análisis validado con todas las propuestas: título, etiquetas y texto (los dos primeros pesan más); español sin tildes y con variantes; varias palabras = todas, frase exacta entre comillas, última palabra empezada; orden por relevancia con fragmento; indexado en la migración y comando `reindex-documents`; PDF escaneados marcados "sin texto", sin OCR; solo backend. Planificación aprobada.
- Implementado: `services/text_extraction.py` (`pypdf` y `python-docx`, con tablas de Word), migración `0010_buscador` (extensión `unaccent`, configuración `es_unaccent`, `content_text`, `search_vector` con índice GIN e indexado de los ya subidos), indexado al subir, `GET /documents?q=` con `ts_rank` y `ts_headline`, campos `has_text` y `snippet`, comando `reindex-documents`; README sección "Buscador".
- Verificado en la nube: 169 tests (11 nuevos), ruff y `alembic check` OK; `0010` aplica, revierte, vuelve a aplicar e indexa un documento existente.
- Prueba manual de Ignacio en local: OK.
