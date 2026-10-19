# Lecciones aprendidas: 10-grupos-gestion

## [2026-10-19] — Los permisos sobre datos de menores se comprueban por grupo, no solo por rol
- **Qué pasó:** "monitor" no basta: un monitor solo debe ver a los niños de sus grupos.
- **Corrección:** dependencia `ManagedGroup` (admin o responsable del grupo) y test de matriz rol × responsable/no responsable.
- **Aplicar en:** pase de lista (12) y estadísticas (13): reutilizar `ManagedGroup`.

## [2026-10-19] — Contar sin exponer
- **Qué pasó:** la lista de grupos es pública para cualquier usuario, pero los nombres de los niños no.
- **Corrección:** `children_count` como `column_property` (subconsulta `COUNT`); el esquema público no incluye la relación `children`.
- **Aplicar en:** cualquier listado público que resuma datos privados.

## [2026-10-19] — El rol se comprueba en cada petición
- **Qué pasó:** un responsable al que el admin cambia a `usuario` seguiría en `group_members`.
- **Corrección:** `is_managed_by` exige ser responsable **y** tener rol monitor o coordinador; hay un test para ello.
- **Aplicar en:** cualquier permiso que combine pertenencia y rol.

## [2026-10-19] — Revisar el nombre de los ficheros que genera Alembic
- **Qué pasó:** `--autogenerate` creó `0005_grupos_grupos_responsables_y_niños.py`, con tildes y eñe en el nombre.
- **Corrección:** renombrarlo a `0005_grupos.py` y quitar los comentarios autogenerados, como en las migraciones anteriores.
- **Aplicar en:** cada migración nueva.
