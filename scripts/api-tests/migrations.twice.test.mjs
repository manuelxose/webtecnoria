// Migration guard: every file must be re-appliable.
//
// The runner re-applies EVERY migration on every deploy and there is no ledger,
// so a second pass that exits non-zero aborts the deploy before the API restart
// (MIGRATE=1 in infra/deploy-webtecnoria.sh). That is exactly how a bare
// CREATE TRIGGER in 006_support.sql (SQLSTATE 42710) blocked migration 009.
//
// This test is that guard: apply the whole set twice on a FRESH disposable
// database and fail if any file in either pass returns non-zero. It also runs
// the real runner (apps/api/src/scripts/migrate.ts) twice, which is the command
// the deploy actually executes.
import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const COMPOSE = [
  "compose",
  "-p",
  "tecnoria-w2-mig",
  "-f",
  "infra/docker-compose.dev.yml",
  "-f",
  "scripts/api-tests/compose.migrations.override.yml",
];
// Dedicated loopback port: the shared 5432 on this host answers an unrelated
// PostgreSQL instance, and 55432 belongs to the integration test.
const HOST_PORT = "55433";
const DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${HOST_PORT}/tecnoria_migrations`;
const DB_NAME = "tecnoria_migrations";

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
  return run("docker", ["info", "--format", "{{.ServerVersion}}"]).status === 0;
}

function psql(sql, database = DB_NAME) {
  const result = run("docker", [
    ...COMPOSE,
    "exec",
    "-T",
    "postgres-dev",
    "psql",
    "-v",
    "ON_ERROR_STOP=1",
    "-U",
    "postgres",
    "-d",
    database,
    "-At",
    "-c",
    sql,
  ]);

  if (result.status !== 0) {
    throw new Error(`psql failed: ${result.stderr || result.stdout}`);
  }

  return result.stdout.trim();
}

function psqlApply(sql, database = DB_NAME) {
  // ON_ERROR_STOP=1 is what makes a failing statement a non-zero exit, which is
  // the whole point of this guard.
  return run(
    "docker",
    [...COMPOSE, "exec", "-T", "postgres-dev", "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", database],
    { input: sql }
  );
}

async function waitForPostgres() {
  for (let attempt = 0; attempt < 60; attempt++) {
    const result = run("docker", [...COMPOSE, "exec", "-T", "postgres-dev", "pg_isready", "-U", "postgres"]);
    if (result.status === 0) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("postgres did not become ready");
}

const MIGRATIONS = readdirSync(join(ROOT, "apps", "api", "migrations"))
  .filter((name) => name.endsWith(".sql"))
  .sort((a, b) => a.localeCompare(b));

test("every migration applies twice on a fresh database (the deploy re-runs them all)", { timeout: 300000 }, async (t) => {
  if (!dockerAvailable()) {
    const message = "DOCKER UNAVAILABLE: the migration guard DID NOT RUN. Treat migrations as unverified.";
    if (process.env["CI"]) {
      // A skip in CI would silently remove the only protection against a
      // data-mutating or non-re-runnable migration, so it fails there instead.
      assert.fail(message);
    }
    t.diagnostic(message);
    t.skip("Docker is not available on this host");
    return;
  }

  // Discovered from the directory, not pinned: the next legitimate migration
  // must not break the suite for an innocent reason.
  assert.ok(MIGRATIONS.length > 0, "no migration files found");

  const up = run("docker", [...COMPOSE, "up", "-d", "--wait", "postgres-dev"], { timeout: 240000 });
  assert.equal(up.status, 0, `compose up failed: ${up.stderr}`);

  try {
    await waitForPostgres();

    psql(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid()`, "postgres");
    psql(`DROP DATABASE IF EXISTS ${DB_NAME}`, "postgres");
    psql(`CREATE DATABASE ${DB_NAME}`, "postgres");

    // Pass 1 and pass 2, per file, so a failure names the offending file.
    const failures = [];
    for (const pass of [1, 2]) {
      for (const file of MIGRATIONS) {
        const sql = readFileSync(join(ROOT, "apps", "api", "migrations", file), "utf8");
        const result = psqlApply(sql);
        if (result.status !== 0) {
          failures.push(`pass ${pass}: ${file} -> exit ${result.status}: ${(result.stderr || "").trim().split("\n").slice(-3).join(" | ")}`);
        }
      }
    }

    assert.deepEqual(failures, [], `migrations are not re-appliable:\n${failures.join("\n")}`);

    // Structural sanity after two full passes.
    assert.equal(
      psql("SELECT count(*) FROM information_schema.columns WHERE table_name = 'contact_messages'"),
      "18",
      "migration 009 must add nine columns to the nine existing ones, twice without duplicating"
    );
    assert.equal(
      psql("SELECT count(*) FROM pg_trigger WHERE tgname = 'trg_tickets_updated_at'"),
      "1",
      "the tickets trigger must exist exactly once after two passes"
    );
    assert.equal(
      psql("SELECT count(*) FROM pg_trigger WHERE tgname = 'trg_users_updated_at'"),
      "1",
      "the users trigger must exist exactly once after two passes"
    );
    assert.equal(
      psql("SELECT count(*) FROM pg_indexes WHERE indexname = 'idx_contact_messages_idempotency_key'"),
      "1"
    );

    // The real runner the deploy executes, twice, on a second fresh database.
    const runnerEnv = {
      ...process.env,
      NODE_ENV: "test",
      DATABASE_URL: DATABASE_URL.replace(DB_NAME, "tecnoria_migrations_runner"),
      JWT_SECRET: "migration-guard-secret-0123456789",
      GOOGLE_CLIENT_ID: "test-google-client-id",
      SMTP_HOST: "127.0.0.1",
      SMTP_PORT: "1025",
      SMTP_USER: "migration-guard",
      SMTP_PASS: "migration-guard",
      SMTP_FROM: "no-reply@example.com",
      ADMIN_NOTIFICATION_EMAIL: "admin@example.com",
    };

    psql("DROP DATABASE IF EXISTS tecnoria_migrations_runner", "postgres");
    psql("CREATE DATABASE tecnoria_migrations_runner", "postgres");

    for (const pass of [1, 2]) {
      const runner = run(process.execPath, ["--import", "tsx", "apps/api/src/scripts/migrate.ts"], {
        env: runnerEnv,
        timeout: 180000,
      });
      assert.equal(
        runner.status,
        0,
        `real runner pass ${pass} failed:\n${(runner.stderr || runner.stdout || "").split("\n").slice(-6).join("\n")}`
      );
      t.diagnostic(`runner pass ${pass}: exit 0 (${(runner.stdout || "").trim().split("\n").slice(-1)[0] ?? ""})`);
    }

    const runnerColumns = psql(
      "SELECT count(*) FROM information_schema.columns WHERE table_name = 'contact_messages'",
      "tecnoria_migrations_runner"
    );
    assert.equal(runnerColumns, "18");

    psql("DROP DATABASE IF EXISTS tecnoria_migrations_runner", "postgres");
  } finally {
    run("docker", [...COMPOSE, "down", "-v", "--remove-orphans"], { timeout: 180000 });
  }
});
