# AppTagaste

Plataforma web para organizar los grupos de catequesis y eventos de un colegio: calendario de eventos y reuniones, biblioteca de recursos (desde Google Drive) e inscripciones con pase de lista.

> Proyecto en desarrollo. Ver el [backlog](docs/BACKLOG.md) y el [brief](docs/brief.md).

> **Publicada en https://app-tagaste.vercel.app/.** La API está en el plan gratuito de Render, que se duerme tras 15 minutos sin uso: la primera visita después tarda alrededor de un minuto en cargar. Es normal; las siguientes van rápidas.

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

Cada evento puede ser de uno o varios grupos (`group_ids` al crear o editar; la respuesta trae `groups: [{id, name}]`). Un evento **sin grupos es general** y sale en el calendario de todos los grupos. Borrar un grupo no borra sus eventos.

| Endpoint | Quién |
|----------|-------|
| `GET /api/v1/events?from=&to=&type=&group_id=` | Cualquier usuario autenticado (devuelve los que se solapan con el rango, ordenados por inicio; con `group_id`, los de ese grupo más los generales) |
| `GET /api/v1/events/{id}` | Cualquier usuario autenticado |
| `POST /api/v1/events`, `PATCH /api/v1/events/{id}`, `DELETE /api/v1/events/{id}` | Admin y coordinador |

## Suscribirse al calendario

`GET /api/v1/calendar.ics` devuelve un calendario público (sin login) con los eventos de los últimos 3 meses y todos los futuros. Con `?group_id=N` solo trae los de ese grupo y los generales (404 si el grupo no existe). Las horas van en UTC y cada móvil las muestra en su hora local.

URL: `https://app-tagaste.vercel.app/api/v1/calendar.ics` (en local, `http://localhost:8000/api/v1/calendar.ics`).

- **Google Calendar** (desde el ordenador): *Otros calendarios → + → Desde URL*, pega la URL. Aparece también en el móvil. Google lo refresca cada 8–24 h, no al momento.
- **iPhone:** *Ajustes → Calendario → Cuentas → Añadir cuenta → Otra → Añadir calendario suscrito*, pega la URL. Se refresca cada hora.

Cualquiera con la URL puede ver títulos, horas y lugares: no pongas datos de los niños en los eventos.

## Grupos

Cada grupo tiene un nombre, sus **responsables** (monitores o coordinadores que asigna el admin) y su lista de niños (solo nombre y apellidos, sin cuenta).

| Endpoint | Quién |
|----------|-------|
| `GET /api/v1/groups`, `GET /api/v1/groups/{id}` | Cualquier usuario autenticado (grupos, responsables y número de niños) |
| `POST /api/v1/groups`, `PATCH /api/v1/groups/{id}`, `DELETE /api/v1/groups/{id}` | Admin. Borrar un grupo borra sus niños |
| `POST /api/v1/groups/{id}/members` `{user_id}`, `DELETE /api/v1/groups/{id}/members/{user_id}` | Admin. Solo monitores o coordinadores |
| `GET/POST /api/v1/groups/{id}/children`, `PATCH/DELETE /api/v1/groups/{id}/children/{child_id}` | Admin y responsables de ese grupo |
| `GET /api/v1/me/groups` | Grupos de los que eres responsable |

Si un responsable deja de ser monitor o coordinador, pierde el acceso a los niños aunque siga asignado.

**Privacidad:** los nombres de los niños son datos de menores. Solo los ven el admin y los responsables de su grupo; borra los grupos al acabar el curso.

## Pase de lista

En cada evento del grupo (o general), el monitor marca qué niños asistieron. En la web: botón **Pasar lista** al abrir un evento en el calendario, o sección **Pase de lista** en la ficha del grupo (eventos de las últimas 4 semanas y de la próxima, con su estado).

| Endpoint | Quién |
|----------|-------|
| `GET /api/v1/groups/{id}/events/{event_id}/attendance` | Admin y responsables del grupo (solo lectura) |
| `PUT /api/v1/groups/{id}/events/{event_id}/attendance` `{present_child_ids}` | Solo monitores responsables del grupo |

El `PUT` guarda la lista entera: los niños que no están en `present_child_ids` quedan ausentes. Un niño sin marcar sale con `present: null` (aún no se ha pasado lista). Borrar un evento o un niño borra su asistencia.

## Estadísticas

