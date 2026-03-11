import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { type Request, Router } from "express";
import multer from "multer";
import { z } from "zod";
import { hasEditorialAccess, requireAdminOrIntegration } from "../../auth/middleware.js";
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
  status: z.enum(["draft", "publish"]).default("draft"),
  publishedAt: z.string().datetime().nullable().optional(),
  seoTitle: z.string().trim().min(2).optional(),
  seoDescription: z.string().trim().min(2).optional(),
});

router.get("/", async (req, res) => {
  const status = String(req.query.status ?? "").trim().toLowerCase();
  const canReadDrafts = hasEditorialAccess(req);
  let where = "WHERE status = 'publish'";
  const values: unknown[] = [];

  if (canReadDrafts) {
    if (!status || status === "all") {
      where = "";
    } else if (status === "draft" || status === "publish") {
      where = "WHERE status = $1";
      values.push(status);
    } else {
      res.status(400).json({ code: "INVALID_QUERY", message: "status must be all, draft or publish" });
      return;
    }
  }

  const query = await pool.query(
    `SELECT
       id,
       slug,
       title,
       short_description AS "shortDescription",
       image,
       tags,
       author,
       status,
       published_at AS "publishedAt",
       seo_title AS "seoTitle",
       seo_description AS "seoDescription",
       created_at AS "createdAt",
       updated_at AS "updatedAt"
     FROM blog_posts
     ${where}
     ORDER BY COALESCE(published_at, created_at) DESC, created_at DESC`,
    values
  );
  res.json({ items: query.rows });
});

router.post(
  "/upload-image",
  requireAdminOrIntegration,
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
  const canReadDrafts = hasEditorialAccess(req);
  const query = await pool.query(
    `SELECT
       id,
       slug,
       title,
       short_description AS "shortDescription",
       content,
       image,
       tags,
       author,
       status,
       published_at AS "publishedAt",
       seo_title AS "seoTitle",
       seo_description AS "seoDescription",
       created_at AS "createdAt",
       updated_at AS "updatedAt"
     FROM blog_posts
     WHERE slug = $1
       ${canReadDrafts ? "" : "AND status = 'publish'"}
     LIMIT 1`,
    [req.params.slug]
  );
  if (query.rowCount === 0) {
    res.status(404).json({ code: "NOT_FOUND", message: "Post not found" });
    return;
  }
  res.json(query.rows[0]);
});

router.post("/", requireAdminOrIntegration, async (req, res) => {
  const parsed = BlogWriteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: "Invalid payload" });
    return;
  }
  const body = parsed.data;
  const query = await pool.query(
    `INSERT INTO blog_posts (
       slug, title, short_description, content, image, tags, author, status, published_at, seo_title, seo_description
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING id, slug, status`,
    [
      body.slug,
      body.title,
      body.shortDescription,
      body.content,
      body.image ?? null,
      body.tags,
      body.author,
      body.status,
      body.status === "publish" ? body.publishedAt ?? new Date().toISOString() : null,
      body.seoTitle ?? null,
      body.seoDescription ?? null,
    ]
  );
  res.status(201).json(query.rows[0]);
});

router.put("/:id", requireAdminOrIntegration, async (req, res) => {
  const parsed = BlogWriteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: "Invalid payload" });
    return;
  }
  const body = parsed.data;
  const query = await pool.query(
    `UPDATE blog_posts
     SET slug = $1,
         title = $2,
         short_description = $3,
         content = $4,
         image = $5,
         tags = $6,
         author = $7,
         status = $8,
         published_at = CASE
           WHEN $8 = 'publish' THEN COALESCE($9::timestamptz, published_at, NOW())
           ELSE NULL
         END,
         seo_title = $10,
         seo_description = $11,
         updated_at = NOW()
     WHERE id = $12
     RETURNING id, slug, status`,
    [
      body.slug,
      body.title,
      body.shortDescription,
      body.content,
      body.image ?? null,
      body.tags,
      body.author,
      body.status,
      body.publishedAt ?? null,
      body.seoTitle ?? null,
      body.seoDescription ?? null,
      req.params.id,
    ]
  );
  if (query.rowCount === 0) {
    res.status(404).json({ code: "NOT_FOUND", message: "Post not found" });
    return;
  }
  res.status(200).json(query.rows[0]);
});

router.delete("/:id", requireAdminOrIntegration, async (req, res) => {
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
