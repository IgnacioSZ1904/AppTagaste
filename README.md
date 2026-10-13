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

3. Comprueba que funciona: http://localhost:8000/api/v1/health → `{"status":"ok"}`
4. Documentación interactiva de la API: http://localhost:8000/docs

## Estructura

```
backend/
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
