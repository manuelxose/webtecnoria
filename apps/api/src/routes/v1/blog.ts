import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { type Request, Router } from "express";
import multer from "multer";
import { z } from "zod";
import { requireAdmin } from "../../auth/middleware.js";
import { env } from "../../config/env.js";
import { pool } from "../../db/pool.js";

const router = Router();
const blogUploadsDir = path.resolve(env.UPLOADS_DIR, "blog");
type UploadRequest = Request & { file?: Express.Multer.File };

if (!fs.existsSync(blogUploadsDir)) {
  fs.mkdirSync(blogUploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (
      _req: Request,
      _file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void
    ) => cb(null, blogUploadsDir),
    filename: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void
    ) => {
      const extension = path.extname(file.originalname) || ".bin";
      const originalName = path.basename(file.originalname, extension);
      const safeName = slugify(originalName || "image");
      cb(
        null,
        `${Date.now()}-${crypto.randomUUID()}-${safeName}${extension.toLowerCase()}`
      );
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const BlogWriteSchema = z.object({
  slug: z.string().min(3),
  title: z.string().min(3),
  shortDescription: z.string().min(3),
  content: z.string().min(3),
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  author: z.string().min(1),
});

router.get("/", async (_req, res) => {
  const query = await pool.query(
    "SELECT id, slug, title, short_description AS \"shortDescription\", image, tags, author, created_at AS \"createdAt\", updated_at AS \"updatedAt\" FROM blog_posts ORDER BY created_at DESC"
  );
  res.json({ items: query.rows });
});

router.post(
  "/upload-image",
  requireAdmin,
  upload.single("file"),
  async (req: UploadRequest, res) => {
    if (!req.file) {
      res.status(400).json({ code: "INVALID_INPUT", message: "Missing file" });
      return;
    }

    res.status(201).json({
      url: `/uploads/blog/${req.file.filename}`,
      name: req.file.filename,
    });
  }
);

router.get("/:slug", async (req, res) => {
  const query = await pool.query(
    "SELECT id, slug, title, short_description AS \"shortDescription\", content, image, tags, author, created_at AS \"createdAt\", updated_at AS \"updatedAt\" FROM blog_posts WHERE slug = $1 LIMIT 1",
    [req.params.slug]
  );
  if (query.rowCount === 0) {
    res.status(404).json({ code: "NOT_FOUND", message: "Post not found" });
    return;
  }
  res.json(query.rows[0]);
});

router.post("/", requireAdmin, async (req, res) => {
  const parsed = BlogWriteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: "Invalid payload" });
    return;
  }
  const body = parsed.data;
  const query = await pool.query(
    "INSERT INTO blog_posts (slug, title, short_description, content, image, tags, author) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
    [body.slug, body.title, body.shortDescription, body.content, body.image ?? null, body.tags, body.author]
  );
  res.status(201).json({ id: query.rows[0].id });
});

router.put("/:id", requireAdmin, async (req, res) => {
  const parsed = BlogWriteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: "Invalid payload" });
    return;
  }
  const body = parsed.data;
  const query = await pool.query(
    "UPDATE blog_posts SET slug = $1, title = $2, short_description = $3, content = $4, image = $5, tags = $6, author = $7, updated_at = NOW() WHERE id = $8",
    [body.slug, body.title, body.shortDescription, body.content, body.image ?? null, body.tags, body.author, req.params.id]
  );
  if (query.rowCount === 0) {
    res.status(404).json({ code: "NOT_FOUND", message: "Post not found" });
    return;
  }
  res.status(204).send();
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const query = await pool.query("DELETE FROM blog_posts WHERE id = $1", [req.params.id]);
  if (query.rowCount === 0) {
    res.status(404).json({ code: "NOT_FOUND", message: "Post not found" });
    return;
  }
  res.status(204).send();
});

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default router;
