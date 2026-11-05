// Contact API behaviour: validation, honeypot, rate limit, idempotency,
// notification bookkeeping, admin read path and PII-free logging.
import assert from "node:assert/strict";
import test from "node:test";

import { FakePool, VALID_PAYLOAD, buildApp, loadContactModule, payloadWith, post, withStdoutCapture } from "./helpers.mjs";

const { createContactRouter, normalizeSourcePage, classifyUserAgent } = await loadContactModule();
const { createLogger } = await import("../../apps/api/src/services/logger.js");

const openLimiter = () => ({
  consume: () => ({ allowed: true, retryAfter: 0 }),
  size: () => 0,
  sweep: () => 0,
});

async function makeApp(options = {}) {
  const pool = options.pool ?? new FakePool();
  const logs = [];
  const notifications = [];
  const router = createContactRouter({
    pool,
    notify:
      options.notify ??
      (async (lead) => {
        notifications.push(lead);
        return { status: "sent" };
      }),
    limiter: options.limiter ?? openLimiter(),
    logger: options.logger ?? { log: (entry) => logs.push(entry) },
  });

  const app = await buildApp({ router });
  return { app, pool, logs, notifications, close: () => app.close() };
}

test("over-length fields are rejected with field-level messages and no row", async () => {
  const { app, pool, close } = await makeApp();
  try {
    const cases = [
      ["name", "x".repeat(121)],
      ["email", `${"y".repeat(250)}@example.com`],
      ["company", "c".repeat(161)],
      ["phone", "9".repeat(33)],
      ["service1", "s".repeat(81)],
      ["service2", "t".repeat(121)],
      ["message", "m".repeat(5001)],
      ["sourcePage", "/".padEnd(201, "a")],
      ["idempotencyKey", "k".repeat(65)],
    ];

    for (const [field, value] of cases) {
      const response = await post(app.baseUrl, payloadWith({ [field]: value }));
      assert.equal(response.status, 400, `${field} must be rejected`);
      assert.equal(response.json.code, "INVALID_INPUT");
      assert.ok(response.json.fields[field], `${field} needs a field-level message`);
      assert.equal(typeof response.json.fields[field], "string");
    }

    assert.equal(pool.rows.length, 0, "no invalid payload may reach the table");
  } finally {
    await close();
  }
});

test("the schema declares an explicit maximum for every string field", async () => {
  // Behavioural proof: exactly-at-limit values are accepted, one-over are not.
  const { app, pool, close } = await makeApp();
  try {
    const atLimit = payloadWith({
      name: "n".repeat(120),
      email: `${"e".repeat(240)}@ex.com`,
      company: "c".repeat(160),
      phone: "9".repeat(32),
      service1: "s".repeat(80),
      service2: "t".repeat(120),
      message: "m".repeat(5000),
      sourcePage: `/${"a".repeat(199)}`,
      idempotencyKey: "k".repeat(64),
    });

    const response = await post(app.baseUrl, atLimit);
    assert.equal(response.status, 201, JSON.stringify(response.json));
    assert.equal(pool.rows.length, 1);
    assert.equal(String(pool.rows[0].message).length, 5000);
  } finally {
    await close();
  }
});

test("a filled honeypot returns a success-shaped 201, writes nothing and is logged", async () => {
  const { app, pool, logs, close } = await makeApp();
  try {
    const response = await post(app.baseUrl, payloadWith({ _hp: "http://spam.example", name: "x" }));
    assert.equal(response.status, 201);
    assert.equal(response.json.notified, "skipped");
    assert.equal(typeof response.json.id, "string");
    assert.equal(pool.rows.length, 0, "honeypot hits must not create rows");
    assert.ok(logs.some((entry) => entry.event === "contact_spam_honeypot"));
    assert.equal(logs.some((entry) => entry.event === "contact_invalid_input"), false, "honeypot must not surface validation errors");
  } finally {
    await close();
  }
});

test("an absent honeypot is not spam: normal submissions are unaffected", async () => {
  const { app, pool, logs, close } = await makeApp();
  try {
    const withoutField = { ...VALID_PAYLOAD };
    delete withoutField._hp;

    const response = await post(app.baseUrl, withoutField);
    assert.equal(response.status, 201);
    assert.equal(pool.rows.length, 1);
    assert.equal(
      logs.some((entry) => entry.event === "contact_invalid_input"),
      false,
      "an absent _hp must produce no validation error at all"
    );
    assert.equal(logs.some((entry) => entry.event === "contact_spam_honeypot"), false);
  } finally {
    await close();
  }
});

