#!/usr/bin/env node
// Search Console read-only query tool (ENGINE: growth / GROWTH-02).
//
// Authenticates with the existing Google service account and calls the
// Search Console API. Never prints secrets. Never mutates the property
// except with the explicit `--submit-sitemap` flag.
//
// Usage:
//   node scripts/gsc-query.mjs sites
//   node scripts/gsc-query.mjs sitemaps
//   node scripts/gsc-query.mjs submit-sitemap
//   node scripts/gsc-query.mjs query [--days 28] [--dimension query|page|country|device]
//   node scripts/gsc-query.mjs inspect <url>
//   node scripts/gsc-query.mjs baseline [--out docs/growth/_team/gsc-baseline.json]
//
// Auth: GOOGLE_APPLICATION_CREDENTIALS points at the service-account JSON.
// Site: GSC_SITE_URL overrides the default property.

import { createSign } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const DEFAULT_SITE = "sc-domain:tecnoriasl.com";
// Read-only scope for every query. The write scope is requested ONLY for the
// explicit `submit-sitemap` command, and never for reads.
const SCOPE_READ = "https://www.googleapis.com/auth/webmasters.readonly";
const SCOPE_WRITE = "https://www.googleapis.com/auth/webmasters";

function b64url(input) {
  return Buffer.from(input).toString("base64url");
}

function loadServiceAccount() {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyPath) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS is not set");
  }
  const raw = JSON.parse(readFileSync(keyPath, "utf8"));
  if (raw.type !== "service_account" || !raw.client_email || !raw.private_key) {
    throw new Error("credential file is not a usable service account");
  }
  return raw;
}

async function getAccessToken(serviceAccount, scope = SCOPE_READ) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: serviceAccount.client_email,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(serviceAccount.private_key).toString("base64url")}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`token request failed: ${response.status} ${body.error ?? ""}`);
  }
  return body.access_token;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function daysAgo(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date;
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
    body = text;
  }
  return { ok: response.ok, status: response.status, body };
}

async function searchAnalytics(token, site, { days, dimensions, startDate, endDate }) {
  const start = startDate ?? isoDate(daysAgo(days - 1));
  const end = endDate ?? isoDate(daysAgo(0));
  const payload = {
    startDate: start,
    endDate: end,
    dimensions: dimensions ?? [],
    rowLimit: 100,
    dataState: "all",
  };
  return call(
    token,
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
    { method: "POST", body: JSON.stringify(payload) }
  );
}

function arg(name, fallback = undefined) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) {
    return fallback;
  }
  return process.argv[index + 1] ?? fallback;
}

