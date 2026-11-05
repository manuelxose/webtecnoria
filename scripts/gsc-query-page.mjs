#!/usr/bin/env node
// Search Console query+page evidence tool (ENGINE: growth / GROWTH-03B).
//
// READ-ONLY. Auth: GOOGLE_APPLICATION_CREDENTIALS -> service-account JSON.
// Only the read-only scope is ever requested; the credential file and every
// credential value are never printed, logged or written to the export.
//
// Usage:
//   node scripts/gsc-query-page.mjs --out docs/growth/_team/gsc-query-page-YYYY-MM-DD.json
//   node scripts/gsc-query-page.mjs --out <path> [--site sc-domain:tecnoriasl.com]
//                                   [--dimensions query,page]
//
// Method notes:
//  - Search Analytics data is finalised with a ~2-3 day lag, so every window
//    ends at (today - FINALISATION_OFFSET_DAYS) UTC and starts N-1 days earlier.
//  - GSC dimension rows are NOT additive. The true totals for a window come
//    from the dimension-less query; the per-dimension tables are for ranking
//    and comparison, never for summing. See docs/growth/GROWTH-03-HANDOFF.md 2.4.
//  - The property is a domain property and therefore also contains the legacy
//    hosts clientes.tecnoriasl.com and cms.tecnoriasl.com. Those rows are kept
//    in the export (faithful raw data) and flagged by `host`; the analysis
//    set is the `*Target` arrays.

import { createSign } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const DEFAULT_SITE = "sc-domain:tecnoriasl.com";
const SCOPE_READ = "https://www.googleapis.com/auth/webmasters.readonly";
const FINALISATION_OFFSET_DAYS = 3;
const ROW_LIMIT = 25000;
const MAX_PAGES = 5;
const SEARCH_TYPE = "web";
const DATA_STATE = "all";
const API_HOST = "searchconsole.googleapis.com";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

// Domain property: the target host plus the legacy WordPress hosts.
const TARGET_HOSTS = ["tecnoriasl.com", "www.tecnoriasl.com"];
const LEGACY_HOSTS = ["clientes.tecnoriasl.com", "cms.tecnoriasl.com"];

// Windows are "last N COMPLETE days" measured from the finalisation offset.
const WINDOWS = [
  { label: "d28", days: 28 },
  { label: "d90", days: 90 },
  { label: "d480", days: 480 },
];

function b64url(input) {
  return Buffer.from(input).toString("base64url");
}

function loadServiceAccount() {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyPath) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS is not set");
  }
  let raw;
  try {
    raw = JSON.parse(readFileSync(keyPath, "utf8"));
  } catch (error) {
    // Never echo the path contents; the path itself may be sensitive.
    throw new Error(`credential file could not be parsed (${error.name})`);
  }
  if (raw.type !== "service_account" || !raw.client_email || !raw.private_key) {
    throw new Error("credential file is not a usable service account");
  }
  return raw;
}

async function getAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: serviceAccount.client_email,
    scope: SCOPE_READ,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(serviceAccount.private_key).toString("base64url")}`;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  if (!response.ok) {
    const code = body?.error ?? "unknown_error";
    const description = body?.error_description ?? "no description";
    throw new Error(
      `token request failed: HTTP ${response.status} google_error=${code} (${description})`
    );
  }
  if (!body?.access_token) {
    throw new Error(`token request succeeded with no access_token (HTTP ${response.status})`);
  }
  return body.access_token;
}

async function call(token, url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  return { ok: response.ok, status: response.status, body };
}

function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "(unparseable)";
  }
}

function isTargetHost(host) {
  return TARGET_HOSTS.includes(host);
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

// Last N COMPLETE (finalised) days, ending at today - FINALISATION_OFFSET_DAYS (UTC).
function windowRange(days, now = new Date()) {
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  end.setUTCDate(end.getUTCDate() - FINALISATION_OFFSET_DAYS);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

async function searchAnalyticsOnce(token, site, payload) {
  const url = `https://${API_HOST}/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;
  const result = await call(token, url, { method: "POST", body: JSON.stringify(payload) });
  if (!result.ok) {
    const code = result.body?.error?.code ?? "unknown";
    const status = result.body?.error?.status ?? "UNKNOWN";
    const message = result.body?.error?.message ?? "no message";
    throw new Error(
      `searchAnalytics failed: HTTP ${result.status} google_error_code=${code} status=${status} message=${message} payload=${JSON.stringify(payload)}`
    );
  }
  return result.body ?? {};
}

