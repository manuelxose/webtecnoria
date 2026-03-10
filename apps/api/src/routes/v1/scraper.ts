import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../../auth/middleware.js";
import { pool } from "../../db/pool.js";

const router = Router();

const CreateJobSchema = z.object({
  query: z.string().min(3),
});

router.post("/jobs", requireAdmin, async (req, res) => {
  const parsed = CreateJobSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: "Invalid payload" });
    return;
  }
  const query = await pool.query(
    "INSERT INTO scraper_jobs (query, status) VALUES ($1, 'queued') RETURNING id, status, created_at AS \"createdAt\"",
    [parsed.data.query]
  );
  res.status(201).json(query.rows[0]);
});

router.get("/jobs/:id", requireAdmin, async (req, res) => {
  const query = await pool.query(
    "SELECT id, query, status, result_url AS \"resultUrl\", created_at AS \"createdAt\", updated_at AS \"updatedAt\" FROM scraper_jobs WHERE id = $1 LIMIT 1",
    [req.params.id]
  );
  if (query.rowCount === 0) {
    res.status(404).json({ code: "NOT_FOUND", message: "Job not found" });
    return;
  }
  res.json(query.rows[0]);
});

export default router;