async function main() {
  const command = process.argv[2] ?? "sites";

  // Property selection is explicit. This installation has GSC_SITE_URL set at
  // Windows user scope to a DIFFERENT domain (sc-domain:guiaprogramaciontv.com),
  // so an ambient environment variable must never silently retarget a query.
  // Precedence: --site flag, then GSC_SITE_URL_OVERRIDE, then the default.
  const ambient = process.env.GSC_SITE_URL;
  const override = process.env.GSC_SITE_URL_OVERRIDE;
  const site = arg("site", override ?? DEFAULT_SITE);
  if (ambient && ambient !== site) {
    console.warn(
      `# WARNING: ambient GSC_SITE_URL=${ambient} ignored; querying ${site}. Use --site to target another property.`
    );
  }

  const serviceAccount = loadServiceAccount();
  const token = await getAccessToken(
    serviceAccount,
    command === "submit-sitemap" ? SCOPE_WRITE : SCOPE_READ
  );
  if (command === "submit-sitemap") {
    console.log("# writing with scope https://www.googleapis.com/auth/webmasters (submit only)");
  }

  console.log(`# service account: ${serviceAccount.client_email}`);
  console.log(`# property: ${site}`);

  switch (command) {
    case "sites": {
      const result = await call(token, "https://searchconsole.googleapis.com/webmasters/v3/sites");
      console.log(`HTTP ${result.status}`);
      for (const entry of result.body?.siteEntry ?? []) {
        console.log(`${entry.siteUrl}  [${entry.permissionLevel}]`);
      }
      break;
    }
    case "sitemaps": {
      const result = await call(
        token,
        `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/sitemaps`
      );
      console.log(`HTTP ${result.status}`);
      const list = result.body?.sitemap ?? [];
      if (list.length === 0) {
        console.log("NO_SITEMAP_SUBMITTED");
      }
      for (const entry of list) {
        console.log(
          JSON.stringify({
            path: entry.path,
            lastSubmitted: entry.lastSubmitted,
            lastDownloaded: entry.lastDownloaded,
            isPending: entry.isPending,
            errors: entry.errors,
            warnings: entry.warnings,
            contents: entry.contents,
          })
        );
      }
      break;
    }
    case "submit-sitemap": {
      const sitemapUrl = arg("url", "https://tecnoriasl.com/sitemap.xml");
      const result = await call(
        token,
        `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/sitemaps/${encodeURIComponent(sitemapUrl)}`,
        { method: "PUT" }
      );
      console.log(`SUBMIT ${sitemapUrl} HTTP ${result.status}`);
      if (result.body) {
        console.log(JSON.stringify(result.body));
      }
      break;
    }
    case "query": {
      const days = Number(arg("days", "28"));
      const dimension = arg("dimension", undefined);
      const result = await searchAnalytics(token, site, {
        days,
        dimensions: dimension ? [dimension] : [],
      });
      console.log(`HTTP ${result.status} window=${days}d dimension=${dimension ?? "total"}`);
      const rows = result.body?.rows ?? [];
      console.log(`ROWS ${rows.length}`);
      for (const row of rows) {
        console.log(
          JSON.stringify({
            keys: row.keys ?? [],
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr,
            position: row.position,
          })
        );
      }
      break;
    }
    case "inspect": {
      const url = process.argv[3];
      if (!url) {
        throw new Error("inspect requires a URL");
      }
      const result = await call(
        token,
        "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
        {
          method: "POST",
          body: JSON.stringify({ inspectionUrl: url, siteUrl: site }),
        }
      );
      console.log(`HTTP ${result.status}`);
      console.log(JSON.stringify(result.body, null, 2));
      break;
    }
    case "baseline": {
      const out = arg("out", "docs/growth/_team/gsc-baseline.json");
      const report = {
        queriedAt: new Date().toISOString(),
        property: site,
        serviceAccount: serviceAccount.client_email,
        sitemaps: null,
        totals: {},
        byQuery: {},
        byPage: {},
        byCountry: {},
        byDevice: {},
        notes: [],
      };

      const sitemaps = await call(
        token,
        `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/sitemaps`
      );
      report.sitemaps = sitemaps.body?.sitemap ?? [];
      if (report.sitemaps.length === 0) {
        report.notes.push("No sitemap submitted to this property at query time.");
      }

      for (const [label, days] of [
        ["d7", 7],
        ["d28", 28],
        ["d90", 90],
        ["d480", 480],
      ]) {
        const total = await searchAnalytics(token, site, { days });
        report.totals[label] = total.body?.rows?.[0] ?? null;
        if (!total.body?.rows?.length) {
          report.notes.push(`${label}: no search analytics rows returned.`);
        }
      }

      for (const [key, days] of [
        ["byQuery", 28],
        ["byPage", 28],
        ["byCountry", 28],
        ["byDevice", 28],
      ]) {
        const dimension = key.replace("by", "").toLowerCase();
        const result = await searchAnalytics(token, site, { days, dimensions: [dimension] });
        report[key] = result.body?.rows ?? [];
      }

      const sixteenMonths = await searchAnalytics(token, site, { days: 480, dimensions: ["query"] });
      report.sixteenMonthQueries = sixteenMonths.body?.rows ?? [];

      writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");
      console.log(`WROTE ${out}`);
      console.log(
        JSON.stringify(
          {
            sitemaps: report.sitemaps.length,
            totals: Object.fromEntries(
              Object.entries(report.totals).map(([k, v]) => [k, v ? `${v.clicks}c/${v.impressions}i` : "no-data"])
            ),
            queries28d: report.byQuery.length,
            pages28d: report.byPage.length,
            countries: report.byCountry.length,
            devices: report.byDevice.length,
            queries480d: report.sixteenMonthQueries.length,
          },
          null,
          2
        )
      );
      break;
    }
    default:
      throw new Error(`unknown command: ${command}`);
  }
}

main().catch((error) => {
  console.error(`ERROR ${error.message}`);
  process.exitCode = 1;
});
