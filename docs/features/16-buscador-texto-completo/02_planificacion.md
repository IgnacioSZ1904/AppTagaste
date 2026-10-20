# Planificación: 16-buscador-texto-completo

> Estado: pendiente de aprobación
> Basado en: 01_analisis.md (todas las propuestas aprobadas el 2026-10-20)

## 1. Base de datos (migración `0010_buscador`)
- Extensión `unaccent` y configuración de búsqueda `es_unaccent`: español con raíces ("perdonar" = "perdón") y sin tildes.
- `documents.content_text` (texto extraído; vacío = "sin texto") y `documents.search_vector` (`tsvector`) con índice GIN.
- Pesos del índice: título y etiquetas **A**, texto **C**.
- La migración extrae el texto de los documentos que ya están subidos y los indexa.

## 2. Extracción del texto
- `services/text_extraction.py`: PDF con `pypdf`, .docx con `python-docx` (párrafos y tablas). Si falla o no hay texto (PDF escaneado), queda vacío y el documento se guarda igual.
- Al subir un documento se extrae su texto y se actualiza `search_vector`.
- Comando `python -m app.cli reindex-documents`: vuelve a extraer e indexar todos.
- Dependencias nuevas: `pypdf` y `python-docx`.

## 3. API
- `GET /documents?q=...`, combinable con `school_year`, `group` y `tag`.
  - Palabras sin tildes y con variantes; varias palabras = todas; "frase entre comillas" = exacta (`websearch_to_tsquery`); la última palabra vale empezada ("dinam" → "dinámica").
  - Ordenado por relevancia (`ts_rank`).
- `DocumentRead` gana `has_text` (false = sin texto) y `snippet`: con `q`, fragmento del texto con las palabras entre `<mark>` y `</mark>` (`ts_headline`); sin `q`, `null`. La 17 lo pintará sin usar HTML crudo.

## 4. Tests
- `test_text_extraction.py`: texto de un PDF y de un .docx generados en el test; PDF sin texto → vacío.
- `test_documents.py`: búsqueda en texto, título y etiquetas; sin tildes y con variantes; varias palabras; frase exacta; prefijo; orden por relevancia; fragmento con `<mark>`; combinada con filtros; `has_text`; comando `reindex-documents`.
- Migración: aplica (indexando documentos existentes), revierte y `alembic check` limpio.

## 5. Documentación
- README: sección "Buscador" (cómo buscar, `reindex-documents`, PDF escaneados).
