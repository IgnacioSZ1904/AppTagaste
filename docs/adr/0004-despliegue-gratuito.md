# 0004. Despliegue gratuito: Vercel, Render y Neon

- **Estado:** Aceptado
- **Fecha:** 2026-10-15
- **Feature:** [08-despliegue-gratuito](../features/08-despliegue-gratuito/)

## Contexto
La app tiene que estar en internet sin coste y con despliegue automático.

## Decisión
- **Frontend en Vercel** (`app-tagaste.vercel.app`): build de Vite y `vercel.json` que reescribe `/api/*` a Render (mismo origen para el navegador, sin CORS).
- **API en Render** (plan gratuito, Docker, Fráncfort): blueprint `render.yaml`; aplica las migraciones al arrancar.
- **Base de datos en Neon** (PostgreSQL gratuito).
- Se despliega al fusionar `develop` en `master`.

## Alternativas
- **Un solo proveedor (Render para todo, Railway, Fly.io):** límites gratuitos peores o con tarjeta obligatoria.
- **VPS propio:** más control, pero coste y mantenimiento.

## Consecuencias
- Render gratis se duerme tras 15 minutos sin uso: la primera visita tarda alrededor de un minuto (avisado en el README y en las Condiciones).
- Neon gratis tiene 0,5 GB: los ficheros de la biblioteca cuentan (ver [0006](0006-ficheros-en-la-base-de-datos.md)).
- Tres paneles distintos para variables de entorno y logs.
