# Análisis: 23-calidad-transversal

## 1. Petición original
> "ya esta desplegado, vamos con el punto 3" → punto 3 propuesto: ADRs de las decisiones clave, gestión de errores y logging homogéneos y documentación OpenAPI revisada (los tres pendientes "Transversal" del BACKLOG).

## 2. Objetivo
Que el proyecto se entienda y se mantenga como uno profesional: decisiones explicadas, errores y logs coherentes para diagnosticar fallos en producción, y una API bien documentada en `/docs`. También suma en el portfolio.

## 3. Estado actual del proyecto
- **ADRs**: no hay `docs/adr/`. Las decisiones están repartidas en los devlogs y la memoria del proyecto.
- **Errores (backend)**: 30 `raise HTTPException` en los endpoints; cada endpoint traduce a mano las excepciones del servicio (p. ej. `InvalidSchoolYearError` → 422 aparece repetido en `POST` y `PATCH /documents`). Sin manejador global: un fallo inesperado devuelve un 500 de texto plano sin rastro útil. Los errores de validación de FastAPI salen en inglés ("Field required").
- **Errores (frontend)**: `apiFetch` ya convierte `detail` (texto o lista) en mensaje. Si una pantalla falla al pintar, React Router muestra "Unexpected Application Error!" con la traza (lo vimos al probar la 17).
- **Logging**: solo un `logger.warning` en la extracción de texto. Sin configuración, sin log de peticiones; en Render solo se ven las líneas de uvicorn.
- **OpenAPI**: `FastAPI(title=...)` sin descripción ni versión; 36 rutas, solo 10 con `summary`/`description`; no se documentan las respuestas 401/403/404/409/422.

## 4. Alcance (propuesta)
### A. ADRs (`docs/adr/`, formato corto: contexto, decisión, alternativas, consecuencias)
1. Stack: FastAPI + SQLAlchemy + PostgreSQL y React + Vite + TanStack Query.
2. Autenticación: login solo con Google (ID token) y JWT propio con roles.
3. Roles admin/coordinador/monitor/usuario y niños sin cuenta.
4. Despliegue gratuito: Vercel + Render + Neon (y sus límites).
5. Fechas: hora de España "AAAA-MM-DD HH:MM" en la API.
6. Biblioteca: copia del fichero en la base de datos (no en disco ni en Drive).
7. Drive con `drive.file` y el selector de Google; el token se queda en el navegador.
8. Buscador con el texto completo de PostgreSQL (sin motor externo).
9. Feed iCal público sin token.
+ `docs/adr/README.md` con el índice y la plantilla.

### B. Errores y logging
- **Backend**: una excepción base `AppError(status, detail)` en los servicios y un único manejador que la convierte en respuesta; los endpoints dejan de repetir `try/except`.
- Manejador global de errores inesperados: 500 `{"detail": "Error interno", "request_id": "…"}` y traza completa en el log.
- Errores de validación (422) en español y en una línea ("title: debe tener al menos 1 carácter").
- **Logging**: configuración única (nivel por `LOG_LEVEL`), una línea por petición (método, ruta, estado, duración, usuario) y un `X-Request-ID` en cada respuesta para cruzar lo que ve el usuario con el log de Render.
- **Frontend**: pantalla de error propia (`errorElement`) con "Algo ha fallado", botón de recargar y volver al inicio, en lugar de la traza.

### C. OpenAPI
- Título, descripción, versión y contacto de la API; descripción de cada grupo (tag).
- `summary` en todas las rutas y respuestas de error documentadas (401, 403, 404, 409, 413, 422) con un esquema común.
- Revisar `/docs` en local y dejar enlace en el README.

### Fuera de alcance
- Servicios de monitorización externos (Sentry, etc.).
- Cambiar el comportamiento de la API (salvo el formato de los 422 y el 500).

## 5. Riesgos y dependencias
- El refactor de errores toca todos los endpoints: los tests actuales (179 + 71) son la red de seguridad; los mensajes `detail` no cambian.
- El nuevo formato de los 422 cambia un poco lo que ve el frontend (mejor, en español); `apiFetch` se adapta.

## 6. Preguntas abiertas

- [x] 1. Una sola feature (23) con commits por bloque.
- [x] 2. Lista de 9 ADRs aprobada.
- [x] 3. Refactor a `AppError`.
- [x] 4. Log en texto de una línea.
- [x] 5. `/docs` sigue público en producción.

## 7. Criterios de aceptación
- [x] `docs/adr/` con índice y los ADRs acordados.
- [x] Un error de servicio, uno de validación y uno inesperado devuelven JSON coherente; el inesperado deja traza y `request_id` en el log.
- [x] Cada petición deja una línea de log con estado y duración, y la respuesta lleva `X-Request-ID`.
- [x] Un fallo al pintar una pantalla muestra la página de error propia.
- [x] `/docs` con descripción, versión, tags y `summary` en todas las rutas y sus errores.
- [x] Tests, ruff, lint y build en verde.
