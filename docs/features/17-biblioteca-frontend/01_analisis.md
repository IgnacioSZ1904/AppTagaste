# Análisis: 17-biblioteca-frontend

## 1. Petición original
> "vamos con el feature 17" → feature 17 del backlog (P1): navegar por curso y por grupo, filtro por etiquetas, buscador y abrir o descargar el documento.
>
> Ignacio: "quiero que se navegue por carpetas, al abrir se ven carpetas por cursos, dentro del curso carpetas por grupos con los documentos, pero el buscador filtra por etiquetas/texto"; "quiero que haya una opcion de vista previa y de descarga"; URL compartible: sí.

## 2. Objetivo
Que monitores, coordinadores y el admin encuentren rápido un recurso (una dinámica, una oración, una convivencia de otro año) en la página **Biblioteca** y lo abran o descarguen, sobre lo que ya hicieron las features 14, 15 y 16.

## 3. Estado actual del proyecto
- Backend (14 y 16, en `develop`), solo admin, coordinador y monitor:
  - `GET /documents?school_year=&group=&tag=&q=`: lista sin el fichero; varias `tag` = los que tienen todas; `q` = buscador por título, etiquetas y texto, ordenado por relevancia. Sin paginación.
  - Cada documento: `title`, `school_year`, `group_name`, `tags`, `filename`, `mime_type`, `size`, `created_by`, `created_at`, `has_text` y, al buscar, `snippet` con lo encontrado entre `<mark>` y `</mark>` (**texto sin escapar**).
  - `GET /documents/filters`: cursos, grupos y etiquetas usados. `GET /documents/{id}/file`: la copia del fichero (`inline`), **con token**.
  - Los documentos son de solo lectura (no hay editar ni borrar).
- Frontend (15): página `/biblioteca` con "Añadir desde Drive" y "Subir desde el ordenador" (`AddDocumentsModal`), y el texto "Pronto podrás buscarlos y filtrarlos aquí". Enlace y ruta ya protegidos con `canUseLibrary`.

## 4. Alcance
### Dentro de alcance
- **Carpetas**: al entrar, una carpeta por curso escolar (el más reciente primero, con el nº de documentos). Dentro de un curso, una carpeta por grupo. Dentro de un grupo, sus documentos (los más recientes primero).
- **Ruta de migas** ("Biblioteca › 2025-2026 › Confirmación A") para volver atrás.
- **Buscador y etiquetas**: buscador por texto (título, etiquetas y contenido) y chips de etiquetas (varias a la vez). Busca dentro de la carpeta en la que estás; en la raíz, en toda la biblioteca. Los resultados salen en lista, con su curso y grupo, el fragmento con lo encontrado resaltado y orden por relevancia.
- **Documento**: título, etiquetas (al pulsar una, se filtra por ella), tipo (PDF/Word), tamaño, quién lo añadió y cuándo; aviso discreto si no tiene texto ("solo se busca por título y etiquetas").
- **Vista previa** en una ventana dentro de la app: PDF con el visor del navegador y Word convertido a página (librería `docx-preview`, se descarga solo al usarla). **Descargar** baja el fichero con su nombre. Como el fichero pide token, se pide con `apiFetch`.
- Carpeta y búsqueda en la URL (`/biblioteca/2025-2026/Confirmación A?q=perdon&tag=oración`): "atrás" y recargar funcionan y se puede pasar el enlace.
- Estados vacíos ("Aún no hay documentos", "Nada coincide") y errores claros.
- Al añadir documentos, las carpetas y la lista se actualizan solas.
- Tests y README.

### Fuera de alcance
- Editar o borrar documentos (la API es de solo lectura).
- Editar el Word desde la vista previa (es solo lectura; puede no verse idéntico a Word).
- Paginación (pocos documentos por ahora).
- Sugerencia de etiquetas con IA (feature 18).

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| El fragmento trae HTML sin escapar | Segura | Alto (XSS) | Partir el texto por `<mark>`/`</mark>` y pintarlo como texto con React, nunca `dangerouslySetInnerHTML` |
| El enlace al fichero no lleva token | Segura | Medio | Descargar con `apiFetch` (blob) y abrir una URL temporal del navegador |
| La vista previa de Word no sale idéntica | Media | Bajo | Es orientativa; "Descargar" siempre disponible |
| `docx-preview` pesa (~1 MB) | Segura | Bajo | Se carga solo al abrir la vista previa de un Word |
| Varios grupos con el mismo nombre en cursos distintos | Media | Bajo | Las carpetas de grupo se calculan dentro de cada curso |
| Muchos documentos sin paginar | Baja | Bajo | Volver a ello cuando haya cientos |

## 6. Preguntas abiertas
- [x] ¿Filtros o carpetas? → **Carpetas**: cursos → grupos → documentos; el buscador filtra por texto y etiquetas.
- [x] ¿Vista previa y descarga? → **Sí**, las dos, para PDF y Word.
- [x] ¿Carpeta y búsqueda en la URL? → **Sí**.
- [x] ¿El buscador busca dentro de la carpeta abierta (y en la raíz, en todo)? → **Sí**, con un enlace "Buscar en toda la biblioteca".
- [x] ¿Vista previa de Word con `docx-preview` (en el navegador, sin tocar el backend)? → **Sí**.

## 7. Criterios de aceptación
- [x] El buscador encuentra por título, etiquetas y texto, con el fragmento resaltado y sin pintar HTML del documento.
- [x] Al entrar se ven las carpetas de los cursos; dentro, las de sus grupos; dentro, sus documentos; las migas llevan atrás.
- [x] El buscador y las etiquetas buscan en la carpeta abierta (en la raíz, en todo) y se pueden quitar.
- [x] Pulsar una etiqueta de un documento filtra por ella.
- [x] "Vista previa" muestra PDF y Word dentro de la app; "Descargar" baja el fichero con su nombre.
- [x] La URL guarda carpeta y búsqueda; "atrás" y recargar mantienen la vista.
- [x] Tras añadir documentos, aparecen en la lista sin recargar.
- [x] Usable en móvil (375 px) y escritorio.
- [x] `npm run lint`, `npm test` y `npm run build` pasan en local y en GitHub Actions.
