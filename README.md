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

## Autenticación con Google

Todos entran con su cuenta de Google. Quien entra por primera vez sin estar dado de alta queda como **usuario** (solo ve el calendario); el admin puede cambiarle el rol o desactivarlo.

| Rol | Puede |
|-----|-------|
| `admin` | Todo, incluida la gestión de usuarios |
| `coordinador` | Crear, editar y borrar eventos |
| `monitor` | Ver el calendario (grupos y pase de lista llegarán en las features 10 y 12) |
| `usuario` | Ver el calendario |

**1. Crear el OAuth Client ID** (una vez, gratis):
1. Entra en [Google Cloud Console](https://console.cloud.google.com/) y crea un proyecto (p. ej. `AppTagaste`).
2. *APIs y servicios → Pantalla de consentimiento de OAuth*: tipo **Externo**, nombre de la app y tu email; añade tu cuenta como usuario de prueba. Mientras la app esté en modo *Prueba*, solo pueden entrar las cuentas añadidas como usuarios de prueba; para que entre cualquiera, pulsa *Publicar app* (solo pide email y nombre, no necesita verificación de Google).
3. *APIs y servicios → Credenciales → Crear credenciales → ID de cliente de OAuth*: tipo **Aplicación web**, origen autorizado `http://localhost:5173`.
4. Copia el *ID de cliente* (`…apps.googleusercontent.com`) en `GOOGLE_CLIENT_ID` de tu `.env` y recrea la API: `docker compose up -d --force-recreate api`.

**2. Crear el primer admin** (con tu email de Google):

```bash
docker compose exec api alembic upgrade head
docker compose exec api python -m app.cli create-admin --email tu@gmail.com --name "Tu Nombre"
```

Si esa cuenta ya existe (por ejemplo, entraste antes y quedó como `usuario`), `create-admin` la asciende a admin y la reactiva.

**3. Probar la API sin frontend:** genera un token de desarrollo y pégalo en el botón *Authorize* de http://localhost:8000/docs:

```bash
docker compose exec api python -m app.cli dev-token --email tu@gmail.com
```

`dev-token` no funciona con `ENVIRONMENT=production`.

| Endpoint | Quién |
|----------|-------|
| `POST /api/v1/auth/google` | Público (recibe el token de Google y devuelve el de la API) |
| `GET /api/v1/auth/me` | Cualquier usuario autenticado |
| `GET/POST /api/v1/users`, `PATCH /api/v1/users/{id}` | Admin |

## Eventos

Eventos y reuniones del calendario. Tipos: `reunion`, `convivencia`, `eucaristia`, `otro`. Las fechas van en hora de España y formato de 24 h, `AAAA-MM-DD HH:MM` (p. ej. `2026-11-13 17:00`), tanto al enviarlas como al recibirlas; el fin debe ser posterior al inicio. En la BD se guardan con zona horaria (`TIMESTAMPTZ`), así que el cambio de hora y el iCal salen bien.

| Endpoint | Quién |
|----------|-------|
| `GET /api/v1/events?from=&to=&type=` | Cualquier usuario autenticado (devuelve los que se solapan con el rango, ordenados por inicio) |
| `GET /api/v1/events/{id}` | Cualquier usuario autenticado |
| `POST /api/v1/events`, `PATCH /api/v1/events/{id}`, `DELETE /api/v1/events/{id}` | Admin y coordinador |

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

Antes de la primera vez, copia `frontend/.env.example` a `frontend/.env` y pon en `VITE_GOOGLE_CLIENT_ID` el mismo Client ID de Google que `GOOGLE_CLIENT_ID` en el `.env` de la raíz (ver "Autenticación con Google"). En desarrollo, Vite redirige `/api` a `http://localhost:8000`; `VITE_API_URL` solo se cambia para usar otra API.

Abre http://localhost:5173 y entra con tu cuenta de Google (p. ej. la del admin creado con `create-admin`). Admin y coordinadores crean, editan y borran eventos; el resto solo los ve. La página **Estado** comprueba la conexión con la API.

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
    ├── auth/          # Sesión (token, AuthProvider, rutas protegidas)
    ├── components/    # Componentes reutilizables (Layout, modales, formularios)
    ├── lib/           # Utilidades (fechas)
    ├── pages/         # Páginas y sus tests
    ├── test/          # Configuración y utilidades de tests
    └── router.tsx     # Rutas de la app
docs/
├── BACKLOG.md         # Features y orden de desarrollo
├── brief.md           # Contexto del proyecto
└── features/          # Análisis, plan y tareas de cada feature
```
