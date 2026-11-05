// Static guard for the G-1 class: a migration that MUTATES DATA.
//
// The twice-apply guard runs on empty tables, so it cannot see an
// `UPDATE blog_posts SET status='publish'` — it succeeds twice and silently
// republishes every draft on each release. This test reads the SQL instead:
// any UPDATE / DELETE / TRUNCATE statement outside a DO block is a failure.
//
// It never edits the real migrations: the "guard has teeth" case runs against
// an in-memory sample.
import assert from "node:assert/strict";
import test from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = join(process.cwd(), "apps", "api", "migrations");

/** Removes comments and the bodies of DO $$ … $$ blocks. */
function stripNonStatementText(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--[^\n]*/g, " ")
    .replace(/DO\s*\$\$[\s\S]*?\$\$\s*;?/gi, " ");
}

/**
 * Returns the offending statements of a migration body: any statement that
 * STARTS with UPDATE, DELETE or TRUNCATE. `ON DELETE CASCADE` inside a CREATE
 * TABLE is not a statement start and is correctly ignored.
 */
export function findUnguardedMutations(sql) {
  const stripped = stripNonStatementText(sql);
  return stripped
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => /^(UPDATE|DELETE|TRUNCATE)\b/i.test(statement));
}

test("no migration mutates data outside a DO block", () => {
  const files = readdirSync(MIGRATIONS_DIR).filter((name) => name.endsWith(".sql")).sort();
  assert.ok(files.length > 0, "expected migrations to exist");

  const offenders = [];
  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    for (const statement of findUnguardedMutations(sql)) {
      offenders.push(`${file}: ${statement.replace(/\s+/g, " ").slice(0, 120)}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `unguarded data mutation(s) found — with MIGRATE=1 these run on every deploy:\n${offenders.join("\n")}`
  );
});

test("the guard has teeth: an unguarded UPDATE is detected", () => {
  const bad = `
    ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS status TEXT;
    UPDATE blog_posts SET status = 'publish' WHERE status IS NULL;
  `;

  const found = findUnguardedMutations(bad);
  assert.equal(found.length, 1, "the guard must catch the G-1 statement");
  assert.match(found[0], /^UPDATE blog_posts/i);
});

test("the guard catches DELETE and TRUNCATE too", () => {
  assert.equal(findUnguardedMutations("DELETE FROM leads;").length, 1);
  assert.equal(findUnguardedMutations("TRUNCATE contact_messages;").length, 1);
});

test("the guard allows a mutation inside a DO block, and ignores ON DELETE CASCADE", () => {
  const guarded = `
    DO $$
    BEGIN
      UPDATE blog_posts SET status = 'publish' WHERE status IS NULL;
    END $$;
  `;
  assert.deepEqual(findUnguardedMutations(guarded), []);

  const foreignKey = `
    CREATE TABLE IF NOT EXISTS ticket_messages (
      ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE
    );
  `;
  assert.deepEqual(findUnguardedMutations(foreignKey), []);
});
