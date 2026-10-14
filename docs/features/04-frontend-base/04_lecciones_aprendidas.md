# Lecciones aprendidas: 04-frontend-base

## [2026-10-14] — Las plantillas cambian: revisar lo que genera `create vite`
- **Qué pasó:** el plan decía ESLint, pero la plantilla `react-ts` actual trae oxlint.
- **Corrección:** se mantiene oxlint (más rápido, sin config extra) y se documenta el cambio en el devlog.
- **Aplicar en:** comprobar las versiones y herramientas reales antes de cerrar un plan con librerías nuevas.

## [2026-10-14] — En YAML la sangría es sintaxis
- **Qué pasó:** al pegar el job `frontend` en `ci.yml`, quedó sin los 2 espacios de sangría bajo `jobs:`, lo que rompe el workflow.
- **Corrección:** alinear `frontend:` con `lint:` y `test:`.
- **Aplicar en:** cualquier edición manual de `.github/workflows/`; revisar la sangría antes del commit.

## [2026-10-14] — Proxy de Vite en vez de CORS en desarrollo
- **Qué pasó:** con `/api` redirigido a `localhost:8000`, el frontend llama a la API sin tocar el backend.
- **Aplicar en:** feature 08, donde sí hará falta CORS y `VITE_API_URL` con la URL real.
