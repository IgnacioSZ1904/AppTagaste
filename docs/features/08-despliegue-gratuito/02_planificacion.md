# Planificación: 08-despliegue-gratuito

## 1. Enfoque técnico
Tres servicios gratuitos, cada uno con su configuración en el repo: la API en **Render** (imagen Docker), la BD en **Neon** (Postgres 16) y el frontend en **Vercel**. Vercel sirve el frontend y redirige `/api/*` a Render, igual que el proxy de Vite en local, así que el navegador solo habla con un dominio. Render y Vercel despliegan solos al hacer push a `master`.

```
navegador ──> Vercel (frontend)  ──/api/*──> Render (API Docker) ──> Neon (Postgres)
```

## 2. Decisiones de diseño
| Decisión | Alternativas | Justificación |
|----------|--------------|---------------|
| `Dockerfile` multi-etapa: `dev` (docker compose, con tests y `--reload`) y `prod` (última etapa, la que usa Render) | Dos Dockerfiles | Un solo fichero; producción sin dependencias de test |
| Arranque de `prod`: `alembic upgrade head` y después `uvicorn` en el puerto `$PORT` | Migrar a mano | Render gratis no tiene consola; las migraciones son idempotentes |
| `render.yaml` (Blueprint) con el servicio, `healthCheckPath: /api/v1/health`, rama `master` y las variables | Configurar a mano en la web | La configuración queda versionada; `SECRET_KEY` la genera Render |
| La API acepta `DATABASE_URL` como `postgresql://…` (formato de Neon) y la convierte a `postgresql+psycopg://` | Pedir que la reescribas | Pegas la URL de Neon tal cual |
| `frontend/vercel.json`: rewrite `/api/(.*)` → Render y el resto a `index.html` (rutas de React Router) | CORS + `VITE_API_URL` absoluta | Sin CORS ni cambios en el frontend; recargar `/usuarios` no da 404 |
| `create-admin` desde tu PC con `docker compose run` y la `DATABASE_URL` de Neon | Endpoint de alta de admin | No expone nada nuevo por HTTP |
| `/docs` sigue activo en producción | Desactivarlo | Útil para probar; todo lo sensible requiere token |

## 3. Cambios por módulo
### `backend/`
- `Dockerfile`: etapas `base`, `dev` y `prod`.
- `app/core/config.py`: normalizar `database_url`.
- `tests/test_config.py`: la normalización de la URL y el bloqueo de `SECRET_KEY` en producción.

### Raíz
- `docker-compose.yml`: `target: dev`.
- `render.yaml`: servicio web Docker gratuito.
- `frontend/vercel.json`: rewrites.
- `.env.example`: nota sobre las variables de producción.
- `README.md`: sección "Despliegue" con la guía paso a paso (Neon → Render → Vercel → Google → admin).

## 4. Modelo de datos / contratos
Sin cambios de modelo. Variables de producción:

| Dónde | Variable | Valor |
|-------|----------|-------|
| Render | `DATABASE_URL` | URL de Neon (la pegas tú) |
| Render | `SECRET_KEY` | Generada por Render |
| Render | `ENVIRONMENT` | `production` |
| Render | `GOOGLE_CLIENT_ID` | El mismo que en local |
| Vercel | `VITE_GOOGLE_CLIENT_ID` | El mismo Client ID |
| Vercel | `VITE_API_URL` | `/api/v1` (valor por defecto) |
| Google Cloud | Orígenes autorizados | Añadir `https://<tu-app>.vercel.app` |

## 5. Plan de pruebas
- En la nube: construir la etapa `prod` y arrancarla contra Postgres con `ENVIRONMENT=production` (migra sola y `/health` responde); tests y ruff en verde.
- Comprobar que `docker compose` en local sigue funcionando con `target: dev`.
- Manual (Ignacio), tras desplegar: `/api/v1/health` en la URL de Render y de Vercel, `create-admin` contra Neon, login con Google en Vercel, `/auth/me` = admin, crear un evento.

## 6. Plan de despliegue / migración
- Rama `feature/08-despliegue-gratuito` desde `develop`; PR a `develop`; luego PR de `develop` a `master` (primer despliegue).
- Orden en las webs: Neon → Render (Blueprint) → Vercel → Google Cloud → `create-admin`.
- Rollback: en Render y Vercel, volver al despliegue anterior con un clic; en BD, `alembic downgrade` desde tu PC.

## 7. Estimación
- Tareas: ~12 (la mitad son pasos tuyos en las webs)
- Incertidumbre: media (paneles de terceros y límites gratuitos)
