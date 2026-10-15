# Planificación: 03-calidad-ci

## 1. Enfoque técnico
pytest con una BD Postgres separada (`<nombre>_test`) que el propio `conftest.py` crea si no existe y migra con Alembic al inicio. Cada test corre dentro de una transacción que se deshace al final, así los tests no se pisan. ruff hace de linter y formateador. GitHub Actions ejecuta lint y tests con un Postgres 16 como servicio.

## 2. Decisiones de diseño
| Decisión | Alternativas | Justificación |
|----------|--------------|---------------|
| BD de test derivada de `DATABASE_URL` + sufijo `_test`, creada por el conftest | Script en `docker-entrypoint-initdb.d` | El script solo corre con el volumen vacío; tu volumen ya existe. Así funciona igual en local y en CI |
| Esquema creado con `alembic upgrade head` | `Base.metadata.create_all` | Los tests validan también las migraciones |
| Rollback por test (savepoint) | Truncar tablas | Rápido y aislado |
| Sustituir `get_db` con `app.dependency_overrides` | Variable de entorno distinta | Patrón oficial de FastAPI; la app no sabe que está en test |
| ruff (lint + format) | flake8 + black + isort | Una sola herramienta, muy rápida, estándar actual |
| `requirements-dev.txt` instalado en la imagen | Imagen separada de test | El Dockerfile ya es de desarrollo; el de producción llega en la 08 |

## 3. Cambios por módulo
### `backend/`
- `pyproject.toml`: config de ruff (py312, línea 100, reglas E, F, I, UP, B) y pytest (`testpaths = ["tests"]`).
- `requirements-dev.txt`: `pytest`, `httpx`, `ruff` con versión fijada.
- `Dockerfile`: instala `requirements-dev.txt`.
- `alembic/env.py`: usa la URL ya fijada en la config si existe (para que los tests apunten a `_test`); si no, la de `.env`.
- `tests/conftest.py`: fixtures `engine` (crea y migra la BD de test, sesión), `db` (transacción con rollback) y `client` (`TestClient` con `get_db` sustituido).
- `tests/test_health.py`: 200 con BD; 503 simulando fallo de BD.
- Arreglar lo que marque ruff en el código existente.

### Raíz
- `.github/workflows/ci.yml`: jobs `lint` y `test`; en push a `develop`/`master` y en `pull_request`.
- `README.md`: sección "Tests y calidad".

## 4. Modelo de datos / contratos
Sin cambios. Nueva BD `apptagaste_test` (solo tests).

## 5. Plan de pruebas
- Verificación en la nube con Postgres 16 antes de pasarte los ficheros.
- Manual (Ignacio):
  1. `docker compose up --build`
  2. `docker compose exec api pytest -v` → todo verde.
  3. `docker compose exec api ruff check .` y `ruff format --check .` → sin errores.
  4. Push de la rama y PR a `develop` → checks de GitHub Actions en verde.

## 6. Plan de despliegue / migración
- Rama `feature/03-calidad-ci` desde `develop`.
- Opcional después: proteger `develop` en GitHub exigiendo CI en verde.
- Rollback: revertir el commit.

## 7. Estimación
- Tareas: ~11
- Incertidumbre: permisos del usuario de Postgres para `CREATE DATABASE` (el usuario del contenedor es superusuario, así que no debería fallar).
