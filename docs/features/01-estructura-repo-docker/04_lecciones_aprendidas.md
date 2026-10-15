# Lecciones aprendidas: 01-estructura-repo-docker

## [2026-10-13] — No lanzar comandos de ejecución largos desde el agente
- **Qué pasó:** `docker compose up --build` se quedó bloqueado (límite de Docker Hub) y el hilo se atascó.
- **Corrección:** el agente edita ficheros; Ignacio ejecuta git, docker y curl a mano con los comandos que le pasa el agente.
- **Aplicar en:** todas las features.

## [2026-10-13] — Comprobar que los ficheros llegan al PC
- **Qué pasó:** `02_planificacion.md` llegó vacío al PC por retraso de sincronización.
- **Corrección:** tras copiar, comparar tamaños y volver a copiar si difieren.
