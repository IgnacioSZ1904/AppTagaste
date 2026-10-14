# Análisis: 02-base-datos-alembic

## 1. Petición original
> "vamos con el siguiente feature" → feature 02 del backlog: `base-datos-alembic` (P0).

## 2. Objetivo
Conectar la API a PostgreSQL con SQLAlchemy 2.0 y dejar Alembic listo para versionar el esquema, de modo que las features siguientes (usuarios, eventos…) solo tengan que añadir modelos y generar migraciones.

## 3. Estado actual del proyecto
- Feature 01 cerrada y mergeada en `develop`.
- `core/config.py` ya expone `database_url` (`postgresql+psycopg://…`).
- `requirements.txt` ya incluye `sqlalchemy==2.1.4`, `psycopg[binary]==3.3.6`, `alembic==1.20.0`.
- Paquetes `app/db/` y `app/models/` vacíos.
- `Dockerfile` solo copia `app/` y `docker-compose.yml` solo monta `./backend/app` → los ficheros de Alembic (fuera de `app/`) no llegarían al contenedor.

## 4. Alcance
### Dentro de alcance
- `app/db/base.py`: `Base` declarativa con convención de nombres para constraints.
- `app/db/session.py`: `engine`, `SessionLocal` y dependencia `get_db()` para FastAPI.
- Alembic en `backend/` (`alembic.ini`, `alembic/env.py`) leyendo la URL de `Settings`, no del `.ini`.
- Primera migración "baseline" vacía para validar el circuito.
- `GET /api/v1/health` comprueba la BD (`SELECT 1`).
- Ajustar `Dockerfile` y `docker-compose.yml` para incluir Alembic.
- README: comandos de migración.

### Fuera de alcance
- Modelos de negocio (Usuario → feature 05, Evento → 06).
- BD de tests y pytest (feature 03).

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Alembic usa otra URL que la app | Media | Medio | `env.py` lee `get_settings().database_url` |
| Autogenerate no detecta modelos | Media | Medio | Importar todos los modelos en `app/models/__init__.py` |

## 6. Preguntas abiertas
- [x] ¿Migraciones automáticas al arrancar el contenedor (`alembic upgrade head` antes de uvicorn) o manuales con `docker compose exec api alembic upgrade head`? Propuesta: **manuales** (más control mientras aprendes). → Manuales.
- [x] ¿`/health` comprueba la BD? Propuesta: **sí**, devolviendo `{"status":"ok","db":"ok"}`. → Sí.
- [x] ¿Primera migración vacía (baseline) o esperar a tener un modelo? Propuesta: **baseline vacía**. → Vacía.

## 7. Criterios de aceptación
- [x] `docker compose exec api alembic upgrade head` se ejecuta sin errores y crea `alembic_version`.
- [x] `GET /api/v1/health` devuelve `db: ok` con Postgres arriba y error 503 si no.
- [x] `alembic revision --autogenerate` funciona (sin cambios = migración vacía).
- [x] La URL de BD solo se define en `.env`.
- [x] README documenta crear y aplicar migraciones.
