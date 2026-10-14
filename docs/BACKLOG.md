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
| 02 | `base-datos-alembic` | P0 | [x] | SQLAlchemy síncrono + `get_db()`, Alembic con baseline `0001`, `/health` comprueba la BD |
| 03 | `calidad-ci` | P0 | [ ] | pytest + BD de test, ruff, GitHub Actions (lint + tests) |
| 04 | `frontend-base` | P0 | [ ] | React (Vite), router, layout responsive móvil, cliente API |

## Fase 1 — MVP (semana 2)

| # | Feature | Prioridad | Estado | Notas |
|---|---------|-----------|--------|-------|
| 05 | `auth-usuarios-roles` | P0 | [ ] | Modelo Usuario, login JWT, hash de contraseñas, roles coordinador/monitor, dependencias de permisos |
| 06 | `eventos-crud` | P0 | [ ] | Modelo Evento/Reunión (fecha, tipo, grupo), CRUD solo coordinador |
| 07 | `calendario-frontend` | P0 | [ ] | Login en front, vista mensual y lista, filtros por tipo |
| 08 | `despliegue-gratuito` | P0 | [ ] | Render (API) + Postgres gratuita + Vercel (front), variables de entorno, CORS |
| 09 | `exportacion-ical` | P1 | [ ] | Feed iCal por grupo para suscribirse desde el móvil |

## Fase 2 — Grupos, inscripciones y asistencia

| # | Feature | Prioridad | Estado | Notas |
|---|---------|-----------|--------|-------|
| 10 | `grupos-gestion` | P0 | [ ] | Modelo Grupo, asignar monitores y miembros (coordinador) |
| 11 | `inscripciones` | P0 | [ ] | Apuntarse/desapuntarse, plazas ilimitadas, recuento de inscritos |
| 12 | `pase-de-lista` | P0 | [ ] | Monitor marca "asistió" vs "inscrito", por grupo |
| 13 | `estadisticas-basicas` | P2 | [ ] | Asistencia por grupo y reunión para coordinador |

## Fase 3 — Biblioteca de recursos

| # | Feature | Prioridad | Estado | Notas |
|---|---------|-----------|--------|-------|
| 14 | `documentos-etiquetas` | P0 | [ ] | Modelos Documento y Etiqueta (N:M), subida y etiquetado manual por monitor |
| 15 | `sincronizacion-drive` | P0 | [ ] | Cuenta de servicio, solo lectura, carpetas concretas, job periódico |
| 16 | `buscador-texto-completo` | P0 | [ ] | Extracción de texto, tsvector, búsqueda con filtros por etiqueta |
| 17 | `biblioteca-frontend` | P1 | [ ] | Buscador, filtros y vista previa |
| 18 | `etiquetas-con-llm` | P2 | [ ] | Sugerencia automática de etiquetas |

## Fase 4 — Acceso de niños (bloqueada por tema legal)

| # | Feature | Prioridad | Estado | Notas |
|---|---------|-----------|--------|-------|
| 19 | `privacidad-rgpd` | P0 | [ ] | **Antes de nada:** confirmar autorización con colegio, quién ve qué, conservación y borrado |
| 20 | `acceso-ninos-invitacion` | P0 | [ ] | Cuentas creadas por coordinador, código/enlace, datos mínimos (alias + grupo) |
| 21 | `vista-nino` | P1 | [ ] | Calendario de su grupo e inscribirse |
| 22 | `informes-asistencia` | P2 | [ ] | Informes exportables |

## Transversal (se va haciendo en cada feature)

- [ ] Logging y gestión de errores homogénea
- [ ] Documentación OpenAPI revisada
- [ ] ADRs en `docs/adr/` para decisiones clave (stack, auth, despliegue)
- [ ] Issues y tablero en GitHub enlazados a este backlog

## Pendientes / decisiones abiertas

- Nombre final del proyecto
- Validación legal antes de la Fase 4
