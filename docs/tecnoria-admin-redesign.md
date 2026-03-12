# Tecnoria — Admin Panel Redesign

> Versión: 1.0 | Fecha: 2026-03-11
> Rol: Principal Product Designer + Staff UX Architect

---

## 1. Visión del Rediseño

El panel actual de Tecnoria es un editor de blog básico. El objetivo es transformarlo en un **cockpit empresarial** comparable a HubSpot, Linear, Notion, Vercel Dashboard y Stripe.

El usuario que entre al panel debe sentir:
> "Tecnoria tiene una plataforma empresarial muy potente y bien organizada."

---

## 2. Principios de Diseño

### 2.1 Claridad
Cada sección tiene un propósito único. No hay ambigüedad sobre dónde está el usuario ni qué puede hacer.

### 2.2 Control
El usuario tiene visión global del negocio desde el dashboard. Puede navegar a cualquier entidad en máximo 2 clicks.

### 2.3 Densidad informativa controlada
Inspirado en Linear y Vercel: interfaces densas pero organizadas, sin ser abrumadoras. Tablas compactas, sidebars estructuradas, métricas visibles.

### 2.4 Jerarquía visual clara
- **Nivel 1:** Sección (sidebar)
- **Nivel 2:** Vista dentro de la sección (tabs o sub-nav)
- **Nivel 3:** Entidad individual (detail pane o nueva ruta)

### 2.5 Eficiencia de teclado
- Shortcuts para navegación principal (G then D = Dashboard, G then L = Leads, etc.)
- Command palette (Cmd+K) para acceso rápido
- Quick actions en hover de cada fila de tabla

---

## 3. Layout del Admin Panel

### 3.1 Estructura base

```
┌─────────────────────────────────────────────────────────────────┐
│  TOPBAR                                                         │
│  [Logo] [Breadcrumb]              [Search] [Notifications] [Me] │
├──────────────────┬──────────────────────────────────────────────┤
│                  │                                              │
│  SIDEBAR         │  MAIN CONTENT AREA                          │
│  (240px)         │                                              │
│                  │  ┌──────────────────────────────────────┐   │
│  [Dashboard]     │  │  PAGE HEADER                         │   │
│                  │  │  Title + actions + filters           │   │
│  PIPELINE        │  └──────────────────────────────────────┘   │
│  [Leads]         │                                              │
│  [Clients]       │  ┌──────────────────────────────────────┐   │
│                  │  │                                      │   │
│  DELIVERY        │  │  CONTENT                             │   │
│  [Projects]      │  │  (table / kanban / form / detail)    │   │
│  [Services]      │  │                                      │   │
│                  │  └──────────────────────────────────────┘   │
│  PRODUCTS        │                                              │
│  [Talkaris]      │                                              │
│  [Auctorio]      │                                              │
│                  │                                              │
│  OPERATIONS      │                                              │
│  [Support]       │                                              │
│  [Finance]       │                                              │
│  [Documents]     │                                              │
│                  │                                              │
│  INSIGHTS        │                                              │
│  [Analytics]     │                                              │
│  [Blog]          │                                              │
│                  │                                              │
│  SYSTEM          │                                              │
│  [Users]         │                                              │
│  [Settings]      │                                              │
│                  │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

### 3.2 Sidebar detallada

```
TECNORIA
────────────────────────────
  Dashboard

PIPELINE
  ↳ Leads
      Pipeline View
      All Leads
      Lead Sources
  ↳ Clients
      All Clients
      Companies
      Contacts

DELIVERY
  ↳ Projects
      Active Projects
      All Projects
      Roadmap
      Tasks
  ↳ Services
      Catalog

PRODUCTS
  ↳ Talkaris
      Overview
      Deployments
  ↳ Auctorio
      Overview
      Deployments
  ↳ Custom Platforms

OPERATIONS
  ↳ Support
      Tickets (open: 3)
      Requests
  ↳ Finance
      Invoices
      Payments
      Contracts
  ↳ Documents
      Files
      Knowledge Base

INSIGHTS
  ↳ Analytics
  ↳ Blog

SYSTEM
  ↳ Team & Users
  ↳ Settings
────────────────────────────
[Avatar] [User name] [Role]
```

---

## 4. Dashboard Principal

### 4.1 Estructura de la página

```
DASHBOARD
├── Greeting bar: "Buenos días, [name]" + fecha + quick action buttons
│
├── KPI Row (6 cards)
│   ├── New Leads (este mes)        [+delta vs mes anterior]
│   ├── Active Clients              [total]
│   ├── Active Projects             [en curso]
│   ├── Open Tickets                [sin resolver]
│   ├── Monthly Revenue             [MRR o ingresos del mes]
│   └── Products Deployed           [total activos]
│
├── Middle Row (3 cols)
│   ├── Lead Pipeline (mini kanban — top 5 por etapa)
│   ├── Projects Health (lista compacta con status badges)
│   └── Revenue Chart (línea — últimos 6 meses)
│
├── Bottom Row (2 cols)
│   ├── Recent Activity Feed
│   │   (últimas 20 acciones del equipo)
│   └── Open Tickets (lista con prioridad + cliente)
│
└── Producto Spotlight (Talkaris / Auctorio)
    Métricas de alto nivel de productos activos
