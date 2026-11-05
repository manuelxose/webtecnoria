// Operator convenience: run the whole API test suite with one command.
//
//   node --import tsx scripts/api-tests/run-all.mjs
//
// NOT part of the task's Verify block. It exists so a human does not have to
// remember the glob. It never hides failures: the child's exit code is
// propagated verbatim.
//
// GROWTH-04 P0-5a: the previous version passed the glob as a string to
// `node --test`. Node does not expand globs itself (that is the shell's job), and
// `/bin/sh` on Ubuntu (dash) has no globstar, so `scripts/api-tests/*.test.mjs`
// was passed through literally and matched nothing. A runner that discovers zero
// files still exits 0, so a "green" API suite could contain no tests at all.
// The files are now expanded in JS, the list is passed explicitly, and an empty
// list is a hard failure.
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const TEST_DIR = "scripts/api-tests";

const files = readdirSync(TEST_DIR)
  .filter((name) => name.endsWith(".test.mjs"))
  .sort((left, right) => left.localeCompare(right))
  .map((name) => join(TEST_DIR, name));

if (files.length === 0) {
  console.error(`no test files found in ${TEST_DIR}/*.test.mjs - refusing to report a green run`);
  process.exit(1);
}

console.log(`running ${files.length} API test files:`);
for (const file of files) {
  console.log(`  ${file}`);
}

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", ...files],
  { stdio: "inherit", cwd: process.cwd() }
);

if (result.error) {
  console.error(`could not start the test runner: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
