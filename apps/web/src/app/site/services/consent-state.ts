/**
 * Pure consent state model (no Angular, no DOM).
 *
 * Kept dependency-free so the state machine can be exercised directly by
 * `scripts/tests/consent.test.mjs` with a fake Storage, while
 * `ConsentService` only adds the Angular/DOM plumbing on top.
 */

export const CONSENT_STORAGE_KEY = "tecnoria.consent.v1";
export const CONSENT_VERSION = 1;

/** AEPD expects cookie consent to be renewed; 24 months is the operative ceiling. */
export const CONSENT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 730;
/** Tolerance for a client clock that runs slightly ahead of the server. */
export const CONSENT_CLOCK_SKEW_MS = 60_000;

export interface ConsentRecord {
  version: 1;
  analytics: boolean;
  marketing: boolean;
  ts: string;
}

export interface ConsentSignals {
  analytics_storage: "granted" | "denied";
  ad_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  ad_personalization: "granted" | "denied";
}

/**
 * Builds a record. `marketing` is never inferred: the caller must pass it
 * explicitly, so accepting analytics cannot silently grant advertising.
 */
export function createConsentRecord(
  analytics: boolean,
  marketing: boolean,
  now: Date = new Date()
): ConsentRecord {
  return {
    version: CONSENT_VERSION,
    analytics: analytics === true,
    marketing: marketing === true,
    ts: now.toISOString(),
  };
}

/**
 * Returns the stored record, or `null` when the decision is undecided:
 * absent, unparseable, wrong version, wrong shape, in the future or stale.
 */
export function parseConsentRecord(
  raw: string | null | undefined,
  now: Date = new Date()
): ConsentRecord | null {
  if (typeof raw !== "string" || raw.length === 0) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  const candidate = parsed as Record<string, unknown>;
  if (candidate["version"] !== CONSENT_VERSION) {
    return null;
  }
  if (typeof candidate["analytics"] !== "boolean") {
    return null;
  }
  if (typeof candidate["marketing"] !== "boolean") {
    return null;
  }

  const ts = candidate["ts"];
  if (typeof ts !== "string") {
    return null;
  }

  const stamp = Date.parse(ts);
  if (Number.isNaN(stamp)) {
    return null;
  }
  if (stamp > now.getTime() + CONSENT_CLOCK_SKEW_MS) {
    return null;
  }
  if (now.getTime() - stamp > CONSENT_MAX_AGE_MS) {
    return null;
  }

  return {
    version: CONSENT_VERSION,
    analytics: candidate["analytics"],
    // G-11: the UI can no longer grant advertising, but a hand-edited or
    // leftover record could still say `marketing: true`. Clamping here means no
    // stored record can ever turn ad_storage/ad_user_data/ad_personalization on.
    marketing: false,
    ts,
  };
}

export function serializeConsentRecord(record: ConsentRecord): string {
  return JSON.stringify(record);
}

export function isAnalyticsGranted(record: ConsentRecord | null): boolean {
  return record?.analytics === true;
}

export function isMarketingGranted(record: ConsentRecord | null): boolean {
  return record?.marketing === true;
}

/**
 * Google Consent Mode v2 signals. Advertising signals follow the explicit
 * marketing choice only; accepting analytics leaves them denied.
 */
export function consentSignals(record: ConsentRecord | null): ConsentSignals {
  const analytics = record?.analytics === true ? "granted" : "denied";
  const marketing = record?.marketing === true ? "granted" : "denied";

  return {
    analytics_storage: analytics,
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
  };
}

const ANALYTICS_COOKIE_PATTERN = /^(?:_ga|_ga_.+|_gid|_gat.*|_gcl_.+)$/;

/** True for Google Analytics / Google Ads measurement cookies only. */
export function isAnalyticsCookieName(name: string): boolean {
  return ANALYTICS_COOKIE_PATTERN.test(name.trim());
}

/** Cookie names purged on withdrawal even before they exist in the jar. */
export const ANALYTICS_COOKIE_NAMES: readonly string[] = [
  "_ga",
  "_gid",
  "_gat",
  "_gcl_au",
  "_gcl_aw",
];

/**
 * Second-level labels that are public suffixes rather than registrable domains.
 * Deliberately small and explicit: it exists so the purge never invents
 * `.co.uk` as a cookie domain for `shop.example.co.uk`. If a host's suffix is
 * not listed here the helper simply skips the dotted-domain attempt, which
 * fails safe (the host-only cookie is still removed).
 */
const PUBLIC_SUFFIXES: ReadonlySet<string> = new Set([
  "co.uk",
  "org.uk",
  "ac.uk",
  "gov.uk",
  "me.uk",
  "com.au",
  "net.au",
  "org.au",
  "co.nz",
  "co.jp",
  "co.kr",
  "com.br",
  "com.mx",
  "co.za",
  "com.ar",
  "com.co",
  "com.tr",
  "es.com",
]);

/** True for hostnames where a `domain=` attribute must never be guessed. */
export function isIpOrLocalhost(hostname: string): boolean {
  if (!hostname) {
    return true;
  }

  const value = hostname.trim().toLowerCase();
  if (value.length === 0 || value === "localhost" || value.endsWith(".localhost")) {
    return true;
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(value)) {
    return true;
  }
  // IPv6 literals arrive bracketed or bare, always containing a colon.
  return value.includes(":");
}

/**
 * Cookie `domain=` values a purge should attempt for a host.
 *
 * `""` means "no domain attribute" (host-only cookies), which is what browsers
 * set for a bare `Set-Cookie: name=value`. For a real DNS name the host itself
 * and its registrable parent are added, so a cookie written with
 * `domain=.tecnoriasl.com` from `www.tecnoriasl.com` is still matched.
 */
export function cookieDomainsForHost(hostname: string): string[] {
  if (isIpOrLocalhost(hostname)) {
    return [""];
  }

  const labels = hostname.trim().toLowerCase().split(".").filter(Boolean);
  if (labels.length < 2) {
    return [""];
  }

  const base = labels.slice(-2).join(".");
  if (PUBLIC_SUFFIXES.has(base)) {
    // `example.co.uk`: `.co.uk` is a public suffix, not ours to write to.
    return ["", hostname.trim()];
  }

  return ["", hostname.trim(), `.${base}`];
}

/**
 * The exact `document.cookie` assignments that expire every given name across
 * every given domain variant. Pure, so it can be asserted without a browser.
 */
export function analyticsCookieDeletionStrings(
  names: Iterable<string>,
  domains: readonly string[]
): string[] {
  const deletions: string[] = [];

  for (const name of new Set(names)) {
    for (const domain of domains) {
      const suffix = domain ? `; domain=${domain}` : "";
      deletions.push(`${name}=; Max-Age=0; path=/${suffix}; SameSite=Lax`);
    }
  }

  return deletions;
}

/**
 * F-1: committing a record without analytics — "Rechazar" or a saved selection
 * that excludes analytics — is substantively a withdrawal, so the measurement
 * cookies must be purged exactly as on explicit withdrawal. Kept pure so the
 * rule is asserted directly instead of inferred from the service.
 */
export function shouldPurgeAnalyticsCookies(record: ConsentRecord | null): boolean {
  return record?.analytics !== true;
}
