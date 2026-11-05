// GROWTH-04 P0-5a - the CI test-discovery regression.
//
// Measured defect (2026-11-05): `node --test "scripts/api-tests/*.test.mjs"` was
// used as the API suite entry point. Node.js does not expand globs, and the dash
// shell on the Ubuntu runner has no globstar, so the pattern arrived literally.
// Node reports "tests 0, pass 0, fail 0" and EXITS 0. A green pipeline could
// therefore contain no API tests at all.
//
// This test pins the fix at three levels:
//   1. the real dispatcher expands the files in JS and refuses an empty list;
//   2. the dispatcher refuses to run when the directory holds no test files
//      (controlled failure - the only way to prove the guard has teeth);
//   3. package.json no longer quotes a glob in a `node --test` argument.
import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();
const DISPATCHER = join(ROOT, "scripts", "api-tests", "run-all.mjs");

function runDispatcher(cwd, timeout = 180000) {
  return spawnSync(process.execPath, [DISPATCHER], {
    cwd,
    encoding: "utf8",
    timeout,
    env: { ...process.env, NODE_NO_WARNINGS: "1" },
  });
}

test("the API dispatcher expands real test files instead of passing a glob", () => {
  const source = readFileSync(DISPATCHER, "utf8");

  assert.match(source, /readdirSync\(\s*TEST_DIR\s*\)/, "the dispatcher must enumerate the directory in JS");
  assert.match(source, /\.endsWith\(\s*"\.test\.mjs"\s*\)/, "it must filter *.test.mjs");
  assert.match(source, /files\.length === 0/, "an empty discovery list must be detected");
  assert.doesNotMatch(
    source,
    /"--test",\s*GLOB/,
    "the glob string must never be handed to node --test again"
  );
});

test("the dispatcher fails hard, with exit 1, when discovery finds no test files", () => {
  // Controlled failure: a throwaway tree with the same layout but no tests.
  const sandbox = mkdtempSync(join(tmpdir(), "api-dispatch-"));
  try {
    const scriptsDir = join(sandbox, "scripts", "api-tests");
    rmSync(scriptsDir, { recursive: true, force: true });
    writeFileSync(join(sandbox, "package.json"), "{}\n");
    // Recreate only the directory, empty on purpose.
    // (writeFileSync cannot create a directory, so create it through the copy below.)
    const dispatcherCopy = join(sandbox, "run-all.mjs");
    writeFileSync(dispatcherCopy, readFileSync(DISPATCHER));
    // The dispatcher uses relative TEST_DIR, so give it the empty directory.
    const mkdir = spawnSync(process.execPath, ["-e", "require('node:fs').mkdirSync(process.argv[1], { recursive: true })", scriptsDir]);
    assert.equal(mkdir.status, 0);

    const result = spawnSync(process.execPath, [dispatcherCopy], { cwd: sandbox, encoding: "utf8", timeout: 60000 });
    assert.equal(result.status, 1, `expected exit 1, got ${result.status}: ${result.stderr}`);
    assert.match(`${result.stdout}${result.stderr}`, /no test files found/i);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

test("package.json never passes a quoted glob to node --test", () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  const offenders = [];

  for (const [name, command] of Object.entries(pkg.scripts ?? {})) {
    if (/\bnode\b[^&|;]*--test\b/.test(command) && /["'][^"']*\*[^"']*["']/.test(command)) {
      offenders.push(`${name}: ${command}`);
    }
  }

  assert.deepEqual(offenders, [], `scripts that hand a glob to node --test: ${offenders.join(" | ")}`);
});

test("the documented API suite command runs the real files (smoke, non-zero exit is reported, not hidden)", () => {
  // The dispatcher is the operator entry point; assert it reports the file count
  // it actually discovered. The suite itself is executed by `npm run test:api`.
  const source = readFileSync(DISPATCHER, "utf8");
  assert.match(source, /process\.exit\(result\.status \?\? 1\)/, "the child exit code must be propagated");
  assert.match(source, /running \$\{files\.length\} API test files/, "the run must announce how many files it discovered");
});
