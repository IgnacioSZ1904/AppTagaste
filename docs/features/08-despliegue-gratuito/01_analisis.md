# Análisis: 08-despliegue-gratuito

## 1. Petición original
> "ya hemos completado la 20 vamos por aqui con la siguiente" → feature 08 del backlog: `despliegue-gratuito` (P0).

## 2. Objetivo
Publicar AppTagaste en internet gratis: API, base de datos y frontend accesibles desde una URL, con login de Google funcionando y un admin creado. Cierra el MVP.

## 3. Estado actual del proyecto
- Features 05–07, 19 y 20 mergeadas en `develop`. Ramas en GitHub: `master` y `develop`.
- `Dockerfile` pensado para desarrollo: instala dependencias de test y arranca con `--reload`.
- La API no tiene CORS: en local el frontend llama a `/api/v1` y Vite redirige a `localhost:8000`.
- El frontend lee `VITE_API_URL` y `VITE_GOOGLE_CLIENT_ID` al compilar.
- `SECRET_KEY` es obligatoria con `ENVIRONMENT=production` (la app no arranca sin ella).
- Lección de la 19: tras migrar en producción hay que ejecutar `create-admin` y comprobar `/auth/me`.

## 4. Alcance
### Dentro de alcance
- `Dockerfile` de producción (sin dependencias de test ni `--reload`, puerto que da la plataforma) y arranque que aplica las migraciones.
- Configuración del despliegue en archivos del repo (p. ej. `render.yaml`, `vercel.json`).
- Variables de entorno de producción documentadas.
- Google OAuth: añadir el dominio de producción como origen autorizado y publicar la app.
- Crear el primer admin en producción y comprobarlo.
- README: guía de despliegue paso a paso.

### Fuera de alcance
- Dominio propio, HTTPS propio (las plataformas dan subdominio con HTTPS).
- Copias de seguridad automáticas y monitorización (más adelante).
- CI/CD que despliegue desde GitHub Actions (las plataformas despliegan solas al hacer push).

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| La API gratuita de Render se duerme tras 15 min sin uso; la primera petición tarda ~1 min | Alta | Medio | Asumirlo en el MVP; avisar en la pantalla de login si tarda |
| La Postgres gratuita de Render caduca a los 30 días | Alta | Alto | Usar Neon (gratuita sin caducidad) |
| El plan gratuito de Render no tiene consola para ejecutar comandos | Alta | Bajo | `create-admin` desde tu PC apuntando a la BD de producción |
| Login de Google bloqueado en producción | Media | Alto | Origen de Vercel en el Client ID y app publicada |
| Cambian los límites gratuitos de las plataformas | Baja | Medio | Configuración en archivos del repo, fácil de mover |

## 6. Preguntas abiertas
- [x] ¿Dónde va cada pieza? → **API en Render** (Docker), **BD en Neon**, **frontend en Vercel**.
- [x] ¿Cómo habla el frontend con la API? → **Vercel redirige `/api/*` a Render** (como el proxy de Vite en local). Así no hace falta CORS y el frontend no cambia.
- [x] ¿Desde qué rama se despliega? → **`master`**: cuando algo esté listo, PR de `develop` a `master` y se despliega solo.
- [x] ¿Migraciones automáticas al arrancar en producción? → **sí** (`alembic upgrade head` antes de arrancar la API), porque Render gratis no deja ejecutar comandos a mano.
- [x] ¿Ejecutas tú los pasos en las webs (crear cuentas, conectar el repo, poner variables)? → **sí**; yo preparo los archivos y una guía paso a paso, y tú me pasas las URLs para comprobar.

## 7. Criterios de aceptación
- [x] La app abre en una URL pública de Vercel y muestra el login.
- [x] Login con Google funciona en producción; tu cuenta es admin (`/auth/me`).
- [x] Un admin crea un evento y se ve en el calendario.
- [x] `/api/v1/health` en producción devuelve `db: ok`.
- [x] Las migraciones se aplican solas al desplegar.
- [x] Ningún secreto en el repo; todos en las variables de entorno de las plataformas.
- [x] README con la guía de despliegue.
