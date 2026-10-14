# Lecciones aprendidas: 03-calidad-ci

## [2026-10-14] — La carpeta `.github/` no se puede escribir de forma remota
- **Qué pasó:** la copia de `ci.yml` al PC fue rechazada (carpeta protegida).
- **Corrección:** adjuntar el fichero y que Ignacio lo mueva a mano.
- **Aplicar en:** cualquier cambio en `.github/`.

## [2026-10-14] — `POSTGRES_PASSWORD` solo se aplica al crear el volumen
- **Qué pasó:** tras cambiar la contraseña en `.env`, la conexión fallaba con "password authentication failed".
- **Corrección:** `docker compose exec db psql -U apptagaste -c "ALTER USER apptagaste PASSWORD '...';"` y recrear `api`.
- **Aplicar en:** cualquier cambio de credenciales en local.

## [2026-10-14] — Activar ruff pronto
- **Qué pasó:** con poco código, ruff solo marcó 3 cosas (Depends en default, raise sin from, orden de imports por la carpeta `alembic/`).
- **Aplicar en:** mantener `ruff check` y `ruff format` en verde en cada feature.
