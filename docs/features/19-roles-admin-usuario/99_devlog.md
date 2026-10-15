# Devlog: 19-roles-admin-usuario

## 2026-10-14
- Cambio de producto aprobado por Ignacio: sin cuentas de niños; roles admin, coordinador, monitor y usuario. La 19 se trae al hilo de backend.

## 2026-10-15
- Análisis validado con todas las propuestas; planificación aprobada sin cambios.
- Implementado: roles `admin` y `usuario`, alta automática como `usuario` en el login con Google, `Admin` y `EventEditor` en `deps.py`, `create-admin`, migración `0004`.
- La migración falló al principio con `drop_constraint('ck_users_role')`: la convención de nombres lo convertía en `ck_users_ck_users_role`. Se usa `op.f('ck_users_role')` para indicar que el nombre ya es el final.
- Probada la migración con datos: coordinador → admin; bajada: admin → coordinador y usuario → monitor; `alembic check` sin diferencias.
- `make_user` crea admin por defecto. Nuevo `test_roles.py` con la matriz de permisos de los 4 roles. 55 tests en verde, ruff OK.
- README: tabla de roles, `create-admin` y aviso de que en modo *Prueba* de Google solo entran los usuarios de prueba.
- Prueba de Ignacio: el alta automática funciona, pero su cuenta aparecía como `usuario` (probablemente su BD local no tenía su coordinador al migrar, así que al entrar con Google se dio de alta como usuario). `create-admin` ahora asciende y reactiva una cuenta existente en lugar de fallar. Nuevo `test_cli.py`; 57 tests en verde.
- Ignacio verificó en local: alta automática como usuario y su cuenta ascendida a admin con `create-admin`. Documentación cerrada antes del commit.
