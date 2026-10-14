# Lecciones aprendidas: 05-auth-usuarios-roles

## [2026-10-14] — Confirmar el método de login antes de planificar
- **Qué pasó:** el plan se hizo con email y contraseña y, ya aprobado, se cambió a Google; hubo que rehacer análisis y plan.
- **Corrección:** en features de autenticación o integraciones, preguntar en el análisis por proveedores externos (Google, etc.).
- **Aplicar en:** features con decisiones de producto visibles para el usuario.

## [2026-10-14] — `Enum` con `native_enum=False` no crea el CHECK por defecto
- **Qué pasó:** la columna `role` quedaba como `VARCHAR` sin restricción.
- **Corrección:** `create_constraint=True` (genera `ck_users_role` con la convención de nombres).
- **Aplicar en:** cualquier columna enumerada.

## [2026-10-14] — Aislar la integración externa en un único módulo
- **Qué pasó:** toda la llamada a Google vive en `core/google.py`; los tests la sustituyen con `monkeypatch` y no necesitan red ni credenciales.
- **Aplicar en:** Drive (feature 15) y cualquier servicio externo.
