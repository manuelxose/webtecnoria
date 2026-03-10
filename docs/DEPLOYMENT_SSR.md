# Deploy SSR Tecnoria en VPS

## Objetivo
- `web`: Angular SSR en `:4000`
- `api`: Express API en `:3001`
- `postgres`: base de datos persistente
- `nginx`: reverse proxy publico en `:80`

La web publica y el area privada usan la misma URL publica. El navegador habla con `/api` y `/uploads` en el mismo dominio; `nginx` los redirige internamente a la API.

## Desarrollo local

El flujo local oficial es arrancar SSR web y API juntos desde la raiz del monorepo:

```bash
npm run dev
```

`npm run dev` levanta tambien dependencias locales de desarrollo via Docker (`infra/docker-compose.dev.yml`):
- Postgres en `127.0.0.1:5432`
- Mailpit SMTP en `127.0.0.1:1025` (UI en `http://127.0.0.1:8025`)

Comandos manuales equivalentes:

```bash
npm run dev:deps:up
npm run dev:deps:down
```

Flags opcionales para escenarios avanzados:
- `SKIP_DEV_DEPS=true npm run dev` para no arrancar Docker y usar infraestructura propia.
- `SKIP_DEV_MIGRATIONS=true npm run dev` para omitir migraciones automáticas.

Requisitos para que funcione:
- `DATABASE_URL` debe apuntar a una base accesible
- `JWT_SECRET` debe estar definido
- `GOOGLE_CLIENT_ID` debe estar definido
- SMTP sigue siendo obligatorio tambien en local: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `ADMIN_NOTIFICATION_EMAIL` debe estar definido

Archivos de entorno locales preparados:
- `apps/api/.env`
- `apps/web/.env`
- `infra/.env` (stack Docker/Nginx)

Si falta cualquiera de esas variables, la API aborta el arranque con un mensaje corto y accionable.
Si `DATABASE_URL` no responde, la API tambien aborta el arranque antes de abrir el puerto `3001`.
Si `3001` o `4000` ya estan ocupados, `npm run dev` falla en preflight para evitar stacks de `EADDRINUSE`.

Antes de produccion real debes reemplazar, como minimo:
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- toda la configuracion SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)
- `ADMIN_PASSWORD`

## Variables necesarias

Usa [infra/.env.example](/c:/Users/Admin/Documents/workspace/webtecnoria2/infra/.env.example) como base y crea `infra/.env`.

Variables clave:
- `WEB_PUBLIC_URL`: URL publica del sitio, por ejemplo `https://tecnoriasl.com`
- `API_PUBLIC_URL`: URL publica de la API, por ejemplo `https://tecnoriasl.com/api`
- `API_INTERNAL_URL`: URL interna entre contenedores, por defecto `http://api:3001`
- `CORS_ORIGIN`: origen permitido para la API. Debe coincidir con la URL publica web
- `COOKIE_NAME`: nombre de la cookie de sesion
- `JWT_SECRET`: secreto JWT largo
- `GOOGLE_CLIENT_ID`: client id de Google OAuth para login privado
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: SMTP para emails de acceso y recovery
- `SMTP_FROM`: remitente de los emails transaccionales
- `ADMIN_NOTIFICATION_EMAIL`: email que recibe avisos de nuevas solicitudes
- `DATABASE_URL`: conexion Postgres usando el host `postgres`
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`

## Arranque inicial

Desde [infra/docker-compose.yml](/c:/Users/Admin/Documents/workspace/webtecnoria2/infra/docker-compose.yml):

```bash
cp .env.example .env
docker compose up -d --build postgres api web nginx
```

## Migraciones y seed del admin

La imagen de la API ya incluye `src/` para poder ejecutar scripts operativos dentro del contenedor.

```bash
docker compose exec api npm run migrate
docker compose exec api npm run seed:admin
```

## Smoke checks obligatorios

```bash
curl http://localhost/health
curl http://localhost/api/v1/feature-flags
curl -I http://localhost/
curl -I http://localhost/auth-login
curl -I http://localhost/dashboard
```

Esperado:
- `/health` responde desde SSR web
- `/api/v1/feature-flags` responde desde API
- `/dashboard` sin sesion devuelve redireccion a `/auth-login`

## Flujos privados

- `/auth-login`: login clasico y login con Google para usuarios autorizados
- `/auth-signup`: solicitud de acceso con email de confirmacion y aviso al admin
- `/auth-re-password`: envio de enlace de recovery y reset con token

## Validacion de sesion SSR

1. Inicia sesion en `/auth-login`.
2. Comprueba que la cookie llega con el nombre definido en `COOKIE_NAME`.
3. Abre `/dashboard`.
4. Debe renderizar HTML del panel en servidor y no depender solo de la hidratacion del navegador.
5. Si el rol no es `admin|editor`, el servidor debe redirigir a `/acceso-restringido`.

## Estructura del proxy

[default.conf](/c:/Users/Admin/Documents/workspace/webtecnoria2/infra/nginx/default.conf):
- `/` -> `web:4000`
- `/api/` -> `api:3001`
- `/uploads/` -> `api:3001`
- cabeceras `X-Forwarded-*` activas
- cache agresiva para assets y uploads

## Rollout recomendado

1. `docker compose pull` si cambian imagenes base.
2. `docker compose up -d --build --force-recreate web nginx`
3. `docker compose exec api npm run migrate`
4. `docker compose exec api npm run seed:admin` solo si necesitas recrear el admin inicial
5. Smoke checks

## Rollback minimo

1. Conserva una copia del `.env` anterior.
2. Si la build nueva falla, vuelve al commit previo.
3. Ejecuta `docker compose up -d --build` con esa revision.
4. No borres `postgres_data` ni `api_uploads` salvo que quieras perder datos.

## TLS

La configuracion actual queda lista para poner Nginx delante de la web y la API. Para HTTPS real en VPS:
- termina TLS en `nginx`
- mantén `X-Forwarded-Proto https`
- deja `NODE_ENV=production` en la API para que la cookie salga como `Secure`

## Rutas de verificacion final

- `GET /health`
- `GET /`
- `GET /servicios`
- `GET /auth-login`
- `GET /dashboard` sin sesion
- `GET /dashboard` con sesion valida
