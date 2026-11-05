// Consent state machine — unit tests (node:test).
//
// Exercises the real pure module used by ConsentService. No Angular, no DOM:
// storage is faked and the state machine is driven exactly as the service does.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  ANALYTICS_COOKIE_NAMES,
  CONSENT_MAX_AGE_MS,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  analyticsCookieDeletionStrings,
  consentSignals,
  cookieDomainsForHost,
  createConsentRecord,
  isAnalyticsCookieName,
  isAnalyticsGranted,
  isMarketingGranted,
  parseConsentRecord,
  serializeConsentRecord,
  shouldPurgeAnalyticsCookies,
} from "../../apps/web/src/app/site/services/consent-state.ts";

const NOW = new Date("2026-11-05T01:00:00.000Z");

// Strips HTML comments (<!-- ... -->) and JS line/block comments from a
// document so that prose cannot trigger "executable code" assertions. The
// `[^:]` guard keeps protocol URLs like https:// intact.
function stripComments(source) {
  return source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

function createStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    key: (index) => Array.from(map.keys())[index] ?? null,
    get length() {
      return map.size;
    },
    dump: () => Object.fromEntries(map),
  };
}

function readFromStorage(storage) {
  return parseConsentRecord(storage.getItem(CONSENT_STORAGE_KEY), NOW);
}

test("storage key is the documented one", () => {
  assert.equal(CONSENT_STORAGE_KEY, "tecnoria.consent.v1");
  assert.equal(CONSENT_VERSION, 1);
});

test("absent record means undecided", () => {
  assert.equal(parseConsentRecord(null, NOW), null);
  assert.equal(parseConsentRecord(undefined, NOW), null);
  assert.equal(parseConsentRecord("", NOW), null);
});

test("corrupt records fall back to undecided instead of throwing", () => {
  const corrupt = [
    "not json",
    "{",
    "[]",
    "null",
    '"text"',
    "12",
    JSON.stringify({ version: 2, analytics: true, marketing: false, ts: NOW.toISOString() }),
    JSON.stringify({ version: 1, analytics: "yes", marketing: false, ts: NOW.toISOString() }),
    JSON.stringify({ version: 1, analytics: true, marketing: "no", ts: NOW.toISOString() }),
    JSON.stringify({ version: 1, analytics: true, ts: NOW.toISOString() }),
    JSON.stringify({ version: 1, analytics: true, marketing: false }),
    JSON.stringify({ version: 1, analytics: true, marketing: false, ts: "not-a-date" }),
    JSON.stringify({ version: 1, analytics: true, marketing: false, ts: 42 }),
  ];

  for (const raw of corrupt) {
    assert.equal(parseConsentRecord(raw, NOW), null, `expected null for ${raw}`);
  }
});

test("stale or future-dated records mean undecided", () => {
  const stale = new Date(NOW.getTime() - CONSENT_MAX_AGE_MS - 1000).toISOString();
  const future = new Date(NOW.getTime() + 10 * 60 * 1000).toISOString();

  assert.equal(
    parseConsentRecord(
      JSON.stringify({ version: 1, analytics: true, marketing: false, ts: stale }),
      NOW
    ),
    null
  );
  assert.equal(
    parseConsentRecord(
      JSON.stringify({ version: 1, analytics: true, marketing: false, ts: future }),
      NOW
    ),
    null
  );
});

test("accept stores analytics only and survives a reload", () => {
  const storage = createStorage();
  const record = createConsentRecord(true, false, NOW);

  storage.setItem(CONSENT_STORAGE_KEY, serializeConsentRecord(record));
  const restored = readFromStorage(storage);

  assert.deepEqual(restored, {
    version: 1,
    analytics: true,
    marketing: false,
    ts: NOW.toISOString(),
  });
  assert.equal(isAnalyticsGranted(restored), true);
  assert.equal(isMarketingGranted(restored), false);
});

test("marketing is never granted implicitly", () => {
  const accepted = createConsentRecord(true, false, NOW);
  const signals = consentSignals(accepted);

  assert.equal(accepted.marketing, false);
  assert.equal(signals.analytics_storage, "granted");
  assert.equal(signals.ad_storage, "denied");
  assert.equal(signals.ad_user_data, "denied");
  assert.equal(signals.ad_personalization, "denied");
});

test("explicit marketing choice maps to the advertising signals", () => {
  const signals = consentSignals(createConsentRecord(true, true, NOW));

  assert.equal(signals.analytics_storage, "granted");
  assert.equal(signals.ad_storage, "granted");
  assert.equal(signals.ad_user_data, "granted");
  assert.equal(signals.ad_personalization, "granted");
});

