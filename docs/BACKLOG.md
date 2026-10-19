# Backlog — AppTagaste

Documento vivo: se reordena y edita durante el desarrollo.
Cada feature se convierte en `docs/features/NN-<nombre>/` según `CLAUDE.md` al empezarla.

Estado: `[ ]` pendiente · `[~]` en curso · `[x]` hecho
Prioridad: **P0** imprescindible MVP · **P1** importante · **P2** deseable

---

## Fase 0 — Base técnica

| # | Feature | Prioridad | Estado | Notas |
|---|---------|-----------|--------|-------|
| 01 | `estructura-repo-docker` | P0 | [x] | Capas en `app/`, config con pydantic-settings, API en `/api/v1`, README. Mergeada en `develop` |
| 02 | `base-datos-alembic` | P0 | [x] | SQLAlchemy síncrono + `get_db()`, Alembic con baseline `0001`, `/health` comprueba la BD. Mergeada en `develop` |
| 03 | `calidad-ci` | P0 | [x] | pytest con BD `_test` y rollback por test, ruff, GitHub Actions (lint + test). Mergeada en `develop` |
| 04 | `frontend-base` | P0 | [x] | Vite + React 19 + TS, Tailwind 4, React Router, TanStack Query sobre `apiFetch`, proxy `/api`, oxlint + Prettier + Vitest, job `frontend` en CI |

## Fase 1 — MVP (semana 2)

Orden: 07 → 19 → 20 → 08 → 09.

| # | Feature | Prioridad | Estado | Notas |
|---|---------|-----------|--------|-------|
| 05 | `auth-usuarios-roles` | P0 | [x] | Login solo con Google (ID token verificado + lista blanca de emails) y JWT propio de 8 h, roles coordinador/monitor, `/auth/me`, gestión de usuarios, comandos `create-coordinator` y `dev-token` |
| 06 | `eventos-crud` | P0 | [x] | Modelo `Event` (tipos reunion/convivencia/eucaristia/otro, inicio y fin obligatorios), CRUD solo coordinador, lectura para autenticados, filtros por rango (solape) y tipo, fechas en hora de España `AAAA-MM-DD HH:MM`. El grupo se añade en la 10 |
| 07 | `calendario-frontend` | P0 | [x] | Login con botón de Google y JWT en `localStorage` (401 → login), rutas protegidas, FullCalendar v7 a pantalla completa, vista "Próximos" (15 eventos), filtros por tipo, CRUD de eventos en modal para coordinador, tema blanco y rojo con el escudo |
| 19 | `roles-admin-usuario` | P0 | [x] | Roles **admin** (todo + gestión de usuarios), **coordinador** (CRUD de eventos), **monitor** y **usuario** (solo ver el calendario; alta automática al entrar con Google). Migración `0004` (coordinador → admin), `create-admin` (crea o asciende), dependencias `Admin` y `EventEditor` |
| 20 | `gestion-usuarios-frontend` | P0 | [x] | Pantalla del admin: lista de usuarios, cambiar rol (coordinador/monitor/usuario), activar/desactivar, dar de alta por email. Ajustar el frontend de la 07 a los roles nuevos: botones de edición para admin y coordinador, etiquetas de admin y usuario en la cabecera, tipo `Role` con los 4 valores |
| 08 | `despliegue-gratuito` | P0 | [x] | Render (API) + Neon (Postgres) + Vercel (front), variables de entorno; publicada en https://app-tagaste.vercel.app/ |
| 09 | `exportacion-ical` | P1 | [x] | Feed iCal público en `/api/v1/calendar.ics` (todos los eventos); filtro por grupo cuando exista la 10 |

## Fase 2 — Grupos y asistencia

| # | Feature | Prioridad | Estado | Notas |
|---|---------|-----------|--------|-------|
| 10 | `grupos-gestion` | P0 | [x] | Grupos con responsables (monitores o coordinadores, los asigna el admin) y lista de niños (solo nombre). Solo el admin y los responsables del grupo ven y gestionan sus niños |
| 21 | `grupos-frontend` | P0 | [x] | Pantallas de grupos: el admin crea grupos y asigna responsables; los responsables ven y gestionan los niños de sus grupos ("Mis grupos", alta pegando una lista). Incluye backend: eventos de uno o varios grupos (sin grupo = general, migración `0006`), calendario e iCal por grupo con sus responsables y botón "Suscribirse" |
| 12 | `pase-de-lista` | P0 | [ ] | En cada evento, el monitor marca qué niños de su grupo asistieron |
| 13 | `estadisticas-basicas` | P2 | [ ] | Asistencia por grupo y evento para admin y coordinador; informes exportables |

## Fase 3 — Biblioteca de recursos

| # | Feature | Prioridad | Estado | Notas |
|---|---------|-----------|--------|-------|
| 14 | `documentos-etiquetas` | P0 | [ ] | Modelos Documento y Etiqueta (N:M), subida y etiquetado manual por monitor |
| 15 | `sincronizacion-drive` | P0 | [ ] | Cuenta de servicio, solo lectura, carpetas concretas, job periódico |
| 16 | `buscador-texto-completo` | P0 | [ ] | Extracción de texto, tsvector, búsqueda con filtros por etiqueta |
| 17 | `biblioteca-frontend` | P1 | [ ] | Buscador, filtros y vista previa |
| 18 | `etiquetas-con-llm` | P2 | [ ] | Sugerencia automática de etiquetas |

## Transversal (se va haciendo en cada feature)

- [ ] Logging y gestión de errores homogénea
- [ ] Documentación OpenAPI revisada
- [ ] ADRs en `docs/adr/` para decisiones clave (stack, auth, despliegue)
- [ ] Issues y tablero en GitHub enlazados a este backlog
- [ ] Privacidad: los nombres de los niños son datos de menores. Datos mínimos (nombre), visibles solo para sus monitores y el admin; borrado al acabar el curso; confirmar con el colegio

## Pendientes / decisiones abiertas

- Nombre final del proyecto
- Validar con el colegio el tratamiento de los nombres de los niños (antes de la 10)
