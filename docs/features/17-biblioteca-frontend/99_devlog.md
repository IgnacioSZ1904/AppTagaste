# Devlog: 17-biblioteca-frontend

---

## [2026-10-20] — Inicio del evolutivo
- Features 14, 15 y 16 hechas (biblioteca en backend, selector de Drive y buscador)
- Análisis redactado

## [2026-10-20] — Análisis aprobado
- Navegación por carpetas: cursos → grupos → documentos
- El buscador filtra por texto y etiquetas dentro de la carpeta abierta (en la raíz, toda la biblioteca)
- Vista previa y descarga; la URL guarda carpeta y búsqueda (se puede compartir)
- Word en el navegador con `docx-preview`
- Planificación redactada

## [2026-10-20] — Planificación aprobada
- Tareas pendientes redactadas (15 tareas en 5 bloques)

## [2026-10-20] — Ejecución de tareas (ficheros)
- Tareas aprobadas; hechas T2.1–T2.3, T3.1–T3.6 y T4.1
- `apiFile` comparte con `apiFetch` la petición con token; `LibraryBrowser` con carpetas calculadas en el navegador a partir de `GET /documents`
- Fragmento del buscador partido por `<mark>` y pintado como texto (test con `<script>`)
- `docx-preview` se carga solo al previsualizar un Word (trozo aparte de 171 KB en el build)
- oxlint avisó de `setState` dentro de un efecto en el buscador: se sincroniza con la URL durante el render
- 69 tests, lint y build en verde; capturas en `capturas/`

## [2026-10-20] — Pruebas manuales y cierre
- Al probar, Google respondió 403 `access_denied`: la app está en modo Prueba y la cuenta no era usuario de prueba. Se añadió en Google Auth Platform → Público
- Pruebas manuales OK (Ignacio); criterios, tareas y BACKLOG cerrados

## [2026-10-20] — Arreglo: editar y eliminar documentos
- Botones "Editar" y "Eliminar" en la tarjeta, solo si `can_edit`. "Editar" abre un modal con título, curso, grupo y etiquetas (si el grupo original se borró, se puede dejar su nombre); "Eliminar" pide confirmación
- Tras editar o eliminar se refrescan carpetas, búsqueda y filtros (`['documents']`)
- Texto del modal de añadir: el fichero no se cambia, sus datos sí
- 71 tests, lint y build en verde. Backend en el devlog de la 14
