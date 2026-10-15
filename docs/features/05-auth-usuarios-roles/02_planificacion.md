# Planificación: 05-auth-usuarios-roles

> Revisada el 2026-10-14: login solo con Google (sin contraseñas).

## 1. Enfoque técnico
El frontend obtiene un *ID token* de Google (Google Identity Services) y lo envía al backend. El backend verifica el token con la librería oficial `google-auth`, comprueba que el email está dado de alta y activo, y emite un JWT propio (HS256, 8 h) con el id y el rol. A partir de ahí todo funciona con `Authorization: Bearer` y nuestros roles. La lógica va en `services/`.

## 2. Decisiones de diseño
| Decisión | Alternativas | Justificación |
|----------|--------------|---------------|
| Google solo para identificar; JWT y roles propios | Usar el token de Google en cada petición | Tokens de Google duran 1 h y no llevan nuestro rol; así el resto de la API no depende de Google |
| Verificación con `google-auth` (`verify_oauth2_token`) | Validar el JWT de Google a mano | Librería oficial: comprueba firma, `aud`, emisor y caducidad |
| Lista blanca: solo emails dados de alta | Alta automática en el primer login | Cumple "sin registro público" y minimización de datos |
| Guardar `google_sub` en el primer login y exigir que coincida | Solo email | El `sub` es el id estable de la cuenta aunque cambie el email |
| JWT con `PyJWT` | python-jose | Mantenido y el que usa la documentación oficial |
| Rol como `Enum` en `VARCHAR` + check (`native_enum=False`) | Enum nativo / tabla de roles | Añadir el rol niño será una migración sencilla |
| `SECRET_KEY` con valor solo de desarrollo; la app se niega a arrancar en `production` con él | Obligatoria siempre | No obliga a tocar la CI ahora y protege el despliegue (08) |
| Comando `dev-token` (no en producción) | Endpoint de login de pruebas | Permite usar `/docs` sin frontend y no expone nada por HTTP |
| Alias `Annotated` (`DbSession`, `CurrentUser`) | `Depends` repetido | Menos código y cumple ruff (B008) |

## 3. Cambios por módulo
### `backend/app/`
- `core/config.py`: `secret_key`, `access_token_expire_minutes` (480), `google_client_id`; validación en producción.
- `core/security.py`: `create_access_token`, `decode_access_token`.
- `core/google.py`: `verify_google_token(token) -> GoogleIdentity(sub, email, name)` (único punto que habla con Google; se simula en tests).
- `models/user.py`: `Role` y `User` (id, email único, full_name, google_sub único nullable, role, is_active, created_at). Registrar en `models/__init__.py`.
- `schemas/user.py`: `UserCreate`, `UserUpdate`, `UserRead`; `schemas/auth.py`: `GoogleLogin` (`credential`), `Token`.
- `services/users.py`: `get_by_email`, `create_user`, `update_user`, `list_users`, `login_with_google`.
- `api/deps.py`: `DbSession`, `CurrentUser`, `require_role(*roles)`.
- `api/v1/endpoints/auth.py`: `POST /auth/google`, `GET /auth/me`.
- `api/v1/endpoints/users.py`: `GET /users`, `POST /users` (409), `PATCH /users/{id}` (404; 400 sobre uno mismo).
- `cli.py`: `create-coordinator --email … --name …` y `dev-token --email …`.

### `backend/`
- `requirements.txt`: `google-auth`, `requests` (transporte de google-auth), `PyJWT`, `email-validator`.
- Migración `0002_users` (autogenerate, revisada a mano).
- `tests/`: Google simulado con `monkeypatch`; `test_security.py`, `test_auth.py`, `test_users.py`.

### Raíz
- `.env.example`: `SECRET_KEY` (cómo generarla) y `GOOGLE_CLIENT_ID`.
- `README.md`: crear el OAuth Client ID, el primer coordinador y probar con `dev-token` en `/docs`.

## 4. Modelo de datos / contratos
Tabla `users`: `id` PK, `email` varchar(255) único, `full_name` varchar(120), `google_sub` varchar(255) único nullable, `role` varchar(20) + check, `is_active` bool (true), `created_at` timestamptz (now).

| Método y ruta | Quién | Respuesta |
|---------------|-------|-----------|
| `POST /api/v1/auth/google` `{"credential": "<id token>"}` | Público | `200 {"access_token", "token_type": "bearer"}` · 401 token inválido · 403 no dado de alta/inactivo |
| `GET /api/v1/auth/me` | Autenticado | `200 UserRead` · 401 |
| `GET /api/v1/users` | Coordinador | `200 [UserRead]` · 401/403 |
| `POST /api/v1/users` | Coordinador | `201 UserRead` · 409 · 422 |
| `PATCH /api/v1/users/{id}` | Coordinador | `200 UserRead` · 400 · 404 |

## 5. Plan de pruebas
- Unitarios: JWT válido, caducado y manipulado; verificación de Google rechaza `email_verified=false`.
- Integración (Google simulado): login OK; email no dado de alta → 403; inactivo → 403; `sub` distinto → 401; `/me` con y sin token; monitor 403 vs coordinador; 409; no auto-desactivarse.
- Verificación en la nube con Postgres 16 antes de pasarte los ficheros.
- Manual (Ignacio): migración, `create-coordinator`, `dev-token` + *Authorize* en `/docs`, crear un monitor y comprobar su 403. El login real con Google se prueba en la feature 07.

## 6. Plan de despliegue / migración
- Rama `feature/05-auth-usuarios-roles` desde `develop`.
- Crear un OAuth Client ID (tipo "Aplicación web", origen `http://localhost:5173`) en Google Cloud y ponerlo en `.env`.
- `docker compose up --build` y `alembic upgrade head`.
- Rollback: `alembic downgrade 0001` y revertir el commit.

## 7. Estimación
- Tareas: ~16
- Incertidumbre: baja en backend; el flujo real con Google se valida en la 07.
