import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { requireAdmin } from "../../auth/middleware.js";
import { pool } from "../../db/pool.js";

const router = Router();

// ─── Portal auth middleware ───────────────────────────────────────────────────

type PortalRequest = Request & { portalClientId?: string; portalClientName?: string };

async function requirePortal(req: PortalRequest, res: Response, next: NextFunction): Promise<void> {
  const auth = req.headers.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : (req.query.token as string);
  if (!token) {
    res.status(401).json({ code: "UNAUTHENTICATED", message: "Missing portal token" });
    return;
  }
  try {
    const { rows } = await pool.query(`
      SELECT pt.client_id, c.name AS client_name
      FROM portal_tokens pt
      JOIN clients c ON c.id = pt.client_id
      WHERE pt.token = $1
        AND pt.revoked = false
        AND (pt.expires_at IS NULL OR pt.expires_at > now())
    `, [token]);
    if (!rows.length) {
      res.status(401).json({ code: "INVALID_TOKEN", message: "Invalid or expired portal token" });
      return;
    }
    req.portalClientId   = rows[0].client_id;
    req.portalClientName = rows[0].client_name;
    // Update last_used_at async (fire and forget)
    pool.query(`UPDATE portal_tokens SET last_used_at = now() WHERE token = $1`, [token]).catch(() => {});
    next();
  } catch {
    res.status(500).json({ error: "Internal error" });
  }
}

// ─── Admin: manage portal tokens ─────────────────────────────────────────────

// GET /portal/admin/tokens/:clientId — list tokens for a client
router.get("/admin/tokens/:clientId", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, label, token, expires_at, last_used_at, revoked, created_at
       FROM portal_tokens WHERE client_id = $1 ORDER BY created_at DESC`,
      [req.params.clientId]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Internal error" });
  }
});

// POST /portal/admin/tokens/:clientId — create a new portal token
router.post("/admin/tokens/:clientId", requireAdmin, async (req, res) => {
  const schema = z.object({
    label:      z.string().min(1).default("Acceso portal"),
    expires_at: z.string().datetime().optional().nullable(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const { rows } = await pool.query(
      `INSERT INTO portal_tokens (client_id, label, expires_at)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.params.clientId, parsed.data.label, parsed.data.expires_at ?? null]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: "Internal error" });
  }
});

// DELETE /portal/admin/tokens/:tokenId — revoke a token
router.delete("/admin/tokens/:tokenId", requireAdmin, async (req, res) => {
  try {
    await pool.query(`UPDATE portal_tokens SET revoked = true WHERE id = $1`, [req.params.tokenId]);
    res.status(204).end();
  } catch {
    res.status(500).json({ error: "Internal error" });
  }
});

// ─── Portal public API ────────────────────────────────────────────────────────

// GET /portal/me — validate token and return client info
router.get("/me", requirePortal, async (req: PortalRequest, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, type, tier, status, billing_email, website, city, country
       FROM clients WHERE id = $1`,
      [req.portalClientId]
    );
    if (!rows.length) return res.status(404).json({ error: "Client not found" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Internal error" });
  }
});

// GET /portal/dashboard — summary data
router.get("/dashboard", requirePortal, async (req: PortalRequest, res) => {
  const cid = req.portalClientId;
  try {
    const [projects, invoices, tickets] = await Promise.all([
      pool.query(
        `SELECT id, name, status, health, deadline, priority, type FROM projects
         WHERE client_id = $1 AND status NOT IN ('completed','cancelled')
         ORDER BY updated_at DESC LIMIT 5`,
        [cid]
      ),
      pool.query(
        `SELECT id, number, status, total, due_date, issue_date FROM invoices
         WHERE client_id = $1 AND status NOT IN ('cancelled','paid')
         ORDER BY issue_date DESC LIMIT 5`,
        [cid]
      ),
      pool.query(
        `SELECT id, number, title, status, priority, created_at FROM tickets
         WHERE client_id = $1 AND status NOT IN ('resolved','closed')
         ORDER BY created_at DESC LIMIT 5`,
        [cid]
      ),
    ]);
    const [totals] = await Promise.all([
      pool.query(
        `SELECT
          (SELECT COUNT(*) FROM projects WHERE client_id=$1 AND status NOT IN ('completed','cancelled')) AS active_projects,
          (SELECT COUNT(*) FROM invoices WHERE client_id=$1 AND status NOT IN ('paid','cancelled')) AS pending_invoices,
          (SELECT COALESCE(SUM(total),0) FROM invoices WHERE client_id=$1 AND status NOT IN ('paid','cancelled')) AS pending_amount,
          (SELECT COUNT(*) FROM tickets WHERE client_id=$1 AND status NOT IN ('resolved','closed')) AS open_tickets`,
        [cid]
      ),
    ]);
    res.json({
      kpis: totals.rows[0],
      activeProjects: projects.rows,
      pendingInvoices: invoices.rows,
      openTickets: tickets.rows,
    });
  } catch {
    res.status(500).json({ error: "Internal error" });
  }
});

// GET /portal/projects
router.get("/projects", requirePortal, async (req: PortalRequest, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, status, health, deadline, priority, type, start_date, end_date, description
       FROM projects WHERE client_id = $1 ORDER BY updated_at DESC`,
      [req.portalClientId]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Internal error" });
  }
});

// GET /portal/invoices
router.get("/invoices", requirePortal, async (req: PortalRequest, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT i.id, i.number, i.status, i.total, i.subtotal, i.tax_rate, i.tax_amount,
              i.due_date, i.issue_date, i.currency, i.notes, i.paid_at, i.file_url
       FROM invoices i WHERE i.client_id = $1 ORDER BY i.issue_date DESC`,
      [req.portalClientId]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Internal error" });
  }
});

// GET /portal/tickets
router.get("/tickets", requirePortal, async (req: PortalRequest, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.id, t.number, t.title, t.description, t.status, t.priority, t.category, t.created_at, t.resolved_at,
              (SELECT COUNT(*) FROM ticket_messages tm WHERE tm.ticket_id = t.id AND tm.is_internal = false) AS message_count
       FROM tickets t WHERE t.client_id = $1 ORDER BY t.created_at DESC`,
      [req.portalClientId]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Internal error" });
  }
});

// POST /portal/tickets — create ticket from portal
router.post("/tickets", requirePortal, async (req: PortalRequest, res) => {
  const schema = z.object({
    title:       z.string().min(1),
    description: z.string().optional().nullable(),
    category:    z.enum(["general","bug","feature","billing","access","other"]).default("general"),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;
  try {
    const { rows } = await pool.query(
      `INSERT INTO tickets (title, description, category, source, client_id, status, priority)
       VALUES ($1,$2,$3,'portal',$4,'open','medium') RETURNING id, number, title, status, priority, created_at`,
      [d.title, d.description ?? null, d.category, req.portalClientId]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
