# Tareas pendientes: 14-biblioteca-documentos

> Estado: ✅ Completada
> Última actualización: 2026-10-20

## Bloque 1 — Preparación
- [x] T1.1 (manual, Ignacio) — `git checkout develop && git pull && git checkout -b feature/14-biblioteca-documentos`

## Bloque 2 — Backend
- [x] T2.1 — Modelos `Document`, `DocumentFile`, `Tag` y migración `0008_biblioteca`
- [x] T2.2 — Esquemas, servicio (validación de tipo, tamaño y curso; etiquetas normalizadas)
- [x] T2.3 — Endpoints y dependencia `Librarian`; `python-multipart` en `requirements.txt`
- [x] T2.4 — `test_documents.py` y matriz de `test_roles.py`

## Bloque 3 — Pruebas (manual, Ignacio)
- [x] T3.1 — `docker compose up --build -d`, `alembic upgrade head`, `pytest`, ruff
- [x] T3.2 — Subir un PDF desde `/docs` (Swagger) y abrirlo con `GET /documents/{id}/file`

## Bloque 4 — Documentación y cierre
- [x] T4.1 — README, devlog, lecciones, criterios y BACKLOG (antes de los commits)
