# Planificación: 22-paginas-legales

## 1. Enfoque
Dos páginas estáticas en el frontend, fuera de `RequireAuth`, con un diseño sencillo (cabecera con el escudo y enlace "Volver", texto legible en móvil). El texto vive en el propio componente (JSX), con la fecha de última actualización arriba. El login pasa a ser la página principal: descripción breve de la app y pie con los enlaces. No hay cambios en el backend.

## 2. Rutas
- `/privacidad` → `PrivacyPage`
- `/condiciones` → `TermsPage`
- Fuera de `RequireAuth`: se abren con o sin sesión. Vercel ya reescribe todas las rutas a `index.html`.

## 3. Contenido
**Política de Privacidad** (RGPD):
1. Responsable: Ignacio Segovia Zurita · segovia.ignacio1904@gmail.com.
2. Qué datos: de los usuarios, nombre, email e identificador de Google y su rol (no se guarda la foto ni la contraseña); eventos y grupos; nombres de niños y su asistencia; documentos de la biblioteca (copia, texto extraído, etiquetas y quién lo subió).
3. Para qué: organizar la catequesis (calendario, grupos, pase de lista, recursos). Sin publicidad, sin venta ni cesión de datos.
4. Base legal: interés legítimo en organizar la actividad y consentimiento al entrar con Google; nombres de menores con el consentimiento de las familias recogido por el colegio.
5. Menores: solo el nombre; no son públicos, solo los ven los responsables de su grupo y el admin; los niños no tienen cuenta.
6. Datos de Google: inicio de sesión (perfil y email) y `drive.file` (solo los ficheros que el usuario elige; la app no ve el resto de su Drive; el permiso se queda en el navegador). Cláusula de **Uso limitado** de la política de datos de usuario de los servicios de API de Google.
7. Proveedores: Vercel (web), Render (API, UE: Fráncfort), Neon (base de datos), Google (inicio de sesión y Drive).
8. Conservación: usuarios mientras tengan cuenta; niños y asistencia hasta el final del curso; documentos mientras sean útiles.
9. Derechos: acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo al email; reclamación ante la AEPD.
10. Almacenamiento local: solo la sesión y el grupo elegido (`localStorage`), sin cookies de seguimiento ni analítica.
11. Cambios en la política.

**Condiciones del Servicio:** qué es la app; quién la usa (catequistas y familias con cuenta de Google; roles los asigna el admin); uso correcto (no subir contenido ajeno sin permiso ni datos de menores fuera de lo previsto); documentos subidos (el que lo sube responde de tener permiso; se usan solo dentro de la app); cuenta (se puede desactivar por mal uso); servicio gratuito y sin garantías de disponibilidad; cambios; contacto.

## 4. Ficheros
- `frontend/src/components/LegalLayout.tsx` — cabecera, contenedor del texto y pie.
- `frontend/src/components/LegalLinks.tsx` — enlaces "Privacidad · Condiciones".
- `frontend/src/pages/PrivacyPage.tsx`, `frontend/src/pages/TermsPage.tsx`.
- `frontend/src/router.tsx` — dos rutas públicas.
- `frontend/src/pages/LoginPage.tsx` — descripción de la app y `LegalLinks`.
- `frontend/src/components/Layout.tsx` — `LegalLinks` en el menú o pie.
- `frontend/src/pages/LegalPages.test.tsx` — se ven sin sesión; el login enlaza ambas.
- `README.md` — sección "Publicar la app en Google".

## 5. Pasos en Google (README)
1. **Google Auth Platform → Marca**: página principal `https://app-tagaste.vercel.app`, Política `https://app-tagaste.vercel.app/privacidad`, Condiciones `https://app-tagaste.vercel.app/condiciones`; dominio autorizado `app-tagaste.vercel.app`; email de contacto.
2. **Público → Publicar app** (pasar a *En producción*).
3. Comprobar con una cuenta que no sea de prueba.

## 6. Commits previstos
1. `feat(legal): páginas de privacidad y condiciones`
2. `feat(legal): enlaces legales en el login y en la app`
3. `test(legal): páginas públicas sin sesión`
4. `docs(legal): README y documentación de la feature 22`