test("a non-string _hp is treated as empty and can never raise a validation error", async () => {
  const { app, pool, logs, close } = await makeApp();
  try {
    const weird = await post(app.baseUrl, payloadWith({ _hp: 12345, idempotencyKey: "hp-nonstring" }));
    assert.equal(weird.status, 201, "_hp is not part of the schema, so it cannot fail validation");
    assert.equal(pool.rows.length, 1);
    assert.equal(logs.some((entry) => entry.event === "contact_invalid_input"), false);

    const objectHoneypot = await post(app.baseUrl, payloadWith({ _hp: { a: 1 }, idempotencyKey: "hp-object" }));
    assert.equal(objectHoneypot.status, 201);
    assert.equal(pool.rows.length, 2);
  } finally {
    await close();
  }
});

test("the 6th submission in the window is 429 with Retry-After and writes no row", async () => {
  const { createLeadRateLimiter } = await import("../../apps/api/src/services/lead-rate-limit.js");
  const limiter = createLeadRateLimiter({
    perClientLimit: 5,
    perClientWindowMs: 10 * 60 * 1000,
    clock: () => 1_700_000_000_000,
  });

  const { app, pool, logs, close } = await makeApp({ limiter });
  try {
    for (let attempt = 1; attempt <= 5; attempt++) {
      const allowed = await post(app.baseUrl, payloadWith({ idempotencyKey: `key-${attempt}` }));
      assert.equal(allowed.status, 201, `attempt ${attempt} must pass`);
    }

    const limited = await post(app.baseUrl, payloadWith({ idempotencyKey: "key-6" }));
    assert.equal(limited.status, 429);
    assert.equal(limited.json.code, "RATE_LIMITED");
    assert.ok(Number(limited.headers.get("retry-after")) > 0, "Retry-After header required");
    assert.equal(typeof limited.json.retryAfter, "number");
    assert.equal(pool.rows.length, 5, "the refused submission must not be stored");
    assert.ok(
      logs.some((entry) => entry.event === "contact_rate_limited_key"),
      "a per-client refusal must be logged as contact_rate_limited_key"
    );
  } finally {
    await close();
  }
});

test("a global refusal is logged distinctly from a per-client one", async () => {
  const { createLeadRateLimiter } = await import("../../apps/api/src/services/lead-rate-limit.js");
  const limiter = createLeadRateLimiter({
    globalLimit: 1,
    globalWindowMs: 10 * 60 * 1000,
    perClientLimit: 5,
    perClientWindowMs: 10 * 60 * 1000,
    clock: () => 1_700_000_000_000,
  });

  const { app, pool, logs, close } = await makeApp({ limiter });
  try {
    const first = await post(app.baseUrl, payloadWith({ idempotencyKey: "g-1" }));
    assert.equal(first.status, 201);

    const flooded = await post(app.baseUrl, payloadWith({ idempotencyKey: "g-2" }));
    assert.equal(flooded.status, 429);
    assert.equal(flooded.json.code, "RATE_LIMITED");
    assert.ok(Number(flooded.headers.get("retry-after")) > 0);
    assert.equal(pool.rows.length, 1);
    assert.ok(
      logs.some((entry) => entry.event === "contact_rate_limited_global"),
      "a global refusal must be logged as contact_rate_limited_global"
    );
    assert.equal(
      logs.some((entry) => entry.event === "contact_rate_limited_key"),
      false,
      "the two refusal reasons must not be conflated"
    );
  } finally {
    await close();
  }
});

test("the same idempotency key yields one row, one email and the same id", async () => {
  const { app, pool, notifications, close } = await makeApp();
  try {
    const first = await post(app.baseUrl, VALID_PAYLOAD);
    const second = await post(app.baseUrl, VALID_PAYLOAD);

    assert.equal(first.status, 201);
    assert.equal(second.status, 201);
    assert.equal(first.json.id, second.json.id);
    assert.equal(first.json.duplicate, false);
    assert.equal(second.json.duplicate, true);
    assert.equal(second.json.notified, "skipped");
    assert.equal(pool.rows.length, 1);
    assert.equal(notifications.length, 1, "a duplicate must not send a second email");
  } finally {
    await close();
  }
});

