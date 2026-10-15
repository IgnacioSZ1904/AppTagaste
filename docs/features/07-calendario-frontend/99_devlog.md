# Devlog: 07-calendario-frontend

---

## [2026-10-14 10:46] — Inicio del evolutivo
- Features 05 y 06 mergeadas en `develop` (PR #5 y #6)
- Análisis redactado

## [2026-10-14 10:50] — Análisis aprobado
- Decisiones: FullCalendar, `@react-oauth/google`, token en `localStorage`, CRUD de eventos para coordinadores en un modal
- Petición de Ignacio: tema blanco y rojo a juego con el escudo del colegio (rojo `#E62B18`, rojo oscuro `#A01913`)
- Planificación redactada

## [2026-10-14 10:52] — Planificación aprobada
- OAuth Client ID de Google creado por Ignacio
- Tareas pendientes redactadas (24 tareas en 4 bloques)

## [2026-10-14 11:05] — Ejecución de tareas (ficheros)
- Tareas aprobadas; hechas T1.4–T1.5, T2.1–T2.10 y T4.1
- Versiones: `@fullcalendar/react` 7.1 (v7 lo agrupa todo en un paquete: vistas en `@fullcalendar/react/daygrid` y `/list`, temas como plugins; necesita `temporal-polyfill`), `@react-oauth/google` 0.13
- Tema: paleta `brand` en `@theme` de Tailwind y variables `--fc-classic-*` de FullCalendar apuntando a ella; escudo recortado con fondo transparente (`escudo.png`, `favicon.png`)
- La página de estado de la API pasa a `/estado`; `/` es el calendario. Rutas privadas bajo `RequireAuth`
- `apiFetch`: añade el Bearer, envía JSON con `json`, acepta 204, traduce errores de validación de FastAPI y, con un 401 teniendo sesión, avisa al `AuthProvider` para cerrarla
- El calendario pide `GET /events?from&to` con el rango visible (`datesSet`) y el tipo elegido; las fechas se pasan como `AAAA-MM-DDTHH:MM` sin zona para que FullCalendar no las convierta
- FullCalendar se carga con `lazy` en la ruta: el bundle inicial bajó de >500 kB a 353 kB
- Verificado en la nube: lint limpio, 16 tests en verde, build OK; capturas con datos simulados en escritorio, móvil (375 px), modal y login

## [2026-10-14 11:15] — Ajuste: calendario a pantalla completa
- Petición de Ignacio: el mes se ve entero en pantalla, sin scroll de página
- `Layout` ocupa `h-dvh` y el contenido es una columna flexible; FullCalendar con `height="100%"` y `dayMaxEvents` (los días con muchos eventos muestran "+N más")
- Filtros y "Nuevo evento" en una sola fila; título "Calendario" solo para lectores de pantalla (el mes ya hace de título)
- Comprobado sin scroll de página a 1280×720, 1366×768, 1920×1080 y 375×667 (en móvil la vista Agenda hace scroll dentro del calendario)

## [2026-10-14 11:25] — Ajuste: vista "Próximos" en lugar de la agenda de FullCalendar
- Petición de Ignacio: en la agenda, cada evento en una sola fila (la convivencia de varios días salía partida por días) y los próximos eventos, no solo los del mes
- Lista propia `UpcomingList`: `GET /events?from=<ahora>` (sin `to`) y se muestran los 15 primeros; rango "14/10 10:00 – 15/10 18:00" si dura varios días
- Selector "Mes | Próximos" junto a los filtros; en móvil arranca en "Próximos". Se quita el plugin `list` de FullCalendar
- La API no tiene límite de resultados: se recorta en el frontend. Si crecen mucho los eventos, añadir `limit` al endpoint
- Incidencia: la primera copia de `Layout.tsx` y `CalendarPage.tsx` al PC llegó con la versión anterior (desfase de sincronización); se volvió a copiar y se comprobaron los tamaños de todo `frontend/`
- 17 tests en verde, lint y build OK

## [2026-10-14 11:27] — Cambio de backlog (Ignacio)
- Se descarta el acceso de niños (Fase 4) y la 11 `inscripciones`: los niños no tienen cuenta
- Nuevos roles: admin (todo + gestión de usuarios), coordinador (eventos), monitor, usuario (solo calendario, alta automática con Google)
- Nuevas features 19 `roles-admin-usuario` y 20 `gestion-usuarios-frontend`, antes del despliegue (08)
- 10 y 12 redefinidas: los monitores apuntan los nombres de los niños de su grupo y pasan lista en cada evento

## [2026-10-14 11:29] — Pruebas manuales completadas (Ignacio)
- Login con Google real, calendario, CRUD de eventos, filtros, vista Próximos y móvil OK en local
- `npm run lint`, `npm test` y `npm run build` OK

## [2026-10-14 11:31] — Cierre del evolutivo
- Tareas, criterios, lecciones y BACKLOG actualizados antes del commit
- Pendiente: PR a `develop` con CI en verde y merge
- Resumen: coordinadores y monitores entran con Google y consultan el calendario; los coordinadores gestionan eventos desde la web. Siguiente: 19 `roles-admin-usuario`
