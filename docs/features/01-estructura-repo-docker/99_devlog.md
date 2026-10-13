# Devlog: 01-estructura-repo-docker

---

## [2026-10-13 17:30] — Inicio del evolutivo
- Carpeta creada en `docs/features/01-estructura-repo-docker`
- Análisis redactado; detectado `.env` versionado en Git

## [2026-10-13 17:45] — Análisis aprobado
- Preguntas resueltas: credenciales solo locales, prefijo `/api/v1`, brief a `docs/brief.md`
- Planificación redactada

## [2026-10-13 18:00] — Planificación aprobada
- Tareas pendientes redactadas (14 tareas en 4 bloques)

## [2026-10-13 18:30] — Ejecución de tareas (ficheros)
- Hechas T1.2–T1.5, T2.1–T2.4 y T4.2: `.gitignore`, `.env.example`, versiones fijadas, `requirements-dev.txt`, `.dockerignore`, `core/config.py`, capas, router v1, `main.py`, README
- Versiones fijadas: fastapi 0.143.0, uvicorn 0.54.0, sqlalchemy 2.1.4, psycopg 3.3.6, alembic 1.20.0, pydantic-settings 2.15.0
- Verificado en la nube con uvicorn (sin Docker): `/api/v1/health` → 200 `{"status":"ok"}`, `/docs` → 200, `/health` → 404
- Docker no se pudo probar en la nube (límite de Docker Hub, 429)
- Decisión: a partir de aquí Claude solo edita ficheros; Ignacio ejecuta git y docker a mano (T1.1, T3.x, T4.1, T4.3)
