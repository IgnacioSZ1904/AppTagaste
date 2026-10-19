# Análisis: 21-grupos-frontend

## 1. Petición original
> "vamos con el siguiente feature" → feature 21 del backlog (P0): pantallas de grupos sobre la API de la feature 10.
>
> Resumen de Ignacio: "los usuarios pueden elegir grupo y ven el calendario para ese grupo con los nombres de los monitores y coordinadores, el coordinador y monitor solo ven sus grupos, me gusta añadir con una lista, el monitor debe tener un apartado en frontend con la lista de niños, metemos el boton que quedaba pendiente".
>
> Decisión: el calendario por grupo va **todo en esta feature** (backend y frontend).

## 2. Objetivo
1. Que el admin cree los grupos y asigne sus responsables desde la web.
2. Que cada responsable (monitor o coordinador) tenga su apartado "Mis grupos" con la lista de niños.
3. Que los eventos puedan ser de uno o varios grupos, y que cualquiera elija un grupo y vea su calendario con los nombres de sus responsables.
4. Botón "Suscribirse" al iCal (pendiente de la 09).

## 3. Estado actual del proyecto
- Backend (10, en `develop`):
  - `GET /groups`, `GET /groups/{id}`: cualquier usuario autenticado; devuelve `{id, name, members: [{id, full_name, role}], children_count}`.
  - `POST/PATCH/DELETE /groups`: solo admin; nombre único (409); borrar un grupo borra sus niños.
  - `POST /groups/{id}/members {user_id}`, `DELETE /groups/{id}/members/{user_id}`: solo admin; solo monitores o coordinadores (422); 409 si ya es responsable.
  - `GET/POST /groups/{id}/children`, `PATCH/DELETE /groups/{id}/children/{child_id}`: admin y responsables de ese grupo.
  - `GET /me/groups`: grupos de los que eres responsable.
- **Los eventos no tienen grupo** (la 10 lo dejó fuera). `GET /events?from=&to=&type=` y el iCal (`/calendar.ics`) devuelven todos.
- Frontend (20): permisos en `auth/roles.ts` y `RequireRole`; `GET /users` solo admin; `Modal`, `EventForm`, `.btn-*`, `.field`, `.event-chip`.

## 4. Alcance
### Backend
- Relación N:M evento ↔ grupo (tabla `event_groups`, migración `0006`). Un evento **sin grupos es general** y sale en el calendario de todos los grupos.
- `EventCreate`/`EventUpdate` aceptan `group_ids` (lista; vacía = general); 422 si algún grupo no existe.
- `EventRead` devuelve `groups: [{id, name}]`.
- `GET /events?group_id=N`: eventos de ese grupo más los generales.
- `GET /calendar.ics?group_id=N`: el mismo filtro en el feed público.
- Borrar un grupo no borra sus eventos (solo la relación).
- Tests y README.

### Frontend
- **Calendario**: selector de grupo ("Todos" o un grupo) para cualquier usuario; con un grupo elegido muestra solo sus eventos y los generales, y una línea con sus responsables ("Monitores: …, Coordinadores: …"). La elección se recuerda en el navegador.
- **Formulario de evento** (admin y coordinador): elegir los grupos del evento; sin ninguno = general. El detalle del evento muestra sus grupos.
- **Botón "Suscribirse"** en el calendario: copia la URL del iCal (del grupo elegido, o general) y ofrece abrirla con `webcal://`.
- **Grupos** (solo admin): todos los grupos en tarjetas (nombre, responsables, nº de niños); crear, renombrar y borrar (confirmación con el nº de niños); añadir y quitar responsables entre monitores y coordinadores activos.
- **Mis grupos** (coordinador y monitor): solo sus grupos, aviso si no tienen ninguno.
- **Página del grupo** `/grupos/:id` (admin y responsables): niños por orden alfabético; añadir pegando una lista (un nombre por línea), renombrar y borrar con confirmación; aviso breve de privacidad.
- Tests de permisos, selector de grupo, formulario con grupos, gestión del admin y de niños.

### Fuera de alcance
- Pase de lista (feature 12).
- Mover un niño de un grupo a otro (se borra y se añade).
- Que un monitor cree eventos de su grupo (siguen siendo admin y coordinador).

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| PR grande (backend + frontend) | Alta | Medio | Dos bloques de tareas separados; primero backend con sus tests |
| Eventos actuales sin grupo | Segura | Bajo | Quedan como generales: se siguen viendo en todos los calendarios |
| Borrar un grupo con sus niños por error | Media | Alto | Confirmación con el nombre del grupo y el número de niños |
| Ver nombres de menores sin permiso | Baja | Alto | La API lo impide (403); la web no pide niños si no eres responsable o admin |
| Migración en producción (Neon) | Media | Medio | `alembic upgrade head` en el despliegue, como en la 10 |

## 6. Preguntas abiertas
- [x] ¿Qué grupos ve un coordinador o monitor? → **Solo los suyos**, en "Mis grupos", con la lista de niños.
- [x] ¿Añadir varios niños pegando una lista? → **Sí**, un nombre por línea.
- [x] ¿Botón "Suscribirse"? → **Sí**, en esta feature.
- [x] ¿Calendario por grupo? → **Todo en el 21**: backend y frontend.
- [x] ¿Un evento puede ser de varios grupos, y sin grupo es general para todos? → **Sí** a las dos.
- [x] ¿El selector de grupo lo tienen todos los roles, no solo el usuario? → **Sí**; por defecto "Todos", y para monitores y coordinadores su primer grupo.
- [x] ¿El iCal por grupo también? → **Sí** (`?group_id=`), así cada familia se suscribe a su grupo.

## 7. Criterios de aceptación
- [x] Un evento se crea o edita con cero, uno o varios grupos; los eventos antiguos quedan como generales.
- [x] Con un grupo elegido, el calendario muestra sus eventos y los generales, y los nombres de sus responsables.
- [x] El botón "Suscribirse" da la URL del iCal (del grupo elegido o general) y el feed filtra por grupo.
- [x] El admin ve "Grupos" y crea, renombra y borra grupos, y añade o quita responsables; un nombre repetido muestra un error claro.
- [x] Coordinador y monitor ven "Mis grupos" (solo los suyos, aviso si no tienen); el rol usuario no ve este apartado y por URL ve "No tienes permiso".
- [x] Admin y responsables añaden niños pegando una lista, los renombran y borran; otro monitor no ve esos niños.
- [ ] Tests del backend y del frontend en verde; `ruff`, `npm run lint` y `npm run build` pasan en local y en GitHub Actions.
- [x] Usable en móvil (375 px) y escritorio.
