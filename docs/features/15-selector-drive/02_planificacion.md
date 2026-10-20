# Planificación: 15-selector-drive

> Estado: pendiente de aprobación
> Basado en: 01_analisis.md (preguntas abiertas resueltas el 2026-10-20)

## 1. Backend
- `POST /documents` acepta un campo opcional `drive_file_id`. Si ese fichero de Drive ya está en la biblioteca → **409** "Ya está en la biblioteca: «título»".
- Migración `0009_documento_drive_unico`: índice único en `documents.drive_file_id` (los subidos desde el ordenador lo tienen vacío y no cuentan).
- El token de Drive no llega nunca a la API.

## 2. Frontend
- **Permiso de Drive:** `useGoogleLogin` de `@react-oauth/google` (ya instalado) con el permiso `drive.file`. Google pide permiso la primera vez; el token dura 1 hora y solo vive en memoria.
- **Selector:** `lib/googlePicker.ts` carga el Google Picker, con selección múltiple y solo Google Docs, PDF y Word.
- **Descarga:** `lib/driveFiles.ts` descarga cada fichero desde Drive con el token: los Google Docs exportados a .docx y los PDF y Word tal cual.
- **Subida:** `api/documents.ts` con `uploadDocument` (FormData a `POST /documents`, con `drive_file_id` cuando viene de Drive).
- **Página `/biblioteca`** (admin, coordinadores y monitores, enlace "Biblioteca" en la cabecera): botones "Añadir desde Drive" y "Subir desde el ordenador".
- **Formulario `AddDocumentsModal`:** ficheros elegidos, curso escolar (lista con el actual y los 9 anteriores, por defecto el actual), grupo (lista de grupos existentes) y etiquetas (separadas por comas). Al pulsar "Añadir", se suben uno detrás de otro con su estado: añadido, repetido o error.
- `roles.ts`: `canUseLibrary`.
- **Variables nuevas:** `VITE_GOOGLE_API_KEY` (clave de API del Picker) y `VITE_GOOGLE_APP_ID` (número del proyecto de Google Cloud), en `.env.example` y en Vercel.

## 3. Configuración en Google Cloud (manual, Ignacio)
En el mismo proyecto del login con Google:
1. Activar **Google Picker API** y **Google Drive API**.
2. Crear una **clave de API** restringida a los sitios `http://localhost:5173/*` y `https://app-tagaste.vercel.app/*`, y a la Picker API.
3. En la **pantalla de consentimiento OAuth**, añadir el permiso `.../auth/drive.file`.
4. Copiar el **número del proyecto** (página principal del proyecto).
5. Poner las dos variables en `frontend/.env` y en Vercel (Settings → Environment Variables) y volver a desplegar.

## 4. Tests
- Backend: `drive_file_id` repetido → 409; el mismo fichero sin `drive_file_id` sí se puede subir dos veces. Migración: aplica, revierte y `alembic check` limpio.
- Frontend `LibraryPage.test.tsx`: subir desde el ordenador envía el FormData con curso, grupo y etiquetas; un repetido se marca como "Ya está en la biblioteca"; los usuarios no ven la página. `driveFiles.test.ts`: un Google Doc se pide exportado a .docx y un PDF con `alt=media`.

## 5. Documentación
- README: sección "Añadir documentos desde Drive" con la configuración de Google Cloud.
