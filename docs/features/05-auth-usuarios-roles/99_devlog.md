# Devlog: 05-auth-usuarios-roles

---

## [2026-10-14 09:23] — Inicio del evolutivo
- Features 01–04 mergeadas en `develop`
- Análisis redactado (login con email y contraseña)

## [2026-10-14 09:28] — Análisis aprobado
- Decisiones: email, solo token de acceso de 8 h, Bearer, sin registro público
- Planificación redactada

## [2026-10-14 09:37] — Cambio a login solo con Google
- Ignacio pide autenticación con Google; elige "Solo Google" (sin contraseñas)
- Análisis y planificación reescritos: verificación del ID token con `google-auth`, lista blanca de emails, JWT propio, `google_sub` fijado en el primer login, comando `dev-token`

## [2026-10-14 09:48] — Planificación aprobada
- Tareas pendientes redactadas (19 tareas en 4 bloques)

## [2026-10-14 10:05] — Ejecución de tareas (ficheros)
- Hechas T1.3–T1.4, T2.1–T2.9 y T4.1
- Versiones: google-auth 2.62.0, requests 2.34.2, PyJWT 2.15.1, email-validator 2.3.0
- `role` como `VARCHAR(20)` + `CHECK` (`ck_users_role`): hubo que añadir `create_constraint=True`, que SQLAlchemy no activa por defecto
- Migración `0002_users` generada con autogenerate y revisada; autogenerate posterior sin diferencias; `downgrade 0001` / `upgrade head` OK
- Verificado en la nube con Postgres 16: 26 tests en verde (dos ejecuciones), ruff limpio, `create-coordinator` (y rechazo de duplicado), `dev-token` → `/auth/me` OK, `dev-token` bloqueado en producción, la app no arranca en producción sin `SECRET_KEY`

## [2026-10-14 10:08] — Pruebas manuales completadas (Ignacio)
- T3.1–T3.4 OK en local: migración `0002`, 26 tests, ruff, `create-coordinator`, `dev-token` + *Authorize* en `/docs` (`/auth/me` OK, alta de monitor 201, monitor en `GET /users` → 403)
- T1.2 (OAuth Client ID de Google) se aplaza a la feature 07, donde se prueba el login real

## [2026-10-14 10:10] — Cierre del evolutivo
- Tareas, criterios, lecciones y BACKLOG actualizados antes del commit
- Resumen: la API identifica a coordinadores y monitores con Google y controla permisos por rol; cualquier endpoint futuro protege con `CurrentUser` o `require_role(...)`
