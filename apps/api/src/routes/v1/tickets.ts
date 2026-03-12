import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../../auth/middleware.js";
import { pool } from "../../db/pool.js";

const router = Router();

const TicketSchema = z.object({
  title:       z.string().min(1),
  description: z.string().optional().nullable(),
  status:      z.enum(["open","in_progress","waiting","resolved","closed"]).default("open"),
  priority:    z.enum(["low","medium","high","critical"]).default("medium"),
  category:    z.enum(["general","bug","feature","billing","access","other"]).default("general"),
  source:      z.enum(["manual","email","portal","talkaris","other"]).default("manual"),
  client_id:   z.string().uuid(),
  project_id:  z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
});

const UpdateTicketSchema = TicketSchema.partial().omit({ client_id: true });

const MessageSchema = z.object({
  content:     z.string().min(1),
  author_type: z.enum(["admin","client","system"]).default("admin"),
  author_name: z.string().optional().nullable(),
  is_internal: z.boolean().default(false),
});

// GET /tickets/stats
router.get("/stats", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status IN ('open','in_progress','waiting'))         AS open_count,
        COUNT(*) FILTER (WHERE status = 'open')                                    AS new_count,
        COUNT(*) FILTER (WHERE priority IN ('high','critical') AND status NOT IN ('resolved','closed')) AS urgent_count,
        COUNT(*) FILTER (WHERE status IN ('resolved','closed'))                    AS resolved_count,
        COUNT(*) FILTER (WHERE status = 'resolved' AND resolved_at >= now() - interval '30 days') AS resolved_this_month
      FROM tickets
    `);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

// GET /tickets
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { status, priority, client_id, page = "1", pageSize = "20" } = req.query as Record<string,string>;
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (status)    { conditions.push(`t.status = $${idx++}`);    params.push(status); }
    if (priority)  { conditions.push(`t.priority = $${idx++}`);  params.push(priority); }
    if (client_id) { conditions.push(`t.client_id = $${idx++}`); params.push(client_id); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const offset = (Number(page) - 1) * Number(pageSize);

    const [{ rows }, { rows: countRows }] = await Promise.all([
      pool.query(`
        SELECT t.*,
               c.name AS client_name,
               p.name AS project_name,
               u.full_name AS assigned_name,
               (SELECT COUNT(*) FROM ticket_messages tm WHERE tm.ticket_id = t.id AND tm.is_internal = false) AS message_count
        FROM tickets t
        LEFT JOIN clients  c ON c.id = t.client_id
        LEFT JOIN projects p ON p.id = t.project_id
        LEFT JOIN users    u ON u.id = t.assigned_to
        ${where}
        ORDER BY
          CASE t.priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
          t.created_at DESC
        LIMIT $${idx} OFFSET $${idx+1}
      `, [...params, Number(pageSize), offset]),
      pool.query(`SELECT COUNT(*) FROM tickets t ${where}`, params),
    ]);

    res.json({ items: rows, total: Number(countRows[0].count), page: Number(page), pageSize: Number(pageSize) });
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

// GET /tickets/:id
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.*,
             c.name AS client_name,
             p.name AS project_name,
             u.full_name AS assigned_name
      FROM tickets t
      LEFT JOIN clients  c ON c.id = t.client_id
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN users    u ON u.id = t.assigned_to
      WHERE t.id = $1
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const { rows: messages } = await pool.query(
      `SELECT * FROM ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );

    res.json({ ...rows[0], messages });
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

// POST /tickets
router.post("/", requireAdmin, async (req, res) => {
  const parsed = TicketSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;
  try {
    const { rows } = await pool.query(`
      INSERT INTO tickets (title, description, status, priority, category, source, client_id, project_id, assigned_to)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `, [d.title, d.description ?? null, d.status, d.priority, d.category, d.source, d.client_id, d.project_id ?? null, d.assigned_to ?? null]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

// PUT /tickets/:id
router.put("/:id", requireAdmin, async (req, res) => {
  const parsed = UpdateTicketSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;

  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  const allowed = ["title","description","status","priority","category","source","project_id","assigned_to"] as const;
  for (const key of allowed) {
    if (key in d) { fields.push(`${key} = $${idx++}`); params.push((d as Record<string,unknown>)[key] ?? null); }
  }
  if (!fields.length) return res.status(400).json({ error: "No fields to update" });

  // Auto-set resolved_at when marking resolved/closed
  if (d.status === "resolved" || d.status === "closed") {
    fields.push(`resolved_at = COALESCE(resolved_at, now())`);
  }

  params.push(req.params.id);
  try {
    const { rows } = await pool.query(
      `UPDATE tickets SET ${fields.join(",")} WHERE id = $${idx} RETURNING *`,
      params
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

// DELETE /tickets/:id
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query(`DELETE FROM tickets WHERE id = $1`, [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

// POST /tickets/:id/messages
router.post("/:id/messages", requireAdmin, async (req, res) => {
  const parsed = MessageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;
  try {
    const { rows } = await pool.query(`
      INSERT INTO ticket_messages (ticket_id, content, author_type, author_name, is_internal)
      VALUES ($1,$2,$3,$4,$5) RETURNING *
    `, [req.params.id, d.content, d.author_type, d.author_name ?? null, d.is_internal]);
    // bump ticket updated_at
    await pool.query(`UPDATE tickets SET updated_at = now() WHERE id = $1`, [req.params.id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
