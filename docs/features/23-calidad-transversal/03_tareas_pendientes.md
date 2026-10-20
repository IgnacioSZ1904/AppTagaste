# Tareas pendientes: 23-calidad-transversal

> Estado: ✅ Completada
> Última actualización: 2026-10-20

## Bloque 1 — Preparación
- [x] T1.1 (manual, Ignacio) — `git checkout develop && git pull && git checkout -b feature/23-calidad-transversal`

## Bloque 2 — ADRs
- [x] T2.1 — `docs/adr/README.md` (plantilla e índice)
- [x] T2.2 — ADRs 0001–0009

## Bloque 3 — Errores y logging (backend)
- [x] T3.1 — `core/errors.py`: `AppError`, subclases y manejadores (servicio, validación en español, 500)
- [x] T3.2 — Excepciones de los servicios heredan de `AppError`; endpoints sin `try/except`
- [x] T3.3 — `core/logging.py`, `LOG_LEVEL` y middleware con `X-Request-ID` y línea por petición
- [x] T3.4 — Tests de errores y logging

## Bloque 4 — Frontend
- [x] T4.1 — `ErrorPage` como `errorElement`
- [x] T4.2 — Referencia de la petición en los 500; tests

## Bloque 5 — OpenAPI
- [x] T5.1 — Metadatos y descripción de tags
- [x] T5.2 — `summary` en todas las rutas y respuestas de error documentadas; test

## Bloque 6 — Pruebas (manual, Ignacio)
- [x] T6.1 — `docker compose up --build -d`, `pytest`, ruff; `npm run lint`, `npm test`, `npm run build`
- [x] T6.2 — Revisar `/docs`, provocar un 422 y ver el log con `X-Request-ID`

## Bloque 7 — Documentación y cierre
- [x] T7.1 — README, devlog, lecciones, criterios y BACKLOG (antes de los commits)
