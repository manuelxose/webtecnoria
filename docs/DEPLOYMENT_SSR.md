# Deploy SSR Tecnoria (Monorepo)

## Requisitos
- Node 20+
- npm 10+
- PostgreSQL 16+

## 1) Instalar dependencias

```bash
npm install
```

## 2) Build completo

```bash
npm run build
```

Esto genera:
- Web SSR: `apps/web/dist`
- API: `apps/api/dist`

## 3) API local

Configurar variables en `apps/api/.env` (tomar base desde `.env.example`) y ejecutar:

```bash
npm run -w apps/api migrate
npm run -w apps/api seed:admin
npm run -w apps/api start
```

Por defecto API en `http://localhost:3001`.

Para migracion historica desde Firebase:

```bash
npm run migrate:firebase
npm run verify:migration
```

## 4) Web SSR local

```bash
npm run -w apps/web serve:ssr
```

Por defecto SSR en `http://localhost:4000`.

## 5) Smoke SSR recomendado

Comprobar:
- `/`
- `/servicios`
- `/blog`
- `/blog/post-prueba`

Debe responder `200` y HTML renderizado en servidor.

## 6) Docker compose (stack base)

Archivo: `infra/docker-compose.yml`

```bash
cd infra
docker compose up -d --build
```

Servicios:
- `postgres` (5432)
- `api` (3001)
- `web` (4000)

## Estado de cutover

El frontend esta en modo API-only (sin SDK Firebase en runtime).

Para observabilidad operativa, la API expone:

- `GET /api/v1/feature-flags`

con el estado de dominio (`auth`, `blog`, `contact`, `scraper`) leido desde `.env`.
