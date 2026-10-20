# Lecciones aprendidas: 17-biblioteca-frontend

## [2026-10-20] — Fragmentos con HTML sin escapar
- **Qué pasó:** el buscador devuelve el trozo con `<mark>` pero el resto del texto del documento sin escapar.
- **Corrección:** partir por `<mark>`/`</mark>` y pintar cada trozo como texto de React, nunca con `dangerouslySetInnerHTML`; test con `<script>`.
- **Aplicar en:** cualquier texto de la API que traiga marcas.

## [2026-10-20] — Librerías pesadas solo cuando hacen falta
- **Qué pasó:** `docx-preview` pesa unos 170 KB.
- **Corrección:** `import()` dinámico al abrir la vista previa de un Word; Vite lo deja en un trozo aparte.
- **Aplicar en:** visores, editores y gráficas que no se usan en todas las visitas.

## [2026-10-20] — Campo de búsqueda sincronizado con la URL
- **Qué pasó:** oxlint avisó de `setState` dentro de un `useEffect` para seguir a la URL.
- **Corrección:** comparar con el último valor durante el render y actualizar ahí; el efecto queda solo para la espera de 300 ms.
- **Aplicar en:** campos cuyo valor también vive en la URL.

## [2026-10-20] — Google en modo Prueba
- **Qué pasó:** al pedir `drive.file`, Google devolvió 403 `access_denied` con una cuenta que no era usuario de prueba.
- **Corrección:** añadir la cuenta en Google Auth Platform → Público → Usuarios de prueba (o publicar la app).
- **Aplicar en:** cualquier prueba con una cuenta nueva de Google.
