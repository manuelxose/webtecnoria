import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../../auth/middleware.js";
import { pool } from "../../db/pool.js";

const router = Router();

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
   .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");

const ProjectSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  type: z.enum(["web_dev","automation","ai_system","chatbot","saas","consulting","custom"]).default("custom"),
  status: z.enum(["discovery","planning","active","paused","review","completed","cancelled"]).default("discovery"),
  priority: z.enum(["low","medium","high","critical"]).default("medium"),
  health: z.enum(["on_track","at_risk","off_track"]).default("on_track"),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  budget: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  client_id: z.string().uuid(),
  lead_id: z.string().uuid().optional().nullable(),
});

const UpdateProjectSchema = ProjectSchema.partial().omit({ client_id: true });

const MilestoneSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.enum(["pending","in_progress","completed","cancelled"]).default("pending"),
  due_date: z.string().optional().nullable(),
  sort_order: z.number().int().default(0),
});

const TaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.enum(["backlog","todo","in_progress","review","done"]).default("backlog"),
  priority: z.enum(["low","medium","high","critical"]).default("medium"),
  due_date: z.string().optional().nullable(),
  estimated_hours: z.number().optional().nullable(),
  milestone_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  sort_order: z.number().int().default(0),
});

// GET /projects
router.get("/", requireAdmin, async (req, res) => {
  const { status, client_id, health, page = "1", pageSize = "30" } = req.query;
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (status && status !== "all") { conditions.push(`p.status = $${idx++}`); params.push(status); }
  if (client_id)                  { conditions.push(`p.client_id = $${idx++}`); params.push(client_id); }
  if (health && health !== "all") { conditions.push(`p.health = $${idx++}`); params.push(health); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (Number(page) - 1) * Number(pageSize);

  try {
    const [rows, countRow] = await Promise.all([
      pool.query(
        `SELECT p.*, c.name AS client_name
         FROM projects p
         LEFT JOIN clients c ON c.id = p.client_id
         ${where}
         ORDER BY p.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, Number(pageSize), offset]
      ),
      pool.query(`SELECT COUNT(*) FROM projects p ${where}`, params),
    ]);

    res.json({ items: rows.rows, total: Number(countRow.rows[0].count), page: Number(page), pageSize: Number(pageSize) });
  } catch (err) {
    console.error("[projects] list error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to fetch projects" });
  }
});

// GET /projects/:id
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const [projectRow, milestonesRow, tasksRow] = await Promise.all([
      pool.query(
        `SELECT p.*, c.name AS client_name FROM projects p
         LEFT JOIN clients c ON c.id = p.client_id
         WHERE p.id = $1`,
        [req.params.id]
      ),
      pool.query("SELECT * FROM milestones WHERE project_id = $1 ORDER BY sort_order, due_date", [req.params.id]),
      pool.query(
        `SELECT t.*, u.display_name AS assigned_name
         FROM tasks t LEFT JOIN users u ON u.id = t.assigned_to
         WHERE t.project_id = $1 ORDER BY t.sort_order, t.created_at`,
        [req.params.id]
      ),
    ]);

    if (!projectRow.rows[0]) {
      res.status(404).json({ code: "NOT_FOUND", message: "Project not found" });
      return;
    }

    res.json({ ...projectRow.rows[0], milestones: milestonesRow.rows, tasks: tasksRow.rows });
  } catch (err) {
    console.error("[projects] get error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to fetch project" });
  }
});

// POST /projects
router.post("/", requireAdmin, async (req, res) => {
  const parsed = ProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: parsed.error.message });
    return;
  }

  const d = parsed.data;
  const slug = d.slug?.trim() || slugify(d.name);

  try {
    const result = await pool.query(
      `INSERT INTO projects
         (name, slug, description, type, status, priority, health,
          start_date, end_date, deadline, budget, notes, client_id, lead_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        d.name, slug, d.description ?? null, d.type, d.status, d.priority, d.health,
        d.start_date ?? null, d.end_date ?? null, d.deadline ?? null,
        d.budget ?? null, d.notes ?? null, d.client_id, d.lead_id ?? null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ code: "CONFLICT", message: "Slug already in use" });
      return;
    }
    console.error("[projects] create error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to create project" });
  }
});

// PUT /projects/:id
router.put("/:id", requireAdmin, async (req, res) => {
  const parsed = UpdateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: parsed.error.message });
    return;
  }

  const d = parsed.data;
  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  const fieldMap: Record<string, unknown> = {
    name: d.name, slug: d.slug, description: d.description,
    type: d.type, status: d.status, priority: d.priority, health: d.health,
    start_date: d.start_date, end_date: d.end_date, deadline: d.deadline,
    budget: d.budget, notes: d.notes, lead_id: d.lead_id,
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
      `UPDATE projects SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
      params
    );

    if (!result.rows[0]) {
      res.status(404).json({ code: "NOT_FOUND", message: "Project not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("[projects] update error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to update project" });
  }
});

// DELETE /projects/:id
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM projects WHERE id = $1 RETURNING id", [req.params.id]);

    if (!result.rows[0]) {
      res.status(404).json({ code: "NOT_FOUND", message: "Project not found" });
      return;
    }

    res.json({ deleted: true });
  } catch (err) {
    console.error("[projects] delete error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to delete project" });
  }
});

// ─── MILESTONES ───────────────────────────────────────────────────────────────

router.post("/:id/milestones", requireAdmin, async (req, res) => {
  const parsed = MilestoneSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: parsed.error.message });
    return;
  }

  const d = parsed.data;

  try {
    const result = await pool.query(
      `INSERT INTO milestones (name, description, status, due_date, sort_order, project_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [d.name, d.description ?? null, d.status, d.due_date ?? null, d.sort_order, req.params.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("[projects] create milestone error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to create milestone" });
  }
});

// ─── TASKS ────────────────────────────────────────────────────────────────────

router.post("/:id/tasks", requireAdmin, async (req, res) => {
  const parsed = TaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: parsed.error.message });
    return;
  }

  const d = parsed.data;

  try {
    const result = await pool.query(
      `INSERT INTO tasks
         (title, description, status, priority, due_date, estimated_hours,
          milestone_id, assigned_to, sort_order, project_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        d.title, d.description ?? null, d.status, d.priority,
        d.due_date ?? null, d.estimated_hours ?? null,
        d.milestone_id ?? null, d.assigned_to ?? null,
        d.sort_order, req.params.id,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("[projects] create task error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to create task" });
  }
});

router.patch("/tasks/:taskId/status", requireAdmin, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["backlog","todo","in_progress","review","done"];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ code: "INVALID_INPUT", message: "Invalid status" });
    return;
  }

  try {
    const result = await pool.query(
      "UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.taskId]
    );

    if (!result.rows[0]) {
      res.status(404).json({ code: "NOT_FOUND", message: "Task not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("[projects] update task status error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to update task" });
  }
});

export default router;
