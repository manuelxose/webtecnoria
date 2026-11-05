/**
 * GROWTH-04 / P0-5 — resumen agregado de notificaciones SIN datos personales.
 *
 * Antes de este cambio un SMTP roto dejaba los leads almacenados invisibles:
 * sólo existía "/api/v1/contact/messages" (detalle con PII, que el panel
 * admin no consulta) y el "--dry-run" de renotify-leads sólo imprimía
 * contadores. Aquí se comprueba lo nuevo:
 *
 *   1. GET /api/v1/contact/messages/notification-summary exige sesión de
 *      administrador (401 sin cookie, 403 con un rol no editorial).
 *   2. El payload es un agregado: ni PII ni identificadores de fila, ni en las
 *      claves ni en los valores.
 *   3. El ORDEN de las rutas importa: "notification-summary" se declara antes
 *      que "/messages/:id", así que responde el resumen y no un 404 de ":id".
 *   4. El "--dry-run" de renotify-leads escribe UNA línea por candidato (con
 *      id, fecha, intentos y clase de error) y ninguna de esas líneas contiene
 *      un email, un teléfono, un nombre o el mensaje.
 *
 * Sin base de datos: el pool se falsea (FakePool extendido aquí, sin tocar
 * helpers.mjs) y la sesión se firma con el secreto de pruebas.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { FakePool, loadContactModule, loadExpress, withStdoutCapture } from "./helpers.mjs";

const { createContactRouter } = await loadContactModule();
const { signSessionToken } = await import("../../apps/api/src/auth/tokens.js");
const { env } = await import("../../apps/api/src/config/env.js");
const renotify = await import("../../apps/api/src/scripts/renotify-leads.js");
const { pool: sharedPool } = await import("../../apps/api/src/db/pool.js");

const openLimiter = () => ({
  consume: () => ({ allowed: true, retryAfter: 0 }),
  size: () => 0,
  sweep: () => 0,
});

/**
 * Pool falso para el resumen: entiende las dos consultas agregadas y nada
 * más. A propósito devuelve columnas con PII (name, email…) en la fila de
 * totales: así se demuestra que la ruta copia SÓLO los campos que ella decide
 * y no reenvía la fila tal cual.
 */
class SummaryPool extends FakePool {
  constructor() {
    super();
    this.totals = {
      pending: 3,
      failed: 2,
      sent: 10,
      legacy: 17,
      pending_older_m1: 2,
      pending_older_m15: 1,
      pending_older_m60: 0,
      oldest_pending_at: new Date("2026-11-05T10:00:00.000Z"),
      // Columnas que una consulta descuidada podría devolver: la ruta debe
      // ignorarlas por completo.
      name: "Ana Ejemplo",
      email: "ana@example.test",
    };
    this.classes = [
      { error_class: "EAUTH", error_count: 2 },
      { error_class: "ETIMEDOUT", error_count: 1 },
    ];
  }

