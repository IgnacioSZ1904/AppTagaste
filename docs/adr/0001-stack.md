# 0001. Stack: FastAPI + PostgreSQL y React

- **Estado:** Aceptado
- **Fecha:** 2026-10-13
- **Feature:** [01-estructura-repo-docker](../features/01-estructura-repo-docker/), [04-frontend-base](../features/04-frontend-base/)

## Contexto
App web pequeña (un colegio, decenas de usuarios) hecha por una sola persona, que además sirve de portfolio para un puesto junior. Tiene que poder desplegarse gratis y crecer por módulos (calendario, grupos, biblioteca).

## Decisión
- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2 (síncrono), Alembic y Pydantic. Capas `api` → `services` → `models`.
- **Base de datos:** PostgreSQL (también para el buscador, ver [0008](0008-buscador-postgresql.md)).
- **Frontend:** React 19 + TypeScript con Vite, Tailwind 4, React Router y TanStack Query.
- **Calidad:** pytest y ruff; Vitest, Testing Library, oxlint y Prettier; GitHub Actions. Todo en Docker Compose en local.

## Alternativas
- **Spring Boot:** buena opción para el mercado, pero más lenta de arrancar para una sola persona; el desarrollador ya conocía FastAPI.
- **Django:** trae admin y ORM, pero menos control de la API y del frontend separado.
- **Next.js full-stack:** un solo lenguaje, pero el objetivo era practicar un backend Python tipado.
- **SQLite:** más simple, pero sin búsqueda en español ni el mismo motor que en producción.

## Consecuencias
- API documentada sola (`/docs`) y validación con tipos en los dos lados.
- SQLAlchemy síncrono basta para la carga esperada; pasar a asíncrono sería un cambio grande si hiciera falta.
- Dos lenguajes (Python y TypeScript) y dos cadenas de herramientas.
