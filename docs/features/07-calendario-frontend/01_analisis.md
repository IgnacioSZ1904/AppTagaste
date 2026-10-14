# Análisis: 07-calendario-frontend

## 1. Petición original
> "vamos con el feature calendario-frontend" → feature 07 del backlog (P0).

## 2. Objetivo
Que coordinadores y monitores entren en la web con su cuenta de Google y vean los eventos en un calendario mensual y en una lista, filtrando por tipo. Es la primera pantalla útil del MVP.

## 3. Estado actual del proyecto
- Frontend base (04): Vite + React + TS, Tailwind, React Router, TanStack Query, `apiFetch` sin autenticación, proxy `/api` → `:8000`.
- Auth (05): `POST /auth/google` recibe el ID token de Google (`credential`) y devuelve un JWT propio de 8 h; `GET /auth/me` devuelve el usuario (rol `coordinador` o `monitor`). Solo entran emails dados de alta (403 si no).
- Eventos (06): `GET /events?from=&to=&type=` (autenticados), `POST/PATCH/DELETE` solo coordinador. Fechas como texto `AAAA-MM-DD HH:MM` en hora de España. Tipos: `reunion`, `convivencia`, `eucaristia`, `otro`.
- `GOOGLE_CLIENT_ID` sin crear todavía (se aplazó de la 05 a esta feature).

## 4. Alcance
### Dentro de alcance
- OAuth Client ID de Google (paso manual en Google Cloud Console) en `.env` del backend y `VITE_GOOGLE_CLIENT_ID` en el frontend.
- Página de login con el botón "Iniciar sesión con Google" y mensajes claros (cuenta no dada de alta, error).
- Sesión: guardar el JWT, enviarlo en `Authorization: Bearer`, cargar el usuario con `/auth/me`, cerrar sesión, y volver al login si la API responde 401 (token caducado).
- Rutas protegidas: sin sesión → login.
- Calendario: vista mensual y vista lista, navegación entre meses, filtro por tipo con colores por tipo, detalle de un evento al pulsarlo.
- Cabecera con nombre del usuario, rol y botón de salir.
- Tests de login, rutas protegidas, calendario y filtros.

### Fuera de alcance
- Grupos y filtro por grupo (feature 10).
- Inscripciones (11) y exportación iCal (09).
- Despliegue y CORS de producción (08).
- Gestión de usuarios desde la web (se sigue usando `/docs` o el CLI).

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Configurar mal el Client ID (origen no autorizado) | Media | Alto | Guía paso a paso; origen `http://localhost:5173` |
| Desfase de zona horaria al pintar fechas | Media | Medio | La API ya da hora de España como texto; se muestra tal cual, sin convertir |
| Probar el login sin Google en tests | Alta | Bajo | Simular el botón de Google y la API con `fetch` falso |
| JWT en `localStorage` expuesto a XSS | Baja | Medio | React escapa el HTML; token de 8 h; revisar en la 08 |

## 6. Preguntas abiertas
- [x] ¿Calendario? → **FullCalendar**.
- [x] ¿Botón de Google? → **`@react-oauth/google`**.
- [x] ¿Token? → **`localStorage`**.
- [x] ¿Crear, editar y borrar eventos? → **Sí**, para coordinadores, en un modal.
- [x] Estilo visual (petición de Ignacio) → **blanco y rojo**, a juego con el escudo del colegio (rojo `#E62B18`, rojo oscuro `#A01913`), con el escudo en la cabecera, el login y el favicon.

## 7. Criterios de aceptación
- [x] Un usuario dado de alta entra con Google y ve su nombre y rol en la cabecera; uno no dado de alta ve "Tu cuenta no está dada de alta".
- [x] Sin sesión, cualquier ruta lleva al login; "Salir" borra la sesión.
- [x] Con el token caducado, la siguiente petición lleva al login.
- [x] El calendario muestra los eventos del mes en vista mensual (a pantalla completa) y los próximos 15 en la vista "Próximos", con navegación entre meses y filtro por tipo.
- [x] Usable en móvil (375 px) y escritorio, con el tema blanco y rojo y el escudo.
- [x] El coordinador crea, edita y borra eventos; el monitor no ve esos botones.
- [x] `npm run lint`, `npm test` y `npm run build` pasan en local (GitHub Actions: se comprueba en la PR).