Asistencia por grupo, por evento y por niño, a partir de los pases de lista. Solo para **admin y coordinadores** (de todos los grupos). En la web: página **Estadísticas** (tabla de grupos) y sección **Estadísticas** en la ficha de cada grupo, con botón **Descargar CSV**.

| Endpoint | Respuesta |
|----------|-----------|
| `GET /api/v1/stats/groups` | % de asistencia de cada grupo y listas pasadas |
| `GET /api/v1/groups/{id}/stats` | Por evento (presentes / faltas, lista pasada o no) y por niño (asistencias, faltas, %) |
| `GET /api/v1/groups/{id}/stats.csv` | Lo mismo en CSV para Excel (`;` y UTF-8 con BOM): una fila por niño, una columna por evento |

Todos aceptan `?from=AAAA-MM-DD&to=AAAA-MM-DD` (incluidos); por defecto, del 1 de septiembre del curso actual a hoy. Entran los eventos del grupo y los generales. Los eventos sin lista pasada no cuentan en el %.

## Biblioteca

Recursos de reuniones y convivencias de todos los cursos. Cada documento lleva **curso escolar** (`2025-2026`), **grupo** (se elige entre los existentes y se guarda su nombre, para que siga clasificado aunque el grupo se borre) y **etiquetas** por temática. Son de **solo lectura**: se editan en Drive y se suben terminados. La app guarda una copia del fichero, así que no se pierde aunque se borre de Drive.

| Endpoint | Qué hace |
|----------|----------|
| `POST /api/v1/documents` (multipart: `file`, `school_year`, `group_id`, `title`, `tags`) | Añade un documento. `tags` separadas por comas; las nuevas se crean ("Perdón" = "perdon") |
| `GET /api/v1/documents?school_year=&group=&tag=&q=` | Lista sin el fichero. Varias `tag` = los que tienen todas. `q` = buscador (abajo) |
| `GET /api/v1/documents/{id}`, `GET /api/v1/documents/{id}/file` | Datos del documento y su copia (se abre en el navegador) |
| `GET /api/v1/documents/filters`, `GET /api/v1/tags` | Cursos, grupos y etiquetas usados; todas las etiquetas |

Solo para admin, coordinadores y monitores. Se admiten **PDF y Word (.docx)** de hasta **10 MB** (se comprueba el contenido, no solo el nombre).

**Espacio:** los ficheros van en la base de datos y Neon gratis tiene 0,5 GB. Para ver lo que ocupan: `SELECT pg_size_pretty(pg_total_relation_size('document_files'));`

## Añadir documentos desde Drive

En la web, **Biblioteca → Añadir desde Drive**: se da permiso a la app (solo para los ficheros que elijas, permiso `drive.file`), se eligen uno o varios Google Docs, PDF o Word y se indican curso, grupo y etiquetas. El navegador descarga cada fichero de Drive (los Google Docs como .docx) y lo sube a `POST /api/v1/documents` con su `drive_file_id`: el token de Drive nunca llega a la API. Un fichero de Drive que ya está en la biblioteca da **409**. También se puede **Subir desde el ordenador**.

Configuración en Google Cloud (el mismo proyecto del login con Google):

1. **APIs y servicios → Biblioteca:** activa **Google Picker API** y **Google Drive API**.
2. **Credenciales → Crear credenciales → Clave de API.** Restringe la clave a los sitios web `http://localhost:5173/*` y `https://app-tagaste.vercel.app/*`, y a la **Google Picker API**.
3. **Pantalla de consentimiento de OAuth → Acceso a datos:** añade el permiso `.../auth/drive.file`.
4. Copia el **número del proyecto** (panel principal del proyecto).
5. En `frontend/.env` y en Vercel (**Settings → Environment Variables**): `VITE_GOOGLE_API_KEY` = la clave y `VITE_GOOGLE_APP_ID` = el número del proyecto. En Vercel, vuelve a desplegar para que se apliquen.

## Buscador

`GET /api/v1/documents?q=...` busca en el **título**, las **etiquetas** y el **texto** de los documentos (título y etiquetas pesan más) y los ordena por relevancia. Se combina con `school_year`, `group` y `tag`.

- Sin tildes ni mayúsculas y con variantes: `perdon` encuentra "Perdón" y "perdonar".
- Varias palabras = los que tienen todas; `"oración de la mañana"` entre comillas = frase exacta.
- La última palabra vale empezada: `dinam` encuentra "dinámica".
- Cada resultado trae `snippet`: un trozo del texto con lo encontrado entre `<mark>` y `</mark>`.

