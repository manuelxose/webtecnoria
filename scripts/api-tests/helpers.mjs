/**
 * Shared test scaffolding for the contact API (plain JS so that
 * `node --import tsx --test scripts/api-tests/` discovers it; the application
 * modules it imports are TypeScript and are transformed by tsx).
 *
 * IMPORTANT: this module sets the environment required by config/env.ts at
 * import time. Test files must import this module (statically) and load the
 * application modules with `await import(...)` afterwards, because env.ts calls
 * process.exit on invalid configuration.
 */

import { randomUUID } from "node:crypto";

process.env["NODE_ENV"] = process.env["NODE_ENV"] ?? "test";
process.env["DATABASE_URL"] =
  process.env["DATABASE_URL"] ?? "postgres://tecnoria_api:tecnoria@127.0.0.1:5432/tecnoria";
process.env["JWT_SECRET"] = process.env["JWT_SECRET"] ?? "test-secret-value-0123456789abcdef";
process.env["GOOGLE_CLIENT_ID"] = process.env["GOOGLE_CLIENT_ID"] ?? "test-google-client-id";
process.env["SMTP_HOST"] = process.env["SMTP_HOST"] ?? "127.0.0.1";
process.env["SMTP_PORT"] = process.env["SMTP_PORT"] ?? "1025";
process.env["SMTP_USER"] = process.env["SMTP_USER"] ?? "test-user";
process.env["SMTP_PASS"] = process.env["SMTP_PASS"] ?? "test-pass";
process.env["SMTP_FROM"] = process.env["SMTP_FROM"] ?? "no-reply@example.com";
process.env["ADMIN_NOTIFICATION_EMAIL"] = process.env["ADMIN_NOTIFICATION_EMAIL"] ?? "admin@example.com";

const INSERT_SQL = `INSERT INTO contact_messages
   (name, email, phone, company, service_1, service_2, message, source_page,
    idempotency_key, privacy_accepted, client_hash, user_agent_class, notification_status)
 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'pending')
 ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
 RETURNING id, created_at`;

/**
 * Minimal in-memory stand-in for pg.Pool that understands the statements the
 * contact router issues. Deliberately dumb: it proves routing, validation,
 * idempotency and notification bookkeeping without a database.
 */
export class FakePool {
  constructor() {
    this.rows = [];
    this.queries = [];
    this.failNextInsert = false;
    this.failNextUpdate = false;
  }

  async query(sql, params = []) {
    const compact = sql.replace(/\s+/g, " ").trim();
    this.queries.push({ sql: compact, params });

    if (/^SELECT 1/i.test(compact)) {
      return { rows: [{ "?column?": 1 }], rowCount: 1 };
    }

    if (/^INSERT INTO contact_messages/i.test(compact)) {
      if (this.failNextInsert) {
        this.failNextInsert = false;
        throw new Error("simulated database failure");
      }

      const [name, email, phone, company, service1, service2, message, sourcePage, idempotencyKey, privacyAccepted, clientHash, userAgentClass] =
        params;

      if (idempotencyKey && this.rows.some((row) => row["idempotency_key"] === idempotencyKey)) {
        return { rows: [], rowCount: 0 };
      }

      const row = {
        id: randomUUID(),
        created_at: new Date(),
        name,
        email,
        phone,
        company,
        service_1: service1,
        service_2: service2,
        message,
        source_page: sourcePage,
        idempotency_key: idempotencyKey,
        privacy_accepted: privacyAccepted,
        client_hash: clientHash,
        user_agent_class: userAgentClass,
        notification_status: "pending",
        notification_attempts: 0,
        notified_at: null,
        notification_error: null,
      };
      this.rows.push(row);

      return { rows: [{ id: row.id, created_at: row.created_at }], rowCount: 1 };
    }

    if (/^SELECT id, created_at, notification_status FROM contact_messages WHERE idempotency_key/i.test(compact)) {
      const row = this.rows.find((candidate) => candidate["idempotency_key"] === params[0]);
      return {
        rows: row ? [{ id: row.id, created_at: row.created_at, notification_status: row["notification_status"] }] : [],
        rowCount: row ? 1 : 0,
      };
    }

    if (/^UPDATE contact_messages/i.test(compact)) {
      if (this.failNextUpdate) {
        this.failNextUpdate = false;
        throw new Error("simulated failure while recording the notification outcome");
      }

      const [id, status, errorClass] = params;
      const row = this.rows.find((candidate) => candidate.id === id);
      if (!row) {
        return { rows: [], rowCount: 0 };
      }
      row["notification_status"] = status;
      row["notification_attempts"] = Number(row["notification_attempts"] ?? 0) + 1;
      row["notified_at"] = status === "sent" ? new Date() : null;
      row["notification_error"] = errorClass;
      return { rows: [], rowCount: 1 };
    }

    if (/FROM contact_messages WHERE id = \$1/i.test(compact)) {
      const row = this.rows.find((candidate) => candidate.id === params[0]);
      return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
    }

    if (/FROM contact_messages/i.test(compact)) {
      const sorted = [...this.rows].sort(
        (a, b) => new Date(String(b["created_at"])).getTime() - new Date(String(a["created_at"])).getTime()
      );
      const limit = Number(params[params.length - 1] ?? 20);
      return { rows: sorted.slice(0, limit), rowCount: Math.min(sorted.length, limit) };
    }

    return { rows: [], rowCount: 0 };
  }
}

