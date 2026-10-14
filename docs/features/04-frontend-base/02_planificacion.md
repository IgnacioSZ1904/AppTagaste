# Planificación: 04-frontend-base

## 1. Enfoque técnico
Proyecto Vite + React + TypeScript en `frontend/`, ejecutado con Node 24 en tu PC. React Router para las rutas, Tailwind CSS v4 para los estilos y TanStack Query sobre un cliente `fetch` propio para hablar con la API. En desarrollo, Vite redirige `/api` a `localhost:8000`, así no hace falta CORS todavía. Calidad con ESLint, Prettier y Vitest + Testing Library, y un job `frontend` nuevo en GitHub Actions.

## 2. Decisiones de diseño
| Decisión | Alternativas | Justificación |
|----------|--------------|---------------|
| Crear el proyecto con `npm create vite@latest` (plantilla `react-ts`) | Escribir todo a mano | Configuración oficial y actualizada; luego solo ajustamos |
| Tailwind v4 con el plugin `@tailwindcss/vite` | Tailwind v3 con PostCSS | v4 es la versión actual; sin `tailwind.config.js` ni PostCSS |
| React Router en modo librería (`createBrowserRouter`) | Modo framework (Remix) | Más simple para una SPA; suficiente para el proyecto |
| Cliente `apiFetch` propio + TanStack Query | axios | `fetch` nativo basta; un solo sitio para URL base, JSON y errores (y el token en la 05) |
| URL base `VITE_API_URL` con valor por defecto `/api/v1` | URL fija | En local usa el proxy; en producción (08) apunta a la API real |
| Proxy de Vite `/api` → `http://localhost:8000` | Activar CORS ya | Evita CORS en desarrollo; CORS de producción va en la 08 |
| Alias `@/` → `src/` | Rutas relativas `../../` | Imports más legibles |
| Vitest + Testing Library + jsdom | Jest | Integrado con Vite, misma config |
| Prettier con `prettier-plugin-tailwindcss` | Solo Prettier | Ordena las clases de Tailwind automáticamente |
| `.nvmrc` con `24` y `engines` en `package.json` | Nada | Fija la versión de Node para ti y para CI |

## 3. Cambios por módulo
### `frontend/` (nuevo)
- Proyecto Vite `react-ts`; limpiar la demo (logos, `App.css`, contador).
- `vite.config.ts`: plugins React y Tailwind, alias `@/`, proxy `/api`, config de Vitest.
- `src/index.css`: `@import "tailwindcss";`.
- `src/api/client.ts`: `apiFetch<T>(path)` con URL base, JSON y clase `ApiError` (status + detalle).
- `src/api/health.ts`: `getHealth()` y hook `useHealth()` con TanStack Query.
- `src/components/Layout.tsx`: cabecera con nombre de la app, navegación (menú hamburguesa en móvil) y `<Outlet />`.
- `src/pages/HomePage.tsx`: muestra "API: ok" / cargando / error claro.
- `src/pages/NotFoundPage.tsx`: 404 con enlace a inicio.
- `src/router.tsx` y `src/main.tsx`: `RouterProvider` dentro de `QueryClientProvider`.
- `src/test/setup.ts` y tests: `HomePage` (ok y error con `fetch` simulado) y 404.
- ESLint (config de la plantilla) + Prettier; scripts `lint`, `format`, `test`, `build`.
- `.env.example` con `VITE_API_URL`, `.nvmrc`.

### Raíz
- `.github/workflows/ci.yml`: job `frontend` (Node 24, `npm ci`, lint, test, build) con caché de npm.
- `README.md`: sección "Frontend" (requisitos, arranque, scripts).

## 4. Modelo de datos / contratos
Sin cambios en la API. El frontend consume `GET /api/v1/health` → `200 {"status":"ok","db":"ok"}` o `503 {"detail":"Base de datos no disponible"}`.

## 5. Plan de pruebas
- Verificación en la nube (lint, tests y build) antes de pasarte los ficheros.
- Manual (Ignacio):
  1. `node -v` → v24.x.
  2. `docker compose up` (backend) y en otra terminal `cd frontend; npm install; npm run dev`.
  3. Abrir `http://localhost:5173` → "API: ok".
  4. Parar la API → mensaje de error claro.
  5. Abrir `/no-existe` → página 404.
  6. Probar en móvil con las DevTools (375 px).
  7. `npm run lint`, `npm test`, `npm run build` → sin errores.
  8. PR a `develop` → CI en verde (backend y frontend).

## 6. Plan de despliegue / migración
- Rama `feature/04-frontend-base` desde `develop`.
- Sin migraciones. Rollback: revertir el commit.

## 7. Estimación
- Tareas: ~12
- Incertidumbre: que no tengas Node 24 instalado (se instala desde nodejs.org o con `winget install OpenJS.NodeJS.LTS`).
