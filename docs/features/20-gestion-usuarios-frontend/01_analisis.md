# Análisis: 20-gestion-usuarios-frontend

## 1. Petición original
> "vamos con el feature 20" → feature 20 del backlog (P0): pantalla del admin para gestionar usuarios.

## 2. Objetivo
Que el admin gestione desde la web quién es coordinador, monitor o usuario, active o desactive cuentas y dé de alta a alguien por email antes de que entre. De paso, adaptar el frontend a los 4 roles de la feature 19.

## 3. Estado actual del proyecto
- Backend (19): roles `admin`, `coordinador`, `monitor`, `usuario`. Cualquier cuenta de Google entra como `usuario` (alta automática); una cuenta desactivada recibe 403.
- API de usuarios, solo admin: `GET /users` (ordenados por nombre), `POST /users {email, full_name, role}` (409 si el email existe), `PATCH /users/{id} {full_name?, role?, is_active?}` (400 si el admin intenta cambiar su propio rol o desactivarse).
- Eventos: crear, editar y borrar para `admin` y `coordinador`.
- Frontend (07): el tipo `Role` solo tiene `coordinador | monitor`; los botones de edición solo salen al coordinador; la cabecera solo sabe nombrar esos dos roles. Un admin hoy no puede editar eventos desde la web.

## 4. Alcance
### Dentro de alcance
- Tipo `Role` con los 4 roles y etiquetas en la cabecera (Administrador, Coordinador, Monitor, Usuario).
- Botones de eventos ("Nuevo evento", Editar, Borrar) para admin y coordinador.
- Página `/usuarios`, solo admin (enlace en la navegación solo para él; otro rol que entre por URL ve "No tienes permiso").
- Lista de usuarios con nombre, email, rol y estado; búsqueda por nombre o email y filtro por rol.
- Cambiar el rol y activar/desactivar desde la lista; los controles de tu propia fila están bloqueados.
- Alta manual: email, nombre y rol (para dar un rol antes de que la persona entre por primera vez).
- Mensajes claros de los errores de la API (email repetido, etc.).
- Tests de permisos, lista, cambio de rol, alta y bloqueo de la propia fila.

### Fuera de alcance
- Borrar usuarios (se desactivan; la API no tiene borrado).
- Grupos y asignación de monitores a grupos (feature 10).
- Paginación (pocos usuarios por ahora).

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Cambiar un rol por error con un clic | Media | Medio | Confirmación al quitar o dar el rol admin y al desactivar |
| El admin se quita a sí mismo los permisos | Baja | Alto | La API lo impide (400) y la propia fila sale bloqueada |
| Tabla ilegible en móvil | Alta | Medio | Tabla en escritorio y tarjetas en móvil |

## 6. Preguntas abiertas
- [x] ¿Dónde se cambian rol y estado? → **En la lista**, guardando al momento; confirmación al dar/quitar admin y al desactivar.
- [x] ¿Alta manual por email? → **Sí**, en un modal "Añadir usuario".
- [x] ¿Búsqueda y filtro por rol? → **Sí**, en el navegador.
- [x] ¿Editar el nombre? → **No**; solo rol y estado.

## 7. Criterios de aceptación
- [x] El admin ve "Usuarios" en la navegación; el resto no, y por URL ve "No tienes permiso".
- [x] La lista muestra todos los usuarios con rol y estado; búsqueda y filtro por rol funcionan.
- [x] El admin cambia el rol y activa/desactiva a otros usuarios; su propia fila no se puede cambiar.
- [x] El admin da de alta a alguien por email con un rol; un email repetido muestra un error claro.
- [x] Admin y coordinador crean, editan y borran eventos; monitor y usuario no ven esos botones.
- [x] La cabecera muestra el rol correcto para los 4 roles.
- [x] Usable en móvil (375 px) y escritorio.
- [ ] `npm run lint`, `npm test` y `npm run build` pasan en local y en GitHub Actions.
