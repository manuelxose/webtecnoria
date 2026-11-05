#!/usr/bin/env node
// GROWTH-02 / tecnoriasl.com — headless daily measurement + deployment checklist.
//
// Answers the questions that must be re-checked on day 7 / 14 / 30 after the
// consent + analytics + lead-reliability work ships, without a browser:
//
//   1. the homepage still answers 200 and still ships a non-empty <title>;
//   2. the sitemap still parses and still lists URLs;
//   3. an unknown path really returns 404 (not a soft 404 with 200);
//   4. the served HTML carries the post-deployment consent invariants:
//      no static <script src="...googletagmanager.com..."> and an inline
//      consent default with analytics_storage:'denied'. A literal gtag('config')
//      is EXPECTED after deployment (it lives inside the consent-gated loader),
//      so it is not a failure signal any more.
//      NOTE: a served-HTML check cannot prove the absence of network
//      transmission — a runtime-injected script would not appear in the HTML.
//      scripts/browser-consent.mjs (real Chrome + CDP network capture) is the
//      authoritative proof for that; this monitor is a cheap daily tripwire.
//   5. the contact API rejects an invalid payload with 400 (so the endpoint is
//      reachable and validating — we never send a valid lead);
//   6. the TLS certificate still has enough days left;
//   7. TTFB from this host;
//   8. optionally, that a given release id is the one being served. When the
//      served HTML exposes no release identifier the result is UNKNOWN, with an
//      explanation — never a silent PASS.
//
// Usage:
//   node scripts/growth-monitor.mjs
//   node scripts/growth-monitor.mjs --base https://tecnoriasl.com --release 20261105_012220
//   node scripts/growth-monitor.mjs --out docs/growth/_team/monitor-run.json
//
// Exit code: 0 when every check is PASS or SKIP/UNKNOWN, 1 when any check FAILs.
// (A FAIL is a signal to look, not a crash: the JSON file is still written.)
//
// Safety: no dependency, no credential, no PII. The contact probe sends `{}`,
// which the API must reject; a random path is used for the 404 probe; nothing
// from the responses beyond status codes / counts is persisted.

import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { connect } from "node:tls";

const DEFAULT_BASE = "https://tecnoriasl.com";
const DEFAULT_OUT_DIR = "docs/growth/_team";
const HTTP_TIMEOUT_MS = 15_000;
const TTFB_BUDGET_MS = 2_000;
const TLS_MIN_DAYS = 14;

function arg(name, fallback = undefined) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) {
    return fallback;
  }
  const value = process.argv[index + 1];
  if (value === undefined || value.startsWith("--")) {
    return fallback;
  }
  return value;
}

function timestampSlug(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

async function timedFetch(url, init = {}) {
  const startedAt = performance.now();
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
      ...init,
    });
    const ttfbMs = Math.round(performance.now() - startedAt);
    return { ok: true, response, ttfbMs };
  } catch (error) {
    return { ok: false, error: error.message ?? String(error), ttfbMs: null };
  }
}

function tlsInfo(hostname) {
  return new Promise((resolvePromise) => {
    const socket = connect({ host: hostname, port: 443, servername: hostname, timeout: HTTP_TIMEOUT_MS });
    const finish = (value) => {
      socket.removeAllListeners();
      socket.destroy();
      resolvePromise(value);
    };
    socket.on("secureConnect", () => {
      try {
        const certificate = socket.getPeerCertificate();
        if (!certificate || !certificate.valid_to) {
          finish({ ok: false, error: "no peer certificate" });
          return;
        }
        const validTo = certificate.valid_to;
        const expiresAt = Date.parse(validTo);
        if (Number.isNaN(expiresAt)) {
          finish({ ok: false, error: `unparseable valid_to: ${validTo}` });
          return;
        }
        finish({
          ok: true,
          validTo,
          expiresAt: new Date(expiresAt).toISOString(),
          daysRemaining: Math.floor((expiresAt - Date.now()) / 86_400_000),
        });
      } catch (error) {
        finish({ ok: false, error: error.message ?? String(error) });
      }
    });
    socket.on("timeout", () => finish({ ok: false, error: "TLS timeout" }));
    socket.on("error", (error) => finish({ ok: false, error: error.message ?? String(error) }));
  });
}

