# Client Portal Guide

The Tecnoria client portal gives your clients a secure, read-only (and support-enabled) view of their account — projects, invoices, and support tickets — without exposing the full admin backend.

## Access URL

```
https://your-domain.com/portal
```

## How it Works

1. Admin creates a private user with role `client` and links it to a `client_id`
2. The client signs in at `/portal` with email/password or Google
3. The same secure `HttpOnly` session cookie used by the private area is reused for the portal
4. Portal routes only accept authenticated users with role `client`

## Creating a Portal User (Admin)

1. Go to `/dashboard/users`
2. Click **Invitar usuario**
3. Select **Cliente**
4. Link the account to the target client record
5. Share the temporary password securely with the client

Legacy `portal_tokens` are deprecated and are no longer used by the live portal flow.

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

- Portal access is scoped by the authenticated user's `client_id`
- Sessions are stored in an `HttpOnly` cookie, not in `localStorage`
- Only users with role `client` can access `/portal/*`
- Admin/editor users are redirected back to `/dashboard`

## Customisation

The portal uses inline styles (not the admin design system), so it can be branded separately. The `PortalLayoutComponent` shows the client's name in the sidebar header.
