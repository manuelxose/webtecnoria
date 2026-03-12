import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../../auth/middleware.js";
import { pool } from "../../db/pool.js";

const router = Router();

const ContractSchema = z.object({
  title: z.string().min(1),
  status: z.enum(["draft", "sent", "signed", "cancelled"]).default("draft"),
  amount: z.number().min(0).default(0),
  currency: z.string().length(3).default("EUR"),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  signed_at: z.string().optional().nullable(),
  file_url: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  client_id: z.string().uuid(),
  project_id: z.string().uuid().optional().nullable(),
});

const UpdateContractSchema = ContractSchema.partial().omit({ client_id: true });

// GET /contracts
router.get("/", requireAdmin, async (req, res) => {
  const { status, client_id, page = "1", pageSize = "30" } = req.query;
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (status && status !== "all") { conditions.push(`c.status = $${idx++}`); params.push(status); }
  if (client_id)                  { conditions.push(`c.client_id = $${idx++}`); params.push(client_id); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (Number(page) - 1) * Number(pageSize);

  try {
    const [rows, countRow] = await Promise.all([
      pool.query(
        `SELECT c.*, cl.name AS client_name, p.name AS project_name
         FROM contracts c
         LEFT JOIN clients cl ON cl.id = c.client_id
         LEFT JOIN projects p  ON p.id  = c.project_id
         ${where}
         ORDER BY c.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, Number(pageSize), offset]
      ),
      pool.query(`SELECT COUNT(*) FROM contracts c ${where}`, params),
    ]);

    res.json({ items: rows.rows, total: Number(countRow.rows[0].count), page: Number(page), pageSize: Number(pageSize) });
  } catch (err) {
    console.error("[contracts] list error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to fetch contracts" });
  }
});

// GET /contracts/:id
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, cl.name AS client_name, p.name AS project_name
       FROM contracts c
       LEFT JOIN clients cl ON cl.id = c.client_id
       LEFT JOIN projects p  ON p.id  = c.project_id
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) { res.status(404).json({ code: "NOT_FOUND", message: "Contract not found" }); return; }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("[contracts] get error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to fetch contract" });
  }
});

// POST /contracts
router.post("/", requireAdmin, async (req, res) => {
  const parsed = ContractSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ code: "INVALID_INPUT", message: parsed.error.message }); return; }

  const d = parsed.data;
  try {
    const result = await pool.query(
      `INSERT INTO contracts (title, status, amount, currency, start_date, end_date, signed_at, file_url, notes, client_id, project_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [d.title, d.status, d.amount, d.currency, d.start_date ?? null, d.end_date ?? null,
       d.signed_at ?? null, d.file_url ?? null, d.notes ?? null, d.client_id, d.project_id ?? null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("[contracts] create error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to create contract" });
  }
});

// PUT /contracts/:id
router.put("/:id", requireAdmin, async (req, res) => {
  const parsed = UpdateContractSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ code: "INVALID_INPUT", message: parsed.error.message }); return; }

  const d = parsed.data;
  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  const fieldMap: Record<string, unknown> = {
    title: d.title, status: d.status, amount: d.amount, currency: d.currency,
    start_date: d.start_date, end_date: d.end_date, signed_at: d.signed_at,
    file_url: d.file_url, notes: d.notes, project_id: d.project_id,
  };

  for (const [col, val] of Object.entries(fieldMap)) {
    if (val !== undefined) { sets.push(`${col} = $${idx++}`); params.push(val); }
  }

  if (!sets.length) { res.status(400).json({ code: "INVALID_INPUT", message: "No fields to update" }); return; }
  params.push(req.params.id);

  try {
    const result = await pool.query(
      `UPDATE contracts SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
      params
    );
    if (!result.rows[0]) { res.status(404).json({ code: "NOT_FOUND", message: "Contract not found" }); return; }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("[contracts] update error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to update contract" });
  }
});

// DELETE /contracts/:id
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM contracts WHERE id = $1 RETURNING id", [req.params.id]);
    if (!result.rows[0]) { res.status(404).json({ code: "NOT_FOUND", message: "Contract not found" }); return; }
    res.json({ deleted: true });
  } catch (err) {
    console.error("[contracts] delete error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to delete contract" });
  }
});

export default router;