```

### 4.2 KPI Cards

Cada card incluye:
- Icono + label
- Valor principal (grande, bold)
- Delta vs período anterior (+12% ↑ / -5% ↓)
- Enlace a la sección completa

### 4.3 Widgets futuros (placeholders visibles)

- **Lead Scoring AI** — "Próximamente: scoring automático de leads con IA"
- **Client Health Score** — Indicador de salud de la relación con cada cliente
- **Auto-Reports** — Generación automática de reportes para clientes
- **Automation Metrics** — Panel de métricas de automatizaciones activas

---

## 5. Módulo Leads

### 5.1 Pipeline View
- Tablero Kanban con columnas: New → Contacted → Qualified → Proposal → Negotiation → Won / Lost
- Cards con: nombre, empresa, email, fecha de entrada, assigned to
- Drag & drop entre etapas
- Quick actions en hover: Call, Email, Convert to Client, Archive

### 5.2 All Leads (table)
Columnas: Name | Company | Source | Status | Score | Assigned | Created | Actions

Filtros: Source, Status, Assigned to, Date range

### 5.3 Lead Detail
- Header: nombre, empresa, estado (badge editable inline)
- Tabs: Overview | Activity | Notes | Files
- Sidebar derecha: Quick actions, Assigned to, Tags, Source
- Timeline de actividad (llamadas, emails, cambios de estado)
- Botón prominent: "Convert to Client"

### 5.4 Lead Sources
- Tabla con fuentes + conteo + conversión %
- Gráfico: distribución por canal

---

## 6. Módulo Clients

### 6.1 All Clients
- Tabla con: Logo/Avatar | Name | Type | Tier | Projects | Open Tickets | MRR | Status
- Filtros: Tier, Status, Service type
- View toggle: Table | Cards

### 6.2 Client Detail
```
CLIENT: [Name]          [Status badge]     [Tier badge]

[Edit] [New Project] [New Invoice] [New Ticket]

TABS:
Overview | Projects | Finance | Products | Support | Documents | Activity

─── OVERVIEW ───
Info card: email, phone, billing email, address
Contacts list (primary contact destacado)
Key metrics: total invoiced, open projects, last activity

─── PROJECTS ───
Lista de proyectos con status + health + deadline + progress bar

─── FINANCE ───
Resumen: Total Invoiced | Paid | Outstanding | Overdue
Lista de facturas con estado

─── PRODUCTS ───
Cards de Talkaris/Auctorio deployments:
  [Talkaris Bot] Active | 3 bots | [Open Talkaris →]
  [Auctorio Pub] Active | 12 articles | [Open Auctorio →]

─── SUPPORT ───
Tickets abiertos + historial

─── DOCUMENTS ───
Archivos compartidos con el cliente
```

### 6.3 Companies
- Tabla: Company | Domain | Sector | Clients | Projects
- Company detail: info + linked clients + contacts

### 6.4 Contacts
- Directorio de contactos cross-client
- Filtros por empresa, rol
- Contact card con info + historial de interacciones

---

## 7. Módulo Projects

### 7.1 Active Projects
- Vista Kanban por etapa: Discovery → Planning → Active → Review → Completed
- Cards: nombre proyecto, cliente (avatar), health badge, deadline, assigned team

### 7.2 All Projects (table)
Columnas: Project | Client | Type | Status | Health | Start | Deadline | Budget | Actions

### 7.3 Project Detail
```
PROJECT: [Name]          [Status] [Health]

[Client: X] [Type badge] [Edit] [Archive]

TABS:
Overview | Roadmap | Tasks | Finance | Team | Documents | Activity

─── OVERVIEW ───
Description, dates, budget vs invoiced progress bar
Linked product deployments

─── ROADMAP ───
Timeline view con milestones
Cada milestone: nombre, fecha, status, deliverables

─── TASKS ───
Kanban: Backlog | To Do | In Progress | Review | Done
Task cards con: título, assignee avatar, priority dot, due date

─── FINANCE ───
Budget breakdown: Presupuestado vs Facturado vs Cobrado

─── DOCUMENTS ───
Archivos del proyecto (visible/no visible para cliente)
```

### 7.4 Tasks
- Lista global de todas las tareas
- Filtros: Project, Assignee, Status, Priority, Due date
- Quick create inline

---

## 8. Módulo Products

### 8.1 Talkaris Overview
```
TALKARIS DEPLOYMENTS

[+ New Deployment]

Cliente A — [Active] — 3 bots activos — desplegado 2025-10-12
  Último sync: hace 2h | [Open Talkaris →]

Cliente B — [Inactive] — 0 bots — sin datos
  [Configure]

