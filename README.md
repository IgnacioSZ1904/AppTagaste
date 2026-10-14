# AppTagaste

Plataforma web para organizar los grupos de catequesis y eventos de un colegio: calendario de eventos y reuniones, biblioteca de recursos (desde Google Drive) e inscripciones con pase de lista.

> Proyecto en desarrollo. Ver el [backlog](docs/BACKLOG.md) y el [brief](docs/brief.md).

## Stack

- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2, Alembic
- **Base de datos:** PostgreSQL 16
- **Frontend:** React (próximamente)
- **Infra:** Docker y docker-compose

## Requisitos

- Docker Desktop (o Docker Engine + Compose)

## Arranque en local

```bash
cp .env.example .env              # 1. Crea tu .env y cambia la contraseña
docker compose up --build         # 2. Levanta la BD y la API
```

3. Comprueba que funciona: http://localhost:8000/api/v1/health → `{"status":"ok","db":"ok"}`
4. Documentación interactiva de la API: http://localhost:8000/docs

## Migraciones (Alembic)

Con los contenedores levantados:

```bash
docker compose exec api alembic upgrade head                          # Aplica las migraciones pendientes
docker compose exec api alembic revision --autogenerate -m "mensaje"  # Crea una migración desde los modelos
docker compose exec api alembic downgrade -1                          # Deshace la última
```

Cada modelo nuevo se importa en `backend/app/models/__init__.py` para que `--autogenerate` lo detecte.

## Tests y calidad

Con los contenedores levantados:

```bash
docker compose exec api pytest -v              # Tests (usan la BD apptagaste_test, se crea sola)
docker compose exec api ruff check .           # Linter
docker compose exec api ruff format .          # Formatea el código
```

GitHub Actions ejecuta el linter y los tests en cada push a `develop`/`master` y en cada PR.

## Estructura

```
backend/
├── alembic/           # Migraciones de la BD
├── tests/             # Tests con pytest
└── app/
    ├── api/v1/        # Routers y endpoints HTTP
    ├── core/          # Configuración (pydantic-settings)
    ├── db/            # Sesión y conexión a la BD
    ├── models/        # Modelos SQLAlchemy
    ├── schemas/       # Esquemas Pydantic (entrada/salida)
    ├── services/      # Lógica de negocio
    └── main.py        # Punto de entrada de FastAPI
docs/
├── BACKLOG.md         # Features y orden de desarrollo
├── brief.md           # Contexto del proyecto
└── features/          # Análisis, plan y tareas de cada feature
```
