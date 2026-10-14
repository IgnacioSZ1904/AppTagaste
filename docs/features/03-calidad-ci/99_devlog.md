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

## [2026-10-14 08:45] — Pruebas manuales completadas (Ignacio)
- `.github/workflows/ci.yml` creado a mano: las herramientas remotas no pueden escribir en `.github/`
- Incidencia: `pytest` falló con "password authentication failed": la contraseña de `.env` no coincidía con la del volumen de Postgres (solo se aplica al crearlo). Solución: `ALTER USER apptagaste PASSWORD '...'` desde `psql` en el contenedor
- T3.1–T3.3 OK en local; PR #3 con CI en verde (lint + test) y mergeada en `develop`; CI también en verde tras el merge

## [2026-10-14 08:50] — Cierre del evolutivo
- Tareas, criterios, lecciones y BACKLOG actualizados
- Resumen: cada push y PR pasa ruff y pytest contra Postgres 16 en GitHub Actions; las siguientes features deben llegar con tests
