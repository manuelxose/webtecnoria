import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../../auth/middleware.js";
import { pool } from "../../db/pool.js";

const router = Router();

const InvoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive().default(1),
  unit_price: z.number().min(0),
  sort_order: z.number().int().default(0),
});

const InvoiceSchema = z.object({
  status: z.enum(["draft", "sent", "viewed", "paid", "overdue", "cancelled"]).default("draft"),
  issue_date: z.string().default(() => new Date().toISOString().slice(0, 10)),
  due_date: z.string().optional().nullable(),
  tax_rate: z.number().min(0).max(100).default(21),
  currency: z.string().length(3).default("EUR"),
  notes: z.string().optional().nullable(),
  client_id: z.string().uuid(),
  project_id: z.string().uuid().optional().nullable(),
  contract_id: z.string().uuid().optional().nullable(),
  items: z.array(InvoiceItemSchema).min(1),
});

const UpdateInvoiceSchema = z.object({
  status: z.enum(["draft", "sent", "viewed", "paid", "overdue", "cancelled"]).optional(),
  issue_date: z.string().optional(),
  due_date: z.string().optional().nullable(),
  tax_rate: z.number().min(0).max(100).optional(),
  currency: z.string().length(3).optional(),
  notes: z.string().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  contract_id: z.string().uuid().optional().nullable(),
});

function calcTotals(items: { quantity: number; unit_price: number }[], taxRate: number) {
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const taxAmount = +(subtotal * (taxRate / 100)).toFixed(2);
  const total = +(subtotal + taxAmount).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), taxAmount, total };
}

// GET /invoices/stats
router.get("/stats", requireAdmin, async (_req, res) => {
  try {
    const [byStatus, monthlyRevenue, overdue] = await Promise.all([
      pool.query(`SELECT status, COUNT(*) AS count, COALESCE(SUM(total),0) AS amount FROM invoices GROUP BY status`),
      pool.query(
        `SELECT
           date_trunc('month', issue_date) AS month,
           COALESCE(SUM(total),0) AS revenue
         FROM invoices
         WHERE status = 'paid'
           AND issue_date >= NOW() - INTERVAL '6 months'
         GROUP BY 1 ORDER BY 1`
      ),
      pool.query(
        `SELECT COUNT(*) AS count, COALESCE(SUM(total),0) AS amount
         FROM invoices WHERE due_date < NOW() AND status NOT IN ('paid','cancelled')`
      ),
    ]);

    res.json({
      byStatus: byStatus.rows,
      monthlyRevenue: monthlyRevenue.rows,
      overdue: overdue.rows[0],
    });
  } catch (err) {
    console.error("[invoices] stats error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to fetch invoice stats" });
  }
});

