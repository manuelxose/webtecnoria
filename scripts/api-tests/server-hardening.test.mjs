// The real application module: terminal error handling, pool error listener and
// graceful shutdown. These assertions import apps/api/src/index.ts itself (the
// direct-run guard keeps it from starting a listener).
import assert from "node:assert/strict";
import test from "node:test";

import { FakePool, VALID_PAYLOAD } from "./helpers.mjs";

const { app, shutdown, registerSignalHandlers } = await import("../../apps/api/src/index.js");
const { pool } = await import("../../apps/api/src/db/pool.js");

test("the pg pool has an error listener (an idle-client error must not kill the process)", () => {
  assert.ok(pool.listenerCount("error") >= 1, "pool.on('error') must be registered");
  assert.ok(pool instanceof Object);
});

test("SIGTERM/SIGINT handlers can be registered and shutdown resolves with exit code 0", async () => {
  const beforeSigterm = process.listenerCount("SIGTERM");
  const beforeSigint = process.listenerCount("SIGINT");

  registerSignalHandlers();

  assert.equal(process.listenerCount("SIGTERM"), beforeSigterm + 1);
  assert.equal(process.listenerCount("SIGINT"), beforeSigint + 1);

  // Exercise the shutdown sequence with an injected exit so the test process
  // survives. On Windows, POSIX signal delivery cannot be tested end to end;
  // this proves the handler's behaviour, and registerSignalHandlers proves the
  // wiring is in place for Linux.
  const exitCodes = [];
  await shutdown("SIGTERM", (code) => exitCodes.push(code));

  assert.deepEqual(exitCodes, [0], "graceful shutdown must exit 0");
});

test("an error thrown inside a request becomes a safe 500 INTERNAL with no stack trace", async () => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const originalQuery = pool.query.bind(pool);
  pool.query = async () => {
    throw new Error("simulated database outage: sensitive detail");
  };

  try {
    const response = await fetch(`${baseUrl}/api/v1/contact`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(VALID_PAYLOAD),
    });

    const body = await response.json();
    assert.equal(response.status, 500);
    assert.deepEqual(body, { code: "INTERNAL" });
    assert.equal(JSON.stringify(body).includes("sensitive detail"), false);
    assert.equal(JSON.stringify(body).includes("stack"), false);
  } finally {
    pool.query = originalQuery;
    await new Promise((resolve) => server.close(() => resolve()));
  }
});

test("the fake pool still satisfies the router contract used above", async () => {
  const fake = new FakePool();
  const result = await fake.query("SELECT 1");
  assert.equal(result.rows.length, 1);
});