test("a submission without an idempotency key still stores and logs the gap", async () => {
  const { app, pool, logs, close } = await makeApp();
  try {
    const withoutKey = { ...VALID_PAYLOAD };
    delete withoutKey.idempotencyKey;

    const response = await post(app.baseUrl, withoutKey);
    assert.equal(response.status, 201);
    assert.equal(pool.rows.length, 1);
    assert.equal(pool.rows[0].idempotency_key, null, "the server must not invent a key");
    assert.ok(logs.some((entry) => entry.event === "contact_no_idempotency_key"));
  } finally {
    await close();
  }
});

test("a missing privacyAccepted stores the lead as false instead of rejecting it", async () => {
  const { app, pool, logs, close } = await makeApp();
  try {
    const withoutFlag = { ...VALID_PAYLOAD, idempotencyKey: "privacy-missing" };
    delete withoutFlag.privacyAccepted;

    const response = await post(app.baseUrl, withoutFlag);
    assert.equal(response.status, 201);
    assert.equal(pool.rows.length, 1);
    assert.equal(pool.rows[0].privacy_accepted, false);
    assert.ok(logs.some((entry) => entry.event === "contact_privacy_not_accepted"));
  } finally {
    await close();
  }
});

test("sourcePage is stored only when it is a relative path", async () => {
  const { app, pool, close } = await makeApp();
  try {
    await post(app.baseUrl, payloadWith({ sourcePage: "/contacto", idempotencyKey: "sp-1" }));
    await post(app.baseUrl, payloadWith({ sourcePage: "https://evil.example/x", idempotencyKey: "sp-2" }));
    await post(app.baseUrl, payloadWith({ sourcePage: "//evil.example/x", idempotencyKey: "sp-3" }));

    assert.equal(pool.rows[0].source_page, "/contacto");
    assert.equal(pool.rows[1].source_page, null);
    assert.equal(pool.rows[2].source_page, null);
    assert.equal(normalizeSourcePage("/blog/post"), "/blog/post");
    assert.equal(normalizeSourcePage("contacto"), null);
  } finally {
    await close();
  }
});

test("notification outcome is persisted: sent sets status and timestamp", async () => {
  const { app, pool, close } = await makeApp();
  try {
    const response = await post(app.baseUrl, VALID_PAYLOAD);
    assert.equal(response.json.notified, "sent");
    assert.equal(pool.rows[0].notification_status, "sent");
    assert.ok(pool.rows[0].notified_at instanceof Date);
    assert.equal(pool.rows[0].notification_attempts, 1);
    assert.equal(pool.rows[0].notification_error, null);
  } finally {
    await close();
  }
});

test("a THROWING notifier records 'failed' + sanitized class and still returns 201", async () => {
  const { app, pool, close } = await makeApp({
    // The route-level guarantee must not depend on the notifier catching its own
    // errors. This one throws exactly like a badly injected dependency would.
    notify: async () => {
      throw Object.assign(new Error("534-5.7.9 raw smtp detail that must never be stored"), {
        code: "EAUTH",
      });
    },
  });
  try {
    const response = await post(app.baseUrl, VALID_PAYLOAD);
    assert.equal(response.status, 201, "a throwing notifier must never change the HTTP result");
    assert.equal(response.json.notified, "failed");
    assert.equal(pool.rows.length, 1, "the lead must be stored");
    assert.equal(pool.rows[0].notification_status, "failed");
    assert.equal(pool.rows[0].notification_error, "EAUTH");
    assert.equal(
      JSON.stringify(pool.rows[0]).includes("534-5.7.9"),
      false,
      "the raw SMTP message must never be persisted"
    );
  } finally {
    await close();
  }
});

test("a notifier returning a malformed result is also treated as failed, never as an error", async () => {
  const { app, pool, close } = await makeApp({ notify: async () => undefined });
  try {
    const response = await post(app.baseUrl, VALID_PAYLOAD);
    assert.equal(response.status, 201);
    assert.equal(response.json.notified, "failed");
    assert.equal(pool.rows[0].notification_status, "failed");
    assert.equal(pool.rows[0].notification_error, "InvalidNotifierResult");
  } finally {
    await close();
  }
});

test("a notifier that returns failed still persists the class (no throw path)", async () => {
  const { app, pool, close } = await makeApp({
    notify: async () => ({ status: "failed", errorClass: "EAUTH" }),
  });
  try {
    const response = await post(app.baseUrl, VALID_PAYLOAD);
    assert.equal(response.status, 201, "email failure must never change the HTTP result");
    assert.equal(response.json.notified, "failed");
    assert.equal(pool.rows.length, 1, "the lead must be stored");
    assert.equal(pool.rows[0].notification_status, "failed");
    assert.equal(pool.rows[0].notification_error, "EAUTH");
  } finally {
    await close();
  }
});