// Full pagination: keep asking with startRow until a page returns fewer than
// rowLimit rows. Hard stop at MAX_PAGES with an explicit truncation note.
async function searchAnalyticsPaged(token, site, basePayload, warnings, datasetLabel) {
  const rows = [];
  let startRow = 0;
  let pagesFetched = 0;
  let truncated = false;

  while (pagesFetched < MAX_PAGES) {
    const payload = { ...basePayload, rowLimit: ROW_LIMIT, startRow };
    const body = await searchAnalyticsOnce(token, site, payload);
    const page = Array.isArray(body.rows) ? body.rows : [];
    rows.push(...page);
    pagesFetched += 1;
    if (page.length < ROW_LIMIT) {
      break;
    }
    startRow += page.length;
    if (pagesFetched === MAX_PAGES) {
      truncated = true;
      warnings.push(
        `${datasetLabel}: pagination cap of ${MAX_PAGES} pages x ${ROW_LIMIT} rows reached at startRow=${startRow}; rows beyond that offset were NOT retrieved (hard cap, not an API error).`
      );
    }
  }

  return { rows, pagesFetched, truncated };
}

function toQueryPageRow(row) {
  const [query = "", page = ""] = Array.isArray(row.keys) ? row.keys : [];
  return {
    query,
    page,
    host: hostOf(page),
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? null,
  };
}

function toPageRow(row) {
  const [page = ""] = Array.isArray(row.keys) ? row.keys : [];
  return {
    page,
    host: hostOf(page),
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? null,
  };
}

function toQueryRow(row) {
  const [query = ""] = Array.isArray(row.keys) ? row.keys : [];
  return {
    query,
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? null,
  };
}

function hostBreakdown(rowsQueryPage) {
  const map = new Map();
  for (const row of rowsQueryPage) {
    const entry = map.get(row.host) ?? { host: row.host, rows: 0, clicks: 0, impressions: 0, target: isTargetHost(row.host) };
    entry.rows += 1;
    entry.clicks += row.clicks;
    entry.impressions += row.impressions;
    map.set(row.host, entry);
  }
  return [...map.values()].sort((a, b) => b.impressions - a.impressions);
}

function arg(name, fallback = undefined) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) {
    return fallback;
  }
  const value = process.argv[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`--${name} requires a value`);
  }
  return value;
}

