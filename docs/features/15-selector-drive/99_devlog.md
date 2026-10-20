# Devlog: 15-selector-drive

## 2026-10-20
- Análisis validado: el navegador descarga de Drive y sube a la API (el token no llega al servidor); varios ficheros a la vez con el mismo curso, grupo y etiquetas; fichero repetido → 409; página mínima `/biblioteca`; Google Docs, PDF y Word. Planificación aprobada.
- Implementado backend: campo `drive_file_id` en `POST /documents`, 409 si se repite, migración `0009_documento_drive_unico`.
- Implementado frontend: permiso `drive.file` con `useGoogleLogin`, `lib/googlePicker.ts` (Google Picker con selección múltiple), `lib/driveFiles.ts` (Google Docs exportados a .docx), `api/documents.ts` (`uploadDocument`, `schoolYears`), opción `form` en `apiFetch`, página `/biblioteca` con enlace en la cabecera, `AddDocumentsModal` (subida uno a uno con su estado y "Reintentar"), `canUseLibrary`; variables `VITE_GOOGLE_API_KEY` y `VITE_GOOGLE_APP_ID`; README con la configuración de Google Cloud.
- Verificado en la nube: 158 tests de backend (2 nuevos) y 58 de frontend (7 nuevos), ruff, lint y build OK; `0009` aplica, revierte y vuelve a aplicar.
- Configuración de Google Cloud y prueba manual de Ignacio en local con Drive real: OK.
