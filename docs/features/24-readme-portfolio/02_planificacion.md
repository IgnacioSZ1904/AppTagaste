# Planificación: 24-readme-portfolio

> Estado: ✅ Aprobada
> Fecha: 2026-10-20

## 1. Ficheros
| Fichero | Cambio |
|---|---|
| `README.md` | Reescrito: portada en español y versión en inglés debajo |
| `docs/guia.md` | Nuevo: todo lo operativo del README actual (local, migraciones, Google, Drive, despliegue, publicar la app, CLI, errores y logs, estructura) |
| `docs/img/*.png` | Nuevo: 5 capturas con datos inventados |
| `LICENSE` | Nuevo: MIT, "Copyright (c) 2026 Ignacio Segovia Zurita" |
| `docs/BACKLOG.md` | Fila de la 24 |

## 2. Estructura del README
1. Título, frase, badges (CI, demo, licencia MIT) y aviso de que Render tarda ~1 min la primera vez.
2. Capturas: calendario (escritorio), biblioteca con buscador, pase de lista y calendario en móvil.
3. Qué hace, por rol (admin, coordinador, monitor, usuario).
4. Stack.
5. Arquitectura: diagrama Mermaid (navegador → Vercel → Render → Neon; Google Identity, Picker y Drive).
6. Decisiones técnicas destacadas, con 1 línea cada una y enlace a su ADR.
7. Calidad: tests, CI, linters, errores y logs con `X-Request-ID`, OpenAPI.
8. Cómo está hecho: metodología por feature, con enlace a una feature de ejemplo (16 buscador) y al BACKLOG.
9. Arranque rápido en local y enlace a `docs/guia.md`.
10. Licencia y autor.
11. **English**: la misma estructura, más breve y sin repetir las capturas.

## 3. Capturas
- Build real del frontend con la API simulada (Playwright), con nombres inventados y sin datos del colegio.
- Calendario con eventos de varios tipos, biblioteca con búsqueda y fragmento resaltado, pase de lista y calendario a 375 px.
- PNG optimizados (menos de 300 KB cada uno).

## 4. Riesgos
- Enlaces rotos al mover secciones: se revisan todos los enlaces relativos con un script.
- Que las capturas queden desfasadas si cambia la UI: se regeneran a mano (no se añade Playwright al repo solo para esto).
