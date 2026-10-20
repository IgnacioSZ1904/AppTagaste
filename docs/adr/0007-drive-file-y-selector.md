# 0007. Drive con `drive.file` y el selector de Google

- **Estado:** Aceptado
- **Fecha:** 2026-10-20
- **Feature:** [15-selector-drive](../features/15-selector-drive/)

## Contexto
Los recursos están en el Drive de cada catequista. Pedir acceso a todo su Drive (`drive.readonly`) es un permiso "restringido" que exige una auditoría de seguridad de Google y asusta a los usuarios.

## Decisión
- El usuario elige los ficheros en el **selector de Google** (Google Picker) con el permiso **`drive.file`**: la app solo accede a lo que se elige.
- El **navegador** descarga cada fichero de Drive (los Google Docs exportados a Word) y lo sube a `POST /documents` con su `drive_file_id`. El token de Drive **nunca llega a la API**.
- Un fichero de Drive ya presente en la biblioteca da 409.

## Alternativas
- **Cuenta de servicio que sincroniza una carpeta compartida:** automático, pero obliga a ordenar Drive y no permite elegir curso y grupo al añadir.
- **Permiso `drive.readonly` en el servidor:** verificación de Google costosa y acceso excesivo.

## Consecuencias
- Sin verificación de Google y con el mínimo permiso.
- Hay que configurar la clave de la API de Picker y el número del proyecto en el frontend (`VITE_GOOGLE_API_KEY`, `VITE_GOOGLE_APP_ID`).
- También se puede subir desde el ordenador.
