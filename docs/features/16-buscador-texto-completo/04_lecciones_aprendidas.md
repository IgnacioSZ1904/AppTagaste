# Lecciones aprendidas: 16-buscador-texto-completo

## [2026-10-20] — Búsqueda en español sin tildes con Postgres
- **Qué pasó:** la configuración `spanish` reconoce variantes ("perdonar" = "perdón") pero distingue tildes.
- **Corrección:** configuración propia `es_unaccent` (copia de `spanish` con `unaccent` antes de las raíces). Sin servicios externos: todo en la base de datos.
- **Aplicar en:** cualquier búsqueda de texto en español.

## [2026-10-20] — La última palabra de la búsqueda vale empezada
- **Qué pasó:** `websearch_to_tsquery` solo encuentra palabras completas, y quien escribe "dinam" espera "dinámica".
- **Corrección:** se separa la última palabra y se une como prefijo (`to_tsquery('dinam:*')`), salvo si la búsqueda acaba en comillas.
- **Aplicar en:** buscadores que se usan mientras se escribe.

## [2026-10-20] — `ts_headline` en modo fragmentos corta la última palabra
- **Qué pasó:** con `MaxFragments` el fragmento perdía la palabra final de la frase.
- **Corrección:** modo normal (`MinWords`/`MaxWords`), que muestra la frase entera cuando es corta.
- **Aplicar en:** fragmentos de contexto; probarlos con frases reales en un test.

## [2026-10-20] — Ficheros de prueba generados en el test
- **Qué pasó:** para probar la extracción hacían falta PDF y Word con texto, sin añadir ficheros binarios al repositorio.
- **Corrección:** `tests/files.py` construye un PDF mínimo a mano y un .docx con `python-docx`.
- **Aplicar en:** tests que necesiten ficheros: generarlos en el código del test.
