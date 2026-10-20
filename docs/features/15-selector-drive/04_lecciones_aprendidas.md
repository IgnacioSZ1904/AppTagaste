# Lecciones aprendidas: 15-selector-drive

## [2026-10-20] — El token de Drive no tiene por qué pasar por el servidor
- **Qué pasó:** la idea inicial era que la API descargara de Drive con el token del usuario.
- **Corrección:** el navegador descarga el fichero (Drive permite CORS con el token) y lo sube a `POST /documents` como cualquier otro. La API casi no cambia y no guarda ni ve tokens de Google.
- **Aplicar en:** cualquier integración con datos del usuario en Google: pedir el permiso mínimo (`drive.file`) y mantener el token en el navegador.

## [2026-10-20] — FormData no lleva Content-Type a mano
- **Qué pasó:** `apiFetch` ponía siempre `Content-Type: application/json`, lo que rompe una subida multipart.
- **Corrección:** opción `form` en `apiFetch`; con ella no se pone el Content-Type y el navegador añade el suyo con el separador.
- **Aplicar en:** cualquier subida de ficheros desde el frontend.

## [2026-10-20] — Evitar duplicados con un índice único en la base de datos
- **Qué pasó:** el mismo fichero de Drive podía añadirse dos veces.
- **Corrección:** índice único en `drive_file_id` (migración `0009`) y 409 con el título del que ya existe; los subidos desde el ordenador lo tienen vacío y no cuentan.
- **Aplicar en:** cualquier dato importado de fuera con identificador propio.

## [2026-10-20] — Librerías externas de Google en los tests
- **Qué pasó:** el selector y el permiso de Google cargan scripts externos que no existen en los tests.
- **Corrección:** `useGoogleLogin` simulado en `test/setup.tsx`; la descarga de Drive (`driveFiles.ts`) separada del selector para probarla con `fetch` simulado.
- **Aplicar en:** separar la lógica propia del código que depende de scripts de terceros.
