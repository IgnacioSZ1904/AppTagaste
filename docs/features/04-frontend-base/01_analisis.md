# Análisis: 04-frontend-base

## 1. Petición original
> "okey pues vamos con el siguiente feature" → feature 04 del backlog: `frontend-base` (P0).

## 2. Objetivo
Crear la base del frontend en React: proyecto Vite, navegación entre páginas, un layout pensado para móvil y un cliente para llamar a la API. Al terminar, la web arranca en local, muestra el estado de la API (`/api/v1/health`) y queda lista para las pantallas de login y calendario (features 05 y 07).

## 3. Estado actual del proyecto
- Features 01–03 mergeadas en `develop`; CI de backend en verde.
- Carpeta `frontend/` vacía.
- La API no tiene CORS configurado.
- CI solo cubre el backend.

## 4. Alcance
### Dentro de alcance
- Proyecto Vite + React en `frontend/`.
- React Router con páginas iniciales: Inicio (estado de la API) y 404.
- Layout responsive mobile-first: cabecera, navegación y contenido.
- Cliente API (`src/api/`) con la URL base configurable (`VITE_API_URL`).
- Proxy de Vite `/api` → `localhost:8000` en desarrollo (sin tocar CORS todavía).
- Calidad: ESLint, Prettier y Vitest + Testing Library con un test de ejemplo.
- Job `frontend` en `ci.yml` (lint + tests + build).
- README: cómo arrancar el frontend.

### Fuera de alcance
- Login y gestión de sesión (feature 05).
- Calendario y pantallas de negocio (feature 07).
- Despliegue en Vercel y CORS de producción (feature 08).

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| No tener Node instalado o con versión distinta | Media | Medio | Fijar versión en `.nvmrc` y `engines`; comprobarlo al empezar |
| Hot reload lento en Docker sobre Windows | Alta si se usa Docker | Medio | Ver pregunta 2 |
| Elegir demasiadas librerías al principio | Media | Bajo | Solo lo imprescindible; el resto se añade cuando haga falta |

## 6. Preguntas abiertas
- [x] ¿JavaScript o TypeScript? → **TypeScript**.
- [x] ¿Node en tu PC o Docker? → **Node 24 LTS en tu PC** (`npm run dev`).
- [x] ¿Estilos? → **Tailwind CSS**.
- [x] ¿Peticiones? → **TanStack Query** sobre un cliente `fetch`.

## 7. Criterios de aceptación
- [x] `npm run dev` arranca la web en `http://localhost:5173`.
- [x] La página de inicio muestra "API: ok" con el backend levantado y un error claro si no.
- [x] Rutas funcionando (inicio y 404) y layout usable en móvil (≤ 375 px) y escritorio.
- [x] `npm run lint`, `npm test` y `npm run build` pasan en local (GitHub Actions: se comprueba en la PR).
- [x] README documenta el arranque del frontend.
