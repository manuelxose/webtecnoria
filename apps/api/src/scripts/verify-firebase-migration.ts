import "dotenv/config";
import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import admin from "firebase-admin";
import { pool } from "../db/pool.js";

type MaybeTimestamp = {
  toDate?: () => Date;
  seconds?: number;
};

type DomainReport = {
  domain: "users" | "blog" | "contact" | "scraper";
  sourceCount: number;
  destinationCount: number;
  sourceChecksum: string;
  destinationChecksum: string;
  sampleMissing: string[];
};

async function main(): Promise<void> {
  const app = await initFirebaseAdmin();
  const firestore = app.firestore();
  const auth = app.auth();

  const usersSource = await getFirebaseUsers(auth);
  const usersDestination = await getPgUsers();

  const blogSource = await getFirebaseBlogSlugs(firestore);
  const blogDestination = await getPgBlogSlugs();

  const contactSource = await getFirebaseContactFingerprints(firestore);
  const contactDestination = await getPgContactFingerprints();

  const scraperSource = await getFirebaseScraperFingerprints(firestore);
  const scraperDestination = await getPgScraperFingerprints();

  const reports: DomainReport[] = [
    buildReport("users", usersSource, usersDestination),
    buildReport("blog", blogSource, blogDestination),
    buildReport("contact", contactSource, contactDestination),
    buildReport("scraper", scraperSource, scraperDestination),
  ];

  // eslint-disable-next-line no-console
  console.log("Firebase -> PostgreSQL verification report");
  for (const report of reports) {
    const countOk = report.sourceCount === report.destinationCount;
    const checksumOk = report.sourceChecksum === report.destinationChecksum;
    const missingOk = report.sampleMissing.length === 0;
    const status = countOk && checksumOk && missingOk ? "OK" : "MISMATCH";

    // eslint-disable-next-line no-console
    console.log(
      [
        `\n[${status}] ${report.domain}`,
        `sourceCount=${report.sourceCount}`,
        `destinationCount=${report.destinationCount}`,
        `sourceChecksum=${report.sourceChecksum}`,
        `destinationChecksum=${report.destinationChecksum}`,
        `missingSample=${report.sampleMissing.length}`,
      ].join(" | ")
    );

    if (report.sampleMissing.length > 0) {
      // eslint-disable-next-line no-console
      console.log(
        `missing keys (${report.domain}): ${report.sampleMissing.join(", ")}`
      );
    }
  }

  const hasMismatch = reports.some(
    (report) =>
      report.sourceCount !== report.destinationCount ||
      report.sourceChecksum !== report.destinationChecksum ||
      report.sampleMissing.length > 0
  );

  await pool.end();
  if (hasMismatch) {
    process.exit(2);
  }
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

async function getFirebaseUsers(auth: admin.auth.Auth): Promise<string[]> {
  const emails: string[] = [];
  let pageToken: string | undefined;

  do {
    const page = await auth.listUsers(1000, pageToken);
    for (const user of page.users) {
      if (!user.email) continue;
      emails.push(user.email.toLowerCase());
    }
    pageToken = page.pageToken;
  } while (pageToken);

  return emails;
}

async function getFirebaseBlogSlugs(
  firestore: admin.firestore.Firestore
): Promise<string[]> {
  const snapshot = await firestore.collection("blog").get();
  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      const title = String(data.title ?? "");
      const slug = slugify(title || String(data.slug ?? doc.id));
      return slug;
    })
    .filter(Boolean);
}

async function getFirebaseContactFingerprints(
  firestore: admin.firestore.Firestore
): Promise<string[]> {
  const snapshot = await firestore.collection("contacto").get();
  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      const name = String(data.name ?? "").trim();
      const email = String(data.email ?? "").trim().toLowerCase();
      const message = String(data.message ?? "").trim();
      const createdAt = toIso(data.createdAt ?? data.date) ?? "";
      if (!name || !email || !message) return "";
      return `${name}|${email}|${message}|${createdAt}`;
    })
    .filter(Boolean);
}

async function getFirebaseScraperFingerprints(
  firestore: admin.firestore.Firestore
): Promise<string[]> {
  const snapshot = await firestore.collection("scraper_jobs").get();
  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      const query = String(data.query ?? "").trim();
      const status = normalizeJobStatus(String(data.status ?? "queued"));
      const resultUrl = data.resultUrl ? String(data.resultUrl).trim() : "";
      const createdAt = toIso(data.createdAt) ?? "";
      if (!query) return "";
      return `${query}|${status}|${resultUrl}|${createdAt}`;
    })
    .filter(Boolean);
}

async function getPgUsers(): Promise<string[]> {
  const query = await pool.query<{ email: string }>(
    "SELECT email FROM users ORDER BY email ASC"
  );
  return query.rows.map((row) => row.email.toLowerCase());
}

async function getPgBlogSlugs(): Promise<string[]> {
  const query = await pool.query<{ slug: string }>(
    "SELECT slug FROM blog_posts ORDER BY slug ASC"
  );
  return query.rows.map((row) => row.slug);
}

async function getPgContactFingerprints(): Promise<string[]> {
  const query = await pool.query<{
    name: string;
    email: string;
    message: string;
    createdAt: string;
  }>(
    `SELECT name, email, message, created_at::text AS "createdAt"
     FROM contact_messages
     ORDER BY created_at ASC`
  );
  return query.rows.map((row) => {
    return `${row.name.trim()}|${row.email.toLowerCase().trim()}|${row.message.trim()}|${toIso(
      row.createdAt
    ) ?? ""}`;
  });
}

async function getPgScraperFingerprints(): Promise<string[]> {
  const query = await pool.query<{
    query: string;
    status: string;
    resultUrl: string | null;
    createdAt: string;
  }>(
    `SELECT query, status, result_url AS "resultUrl", created_at::text AS "createdAt"
     FROM scraper_jobs
     ORDER BY created_at ASC`
  );
  return query.rows.map((row) => {
    return `${row.query.trim()}|${normalizeJobStatus(row.status)}|${
      row.resultUrl?.trim() ?? ""
    }|${toIso(row.createdAt) ?? ""}`;
  });
}

function buildReport(
  domain: DomainReport["domain"],
  sourceItems: string[],
  destinationItems: string[]
): DomainReport {
  const sourceSorted = [...sourceItems].sort();
  const destinationSorted = [...destinationItems].sort();
  const destinationSet = new Set(destinationSorted);

  const sampleMissing = sourceSorted
    .filter((item) => !destinationSet.has(item))
    .slice(0, 10);

  return {
    domain,
    sourceCount: sourceSorted.length,
    destinationCount: destinationSorted.length,
    sourceChecksum: checksum(sourceSorted),
    destinationChecksum: checksum(destinationSorted),
    sampleMissing,
  };
}

function checksum(values: string[]): string {
  return crypto.createHash("sha256").update(values.join("\n")).digest("hex");
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
  console.error("Firebase migration verification failed:", error);
  await pool.end();
  process.exit(1);
});
