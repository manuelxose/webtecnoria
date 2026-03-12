# Client Portal Guide

The Tecnoria client portal gives your clients a secure, read-only (and support-enabled) view of their account — projects, invoices, and support tickets — without exposing the full admin backend.

## Access URL

```
https://your-domain.com/portal
```

## How it Works

1. Admin generates a **portal token** for a client
2. Token is shared with the client (copy/paste or email)
3. Client visits `/portal`, enters the token
4. Token is saved in `localStorage` — client stays logged in until they log out or the token expires

## Generating a Portal Token (Admin)

1. Go to `/dashboard/clients/:id`
2. Click the **Portal** tab
3. Click **Generar token**
4. Optionally set a label (e.g., "Main contact") and expiry date
5. Copy the token and share it securely with the client

You can create multiple tokens per client (e.g., one per contact person). Each token can be revoked independently.

## Client Experience

Once logged in, clients can:

### Dashboard (`/portal/dashboard`)
- Overview of active projects and their health
- Pending invoices with amounts
- Open support tickets

### Projects (`/portal/projects`)
- List of all projects (active, completed, cancelled)
- Project status, health, description, and dates

### Invoices (`/portal/invoices`)
- Full invoice history
- Download button if a file URL is attached
- Overdue invoices highlighted

### Support (`/portal/tickets`)
- View all support tickets
- Create new support requests
- Track ticket status

## Security

- Tokens are 64-character hex strings (256 bits of entropy)
- Stored as plaintext in the DB for lookup (consider hashing for higher security deployments)
- Tokens can be revoked at any time by an admin
- Optional expiry date per token
- `last_used_at` tracked for audit purposes

## Customisation

The portal uses inline styles (not the admin design system), so it can be branded separately. The `PortalLayoutComponent` shows the client's name in the sidebar header.
