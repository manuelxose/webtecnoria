// Operator convenience: run the whole API test suite with one command.
//
//   node --import tsx scripts/api-tests/run-all.mjs
//
// NOT part of the task's Verify block. It exists so a human does not have to
// remember the glob. It never hides failures: the child's exit code is
// propagated verbatim.
import { spawnSync } from "node:child_process";

const GLOB = "scripts/api-tests/*.test.mjs";

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", GLOB],
  { stdio: "inherit", cwd: process.cwd() }
);

if (result.error) {
  console.error(`could not start the test runner: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
