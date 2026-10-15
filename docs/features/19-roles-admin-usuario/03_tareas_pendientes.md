# Tareas pendientes: 19-roles-admin-usuario

> Estado: ✅ Completada
> Última actualización: 2026-10-15

## Bloque 1 — Preparación
- [x] T1.1 (manual, Ignacio) — `git checkout develop && git pull && git checkout -b feature/19-roles-admin-usuario`

## Bloque 2 — Implementación
- [x] T2.1 — `models/user.py`: roles `admin` y `usuario`
- [x] T2.2 — Migración `0004_roles_admin_usuario` (check con 4 roles, coordinador → admin; bajada sin perder datos)
- [x] T2.3 — `services/users.py`: alta automática como `usuario` en `login_with_google`; `UserInactiveError`
- [x] T2.4 — `api/deps.py`: `Admin` y `EventEditor`; aplicarlos en `users.py` y `events.py`; mensaje de cuenta desactivada en `auth.py`
- [x] T2.5 — `cli.py`: `create-admin`
- [x] T2.6 — Tests: alta automática, desactivado y matriz de permisos de los 4 roles

## Bloque 3 — Pruebas (manual, Ignacio)
- [x] T3.1 — `docker compose up --build -d` y `docker compose exec api alembic upgrade head`
- [x] T3.2 — `docker compose exec api pytest -v` y ruff → verde
- [x] T3.3 — `/auth/me` con tu `dev-token` → rol `admin`
- [x] T3.4 — Entrar en el frontend con otra cuenta de Google → entra como usuario y solo ve el calendario

## Bloque 4 — Documentación y cierre
- [x] T4.1 — README: roles, `create-admin` y endpoints
- [x] T4.2 — Devlog, lecciones, criterios y BACKLOG (antes del commit)
- [ ] T4.3 (manual, Ignacio) — Commit, push y PR a `develop` con CI en verde
