# Lecciones aprendidas: 19-roles-admin-usuario

## [2026-10-15] — Las migraciones de datos dependen de los datos de cada entorno
- **Qué pasó:** la migración convertía coordinadores en admin, pero en la BD local de Ignacio no había coordinador; su cuenta acabó como `usuario` y nadie era admin.
- **Corrección:** `create-admin` crea o asciende una cuenta existente, así siempre hay una forma de recuperar el admin sin tocar SQL a mano.
- **Aplicar en:** el despliegue (08): tras migrar en producción, ejecutar `create-admin` y comprobar `/auth/me`.

## [2026-10-15] — Usar `op.f()` con nombres de constraint ya completos
- **Qué pasó:** `op.drop_constraint('ck_users_role', …)` falló porque la convención de nombres lo convirtió en `ck_users_ck_users_role`.
- **Corrección:** `op.f('ck_users_role')` indica a Alembic que el nombre es el definitivo.
- **Aplicar en:** cualquier migración escrita a mano que toque constraints existentes.

## [2026-10-15] — Probar los permisos como matriz de roles
- **Qué pasó:** con 4 roles, comprobar cada endpoint a mano era fácil de olvidar.
- **Corrección:** `test_roles.py` recorre todos los roles con `pytest.mark.parametrize`; un rol nuevo entra solo en los tests.
- **Aplicar en:** grupos (10) y pase de lista (12), que añaden permisos de monitor.
