# Devlog: 06-eventos-crud

## 2026-10-14
- Análisis validado: tipos `reunion`, `convivencia`, `eucaristia`, `otro`; sin grupo (llega en la 10); lectura para todos los autenticados, escritura solo coordinador; borrado físico; siempre inicio y fin con hora (sin "día completo").
- Planificación aprobada sin cambios.
- Implementado modelo `Event`, migración `0003_events`, esquemas, servicio y endpoints `/api/v1/events`.
- Autogenerate duplicó el check del tipo (uno con nombre `event_type` y otro `ck_events_event_type`); se dejó solo el que crea `sa.Enum(create_constraint=True)`. `alembic check` sin diferencias.
- `PATCH` con `null` en un campo obligatorio daba error 500 (NOT NULL en BD); se valida en `EventUpdate` y devuelve 422.
- Verificado en la nube con Postgres 16: migración sube y baja, 38 tests en verde (12 nuevos), ruff OK.
- Pruebas manuales de Ignacio OK. Pidió un formato de fecha más simple: todas las reuniones son en España.
- Cambio: tipo `LocalDateTime` en `schemas/types.py`; las fechas sin zona se interpretan en `Europe/Madrid` (`TIMEZONE` en config) y la API las devuelve como `AAAA-MM-DD HH:MM`. Se añade `tzdata` para que `zoneinfo` funcione en la imagen slim.
- Fallo encontrado al verificar: el serializador convertía también las fechas a texto en `model_dump()` y se guardaban como UTC (una hora desplazadas). Se limita a JSON (`when_used="json"`). 40 tests en verde.
- Ignacio verificó en local el formato nuevo (imagen reconstruida con `tzdata`). Documentación cerrada antes del commit.
