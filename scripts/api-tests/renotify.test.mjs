// Operator recovery script: scope, dry-run and safe failure.
import assert from "node:assert/strict";
import test from "node:test";

import "./helpers.mjs";

const renotify = await import("../../apps/api/src/scripts/renotify-leads.js");
const { pool } = await import("../../apps/api/src/db/pool.js");

test("NOTIFY_SINCE is the cutover constant (2026-11-05)", () => {
  assert.equal(renotify.NOTIFY_SINCE, "2026-11-05T00:00:00.000Z");
  assert.equal(renotify.MAX_ATTEMPTS, 3);
});

test("parseArgs understands --dry-run and --limit", () => {
  assert.deepEqual(renotify.parseArgs([]), { dryRun: false, limit: 20 });
  assert.deepEqual(renotify.parseArgs(["--dry-run"]), { dryRun: true, limit: 20 });
  assert.deepEqual(renotify.parseArgs(["--limit", "5"]), { dryRun: false, limit: 5 });
  assert.deepEqual(renotify.parseArgs(["--limit", "9999"]), { dryRun: false, limit: 100 });
  assert.deepEqual(renotify.parseArgs(["--limit", "not-a-number"]), { dryRun: false, limit: 20 });
});

test("the selection query can only touch post-cutover, retryable, unresolved rows", async () => {
  const captured = [];
  const original = pool.query.bind(pool);
  pool.query = async (sql, params) => {
    captured.push({ sql: String(sql).replace(/\s+/g, " "), params });
    return { rows: [], rowCount: 0 };
  };

  try {
    const summary = await renotify.runRenotify({ dryRun: true, limit: 7 });
    assert.equal(summary.scanned, 0);

    const selection = captured[0];
    assert.match(selection.sql, /notification_status IN \('pending', 'failed'\)/);
    assert.match(selection.sql, /notification_attempts < \$1/);
    assert.match(selection.sql, /created_at >= \$2/);
    assert.deepEqual(selection.params, [3, "2026-11-05T00:00:00.000Z", 7]);
    assert.equal(captured.some((entry) => /^UPDATE/i.test(entry.sql)), false, "dry-run must not write");
  } finally {
    pool.query = original;
  }
});

test("a dry run with candidates sends nothing", async () => {
  const captured = [];
  const original = pool.query.bind(pool);
  pool.query = async (sql, params) => {
    captured.push({ sql: String(sql).replace(/\s+/g, " ") });
    if (/^SELECT/i.test(String(sql).trim())) {
      return {
        rows: [
          {
            id: "11111111-1111-1111-1111-111111111111",
            created_at: new Date(),
            name: "N",
            email: "e@example.com",
            phone: null,
            company: null,
            service_1: null,
            service_2: null,
            message: "m",
            source_page: "/x",
            notification_attempts: 1,
          },
        ],
        rowCount: 1,
      };
    }
    return { rows: [], rowCount: 0 };
  };

  try {
    const summary = await renotify.runRenotify({ dryRun: true, limit: 10 });
    assert.equal(summary.scanned, 1);
    assert.equal(summary.sent, 0);
    assert.equal(captured.some((entry) => /^UPDATE/i.test(entry.sql)), false);
  } finally {
    pool.query = original;
  }
});