test("sanitizeErrorClass falls back safely for non-error throws", async () => {
  const { sanitizeErrorClass } = await loadContactModule();

  assert.equal(sanitizeErrorClass(Object.assign(new Error("x"), { code: "EAUTH" })), "EAUTH");
  assert.equal(sanitizeErrorClass(new TypeError("boom")), "TypeError");
  assert.equal(sanitizeErrorClass("a string"), "UnknownError");
  assert.equal(sanitizeErrorClass(null), "UnknownError");
  assert.equal(sanitizeErrorClass({ code: "has spaces and $ymbols" }), "UnknownError");
});

test("G-6: a failing post-notification UPDATE still returns 201 for the stored lead", async () => {
  const pool = new FakePool();
  const logs = [];
  const router = createContactRouter({
    pool,
    notify: async () => ({ status: "sent" }),
    limiter: openLimiter(),
    logger: { log: (entry) => logs.push(entry) },
  });

  const app = await buildApp({ router });
  try {
    pool.failNextUpdate = true;
    const response = await post(app.baseUrl, VALID_PAYLOAD);

    assert.equal(response.status, 201, "a stored lead must never be reported as a failed submission");
    assert.equal(response.json.notified, "sent", "the notification outcome is still reported");
    assert.equal(pool.rows.length, 1, "the lead is stored");
    assert.ok(
      logs.some((entry) => entry.event === "contact_notification_state_not_persisted"),
      `expected a persistence-failure log, got ${JSON.stringify(logs.map((l) => l.event))}`
    );
  } finally {
    await app.close();
  }
});

test("a RETURNED raw error class is sanitized too (never stored as text)", async () => {
  const rawClass = "534-5.7.9 Login Required for ana.verify@example.test hunter2";
  const { app, pool, close } = await makeApp({
    // A notifier that bypasses its own sanitising: the route must not trust it.
    notify: async () => ({ status: "failed", errorClass: rawClass }),
  });
  try {
    const response = await post(app.baseUrl, VALID_PAYLOAD);
    assert.equal(response.status, 201);
    assert.equal(pool.rows[0].notification_status, "failed");
    assert.equal(pool.rows[0].notification_error, "UnknownError");
    assert.equal(JSON.stringify(pool.rows[0]).includes("ana.verify@example.test"), false);
    assert.equal(JSON.stringify(pool.rows[0]).includes("hunter2"), false);
  } finally {
    await close();
  }
});

test("an over-long returned error class is rejected", async () => {
  const { app, pool, close } = await makeApp({
    notify: async () => ({ status: "failed", errorClass: "X".repeat(300) }),
  });
  try {
    await post(app.baseUrl, VALID_PAYLOAD);
    assert.equal(pool.rows[0].notification_error, "UnknownError");
  } finally {
    await close();
  }
});

test("a returned class that follows the pattern is kept verbatim", async () => {
  const { app, pool, close } = await makeApp({
    notify: async () => ({ status: "failed", errorClass: "ETIMEDOUT" }),
  });
  try {
    await post(app.baseUrl, VALID_PAYLOAD);
    assert.equal(pool.rows[0].notification_error, "ETIMEDOUT");
  } finally {
    await close();
  }
});

test("notifyLead converts a transport error into a class, never a message", async () => {
  const { createNotifier } = await import("../../apps/api/src/services/notification.js");
  const notifier = createNotifier({
    send: async () => {
      throw Object.assign(new Error("534-5.7.9 Please log in with your web browser"), { code: "EAUTH" });
    },
    to: () => "admin@example.com",
  });

  const result = await notifier({
    id: "1",
    name: "N",
    email: "e@example.com",
    message: "m",
  });

  assert.deepEqual(result, { status: "failed", errorClass: "EAUTH" });
});

test("notifyLead times out instead of hanging the request path", async () => {
  const { createNotifier } = await import("../../apps/api/src/services/notification.js");
  const notifier = createNotifier({
    send: () => new Promise(() => {}),
    to: () => "admin@example.com",
    timeoutMs: 25,
  });

  const result = await notifier({ id: "1", name: "N", email: "e@example.com", message: "m" });
  assert.deepEqual(result, { status: "failed", errorClass: "ETIMEDOUT" });
});

