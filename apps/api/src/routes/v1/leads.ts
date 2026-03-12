import { Router } from "express";
import { z } from "zod";
import { requireAdmin, type AuthedRequest } from "../../auth/middleware.js";
import { pool } from "../../db/pool.js";

const router = Router();

const LeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  source: z.enum(["web_form","manual","import","referral","talkaris","auctorio","other"]).default("manual"),
  status: z.enum(["new","contacted","qualified","proposal","negotiation","won","lost"]).default("new"),
  score: z.number().int().min(0).max(100).default(0),
  notes: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  assigned_to: z.string().uuid().optional().nullable(),
});

const UpdateLeadSchema = LeadSchema.partial();

// GET /leads — list with filters
router.get("/", requireAdmin, async (req: AuthedRequest, res) => {
  const { status, source, assigned_to, page = "1", pageSize = "30" } = req.query;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (status && status !== "all") {
    conditions.push(`l.status = $${idx++}`);
    params.push(status);
  }
  if (source && source !== "all") {
    conditions.push(`l.source = $${idx++}`);
    params.push(source);
  }
  if (assigned_to) {
    conditions.push(`l.assigned_to = $${idx++}`);
    params.push(assigned_to);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (Number(page) - 1) * Number(pageSize);

  try {
    const [rows, countRow] = await Promise.all([
      pool.query(
        `SELECT l.*, u.display_name AS assigned_name
         FROM leads l
         LEFT JOIN users u ON u.id = l.assigned_to
         ${where}
         ORDER BY l.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, Number(pageSize), offset]
      ),
      pool.query(`SELECT COUNT(*) FROM leads l ${where}`, params),
    ]);

    res.json({
      items: rows.rows,
      total: Number(countRow.rows[0].count),
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (err) {
    console.error("[leads] list error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to fetch leads" });
  }
});

// GET /leads/stats — pipeline counts + source breakdown
router.get("/stats", requireAdmin, async (_req, res) => {
  try {
    const [statusRows, sourceRows] = await Promise.all([
      pool.query(`SELECT status, COUNT(*) AS count FROM leads GROUP BY status`),
      pool.query(`SELECT source, COUNT(*) AS count FROM leads GROUP BY source`),
    ]);

    res.json({
      byStatus: statusRows.rows,
      bySource: sourceRows.rows,
    });
  } catch (err) {
    console.error("[leads] stats error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to fetch lead stats" });
  }
});

// GET /leads/:id
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, u.display_name AS assigned_name
       FROM leads l
       LEFT JOIN users u ON u.id = l.assigned_to
       WHERE l.id = $1`,
      [req.params.id]
    );

    if (!result.rows[0]) {
      res.status(404).json({ code: "NOT_FOUND", message: "Lead not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("[leads] get error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to fetch lead" });
  }
});

// POST /leads
router.post("/", requireAdmin, async (req: AuthedRequest, res) => {
  const parsed = LeadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: parsed.error.message });
    return;
  }

  const d = parsed.data;
  try {
    const result = await pool.query(
      `INSERT INTO leads
         (name, email, phone, company_name, source, status, score, notes,
          utm_source, utm_medium, utm_campaign, assigned_to)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        d.name, d.email, d.phone ?? null, d.company_name ?? null,
        d.source, d.status, d.score, d.notes ?? null,
        d.utm_source ?? null, d.utm_medium ?? null, d.utm_campaign ?? null,
        d.assigned_to ?? null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("[leads] create error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to create lead" });
  }
});

// PUT /leads/:id
router.put("/:id", requireAdmin, async (req, res) => {
  const parsed = UpdateLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: parsed.error.message });
    return;
  }

  const d = parsed.data;
  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  const fieldMap: Record<string, unknown> = {
    name: d.name, email: d.email, phone: d.phone,
    company_name: d.company_name, source: d.source, status: d.status,
    score: d.score, notes: d.notes, utm_source: d.utm_source,
    utm_medium: d.utm_medium, utm_campaign: d.utm_campaign,
    assigned_to: d.assigned_to,
  };

  for (const [col, val] of Object.entries(fieldMap)) {
    if (val !== undefined) {
      sets.push(`${col} = $${idx++}`);
      params.push(val);
    }
  }

  if (!sets.length) {
    res.status(400).json({ code: "INVALID_INPUT", message: "No fields to update" });
    return;
  }

  params.push(req.params.id);

  try {
    const result = await pool.query(
      `UPDATE leads SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
      params
    );

    if (!result.rows[0]) {
      res.status(404).json({ code: "NOT_FOUND", message: "Lead not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("[leads] update error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to update lead" });
  }
});

// POST /leads/:id/convert — convert to client
router.post("/:id/convert", requireAdmin, async (req: AuthedRequest, res) => {
  const lead = await pool.query("SELECT * FROM leads WHERE id = $1", [req.params.id]);
  if (!lead.rows[0]) {
    res.status(404).json({ code: "NOT_FOUND", message: "Lead not found" });
    return;
  }

  const l = lead.rows[0];

  try {
    await pool.query("BEGIN");

    const clientResult = await pool.query(
      `INSERT INTO clients (name, billing_email, notes, lead_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [l.company_name || l.name, l.email, l.notes, l.id]
    );

    await pool.query(
      `INSERT INTO contacts (first_name, last_name, email, phone, is_primary, client_id)
       VALUES ($1, '', $2, $3, TRUE, $4)`,
      [l.name, l.email, l.phone ?? null, clientResult.rows[0].id]
    );

    await pool.query(
      `UPDATE leads SET status = 'won', converted_at = NOW() WHERE id = $1`,
      [l.id]
    );

    await pool.query("COMMIT");
    res.status(201).json(clientResult.rows[0]);
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("[leads] convert error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to convert lead" });
  }
});

// DELETE /leads/:id
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM leads WHERE id = $1 RETURNING id", [req.params.id]);

    if (!result.rows[0]) {
      res.status(404).json({ code: "NOT_FOUND", message: "Lead not found" });
      return;
    }

    res.json({ deleted: true });
  } catch (err) {
    console.error("[leads] delete error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to delete lead" });
  }
});

export default router;
