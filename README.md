# AppTagaste

Plataforma web para organizar los grupos de catequesis y eventos de un colegio: calendario de eventos y reuniones, biblioteca de recursos (desde Google Drive) e inscripciones con pase de lista.

> Proyecto en desarrollo. Ver el [backlog](docs/BACKLOG.md) y el [brief](docs/brief.md).

## Stack

- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2, Alembic
- **Base de datos:** PostgreSQL 16
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query
- **Infra:** Docker y docker-compose

## Requisitos

- Docker Desktop (o Docker Engine + Compose)
- Node.js 24 LTS (para el frontend)

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

## Frontend

Con la API levantada (`docker compose up`), en otra terminal:

```bash
cd frontend
npm install        # Solo la primera vez o al cambiar dependencias
npm run dev        # http://localhost:5173
```

En desarrollo, Vite redirige `/api` a `http://localhost:8000`, así que no hace falta configurar nada. Para usar otra API, copia `frontend/.env.example` a `frontend/.env` y cambia `VITE_API_URL`.

```bash
npm run lint       # oxlint + comprobación de formato
npm run format     # Formatea el código con Prettier
npm test           # Tests con Vitest
npm run build      # Build de producción en dist/
```

GitHub Actions ejecuta lint, tests y build del frontend en cada push y PR.

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
frontend/
└── src/
    ├── api/           # Cliente de la API y hooks de TanStack Query
    ├── components/    # Componentes reutilizables (Layout)
    ├── pages/         # Páginas y sus tests
    ├── test/          # Configuración y utilidades de tests
    └── router.tsx     # Rutas de la app
docs/
├── BACKLOG.md         # Features y orden de desarrollo
├── brief.md           # Contexto del proyecto
└── features/          # Análisis, plan y tareas de cada feature
```
