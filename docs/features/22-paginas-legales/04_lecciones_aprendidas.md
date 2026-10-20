# Lecciones aprendidas: 22-paginas-legales

## [2026-10-20] — Modo Prueba de Google
- **Qué pasó:** una cuenta que no era usuario de prueba recibió 403 `access_denied` al pedir `drive.file`.
- **Corrección:** publicar la app (En producción) con página principal, Política de Privacidad y Condiciones públicas en el dominio autorizado.
- **Aplicar en:** antes de enseñar la app a gente nueva.

## [2026-10-20] — Features que tocan los mismos ficheros
- **Qué pasó:** la 22 cambiaba `router.tsx`, `LoginPage.tsx`, `Layout.tsx` e `index.css` mientras la 17 estaba sin commitear.
- **Corrección:** esperar a que la 17 estuviera en `develop` antes de copiar la 22.
- **Aplicar en:** encadenar features sin mezclar cambios en el mismo commit.

## [2026-10-20] — Texto legal
- **Qué pasó:** la política depende de decisiones que no están en el código (responsable, contacto, conservación, consentimiento de las familias).
- **Corrección:** preguntarlas en el análisis y dejarlas por escrito; si el colegio pasa a ser responsable, actualizar `PrivacyPage`.
- **Aplicar en:** cualquier cambio sobre datos personales o de menores.