─────────────────────────────
NOTA: Las funcionalidades internas de Talkaris (gestión de flows,
intents, training, etc.) se gestionan directamente en la plataforma
Talkaris. Aquí solo se muestra el estado de despliegue y uso.
```

### 8.2 Deployment Card
- Cliente asociado
- Estado: Active | Inactive | Maintenance | Deploying
- Métricas: bots activos, conversaciones/mes (si API disponible)
- Fecha despliegue + entorno (production/staging)
- Enlace directo al panel de Talkaris/Auctorio
- Enlace al proyecto relacionado (si existe)

### 8.3 Auctorio Overview
- Mismo patrón que Talkaris
- Métricas: artículos publicados, proyectos editoriales activos
- Enlace directo al panel de Auctorio

---

## 9. Módulo Support

### 9.1 Tickets
```
TICKETS

Filtros rápidos: All | Open | In Progress | Waiting Client | Resolved

# | Subject | Client | Priority | Type | Assigned | Status | Updated
───────────────────────────────────────────────────────────────────────
#045 | API no responde | Cliente A | 🔴 Critical | Bug | @user | Open | 2h ago
#044 | Nueva funcionalidad | Cliente B | 🟡 Medium | Request | @user | In Progress | 1d ago
```

### 9.2 Ticket Detail
- Header: subject, cliente, prioridad, tipo, estado
- Timeline de mensajes (estilo chat + notas internas)
- Panel lateral: info del cliente, proyecto relacionado, SLA countdown
- Acciones: Assign, Change status, Add note, Resolve, Close

---

## 10. Módulo Finance

### 10.1 Invoices
- Lista con filtros: Status (All/Draft/Sent/Paid/Overdue), Cliente, Fecha
- Columnas: # | Client | Amount | Status | Issued | Due | Actions
- Actions: Send, Mark Paid, Download PDF, Duplicate

### 10.2 Invoice Detail
- Header: número, cliente, estado (badge grande)
- Line items table
- Totals: subtotal, tax, total
- Payment history
- Actions: Send email, Mark paid, Add note

### 10.3 Payments
- Tabla de pagos recibidos con referencia, cliente, factura asociada, método, fecha

### 10.4 Contracts
- Lista con: # | Client | Type | Value | Status | Start | End | Actions
- Contract Detail con PDF viewer/link + firma digital (futuro)

### 10.5 Finance Dashboard (top de sección)
```
MRR: $X,XXX    |    Outstanding: $X,XXX    |    Overdue: $XXX

Revenue Chart (6 meses) | Invoices by Status (donut)
```

---

## 11. Módulo Analytics

### 11.1 Business Metrics
- Revenue: MRR, total billed, outstanding, overdue
- Leads: total, por fuente, conversion rate, average deal size
- Clients: total activos, new this month, churn
- Projects: on track %, delivery on time %

### 11.2 Client Metrics
- Por cliente: total invested, projects completed, tickets resolved
- Satisfaction score (futuro)

---

## 12. Módulo Blog (existente, mejorado)

El blog actual se mantiene pero se integra en la navegación admin como subsección de "Insights".
- Lista de posts mejorada (con status badges, preview image)
- Editor mejorado con vista previa
- Métricas básicas de posts (vistas, si disponible)

---

## 13. Módulo Users & Roles

### 13.1 Team Members
- Tabla: Avatar | Name | Email | Role | Last active | Actions
- Invite by email
- Roles: admin, manager, editor, agent, viewer

### 13.2 Client Users
- Usuarios con role `client` — acceso al portal cliente
- Tabla: Name | Email | Client | Last login | Status

### 13.3 Roles & Permissions
- Matriz visual de permisos por rol
- Edición de permisos custom (futuro)

---

## 14. Módulo Settings

### 14.1 Workspace
- Nombre, logo, zona horaria, moneda por defecto

### 14.2 Integrations
```
Talkaris
  API URL: [_______________]  [Test Connection]
  API Key: [••••••••••••••]  [Regenerate]
  Status: Connected ✓
  Last sync: hace 2h

Auctorio
  [mismo patrón]

Google OAuth
  Client ID: [existente]
  Status: Connected ✓
```

### 14.3 API Keys
- Generar/revocar API keys para integraciones externas (como el token de Auctorio Publisher existente)

### 14.4 Notifications
- Configurar qué notificaciones recibe cada rol
- Preferencias de email

### 14.5 Feature Flags
- Toggle de funcionalidades (existente: auth, blog, contact, scraper)

---

## 15. Ruta de Implementación

### Fase A — Fundación (MVP Admin)
1. Migrar DB con entidades core (Leads, Clients, Projects)
2. Rediseñar layout del admin: sidebar nueva, topbar, routing
3. Implementar Dashboard con KPIs básicos
4. CRUD completo de Leads con pipeline view
5. CRUD completo de Clients con detalle
6. CRUD completo de Projects

### Fase B — Operaciones
7. Módulo Finance (Invoices, Payments, Contracts)
8. Módulo Support (Tickets)
9. Módulo Documents
10. Módulo Users con roles expanded

### Fase C — Integraciones
11. Módulo Products (Talkaris + Auctorio deployments)
12. Integration settings
13. Sync de métricas desde APIs externas

### Fase D — Portal Cliente
14. Rutas y autenticación para role `client`
15. Portal cliente completo
16. Notificaciones

### Fase E — Analytics & AI
17. Analytics dashboard
18. Lead scoring placeholder
19. Auto-reports placeholder
