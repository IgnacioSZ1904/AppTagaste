# 0008. Buscador con el texto completo de PostgreSQL

- **Estado:** Aceptado
- **Fecha:** 2026-10-20
- **Feature:** [16-buscador-texto-completo](../features/16-buscador-texto-completo/)

## Contexto
Se quiere buscar temáticas y dinámicas dentro del contenido de los documentos, en español, sin depender de tildes. Son cientos de documentos, no millones.

## Decisión
- Al subir un documento se extrae su texto (`pypdf` y `python-docx`).
- PostgreSQL indexa título, etiquetas (peso A) y texto (peso C) en una columna `tsvector` con índice GIN y una configuración española sin tildes (`es_unaccent`, extensión `unaccent`).
- `GET /documents?q=` ordena por relevancia y devuelve un fragmento con lo encontrado entre `<mark>`.
- Los PDF escaneados se guardan con `has_text: false` (sin OCR).

## Alternativas
- **Elasticsearch / Meilisearch:** mejor relevancia y tolerancia a erratas, pero otro servicio que alojar (sin opción gratuita cómoda).
- **`LIKE '%texto%'`:** sin raíces de palabras ni relevancia, y lento con textos largos.

## Consecuencias
- Un solo servicio de datos; el índice se actualiza en la misma transacción.
- Sin tolerancia a erratas. Comando `reindex-documents` para rehacer el índice.
- El fragmento llega sin escapar: el frontend lo pinta como texto, nunca como HTML.
