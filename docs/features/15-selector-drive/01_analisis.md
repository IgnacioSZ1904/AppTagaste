# Análisis: 15-selector-drive

## 1. Petición original
> "seguimos" → feature 15 del backlog: `selector-drive` (P0), "Botón «Añadir desde Drive» con el selector de Google; al añadir se piden curso, grupo y etiquetas, y la API descarga el fichero (Google Docs, PDF, Word)".

## 2. Objetivo
Que un monitor añada a la biblioteca documentos de su propio Drive sin descargarlos a mano: los elige, indica curso, grupo y etiquetas, y la app guarda la copia.

## 3. Estado actual del proyecto
- 14: `POST /documents` (multipart) guarda la copia (PDF o .docx, máx. 10 MB) con curso, grupo y etiquetas; el modelo ya tiene `drive_file_id`.
- Login con Google en el frontend con `@react-oauth/google` (`VITE_GOOGLE_CLIENT_ID`); sirve también para pedir permiso de Drive.
- Aún no hay pantalla de biblioteca (es la 17).

## 4. Alcance
### Dentro de alcance
- Permiso `drive.file` (solo los ficheros que el usuario elige; Google no exige verificar la app).
- Selector de Google (Google Picker) filtrado a Google Docs, PDF y Word.
- Formulario con curso, grupo y etiquetas, y envío a la API.
- Google Docs exportados a .docx.
- Configuración en Google Cloud (pasos para Ignacio) y variables nuevas.
- Tests, README.

### Fuera de alcance
- Lista, filtros y buscador de la biblioteca (16 y 17).

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Configuración de Google Cloud (Picker API, clave de API, orígenes) | Alta | Medio | Pasos detallados en el README; clave restringida a los dominios de la app |
| Token de Drive expuesto | Baja | Alto | El token no sale del navegador (pregunta 1) y caduca en 1 hora |
| Mismo fichero añadido dos veces | Media | Bajo | Se detecta por `drive_file_id` (pregunta 3) |

## 6. Preguntas abiertas
- [x] 1. ¿Quién descarga el fichero de Drive? → **el navegador**, con el permiso del usuario, y lo sube a `POST /documents`. El token de Drive nunca llega al servidor.
- [x] 2. ¿Se pueden elegir varios ficheros a la vez? → **sí** (no complica ni ralentiza: se suben uno detrás de otro), con el mismo curso, grupo y etiquetas para todos.
- [x] 3. ¿Qué pasa si un fichero de Drive ya está en la biblioteca? → **se rechaza** (409) y se avisa con el título del que ya existe.
- [x] 4. ¿Dónde va el botón? → **página mínima `/biblioteca`** con "Añadir desde Drive" y "Subir desde el ordenador"; la lista y los filtros, en la 17.
- [x] 5. ¿Qué tipos aparecen en el selector? → **Google Docs, PDF y Word**.

## 7. Criterios de aceptación
- [x] Un monitor pulsa "Añadir desde Drive", da permiso, elige uno o varios ficheros, indica curso, grupo y etiquetas, y quedan en la biblioteca con su copia.
- [x] Un Google Doc se guarda como .docx.
- [x] Un fichero de Drive repetido no se duplica.
- [x] El token de Drive no se envía a la API.
- [x] Tests, ruff, lint y build en verde en la CI.
