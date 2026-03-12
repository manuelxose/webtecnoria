# Tecnoria — Product Architecture

> Versión: 1.0 | Fecha: 2026-03-11
> Autor: Product Design & Architecture Review

---

## 1. Visión del Producto

Tecnoria es una **plataforma de operaciones y negocio** que centraliza la gestión empresarial de una agencia tecnológica. No es un SaaS aislado: es la capa de orquestación que conecta clientes, proyectos, facturación, soporte y los productos tecnológicos propios (Talkaris, Auctorio).

**Filosofía de diseño:**
- Tecnoria **no replica** funcionalidades internas de Talkaris o Auctorio
- Tecnoria actúa como **centro de control empresarial** — vista de alto nivel + enlaces directos
- Cada entidad del dominio tiene su ciclo de vida claro y gestionable

---

## 2. Estado Actual vs Estado Objetivo

### Estado Actual (Auditado 2026-03-11)

| Área | Estado | Notas |
|------|--------|-------|
| Panel admin | ⚠️ Básico | Solo gestión de blog + scraper jobs |
| CRM / Clientes | ❌ Inexistente | Solo contact_messages en DB |
| Proyectos | ❌ Inexistente | No existe |
| Facturación | ❌ Inexistente | No existe |
| Soporte / Tickets | ❌ Inexistente | No existe |
| Portal cliente | ❌ Inexistente | No existe |
| Integración Talkaris | ⚠️ Parcial | Solo chat widget embebido en web pública |
| Integración Auctorio | ⚠️ Parcial | Solo API token para escribir blog posts |
| Autenticación | ✅ Funcional | JWT httpOnly cookies, Google OAuth, roles |
| Blog / CMS | ✅ Funcional | CRUD completo, SSR, SEO |
| Web pública | ✅ Completa | 15+ páginas, diseño, SEO |

### Estado Objetivo

| Área | Objetivo |
|------|----------|
| Panel admin | CRM + PM + Finance + Support + Products cockpit |
| Portal cliente | Dashboard cliente con proyectos, métricas, soporte, billing |
| Base de datos | 15+ tablas nuevas para el dominio completo |
| API | 40+ endpoints nuevos organizados por dominio |
| Navegación admin | Sidebar multi-nivel con 10 secciones |
| Integraciones | Talkaris API + Auctorio API (métricas de alto nivel) |

---

## 3. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TECNORIA PLATFORM                           │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   Web Pública    │  │   Admin Panel    │  │  Portal Cliente  │  │
│  │  (Marketing)     │  │  (Equipo interno)│  │  (Clientes)      │  │
│  │  Angular 20 SSR  │  │  Angular 20 SPA  │  │  Angular 20 SPA  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                      │            │
│           └─────────────────────┼──────────────────────┘            │
│                                 │                                   │
│                    ┌────────────▼────────────┐                      │
│                    │    Tecnoria REST API     │                      │
│                    │    (Express.js + PG)     │                      │
│                    │    /api/v1/              │                      │
│                    └────────────┬────────────┘                      │
│                                 │                                   │
│           ┌─────────────────────┼──────────────────────┐            │
│           │                     │                      │            │
│  ┌────────▼─────────┐  ┌────────▼─────────┐  ┌────────▼─────────┐  │
│  │   PostgreSQL     │  │  Talkaris API    │  │  Auctorio API    │  │
│  │   (Principal DB) │  │  (chatbots info) │  │  (editorial info)│  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Modelo del Dominio Completo

### 4.1 Entidades Núcleo