// GET /invoices
router.get("/", requireAdmin, async (req, res) => {
  const { status, client_id, page = "1", pageSize = "30" } = req.query;
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (status && status !== "all") { conditions.push(`i.status = $${idx++}`); params.push(status); }
  if (client_id)                  { conditions.push(`i.client_id = $${idx++}`); params.push(client_id); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (Number(page) - 1) * Number(pageSize);

  try {
    const [rows, countRow] = await Promise.all([
      pool.query(
        `SELECT i.*, cl.name AS client_name, p.name AS project_name
         FROM invoices i
         LEFT JOIN clients  cl ON cl.id = i.client_id
         LEFT JOIN projects p  ON p.id  = i.project_id
         ${where}
         ORDER BY i.issue_date DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, Number(pageSize), offset]
      ),
      pool.query(`SELECT COUNT(*) FROM invoices i ${where}`, params),
    ]);

    res.json({ items: rows.rows, total: Number(countRow.rows[0].count), page: Number(page), pageSize: Number(pageSize) });
  } catch (err) {
    console.error("[invoices] list error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to fetch invoices" });
  }
});

// GET /invoices/:id
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const [invoiceRow, itemsRow] = await Promise.all([
      pool.query(
        `SELECT i.*, cl.name AS client_name, p.name AS project_name
         FROM invoices i
         LEFT JOIN clients  cl ON cl.id = i.client_id
         LEFT JOIN projects p  ON p.id  = i.project_id
         WHERE i.id = $1`,
        [req.params.id]
      ),
      pool.query(
        "SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY sort_order, created_at",
        [req.params.id]
      ),
    ]);

    if (!invoiceRow.rows[0]) { res.status(404).json({ code: "NOT_FOUND", message: "Invoice not found" }); return; }
    res.json({ ...invoiceRow.rows[0], items: itemsRow.rows });
  } catch (err) {
    console.error("[invoices] get error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to fetch invoice" });
  }
});

// POST /invoices
router.post("/", requireAdmin, async (req, res) => {
  const parsed = InvoiceSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ code: "INVALID_INPUT", message: parsed.error.message }); return; }

  const d = parsed.data;
  const { subtotal, taxAmount, total } = calcTotals(d.items, d.tax_rate);

  try {
    await pool.query("BEGIN");

    const invResult = await pool.query(
      `INSERT INTO invoices
         (status, issue_date, due_date, subtotal, tax_rate, tax_amount, total,
          currency, notes, client_id, project_id, contract_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [d.status, d.issue_date, d.due_date ?? null, subtotal, d.tax_rate, taxAmount, total,
       d.currency, d.notes ?? null, d.client_id, d.project_id ?? null, d.contract_id ?? null]
    );

    const invoice = invResult.rows[0];
    for (const [i, item] of d.items.entries()) {
      await pool.query(
        `INSERT INTO invoice_items (description, quantity, unit_price, sort_order, invoice_id)
         VALUES ($1,$2,$3,$4,$5)`,
        [item.description, item.quantity, item.unit_price, item.sort_order ?? i, invoice.id]
      );
    }

    await pool.query("COMMIT");
    res.status(201).json(invoice);
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("[invoices] create error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to create invoice" });
  }
});

// PUT /invoices/:id
router.put("/:id", requireAdmin, async (req, res) => {
  const parsed = UpdateInvoiceSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ code: "INVALID_INPUT", message: parsed.error.message }); return; }

  const d = parsed.data;
  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  const fieldMap: Record<string, unknown> = {
    status: d.status, issue_date: d.issue_date, due_date: d.due_date,
    tax_rate: d.tax_rate, currency: d.currency, notes: d.notes,
    project_id: d.project_id, contract_id: d.contract_id,
  };

  for (const [col, val] of Object.entries(fieldMap)) {
    if (val !== undefined) { sets.push(`${col} = $${idx++}`); params.push(val); }
  }

  if (!sets.length) { res.status(400).json({ code: "INVALID_INPUT", message: "No fields to update" }); return; }
  params.push(req.params.id);

  try {
    const result = await pool.query(
      `UPDATE invoices SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
      params
    );
    if (!result.rows[0]) { res.status(404).json({ code: "NOT_FOUND", message: "Invoice not found" }); return; }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("[invoices] update error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to update invoice" });
  }
});

// POST /invoices/:id/mark-paid — registra pago y marca como paid
router.post("/:id/mark-paid", requireAdmin, async (req, res) => {
  const { amount, method = "bank_transfer", reference, paid_at } = req.body;

  try {
    await pool.query("BEGIN");

    const invoice = await pool.query("SELECT * FROM invoices WHERE id = $1", [req.params.id]);
    if (!invoice.rows[0]) {
      await pool.query("ROLLBACK");
      res.status(404).json({ code: "NOT_FOUND", message: "Invoice not found" });
      return;
    }

    const paidAmount = amount ?? invoice.rows[0].total;
    const paidAt = paid_at ?? new Date().toISOString();

    await pool.query(
      `INSERT INTO payments (amount, currency, method, reference, paid_at, invoice_id)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [paidAmount, invoice.rows[0].currency, method, reference ?? null, paidAt, req.params.id]
    );

    const updated = await pool.query(
      `UPDATE invoices SET status = 'paid', paid_at = $1 WHERE id = $2 RETURNING *`,
      [paidAt, req.params.id]
    );

    await pool.query("COMMIT");
    res.json(updated.rows[0]);
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("[invoices] mark-paid error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to mark invoice as paid" });
  }
});

// DELETE /invoices/:id
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM invoices WHERE id = $1 RETURNING id", [req.params.id]);
    if (!result.rows[0]) { res.status(404).json({ code: "NOT_FOUND", message: "Invoice not found" }); return; }
    res.json({ deleted: true });
  } catch (err) {
    console.error("[invoices] delete error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to delete invoice" });
  }
});

export default router;
