# Tecnoria Plan Maestro - Estado de Ejecucion

Fecha de corte: 2026-03-06

## Fases completadas

1. Estructura monorepo canonica
- Raiz unica de trabajo: `webtecnoria2`
- Estructura activa:
  - `apps/web`
  - `apps/api`
  - `apps/functions-legacy`
  - `packages/shared-types`
  - `infra`
  - `docs`
- Legacy Functions archivadas en `apps/functions-legacy/firebase-functions`.

2. Saneamiento de repo y artefactos
- Salidas generadas (`dist`, `.angular`, logs) fuera de control de versiones via `.gitignore`.
- Documentacion legacy consolidada en `docs/legacy-migration`.
- Eliminados residuos Firebase/Protractor del frontend activo:
  - `apps/web/.firebaserc`
  - `apps/web/firebase.json`
  - `apps/web/e2e/*`
  - `apps/web/functions/*` (movido a `apps/functions-legacy`).

3. Angular 20 + SSR estable
- Build browser/server de `apps/web` en verde.
- SSR smoke validado en rutas principales:
  - `/`
  - `/servicios`
  - `/blog`
  - `/blog/post-prueba`
  - `/auth-login`

4. Standalone + routing lazy funcional
- Routing lazy con componentes standalone funcional.
- Corregidas inconsistencias de import/metadata detectadas en la migracion inicial.

5. Hardening SSR
- Eliminadas excepciones SSR conocidas por APIs browser-only en rutas criticas.
- Hidratacion y render SSR estables en smoke principal.

6. Capa de abstraccion de datos (frontend)
- Contratos activos:
  - `AuthRepository`
  - `BlogRepository`
  - `ContactRepository`
  - `ScraperRepository`
- Componentes y servicios criticos desacoplados del SDK Firebase directo.

7. Backend propio base (Express + PostgreSQL)
- API `apps/api` operativa con endpoints v1:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/me`
  - `GET /api/v1/blog`
  - `GET /api/v1/blog/:slug`
  - `POST /api/v1/blog` (admin/editor)
  - `PUT /api/v1/blog/:id` (admin/editor)
  - `DELETE /api/v1/blog/:id` (admin/editor)
  - `POST /api/v1/blog/upload-image` (admin/editor)
  - `POST /api/v1/contact`
  - `POST /api/v1/scraper/jobs` (admin/editor)
  - `GET /api/v1/scraper/jobs/:id` (admin/editor)
- Uploads estaticos servidos en `/uploads/*`.

8. Migracion Firebase -> PostgreSQL
- Script de migracion: `npm run -w apps/api migrate:firebase`.
- Script de verificacion: `npm run -w apps/api verify:migration`.
- Verificacion incluye:
  - conteos por dominio
  - checksums SHA-256 por dominio
  - spot-check de claves faltantes
- Migracion endurecida para ser idempotente en `contact_messages` y `scraper_jobs`.

9. Cutover completado por dominio
- Frontend activo en API propia para:
  - `contactos`
  - `blog`
  - `auth/admin`
  - `scraper/sitemap` (jobs)

10. Decomision frontend Firebase
- Eliminados adaptadores Firebase del frontend:
  - `infrastructure/repositories/firebase/*`
  - `services/auth.service.ts`
  - `services/firebase.service.ts`
- Providers de repositorios simplificados a API-only.
- Eliminadas dependencias web:
  - `@angular/fire`
  - `firebase`

## Infra y despliegue

- `infra/docker-compose.yml` para `web SSR + api + postgres`.
- Dockerfiles de `apps/web` y `apps/api` listos para build de contenedores.

## Validaciones ejecutadas en este estado

- `npm run -w apps/web build`
- `npm run -w apps/api build`
- `npm run build` (raiz)
- SSR smoke sobre `dist/server/server.mjs` en rutas principales.

## Pendiente operativo (no de codigo)

1. Ejecutar migracion real con credenciales Firebase productivas.
2. Ejecutar `verify:migration` contra datos reales y guardar evidencia de auditoria.
3. Planificar ventana de corte final de servicios legacy de Firebase en produccion.
