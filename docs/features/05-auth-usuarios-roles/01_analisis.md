# Análisis: 05-auth-usuarios-roles

## 1. Petición original
> "vamos con el siguiente feature de backend" → feature 05 del backlog: `auth-usuarios-roles` (P0).

## 2. Objetivo
Que coordinadores y monitores puedan iniciar sesión en la API y que cada endpoint sepa quién llama y qué rol tiene. Es la base de permisos de todo lo demás: eventos (06), login del frontend (07), grupos (10)…

## 3. Estado actual del proyecto
- Features 01–04 mergeadas en `develop` (PR #4: frontend con cliente `apiFetch`).
- No hay modelos de negocio; solo la migración baseline `0001`.
- `Settings` no tiene clave secreta ni configuración de tokens.
- Brief: roles coordinador (gestiona eventos, grupos y usuarios), monitor (documentos, inscritos, pasar lista) y niño (fase 4, pendiente de validación legal). Minimización de datos.

## 4. Alcance
### Dentro de alcance
- Modelo `User`: email (único), nombre, `google_sub` (id de Google, se fija en el primer login), rol (`coordinador` | `monitor`), activo, fecha de alta. Migración `0002`. Sin contraseñas.
- Login con Google: el frontend obtiene un *ID token* de Google y lo envía a `POST /api/v1/auth/google`; el backend lo verifica (`google-auth`), busca el email entre los usuarios dados de alta y devuelve un JWT propio (`PyJWT`) con el rol.
- `GET /api/v1/auth/me` → usuario actual.
- Dependencias `get_current_user` y `require_role(...)`.
- Gestión de usuarios solo coordinador: `POST /users`, `GET /users`, `PATCH /users/{id}` (nombre, rol, activo).
- Comandos: `create-coordinator` (primer coordinador por email) y `dev-token` (token para probar en local con *Authorize* de `/docs`; desactivado en producción).
- `SECRET_KEY`, caducidad del token y `GOOGLE_CLIENT_ID` en `.env`.
- Tests de login (Google simulado), permisos y gestión de usuarios.

### Fuera de alcance
- Botón "Iniciar sesión con Google" en el frontend (feature 07).
- Rol niño y acceso por invitación (fase 4; no usarán Google).
- Refresh tokens.

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Aceptar tokens de Google de otra app | Media | Alto | Verificar firma, `aud` = nuestro `GOOGLE_CLIENT_ID`, emisor y `email_verified` |
| Cualquiera con cuenta de Google entra | Media | Alto | Solo emails dados de alta por un coordinador y activos |
| `SECRET_KEY` débil o subida a Git | Media | Alto | Solo en `.env`; la app no arranca en producción con el valor de ejemplo |
| Un coordinador se quita su rol o se desactiva y nadie puede administrar | Baja | Medio | Impedir cambios de rol/estado sobre uno mismo |
| No poder probar el login real hasta tener frontend | Alta | Bajo | Tests con Google simulado + comando `dev-token`; flujo real en la feature 07 |
| Dependencia de crear un OAuth Client ID en Google Cloud | Alta | Bajo | Gratis; paso guiado en las tareas |

## 6. Preguntas abiertas
- [x] ¿Login con email/contraseña o con Google? → **Solo Google** (decisión de Ignacio, 2026-10-14).
- [x] ¿Solo token de acceso (p. ej. 8 h) o acceso + refresh? → Solo acceso de 8 h.
- [x] ¿Token propio en cabecera `Authorization: Bearer` o en cookie httpOnly? → Bearer.
- [x] ¿Sin registro público (primer coordinador por comando y el resto los da de alta un coordinador)? → Sí.

## 7. Criterios de aceptación
- [x] Token de Google válido de un usuario dado de alta y activo → JWT propio; token inválido → 401; email no dado de alta o inactivo → 403.
- [x] `/auth/me` sin token → 401; con token → datos del usuario.
- [x] Endpoints de usuarios: monitor → 403; coordinador → OK; email duplicado → 409.
- [x] Los comandos `create-coordinator` y `dev-token` funcionan (y `dev-token` no en producción).
- [x] Tests en verde en local y en CI; ruff limpio.
