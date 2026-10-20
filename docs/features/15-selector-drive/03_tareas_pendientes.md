# Tareas pendientes: 15-selector-drive

> Estado: ✅ Completada
> Última actualización: 2026-10-20

## Bloque 1 — Preparación
- [x] T1.1 (manual, Ignacio) — `git checkout develop && git pull && git checkout -b feature/15-selector-drive`
- [x] T1.2 (manual, Ignacio) — Configuración de Google Cloud (Picker API, Drive API, clave de API, permiso `drive.file`, número del proyecto)

## Bloque 2 — Backend
- [x] T2.1 — `drive_file_id` en `POST /documents`, 409 si se repite, migración `0009_documento_drive_unico`
- [x] T2.2 — Tests

## Bloque 3 — Frontend
- [x] T3.1 — `api/documents.ts`, `lib/driveFiles.ts`, `lib/googlePicker.ts`, `canUseLibrary`
- [x] T3.2 — Página `/biblioteca`, enlace en la cabecera y `AddDocumentsModal`
- [x] T3.3 — `LibraryPage.test.tsx` y `driveFiles.test.ts`

## Bloque 4 — Pruebas (manual, Ignacio)
- [x] T4.1 — `pytest`, ruff, `npm run lint`, `npm test`, `npm run build`
- [x] T4.2 — Añadir desde Drive un Google Doc y un PDF, y subir uno desde el ordenador; repetir uno

## Bloque 5 — Documentación y cierre
- [x] T5.1 — README, devlog, lecciones, criterios y BACKLOG (antes de los commits)
