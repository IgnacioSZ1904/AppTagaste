# Tareas pendientes: 04-frontend-base

> Estado: ✅ Completada (falta PR y merge)
> Última actualización: 2026-10-14

## Bloque 1 — Preparación
- [x] T1.1 (manual, Ignacio) — `node -v` → v24.x (si no: `winget install OpenJS.NodeJS.LTS`)
- [x] T1.2 (manual, Ignacio) — `git checkout develop; git pull; git checkout -b feature/04-frontend-base`
- [x] T1.3 — Proyecto Vite `react-ts` en `frontend/` sin la demo; `.nvmrc`, `engines`, `.env.example`
- [x] T1.4 — Dependencias: Tailwind v4, React Router, TanStack Query, Vitest, Testing Library, Prettier

## Bloque 2 — Implementación
- [x] T2.1 — `vite.config.ts`: React, Tailwind, alias `@/`, proxy `/api`, Vitest
- [x] T2.2 — `src/api/client.ts` (`apiFetch` + `ApiError`) y `src/api/health.ts` (`useHealth`)
- [x] T2.3 — `Layout` responsive (cabecera + menú móvil) y páginas Inicio y 404
- [x] T2.4 — `router.tsx` y `main.tsx` con `QueryClientProvider`
- [x] T2.5 — Tests: Inicio (ok y error) y 404
- [x] T2.6 — oxlint + Prettier; scripts `lint`, `format`, `test`, `build`
- [x] T2.7 (manual, Ignacio) — Job `frontend` en `.github/workflows/ci.yml` (las herramientas remotas no escriben en `.github/`)

## Bloque 3 — Pruebas (manual, Ignacio)
- [x] T3.1 — `docker compose up` + `cd frontend; npm install; npm run dev`
- [x] T3.2 — `http://localhost:5173` → "API: ok"; con la API parada → error claro
- [x] T3.3 — `/no-existe` → 404; vista móvil (375 px) en DevTools
- [x] T3.4 — `npm run lint`, `npm test`, `npm run build` → sin errores
- [ ] T3.5 — Push y PR a `develop` → CI en verde (backend + frontend)

## Bloque 4 — Documentación
- [x] T4.1 — README: sección "Frontend"
- [x] T4.2 — Devlog, lecciones y BACKLOG
- [ ] T4.3 (manual, Ignacio) — Merge de la PR