function check(id, name, status, detail, extra = undefined) {
  return { id, name, status, detail, ...(extra ? { extra } : {}) };
}

function pass(id, name, detail, extra) {
  return check(id, name, "PASS", detail, extra);
}

function fail(id, name, detail, extra) {
  return check(id, name, "FAIL", detail, extra);
}

function skip(id, name, detail) {
  return check(id, name, "SKIP", detail);
}

async function run() {
  const base = (arg("base", DEFAULT_BASE) ?? DEFAULT_BASE).replace(/\/+$/, "");
  const expectedRelease = arg("release", null);
  const outPath = resolve(
    arg("out", `${DEFAULT_OUT_DIR}/monitor-${timestampSlug()}.json`) ?? `${DEFAULT_OUT_DIR}/monitor-${timestampSlug()}.json`
  );
  const hostname = new URL(base).hostname;
  const checks = [];
  const observations = {};

  // 1 + 2. Homepage: status, title, and the served HTML used by later checks.
  const home = await timedFetch(`${base}/`);
  let servedHtml = "";
  if (!home.ok) {
    checks.push(fail("home_http_200", "GET / returns 200", `request failed: ${home.error}`));
    checks.push(skip("home_title", "served HTML contains a <title>", "no HTML: homepage request failed"));
  } else {
    const status = home.response.status;
    servedHtml = await home.response.text();
    observations.homeStatus = status;
    observations.homeBytes = Buffer.byteLength(servedHtml, "utf8");
    observations.ttfbMs = home.ttfbMs;

    checks.push(
      status === 200
        ? pass("home_http_200", "GET / returns 200", `HTTP ${status}, ${observations.homeBytes} bytes`, { status })
        : fail("home_http_200", "GET / returns 200", `HTTP ${status}`)
    );

    const title = /<title>([^<]*)<\/title>/i.exec(servedHtml);
    const titleText = title ? title[1].trim() : "";
    observations.title = titleText || null;
    checks.push(
      titleText
        ? pass("home_title", "served HTML contains a <title>", `<title>${titleText}</title>`)
        : fail("home_title", "served HTML contains a <title>", "no non-empty <title> in served HTML")
    );
  }

  // 3. Sitemap: reachable, parseable, and still lists URLs.
  const sitemap = await timedFetch(`${base}/sitemap.xml`);
  if (!sitemap.ok) {
    checks.push(fail("sitemap_url_count", "sitemap.xml lists URLs", `request failed: ${sitemap.error}`));
  } else {
    const sitemapBody = await sitemap.response.text();
    const locCount = (sitemapBody.match(/<loc>/g) ?? []).length;
    observations.sitemapStatus = sitemap.response.status;
    observations.sitemapUrlCount = locCount;
    checks.push(
      sitemap.response.status === 200 && locCount > 0
        ? pass("sitemap_url_count", "sitemap.xml lists URLs", `HTTP 200, ${locCount} <loc> entries`, { locCount })
        : fail(
            "sitemap_url_count",
            "sitemap.xml lists URLs",
            `HTTP ${sitemap.response.status}, ${locCount} <loc> entries`
          )
    );
  }

  // 4. A genuinely unknown path must be a real 404 (soft-404 regression guard).
  const unknownPath = `/growth-monitor-${randomBytes(6).toString("hex")}`;
  const unknown = await timedFetch(`${base}${unknownPath}`);
  if (!unknown.ok) {
    checks.push(fail("unknown_path_404", "unknown path returns 404", `request failed: ${unknown.error}`));
  } else {
    observations.unknownPath = unknownPath;
    observations.unknownPathStatus = unknown.response.status;
    checks.push(
      unknown.response.status === 404
        ? pass("unknown_path_404", "unknown path returns 404", `GET ${unknownPath} -> HTTP 404`)
        : fail("unknown_path_404", "unknown path returns 404", `GET ${unknownPath} -> HTTP ${unknown.response.status}`)
    );
  }

  // 5a/5b. Post-deployment consent invariants in the served HTML.
  //
  // A literal gtag('config', …) is NOT a failure: the deferred loader in
  // index.html legitimately contains it, and only runs after consent. What must
  // not be there is a *static* <script src="...googletagmanager.com...">; what
  // must be there is the consent default that denies analytics before anything
  // else runs.
  //
  // Limits, stated on purpose: HTML inspection cannot prove that no request is
  // made at runtime. The authoritative proof is the real-browser suite
  // (scripts/browser-consent.mjs), which captures every network request before
  // and after consent.
  if (!servedHtml) {
    checks.push(skip("no_static_google_tag", "no static googletagmanager script tag in served HTML", "no HTML captured"));
    checks.push(skip("consent_default_present", "inline consent default denies analytics_storage", "no HTML captured"));
  } else {
    const staticTags =
      servedHtml.match(/<script[^>]*src="[^"]*googletagmanager\.com[^"]*"/gi) ?? [];
    observations.staticGoogleTagCount = staticTags.length;
    checks.push(
      staticTags.length === 0
        ? pass(
            "no_static_google_tag",
            "no static googletagmanager script tag in served HTML",
            "no <script src=...googletagmanager.com...> in the served HTML (a literal gtag('config') inside the gated loader is allowed)"
          )
        : fail(
            "no_static_google_tag",
            "no static googletagmanager script tag in served HTML",
            `${staticTags.length} static tag(s) in served HTML — expected zero once the consent bundle is deployed`
          )
    );

    const consentDefault = /['"]consent['"]\s*,\s*['"]default['"]/i.exec(servedHtml);
    const deniedNearby = consentDefault
      ? /analytics_storage['"]?\s*:\s*['"]denied['"]/i.test(
          servedHtml.slice(consentDefault.index, consentDefault.index + 600)
        )
      : false;
    observations.consentDefaultPresent = Boolean(consentDefault);
    observations.consentDefaultDeniesAnalytics = deniedNearby;

    checks.push(
      consentDefault && deniedNearby
        ? pass(
            "consent_default_present",
            "inline consent default denies analytics_storage",
            "gtag('consent','default', …) found with analytics_storage:'denied'"
          )
        : fail(
            "consent_default_present",
            "inline consent default denies analytics_storage",
            consentDefault
              ? "consent default found but analytics_storage:'denied' is not set next to it"
              : "no inline gtag('consent','default', …) in the served HTML (expected after the consent bundle is deployed)"
          )
    );
  }

  // 6. Contact API must reject an invalid payload with 400. We never send a
  //    valid lead: the body is `{}`, and only the status code is recorded.
  const contact = await timedFetch(`${base}/api/v1/contact`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  if (!contact.ok) {
    checks.push(fail("contact_rejects_invalid", "POST /api/v1/contact rejects an invalid payload", `request failed: ${contact.error}`));
  } else {
    observations.contactInvalidPayloadStatus = contact.response.status;
    checks.push(
      contact.response.status === 400
        ? pass("contact_rejects_invalid", "POST /api/v1/contact rejects an invalid payload", "HTTP 400 for body {}")
        : fail(
            "contact_rejects_invalid",
            "POST /api/v1/contact rejects an invalid payload",
            `HTTP ${contact.response.status} for body {} (expected 400; a 2xx would mean an empty lead can be created)`
          )
    );
  }

  // 7. TLS certificate life.
  const tls = await tlsInfo(hostname);
  if (!tls.ok) {
    checks.push(fail("tls_days_remaining", "TLS certificate has enough days left", `TLS check failed: ${tls.error}`));
  } else {
    observations.tls = tls;
    checks.push(
      tls.daysRemaining > TLS_MIN_DAYS
        ? pass("tls_days_remaining", "TLS certificate has enough days left", `${tls.daysRemaining} days (valid_to ${tls.validTo})`, { daysRemaining: tls.daysRemaining })
        : fail("tls_days_remaining", "TLS certificate has enough days left", `${tls.daysRemaining} days (valid_to ${tls.validTo}, threshold ${TLS_MIN_DAYS})`)
    );
  }

  // 8. TTFB budget (edge measurement from the machine running the check).
  if (observations.ttfbMs !== undefined) {
    checks.push(
      observations.ttfbMs < TTFB_BUDGET_MS
        ? pass("ttfb", "TTFB within budget", `${observations.ttfbMs} ms (budget ${TTFB_BUDGET_MS} ms)`, { ttfbMs: observations.ttfbMs })
        : fail("ttfb", "TTFB within budget", `${observations.ttfbMs} ms (budget ${TTFB_BUDGET_MS} ms)`)
    );
  } else {
    checks.push(skip("ttfb", "TTFB within budget", "homepage request failed"));
  }

  // 9. Release check. The served HTML currently exposes NO release identifier
  //    (no build id, no meta tag, no directory name), so this reports UNKNOWN
  //    with the reason instead of letting a SKIP look like a confirmation.
  //    UNKNOWN never fails the run; it says "cannot be established from here".
  const releaseMarker =
    /releases\/(\d{8}_\d{6})/.exec(servedHtml)?.[1] ??
    /data-release="([^"]+)"/i.exec(servedHtml)?.[1] ??
    null;
  observations.releaseExpected = expectedRelease ?? null;
  observations.releaseMarker = releaseMarker;

  if (!servedHtml) {
    checks.push(skip("release_id", "expected release id is the one served", "no HTML captured"));
  } else if (!expectedRelease) {
    checks.push(
      check(
        "release_id",
        "expected release id is the one served",
        "UNKNOWN",
        releaseMarker
          ? `no --release argument given; the served HTML exposes release marker "${releaseMarker}" but there is nothing to compare it against`
          : "no --release argument given and the served HTML exposes no release identifier; the served release cannot be confirmed from HTML"
      )
    );
  } else {
    const found = servedHtml.includes(expectedRelease);
    observations.releaseFound = found;
    checks.push(
      found
        ? pass("release_id", "expected release id is the one served", `"${expectedRelease}" found in served HTML`)
        : check(
            "release_id",
            "expected release id is the one served",
            "UNKNOWN",
            `"${expectedRelease}" not present in served HTML and the HTML exposes no release identifier${
              releaseMarker ? ` (marker found: "${releaseMarker}")` : ""
            }; the served release cannot be confirmed from HTML`
          )
    );
  }

  const failed = checks.filter((entry) => entry.status === "FAIL");
  const notes = [
    "Served-HTML checks (no_static_google_tag, consent_default_present) prove only what the HTML contains. They cannot prove the absence of network transmission: a script injected at runtime would not appear in the HTML. The authoritative proof is scripts/browser-consent.mjs (real Chrome + CDP request capture, before and after consent).",
  ];
  const report = {
    tool: "growth-monitor",
    version: 1,
    generatedAt: new Date().toISOString(),
    base,
    release: expectedRelease ?? null,
    overall: failed.length === 0 ? "PASS" : "FAIL",
    counts: {
      pass: checks.filter((entry) => entry.status === "PASS").length,
      fail: failed.length,
      skip: checks.filter((entry) => entry.status === "SKIP").length,
      unknown: checks.filter((entry) => entry.status === "UNKNOWN").length,
    },
    notes,
    observations,
    checks,
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const width = Math.max(...checks.map((entry) => entry.name.length), 5);
  console.log(`# growth-monitor  ${report.generatedAt}`);
  console.log(`# base            ${base}`);
  console.log(`# release         ${expectedRelease ?? "(not provided)"}`);
  console.log(`# output          ${outPath}`);
  console.log("# note            served-HTML checks cannot prove the absence of network transmission;");
  console.log("#                 the real-browser suite (scripts/browser-consent.mjs) is the authoritative proof.");
  console.log("");
  console.log(`${"STATUS".padEnd(8)}${"CHECK".padEnd(width + 2)}DETAIL`);
  console.log(`${"-".repeat(8)}${"-".repeat(width + 2)}${"-".repeat(40)}`);
  for (const entry of checks) {
    console.log(`${entry.status.padEnd(8)}${entry.name.padEnd(width + 2)}${entry.detail}`);
  }
  console.log("");
  console.log(`OVERALL ${report.overall}  (pass=${report.counts.pass} fail=${report.counts.fail} skip=${report.counts.skip} unknown=${report.counts.unknown})`);

  return report;
}

run()
  .then((report) => {
    process.exitCode = report.overall === "PASS" ? 0 : 1;
  })
  .catch((error) => {
    console.error(`growth-monitor crashed: ${error.message ?? error}`);
    process.exitCode = 2;
  });
