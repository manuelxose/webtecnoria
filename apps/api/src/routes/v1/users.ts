import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireAdmin } from "../../auth/middleware.js";
import { pool } from "../../db/pool.js";

const router = Router();

const InviteUserSchema = z.object({
  email:     z.string().email(),
  full_name: z.string().optional().nullable(),
  role:      z.enum(["admin", "editor", "viewer"]).default("viewer"),
});

const UpdateUserSchema = z.object({
  full_name:  z.string().optional().nullable(),
  role:       z.enum(["admin", "editor", "viewer"]).optional(),
  avatar_url: z.string().url().optional().nullable(),
});

// GET /users — list non-client users
router.get("/", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, email, full_name, role, avatar_url, created_at, updated_at
      FROM users
      WHERE role IN ('admin', 'editor', 'viewer')
      ORDER BY created_at ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

// GET /users/:id — get single user
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, full_name, role, avatar_url, created_at, updated_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

// PUT /users/:id — update user
router.put("/:id", requireAdmin, async (req, res) => {
  const parsed = UpdateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;

  // Cannot downgrade own role
  const currentUserId = (req as any).user?.id;
  if (req.params.id === currentUserId && d.role && d.role !== "admin") {
    return res.status(403).json({ error: "Cannot downgrade your own role" });
  }

  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if ("full_name"  in d) { fields.push(`full_name = $${idx++}`);  params.push(d.full_name ?? null); }
  if ("role"       in d) { fields.push(`role = $${idx++}`);       params.push(d.role); }
  if ("avatar_url" in d) { fields.push(`avatar_url = $${idx++}`); params.push(d.avatar_url ?? null); }

  if (!fields.length) return res.status(400).json({ error: "No fields to update" });

  params.push(req.params.id);
  try {
    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx} RETURNING id, email, full_name, role, avatar_url, created_at, updated_at`,
      params
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

// DELETE /users/:id — delete user (cannot self-delete)
router.delete("/:id", requireAdmin, async (req, res) => {
  const currentUserId = (req as any).user?.id;
  if (req.params.id === currentUserId) {
    return res.status(403).json({ error: "Cannot delete your own account" });
  }
  try {
    await pool.query(`DELETE FROM users WHERE id = $1`, [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

// POST /users/invite — create new user with temp password
router.post("/invite", requireAdmin, async (req, res) => {
  const parsed = InviteUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;

  const tempPassword = Math.random().toString(36).slice(-10);
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (email, full_name, role, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, avatar_url, created_at, updated_at`,
      [d.email, d.full_name ?? null, d.role, passwordHash]
    );
    res.status(201).json({ ...rows[0], temp_password: tempPassword });
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