  async query(sql, params = []) {
    const compact = String(sql).replace(/\s+/g, " ").trim();

    if (/oldest_pending_at/i.test(compact)) {
      this.queries.push({ sql: compact, params });
      return { rows: [this.totals], rowCount: 1 };
    }

    if (/GROUP BY COALESCE\(notification_error/i.test(compact)) {
      this.queries.push({ sql: compact, params });
      return { rows: this.classes, rowCount: this.classes.length };
    }

    return await super.query(sql, params);
  }
}

/** Cookie de sesión de administrador, firmada con el secreto de pruebas. */
function sessionCookie(role = "admin") {
  const token = signSessionToken({
    sub: `user-${role}`,
    email: `admin@example.test`,
    role,
  });

  return `${env.COOKIE_NAME}=${token}`;
}

/**
 * App de pruebas con la misma cadena de middlewares que producción para lo
 * que importa aquí: cookie-parser (la sesión es una cookie) y el router de
 * contacto montado en /api/v1/contact.
 */
async function buildSummaryApp() {
  const express = await loadExpress();
  const cookieParser = (await import("cookie-parser")).default;

  const pool = new SummaryPool();
  const logs = [];
  const router = createContactRouter({
    pool,
    notify: async () => ({ status: "sent" }),
    limiter: openLimiter(),
    logger: { log: (entry) => logs.push(entry) },
  });

  const app = express();
  app.set("trust proxy", "loopback");
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use("/api/v1/contact", router);
  app.use((_req, res) => {
    res.status(404).json({ code: "NOT_FOUND" });
  });
  app.use((_error, _req, res, _next) => {
    res.status(500).json({ code: "INTERNAL" });
  });

  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();

  return {
    pool,
    logs,
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

/** Claves que nunca deben aparecer en el payload del resumen. */
const FORBIDDEN_KEYS = new Set([
  "id",
  "ids",
  "name",
  "names",
  "email",
  "emails",
  "phone",
  "phones",
  "company",
  "message",
  "messages",
  "client_hash",
  "clientHash",
  "idempotency_key",
  "idempotencyKey",
  "created_at",
  "createdAt",
  "source_page",
  "sourcePage",
  "service_1",
  "service_2",
  "privacy_accepted",
  "user_agent_class",
  "notification_error",
  "notification_attempts",
  "notified_at",
  "lead",
  "leads",
  "items",
  "rows",
]);

function collectKeys(value, found = []) {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectKeys(entry, found));
    return found;
  }

  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      found.push(key);
      collectKeys(nested, found);
    }
  }

  return found;
}

test("el resumen exige sesión de administrador: 401 sin cookie", async () => {
  const { baseUrl, close } = await buildSummaryApp();
  try {
    const response = await fetch(`${baseUrl}/api/v1/contact/messages/notification-summary`);
    assert.equal(response.status, 401);

    const payload = await response.json();
    assert.equal(payload.code, "UNAUTHENTICATED");
  } finally {
    await close();
  }
});

test("un rol no editorial recibe 403: la ruta usa requireAdmin, no requireAuth", async () => {
  const { baseUrl, close } = await buildSummaryApp();
  try {
    const response = await fetch(`${baseUrl}/api/v1/contact/messages/notification-summary`, {
      headers: { cookie: sessionCookie("viewer") },
    });
    assert.equal(response.status, 403);

    const payload = await response.json();
    assert.equal(payload.code, "FORBIDDEN");
  } finally {
    await close();
  }
});

