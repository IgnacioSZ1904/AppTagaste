# Lecciones aprendidas: 08-despliegue-gratuito

## [2026-10-15] — Cada dominio nuevo hay que registrarlo en Google
- **Qué pasó:** en Vercel el login con Google daba `Error 400: origin_mismatch`.
- **Corrección:** añadir `https://app-tagaste.vercel.app` en "Orígenes autorizados de JavaScript" del cliente OAuth (sin barra final) y esperar unos minutos.
- **Aplicar en:** cualquier dominio nuevo (dominio propio, otra URL de Vercel).

## [2026-10-15] — Para una API en Python, Neon solo necesita la URL
- **Qué pasó:** la guía de Neon proponía `neon init`/`neon deploy`, que añaden `neon.ts` y `package.json` pensados para apps Node.
- **Corrección:** copiar la URL directa (sin pooling) de la consola y ponerla en `DATABASE_URL` de Render; `config.py` ya la adapta a psycopg.
- **Aplicar en:** cambios de base de datos o nuevos entornos (ramas de Neon para pruebas).

## [2026-10-15] — Probar el arranque de producción antes de desplegar
- **Qué pasó:** con `SECRET_KEY=` vacía la app arrancaba también en producción.
- **Corrección:** validación en `config.py` y simular el arranque `prod` (`ENVIRONMENT=production`, BD vacía) antes de subir.
- **Aplicar en:** cualquier variable de entorno nueva que sea obligatoria en producción.

## [2026-10-15] — El plan gratuito de Render se duerme
- **Qué pasó:** tras 15 minutos sin uso, la primera petición tarda ~1 minuto en responder.
- **Corrección:** es lo esperado en el plan gratuito; pasar a pago cuando haya usuarios reales.
- **Aplicar en:** al enseñar la app, abrirla un minuto antes.
