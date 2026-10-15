# Tareas pendientes: 08-despliegue-gratuito

> Estado: 🔄 En curso (pruebas y despliegue)
> Última actualización: 2026-10-15

## Bloque 1 — Preparación
- [x] T1.1 (manual, Ignacio) — `git checkout develop && git pull && git checkout -b feature/08-despliegue-gratuito`

## Bloque 2 — Implementación
- [x] T2.1 — `backend/Dockerfile` multi-etapa (`dev` y `prod`) y `target: dev` en `docker-compose.yml`
- [x] T2.2 — `config.py`: aceptar `DATABASE_URL` de Neon (`postgresql://…`); tests en `test_config.py`
- [x] T2.3 — `render.yaml` (API Docker gratuita, rama `master`, health check, variables)
- [x] T2.4 — `frontend/vercel.json` (rewrite de `/api/*` a Render y fallback a `index.html`)
- [x] T2.5 — README: guía de despliegue; `.env.example`: variables de producción

## Bloque 3 — Pruebas en local (manual, Ignacio)
- [ ] T3.1 — `docker compose up --build -d`, `pytest` y ruff → verde (la etapa `dev` sigue igual)

## Bloque 4 — Despliegue (manual, Ignacio, siguiendo el README)
- [ ] T4.1 — PR de la rama a `develop` y, después, PR de `develop` a `master`
- [ ] T4.2 — Neon: crear proyecto y copiar la `DATABASE_URL`
- [ ] T4.3 — Render: Blueprint desde el repo, pegar `DATABASE_URL` y `GOOGLE_CLIENT_ID`; `/api/v1/health` responde `db: ok`
- [ ] T4.4 — Vercel: importar `frontend/`, poner la URL de Render en `vercel.json` y `VITE_GOOGLE_CLIENT_ID`
- [ ] T4.5 — Google Cloud: añadir el origen de Vercel y publicar la app
- [ ] T4.6 — `create-admin` contra Neon desde tu PC; login en Vercel, `/auth/me` = admin y crear un evento

## Bloque 5 — Documentación y cierre
- [ ] T5.1 — Devlog, lecciones, criterios y BACKLOG
