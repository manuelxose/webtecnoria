# Deploy SSR Tecnoria en VPS

## Objetivo
- `web`: Angular SSR en `:4300` en VPS (`:4000` solo en desarrollo legacy)
- `api`: Express API en `:3001`
- `chat-api`: API del chatbot en `:4101`
- `chat-widget`: assets del widget en `:4102`
- `ingest-worker`: worker de ingesta del chatbot
- `chat-postgres`: base del chatbot con pgvector
- `postgres`: base de datos persistente
- `nginx`: reverse proxy publico en `:80/:443`

La web publica y el area privada usan la misma URL publica. El navegador habla con `/api` y `/uploads` en el mismo dominio; `nginx` los redirige internamente a la API. El chatbot se publica tambien en el mismo dominio mediante `/chat-api/*` y `/chat-widget/*`, evitando depender de subdominios adicionales.

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
- `CHAT_POSTGRES_DB`, `CHAT_POSTGRES_USER`, `CHAT_POSTGRES_PASSWORD`
- `CHAT_CORS_ORIGIN`: origen permitido para accesos directos al chat API
- `CHAT_API_ADMIN_BEARER_TOKEN`: token admin del chat
- `CHAT_LEAD_WEBHOOK_SHARED_SECRET`: secreto del webhook de leads
- `CHAT_DEFAULT_LEAD_WEBHOOK_URL`: por defecto `http://api:3001/api/v1/contact`
- `CHAT_FETCH_TIMEOUT_MS`, `CHAT_CRAWLER_USER_AGENT`: parametros del worker de ingesta

## Produccion VPS actual

En el VPS de Tecnoria la orquestacion activa no usa Docker ni PM2:
- codigo en `/var/www/webtecnoria` y `/var/www/tecnoria-chat-platform`
- configuracion operativa en `/etc/tecnoria/*.env`
- uploads en `/var/lib/tecnoria/uploads`
- TLS de origen en `/var/lib/tecnoria/ssl/origin.crt` y `/var/lib/tecnoria/ssl/origin.key`
- servicios `systemd`: `tecnoria-web`, `tecnoria-api`, `tecnoria-chat-api`, `tecnoria-chat-widget`, `tecnoria-chat-ingest`

Puertos internos del despliegue real:
- `4300` SSR web
- `3001` API corporativa
- `4101` chat API
- `4102` widget

## Corte Cloudflare

Script preparado:

```bash
CF_API_TOKEN=... \
CF_ZONE_NAME=tecnoriasl.com \
CF_ORIGIN_IPV4=109.123.248.164 \
CF_SSL_MODE=strict \
bash infra/cloudflare-cutover.sh
```

O con Global API Key:

```bash
CF_AUTH_EMAIL=Oficina@tecnoriasl.com \
CF_GLOBAL_API_KEY=... \
CF_ZONE_NAME=tecnoriasl.com \
CF_ORIGIN_IPV4=109.123.248.164 \
CF_SSL_MODE=strict \
bash infra/cloudflare-cutover.sh
```

Si usas API token, debe incluir como minimo estos permisos sobre la zona:
- `Zone:Read`
- `DNS:Edit`
- `Zone Settings:Edit`
- `Cache Purge`

El script:
- valida el token
- resuelve el `zone_id`
- hace `upsert` de `tecnoriasl.com` y `www.tecnoriasl.com` hacia `109.123.248.164` con proxy activo
- cambia el modo SSL a `strict`
- purga cache

Antes de ejecutarlo, el origen ya debe tener instalado un certificado valido para Cloudflare o un Origin Certificate definitivo.

## Arranque inicial

Desde [infra/docker-compose.yml](/c:/Users/Admin/Documents/workspace/webtecnoria2/infra/docker-compose.yml):

```bash
cp .env.example .env
docker compose up -d --build postgres api web chat-postgres chat-api chat-widget ingest-worker nginx
```

## Migraciones y seed del admin

La imagen de la API ya incluye `src/` para poder ejecutar scripts operativos dentro del contenedor.

```bash
docker compose exec api npm run migrate
docker compose exec api npm run seed:admin
docker compose exec chat-api npm run migrate -w @tecnoria-chat/chat-api
```

Bootstrap inicial del chatbot:

```bash
cd ../tecnoria-chat-platform
npm run cli -- seed-tecnoria
npm run cli -- run-eval --project tecnoria
```

## Smoke checks obligatorios

```bash
curl http://localhost/health
curl http://localhost/api/v1/feature-flags
curl http://localhost/chat-api/health
curl -I http://localhost/chat-widget/embed.js
curl -I http://localhost/
curl -I http://localhost/auth-login
curl -I http://localhost/dashboard
```

Esperado:
- `/health` responde desde SSR web
- `/api/v1/feature-flags` responde desde API
- `/chat-api/health` responde desde la API del chatbot
- `/chat-widget/embed.js` responde desde el servidor del widget
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
- `/chat-api/` -> `chat-api:4101` con reescritura de prefijo
- `/chat-widget/` -> `chat-widget:4102` con reescritura de prefijo
- cabeceras `X-Forwarded-*` activas
- cache agresiva para assets y uploads

## Rollout recomendado

1. `docker compose pull` si cambian imagenes base.
2. `docker compose up -d --build --force-recreate web api chat-api chat-widget ingest-worker nginx`
3. `docker compose exec api npm run migrate`
4. `docker compose exec chat-api npm run migrate -w @tecnoria-chat/chat-api`
5. `docker compose exec api npm run seed:admin` solo si necesitas recrear el admin inicial
6. Smoke checks

## Rollback minimo

1. Conserva una copia del `.env` anterior.
2. Si la build nueva falla, vuelve al commit previo.
3. Ejecuta `docker compose up -d --build` con esa revision.
4. No borres `postgres_data`, `api_uploads` ni `chat_postgres_data` salvo que quieras perder datos.

## TLS

La configuracion actual queda lista para poner Nginx delante de la web y la API. Para HTTPS real en VPS:
- termina TLS en `nginx`
- mantén `X-Forwarded-Proto https`
- deja `NODE_ENV=production` en la API para que la cookie salga como `Secure`

## Rutas de verificacion final

- `GET /health`
- `GET /`
- `GET /servicios`
- `GET /chat-api/health`
- `GET /chat-widget/embed.js`
- `GET /auth-login`
- `GET /dashboard` sin sesion
- `GET /dashboard` con sesion valida
