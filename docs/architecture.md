# Tecnoria — Architecture

## Overview

Tecnoria is a full-stack enterprise operations platform built as a monorepo with three layers:

```
apps/
  api/     — Express + Node.js REST API (TypeScript)
  web/     — Angular 20 SSR frontend (TypeScript)
packages/
  shared-types/  — Shared TypeScript types
docs/            — This documentation
```

## Tech Stack

| Layer    | Technology                                  |
|----------|---------------------------------------------|
| Frontend | Angular 20, SSR (server-side rendering)     |
| Backend  | Express.js, Node.js, TypeScript             |
| Database | PostgreSQL (raw SQL via `pg` pool)          |
| Auth     | JWT cookies + bcrypt, Google OAuth          |
| Email    | Nodemailer (SMTP)                           |
| Hosting  | Docker / any Node-compatible host           |

## Frontend Architecture

### Pattern: Repository + InjectionToken

All data access goes through a domain interface (`src/app/domain/repositories/`) injected via Angular's DI:

```typescript
// Domain layer (interface)
export interface LeadRepository {
  list(params?: ...): Promise<PaginatedLeads>;
  get(id: string): Promise<Lead | null>;
  create(data: CreateLeadPayload): Promise<Lead>;
  update(id: string, data: UpdateLeadPayload): Promise<Lead>;
  delete(id: string): Promise<void>;
}
export const LEAD_REPOSITORY = new InjectionToken<LeadRepository>("LEAD_REPOSITORY");

// Infrastructure layer (HTTP implementation)
@Injectable()
export class ApiLeadRepository implements LeadRepository { ... }

// Provider (app.repository.providers.ts)
{ provide: LEAD_REPOSITORY, useExisting: ApiLeadRepository }
```

### State Management

All components use Angular signals:

```typescript
loading = signal(true);
data    = signal<Lead[]>([]);
error   = signal("");
```

### Routing

- Public site: `SiteLayoutComponent` shell at `/`
- Admin: `AdminLayoutComponent` shell at `/dashboard` (auth-guarded)
- Portal: `PortalLayoutComponent` shell at `/portal` (session-guarded for role `client`)

All routes use `loadComponent()` for lazy loading.

## Backend Architecture

### API Structure

```
apps/api/src/
  routes/v1/         — Route handlers (one file per domain)
  auth/              — JWT middleware, token utilities
  db/                — PostgreSQL pool
  config/            — Environment variables
  services/          — Email, Google OAuth
```

### Middleware

- `requireAuth` — validates JWT session cookie
- `requireAdmin` — requires role `admin` or `editor`
- `requirePortal` — requires a valid session plus role `client` and linked `client_id`

### Database

Raw SQL via `pg` pool. All tables have `created_at` and `updated_at` timestamps. The `set_updated_at()` trigger function automatically updates `updated_at` on every `UPDATE`.

## Database Schema

See `apps/api/migrations/` for the full migration history:

| File | Content |
|------|---------|
| `001_init.sql` | users, blog_posts, contact_messages, scraper_jobs |
| `002_auth_upgrade.sql` | Google OAuth, password reset tokens, access requests |
| `002_blog_workflow.sql` | Blog workflow states |
| `003_crm_core.sql` | companies, leads, clients, contacts |
| `004_projects.sql` | projects, milestones, tasks |
| `005_finance.sql` | contracts, invoices, invoice_items, payments |
| `006_support.sql` | tickets, ticket_messages |
| `007_users_upgrade.sql` | users: full_name, avatar_url, client_id, role expansion |
| `008_portal.sql` | legacy portal token table (deprecated in live flow) |
