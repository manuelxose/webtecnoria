import "dotenv/config";
import bcrypt from "bcryptjs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import admin from "firebase-admin";
import { pool } from "../db/pool.js";

type MaybeTimestamp = {
  toDate?: () => Date;
  seconds?: number;
};

async function main(): Promise<void> {
  const app = await initFirebaseAdmin();
  const firestore = app.firestore();
  const auth = app.auth();

  // eslint-disable-next-line no-console
  console.log("Starting Firebase -> PostgreSQL migration...");

  await migrateUsers(auth);
  await migrateBlogPosts(firestore);
  await migrateContactMessages(firestore);
  await migrateScraperJobs(firestore);

  await pool.end();
  // eslint-disable-next-line no-console
  console.log("Migration finished.");
}

async function initFirebaseAdmin(): Promise<admin.app.App> {
  if (admin.apps.length > 0) return admin.app();

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    const absolutePath = path.resolve(serviceAccountPath);
    const raw = await readFile(absolutePath, "utf8");
    const json = JSON.parse(raw);
    return admin.initializeApp({
      credential: admin.credential.cert(json),
    });
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase credentials. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY."
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

async function migrateUsers(auth: admin.auth.Auth): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("Migrating users...");

  let pageToken: string | undefined;

  do {
    const page = await auth.listUsers(1000, pageToken);
    for (const user of page.users) {
      if (!user.email) continue;

      const roleFromClaims = String(user.customClaims?.role ?? "viewer");
      const role =
        roleFromClaims === "admin" ||
        roleFromClaims === "editor" ||
        roleFromClaims === "viewer"
          ? roleFromClaims
          : "viewer";

      const placeholderPassword = await bcrypt.hash(`firebase:${user.uid}`, 10);

      await pool.query(
        `INSERT INTO users (email, password_hash, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (email)
         DO UPDATE SET role = EXCLUDED.role, updated_at = NOW()`,
        [user.email, placeholderPassword, role]
      );
    }
    pageToken = page.pageToken;
  } while (pageToken);
}

async function migrateBlogPosts(
  firestore: admin.firestore.Firestore
): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("Migrating blog posts...");

  const snapshot = await firestore.collection("blog").get();
  for (const doc of snapshot.docs) {
    const data = doc.data() as Record<string, unknown>;

    const title = String(data.title ?? "");
    const slug = slugify(title || String(data.slug ?? doc.id));
    if (!slug || !title) continue;

    const shortDescription = String(data.shortDescription ?? "");
    const contentValue = data.content;
    const content =
      typeof contentValue === "string"
        ? contentValue
        : JSON.stringify(contentValue ?? "");
    const image = data.image ? String(data.image) : null;
    const tagsRaw = data.tags;
    const tags = Array.isArray(tagsRaw)
      ? tagsRaw.map((tag) => String(tag))
      : tagsRaw
      ? [String(tagsRaw)]
      : [];
    const author = String(data.author ?? "TecnoRia");
    const createdAt = toIso(data.createdAt ?? data.date) ?? new Date().toISOString();
    const updatedAt =
      toIso(data.updatedAt ?? data.date ?? data.createdAt) ??
      new Date().toISOString();

    await pool.query(
      `INSERT INTO blog_posts
        (slug, title, short_description, content, image, tags, author, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (slug)
       DO UPDATE SET
         title = EXCLUDED.title,
         short_description = EXCLUDED.short_description,
         content = EXCLUDED.content,
         image = EXCLUDED.image,
         tags = EXCLUDED.tags,
         author = EXCLUDED.author,
         updated_at = EXCLUDED.updated_at`,
      [
        slug,
        title,
        shortDescription,
        content,
        image,
        tags,
        author,
        createdAt,
        updatedAt,
      ]
    );
  }
}

async function migrateContactMessages(
  firestore: admin.firestore.Firestore
): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("Migrating contact messages...");

  const snapshot = await firestore.collection("contacto").get();
  for (const doc of snapshot.docs) {
    const data = doc.data() as Record<string, unknown>;

    const name = String(data.name ?? "");
    const email = String(data.email ?? "");
    const message = String(data.message ?? "");
    if (!name || !email || !message) continue;

    const phone = data.phone ? String(data.phone) : null;
    const company = data.company
      ? String(data.company)
      : data.empresa
      ? String(data.empresa)
      : null;
    const service1 = data.service1 ? String(data.service1) : null;
    const service2 = data.service2 ? String(data.service2) : null;
    const createdAt = toIso(data.createdAt ?? data.date) ?? new Date().toISOString();

    await pool.query(
      `INSERT INTO contact_messages
        (name, email, phone, company, service_1, service_2, message, created_at)
       SELECT $1,$2,$3,$4,$5,$6,$7,$8
       WHERE NOT EXISTS (
         SELECT 1
         FROM contact_messages
         WHERE name = $1
           AND email = $2
           AND message = $7
           AND created_at = $8::timestamptz
       )`,
      [name, email, phone, company, service1, service2, message, createdAt]
    );
  }
}

async function migrateScraperJobs(
  firestore: admin.firestore.Firestore
): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("Migrating scraper jobs...");

  const snapshot = await firestore.collection("scraper_jobs").get();
  for (const doc of snapshot.docs) {
    const data = doc.data() as Record<string, unknown>;
    const query = String(data.query ?? "");
    if (!query) continue;

    const status = normalizeJobStatus(String(data.status ?? "queued"));
    const resultUrl = data.resultUrl ? String(data.resultUrl) : null;
    const createdAt = toIso(data.createdAt) ?? new Date().toISOString();
    const updatedAt = toIso(data.updatedAt ?? data.createdAt) ?? createdAt;

    await pool.query(
      `INSERT INTO scraper_jobs
        (query, status, result_url, created_at, updated_at)
       SELECT $1,$2,$3,$4,$5
       WHERE NOT EXISTS (
         SELECT 1
         FROM scraper_jobs
         WHERE query = $1
           AND status = $2
           AND COALESCE(result_url, '') = COALESCE($3, '')
           AND created_at = $4::timestamptz
       )`,
      [query, status, resultUrl, createdAt, updatedAt]
    );
  }
}

function toIso(value: unknown): string | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  const maybeTimestamp = value as MaybeTimestamp;
  if (typeof maybeTimestamp.toDate === "function") {
    return maybeTimestamp.toDate().toISOString();
  }

  if (typeof maybeTimestamp.seconds === "number") {
    return new Date(maybeTimestamp.seconds * 1000).toISOString();
  }

  return null;
}

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

function normalizeJobStatus(status: string): "queued" | "running" | "done" | "failed" {
  if (status === "running" || status === "done" || status === "failed") {
    return status;
  }
  return "queued";
}

main().catch(async (error: unknown) => {
  // eslint-disable-next-line no-console
  console.error("Firebase migration failed:", error);
  await pool.end();
  process.exit(1);
});