test("el payload es un agregado: ni PII ni identificadores de fila", async () => {
  const { baseUrl, logs, close } = await buildSummaryApp();
  try {
    const response = await fetch(`${baseUrl}/api/v1/contact/messages/notification-summary`, {
      headers: { cookie: sessionCookie() },
    });
    assert.equal(response.status, 200);

    const payload = await response.json();

    // Forma exacta del contrato.
    assert.deepEqual(Object.keys(payload).sort(), [
      "counts",
      "failedByClass",
      "oldestPendingAt",
      "pendingOlderThan",
      "readAt",
    ]);
    assert.deepEqual(Object.keys(payload.counts).sort(), ["failed", "legacy", "pending", "sent"]);
    assert.deepEqual(Object.keys(payload.pendingOlderThan).sort(), ["m1", "m15", "m60"]);

    // Valores agregados.
    assert.equal(payload.counts.pending, 3);
    assert.equal(payload.counts.failed, 2);
    assert.equal(payload.counts.sent, 10);
    assert.equal(payload.counts.legacy, 17);
    assert.equal(payload.pendingOlderThan.m1, 2);
    assert.equal(payload.pendingOlderThan.m15, 1);
    assert.equal(payload.pendingOlderThan.m60, 0);
    assert.equal(payload.oldestPendingAt, "2026-11-05T10:00:00.000Z");
    assert.deepEqual(payload.failedByClass, [
      { errorClass: "EAUTH", count: 2 },
      { errorClass: "ETIMEDOUT", count: 1 },
    ]);
    assert.match(payload.readAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

    // Ninguna clave prohibida, a ningún nivel.
    for (const key of collectKeys(payload)) {
      assert.equal(FORBIDDEN_KEYS.has(key), false, `clave prohibida en el payload: ${key}`);
    }

    // Ningún valor que parezca un identificador de fila ni un dato personal.
    const serialized = JSON.stringify(payload);
    assert.equal(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(serialized),
      false,
      "el payload no puede contener un id de fila"
    );
    assert.equal(/[^\s"@]+@[^\s"@]+/.test(serialized), false, "el payload no puede contener un email");
    for (const forbidden of ["Ana Ejemplo", "ana@example.test"]) {
      assert.equal(serialized.includes(forbidden), false, `el payload filtró ${forbidden}`);
    }

    // Tampoco la línea de log de la ruta puede filtrar nada.
    const summaryLogs = logs.filter((entry) => entry.event === "contact_notification_summary_read");
    assert.equal(summaryLogs.length, 1, "la ruta debe dejar una línea de log");
    for (const key of Object.keys(summaryLogs[0])) {
      assert.ok(["event", "count", "status"].includes(key), `clave inesperada en el log: ${key}`);
    }
    const logged = JSON.stringify(logs);
    assert.equal(/[^\s"@]+@[^\s"@]+/.test(logged), false, "el log no puede contener un email");
    assert.equal(logged.includes("Ana Ejemplo"), false, "el log no puede filtrar PII");
    assert.equal(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(logged),
      false,
      "el log no puede contener un id de fila"
    );
  } finally {
    await close();
  }
});

test("la antigüedad de los pendientes se calcula en SQL con NOW() - INTERVAL", async () => {
  const { baseUrl, pool, close } = await buildSummaryApp();
  try {
    const response = await fetch(`${baseUrl}/api/v1/contact/messages/notification-summary`, {
      headers: { cookie: sessionCookie() },
    });
    assert.equal(response.status, 200);

    const totals = pool.queries.find((query) => /oldest_pending_at/i.test(query.sql));
    assert.ok(totals, "debe ejecutarse la consulta de totales");
    assert.match(totals.sql, /NOW\(\) - INTERVAL '1 minute'/);
    assert.match(totals.sql, /NOW\(\) - INTERVAL '15 minutes'/);
    assert.match(totals.sql, /NOW\(\) - INTERVAL '60 minutes'/);

    // El cálculo no se hace en JavaScript: la consulta no trae marcas de
    // tiempo por fila, sólo el mínimo agregado.
    assert.equal(/created_at/.test(totals.sql), true);
    assert.equal(/SELECT[^;]*\bname\b/i.test(totals.sql), false, "la consulta no puede leer PII");
    assert.equal(/SELECT[^;]*\bemail\b/i.test(totals.sql), false, "la consulta no puede leer PII");
    assert.equal(/SELECT[^;]*\bmessage\b/i.test(totals.sql), false, "la consulta no puede leer PII");
  } finally {
    await close();
  }
});

test("el orden de las rutas: el resumen se declara antes que '/messages/:id'", async () => {
  const { baseUrl, pool, close } = await buildSummaryApp();
  try {
    // 1) Comportamiento: la petición la responde el resumen, no ":id".
    const response = await fetch(`${baseUrl}/api/v1/contact/messages/notification-summary`, {
      headers: { cookie: sessionCookie() },
    });
    assert.equal(response.status, 200, "no puede ser un 404 de ':id'");

    const payload = await response.json();
    assert.ok(payload.counts, "la respuesta debe ser el agregado");
    assert.equal(payload.id, undefined, "la respuesta no puede ser una fila");

    // ":id" nunca llegó a consultarse con 'notification-summary'.
    assert.equal(
      pool.queries.some((query) => Array.isArray(query.params) && query.params.includes("notification-summary")),
      false,
      "la ruta ':id' no debe capturar la petición del resumen"
    );

    // 2) Declaración: el resumen está antes que ":id" en la pila del router.
    const router = createContactRouter({
      pool: new SummaryPool(),
      notify: async () => ({ status: "sent" }),
      limiter: openLimiter(),
      logger: { log: () => {} },
    });

    const paths = router.stack.filter((layer) => layer.route).map((layer) => layer.route.path);
    const summaryIndex = paths.indexOf("/messages/notification-summary");
    const idIndex = paths.indexOf("/messages/:id");

    assert.ok(summaryIndex >= 0, "la ruta del resumen debe existir");
    assert.ok(idIndex >= 0, "la ruta de detalle debe seguir existiendo");
    assert.ok(summaryIndex < idIndex, "el resumen debe declararse ANTES que ':id'");
  } finally {
    await close();
  }
});

test("el dry-run escribe una línea por candidato y ninguna lleva un email", async () => {
  const candidates = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      created_at: new Date("2026-11-05T10:00:00.000Z"),
      name: "Ana Ejemplo",
      email: "ana@example.test",
      phone: "600 000 000",
      company: "ACME",
      service_1: null,
      service_2: null,
      message: "Necesito una web con presupuesto cerrado",
      source_page: "/contacto",
      notification_attempts: 1,
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      created_at: new Date("2026-11-05T11:00:00.000Z"),
      name: "Luis Ejemplo",
      email: "luis@example.test",
      phone: null,
      company: null,
      service_1: null,
      service_2: null,
      message: "Otro mensaje de prueba",
      source_page: "/contacto",
      notification_attempts: 2,
    },
  ];

  const original = sharedPool.query.bind(sharedPool);
  sharedPool.query = async (sql, params) => {
    const text = String(sql).replace(/\s+/g, " ").trim();

    if (/^SELECT id, notification_error/i.test(text)) {
      return {
        rows: [
          { id: candidates[0].id, notification_error: "EAUTH" },
          { id: candidates[1].id, notification_error: null },
        ],
        rowCount: 2,
      };
    }

    if (/^SELECT/i.test(text)) {
      return { rows: candidates, rowCount: candidates.length };
    }

    return { rows: [], rowCount: 0 };
  };

  try {
    const { result, lines } = await withStdoutCapture(async () => {
      return await renotify.runRenotify({ dryRun: true, limit: 10 });
    });

    // Los contadores existentes se mantienen.
    assert.equal(result.scanned, 2);
    assert.equal(result.sent, 0);
    assert.equal(result.failed, 0);

    const parsed = lines
      .filter((line) => line.trim().startsWith("{"))
      .map((line) => JSON.parse(line));

    const perCandidate = parsed.filter((entry) => entry.event === "renotify_would_send");
    assert.equal(perCandidate.length, 2, "una línea por candidato");

    // El operador sabe QUÉ lead está atascado: id, fecha, intentos y clase
    // de error, y nada más.
    assert.ok(perCandidate[0].detail.includes(candidates[0].id));
    assert.ok(perCandidate[1].detail.includes(candidates[1].id));
    assert.ok(perCandidate[0].detail.includes("2026-11-05T10:00:00.000Z"));
    assert.equal(perCandidate[0].count, 1);
    assert.equal(perCandidate[1].count, 2);
    assert.equal(perCandidate[0].errorClass, "EAUTH");
    assert.equal(perCandidate[1].errorClass, "None");

    // El journal no puede filtrar PII.
    const joined = JSON.stringify(parsed);
    assert.equal(/[^\s"@]+@[^\s"@]+/.test(joined), false, "ninguna línea puede contener un email");
    for (const forbidden of [
      "ana@example.test",
      "luis@example.test",
      "Ana Ejemplo",
      "Luis Ejemplo",
      "600 000 000",
      "Necesito una web con presupuesto cerrado",
      "Otro mensaje de prueba",
      "ACME",
    ]) {
      assert.equal(joined.includes(forbidden), false, `la línea filtró ${forbidden}`);
    }
  } finally {
    sharedPool.query = original;
  }
});