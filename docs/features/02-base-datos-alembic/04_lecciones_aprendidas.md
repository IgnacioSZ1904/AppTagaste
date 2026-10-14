# Lecciones aprendidas: 02-base-datos-alembic

## [2026-10-14] — "failed to execute bake" al construir
- **Qué pasó:** `docker compose up --build` falló al instante sin llegar al Dockerfile.
- **Corrección:** esperar a que Docker Desktop muestre "Engine running" y reintentar; si persiste, `$env:COMPOSE_BAKE="false"`.
- **Aplicar en:** cualquier build tras reiniciar el PC.

## [2026-10-14] — `curl` en PowerShell es `Invoke-WebRequest`
- **Qué pasó:** pide confirmación y muestra los 503 como excepción.
- **Corrección:** usar `curl.exe` en los comandos de prueba que se pasen a Ignacio.
- **Aplicar en:** todas las features.

## [2026-10-14] — Probar contra un Postgres real en la nube antes de pasar comandos
- **Qué pasó:** con un Postgres 16 local en la nube se validaron migraciones y `/health` antes de que Ignacio probara; sus pruebas salieron a la primera.
- **Aplicar en:** features con cambios de BD.
