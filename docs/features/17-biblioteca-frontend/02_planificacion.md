# Planificación: 17-biblioteca-frontend

## 1. Enfoque técnico
Solo frontend. La página `/biblioteca` pasa a tener tres niveles de carpetas según la URL (`/biblioteca`, `/biblioteca/:curso`, `/biblioteca/:curso/:grupo`). Cada nivel pide `GET /documents` con el filtro de su carpeta y calcula las subcarpetas en el navegador. Con texto o etiquetas en la URL (`?q=&tag=`), la misma petición lleva `q` y `tag` y se muestra una lista de resultados con su fragmento. La vista previa y la descarga piden el fichero con el token y lo muestran (PDF en un `iframe`, Word con `docx-preview`) o lo guardan.

## 2. Decisiones de diseño
| Decisión | Alternativas | Justificación |
|----------|--------------|---------------|
| Carpeta en la ruta (`/biblioteca/2025-2026/Confirmación A`) y búsqueda en `?q=&tag=` | Todo en `?` | Las migas y "atrás" salen solos con React Router; el enlace se puede pasar |
| Subcarpetas calculadas con la lista de `GET /documents` del nivel (cursos en la raíz, grupos dentro de un curso) | Endpoint nuevo de carpetas | Sin tocar el backend; pocos documentos y la lista no lleva el fichero |
| Cursos ordenados del más reciente al más antiguo; grupos por nombre; documentos por fecha (o relevancia al buscar) | — | Lo pedido en el análisis |
| Un hook `useDocuments({ schoolYear, group, q, tags })` con clave `['documents', …]` | Un hook por nivel | `AddDocumentsModal` ya invalida `['documents']`: todo se refresca al añadir |
| Buscador con espera de 300 ms antes de pedir; actualiza la URL con `replace` | Botón "Buscar" | Búsqueda al escribir sin llenar el historial |
| Chips de etiquetas desde `GET /documents/filters` (varias = todas) | Desplegable | Pocas etiquetas y más rápido en móvil |
| Buscar dentro de la carpeta abierta; enlace "Buscar en toda la biblioteca" que va a la raíz con la misma búsqueda | Siempre global | Acordado en el análisis |
| Fragmento: partir por `<mark>`/`</mark>` y pintar trozos de texto con `<mark>` de React | `dangerouslySetInnerHTML` | El texto del documento no se escapa en la API: así nunca se ejecuta HTML |
| `apiFile(path)` en `client.ts`: misma autenticación y errores que `apiFetch`, devuelve un `Blob` | `<a href>` directo | El fichero pide token |
| Vista previa en un modal grande: PDF con `URL.createObjectURL` en un `iframe`; Word con `docx-preview` importado al abrir (`import()`) | Pestaña nueva | Lo pidió Ignacio; `docx-preview` (~1 MB) no pesa en la carga inicial |
| Descargar: `<a download={filename}>` temporal con la URL del blob | — | Guarda con el nombre original |
| Tarjetas de carpeta con icono, nombre y nº de documentos; en móvil una columna | Tabla | Más "explorador de carpetas" |

## 3. Cambios por módulo
### `frontend/`
- `package.json`: `docx-preview`.
- `src/api/client.ts`: `apiFile(path)` (Blob) reutilizando la parte común de `apiFetch`.
- `src/api/documents.ts`: `has_text` y `snippet` en el tipo; `useDocuments(filters)`, `useLibraryFilters()`, `downloadDocument(doc)`.
- `src/lib/snippet.ts` (nuevo): `snippetParts(snippet)` → `[{ text, marked }]`.
- `src/lib/folders.ts` (nuevo): `yearFolders(docs)`, `groupFolders(docs)` con recuento y orden.
- `src/pages/LibraryPage.tsx`: lee `:curso`, `:grupo`, `?q`, `?tag`; cabecera con los botones de añadir (los de la 15), migas, buscador, carpetas o documentos; quita el texto "Pronto podrás…".
- `src/components/library/` (nuevos): `Breadcrumbs.tsx`, `LibrarySearch.tsx` (buscador + chips), `FolderGrid.tsx`, `DocumentList.tsx` / `DocumentCard.tsx` (datos, etiquetas pulsables, fragmento, aviso sin texto, botones), `Snippet.tsx`, `DocumentPreview.tsx` (modal).
- `src/router.tsx`: `biblioteca/:curso?/:grupo?` (tres rutas al mismo componente).
- Tests: `LibraryPage.test.tsx` ampliado (carpetas, migas, búsqueda en carpeta y global, etiquetas, vista previa PDF y Word con `docx-preview` simulado, descarga), `snippet.test.ts` (incluye `<script>` en el texto), `folders.test.ts`.

### Documentación
- `README.md`: cómo se navega la biblioteca, buscador, vista previa y descarga.

## 4. Plan de pruebas
- `npm run lint`, `npm test`, `npm run build` (comprobar que `docx-preview` va en un trozo aparte).
- Capturas con la API simulada: raíz, curso, grupo, búsqueda, vista previa; escritorio y 375 px.
- Manual: con documentos reales de varios cursos y grupos, navegar, buscar, vista previa de un PDF y un Word, descargar.

## 5. Commits (separados)
1. `feat(biblioteca): descarga de ficheros con token y consultas de documentos`
2. `feat(biblioteca): carpetas por curso y grupo, buscador y etiquetas`
3. `feat(biblioteca): vista previa de PDF y Word y descarga`
4. `test(biblioteca): carpetas, buscador, vista previa y descarga`
5. `docs(biblioteca): README y documentación de la feature 17`

## 6. Rama
`feature/17-biblioteca-frontend` (la crea Ignacio desde `develop`).
