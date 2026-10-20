# Registro de decisiones de arquitectura (ADR)

Cada ADR explica una decisión importante del proyecto: el problema, lo que se eligió, qué otras opciones había y qué consecuencias tiene. No se borran: si una decisión cambia, se escribe un ADR nuevo que **sustituye** al anterior y se marca el viejo como "Sustituido por …".

## Índice

| # | Decisión | Estado | Fecha |
|---|----------|--------|-------|
| [0001](0001-stack.md) | Stack: FastAPI + PostgreSQL y React | Aceptado | 2026-10-13 |
| [0002](0002-autenticacion-google-jwt.md) | Login solo con Google y JWT propio | Aceptado | 2026-10-14 |
| [0003](0003-roles-sin-cuentas-de-ninos.md) | Cuatro roles y niños sin cuenta | Aceptado | 2026-10-14 |
| [0004](0004-despliegue-gratuito.md) | Despliegue gratuito: Vercel, Render y Neon | Aceptado | 2026-10-15 |
| [0005](0005-fechas-hora-espana.md) | Fechas en hora de España en la API | Aceptado | 2026-10-14 |
| [0006](0006-ficheros-en-la-base-de-datos.md) | Copia de los documentos en la base de datos | Aceptado | 2026-10-20 |
| [0007](0007-drive-file-y-selector.md) | Drive con `drive.file` y el selector de Google | Aceptado | 2026-10-20 |
| [0008](0008-buscador-postgresql.md) | Buscador con el texto completo de PostgreSQL | Aceptado | 2026-10-20 |
| [0009](0009-ical-publico.md) | Feed iCal público sin token | Aceptado | 2026-10-19 |

## Plantilla

```markdown
# NNNN. Título corto en forma de decisión

- **Estado:** Propuesto | Aceptado | Sustituido por NNNN
- **Fecha:** AAAA-MM-DD
- **Feature:** docs/features/NN-nombre

## Contexto
Qué problema hay y qué condiciona la decisión.

## Decisión
Qué se hace.

## Alternativas
Qué otras opciones había y por qué no.

## Consecuencias
Qué se gana, qué se pierde y qué queda pendiente.
```
