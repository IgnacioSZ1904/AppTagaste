# Lecciones aprendidas: 24-readme-portfolio

## [2026-10-20] — README de operación frente a README de presentación
- **Qué pasó:** el README había crecido feature a feature hasta 342 líneas de guía técnica; lo que hace la app y cómo se ve quedaba enterrado, y tenía datos desfasados (inscripciones, monitor sin pase de lista).
- **Corrección:** README corto de presentación y `docs/guia.md` con lo operativo.
- **Aplicar en:** cada feature nueva documenta su uso en `docs/guia.md`; el README solo cambia si cambia lo que la app ofrece.

## [2026-10-20] — Capturas sin datos reales
- **Qué pasó:** la app guarda nombres de menores; las capturas no pueden salir de producción.
- **Corrección:** build real con la API simulada (Playwright), datos inventados, `locale` es-ES y hora de Madrid.
- **Aplicar en:** cualquier imagen pública de la app.

## [2026-10-20] — Revisar los ADRs contra el código
- **Qué pasó:** el ADR 0001 decía Python 3.13 y el `Dockerfile` usa 3.12.
- **Corrección:** comprobar versiones y nombres en el código (Dockerfile, CI) antes de documentarlos.
- **Aplicar en:** toda documentación que cite versiones.