El texto se saca al subir el documento (PDF y Word). Un PDF escaneado (solo imagen) se guarda igual con `has_text: false` y solo se encuentra por título y etiquetas. Para rehacer el índice de todos los documentos:

```bash
docker compose exec api python -m app.cli reindex-documents
```

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

**Grupos en el calendario:** cualquiera elige un grupo arriba del calendario y ve sus eventos (y los generales) con los nombres de sus monitores y coordinadores; la elección se recuerda en el navegador. **Suscribirse** da el enlace iCal del grupo elegido para añadirlo al móvil. Al crear un evento, admin y coordinadores marcan sus grupos (ninguno = general).

**Grupos** (admin) y **Mis grupos** (monitores y coordinadores): el admin crea, renombra y borra grupos y asigna sus responsables; cada responsable ve los niños de sus grupos y los añade pegando una lista (un nombre por línea), los renombra o los borra.

**Gestión de usuarios** (solo admin, enlace **Usuarios**): busca por nombre o email, filtra por rol, cambia el rol en el desplegable y activa o desactiva cuentas. Pide confirmación al dar o quitar el rol de admin y al desactivar; tu propia fila no se puede cambiar. Con **+ Añadir usuario** das de alta un email de Google con su rol antes de que entre por primera vez.

```bash
npm run lint       # oxlint + comprobación de formato
npm run format     # Formatea el código con Prettier
npm test           # Tests con Vitest
npm run build      # Build de producción en dist/
```

GitHub Actions ejecuta lint, tests y build del frontend en cada push y PR.

## Despliegue (gratuito)

```
navegador ──> Vercel (frontend) ──/api/*──> Render (API, Docker) ──> Neon (Postgres)
```

- **API:** Render, plan gratuito, con `render.yaml`. Construye la etapa `prod` del `Dockerfile`, que aplica las migraciones al arrancar. Se duerme tras 15 min sin uso: la primera visita después tarda ~1 min.
- **BD:** Neon, plan gratuito (no caduca).
- **Frontend:** Vercel. `frontend/vercel.json` redirige `/api/*` a Render (sin CORS) y el resto de rutas a `index.html`.
- Se despliega solo al hacer push a `master` (PR de `develop` a `master`).

**1. Neon (BD)**
1. Crea una cuenta en [neon.tech](https://neon.tech) y un proyecto `apptagaste` (Postgres 16, región Frankfurt).
2. Copia la *connection string* (`postgresql://…?sslmode=require`). Se pega tal cual: la API la adapta.

**2. Render (API)**
1. Crea una cuenta en [render.com](https://render.com) con GitHub.
2. *New → Blueprint*, elige el repo y la rama `master`. Render lee `render.yaml`.
3. Rellena `DATABASE_URL` (la de Neon) y `GOOGLE_CLIENT_ID`. `SECRET_KEY` la genera Render.
4. Al terminar, abre `https://<servicio>.onrender.com/api/v1/health` → `{"status":"ok","db":"ok"}`.

**3. Vercel (frontend)**
1. Si la URL de Render no es `https://apptagaste-api.onrender.com`, cámbiala en `frontend/vercel.json` y haz commit.
2. Crea una cuenta en [vercel.com](https://vercel.com) con GitHub, *Add New → Project*, elige el repo y pon **Root Directory** = `frontend` (Vite se detecta solo).
3. Variable de entorno: `VITE_GOOGLE_CLIENT_ID` = tu Client ID. En *Settings → Git*, rama de producción `master`.
4. Abre `https://<proyecto>.vercel.app/api/v1/health`: debe responder lo mismo que Render.

**4. Google Cloud**
1. En tu *ID de cliente de OAuth*, añade `https://<proyecto>.vercel.app` a *Orígenes de JavaScript autorizados*.
2. En *Pantalla de consentimiento*, pulsa *Publicar app* para que pueda entrar cualquier cuenta.

**5. Primer admin** (desde tu PC, contra la BD de Neon):

```powershell
docker compose run --rm -e DATABASE_URL="<url de Neon>" api python -m app.cli create-admin --email tu@gmail.com --name "Tu Nombre"
```

Entra en `https://<proyecto>.vercel.app` con Google: en la cabecera debe aparecer *Admin*.

**Rollback:** en Render y Vercel, *Deployments → Redeploy/Promote* el despliegue anterior.

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
