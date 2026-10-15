# Tareas pendientes: 07-calendario-frontend

> Estado: ✅ Completada (falta PR y merge)
> Última actualización: 2026-10-14

## Bloque 1 — Preparación
- [x] T1.1 (manual, Ignacio) — Crear el OAuth Client ID de Google (origen `http://localhost:5173`)
- [x] T1.2 (manual, Ignacio) — `git checkout develop; git pull; git checkout -b feature/07-calendario-frontend`
- [x] T1.3 (manual, Ignacio) — Client ID en `GOOGLE_CLIENT_ID` (`.env`) y `VITE_GOOGLE_CLIENT_ID` (`frontend/.env`)
- [x] T1.4 — Dependencias: `@react-oauth/google`, `@fullcalendar/react` v7 (+ `temporal-polyfill`)
- [x] T1.5 — Escudo sin fondo (`public/escudo.png`) y favicon

## Bloque 2 — Implementación
- [x] T2.1 — Tema blanco y rojo en `index.css` (Tailwind `@theme` + FullCalendar)
- [x] T2.2 — `apiFetch`: token Bearer, métodos con cuerpo, 204 y aviso de 401
- [x] T2.3 — `api/auth.ts` y `api/events.ts` (consultas y mutaciones)
- [x] T2.4 — `AuthProvider`, `useAuth` y `RequireAuth`
- [x] T2.5 — `LoginPage` con botón de Google y errores
- [x] T2.6 — `Layout` con escudo, usuario, rol y "Salir"
- [x] T2.7 — `CalendarPage`: FullCalendar mes/lista, rango visible, chips de tipo
- [x] T2.8 — `EventModal` y `EventForm` (crear, editar, borrar; solo coordinador)
- [x] T2.9 — Rutas: `/login`, `/` protegido, `/estado`, 404
- [x] T2.10 — Tests (login, guard, 401, calendario, filtros, formulario, permisos)

## Bloque 3 — Pruebas (manual, Ignacio)
- [x] T3.1 — `docker compose up -d --force-recreate api` + `npm install` + `npm run dev`
- [x] T3.2 — Login con tu cuenta → calendario con nombre y rol
- [x] T3.3 — Crear, editar y borrar un evento; meses, filtros y vista Próximos
- [x] T3.4 — Cuenta no dada de alta → mensaje; monitor sin botones de edición
- [x] T3.5 — Móvil (375 px) en DevTools
- [x] T3.6 — `npm run lint`, `npm test`, `npm run build`
- [ ] T3.7 — Push y PR a `develop` → CI en verde

## Bloque 4 — Documentación
- [x] T4.1 — README: `VITE_GOOGLE_CLIENT_ID` y cómo probar el login
- [x] T4.2 — Devlog, lecciones y BACKLOG
- [ ] T4.3 (manual, Ignacio) — Merge de la PR
