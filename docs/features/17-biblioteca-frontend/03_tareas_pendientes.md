# Tareas pendientes: 17-biblioteca-frontend

> Estado: ✅ Completada
> Última actualización: 2026-10-20

## Bloque 1 — Preparación
- [x] T1.1 (manual, Ignacio) — `git checkout develop && git pull && git checkout -b feature/17-biblioteca-frontend`
- [x] T1.2 (manual, Ignacio) — `cd frontend && npm install` (añade `docx-preview`)

## Bloque 2 — Datos
- [x] T2.1 — `apiFile` en `api/client.ts` (fichero con token como Blob)
- [x] T2.2 — `api/documents.ts`: `has_text`, `snippet`, `useDocuments`, `useLibraryFilters`, `downloadDocument`
- [x] T2.3 — `lib/snippet.ts` (fragmento seguro) y `lib/folders.ts` (carpetas por curso y grupo)

## Bloque 3 — Pantallas
- [x] T3.1 — Rutas `/biblioteca`, `/biblioteca/:curso` y `/biblioteca/:curso/:grupo` con `?q=&tag=`
- [x] T3.2 — Migas de pan y carpetas (cursos → grupos)
- [x] T3.3 — Buscador con espera de 300 ms y chips de etiquetas, limitado a la carpeta abierta y "Buscar en toda la biblioteca"
- [x] T3.4 — Tarjeta de documento (fragmento resaltado, etiquetas pulsables, aviso "sin texto")
- [x] T3.5 — Vista previa (PDF en el visor del navegador, Word con `docx-preview`) y descarga
- [x] T3.6 — Estados vacíos y refresco tras subir; quitar "Pronto podrás…"

## Bloque 4 — Tests y pruebas
- [x] T4.1 — Tests de `snippet`, `folders` y de la página (carpetas, buscador, vista previa, descarga)
- [x] T4.2 (manual, Ignacio) — `npm run lint`, `npm test`, `npm run build`
- [x] T4.3 (manual, Ignacio) — Navegar carpetas, buscar, previsualizar un PDF y un Word, descargar y copiar una URL a otra pestaña

## Bloque 5 — Documentación y cierre
- [x] T5.1 — README, devlog, lecciones, criterios y BACKLOG (antes de los commits)
