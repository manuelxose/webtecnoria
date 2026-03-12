import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireAdmin } from "../../auth/middleware.js";
import { pool } from "../../db/pool.js";

const router = Router();

const UserRoleSchema = z.enum(["admin", "editor", "viewer", "client"]);
const InviteUserRoleSchema = z.enum(["admin", "editor", "client"]);

const InviteUserSchema = z.object({
  email:     z.string().email(),
  full_name: z.string().optional().nullable(),
  role:      InviteUserRoleSchema.default("editor"),
  client_id: z.string().uuid().optional().nullable(),
});

const UpdateUserSchema = z.object({
  full_name:  z.string().optional().nullable(),
  role:       UserRoleSchema.optional(),
  avatar_url: z.string().url().optional().nullable(),
  client_id:  z.string().uuid().optional().nullable(),
});

function validateClientAssignment(role: z.infer<typeof UserRoleSchema>, clientId?: string | null) {
  if (role === "client" && !clientId) {
    return "Client users require a linked client_id";
  }

  if (role !== "client" && clientId) {
    return "Only client users can be linked to a client";
  }

  return null;
}

// GET /users — list users
router.get("/", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id,
             u.email,
             u.full_name,
             u.role,
             u.avatar_url,
             u.client_id,
             c.name AS client_name,
             u.created_at,
             u.updated_at
      FROM users u
      LEFT JOIN clients c ON c.id = u.client_id
      ORDER BY u.created_at ASC
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
      `SELECT u.id,
              u.email,
              u.full_name,
              u.role,
              u.avatar_url,
              u.client_id,
              c.name AS client_name,
              u.created_at,
              u.updated_at
       FROM users u
       LEFT JOIN clients c ON c.id = u.client_id
       WHERE u.id = $1`,
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
  const currentUserId = (req as any).user?.id;

  if (req.params.id === currentUserId && d.role && d.role !== "admin") {
    return res.status(403).json({ error: "Cannot downgrade your own role" });
  }

  try {
    const existingQuery = await pool.query<{
      role: z.infer<typeof UserRoleSchema>;
      client_id: string | null;
    }>(
      `SELECT role, client_id
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [req.params.id]
    );

    if (!existingQuery.rowCount) {
      return res.status(404).json({ error: "Not found" });
    }

    const existing = existingQuery.rows[0];
    const nextRole = d.role ?? existing.role;
    const nextClientId =
      "client_id" in d
        ? d.client_id ?? null
        : nextRole === "client"
          ? existing.client_id
          : null;

    const clientAssignmentError = validateClientAssignment(nextRole, nextClientId);
    if (clientAssignmentError) {
      return res.status(400).json({ error: clientAssignmentError });
    }

    const fields: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if ("full_name"  in d) { fields.push(`full_name = $${idx++}`);  params.push(d.full_name ?? null); }
    if ("role"       in d) { fields.push(`role = $${idx++}`);       params.push(d.role); }
    if ("avatar_url" in d) { fields.push(`avatar_url = $${idx++}`); params.push(d.avatar_url ?? null); }
    if ("client_id" in d || d.role !== undefined) {
      fields.push(`client_id = $${idx++}`);
      params.push(nextClientId);
    }

    if (!fields.length) return res.status(400).json({ error: "No fields to update" });

    params.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE users
       SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING id, email, full_name, role, avatar_url, client_id, created_at, updated_at`,
      params
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const clientNameQuery = rows[0].client_id
      ? await pool.query<{ name: string }>(
          `SELECT name FROM clients WHERE id = $1 LIMIT 1`,
          [rows[0].client_id]
        )
      : null;

    res.json({
      ...rows[0],
      client_name: clientNameQuery?.rows[0]?.name ?? null,
    });
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

  const clientAssignmentError = validateClientAssignment(d.role, d.client_id ?? null);
  if (clientAssignmentError) {
    return res.status(400).json({ error: clientAssignmentError });
  }

  const tempPassword = Math.random().toString(36).slice(-10);
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (email, full_name, role, password_hash, client_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, avatar_url, client_id, created_at, updated_at`,
      [d.email, d.full_name ?? null, d.role, passwordHash, d.client_id ?? null]
    );

    const clientNameQuery = rows[0].client_id
      ? await pool.query<{ name: string }>(
          `SELECT name FROM clients WHERE id = $1 LIMIT 1`,
          [rows[0].client_id]
        )
      : null;

    res.status(201).json({
      ...rows[0],
      client_name: clientNameQuery?.rows[0]?.name ?? null,
      temp_password: tempPassword,
    });
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
