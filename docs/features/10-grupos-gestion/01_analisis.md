# Análisis: 10-grupos-gestion

## 1. Petición original
> "vamos con el siguiente feature" → feature 10 del backlog: `grupos-gestion` (P0), "Modelo Grupo con sus monitores y su lista de niños (solo nombre, sin cuenta). Los monitores gestionan los niños de su grupo; el admin crea grupos y asigna monitores".

## 2. Objetivo
Organizar la catequesis en grupos: cada grupo tiene sus monitores y su lista de niños, para poder pasar lista en la 12 y filtrar el calendario por grupo más adelante.

## 3. Estado actual del proyecto
- Roles (19): admin, coordinador, monitor, usuario. Dependencias `Admin` y `EventEditor` en `deps.py`; tests de permisos como matriz (`test_roles.py`).
- Eventos (06) sin relación con grupos. Feed iCal (09) con todos los eventos.
- Migraciones hasta `0004`. Producción en Render + Neon, migra sola al desplegar.
- Privacidad (BACKLOG, transversal): los nombres de los niños son datos de menores; mínimos, visibles solo para sus monitores y el admin, borrado al acabar el curso.

## 4. Alcance
### Dentro de alcance
- Tablas `groups`, `group_members` (monitores y coordinadores de cada grupo) y `children` (niños de un grupo, sin cuenta). Migración `0005`.
- API de grupos: el admin los crea, edita, borra y asigna monitores.
- API de niños: los monitores y coordinadores del grupo y el admin los añaden, editan y borran.
- `GET /me/groups`: los grupos de la persona que ha iniciado sesión.
- Tests de permisos por rol y README.

### Fuera de alcance
- Pantallas (es frontend: propongo añadir al BACKLOG una feature `grupos-frontend` para el otro hilo).
- Relacionar eventos con grupos y feed iCal por grupo (cuando haga falta, otra feature).
- Pase de lista (12).

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Datos de menores visibles para quien no debe | Media | Alto | Solo el admin y los responsables del grupo ven a sus niños; tests por rol |
| Borrar un grupo borra a sus niños (y en la 12, su asistencia) | Media | Medio | Borrado explícito del admin; el frontend pedirá confirmación |
| Un monitor cambia de grupo a mitad de curso | Baja | Bajo | El admin quita y añade monitores cuando quiera |

## 6. Preguntas abiertas
- [x] ¿Qué datos tiene un grupo? → **solo el nombre** (único, p. ej. "1º Confirmación A").
- [x] ¿Un monitor puede estar en varios grupos? → **cada grupo tiene varios monitores**. El modelo (tabla intermedia) permite también que una persona esté en varios grupos.
- [x] ¿Qué datos de cada niño? → **solo nombre y apellidos** en un campo. Nada de fecha de nacimiento, teléfono ni familia.
- [x] ¿Quién ve los grupos? → todos los usuarios con cuenta ven la lista de grupos y sus monitores; los **niños** solo los ven el admin y los monitores de ese grupo. Un coordinador que no es del grupo no ve sus niños.
- [x] ¿Quién gestiona los niños? → **los monitores y coordinadores del grupo**, y el admin. Por eso el admin puede asignar a un grupo usuarios con rol monitor o coordinador (sus "responsables").
- [x] Al borrar un grupo, ¿se borran sus niños? → **sí** (borrado físico, como los eventos). Sirve también para el borrado de fin de curso.
- [x] ¿Añado `grupos-frontend` al BACKLOG para el hilo de frontend? → **sí**, como feature 21.

## 7. Criterios de aceptación
- [x] El admin crea, edita y borra grupos y les asigna o quita responsables; el resto recibe 403.
- [x] Solo usuarios con rol monitor o coordinador pueden asignarse a un grupo (si no, 422).
- [x] Los responsables de un grupo ven y gestionan sus niños; con otro grupo reciben 403.
- [x] Usuarios y responsables de otros grupos no ven niños (403).
- [x] `GET /me/groups` devuelve los grupos de quien ha iniciado sesión.
- [x] Borrar un grupo borra sus niños.
- [x] Migración `0005` aplica y revierte sin errores. Tests y ruff en verde en la CI.
