# Devlog: 03-calidad-ci

---

## [2026-10-14 08:16] — Inicio del evolutivo
- Feature 02 mergeada en `develop` (PR #2)
- Análisis redactado

## [2026-10-14 08:21] — Análisis aprobado
- Decisiones: BD de test en Postgres, tests dentro del contenedor, CI en push a `develop`/`master` y en PR
- Planificación redactada

## [2026-10-14 08:23] — Planificación aprobada
- Tareas pendientes redactadas (15 tareas en 4 bloques)

## [2026-10-14 08:35] — Ejecución de tareas (ficheros)
- Hechas T1.1–T1.4, T2.1–T2.5 y T4.1
- Versiones: pytest 9.1.1, httpx2 2.13.1 (Starlette marca `httpx` como obsoleto en `TestClient`), ruff 0.17.0
- ruff marcó 3 cosas en código existente: `Depends` en valor por defecto (B008) → `Annotated[Session, Depends(get_db)]`; `raise` sin `from` (B904) → `from None`; imports de `alembic` tomados como locales por la carpeta `alembic/` → `known-third-party`
- `alembic/versions` excluido de ruff (código generado); `path_separator = os` en `alembic.ini` para quitar un aviso de Alembic
- Verificado en la nube con Postgres 16: `apptagaste_test` se crea sola, migra a `0001`, 2 tests en verde (dos ejecuciones seguidas), `ruff check` y `ruff format --check` limpios
