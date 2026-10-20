# Tareas pendientes: 16-buscador-texto-completo

> Estado: ✅ Completada
> Última actualización: 2026-10-20

## Bloque 1 — Preparación
- [x] T1.1 (manual, Ignacio) — `git checkout develop && git pull && git checkout -b feature/16-buscador-texto-completo`

## Bloque 2 — Backend
- [x] T2.1 — `services/text_extraction.py` y dependencias `pypdf` y `python-docx`
- [x] T2.2 — Migración `0010_buscador` (`unaccent`, `es_unaccent`, columnas, índice GIN e indexado de los existentes)
- [x] T2.3 — Indexado al subir, búsqueda `q` con relevancia y fragmento, `has_text` y `snippet`
- [x] T2.4 — Comando `reindex-documents`
- [x] T2.5 — Tests

## Bloque 3 — Pruebas (manual, Ignacio)
- [x] T3.1 — `docker compose up --build -d`, `alembic upgrade head`, `pytest`, ruff
- [x] T3.2 — Buscar en `/docs` una temática y una dinámica de documentos reales

## Bloque 4 — Documentación y cierre
- [x] T4.1 — README, devlog, lecciones, criterios y BACKLOG (antes de los commits)
