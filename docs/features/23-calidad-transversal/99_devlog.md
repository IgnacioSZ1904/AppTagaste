# Devlog: 23-calidad-transversal

---

## [2026-10-20] — Inicio del evolutivo
- Desplegados en producción la 17, la 22 y el arreglo de editar y eliminar documentos
- La 18 queda descartada; se abordan los pendientes "Transversal" del BACKLOG
- Análisis redactado

## [2026-10-20] — Análisis aprobado
- Una sola feature con commits por bloque; 9 ADRs; refactor a `AppError`; log en texto; `/docs` público
- Planificación redactada

## [2026-10-20] — Planificación aprobada ("dale caña")
- Tareas redactadas (15 en 7 bloques) y ejecución directa

## [2026-10-20] — Código terminado en la nube
- **Errores:** `AppError` y 8 subclases en `core/errors.py`; las excepciones de los servicios heredan de ellas y los endpoints ya no tienen `try/except`. Validación de Pydantic traducida al español (`campo: mensaje`). Los mensajes de antes no cambian, así que los tests existentes siguen verdes sin tocarlos
- **Logging:** formato en texto con `[request_id]`, middleware que genera o respeta `X-Request-ID`, una línea por petición con ms y usuario; los 500 devuelven `request_id` y el traceback va al log
- **OpenAPI:** versión 1.0.0, descripción (auth, roles, fechas, errores), tags descritos, `summary` en todas las rutas y errores documentados con `ErrorRead`
- **Frontend:** `ErrorPage` como `errorElement` de todas las rutas; los errores de la API muestran `(ref. …)`
- **ADRs:** `docs/adr/` con plantilla, índice y 0001–0009
- README: secciones "Errores y logs" y "Decisiones de arquitectura"; `LOG_LEVEL` en `.env.example`
- Problemas resueltos: `fileConfig` de Alembic desactivaba los loggers de la app durante los tests (`disable_existing_loggers=False`); el `user_id` en un `ContextVar` se perdía porque la dependencia corre en otro hilo (se guarda en `request.state`); el `request_id` se añade con una *record factory* para que esté en todos los registros, no solo en los del handler
- Backend: 190 tests y ruff OK. Frontend: 79 tests, lint y build OK

## [2026-10-20] — Pruebas manuales OK y cierre
- Tests, ruff, lint y build en verde en local; `/docs`, logs con `X-Request-ID`, 422 en español y página de error revisados
- Criterios de aceptación cumplidos; BACKLOG: 23 y los tres puntos transversales en [x]
