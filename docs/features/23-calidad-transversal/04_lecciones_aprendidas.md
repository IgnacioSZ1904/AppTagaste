# Lecciones aprendidas: 23-calidad-transversal

## [2026-10-20] — Alembic silenciaba los logs de la app
- **Qué pasó:** en los tests, `caplog` no capturaba nada porque `fileConfig` de `alembic/env.py` desactiva los loggers ya creados.
- **Corrección:** `fileConfig(..., disable_existing_loggers=False)`.
- **Aplicar en:** cualquier herramienta que configure logging desde un `.ini` dentro del mismo proceso.

## [2026-10-20] — ContextVar y dependencias en otro hilo
- **Qué pasó:** el id de usuario guardado en un `ContextVar` desde la dependencia de auth no llegaba al middleware: FastAPI ejecuta las dependencias síncronas en otro hilo con una copia del contexto.
- **Corrección:** guardarlo en `request.state`, que sí se comparte.
- **Aplicar en:** pasar datos de una dependencia al middleware.

## [2026-10-20] — Refactor sin cambiar mensajes
- **Qué pasó:** pasar a `AppError` tocaba todos los endpoints y servicios.
- **Corrección:** mantener los mismos `detail` que antes, así los 179 tests existentes sirvieron de red sin tocarlos.
- **Aplicar en:** refactors amplios: primero el comportamiento observable igual, luego cambios visibles.

## [2026-10-20] — ADRs a posteriori
- **Qué pasó:** las decisiones estaban repartidas en análisis y devlogs de cada feature.
- **Corrección:** un ADR corto por decisión con alternativas y consecuencias, enlazado a su feature.
- **Aplicar en:** escribir el ADR en el análisis de la feature que tome una decisión nueva.
