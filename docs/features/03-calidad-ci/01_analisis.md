# Análisis: 03-calidad-ci

## 1. Petición original
> "vamos con el siguiente feature" → feature 03 del backlog: `calidad-ci` (P0).

## 2. Objetivo
Tener una red de seguridad automática: tests con pytest contra una BD de test, linter/formateador (ruff) y un pipeline de GitHub Actions que ejecute ambos en cada push y PR. Así cada feature siguiente llega con tests y no rompe lo anterior.

## 3. Estado actual del proyecto
- Feature 02 mergeada en `develop` (PR #2). Ramas: `master`, `develop`, `feature/*`.
- `requirements-dev.txt` solo incluye `-r requirements.txt`.
- No hay tests, ni configuración de ruff, ni `pyproject.toml`, ni `.github/workflows/`.
- El `Dockerfile` instala solo `requirements.txt`.
- `get_db()` es una dependencia de FastAPI → se puede sustituir en tests.

## 4. Alcance
### Dentro de alcance
- `backend/pyproject.toml` con configuración de ruff y pytest.
- `requirements-dev.txt`: pytest, httpx, ruff (versiones fijadas).
- `backend/tests/`: `conftest.py` (BD de test, sesión con rollback por test, `TestClient` con `get_db` sustituido) y test de `/health`.
- BD de test en Postgres: base `apptagaste_test`, migrada con Alembic al empezar la sesión de tests.
- Workflow `.github/workflows/ci.yml`: job lint (ruff check + format --check) y job tests (Postgres como servicio).
- README: cómo lanzar tests y linter.

### Fuera de alcance
- Tests del frontend (feature 04).
- Cobertura mínima obligatoria y pre-commit hooks (más adelante).
- Protección de ramas en GitHub (ajuste manual opcional).

## 5. Riesgos y dependencias
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Tests que borran datos de la BD de desarrollo | Media | Alto | BD separada `apptagaste_test`; el conftest se niega a correr si la URL no termina en `_test` |
| ruff marca muchos errores en el código existente | Baja | Bajo | Código pequeño; se corrige en esta feature |
| CI distinto del entorno local | Media | Medio | Mismo Postgres 16 y Python 3.12 en CI |

## 6. Preguntas abiertas
- [x] ¿BD de test en Postgres real o SQLite en memoria? Propuesta: **Postgres** (igual que producción; luego usaremos tsvector). → Postgres.
- [x] ¿Tests dentro del contenedor (`docker compose exec api pytest`) o con un venv local? Propuesta: **contenedor** (instalando `requirements-dev.txt` en la imagen de desarrollo). → Contenedor.
- [x] ¿CI en push a `develop`/`master` y en todas las PR? Propuesta: **sí**. → Sí.

## 7. Criterios de aceptación
- [ ] `docker compose exec api pytest` pasa en local usando `apptagaste_test`.
- [ ] `docker compose exec api ruff check .` y `ruff format --check .` pasan.
- [ ] El workflow de GitHub Actions sale en verde en la PR de esta feature.
- [ ] README documenta tests y linter.
