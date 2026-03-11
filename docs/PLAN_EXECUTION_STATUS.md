# Tecnoria Plan Maestro - Estado de Ejecucion

Fecha de corte: 2026-03-10

## Estado actual

- Monorepo activo:
  - `apps/web`
  - `apps/api`
  - `packages/shared-types`
  - `infra`
  - `docs`
- Web Angular 20 SSR y API Express sobre PostgreSQL operativas.
- Chatbot desacoplado desplegado bajo `/chat-api/*` y `/chat-widget/*`.
- Uploads servidos en `/uploads/*`.
- Login por password y Google habilitados desde la API propia.

## Validaciones cerradas

- `npm run -w apps/web build`
- `npm run -w apps/api build`
- `npm run build`
- SSR smoke en `/`, `/servicios`, `/auth-login` y `/dashboard`
- Contacto corporativo persistiendo en PostgreSQL
- Chatbot con ingesta completada y evaluacion en verde
- Certificado de origen Cloudflare instalado en el VPS
- DNS de `tecnoriasl.com` y `www.tecnoriasl.com` apuntando al origen `109.123.248.164`
- Cloudflare en modo `Full (strict)` con cache purgada
- Overrides locales de `hosts` retirados y worker reingestando contra el dominio publico real

## Pendiente operativo

1. Corregir la credencial SMTP real de Gmail Workspace para `oficina@tecnoriasl.com` o proporcionar un relay valido.
