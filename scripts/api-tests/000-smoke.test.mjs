// Smoke test: proves the .mjs harness can drive the TypeScript router through
// tsx, and that discovery via `node --import tsx --test scripts/api-tests/` works.
import assert from "node:assert/strict";
import test from "node:test";

import { FakePool, VALID_PAYLOAD, buildApp, loadContactModule, payloadWith, post } from "./helpers.mjs";

test("smoke: a valid submission is stored and answered with 201", async () => {
  const { createContactRouter } = await loadContactModule();
  const pool = new FakePool();
  const logs = [];
  const router = createContactRouter({
    pool,
    notify: async () => ({ status: "sent" }),
    limiter: { consume: () => ({ allowed: true, retryAfter: 0 }), size: () => 0, sweep: () => 0 },
    logger: { log: (entry) => logs.push(entry) },
  });

  const app = await buildApp({ router });
  try {
    const response = await post(app.baseUrl, VALID_PAYLOAD);
    assert.equal(response.status, 201);
    assert.equal(response.json.duplicate, false);
    assert.equal(response.json.notified, "sent");
    assert.equal(pool.rows.length, 1);
    assert.ok(logs.some((entry) => entry.event === "contact_lead_stored"));
    assert.equal(payloadWith({ name: "x" }).name, "x");
  } finally {
    await app.close();
  }
});
