// G-3 (entry-point resolution) and G-5 (4xx mapping in the terminal error
// middleware). Both exercise the REAL apps/api/src/index.ts.
import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { VALID_PAYLOAD } from "./helpers.mjs";

const { app, isDirectEntryPoint } = await import("../../apps/api/src/index.js");

const INDEX_SOURCE = fileURLToPath(new URL("../../apps/api/src/index.ts", import.meta.url));
const INDEX_DIST = join(process.cwd(), "apps", "api", "dist", "index.js");

function apiEnv(overrides = {}) {
  return {
    ...process.env,
    NODE_ENV: "test",
    // A port nobody listens on: start() must run and then report an unreachable DB.
    DATABASE_URL: "postgres://tecnoria_api:tecnoria@127.0.0.1:1/tecnoria",
    JWT_SECRET: "direct-run-secret-0123456789",
    GOOGLE_CLIENT_ID: "test-google-client-id",
    SMTP_HOST: "127.0.0.1",
    SMTP_PORT: "1025",
    SMTP_USER: "direct-run",
    SMTP_PASS: "direct-run",
    SMTP_FROM: "no-reply@example.com",
    ADMIN_NOTIFICATION_EMAIL: "admin@example.com",
    ...overrides,
  };
}

async function listen(instance = app) {
  const server = instance.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  return { server, baseUrl: `http://127.0.0.1:${server.address().port}` };
}

test("G-3: the entry-point check resolves both sides (symlinked argv[1] still matches)", () => {
  const moduleUrl = pathToFileURL(INDEX_SOURCE).href;

  assert.equal(isDirectEntryPoint(INDEX_SOURCE, moduleUrl), true, "the module itself is the entry point");
  assert.equal(
    isDirectEntryPoint(join(dirname(INDEX_SOURCE), "..", basename(dirname(INDEX_SOURCE)), basename(INDEX_SOURCE)), moduleUrl),
    true,
    "a path containing '..' must resolve to the same file"
  );
  assert.equal(
    isDirectEntryPoint(join(dirname(INDEX_SOURCE), "..", "index.ts"), moduleUrl),
    false,
    "a different file is not the entry point"
  );
  assert.equal(isDirectEntryPoint(undefined, moduleUrl), false);
});

test("G-3: importing the module does not start a listener (no SIGTERM handler registered)", async () => {
  // start() is what registers the signal handlers; importing must not.
  const before = process.listenerCount("SIGTERM");
  await import("../../apps/api/src/index.js");
  assert.equal(process.listenerCount("SIGTERM"), before, "import must not bootstrap the server");
});

test("G-3: running the built dist as a script DOES bootstrap (and reports an unreachable DB)", (t) => {
  if (!existsSync(INDEX_DIST)) {
    t.diagnostic("dist/index.js missing; run npm run build:api first");
    t.skip("built API not present");
    return;
  }

  const direct = spawnSync(process.execPath, [INDEX_DIST], { env: apiEnv(), encoding: "utf8", timeout: 60000 });
  assert.notEqual(direct.status, 0, "start() ran, so the DB check must fail loudly instead of exiting 0");
  assert.match(
    `${direct.stdout}${direct.stderr}`,
    /database is not reachable/,
    `expected the startup DB failure, got: ${(direct.stdout || direct.stderr || "").slice(0, 300)}`
  );
});

test("G-3: a symlinked checkout cannot silently skip start() (junction + built dist)", (t) => {
  if (!existsSync(INDEX_DIST)) {
    t.skip("built API not present");
    return;
  }

  const root = mkdtempSync(join(tmpdir(), "entrypoint-"));
  const linkPath = join(root, "linked-dist");

  try {
    // Junctions work on Windows without elevation; fall back to a real symlink.
    try {
      symlinkSync(join(process.cwd(), "apps", "api", "dist"), linkPath, "junction");
    } catch {
      symlinkSync(join(process.cwd(), "apps", "api", "dist"), linkPath, "dir");
    }
  } catch (error) {
    t.diagnostic(`could not create a symlink here (${error.code ?? error.message}); G-3 symlink case not exercised`);
    t.skip("no symlink support");
    return;
  }

  // argv[1] is the SYMLINK path; import.meta.url resolves to the real file.
  // Before the fix, the comparison failed and the process exited 0 with nothing
  // listening — a silent restart loop under systemd.
  const viaLink = spawnSync(process.execPath, [join(linkPath, "index.js")], {
    env: apiEnv(),
    encoding: "utf8",
    timeout: 60000,
  });

  assert.notEqual(viaLink.status, 0, "via a symlink, start() must still run");
  assert.match(
    `${viaLink.stdout}${viaLink.stderr}`,
    /database is not reachable/,
    "the symlinked entry point must reach the startup DB check, not exit 0"
  );
});

test("G-5: malformed JSON is a 400, not a 500", async () => {
  const { server, baseUrl } = await listen();
  try {
    const response = await fetch(`${baseUrl}/api/v1/contact`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{ this is not json",
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.code, "BAD_REQUEST");
    assert.equal(JSON.stringify(body).includes("INTERNAL"), false);
    assert.equal(JSON.stringify(body).toLowerCase().includes("stack"), false);
  } finally {
    await new Promise((resolve) => server.close(() => resolve()));
  }
});

test("G-5: a body over the express limit is a 413, not a 500", async () => {
  const { server, baseUrl } = await listen();
  try {
    const oversized = { ...VALID_PAYLOAD, message: "x".repeat(1_500_000) };
    const response = await fetch(`${baseUrl}/api/v1/contact`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(oversized),
    });
    const body = await response.json();

    assert.equal(response.status, 413);
    assert.equal(body.code, "PAYLOAD_TOO_LARGE");
  } finally {
    await new Promise((resolve) => server.close(() => resolve()));
  }
});
