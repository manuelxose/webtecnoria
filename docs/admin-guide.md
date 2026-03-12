# Tecnoria Admin — User Guide

## Accessing the Admin

Navigate to `/dashboard`. You need an admin or editor account. Contact your system administrator for access.

---

## CRM — Pipeline

### Leads

**Path:** `/dashboard/leads`

Leads are potential clients captured from web forms, manual entry, Talkaris chatbots, or imports.

- **Pipeline view** — Kanban-style columns by status (Nuevo → Contactado → Cualificado → Propuesta → Negociación → Ganado/Perdido)
- **Table view** — Sortable list with filters
- **Convert to client** — From a lead's detail page, convert it into a client record

**Lead statuses:** `new` → `contacted` → `qualified` → `proposal` → `negotiation` → `won` / `lost`

### Clients

**Path:** `/dashboard/clients`

Client records represent active (or past) business relationships.

- Filter by status (Activo / Inactivo / Churned) and tier (Starter / Professional / Enterprise)
- Each client has associated **contacts**, **projects**, **invoices**, and **tickets**
- Generate **portal access tokens** from the client detail page to give clients access to their portal

### Companies

**Path:** `/dashboard/companies` *(coming soon)*

---

## Delivery — Projects

**Path:** `/dashboard/projects`

Manage project delivery across all clients.

- **Health indicators:** On Track (green) / At Risk (yellow) / Off Track (red)
- **Milestones** — define key delivery phases
- **Tasks** — individual work items with priority, assignee, and status
- Link projects to clients and contracts

---

## Finance

### Overview

**Path:** `/dashboard/finance`

Revenue dashboard showing:
- Revenue this month vs last month (% delta)
- Pending and overdue invoices
- 6-month revenue bar chart

### Contracts

**Path:** `/dashboard/finance/contracts`

Manage client contracts. Statuses: `Borrador` → `Enviado` → `Firmado` / `Cancelado`.

- Upload document URL
- Mark as signed with one click

### Invoices

**Path:** `/dashboard/finance/invoices`

Full invoice lifecycle management:
- Create invoices with line items, tax rate, due date
- Send to client (status: `sent`)
- Mark as paid (records payment method and reference)
- Automatic overdue detection (rows highlighted in yellow when past due date)

**Invoice numbering:** Auto-generated as `INV-YYYY-NNNN`

---

## Support — Tickets

**Path:** `/dashboard/support`

Handle client support requests.

- **Priority levels:** Baja / Media / Alta / Crítica
- **Categories:** General / Bug / Solicitud de funcionalidad / Facturación / Acceso / Otro
- **Sources:** Manual / Email / Portal (client-submitted) / Talkaris

From the ticket detail:
- Reply to clients (visible messages) or add internal notes (admin-only)
- Change status with one click: Abierto → En curso → En espera → Resuelto → Cerrado

---

## Products

### Talkaris

**Path:** `/dashboard/products/talkaris`

Overview of the Talkaris chatbot platform — active bots, conversation stats, integrations.

### Auctorio

**Path:** `/dashboard/products/auctorio`

Overview of the Auctorio AI editorial cockpit — article generation stats, SEO metrics.

---

## Analytics

**Path:** `/dashboard/analytics`

Advanced metrics:
- Monthly revenue chart (last 12 months)
- Invoice breakdown by status
- Lead conversion funnel
- Top 5 clients by revenue
- Project type distribution
- Ticket resolution stats

---

## Sistema

### Team / Users

**Path:** `/dashboard/users`

Manage team members:
- **Roles:** Admin (full access) / Editor (create & edit) / Viewer (read-only)
- **Invite** new users — generates a temporary password
- Role changes take effect immediately

### Settings

**Path:** `/dashboard/settings`

- Update your profile (name, avatar)
- Toggle Light / Dark mode
- Workspace info

---

## Client Portal

Clients access their dedicated portal at `/portal`.

### Granting portal access

1. Go to the client's detail page: `/dashboard/clients/:id`
2. Navigate to the **Portal** tab
3. Click **Generar token** to create an access token
4. Share the token with the client
5. The client visits `/portal`, enters the token, and accesses their dashboard

### What clients can do in the portal

- View active projects and their health status
- Download invoices and see payment status
- Submit support tickets
- View existing tickets and their status

---

## Keyboard Shortcuts (planned)

| Shortcut | Action |
|----------|--------|
| `G L` | Go to Leads |
| `G C` | Go to Clients |
| `G P` | Go to Projects |
| `G F` | Go to Finance |
| `G S` | Go to Support |
| `/` | Search (planned) |
