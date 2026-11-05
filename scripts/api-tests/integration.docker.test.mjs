// End-to-end integration: real Postgres (postgres:16-alpine) + real SMTP
// (mailpit) via infra/docker-compose.dev.yml. Proves the migration applies on a
// fresh database, a submission stores exactly one row and delivers exactly one
// email, and a duplicate idempotency key adds neither a row nor a second email.
//
// Skips gracefully when Docker is unavailable.
import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { VALID_PAYLOAD } from "./helpers.mjs";

const ROOT = process.cwd();
const COMPOSE = [
  "compose",
  "-p",
  "tecnoria-w2",
  "-f",
  "infra/docker-compose.dev.yml",
  "-f",
  "scripts/api-tests/compose.override.yml",
];
const PG_SERVICE = "postgres-dev";
const MAILPIT_API = "http://127.0.0.1:18025/api/v1";
// Dedicated loopback ports (see compose.override.yml): the shared 5432 on this
// host is answered by an unrelated PostgreSQL instance, so the test must never
// address it.
const HOST_DATABASE_URL = "postgres://postgres:postgres@127.0.0.1:55432/tecnoria";
const HOST_SMTP_PORT = "11025";

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    input: options.input,
    timeout: options.timeout ?? 120000,
    env: { ...process.env, ...(options.env ?? {}) },
  });
}

function dockerAvailable() {
  const result = run("docker", ["info", "--format", "{{.ServerVersion}}"]);
  return result.status === 0;
}

/**
 * Resolves the container's own bridge address.
 *
 * Never assume 127.0.0.1:5432 is our container: on this host that address is
 * answered by an unrelated PostgreSQL instance (Ubuntu build, databases
 * tecnoria / tecnoria_chat / content_ai), and a test pointed there would write
 * leads into somebody else's database. The container IP is reachable from the
 * host and can only be the database we just started.
 */
function containerIp(service) {
  const id = run("docker", [...COMPOSE, "ps", "-q", service]).stdout.trim();
  if (!id) {
    throw new Error(`no container for service ${service}`);
  }

  const ip = run("docker", ["inspect", "-f", "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}", id]).stdout.trim();
  if (!ip) {
    throw new Error(`could not resolve an address for ${service}`);
  }

  return ip;
}

