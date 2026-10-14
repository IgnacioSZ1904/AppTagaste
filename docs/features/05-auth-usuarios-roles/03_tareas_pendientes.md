# Tareas pendientes: 05-auth-usuarios-roles

> Estado: ✅ Completada
> Última actualización: 2026-10-14

## Bloque 1 — Preparación
- [x] T1.1 (manual, Ignacio) — `git checkout develop && git pull && git checkout -b feature/05-auth-usuarios-roles`
- [ ] T1.2 (manual, Ignacio) — Crear un OAuth Client ID en Google Cloud (tipo "Aplicación web", origen `http://localhost:5173`) y ponerlo en `.env` como `GOOGLE_CLIENT_ID` (guía en el README) → **se pasa a la feature 07** (no hace falta para probar la 05)
- [x] T1.3 — `requirements.txt`: `google-auth`, `requests`, `PyJWT`, `email-validator`
- [x] T1.4 — `core/config.py` y `.env.example`: `SECRET_KEY`, caducidad del token, `GOOGLE_CLIENT_ID`, validación en producción

## Bloque 2 — Implementación
- [x] T2.1 — `models/user.py` (`Role`, `User`) y registro en `models/__init__.py`
- [x] T2.2 — Migración `0002_users`
- [x] T2.3 — `core/security.py` (JWT) y `core/google.py` (verificación del token de Google)
- [x] T2.4 — `schemas/user.py` y `schemas/auth.py`
- [x] T2.5 — `services/users.py` (incluye `login_with_google`)
- [x] T2.6 — `api/deps.py`: `DbSession`, `CurrentUser`, `require_role`
- [x] T2.7 — Endpoints `auth.py` (`/auth/google`, `/auth/me`) y `users.py`; registrar en el router
- [x] T2.8 — `cli.py`: `create-coordinator` y `dev-token`
- [x] T2.9 — Tests: `test_security.py`, `test_auth.py`, `test_users.py` (Google simulado)

## Bloque 3 — Pruebas (manual, Ignacio)
- [x] T3.1 — `docker compose up --build -d` y `docker compose exec api alembic upgrade head`
- [x] T3.2 — `docker compose exec api pytest -v` y ruff → verde
- [x] T3.3 — `create-coordinator` con tu email y `dev-token` → *Authorize* en `/docs`: `/auth/me` OK
- [x] T3.4 — Crear un monitor con `POST /users`, `dev-token` del monitor → `GET /users` da 403

## Bloque 4 — Documentación y cierre
- [x] T4.1 — README: Google Client ID, primer coordinador y `dev-token`
- [x] T4.2 — Devlog, lecciones, criterios y BACKLOG (antes del commit)
- [ ] T4.3 (manual, Ignacio) — Commit, push y PR a `develop` con CI en verde
