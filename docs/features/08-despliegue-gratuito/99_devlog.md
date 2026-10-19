# Devlog: 08-despliegue-gratuito

## 2026-10-15
- Análisis validado (Render + Neon + Vercel, rewrite de `/api/*`, rama `master`, migraciones al arrancar, Ignacio hace los pasos en las webs). Planificación aprobada sin cambios.
- Implementado: `Dockerfile` multi-etapa (`dev`/`prod`), `target: dev` en compose, `render.yaml`, `frontend/vercel.json`, normalización de `DATABASE_URL` (formato de Neon) y guía de despliegue en el README.
- Encontrado al revisar: con `SECRET_KEY=` vacía (como en `.env.example`) la app aceptaba una clave vacía, también en producción. Ahora en producción da error y en desarrollo usa la clave de desarrollo.
- Verificado en la nube: arranque de `prod` simulado (`ENVIRONMENT=production`, URL estilo Neon) contra una BD vacía → migra 0001→0004, `/health` = ok, `/auth/me` sin token = 401, `create-admin` OK, `dev-token` bloqueado. 64 tests en verde, ruff OK, prettier OK en `vercel.json`. Sin Docker en la nube: la imagen se construirá por primera vez en tu PC y en Render.
- Pruebas en local y PR a `develop` y a `master` hechas por Ignacio.
- Despliegue: Neon (URL directa, sin pooling), Render con el Blueprint y Vercel. Publicada en https://app-tagaste.vercel.app/.
- Problemas en el despliegue: la CLI de Neon (`neon init`/`deploy`) está pensada para apps Node y no hace falta, basta con la URL; Render pedía acceso al repo desde la app de GitHub; el login daba `origin_mismatch` hasta añadir el origen de Vercel en Google Cloud.