function psql(sql, database = "tecnoria") {
  const result = run("docker", [...COMPOSE, "exec", "-T", PG_SERVICE, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", database, "-At", "-c", sql]);
  if (result.status !== 0) {
    throw new Error(`psql failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout.trim();
}

function psqlFile(sql) {
  const result = run("docker", [...COMPOSE, "exec", "-T", PG_SERVICE, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "tecnoria"], {
    input: sql,
  });
  if (result.status !== 0) {
    throw new Error(`migration failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

async function waitForPostgres() {
  for (let attempt = 0; attempt < 60; attempt++) {
    const result = run("docker", [...COMPOSE, "exec", "-T", PG_SERVICE, "pg_isready", "-U", "postgres"]);
    if (result.status === 0) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("postgres did not become ready");
}

async function waitForMailpit() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(`${MAILPIT_API}/messages`);
      if (response.ok) {
        return;
      }
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("mailpit did not become ready");
}

test("Docker integration: fresh DB, real submission, real email, idempotent duplicate", { timeout: 300000 }, async (t) => {
  if (!dockerAvailable()) {
    t.skip("Docker is not available on this host");
    return;
  }

  const up = run("docker", [...COMPOSE, "up", "-d", "--wait", PG_SERVICE, "mailpit-dev"], { timeout: 240000 });
  assert.equal(up.status, 0, `compose up failed: ${up.stderr}`);

  try {
    await waitForPostgres();
    await waitForMailpit();

    // Fresh database, so the migration is proven to apply cleanly from scratch.
    psql("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'tecnoria' AND pid <> pg_backend_pid()", "postgres");
    psql("DROP DATABASE IF EXISTS tecnoria", "postgres");
    psql("CREATE DATABASE tecnoria", "postgres");

    const migrations = readdirSync(join(ROOT, "apps", "api", "migrations"))
      .filter((name) => name.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b));

    for (const migration of migrations) {
      psqlFile(readFileSync(join(ROOT, "apps", "api", "migrations", migration), "utf8"));
    }

    assert.equal(psql("SELECT count(*) FROM contact_messages"), "0", "fresh database must be empty");
    assert.match(psql("SELECT current_database()"), /^tecnoria$/);

    const containerColumns = psql(
      "SELECT count(*) FROM information_schema.columns WHERE table_name = 'contact_messages'"
    );
    assert.equal(containerColumns, "18", "migration 009 must add the nine new columns to the nine existing ones");
    assert.equal(
      psql("SELECT count(*) FROM information_schema.columns WHERE table_name = 'contact_messages' AND column_name = 'notification_status'"),
      "1"
    );
    assert.equal(
      psql("SELECT column_default FROM information_schema.columns WHERE table_name='contact_messages' AND column_name='notification_status'"),
      "'legacy'::text",
      "notification_status must default to legacy so historical rows are never re-notified"
    );

    const indexDefinition = psql(
      "SELECT indexdef FROM pg_indexes WHERE indexname = 'idx_contact_messages_idempotency_key'"
    );
    assert.match(indexDefinition, /CREATE UNIQUE INDEX/i);
    assert.match(indexDefinition, /WHERE \(idempotency_key IS NOT NULL\)/i);

    // Point the app at the container before loading the modules that read env.
    // The container address, not 127.0.0.1: the shared host port 5432 belongs to
    // an unrelated server on this machine.
    const databaseHost = "127.0.0.1:55432";
    process.env["DATABASE_URL"] = HOST_DATABASE_URL;
    process.env["SMTP_HOST"] = "127.0.0.1";
    process.env["SMTP_PORT"] = HOST_SMTP_PORT;
    process.env["SMTP_USER"] = "mailpit";
    process.env["SMTP_PASS"] = "mailpit";
    process.env["SMTP_FROM"] = "no-reply@tecnoriasl.com";
    process.env["ADMIN_NOTIFICATION_EMAIL"] = "oficina@tecnoriasl.com";

    const mailpitInfo = await (await fetch(`${MAILPIT_API}/info`)).json();
    assert.ok(mailpitInfo.Version, "the mail sink must identify itself as Mailpit");

    // Guard: the application must talk to the container we just migrated, not to
    // whatever answers on the shared host port. A wrong target here would write
    // test leads into an unrelated database.
    const { default: pg } = await import("pg");
    const guardPool = new pg.Pool({ connectionString: process.env["DATABASE_URL"], connectionTimeoutMillis: 5000 });
    try {
      const guard = await guardPool.query(
        "select current_database() as db, (select count(*) from information_schema.columns where table_name='contact_messages') as cols"
      );
      assert.equal(guard.rows[0].db, "tecnoria");
      assert.equal(String(guard.rows[0].cols), "18", "the app must reach the migrated container database");
    } finally {
      await guardPool.end();
    }

    const { app } = await import("../../apps/api/src/index.js");
    const { LEAD_SUBJECT } = await import("../../apps/api/src/services/notification.js");

    const server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    const captured = [];
    const originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk, encoding, callback) => {
      captured.push(String(chunk).trimEnd());
      const cb = typeof encoding === "function" ? encoding : callback;
      if (typeof cb === "function") cb();
      return true;
    };

    let first;
    let second;
    try {
      const post = () =>
        fetch(`${baseUrl}/api/v1/contact`, {
          method: "POST",
          headers: { "content-type": "application/json", "user-agent": "integration-test" },
          body: JSON.stringify(VALID_PAYLOAD),
        });

      const firstResponse = await post();
      first = { status: firstResponse.status, body: await firstResponse.json() };

      const secondResponse = await post();
      second = { status: secondResponse.status, body: await secondResponse.json() };
    } finally {
      process.stdout.write = originalWrite;
      await new Promise((resolve) => server.close(() => resolve()));
    }

    const logLines = captured.filter((line) => line.startsWith("{"));

    assert.equal(first.status, 201, JSON.stringify(first.body));
    assert.equal(first.body.notified, "sent", "mailpit must accept the notification");
    assert.equal(first.body.duplicate, false);

    assert.equal(second.status, 201);
    assert.equal(second.body.id, first.body.id, "the same idempotency key must return the same id");
    assert.equal(second.body.duplicate, true);
    assert.equal(second.body.notified, "skipped");

    assert.equal(psql("SELECT count(*) FROM contact_messages"), "1", "exactly one row for two POSTs");
    assert.equal(psql("SELECT notification_status FROM contact_messages"), "sent");
    assert.equal(psql("SELECT (notified_at IS NOT NULL)::text FROM contact_messages"), "true");
    assert.equal(psql("SELECT notification_attempts FROM contact_messages"), "1");
    assert.equal(psql("SELECT source_page FROM contact_messages"), "/contacto");
    assert.equal(psql("SELECT privacy_accepted::text FROM contact_messages"), "true");
    assert.match(psql("SELECT client_hash FROM contact_messages"), /^[0-9a-f]{16}$/);
    assert.equal(psql("SELECT user_agent_class FROM contact_messages"), "desktop");

    const messagesResponse = await fetch(`${MAILPIT_API}/messages`);
    const messages = await messagesResponse.json();

    assert.equal(messages.total, 1, `mailpit must hold exactly one message, got ${messages.total}`);
    const summary = messages.messages[0];
    assert.equal(summary.Subject, LEAD_SUBJECT);

    const detailResponse = await fetch(`${MAILPIT_API}/message/${summary.ID}`);
    const detail = await detailResponse.json();
    assert.ok(detail.Text.includes(VALID_PAYLOAD.name), "email body must carry the lead");
    assert.ok(detail.Text.includes(VALID_PAYLOAD.email));
    assert.equal(detail.Text.includes("127.0.0.1"), false, "the notification must not leak the client address");

    // The operator-facing log line, exactly as it reaches the journal.
    const storedLine = logLines.find((line) => line.includes("contact_lead_stored"));
    assert.ok(storedLine, `expected a contact_lead_stored line, got ${JSON.stringify(logLines)}`);
    const parsed = JSON.parse(storedLine);
    assert.equal(parsed.method, undefined);
    assert.equal(parsed.notified, "sent");
    assert.match(parsed.client, /^[0-9a-f]{16}$/);
    assert.equal(storedLine.includes(VALID_PAYLOAD.email), false);
    assert.equal(storedLine.includes("127.0.0.1"), false);

    const requestLine = logLines.find((line) => line.includes('"http_request"'));
    assert.ok(requestLine, "the access log line must exist for the submission");
    const parsedRequest = JSON.parse(requestLine);
    assert.equal(parsedRequest.path, "/api/v1/contact");
    assert.equal(parsedRequest.status, 201);
    assert.equal(typeof parsedRequest.durationMs, "number");

    console.log("MAILPIT_MESSAGES=" + JSON.stringify({ total: messages.total, subject: summary.Subject, to: summary.To.map((x) => x.Address) }));
    console.log("LOG_LINE_201=" + requestLine);
    console.log("LOG_LINE_STORED=" + storedLine);
    console.log("INDEX_DEF=" + indexDefinition);
  } finally {
    run("docker", [...COMPOSE, "down", "-v", "--remove-orphans"], { timeout: 180000 });
  }
});
