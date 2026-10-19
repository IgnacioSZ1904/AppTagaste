# Planificación: 21-grupos-frontend

## 1. Enfoque técnico
Primero el backend: relación N:M evento ↔ grupo, `group_ids` al crear y editar, `groups` en la respuesta y filtro `group_id` (eventos del grupo + generales) en `/events` y en el iCal, con sus tests. Después el frontend: grupos en el formulario de eventos, selector de grupo y botón "Suscribirse" en el calendario, y las páginas de grupos (admin) y "Mis grupos" (responsables) con la lista de niños.

## 2. Decisiones de diseño
| Decisión | Alternativas | Justificación |
|----------|--------------|---------------|
| Tabla `event_groups (event_id, group_id)` con `ON DELETE CASCADE` en las dos claves | Columna `group_id` en `events` | Un evento puede ser de varios grupos (convivencias conjuntas) |
| Evento sin grupos = general | Grupo "Todos" ficticio | Los eventos actuales siguen igual sin migrar datos |
| Filtro `group_id`: `NOT groups.any() OR groups.any(id = N)` en un helper compartido por eventos e iCal | Dos consultas distintas | Misma regla en la web y en el feed |
| `group_id` inexistente → 404 en `/events` y en el iCal; `group_ids` con un grupo inexistente → 422 | Ignorarlo | Un enlace de suscripción roto debe fallar a la vista |
| `EventRead.groups: [{id, name}]` con `lazy="selectin"` | Solo ids | El calendario pinta los nombres sin otra petición |
| iCal de un grupo con nombre `AppTagaste · <grupo>` | Mismo nombre | Se distingue en el móvil si alguien se suscribe a dos |
| Selector de grupo en el calendario recordado en `localStorage` (`apptagaste.group`); por defecto "Todos", o el primer grupo propio para monitor y coordinador | En la URL | Cada persona ve siempre "su" grupo al entrar |
| Línea de responsables bajo el selector ("Monitores: …, Coordinadores: …") | Página aparte | Es lo que pidió Ignacio: el calendario con sus nombres |
| "Suscribirse" abre un modal con la URL, "Copiar enlace" y "Abrir en el calendario" (`webcal://`) | Solo el enlace | En Android/Google hay que pegar la URL; en iPhone basta `webcal://` |
| Grupos del evento como chips seleccionables en `EventForm` | `<select multiple>` | Más claro y usable en móvil |
| `canSeeGroups` (admin, coordinador, monitor) en `roles.ts`; enlace "Grupos" (admin) o "Mis grupos" (resto) | Dos rutas | Una ruta `/grupos`; la página decide qué lista pide (`/groups` o `/me/groups`) |
| Responsables: `<select>` con monitores y coordinadores activos (`GET /users`) y botón "×" para quitar | Modal | Solo el admin; cambios al momento |
| Añadir niños: `<textarea>` (un nombre por línea, sin vacíos ni repetidos) y un `POST` por nombre en secuencia | Endpoint de alta masiva | Sin cambios de API; con 20-30 nombres es rápido; si uno falla se avisa de cuáles faltan |
| Renombrar niño en línea (botón "Editar" → campo + "Guardar"); borrar con `window.confirm` | Modal | Mismo patrón ligero que usuarios |
| Borrar grupo: `window.confirm` con nombre y nº de niños | Escribir el nombre | Suficiente para un admin; la API lo permite solo a él |

## 3. Cambios por módulo
### `backend/`
- `app/models/event.py`: tabla `event_groups`; `Event.groups` (orden por nombre, `selectin`).
- `alembic/versions/0006_eventos_grupos.py`: crea `event_groups` con índice en `group_id`.
- `app/schemas/event.py`: `group_ids` en `EventCreate` (por defecto `[]`) y `EventUpdate` (opcional, no nulo); `EventGroupRead {id, name}`; `groups` en `EventRead`.
- `app/services/events.py`: `UnknownGroupError`, `resolve_groups()`, `in_group(group_id)`; `list_events(..., group_id)`; crear y editar asignan grupos.
- `app/api/v1/endpoints/events.py`: parámetro `group_id`, 404 y 422.
- `app/services/calendar.py` y `endpoints/calendar.py`: `?group_id=` y nombre del calendario.
- `tests/test_events.py`, `tests/test_calendar.py`: grupos al crear/editar, 422, filtro, generales, borrar grupo conserva el evento, iCal filtrado y 404.

### `frontend/`
- `src/api/events.ts`: `groups` en `CalendarEvent`, `group_ids` en `EventInput`, `group_id` en `useEvents` y `useUpcomingEvents`.
- `src/api/groups.ts` (nuevo): tipos y hooks de grupos, responsables y niños (`useAddChildren` en secuencia).
- `src/auth/roles.ts`: `canSeeGroups`.
- `src/lib/selectedGroup.ts` (nuevo): leer y guardar el grupo elegido.
- `src/components/GroupPicker.tsx` (nuevo): selector + línea de responsables.
- `src/components/SubscribeModal.tsx` (nuevo): URL del iCal, copiar y abrir.
- `src/pages/CalendarPage.tsx`, `src/components/UpcomingList.tsx`: filtrar por grupo; botón "Suscribirse".
- `src/components/EventForm.tsx`, `EventModal.tsx`: chips de grupos; detalle con grupos o "General".
- `src/pages/GroupsPage.tsx` (nuevo): tarjetas; admin con "Nuevo grupo".
- `src/components/GroupForm.tsx` (nuevo): modal crear/renombrar.
- `src/pages/GroupPage.tsx` (nuevo): cabecera (renombrar/borrar para admin), responsables, niños.
- `src/components/MembersEditor.tsx`, `ChildrenList.tsx`, `AddChildrenForm.tsx` (nuevos).
- `src/components/Layout.tsx`: enlace "Grupos"/"Mis grupos".
- `src/router.tsx`: `grupos` y `grupos/:id` bajo `RequireRole allow={canSeeGroups}`.
- Tests: `GroupsPage.test.tsx`, `GroupPage.test.tsx`, casos nuevos en `CalendarPage.test.tsx` y `EventForm.test.tsx`.

### Documentación
- `README.md`: grupos en eventos, `?group_id=` en eventos e iCal, uso de "Grupos" y "Suscribirse".

## 4. Plan de pruebas
- Backend: `docker compose exec api alembic upgrade head`, `pytest -v`, `ruff check .`.
- Frontend: `npm run lint`, `npm test`, `npm run build`; capturas en escritorio y 375 px.
- Manual: crear grupos y responsables, evento de un grupo y general, cambiar de grupo en el calendario, suscribirse, "Mis grupos" con un monitor y pegar una lista de niños.

## 5. Despliegue
Al pasar a `master`, la migración `0006` se aplica como la `0005` (`alembic upgrade head` en Render).

## 6. Rama
`feature/21-grupos-frontend` (la crea Ignacio desde `develop`).
