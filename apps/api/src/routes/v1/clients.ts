import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../../auth/middleware.js";
import { pool } from "../../db/pool.js";

const router = Router();

const ClientSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["company","individual"]).default("company"),
  status: z.enum(["active","inactive","churned"]).default("active"),
  tier: z.enum(["starter","professional","enterprise"]).default("starter"),
  billing_email: z.string().email().optional().nullable(),
  fiscal_name: z.string().optional().nullable(),
  tax_id: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  country: z.string().default("ES"),
  city: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  company_id: z.string().uuid().optional().nullable(),
});

const UpdateClientSchema = ClientSchema.partial();

const ContactSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().default(""),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  is_primary: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  company_id: z.string().uuid().optional().nullable(),
});

// GET /clients
router.get("/", requireAdmin, async (req, res) => {
  const { status, tier, page = "1", pageSize = "30", q } = req.query;
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (status && status !== "all") { conditions.push(`c.status = $${idx++}`); params.push(status); }
  if (tier && tier !== "all")     { conditions.push(`c.tier = $${idx++}`);   params.push(tier); }
  if (q) { conditions.push(`c.name ILIKE $${idx++}`); params.push(`%${q}%`); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (Number(page) - 1) * Number(pageSize);

  try {
    const [rows, countRow] = await Promise.all([
      pool.query(
        `SELECT c.*,
           (SELECT COUNT(*) FROM projects p WHERE p.client_id = c.id AND p.status NOT IN ('completed','cancelled')) AS active_projects_count
         FROM clients c
         ${where}
         ORDER BY c.name ASC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, Number(pageSize), offset]
      ),
      pool.query(`SELECT COUNT(*) FROM clients c ${where}`, params),
    ]);

    res.json({ items: rows.rows, total: Number(countRow.rows[0].count), page: Number(page), pageSize: Number(pageSize) });
  } catch (err) {
    console.error("[clients] list error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to fetch clients" });
  }
});

// GET /clients/:id
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const [clientRow, contactsRow, projectsRow] = await Promise.all([
      pool.query("SELECT * FROM clients WHERE id = $1", [req.params.id]),
      pool.query(
        "SELECT * FROM contacts WHERE client_id = $1 ORDER BY is_primary DESC, first_name ASC",
        [req.params.id]
      ),
      pool.query(
        "SELECT id, name, status, health, deadline, priority FROM projects WHERE client_id = $1 ORDER BY created_at DESC",
        [req.params.id]
      ),
    ]);

    if (!clientRow.rows[0]) {
      res.status(404).json({ code: "NOT_FOUND", message: "Client not found" });
      return;
    }

    res.json({
      ...clientRow.rows[0],
      contacts: contactsRow.rows,
      projects: projectsRow.rows,
    });
  } catch (err) {
    console.error("[clients] get error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to fetch client" });
  }
});

// POST /clients
router.post("/", requireAdmin, async (req, res) => {
  const parsed = ClientSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: parsed.error.message });
    return;
  }

  const d = parsed.data;
  try {
    const result = await pool.query(
      `INSERT INTO clients
         (name, type, status, tier, billing_email, fiscal_name, tax_id,
          address, country, city, website, notes, tags, company_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        d.name, d.type, d.status, d.tier, d.billing_email ?? null,
        d.fiscal_name ?? null, d.tax_id ?? null, d.address ?? null,
        d.country, d.city ?? null, d.website ?? null, d.notes ?? null,
        d.tags, d.company_id ?? null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("[clients] create error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to create client" });
  }
});

// PUT /clients/:id
router.put("/:id", requireAdmin, async (req, res) => {
  const parsed = UpdateClientSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: parsed.error.message });
    return;
  }

  const d = parsed.data;
  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  const fieldMap: Record<string, unknown> = {
    name: d.name, type: d.type, status: d.status, tier: d.tier,
    billing_email: d.billing_email, fiscal_name: d.fiscal_name, tax_id: d.tax_id,
    address: d.address, country: d.country, city: d.city,
    website: d.website, notes: d.notes, tags: d.tags, company_id: d.company_id,
  };

  for (const [col, val] of Object.entries(fieldMap)) {
    if (val !== undefined) { sets.push(`${col} = $${idx++}`); params.push(val); }
  }

  if (!sets.length) {
    res.status(400).json({ code: "INVALID_INPUT", message: "No fields to update" });
    return;
  }

  params.push(req.params.id);

  try {
    const result = await pool.query(
      `UPDATE clients SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
      params
    );

    if (!result.rows[0]) {
      res.status(404).json({ code: "NOT_FOUND", message: "Client not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("[clients] update error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to update client" });
  }
});

// DELETE /clients/:id
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM clients WHERE id = $1 RETURNING id", [req.params.id]);

    if (!result.rows[0]) {
      res.status(404).json({ code: "NOT_FOUND", message: "Client not found" });
      return;
    }

    res.json({ deleted: true });
  } catch (err) {
    console.error("[clients] delete error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to delete client" });
  }
});

// ─── CONTACTS sub-resource ────────────────────────────────────────────────────

// GET /clients/:id/contacts
router.get("/:id/contacts", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM contacts WHERE client_id = $1 ORDER BY is_primary DESC, first_name ASC",
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("[clients] contacts error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to fetch contacts" });
  }
});

// POST /clients/:id/contacts
router.post("/:id/contacts", requireAdmin, async (req, res) => {
  const parsed = ContactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: parsed.error.message });
    return;
  }

  const d = parsed.data;

  try {
    if (d.is_primary) {
      await pool.query("UPDATE contacts SET is_primary = FALSE WHERE client_id = $1", [req.params.id]);
    }

    const result = await pool.query(
      `INSERT INTO contacts (first_name, last_name, email, phone, role, is_primary, notes, client_id, company_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [d.first_name, d.last_name, d.email ?? null, d.phone ?? null,
       d.role ?? null, d.is_primary, d.notes ?? null, req.params.id, d.company_id ?? null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("[clients] create contact error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to create contact" });
  }
});

export default router;
