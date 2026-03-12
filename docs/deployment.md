# Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- SMTP server (or Mailgun/Resend/SES)

## Environment Variables

### API (`apps/api/.env`)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/tecnoria

JWT_SECRET=your-super-secret-jwt-key-min-32-chars
COOKIE_NAME=tecnoria_session
COOKIE_DOMAIN=your-domain.com

CORS_ORIGIN=https://your-domain.com

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@your-domain.com
SMTP_PASS=smtp-password
SMTP_FROM=Tecnoria <noreply@your-domain.com>
ADMIN_NOTIFICATION_EMAIL=admin@your-domain.com

GOOGLE_CLIENT_ID=your-google-oauth-client-id   # optional
AUCTORIO_PUBLISHER_TOKEN=your-auctorio-token    # optional
```

### Web (`apps/web/.env` or build-time)

```env
API_BASE_URL=https://your-domain.com
```

## Database Setup

Run migrations in order:

```bash
cd apps/api

psql $DATABASE_URL -f migrations/001_init.sql
psql $DATABASE_URL -f migrations/002_auth_upgrade.sql
psql $DATABASE_URL -f migrations/002_blog_workflow.sql
psql $DATABASE_URL -f migrations/003_crm_core.sql
psql $DATABASE_URL -f migrations/004_projects.sql
psql $DATABASE_URL -f migrations/005_finance.sql
psql $DATABASE_URL -f migrations/006_support.sql
psql $DATABASE_URL -f migrations/007_users_upgrade.sql
psql $DATABASE_URL -f migrations/008_portal.sql
```

## Create First Admin User

```sql
INSERT INTO users (email, password_hash, role, full_name)
VALUES (
  'admin@your-domain.com',
  '$2a$10$...',  -- bcrypt hash of your password
  'admin',
  'Admin'
);
```

Or use the seed script:

```bash
cd apps/api
npm run seed:admin -- --email admin@your-domain.com --password YourPassword123
```

## Build

```bash
# Build API
cd apps/api
npm install
npm run build

# Build Web (SSR)
cd apps/web
npm install
npm run build
```

## Docker

Both apps have `Dockerfile`s. Use docker-compose for local development:

```bash
docker-compose up --build
```

## Running in Production

```bash
# API
cd apps/api/dist
node server.js

# Web (SSR)
cd apps/web/dist/server
node server.mjs
```

## Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    # Web frontend (SSR)
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Health Check

- API: `GET /api/v1/auth/me` — returns 401 (alive) or 200 (authenticated)
- Web: root path should return 200

## Monitoring

Key metrics to monitor:
- Response times on `/api/v1/analytics/dashboard`
- PostgreSQL connection pool usage
- Error rate on `/api/v1/` endpoints
- Memory usage of the SSR Node process
