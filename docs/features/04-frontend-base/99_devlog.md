# Devlog: 04-frontend-base

---

## [2026-10-14 08:30] — Inicio del evolutivo
- Feature 03 mergeada en `develop` (PR #3)
- Análisis redactado

## [2026-10-14 08:53] — Análisis aprobado
- Decisiones: TypeScript, Node 24 en el PC (no Docker), Tailwind CSS, TanStack Query sobre `fetch`
- Planificación redactada

## [2026-10-14 08:55] — Planificación aprobada
- Tareas pendientes redactadas (18 tareas en 4 bloques)

## [2026-10-14 09:02] — Ejecución de tareas (ficheros)
- Tareas aprobadas; hechas T1.3–T1.4, T2.1–T2.6 y T4.1
- Versiones: Vite 8, React 19.2, TypeScript 6, React Router 8, TanStack Query 5, Tailwind 4.3, Vitest 5, oxlint 1.81, Prettier 3.9
- Cambio respecto al plan: la plantilla `react-ts` de Vite ya trae **oxlint** en vez de ESLint; se mantiene (más rápido, una sola herramienta). `npm run lint` = oxlint + `prettier --check`
- `apiFetch` convierte un fallo de red en `ApiError(0, "No se puede conectar con la API")` y un 4xx/5xx en `ApiError` con el `detail` de FastAPI
- Tests renderizan las rutas reales con `createMemoryRouter` y simulan `fetch` con `vi.spyOn`
- Verificado en la nube (Node 22): lint limpio, 4 tests en verde, build OK

## [2026-10-14 09:09] — Pruebas manuales completadas (Ignacio)
- Node 24 en local; `npm run dev` arranca en `http://localhost:5173`
- `npm run lint` (0 avisos), `npm test` (4 tests en verde) y `npm run build` OK en Windows
- Job `frontend` añadido a mano en `ci.yml`; corregida la sangría de `frontend:` bajo `jobs:`

## [2026-10-14 09:12] — Cierre del evolutivo
- Tareas, criterios, lecciones y BACKLOG actualizados antes del commit
- Pendiente: PR a `develop` con CI en verde (backend + frontend) y merge
- Resumen: la web arranca en local, muestra el estado de la API y queda lista para el login (05) y el calendario (07)