```
WORKSPACE
├── id, name, slug, settings, created_at
└── → Users (many), Clients (many), Settings

USER
├── id, email, display_name, role, avatar_url
├── role: admin | manager | editor | agent | viewer
└── → Workspace (FK)

LEAD
├── id, name, email, phone, company_name
├── source: web_form | manual | import | referral | talkaris | auctorio
├── status: new | contacted | qualified | proposal | negotiation | won | lost
├── score (0-100, AI-assisted future)
├── notes, utm_source, utm_medium, utm_campaign
├── assigned_to (FK → User)
└── created_at, updated_at

CLIENT
├── id, name, type: company | individual
├── status: active | inactive | churned
├── tier: starter | professional | enterprise
├── billing_email, fiscal_name, tax_id
├── address, country, city
├── notes, tags[]
└── → Company (optional FK), Contacts (many)

COMPANY
├── id, name, domain, sector, size
├── website, linkedin_url
└── → Clients (many)

CONTACT
├── id, first_name, last_name, email, phone
├── role (e.g., "CTO", "CEO", "Project Manager")
├── is_primary (bool)
└── → Client (FK), Company (FK)

PROJECT
├── id, name, slug, description
├── type: web_dev | automation | ai_system | chatbot | saas | consulting | custom
├── status: discovery | planning | active | paused | review | completed | cancelled
├── priority: low | medium | high | critical
├── start_date, end_date, deadline
├── budget, invoiced_amount
├── health: on_track | at_risk | off_track
└── → Client (FK), Lead (optional FK), Milestones (many), Tasks (many)

MILESTONE
├── id, name, description
├── status: pending | in_progress | completed | cancelled
├── due_date, completed_at
└── → Project (FK)

TASK
├── id, title, description
├── status: backlog | todo | in_progress | review | done
├── priority: low | medium | high
├── due_date, estimated_hours, actual_hours
├── assigned_to (FK → User)
└── → Project (FK), Milestone (optional FK)

SERVICE
├── id, name, slug, description, category
├── category: web_dev | automation | ai | chatbot | saas | consulting
├── is_active (bool), price_from (optional)
└── Static catalog of service offerings

PRODUCT_DEPLOYMENT
├── id, name, product_type: talkaris | auctorio | custom
├── status: active | inactive | maintenance | deploying
├── deployed_at, environment: production | staging
├── external_id (ID en el sistema externo)
├── external_url (enlace directo al panel del producto)
├── metadata: JSON (bots_count, articles_count, etc.)
└── → Client (FK), Project (optional FK)

CONTRACT
├── id, contract_number, title, type
├── type: project | retainer | license | sla
├── status: draft | sent | signed | active | expired | cancelled
├── value, currency, start_date, end_date
├── signed_at, file_url
└── → Client (FK), Project (optional FK)

INVOICE
├── id, invoice_number, title
├── status: draft | sent | viewed | paid | overdue | cancelled
├── subtotal, tax_rate, tax_amount, total, currency
├── issued_at, due_date, paid_at
├── payment_method, notes
└── → Client (FK), Contract (optional FK), InvoiceItems (many)

INVOICE_ITEM
├── id, description, quantity, unit_price, subtotal
└── → Invoice (FK)

PAYMENT
├── id, amount, currency
├── method: bank_transfer | card | paypal | other
├── status: pending | confirmed | failed | refunded
├── paid_at, reference, notes
└── → Invoice (FK), Client (FK)

TICKET
├── id, subject, description
├── status: open | in_progress | waiting_client | resolved | closed
├── priority: low | medium | high | critical
├── type: support | bug | request | billing | question
├── resolved_at, sla_due_at
├── assigned_to (FK → User)
└── → Client (FK), Project (optional FK), TicketMessages (many)

TICKET_MESSAGE
├── id, content, is_internal (bool)
├── author_type: team | client
└── → Ticket (FK), User (optional FK)

DOCUMENT
├── id, name, description, file_url, file_type, file_size
├── category: contract | deliverable | documentation | proposal | invoice | other
├── is_client_visible (bool)
└── → Client (FK), Project (optional FK)

NOTIFICATION
├── id, type, title, body
├── is_read (bool), read_at
└── → User (FK), entity_type, entity_id (polymorphic)
```

