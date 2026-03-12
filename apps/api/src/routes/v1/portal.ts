import { Router, type NextFunction, type Response } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../../auth/middleware.js";
import { pool } from "../../db/pool.js";

const router = Router();

type PortalRequest = AuthedRequest & {
  portalClientId?: string;
  portalClientName?: string;
};

function requirePortal(req: PortalRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    void (async () => {
      if (!req.user) {
        res.status(401).json({ code: "UNAUTHENTICATED", message: "Missing session" });
        return;
      }

      if (req.user.role !== "client") {
        res.status(403).json({ code: "FORBIDDEN", message: "Client role required" });
        return;
      }

      if (!req.user.clientId) {
        res.status(403).json({
          code: "CLIENT_NOT_ASSIGNED",
          message: "This client account is not linked to a customer record",
        });
        return;
      }

      const { rows } = await pool.query<{ id: string; name: string }>(
        `SELECT id, name
         FROM clients
         WHERE id = $1
         LIMIT 1`,
        [req.user.clientId]
      );

      if (!rows.length) {
        res.status(404).json({ code: "CLIENT_NOT_FOUND", message: "Client not found" });
        return;
      }

      req.portalClientId = rows[0].id;
      req.portalClientName = rows[0].name;
      next();
    })().catch(() => {
      res.status(500).json({ error: "Internal error" });
    });
  });
}

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

router.post("/tickets", requirePortal, async (req: PortalRequest, res) => {
  const schema = z.object({
    title:       z.string().min(1),
    description: z.string().optional().nullable(),
    category:    z.enum(["general", "bug", "feature", "billing", "access", "other"]).default("general"),
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
