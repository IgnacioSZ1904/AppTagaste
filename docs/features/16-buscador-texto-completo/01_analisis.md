# Análisis: 16-buscador-texto-completo

## 1. Petición original
> "seguimos con el siguiente feature" → feature 16 del backlog: `buscador-texto-completo` (P0), "Extracción del texto (Google Docs, PDF, .docx), `tsvector` en español sin tildes, búsqueda de temáticas y dinámicas con fragmento de contexto".
> Idea de Ignacio (2026-10-20): "un buscador de texto que nos permita buscar temáticas tratadas o dinámicas específicas de dentro de un documento".

## 2. Objetivo
Encontrar documentos de la biblioteca por lo que dicen por dentro (p. ej. "dinámica del ovillo", "perdón"), no solo por título o etiqueta, y ver un fragmento con la frase encontrada.

## 3. Estado actual del proyecto
- 14 y 15: documentos PDF y .docx (los Google Docs llegan como .docx) con copia del fichero en `document_files`, curso, grupo y etiquetas; `GET /documents` filtra por curso, grupo y etiquetas.
- Última migración: `0009`; la nueva será **`0010`**.
- PostgreSQL trae búsqueda de texto en español (`tsvector`, `ts_rank`, `ts_headline`) y la extensión `unaccent` (disponible en Neon).

## 4. Alcance
### Dentro de alcance
- Extraer el texto de cada documento al subirlo (PDF con `pypdf`, .docx con `python-docx`) y guardarlo.
- Índice de búsqueda en español, sin tildes ni mayúsculas, con título, etiquetas y texto.
- Búsqueda combinable con los filtros de curso, grupo y etiquetas, ordenada por relevancia y con fragmento de contexto.
- Indexar los documentos que ya están subidos.
- Tests y README.

### Fuera de alcance
- Pantalla del buscador (17). Reconocimiento de texto en PDF escaneados (OCR). Búsqueda por significado con IA.

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| PDF escaneados (imagen) sin texto | Media | Medio | Se guardan igual; se marcan "sin texto" y se encuentran por título y etiquetas |
| Ficheros grandes que tardan en procesarse | Baja | Bajo | Límite de 10 MB ya existente; la extracción tarda poco |
| Neon sin `unaccent` | Baja | Medio | Comprobado que Neon la incluye; la migración la activa |

## 6. Preguntas abiertas
- [x] 1. ¿Dónde se busca? → en el **título, las etiquetas y el texto** del documento (el título y las etiquetas pesan más).
- [x] 2. ¿Cómo se comporta? → **por palabras, sin tildes y con variantes** ("perdonar" encuentra "perdón"); varias palabras = documentos que las tienen todas; frase entre comillas = frase exacta; la última palabra vale empezada ("dinam" encuentra "dinámica").
- [x] 3. ¿Qué devuelve? → la lista de documentos de siempre, **ordenada por relevancia** y con un **fragmento** del texto con las palabras resaltadas.
- [x] 4. ¿Y los documentos ya subidos? → se indexan **solos con la migración** (y un comando `reindex-documents` por si hiciera falta repetirlo).
- [x] 5. ¿PDF escaneados sin texto? → **se aceptan** y se marcan como "sin texto" (se encuentran por título y etiquetas). El OCR, más adelante si hace falta.
- [x] 6. ¿Pantalla en esta feature? → **no**, solo backend; el buscador en pantalla va en la 17.

## 7. Criterios de aceptación
- [x] Al subir un PDF o un .docx se guarda su texto.
- [x] `GET /documents?q=perdon` encuentra documentos que dicen "perdón" o "perdonar" en el texto, el título o las etiquetas, ordenados por relevancia y con fragmento.
- [x] La búsqueda se combina con curso, grupo y etiquetas.
- [x] Los documentos ya subidos quedan indexados tras la migración.
- [x] Migración `0010` aplica y revierte sin errores. Tests y ruff en verde en la CI.
