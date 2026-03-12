# Tecnoria API Reference

Base URL: `https://your-domain.com/api/v1`

All admin endpoints require a valid session cookie (set on login). The portal endpoints use a Bearer token.

---

## Authentication

### POST /auth/login
Login with email and password.

**Body:** `{ email, password }`
**Response:** `{ id, email, displayName, role }`
Sets an `HttpOnly` session cookie.

### POST /auth/logout
Clears the session cookie.

### GET /auth/me
Returns the current authenticated user.

### POST /auth/password-recovery
Sends a password reset email.

**Body:** `{ email }`

---

## Leads

All endpoints require admin/editor role.

### GET /leads
List leads with optional filters.

**Query:** `status`, `source`, `q` (search), `page`, `pageSize`

### GET /leads/stats
Returns pipeline statistics by status.

### GET /leads/:id
Get a single lead.

### POST /leads
Create a lead.

**Body:** `{ name*, email, company_name, phone, source, status, value, notes, tags }`

### PUT /leads/:id
Update a lead.

### POST /leads/:id/convert
Convert lead to client. Returns `{ clientId }`.

### DELETE /leads/:id

---

## Clients

### GET /clients
**Query:** `status`, `tier`, `q`, `page`, `pageSize`

### GET /clients/:id
Includes `contacts[]` and `projects[]`.

### POST /clients
**Body:** `{ name*, type, tier, status, billing_email, fiscal_name, tax_id, address, country, city, website, notes, tags }`

### PUT /clients/:id

### DELETE /clients/:id

### GET /clients/:id/contacts

### POST /clients/:id/contacts
**Body:** `{ first_name*, last_name, email, phone, role, is_primary, notes }`

---

## Projects

### GET /projects
**Query:** `status`, `client_id`, `health`, `page`, `pageSize`

### GET /projects/:id
Includes `milestones[]` and `tasks[]`.

### POST /projects
**Body:** `{ name*, client_id*, type, status, priority, health, start_date, end_date, deadline, budget, notes }`

### PUT /projects/:id

### DELETE /projects/:id

### POST /projects/:id/milestones
**Body:** `{ name*, description, due_date, sort_order }`

### POST /projects/:id/tasks
**Body:** `{ title*, description, status, priority, due_date, milestone_id, assigned_to }`

### PATCH /projects/tasks/:taskId/status
**Body:** `{ status* }`

---

## Finance — Contracts

### GET /contracts
**Query:** `status`, `client_id`, `page`, `pageSize`

### GET /contracts/:id

### POST /contracts
**Body:** `{ title*, client_id*, project_id, status, amount, currency, start_date, end_date, file_url, notes }`

### PUT /contracts/:id

### DELETE /contracts/:id

---

## Finance — Invoices

### GET /invoices
**Query:** `status`, `client_id`, `page`, `pageSize`

### GET /invoices/stats
Returns: `{ paidTotal, pendingCount, pendingAmount, overdueCount, overdueAmount, draftCount, monthlyRevenue[] }`

### GET /invoices/:id
Includes `items[]`.

### POST /invoices
**Body:** `{ client_id*, project_id, contract_id, status, issue_date, due_date, tax_rate, currency, notes, items[] }`

### PUT /invoices/:id

### DELETE /invoices/:id

### POST /invoices/:id/mark-paid
**Body:** `{ payment_method, payment_reference, notes }`

---

## Support — Tickets

### GET /tickets
**Query:** `status`, `priority`, `client_id`, `page`, `pageSize`

### GET /tickets/stats
Returns: `{ open_count, new_count, urgent_count, resolved_count, resolved_this_month }`

### GET /tickets/:id
Includes `messages[]`.

### POST /tickets
**Body:** `{ title*, description, status, priority, category, source, client_id*, project_id, assigned_to }`

### PUT /tickets/:id

### DELETE /tickets/:id

### POST /tickets/:id/messages
**Body:** `{ content*, author_type, author_name, is_internal }`

---

## Analytics

### GET /analytics/dashboard
Main dashboard KPIs: leads, clients, projects, revenue, recent invoices.

### GET /analytics/advanced
Extended analytics: monthly revenue, lead funnel, top clients, ticket stats, invoice breakdown.

---

## Users

### GET /users

### GET /users/:id

### POST /users/invite
**Body:** `{ email*, full_name, role }`
**Response:** includes `temp_password`.

### PUT /users/:id
**Body:** `{ full_name, role, avatar_url }`

### DELETE /users/:id

---

## Client Portal

Portal endpoints use `Authorization: Bearer <token>` header.

### GET /portal/me
Validates token and returns client info.

### GET /portal/dashboard
Returns KPIs, active projects, pending invoices, open tickets.

### GET /portal/projects

### GET /portal/invoices

### GET /portal/tickets

### POST /portal/tickets
**Body:** `{ title*, description, category }`

### GET /portal/admin/tokens/:clientId *(admin)*
List portal tokens for a client.

### POST /portal/admin/tokens/:clientId *(admin)*
**Body:** `{ label, expires_at }`
Returns the new token.

### DELETE /portal/admin/tokens/:tokenId *(admin)*
Revokes a token.
