# Brief del proyecto: plataforma de reuniones y recursos

Documento de contexto para trabajar este proyecto de forma independiente. Fecha: 13 de octubre de 2026.

## Instrucciones para Claude

Usa este documento como contexto base. Responde de forma concisa y en español. Cuando haya que programar, guía paso a paso y con enfoque práctico. No inventes datos del proyecto: si falta algo, pregúntalo. No almacenes ni repitas credenciales ni claves.

## 1. Resumen

Aplicación web para una organización de un colegio (catequesis y eventos) con tres módulos: calendario de eventos y reuniones, biblioteca de recursos (ideas y documentos de reuniones y convivencias de otros años, hoy en Google Drive) filtrable por temática, y sistema de inscripción y asistencia a reuniones.

## 2. Objetivos

- **Personal:** proyecto de portafolio completo y profesional, hecho desde cero, que sirva para aprender backend, datos, DevOps y calidad, y que se pueda enseñar en entrevistas.
- **De producto:** resolver un problema real, con usuarios reales, ordenando el calendario y reutilizando el material acumulado durante años.

## 3. Contexto del desarrollador

- Ignacio Segovia Zurita, Málaga. Recién graduado en Ingeniería del Software (UMA, 2026).
- Prácticas en NTT DATA Europe & Latam desde mayo de 2026. Stack: Python, LangChain, LangGraph.
- Proyecto previo: SGIDA (TFG), sistema multiagente con FastAPI, React, DuckDB y scikit-learn.
- Busca un puesto junior de software, sin limitarse a IA. Prefiere stack Python + FastAPI + PostgreSQL + React, abierto a Spring Boot.
- GitHub: IgnacioSZ1904. CV y LinkedIn ya actualizados.

## 4. Producto

### Módulo 1: calendario

Eventos y reuniones con fecha, tipo y grupo. Vista mensual y de lista, filtros y exportación iCal para suscribirse desde el móvil.

### Módulo 2: biblioteca de recursos

Sincronización de solo lectura con Google Drive, indexación del texto de los documentos, etiquetas por temática (p. ej. amistad, perdón) y buscador con filtros y vista previa. Opcional en una fase posterior: sugerencia automática de etiquetas con un LLM.

### Módulo 3: inscripciones y asistencia

Reuniones con sistema de inscripción de plazas ilimitadas, para que los monitores sepan cuánta gente va y quede registro de asistencia por grupos. Se distingue entre **inscrito** y **asistió** (confirmado por el monitor al pasar lista).

## 5. Roles y permisos

| Rol | Puede |
| --- | --- |
| Coordinador | Crear y editar eventos y reuniones, gestionar grupos y usuarios, ver estadísticas |
| Monitor | Subir y etiquetar documentos, buscar en la biblioteca, preparar reuniones, ver inscritos y pasar lista |
| Niño | Ver el calendario de su grupo y apuntarse o desapuntarse |

## 6. Modelo de datos inicial

Usuario, Grupo, Evento/Reunión, Inscripción (usuario + reunión + estado), Asistencia, Documento y Etiqueta (relación muchos a muchos con documentos).

## 7. Arquitectura y stack

- **Backend:** FastAPI, PostgreSQL (búsqueda de texto completo con tsvector), migraciones con Alembic.
- **Drive:** API de Google Drive con cuenta de servicio y job de sincronización periódica.
- **Frontend:** React, responsive (uso intensivo desde el móvil).
- **Calidad y operaciones:** pytest, Docker y docker-compose, GitHub Actions (tests y linter), despliegue en la nube (Render, Fly.io o Railway), documentación OpenAPI, ADRs, issues y tablero en GitHub, logging y gestión de errores.

## 8. Privacidad y datos de menores

- Los tutores de los alumnos han firmado una autorización con el colegio para el uso de los datos. Aun así, el desarrollo cuidará la privacidad desde el diseño.
- Saber que un menor asiste a catequesis revela una creencia religiosa, un dato de categoría especial en el RGPD. Requiere protección reforzada.
- Minimización: nombre o alias y grupo, sin email ni datos innecesarios. Los niños no usan cuenta de Google.
- Acceso de los niños mediante cuentas creadas por coordinadores, con enlace o código de invitación y permisos mínimos.
- Acceso a Drive de solo lectura y solo sobre las carpetas necesarias.
- Definir quién ve qué, plazo de conservación y procedimiento de borrado.
- **Pendiente:** confirmar con el colegio y la organización que la autorización firmada cubre esta aplicación (finalidad, alcance y conservación) y consultar con alguien que conozca el RGPD. El responsable del tratamiento es la organización, no el desarrollador.

## 9. Fases

1. **MVP (semana 2 del plan):** login para coordinadores y monitores, eventos y calendario, Docker, CI y despliegue.
2. **Fase 2:** grupos, inscripciones y pase de lista.
3. **Fase 3:** biblioteca de recursos desde Drive, con buscador y etiquetas.
4. **Fase 4:** acceso de los niños e informes de asistencia, una vez resuelto el tema legal.

## 10. Decisiones tomadas

- Proyecto desde cero (no se recupera ReViews por ahora).
- Tres roles: coordinador, monitor y niño.
- Inscripción con plazas ilimitadas y registro de asistencia por grupos.
- Stack asumido: FastAPI + PostgreSQL + React.

## 11. Pendiente

- Nombre del proyecto.
- Confirmar el stack definitivo (FastAPI o Spring Boot).
- Plan detallado de la semana 2, día a día.
- Resolver la parte legal antes de dar acceso a menores.
- Ideas adicionales del desarrollador para ampliar el proyecto.

## 12. Contexto del plan de formación (mes 1)

- **Semana 1 (completada):** GitHub, CV (ES/EN) y LinkedIn.
- **Semana 2:** este proyecto (MVP, con tests, Docker, CI y demo).
- **Semana 3:** certificación cloud (AZ-900 o AWS Cloud Practitioner) y avance del proyecto.
- **Semana 4:** cierre, preparación de entrevistas y envío de candidaturas.

## 13. Forma de trabajar

Respuestas concisas y breves, con el mínimo de tokens. Aprendizaje práctico e iterativo, con guía paso a paso cuando se programa. Revisión semanal de objetivos.
