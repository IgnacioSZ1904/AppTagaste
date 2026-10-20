# 0002. Login solo con Google y JWT propio

- **Estado:** Aceptado
- **Fecha:** 2026-10-14
- **Feature:** [05-auth-usuarios-roles](../features/05-auth-usuarios-roles/), [07-calendario-frontend](../features/07-calendario-frontend/)

## Contexto
Todos los usuarios (catequistas y familias) tienen cuenta de Google. No queremos guardar contraseñas ni gestionar recuperaciones.

## Decisión
- El frontend obtiene un **ID token de Google** con el botón de Google y lo envía a `POST /auth/google`.
- La API lo verifica con la librería de Google (firma, audiencia = nuestro client id, email verificado), da de alta al usuario si no existe y devuelve un **JWT propio** (HS256, 8 horas) con su id.
- El resto de rutas piden `Authorization: Bearer <jwt>`; el rol se lee de la base de datos en cada petición (un cambio de rol o una desactivación se aplica al momento).
- El JWT se guarda en `localStorage`; un 401 cierra la sesión en el frontend.

## Alternativas
- **Usuario y contraseña propios:** más código y más riesgo (hash, recuperación, fuerza bruta).
- **Usar el token de Google en cada petición:** caduca en 1 hora y obliga a verificarlo siempre contra Google.
- **Cookies de sesión httpOnly:** más seguras frente a XSS, pero complican el despliegue con dominios distintos (Vercel y Render).

## Consecuencias
- Sin contraseñas en la base de datos.
- El JWT no se puede revocar antes de que caduque, pero desactivar un usuario lo bloquea porque se comprueba en cada petición.
- `localStorage` es vulnerable a XSS: el frontend no pinta HTML externo (ver el fragmento del buscador en la 17).
