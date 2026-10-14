# Planificación: 07-calendario-frontend

## 1. Enfoque técnico
Login con el botón oficial de Google (`@react-oauth/google`): Google devuelve un ID token, el frontend lo manda a `POST /auth/google` y guarda el JWT de la API en `localStorage`. Un `AuthProvider` expone el usuario (`/auth/me`), `login` y `logout`; `apiFetch` añade el `Bearer` y, ante un 401, cierra la sesión. Las rutas privadas pasan por un guard. El calendario usa FullCalendar (vista mes y lista) alimentado con `GET /events?from&to&type` según el rango visible. Los coordinadores crean, editan y borran eventos en un modal. Tema blanco y rojo definido una sola vez en Tailwind.

## 2. Decisiones de diseño
| Decisión | Alternativas | Justificación |
|----------|--------------|---------------|
| `AuthProvider` con contexto + TanStack Query para `/auth/me` | Librería de estado (Zustand) | Solo hay un dato global (usuario); el contexto basta |
| Token en `localStorage` con clave `apptagaste.token` | Cookie httpOnly | Decidido en el análisis; la API usa Bearer |
| 401 en cualquier petición → `logout()` y vuelta a `/login` | Refrescar token | La API no tiene refresh; el token dura 8 h |
| Guard `<RequireAuth>` en la ruta padre | Comprobar en cada página | Un solo punto; `/login` queda fuera |
| FullCalendar v7 (React) con vistas `dayGridMonth` y `listMonth` | Rejilla propia | Decidido en el análisis; locale `es`, semana empieza en lunes |
| Fechas como texto `AAAA-MM-DD HH:MM` → `AAAA-MM-DDTHH:MM` sin zona | Convertir con zona | La API ya da hora de España; FullCalendar las pinta tal cual (`timeZone: 'local'`) |
| Rango pedido a la API = rango visible del calendario (`datesSet`) | Pedir todos los eventos | Menos datos; `queryKey` por rango y tipo, con caché |
| Filtro por tipo con chips (uno o todos) | Desplegable | Más cómodo en móvil; la API filtra por un tipo |
| Modal de evento: detalle para todos, formulario para coordinador | Páginas separadas | Menos navegación; `<dialog>` nativo |
| Mutaciones con `useMutation` + invalidar `['events']` | Actualizar la caché a mano | Simple y correcto |
| Tema en `@theme` de Tailwind: `brand-500 #E62B18`, `brand-700 #A01913`, fondo blanco | Colores sueltos | Un solo sitio para cambiar la paleta |
| Colores por tipo: reunión rojo, convivencia ámbar, eucaristía granate, otro gris | Todos rojos | Distinguibles y a juego con el escudo |
| Escudo como PNG con fondo transparente en `public/` | El JPG original | Queda bien sobre cualquier fondo; también como favicon |

## 3. Cambios por módulo
### `frontend/`
- Dependencias: `@react-oauth/google`, FullCalendar (React + vistas mes y lista).
- `.env.example`: `VITE_GOOGLE_CLIENT_ID`.
- `public/escudo.png`, `public/favicon.png`; `index.html` con el favicon nuevo.
- `src/index.css`: `@theme` con la paleta y estilos de FullCalendar a juego.
- `src/api/client.ts`: añade el `Bearer` desde `localStorage` y llama a un callback `onUnauthorized` en 401; soporta `POST/PATCH/DELETE` (204 sin cuerpo).
- `src/api/auth.ts`: `loginWithGoogle(credential)`, `getMe()`; tipos `User`, `Role`.
- `src/api/events.ts`: tipos `Event`, `EventType`; `useEvents(range, type)`, `useCreateEvent`, `useUpdateEvent`, `useDeleteEvent`.
- `src/auth/AuthProvider.tsx` y `useAuth()`; `src/auth/RequireAuth.tsx`.
- `src/pages/LoginPage.tsx`: escudo, título y botón de Google; mensaje de error de la API (403 "no dada de alta").
- `src/pages/CalendarPage.tsx`: chips de tipo, FullCalendar (mes en escritorio, lista por defecto en móvil), botón "Nuevo evento" (coordinador).
- `src/components/EventModal.tsx` (detalle) y `src/components/EventForm.tsx` (crear/editar con validación de fin > inicio).
- `src/components/Layout.tsx`: cabecera blanca con escudo, navegación, nombre + rol y "Salir".
- `src/router.tsx`: `/login` pública; `/` (calendario) protegida; 404. La página de estado de la API pasa a `/estado`.
- Tests: login (éxito, 403), guard (sin token → login), 401 → logout, calendario (pinta eventos, filtra por tipo), formulario (validación, crear), monitor sin botones de edición.

### Backend
- Sin cambios de código. `GOOGLE_CLIENT_ID` en tu `.env`.

### Raíz
- `README.md`: `VITE_GOOGLE_CLIENT_ID` y cómo probar el login.

## 4. Modelo de datos / contratos
Sin cambios en la API. Usa:
- `POST /auth/google {credential}` → `{access_token, token_type}`; 401 token no válido; 403 no dado de alta.
- `GET /auth/me` → `{id, email, full_name, role, is_active, created_at}`.
- `GET /events?from=AAAA-MM-DD HH:MM&to=…&type=…` → lista de eventos; `POST/PATCH/DELETE /events[/id]` (coordinador).

## 5. Plan de pruebas
- Verificación en la nube: lint, tests y build.
- Manual (Ignacio):
  1. Crear el OAuth Client ID (README, "Autenticación con Google"), ponerlo en `.env` (backend) y `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`).
  2. `docker compose up -d --force-recreate api` y `npm run dev`.
  3. Login con tu cuenta (coordinador) → calendario con tu nombre y rol.
  4. Crear, editar y borrar un evento; cambiar de mes; filtrar por tipo; vista lista.
  5. Login con una cuenta no dada de alta → mensaje claro.
  6. Dar de alta un monitor y comprobar que no ve los botones de edición.
  7. Móvil (375 px) en DevTools.
  8. `npm run lint`, `npm test`, `npm run build` y PR con CI en verde.

## 6. Plan de despliegue / migración
- Rama `feature/07-calendario-frontend` desde `develop` (la creas tú).
- Sin migraciones. Rollback: revertir el commit.

## 7. Estimación
- Tareas: ~20
- Incertidumbre: FullCalendar v7 es reciente (cambió paquetes y estilos); se comprueba al instalar. Configurar el Client ID de Google por primera vez.
