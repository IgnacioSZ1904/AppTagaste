# Análisis: 24-readme-portfolio

> Estado: ✅ Validado
> Fecha: 2026-10-20

## 1. Objetivo
Que alguien que entra al repo (reclutador o técnico) entienda en 1 minuto qué es la app, la vea funcionando y vea cómo está hecha. Sin procesos de equipo que no tienen sentido trabajando solo (sin tablero, sin plantillas de issues).

## 2. Situación actual
- README de 342 líneas: casi todo es guía de operación (Google, Render, Neon, migraciones, CLI). Lo importante para un visitante (qué hace, cómo se ve) queda enterrado.
- La intro está desfasada: habla de "inscripciones", que se eliminaron, y de "Proyecto en desarrollo".
- Sin capturas, sin badges, sin diagrama, sin licencia.

## 3. Propuesta
1. **README nuevo y corto** (unas 120 líneas):
   - Título, una frase, badges (CI, demo, licencia) y enlace a la demo.
   - Capturas: calendario, biblioteca con buscador, pase de lista y móvil.
   - Funcionalidades por rol (admin, coordinador, monitor, usuario).
   - Stack y diagrama de arquitectura en Mermaid (se pinta solo en GitHub): Vercel → Render → Neon, más Google.
   - Decisiones técnicas destacadas, con enlace a los ADRs.
   - Calidad: tests (190 backend, 79 frontend), CI, linters, errores y logs.
   - Cómo trabajo: análisis → plan → tareas → devlog y lecciones por feature, con enlace a una feature de ejemplo.
   - Arranque rápido en local (5 comandos).
2. **Guía técnica** en `docs/guia.md`: todo lo operativo del README actual, sin perder nada.
3. **Capturas con datos inventados:** generadas con el build real y la API simulada, sin nombres reales de niños. Se guardan en `docs/img/`.
4. **Licencia MIT** (`LICENSE`).
5. **Para ti, en GitHub (manual, 2 minutos):** descripción del repo, web y *topics* (fastapi, react, postgresql…). Además, fijarlo en tu perfil.

## 4. Fuera de alcance
- Tablero, plantillas de issues y PRs, CONTRIBUTING.
- Cambios en el código de la app.

## 5. Decisiones (Ignacio, 2026-10-20)
1. README en español y, debajo, la versión en inglés.
2. Lo operativo pasa a `docs/guia.md`.
3. Capturas con datos inventados.
4. Licencia MIT.
5. Solo capturas, sin GIF.

## 6. Criterios de aceptación
- [x] README corto con demo, capturas, funcionalidades, arquitectura, decisiones, calidad y arranque.
- [x] Toda la información operativa sigue disponible en `docs/guia.md` y los enlaces funcionan.
- [x] Capturas sin datos reales.
