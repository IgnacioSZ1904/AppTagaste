# Lecciones aprendidas: 06-eventos-crud

## [2026-10-14] — Revisar siempre la migración que genera autogenerate
- **Qué pasó:** con `sa.Enum(create_constraint=True)` Alembic añadió además dos `CheckConstraint` del tipo (uno duplicado con otro nombre).
- **Corrección:** borrar los checks sobrantes y comprobar con `alembic check` que no quedan diferencias.
- **Aplicar en:** toda migración nueva.

## [2026-10-14] — Un serializador de Pydantic también afecta a `model_dump()`
- **Qué pasó:** el `PlainSerializer` que da el formato `AAAA-MM-DD HH:MM` convertía las fechas a texto también al pasarlas a la BD, y se guardaban como UTC (una hora desplazadas).
- **Corrección:** `when_used="json"`, así solo se aplica en la respuesta HTTP. Un test comprueba el valor guardado en la BD, no solo el que devuelve la API.
- **Aplicar en:** cualquier tipo con formato propio (fechas, importes…).

## [2026-10-14] — Decidir el formato de fechas con el usuario al principio
- **Qué pasó:** el formato ISO con zona horaria se cambió tras las pruebas a hora de España simple.
- **Corrección:** en el análisis de features con fechas, preguntar cómo las quiere ver y escribir.
- **Aplicar en:** inscripciones (11), pase de lista (12) y frontend del calendario (07).