test("G-11: a stored record cannot grant advertising, even if it says marketing:true", () => {
  const storage = createStorage();
  // Hand-edited or leftover record: the UI can no longer produce this.
  storage.setItem(
    CONSENT_STORAGE_KEY,
    JSON.stringify({ version: 1, analytics: true, marketing: true, ts: NOW.toISOString() })
  );

  const restored = readFromStorage(storage);
  assert.ok(restored, "the record is still a valid decision");
  assert.equal(restored.analytics, true);
  assert.equal(restored.marketing, false, "parseConsentRecord must clamp marketing to false");

  const signals = consentSignals(restored);
  assert.equal(signals.analytics_storage, "granted");
  for (const signal of ["ad_storage", "ad_user_data", "ad_personalization"]) {
    assert.equal(signals[signal], "denied", `${signal} must stay denied from a stored record`);
  }
  assert.equal(isMarketingGranted(restored), false);
});

test("rejectAll denies every signal and keeps the decision", () => {
  const storage = createStorage();
  const rejected = createConsentRecord(false, false, NOW);
  storage.setItem(CONSENT_STORAGE_KEY, serializeConsentRecord(rejected));

  const restored = readFromStorage(storage);
  const signals = consentSignals(restored);

  assert.equal(restored === null, false, "a reject is a decision, not an undecided state");
  assert.equal(isAnalyticsGranted(restored), false);
  assert.deepEqual(signals, {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
});

test("withdraw clears the record and denies every signal", () => {
  const storage = createStorage();
  storage.setItem(
    CONSENT_STORAGE_KEY,
    serializeConsentRecord(createConsentRecord(true, true, NOW))
  );

  // Withdrawal is implemented as removeItem + in-memory null.
  storage.removeItem(CONSENT_STORAGE_KEY);
  const afterWithdraw = readFromStorage(storage);

  assert.equal(afterWithdraw, null);
  assert.deepEqual(consentSignals(afterWithdraw), {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
});

test("only Google analytics/advertising cookies are purge candidates", () => {
  for (const name of ["_ga", "_ga_LE6ETPWL23", "_gid", "_gat_gtag_123", "_gcl_au", "_gcl_aw"]) {
    assert.equal(isAnalyticsCookieName(name), true, `${name} should be purgeable`);
  }

  for (const name of ["tecnoria_session", "__cf_bm", "cf_clearance", "tecnoria.consent.v1", "_hp"]) {
    assert.equal(isAnalyticsCookieName(name), false, `${name} must not be purged`);
  }

  assert.ok(ANALYTICS_COOKIE_NAMES.includes("_ga"));
});

test("index.html ships a denied consent default and a deferred, never-invoked loader", () => {
  const html = readFileSync(
    fileURLToPath(new URL("../../apps/web/src/index.html", import.meta.url)),
    "utf8"
  );

  // (a) No static third-party script tag: the Google tag can only be injected
  //     at runtime, from the consent-guarded loader.
  assert.doesNotMatch(html, /<script[^>]+src="https?:\/\/[^"]*googletagmanager\.com/i);

  // (b) The consent default denies all four signals and is applied before the
  //     loader is even defined.
  const defaultIndex = html.indexOf("'consent', 'default'");
  assert.ok(defaultIndex > 0, "consent default call is missing");
  const block = html.slice(defaultIndex, defaultIndex + 400);
  for (const signal of ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"]) {
    assert.match(block, new RegExp(`${signal}:\\s*'denied'`), `${signal} must default to denied`);
  }
  const loaderIndex = html.indexOf("window.__tecnoriaLoadAnalytics = function");
  assert.ok(loaderIndex > defaultIndex, "the consent default must precede the loader definition");

  // The measurement ID appears exactly once.
  const occurrences = html.match(/G-LE6ETPWL23/g) ?? [];
  assert.equal(occurrences.length, 1, "measurement ID must appear exactly once");

  // (c) The loader is defined here and is idempotent.
  assert.match(html, /window\.__tecnoriaLoadAnalytics = function/);
  assert.match(html, /__tecnoriaAnalyticsLoaded/);

  // (d) SINGLE ENTRY POINT: the inline script must not decide anything at boot.
  //     There is no second parser and no top-level invocation — ConsentService
  //     owns the decision (see the regression test below). This replaces the
  //     former "inline guard" assertion: an inline guard is exactly the second,
  //     weaker parser that diverged from parseConsentRecord in the first place.
  assert.doesNotMatch(html, /analyticsAllowed/, "the inline guard must be gone");
  assert.doesNotMatch(html, /localStorage/, "index.html must not read consent storage at boot");
  assert.doesNotMatch(html, /JSON\.parse/, "index.html must not parse the consent record at boot");
  assert.doesNotMatch(html, /record\.analytics/, "index.html must not evaluate the analytics flag");

  // The only textual occurrence of the loader call syntax is the definition
  // itself ("= function ()"); any other `__tecnoriaLoadAnalytics(` would be an
  // invocation. Count invocations outside the definition line, looking only at
  // executable text: HTML comments and JS comments are prose and must not
  // trigger the assertion, but a real call in executable script must.
  const definitionLine = html
    .split("\n")
    .find((line) => line.includes("window.__tecnoriaLoadAnalytics = function"));
  assert.ok(definitionLine, "loader definition line not found");
  const withoutDefinition = stripComments(html.replace(definitionLine, ""));
  assert.doesNotMatch(
    withoutDefinition,
    /__tecnoriaLoadAnalytics\s*\(/,
    "index.html must not invoke the loader; ConsentService is the only entry point"
  );

  // The config command may (and should) be written literally, but only inside
  // the deferred loader (the browser suite proves zero Google requests before
  // consent end to end).
  const configIndex = html.search(/\bgtag\('config'/);
  assert.ok(configIndex > loaderIndex, "the config command must live inside the deferred loader");
});

test("the boot path is gone: ConsentService is the single consent entry point", () => {
  const read = (relative) =>
    readFileSync(fileURLToPath(new URL(`../../${relative}`, import.meta.url)), "utf8");

  const html = read("apps/web/src/index.html");
  const service = read("apps/web/src/app/site/services/consent.service.ts");
  const analytics = read("apps/web/src/app/site/services/analytics.service.ts");

  // The loader is invoked exactly once in the whole web source, from the
  // consent service, and only behind the analytics-granted branch.
  const callers = [service, analytics].filter((source) =>
    /__tecnoriaLoadAnalytics\??\.?\(/.test(source.replace(/\.\?\.\(/g, ""))
  );
  assert.equal(callers.length, 1, "only consent.service.ts may call the analytics loader");
  assert.match(
    service,
    /ensureAnalyticsLoaded\(\): void \{[\s\S]*?if \(!this\.isAnalyticsGranted\(\)\)/,
    "ensureAnalyticsLoaded must gate on isAnalyticsGranted()"
  );
  assert.match(
    service,
    /private applySignals\([\s\S]*?if \(record\?\.analytics === true\) \{\s*this\.ensureAnalyticsLoaded\(\);/,
    "applySignals must be the only place that triggers the loader"
  );

  // No boot-time decision survived anywhere in the document.
  assert.doesNotMatch(html, /CONSENT_KEY/, "the boot block must not know the storage key");
});

test("parser equivalence for the record classes that used to diverge", () => {
  const now = NOW;
  const base = { version: 1, analytics: true, marketing: false, ts: now.toISOString() };

  const cases = [
    {
      label: "valid record",
      raw: JSON.stringify(base),
      expected: "accepted",
    },
    {
      label: "expired record (> 730 days)",
      raw: JSON.stringify({
        ...base,
        ts: new Date(now.getTime() - CONSENT_MAX_AGE_MS - 1000).toISOString(),
      }),
      expected: "rejected",
    },
    {
      label: "future record (> 60 s skew)",
      raw: JSON.stringify({
        ...base,
        ts: new Date(now.getTime() + 120_000).toISOString(),
      }),
      expected: "rejected",
    },
    {
      label: "missing ts",
      raw: JSON.stringify({ version: 1, analytics: true, marketing: false }),
      expected: "rejected",
    },
    {
      label: "wrong version",
      raw: JSON.stringify({ ...base, version: 2 }),
      expected: "rejected",
    },
  ];

  for (const testCase of cases) {
    const parsed = parseConsentRecord(testCase.raw, now);
    const actual = parsed ? "accepted" : "rejected";
    assert.equal(actual, testCase.expected, `${testCase.label}: expected ${testCase.expected}`);
  }

  // The inline script no longer has a second, weaker parser: the four classes
  // above cannot be decided anywhere except by parseConsentRecord.
  const html = readFileSync(
    fileURLToPath(new URL("../../apps/web/src/index.html", import.meta.url)),
    "utf8"
  );
  assert.doesNotMatch(html, /JSON\.parse|localStorage|Date\.parse/);
});

test("withdrawal sets gtag's opt-out switch and re-enabling clears it", () => {
  const service = readFileSync(
    fileURLToPath(
      new URL("../../apps/web/src/app/site/services/consent.service.ts", import.meta.url)
    ),
    "utf8"
  );

  // One shared constant for the measurement id, used by the opt-out switch.
  const idConstant = /export const GA_MEASUREMENT_ID = "([^"]+)";/.exec(service);
  assert.ok(idConstant, "GA_MEASUREMENT_ID must be exported from the consent service");
  assert.equal(idConstant[1], "G-LE6ETPWL23");

  // ... and it must equal the literal in index.html, so they cannot drift.
  const html = readFileSync(
    fileURLToPath(new URL("../../apps/web/src/index.html", import.meta.url)),
    "utf8"
  );
  const htmlIds = html.match(/G-LE6ETPWL23/g) ?? [];
  assert.equal(htmlIds.length, 1, "index.html keeps exactly one measurement id literal");
  assert.equal(htmlIds[0], idConstant[1], "index.html id must match GA_MEASUREMENT_ID");

  // The switch is set inside withdraw() and mirrored by applySignals().
  assert.match(service, /ga-disable-/, "the ga-disable prefix must exist");
  assert.match(
    service,
    /withdraw\(\): void \{[\s\S]*?this\.setGoogleAnalyticsDisabled\(true\);[\s\S]*?this\.clearAnalyticsCookies\(\);/,
    "withdraw() must set the opt-out switch before purging cookies"
  );
  assert.match(
    service,
    /private applySignals\([\s\S]*?this\.setGoogleAnalyticsDisabled\(record\?\.analytics !== true\);/,
    "applySignals must keep the switch in sync with the decision"
  );
});

// ---------------------------------------------------------------------------
// F-1: rejecting after accepting is a withdrawal, and must purge the cookies
// ---------------------------------------------------------------------------

/**
 * Minimal simulated cookie jar. `document.cookie = "..."` semantics: a
 * deletion string (Max-Age=0) removes the entry with the same name and the same
 * domain attribute, which is exactly what the browser does.
 */
function createCookieJar(hostname, entries) {
  const jar = new Map(entries.map((entry) => [`${entry.name}|${entry.domain ?? ""}`, entry.value]));

  return {
    get cookie() {
      return [...jar.entries()].map(([key, value]) => `${key.split("|")[0]}=${value}`).join("; ");
    },
    set cookie(raw) {
      const [pair, ...attributes] = String(raw).split(";");
      const [name] = pair.split("=");
      const domainMatch = attributes.map((a) => a.trim()).find((a) => a.toLowerCase().startsWith("domain="));
      const domain = domainMatch ? domainMatch.slice("domain=".length) : "";
      const maxAge = attributes.map((a) => a.trim()).find((a) => /^max-age=0$/i.test(a));
      const key = `${name.trim()}|${domain}`;
      if (maxAge) {
        jar.delete(key);
        return;
      }
      jar.set(key, pair.split("=").slice(1).join("="));
    },
    names: () => [...jar.keys()].map((key) => key.split("|")[0]),
    has: (name) => [...jar.keys()].some((key) => key.split("|")[0] === name),
    hostname,
  };
}

function applyPurge(jar, names, domains) {
  for (const deletion of analyticsCookieDeletionStrings(names, domains)) {
    jar.cookie = deletion;
  }
}

/** Mirrors ConsentService.clearAnalyticsCookies(): known names + names found in the jar. */
function purgeJar(jar) {
  const names = new Set(ANALYTICS_COOKIE_NAMES);
  for (const name of jar.names()) {
    if (isAnalyticsCookieName(name)) {
      names.add(name);
    }
  }
  applyPurge(jar, names, cookieDomainsForHost(jar.hostname));
}

test("F-1: a record without analytics requires the cookie purge", () => {
  const accepted = createConsentRecord(true, false, NOW);
  const rejected = createConsentRecord(false, false, NOW);

  assert.equal(shouldPurgeAnalyticsCookies(accepted), false);
  assert.equal(shouldPurgeAnalyticsCookies(rejected), true);
  assert.equal(shouldPurgeAnalyticsCookies(null), true);
});

test("F-1: accept then reject leaves no _ga/_ga_<id>/_gid/_gcl_* cookies", () => {
  const hostname = "www.tecnoriasl.com";
  const jar = createCookieJar(hostname, [
    { name: "_ga", value: "GA1.1.111.222", domain: "" },
    { name: "_ga_LE6ETPWL23", value: "GS1.1", domain: "" },
    { name: "_gid", value: "GA1.2.333", domain: "" },
    { name: "_gcl_au", value: "1.1", domain: "" },
    { name: "_ga", value: "GA1.1.444", domain: ".tecnoriasl.com" },
    { name: "tecnoria_session", value: "keep-me", domain: "" },
  ]);

  // Accepting must not purge anything.
  if (shouldPurgeAnalyticsCookies(createConsentRecord(true, false, NOW))) {
    purgeJar(jar);
  }
  assert.equal(jar.has("_ga"), true, "accepting must not delete measurement cookies");

  // Rejecting is a withdrawal.
  const rejected = createConsentRecord(false, false, NOW);
  assert.equal(isAnalyticsGranted(rejected), false);
  if (shouldPurgeAnalyticsCookies(rejected)) {
    purgeJar(jar);
  }

  for (const name of ["_ga", "_ga_LE6ETPWL23", "_gid", "_gcl_au"]) {
    assert.equal(jar.has(name), false, `${name} survived the rejection purge`);
  }
  assert.equal(jar.has("tecnoria_session"), true, "strictly-necessary cookies must survive");
  assert.equal(rejected.analytics, false);
  assert.equal(rejected.marketing, false);
});

test("F-1: the service purges from commit(), not only from withdraw()", () => {
  const service = stripComments(
    readFileSync(
      fileURLToPath(new URL("../../apps/web/src/app/site/services/consent.service.ts", import.meta.url)),
      "utf8"
    )
  );

  const commitBody = service.slice(service.indexOf("private commit("));
  const commitEnd = commitBody.indexOf("private applySignals(");
  const commit = commitBody.slice(0, commitEnd === -1 ? commitBody.length : commitEnd);

  assert.match(commit, /shouldPurgeAnalyticsCookies\(record\)/);
  assert.match(commit, /clearAnalyticsCookies\(\)/);
});

// ---------------------------------------------------------------------------
// F-8: the domain-scoped purge branch, which 127.0.0.1 can never exercise
// ---------------------------------------------------------------------------

test("F-8: cookie domains are derived for host names, and skipped for IPs", () => {
  assert.deepEqual(cookieDomainsForHost("127.0.0.1"), [""]);
  assert.deepEqual(cookieDomainsForHost("localhost"), [""]);
  assert.deepEqual(cookieDomainsForHost("::1"), [""]);
  assert.deepEqual(cookieDomainsForHost(""), [""]);

  assert.deepEqual(cookieDomainsForHost("tecnoriasl.com"), ["", "tecnoriasl.com", ".tecnoriasl.com"]);
  assert.deepEqual(cookieDomainsForHost("www.tecnoriasl.com"), [
    "",
    "www.tecnoriasl.com",
    ".tecnoriasl.com",
  ]);
});

test("F-8: a multi-label public suffix is never used as a cookie domain", () => {
  for (const host of ["shop.example.co.uk", "www.example.com.au", "a.b.example.co.jp"]) {
    const domains = cookieDomainsForHost(host);
    assert.deepEqual(domains, ["", host], `${host} must not produce a public-suffix domain`);
    for (const domain of domains) {
      assert.equal(/^\.(co|com|org|net|ac|gov|me)\.[a-z]{2}$/.test(domain), false, `${domain} is a public suffix`);
    }
  }
});

test("F-8: deletion strings cover the host-only and the dotted-domain variants", () => {
  const deletions = analyticsCookieDeletionStrings(["_ga"], cookieDomainsForHost("www.tecnoriasl.com"));

  assert.equal(deletions.length, 3);
  assert.ok(deletions.some((entry) => entry === "_ga=; Max-Age=0; path=/; SameSite=Lax"));
  assert.ok(deletions.some((entry) => entry.includes("domain=www.tecnoriasl.com")));
  assert.ok(deletions.some((entry) => entry.includes("domain=.tecnoriasl.com")));
});

test("F-8: the purge removes a cookie written with domain=.tecnoriasl.com", () => {
  const hostname = "www.tecnoriasl.com";
  const jar = createCookieJar(hostname, [
    { name: "_ga", value: "host-only", domain: "" },
    { name: "_ga_LE6ETPWL23", value: "dotted", domain: ".tecnoriasl.com" },
  ]);

  purgeJar(jar);

  assert.equal(jar.has("_ga"), false);
  assert.equal(jar.has("_ga_LE6ETPWL23"), false);
});
