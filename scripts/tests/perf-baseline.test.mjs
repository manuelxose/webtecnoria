// GROWTH-03B — performance harness configuration invariants.
//
// These assertions protect the properties that make the baseline reproducible:
// the mobile device profile is fixed before navigation, the DPR is asserted
// rather than assumed, and the methodology never claims a metric it did not
// measure. They are static checks over the harness source plus the recorded
// result file, so they run in milliseconds and cannot silently drift.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const HARNESS = readFileSync(join(REPO_ROOT, "scripts", "perf-baseline.mjs"), "utf8");
const MANIFEST = JSON.parse(
  readFileSync(join(REPO_ROOT, "qa", "qa-manifest.json"), "utf8")
);
const RESULT_PATH = join(
  REPO_ROOT,
  "docs",
  "growth",
  "_team",
  "perf-baseline-2026-11-05-before-links.json"
);

test("the harness fixes a mobile profile with deviceScaleFactor 3", () => {
  assert.match(HARNESS, /deviceScaleFactor:\s*3\b/, "deviceScaleFactor must be 3");
  assert.match(HARNESS, /isMobile:\s*true|mobile:\s*true/, "the profile must be mobile");
  assert.match(HARNESS, /hasTouch:\s*true|setTouchEmulationEnabled/, "touch must be enabled");
  assert.match(HARNESS, /width:\s*390,\s*height:\s*844/, "the profile must be 390x844");
});

test("the effective devicePixelRatio is asserted, not assumed", () => {
  assert.match(
    HARNESS,
    /window\.devicePixelRatio/,
    "the harness must read window.devicePixelRatio back from the page"
  );
  // The read-back value must be compared against the expected DPR and the
  // sample invalidated on mismatch.
  assert.match(
    HARNESS,
    /effectiveDpr\s*!==\s*DEVICE\.deviceScaleFactor/,
    "the harness must compare the effective DPR against the expected DPR"
  );
  assert.match(HARNESS, /invalidReasons\.push/, "a DPR mismatch must invalidate the sample");
});

test("the harness does not claim Lighthouse or INP metrics", () => {
  // It may mention them in order to disclaim them, but must never emit them as
  // measured fields.
  assert.doesNotMatch(HARNESS, /lighthouseScore|performanceScore:\s*/);
  assert.doesNotMatch(HARNESS, /\bINP\b\s*[:=]/);
  assert.match(HARNESS, /blockingApprox|blocking/i, "the long-task approximation must be labelled");
});

test("the device profile is configured before the first measured navigation", () => {
  // NOTE: this is a source-text ordering check, not a runtime guarantee. The
  // runtime guarantee is the per-sample DPR read-back asserted above.
  const config = HARNESS.indexOf("setDeviceMetricsOverride");
  const measured = HARNESS.indexOf("Page.navigate");
  assert.ok(config > -1 && measured > -1);
  assert.ok(
    config < measured,
    "the device override must be issued before the first navigation in source order"
  );
});

test("the QA manifest registers a non-required perf-baseline stage", () => {
  const stage = MANIFEST.stages.find((entry) => entry.id === "perf-baseline");
  assert.ok(stage, "qa/qa-manifest.json must declare the perf-baseline stage");
  assert.equal(stage.required, false, "the perf stage must not gate delivery");
  assert.deepEqual(stage.argv, ["npm", "run", "perf:baseline"]);
  assert.ok(Array.isArray(stage.argv), "stages are argv arrays, never shell strings");
});

test("recorded results keep every sample configuration stable", (t) => {
  if (!existsSync(RESULT_PATH)) {
    t.skip("no recorded perf baseline in this checkout");
    return;
  }
  const result = JSON.parse(readFileSync(RESULT_PATH, "utf8"));
  const device = result.configuration.device;
  assert.equal(device.deviceScaleFactor, 3, "recorded DPR must be 3");
  assert.equal(device.viewportCssPx.width, 390);
  assert.equal(device.viewportCssPx.height, 844);
  assert.equal(device.mobile, true);

  for (const scenario of result.scenarios) {
    for (const run of scenario.runs ?? []) {
      for (const sample of run.samples ?? []) {
        if (sample.valid === false) {
          continue;
        }
        // No default: an absent field must fail, not silently count as 3.
        assert.equal(
          typeof sample.device?.effectiveDevicePixelRatio,
          "number",
          `${scenario.id} sample is missing an explicit effectiveDevicePixelRatio`
        );
        assert.equal(
          sample.device.effectiveDevicePixelRatio,
          3,
          `${scenario.id} has a sample measured at an unexpected DPR`
        );
      }
    }
  }
});
