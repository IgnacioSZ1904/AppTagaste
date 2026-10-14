# Planificación: 02-base-datos-alembic

## 1. Enfoque técnico
Capa `app/db/` con la `Base` declarativa y la sesión de SQLAlchemy 2.0 (síncrona, psycopg 3). Alembic vive en `backend/` y toma la URL y los metadatos de la app, así hay una única fuente de verdad. Las migraciones se aplican a mano con `docker compose exec`. `/health` pasa a comprobar la BD.

## 2. Decisiones de diseño
| Decisión | Alternativas | Justificación |
|----------|--------------|---------------|
| SQLAlchemy síncrono | Async (`asyncpg`) | Más simple de aprender y depurar; FastAPI ejecuta endpoints `def` en un pool de hilos. Suficiente para el volumen previsto |
| Sesión por petición con `get_db()` (`yield`) | Sesión global | Patrón estándar de FastAPI; fácil de sustituir en tests (feature 03) |
| Convención de nombres en `MetaData` | Nombres automáticos de Postgres | Migraciones deterministas y `downgrade` fiable |
| `env.py` lee `get_settings().database_url` | URL en `alembic.ini` | Sin credenciales duplicadas |
| Montar `./backend` entero en el contenedor | Solo `./backend/app` | Alembic y sus migraciones quedan visibles y las nuevas migraciones aparecen en el PC |

## 3. Cambios por módulo
### `backend/app/`
- `db/base.py`: `Base(DeclarativeBase)` con `MetaData(naming_convention=...)`.
- `db/session.py`: `engine` (`pool_pre_ping=True`), `SessionLocal`, `get_db()`.
- `models/__init__.py`: importa `Base` (y en el futuro cada modelo) para autogenerate.
- `api/v1/endpoints/health.py`: `SELECT 1` vía `get_db`; 503 si falla.

### `backend/`
- `alembic.ini` (sin URL) + `alembic/env.py`, `alembic/script.py.mako`, `alembic/versions/`.
- Migración `0001_baseline` vacía.
- `Dockerfile`: `COPY . .` (filtrado por `.dockerignore`).

### Raíz
- `docker-compose.yml`: volumen `./backend:/code`.
- `README.md`: sección "Migraciones".

## 4. Modelo de datos / contratos
- Tabla `alembic_version` (la crea Alembic).
- `GET /api/v1/health` → `200 {"status":"ok","db":"ok"}` | `503 {"detail":"Base de datos no disponible"}`.

## 5. Plan de pruebas
- Unitarios: ninguno (pytest llega en la 03).
- Manual (Ignacio):
  1. `docker compose up --build`
  2. `docker compose exec api alembic upgrade head` → aplica `0001_baseline`.
  3. `docker compose exec db psql -U apptagaste -c "select * from alembic_version"` → 1 fila.
  4. `curl localhost:8000/api/v1/health` → `db: ok`.
  5. `docker compose stop db` y repetir el curl → 503.
  6. `docker compose exec api alembic revision --autogenerate -m prueba` → migración vacía (luego borrarla).

## 6. Plan de despliegue / migración
- Previo: feature 01 ya mergeada en `develop`.
- Rama `feature/02-base-datos-alembic` creada desde `develop`.
- Rollback: `alembic downgrade base` + revertir el commit.

## 7. Estimación
- Tareas: ~9
- Incertidumbre: permisos de ficheros creados por el contenedor en Windows al montar `./backend`.
