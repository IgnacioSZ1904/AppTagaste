# Análisis: 22-paginas-legales

## 1. Petición original
> "para poder poner la web publica y no tener problemas como el de antes me falta este apartado, que seria lo siguiente que me gustaria hacer: Dominio de la app […] Página principal de la aplicación https://app-tagaste.vercel.app […] Vínculo a la Política de Privacidad […] Vínculo a las Condiciones del Servicio"

## 2. Objetivo
Publicar la app en Google (pasar de **Prueba** a **En producción**) para que cualquiera entre con su cuenta de Google sin estar en la lista de usuarios de prueba. Para eso la pantalla de consentimiento pide una página principal, una **Política de Privacidad** y unas **Condiciones del Servicio** públicas en el mismo dominio.

## 3. Estado actual del proyecto
- Web en `https://app-tagaste.vercel.app` (Vercel); API en Render (Fráncfort); base de datos en Neon.
- Sin sesión, cualquier ruta lleva a `/login`; no hay ninguna página pública.
- Datos que guarda la app: nombre, email e identificador de Google de cada usuario y su rol (no se guarda la foto); eventos; grupos con sus responsables; **nombres de niños (menores)** y su asistencia; documentos de la biblioteca (copia del fichero, texto extraído, etiquetas, quién lo subió).
- Google: login (`openid`, email, perfil) y `drive.file` (solo los ficheros que el usuario elige en el selector; la app no ve el resto de su Drive). El token de Drive se queda en el navegador.
- Pendiente en el BACKLOG: confirmar con el colegio el tratamiento de los nombres de los niños.

## 4. Alcance
### Dentro de alcance
- Página pública **`/privacidad`** (Política de Privacidad, RGPD): responsable, datos que se tratan y para qué, base legal, datos de menores, uso de los datos de Google (incluida la cláusula de "Uso limitado" que exige Google para `drive.file`), proveedores (Vercel, Render, Neon, Google), conservación y borrado, derechos y cómo ejercerlos, contacto, fecha de actualización.
- Página pública **`/condiciones`** (Condiciones del Servicio): qué es la app, quién puede usarla, uso correcto, contenido que se sube (documentos), cuentas y roles, sin garantías, cambios, contacto.
- Accesibles **sin iniciar sesión**, con el mismo estilo de la app; enlaces en el pie de la pantalla de login y en el pie de la app.
- Guía en el README para rellenar la pantalla de Google (Dominio de la app, dominios autorizados, publicar).
- Tests de que se ven sin sesión.

### Fuera de alcance
- Dominio propio (se sigue con `app-tagaste.vercel.app`).
- Banner de cookies: la app no usa cookies de seguimiento ni analítica (solo `localStorage` para la sesión y el grupo elegido), así que no hace falta.
- Revisión jurídica: el texto es una base razonable, pero conviene que lo lea el colegio o la parroquia.
- Verificación de marca de Google (logo en la pantalla de consentimiento): opcional, se puede hacer después.

## 5. Riesgos y dependencias
- **Datos de menores**: la política tiene que decir quién es el responsable (el colegio o la parroquia, no tú como persona) y que los nombres los pone el monitor con permiso de las familias. Sin eso, el texto queda cojo.
- Google pide que la página principal y las políticas estén en un dominio autorizado (`app-tagaste.vercel.app`) y que la política explique el uso de los datos de Google.
- Con solo `drive.file` y el perfil básico, Google normalmente no exige verificación para publicar.

## 6. Preguntas abiertas

- [x] 1. Responsable: **Ignacio Segovia Zurita** (de momento).
- [x] 2. Contacto: **segovia.ignacio1904@gmail.com**.
- [x] 3. Conservación: usuarios mientras tengan cuenta; niños y asistencia se borran al acabar el curso; los documentos se conservan.
- [x] 4. Sí: "con el consentimiento de las familias recogido por el colegio". Además los nombres no son públicos: solo los ven los responsables de su grupo y el admin.
- [x] 5. Página principal = login con una breve descripción de la app y los enlaces legales.

## 7. Criterios de aceptación
- [x] `/privacidad` y `/condiciones` se abren sin iniciar sesión, en móvil y escritorio.
- [x] La política cubre responsable, datos, finalidad, base legal, menores, datos de Google (Uso limitado), proveedores, conservación, derechos y contacto.
- [x] La pantalla de login describe la app y enlaza ambas páginas; la app enlaza ambas en el pie.
- [x] README con los pasos de Google: Dominio de la app, dominio autorizado y publicar.
- [x] `npm run lint`, `npm test` y `npm run build` pasan.
