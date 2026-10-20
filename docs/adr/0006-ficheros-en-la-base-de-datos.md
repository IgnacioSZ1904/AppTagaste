# 0006. Copia de los documentos en la base de datos

- **Estado:** Aceptado
- **Fecha:** 2026-10-20
- **Feature:** [14-biblioteca-documentos](../features/14-biblioteca-documentos/)

## Contexto
La biblioteca guarda recursos de varios cursos. Si solo se enlaza el fichero de Drive, se pierde cuando su dueño lo borra o deja el colegio. El disco de Render gratuito se borra en cada despliegue.

## Decisión
- Al añadir un documento se guarda **una copia del fichero** (PDF o Word, máx. 10 MB) en la tabla `document_files` de PostgreSQL, separada de los datos del documento.
- El fichero no se edita en la app (se edita en Drive y se sube de nuevo); sus datos (título, curso, grupo, etiquetas) sí.

## Alternativas
- **Solo enlace a Drive:** sin coste de espacio, pero los recursos se pierden y el acceso depende de los permisos de Drive de cada uno.
- **Disco de Render:** se borra en cada despliegue del plan gratuito.
- **Almacenamiento de objetos (S3, R2):** lo correcto a escala, pero otra cuenta, otra credencial y otro servicio que mantener.

## Consecuencias
- Los documentos sobreviven aunque se borren de Drive y los abre cualquiera con permiso en la app.
- El espacio de Neon (0,5 GB) es el límite real: el README explica cómo consultarlo. Si se llena, el siguiente paso es mover `document_files` a un almacenamiento de objetos.