export const VALID_PAYLOAD = {
  name: "Verificación QA",
  email: "qa@example.com",
  company: "QA SL",
  phone: "+34 600 000 000",
  service1: "Consultoría tecnológica",
  service2: "Cuanto antes",
  message: "Mensaje de prueba con longitud suficiente para el formulario.",
  privacyAccepted: true,
  sourcePage: "/contacto",
  idempotencyKey: "lead-test-key-1",
  _hp: "",
};

export function payloadWith(overrides) {
  return { ...VALID_PAYLOAD, ...overrides };
}

/** Loads the contact router with all environment prerequisites in place. */
export async function loadContactModule() {
  return await import("../../apps/api/src/routes/v1/contact.js");
}

export async function loadExpress() {
  const mod = await import("express");
  return mod.default;
}

/**
 * Builds a test app around the router: same middleware order as production for
 * the parts that matter (json body, router, terminal error handler).
 */
export async function buildApp({ router, logger, errorSink }) {
  const express = await loadExpress();
  const app = express();
  app.set("trust proxy", "loopback");
  app.use(express.json({ limit: "1mb" }));
  app.use("/api/v1/contact", router);
  app.use((_req, res) => {
    res.status(404).json({ code: "NOT_FOUND" });
  });
  app.use((error, req, res, _next) => {
    if (errorSink) {
      errorSink.push(String(error && error.name ? error.name : "UnknownError"));
    }
    void logger;
    if (res.headersSent) {
      return;
    }
    res.status(500).json({ code: "INTERNAL" });
  });

  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

/** Captures the real logger output (the default sink writes to stdout). */
export async function withStdoutCapture(fn) {
  const original = process.stdout.write.bind(process.stdout);
  const lines = [];

  process.stdout.write = (chunk, encoding, callback) => {
    const text = typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8");
    lines.push(text.trimEnd());
    const cb = typeof encoding === "function" ? encoding : callback;
    if (typeof cb === "function") {
      cb();
    }
    return true;
  };

  try {
    const result = await fn();
    return { result, lines };
  } finally {
    process.stdout.write = original;
  }
}

/** 200/400/429/500 helper that never throws on non-2xx. */
export async function post(baseUrl, body, headers = {}) {
  const response = await fetch(`${baseUrl}/api/v1/contact`, {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "node-test", ...headers },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  return { status: response.status, headers: response.headers, json, text };
}

export { INSERT_SQL };
