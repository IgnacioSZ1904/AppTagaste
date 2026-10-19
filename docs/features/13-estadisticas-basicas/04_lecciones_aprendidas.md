# Lecciones aprendidas: 13-estadisticas-basicas

## [2026-10-19] — Un CSV para Excel en español necesita `;` y BOM
- **Qué pasó:** Excel en español usa `;` como separador y, sin BOM, muestra mal las tildes de un CSV en UTF-8.
- **Corrección:** `csv.writer(delimiter=";")` y `"﻿"` al principio; test que comprueba ambos.
- **Aplicar en:** cualquier exportación que vaya a abrirse en Excel.

## [2026-10-19] — Descargar un fichero protegido desde el frontend
- **Qué pasó:** un enlace normal no envía el token, así que la API respondería 401.
- **Corrección:** `fetch` con la cabecera `Authorization`, el fichero como blob y un enlace temporal con `URL.createObjectURL`; el nombre sale de `Content-Disposition`.
- **Aplicar en:** cualquier descarga autenticada (informes, documentos de la biblioteca).

## [2026-10-19] — Las listas sin pasar no cuentan en el porcentaje
- **Qué pasó:** contar los eventos sin lista como faltas bajaría la asistencia sin motivo.
- **Corrección:** el % es asistencias / (asistencias + faltas); `null` si no hay ninguna lista, y en pantalla "—" o "sin pasar".
- **Aplicar en:** cualquier métrica calculada sobre datos que pueden faltar.