test("the notification subject is constant and carries no field value", async () => {
  const { buildLeadEmail, LEAD_SUBJECT } = await import("../../apps/api/src/services/notification.js");
  const email = buildLeadEmail(
    { id: "x", name: "Ana", email: "ana@example.com", company: "ACME", message: "hola" },
    { to: "admin@example.com" }
  );

  assert.equal(email.subject, LEAD_SUBJECT);
  assert.equal(email.subject.includes("Ana"), false);
  assert.equal(email.subject.includes("ACME"), false);
  assert.ok(email.text.includes("Ana"));
  assert.ok(email.text.includes("hola"));
});

test("a database failure becomes a safe 500 without a stack trace", async () => {
  const pool = new FakePool();
  const errors = [];
  const { app } = await makeApp({ pool });
  const guarded = await buildApp({
    router: createContactRouter({
      pool,
      notify: async () => ({ status: "sent" }),
      limiter: openLimiter(),
      logger: { log: () => {} },
    }),
    errorSink: errors,
  });

  try {
    pool.failNextInsert = true;
    const response = await post(guarded.baseUrl, VALID_PAYLOAD);
    assert.equal(response.status, 500);
    assert.deepEqual(response.json, { code: "INTERNAL" });
    assert.equal(response.text.includes("simulated database failure"), false, "no internal detail may leak");
    assert.equal(pool.rows.length, 0);
  } finally {
    await app.close();
    await guarded.close();
  }
});

test("admin read path requires authentication", async () => {
  const { app, close } = await makeApp();
  try {
    const list = await fetch(`${app.baseUrl}/api/v1/contact/messages`);
    assert.equal(list.status, 401);

    const single = await fetch(`${app.baseUrl}/api/v1/contact/messages/00000000-0000-0000-0000-000000000000`);
    assert.equal(single.status, 401);
  } finally {
    await close();
  }
});

test("request logs are single-line JSON with no PII, no raw IP and no query string", async () => {
  const pool = new FakePool();
  const router = createContactRouter({
    pool,
    notify: async () => ({ status: "sent" }),
    limiter: openLimiter(),
    logger: createLogger(),
  });
  const app = await buildApp({ router });

  try {
    const { lines } = await withStdoutCapture(async () => {
      await fetch(`${app.baseUrl}/api/v1/contact?email=leak@example.com&phone=600000000&message=secret`, {
        method: "POST",
        headers: { "content-type": "application/json", "user-agent": "node-test" },
        body: JSON.stringify(VALID_PAYLOAD),
      });
    });

    const parsed = lines
      .filter((line) => line.trim().startsWith("{"))
      .map((line) => JSON.parse(line));

    assert.ok(parsed.length >= 1, `expected log lines, got ${JSON.stringify(lines)}`);

    const stored = parsed.find((entry) => entry.event === "contact_lead_stored");
    assert.ok(stored, "the submission must produce a contact_lead_stored line");

    const allowedKeys = new Set([
      "ts",
      "event",
      "method",
      "path",
      "status",
      "durationMs",
      "client",
      "errorClass",
      "duplicate",
      "notified",
      "field",
      "fields",
      "count",
      "detail",
    ]);

    for (const entry of parsed) {
      for (const key of Object.keys(entry)) {
        assert.ok(allowedKeys.has(key), `unexpected log key: ${key}`);
      }
    }

    const joined = JSON.stringify(parsed);
    for (const forbidden of ["qa@example.com", "600 000 000", "600000000", "Mensaje de prueba", "leak@example.com", "secret"]) {
      assert.equal(joined.includes(forbidden), false, `log leaked ${forbidden}`);
    }
    assert.equal(joined.includes("127.0.0.1"), false, "raw IP must never be logged");
    assert.match(stored.client, /^[0-9a-f]{16}$/);
  } finally {
    await app.close();
  }
});

test("classifyUserAgent buckets user agents coarsely", () => {
  assert.equal(classifyUserAgent("Mozilla/5.0 (iPhone)"), "mobile");
  assert.equal(classifyUserAgent("Googlebot/2.1"), "automated");
  assert.equal(classifyUserAgent("curl/8.0"), "automated");
  assert.equal(classifyUserAgent("Mozilla/5.0 (Windows NT 10.0) Chrome/120"), "desktop");
  assert.equal(classifyUserAgent(undefined), "unknown");
});