### 4.2 Integraciones Externas

```
INTEGRATION_CONFIG
├── id, product: talkaris | auctorio | custom
├── api_url, api_key_encrypted
├── is_active, last_sync_at
└── → Workspace (FK)

PRODUCT_METRIC_SNAPSHOT
├── id, product_type, metric_key, metric_value
├── captured_at
└── → ProductDeployment (FK)
```

---

## 5. Roles y Permisos

| Rol | Descripción | Accesos |
|-----|-------------|---------|
| `admin` | Propietario / Gerencia | Todo |
| `manager` | Gestor de cuentas | CRM + Projects + Finance (lectura) |
| `editor` | Contenido / Blog | Blog + Documents |
| `agent` | Soporte | Tickets + Client info (lectura) |
| `client` | Cliente externo | Portal cliente (solo sus datos) |
| `viewer` | Observador | Dashboard + lectura |

---

## 6. Estructura de la API (Objetivo)

```
/api/v1/
├── auth/           (existente — ampliar con client role)
├── blog/           (existente)
├── contact/        (existente)
├── feature-flags/  (existente)
│
├── leads/
│   ├── GET    /              list con filtros y paginación
│   ├── POST   /              crear lead
│   ├── GET    /:id           detalle
│   ├── PUT    /:id           actualizar
│   ├── DELETE /:id           archivar
│   └── POST   /:id/convert   convertir a cliente
│
├── clients/
│   ├── GET/POST /
│   ├── GET/PUT/DELETE /:id
│   ├── GET /:id/projects
│   ├── GET /:id/invoices
│   ├── GET /:id/tickets
│   └── GET /:id/products
│
├── companies/      CRUD + GET /:id/clients
├── contacts/       CRUD + GET /:clientId
│
├── projects/
│   ├── CRUD /
│   ├── GET /:id/milestones
│   ├── GET /:id/tasks
│   └── GET /:id/timeline
│
├── milestones/     CRUD
├── tasks/          CRUD + PATCH /:id/status
│
├── products/       (product deployments)
│   ├── CRUD /
│   ├── GET /:id/metrics
│   └── POST /:id/sync     (sync desde API externa)
│
├── contracts/      CRUD + POST /:id/sign
│
├── invoices/
│   ├── CRUD /
│   ├── GET /:id/items
│   ├── POST /:id/send
│   └── POST /:id/mark-paid
│
├── payments/       CRUD
│
├── tickets/
│   ├── CRUD /
│   ├── GET /:id/messages
│   ├── POST /:id/messages
│   └── PATCH /:id/status
│
├── documents/      CRUD + POST /upload
│
├── analytics/
│   ├── GET /dashboard       KPIs principales
│   ├── GET /revenue         ingresos por período
│   ├── GET /leads           funnel de leads
│   └── GET /projects        estado de proyectos
│
└── notifications/
    ├── GET /                lista
    └── PATCH /:id/read      marcar leída
```

---

## 7. Migraciones de Base de Datos Pendientes

Orden de ejecución:
1. `003_crm_core.sql` — leads, clients, companies, contacts
2. `004_projects.sql` — projects, milestones, tasks
3. `005_finance.sql` — contracts, invoices, invoice_items, payments
4. `006_support.sql` — tickets, ticket_messages
5. `007_products.sql` — product_deployments, product_metric_snapshots
6. `008_documents.sql` — documents
7. `009_notifications.sql` — notifications
8. `010_integrations.sql` — integration_configs
9. `011_roles_expand.sql` — ampliar roles a: admin, manager, editor, agent, client, viewer

---

## 8. Infraestructura

Sin cambios en infraestructura base (Docker, Nginx, PostgreSQL). Se añaden:
- Variables de entorno para APIs externas (Talkaris, Auctorio)
- Bucket/directorio de documentos (ya existe `/uploads/` para imágenes)
- Posible cron job para sync de métricas de productos externos