async function main() {
  const out = arg("out");
  if (!out) {
    throw new Error("--out <path> is required (the raw JSON export path)");
  }
  const site = arg("site", process.env.GSC_SITE_URL_OVERRIDE ?? DEFAULT_SITE);
  const ambient = process.env.GSC_SITE_URL;
  if (ambient && ambient !== site) {
    console.warn(
      `# WARNING: ambient GSC_SITE_URL (${ambient}) ignored; querying ${site}. Use --site to target another property.`
    );
  }
  const dimensions = (arg("dimensions", "query,page") ?? "query,page")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (dimensions.length === 0) {
    throw new Error("--dimensions must list at least one dimension (e.g. query,page)");
  }

  const warnings = [];
  const serviceAccount = loadServiceAccount();
  const token = await getAccessToken(serviceAccount);

  console.log(`# service account: ${serviceAccount.client_email}`);
  console.log(`# property: ${site}`);
  console.log(`# scope: ${SCOPE_READ}`);
  console.log(`# primary dimensions: ${dimensions.join(",")}`);
  console.log(`# rowLimit=${ROW_LIMIT} maxPages=${MAX_PAGES} searchType=${SEARCH_TYPE} dataState=${DATA_STATE}`);

  const windows = [];
  for (const spec of WINDOWS) {
    const { startDate, endDate } = windowRange(spec.days);
    console.log(`# window ${spec.label}: ${startDate}..${endDate}`);

    const basePayload = {
      startDate,
      endDate,
      searchType: SEARCH_TYPE,
      dataState: DATA_STATE,
    };

    // (a) dimension-less total -> the ONLY source of true totals.
    const totalsBody = await searchAnalyticsOnce(token, site, { ...basePayload, dimensions: [] });
    const totalsRow = Array.isArray(totalsBody.rows) ? totalsBody.rows[0] : null;
    const totals = totalsRow
      ? {
          clicks: totalsRow.clicks ?? 0,
          impressions: totalsRow.impressions ?? 0,
          ctr: totalsRow.ctr ?? 0,
          position: totalsRow.position ?? null,
        }
      : null;
    if (!totals) {
      warnings.push(`${spec.label}: dimension-less query returned no rows; no true total available for this window.`);
    }

    // (b) dimensions ["page"], (c) dimensions ["query"], and the primary pair set.
    const pageSet = await searchAnalyticsPaged(
      token, site, { ...basePayload, dimensions: ["page"] }, warnings, `${spec.label}/page`
    );
    const querySet = await searchAnalyticsPaged(
      token, site, { ...basePayload, dimensions: ["query"] }, warnings, `${spec.label}/query`
    );
    const queryPageSet = await searchAnalyticsPaged(
      token, site, { ...basePayload, dimensions: ["query", "page"] }, warnings, `${spec.label}/query+page`
    );

    const rowsPage = pageSet.rows.map(toPageRow);
    const rowsQuery = querySet.rows.map(toQueryRow);
    const rowsQueryPage = queryPageSet.rows.map(toQueryPageRow);
    const rowsQueryPageTarget = rowsQueryPage.filter((row) => isTargetHost(row.host));
    const rowsPageTarget = rowsPage.filter((row) => isTargetHost(row.host));

    const datasetStats = {
      total: { rows: totals ? 1 : 0, pagesFetched: 1, truncated: false },
      page: { rows: pageSet.rows.length, pagesFetched: pageSet.pagesFetched, truncated: pageSet.truncated },
      query: { rows: querySet.rows.length, pagesFetched: querySet.pagesFetched, truncated: querySet.truncated },
      queryPage: {
        rows: queryPageSet.rows.length,
        pagesFetched: queryPageSet.pagesFetched,
        truncated: queryPageSet.truncated,
      },
    };

    // The window's headline row count follows the primary dimension selection.
    const primaryKey =
      dimensions.length === 1 && dimensions[0] === "page"
        ? "page"
        : dimensions.length === 1 && dimensions[0] === "query"
          ? "query"
          : "queryPage";
    const primary = datasetStats[primaryKey];

    windows.push({
      label: spec.label,
      days: spec.days,
      startDate,
      endDate,
      totals,
      rowCount: primary.rows,
      pagesFetched: primary.pagesFetched,
      truncated: primary.truncated,
      primaryDimensions: dimensions,
      rowCounts: datasetStats,
      hostBreakdown: hostBreakdown(rowsQueryPage),
      rowsQueryPage,
      rowsPage,
      rowsQuery,
      rowsQueryPageTarget,
      rowsPageTarget,
    });
  }

  const report = {
    schemaVersion: "gsc-query-page/1",
    tool: "scripts/gsc-query-page.mjs",
    queriedAt: new Date().toISOString(),
    property: site,
    serviceAccountEmail: serviceAccount.client_email,
    authScope: SCOPE_READ,
    finalisationOffsetDays: FINALISATION_OFFSET_DAYS,
    request: {
      searchType: SEARCH_TYPE,
      dataState: DATA_STATE,
      rowLimit: ROW_LIMIT,
      maxPages: MAX_PAGES,
      primaryDimensions: dimensions,
      api: `POST https://${API_HOST}/webmasters/v3/sites/<site>/searchAnalytics/query`,
    },
    hostScope: {
      target: TARGET_HOSTS,
      legacy: LEGACY_HOSTS,
      note: "Domain property sc-domain:tecnoriasl.com also contains legacy WordPress hosts; rows carry a `host` field and `*Target` arrays are the tecnoriasl.com-only analysis set.",
    },
    windows,
    methodology: [
      `Windows are the last N COMPLETE finalised days: endDate = today(UTC) - ${FINALISATION_OFFSET_DAYS} days, startDate = endDate - (N-1) days.`,
      "Totals come ONLY from the dimension-less query. GSC dimension rows are NOT additive and must never be summed (docs/growth/GROWTH-03-HANDOFF.md 2.4).",
      `Each dataset is paginated with startRow until a page returns fewer than ${ROW_LIMIT} rows, hard stop at ${MAX_PAGES} pages (${MAX_PAGES * ROW_LIMIT} rows); truncation is flagged per window and in warnings.`,
      "searchType=web, dataState=all. Rows are returned by the API ordered by clicks then impressions descending.",
      "GSC suppresses anonymised and very low-volume queries. A missing row is NOT proof of zero impressions for that query.",
      "Position is the average position over the impressions of the row, not a fixed rank.",
    ],
    warnings,
  };

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log("--- summary ---");
  for (const win of windows) {
    const t = win.totals;
    console.log(
      `${win.label} ${win.startDate}..${win.endDate} totals=${t ? `${t.clicks}c/${t.impressions}i` : "no-data"} ` +
        `rowsQueryPage=${win.rowCounts.queryPage.rows} (target ${win.rowsQueryPageTarget.length}) ` +
        `rowsPage=${win.rowCounts.page.rows} rowsQuery=${win.rowCounts.query.rows} ` +
        `pagesFetched=${win.pagesFetched} truncated=${win.truncated}`
    );
  }
  if (warnings.length > 0) {
    console.log("--- warnings ---");
    for (const warning of warnings) {
      console.log(`! ${warning}`);
    }
  }
  console.log(`WROTE ${out}`);
}

main().catch((error) => {
  console.error(`ERROR ${error.message}`);
  process.exitCode = 1;
});
