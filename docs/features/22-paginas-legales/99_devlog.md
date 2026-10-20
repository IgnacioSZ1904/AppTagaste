# Devlog: 22-paginas-legales

---

## [2026-10-20] — Inicio del evolutivo
- Al probar la 17, Google dio 403 `access_denied`: la app está en modo Prueba. Para publicarla, la pantalla de consentimiento pide página principal, Política de Privacidad y Condiciones del Servicio públicas
- Análisis redactado

## [2026-10-20] — Análisis aprobado
- Responsable: Ignacio Segovia Zurita (de momento); contacto: su email
- Conservación: usuarios mientras tengan cuenta; niños y asistencia hasta el final del curso; documentos se conservan
- Nombres de niños con consentimiento de las familias recogido por el colegio; no son públicos
- Página principal = login con descripción y enlaces legales
- Planificación redactada

## [2026-10-20] — Planificación aprobada
- Tareas pendientes redactadas (12 tareas en 5 bloques)

## [2026-10-20] — Ejecución de tareas
- Tareas aprobadas; la 17 se mergeó antes para no mezclar cambios en `router.tsx`, `LoginPage.tsx`, `Layout.tsx` e `index.css`
- `LegalLayout`, `LegalLinks`, `PrivacyPage` y `TermsPage`; rutas públicas fuera de `RequireAuth`; login con descripción; pie con los enlaces en la app
- README: "Publicar la app en Google"; 73 tests, lint y build en verde

## [2026-10-20] — Pruebas manuales y cierre
- Pruebas manuales OK (Ignacio); criterios, tareas y BACKLOG cerrados
- Queda T4.3: tras desplegar en Vercel, rellenar Marca y publicar la app en Google
