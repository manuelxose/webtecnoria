# GROWTH-02 — WAVE A measurement discovery (search visibility + analytics state)

**Task:** `t1` [A1] — WAVE A discovery: search visibility and analytics access/state
**Team:** `tecnoria-growth-02` — member `analytics-search`, attempt `cb073961-56ec-422a-8cc9-8321329eb15d`
**Date of observation:** 2026-11-05, 00:51–01:10 UTC (server clock `Thu Nov  5 01:07:56 UTC 2026`)
**Mode:** READ-ONLY discovery. No builds, no deploys, no writes except this file.
**Repository:** `C:\Users\Admin\Documents\workspace\webtecnoria`, HEAD `6b86ab0`
**Production:** `https://tecnoriasl.com` (Cloudflare edge → Contabo `vmi2962975`, nginx) · active release `/var/www/webtecnoria/apps/web/releases/20261105_012220`

This document reports only what a named command actually returned. Every figure below is copied from a
named source (command output or a named file line). Where a fact could not be established the item is
marked **BLOCKED** with the precise missing authorization. No impressions, clicks, sessions, positions,
conversion rates or traffic estimates are invented anywhere in this file.

---

## 0. Executive state table

| # | Item | Verdict | One-line evidence |
|---|---|---|---|
| 1 | Google Search Console — credential & property | **VERIFIED / ACCESSIBLE** | `GET /webmasters/v3/sites` → HTTP 200, `sc-domain:tecnoriasl.com` listed as `siteOwner` for service account `guiatv-gsc@guia-tv-8fe3c.iam.gserviceaccount.com` |
| 1b | GSC web **UI** access, and GSC **write** operations (sitemap submit, settings) | **BLOCKED** | no browser session for any human Google account; team is not authorized to perform GSC writes (`siteOwner` would permit them) |
| 2 | GA4 — tag on the page | **VERIFIED (loaded on every page, no consent gate)** | `apps/web/src/index.html:49-55`; deployed `server/index.server.html:34-39`; `https://www.googletagmanager.com/gtag/js?id=G-LE6ETPWL23` HTTP 200 |
| 2b | GA4 — admin/data access (property settings, reports) | **BLOCKED** | `GET https://analyticsadmin.googleapis.com/v1beta/accountSummaries` → **HTTP 403 SERVICE_DISABLED** (Analytics Admin API not enabled in project `533857766582`), and no GA4 property membership is proven for any available credential |
| 2c | GA4 — whether hits are actually collected, and property-level settings (enhanced measurement, referral exclusions, data streams) | **BLOCKED** | requires GA4 property role; not derivable from the public tag |
| 3 | Third-party requests triggered by production HTML | **VERIFIED (inventory complete for server-rendered HTML; runtime-injected ones listed separately)** | only `www.googletagmanager.com` (32/32 pages) + Cloudflare-injected `email-decode.min.js` (32/32); runtime adds `talkaris.com`; one outbound link `auctorio.com/login` |
| 4 | Referral / attribution risk | **VERIFIED for the observable surfaces; property-level referral exclusion list is BLOCKED** | one outbound link `/productos/auctorio` → `https://auctorio.com/login` (`rel="noreferrer"`); talkaris widget iframe is a third-party surface; no `linker`/cross-domain config in `gtag('config')` |
| 5 | Sitemap & robots (fresh production verify) | **VERIFIED** | `robots.txt` HTTP 200 (byte-identical to repo); `sitemap.xml` HTTP 200, 32 `<loc>`, all 32 return HTTP 200, byte-identical to repo source; GSC record: submitted 2026-03-12, last downloaded 2026-04-28, `submitted:"24"`, `errors:"0"` |

### Corrections to inherited documents (they are now factually wrong; not edited here because this task is read-only)

- `docs/growth/ANALYTICS-MEASUREMENT.md:11` — “`GSC_SITE_URL=sc-domain:guiaprogramaciontv.com` … **not for tecnoriasl.com**”.
  The *env variable* is indeed scoped to another domain, but the **Search Console property
  `sc-domain:tecnoriasl.com` exists and the available service account is its `siteOwner`** (§1). The
  variable name is a red herring: GSC access is determined by the property ACL, not by `GSC_SITE_URL`.
- `docs/growth/ANALYTICS-MEASUREMENT.md:19-30` (“Search Console blocker”) and
  `docs/growth/SEO-00-BASELINE.md:81` (“GSC … **BLOCKED**”) — **obsolete**. See §1.
- The assumption recorded in the team brief — “no Google service account, no OAuth credential for
  search/analytics APIs on the host or server” — is **false**. Credential material exists on both the
  Windows host and the Contabo server (§1.1). It was never re-tested against the API in the previous
  milestone; that is the root cause of the inherited “BLOCKED” verdict.

---

## 1. Google Search Console

### 1.1 The credential that exists

| Fact | Value | Evidence |
|---|---|---|
| Key file (host) | `C:\Users\Admin\.guiatv\gsc-service-account.json` | `Test-Path` / `node -e` metadata read |
| Key type | `service_account`, `private_key` present (1704 chars), file 2353 bytes | `node -e "…console.log('type:',j.type, …)"` |
| Service account | `guiatv-gsc@guia-tv-8fe3c.iam.gserviceaccount.com` | same read; confirmed in captain message |
| GCP project | `guia-tv-8fe3c` | same read |
| Key file (server) | `/etc/guiatv/gsc-service-account.json` | `/etc/guiatv/api.env:53` → `GOOGLE_APPLICATION_CREDENTIALS=/etc/guiatv/gsc-service-account.json` |
| Legacy app that reads it | `guiatv` backend `SearchConsoleMonitor.ts:77`, `submitSitemapToSearchConsole.ts:84`, server script `/var/www/guiatv/scripts/gsc-canonical-checkpoint.mjs` | `grep -rIl "GSC_SITE_URL" /etc /opt /var/www` |
| No `gcloud` CLI needed | `command -v gcloud` → “no gcloud”; `command -v bq` → “no bq” | ssh read-only command on `contabo` |

**Auth mechanism actually used (reproducible, no gcloud, no OAuth browser flow):**
service-account JWT bearer assertion (RS256) against `https://oauth2.googleapis.com/token` with scope
`https://www.googleapis.com/auth/webmasters.readonly`, then `Authorization: Bearer <access_token>` on
`https://www.googleapis.com/webmasters/v3/…`. The scope is **read-only**: it cannot submit sitemaps,
change settings, or inspect/modify users. The private key was never printed and is not reproduced here.

Probe 1 (requested scope: `webmasters.readonly` only):

```text
$ node -e "<JWT + fetch sites.list, script in §7.1>"
TOKEN_ENDPOINT_HTTP: 200 error: none
SITES_LIST_HTTP: 200
SITES_LIST_BODY: {
  "siteEntry": [
    { "siteUrl": "sc-domain:embarcarte.com", "permissionLevel": "siteFullUser" },
    { "siteUrl": "sc-domain:tecnoriasl.com", "permissionLevel": "siteOwner" },
    { "siteUrl": "sc-domain:guiaprogramaciontv.com", "permissionLevel": "siteOwner" }
  ]
}
```

**Conclusion for item 1:** a usable, read-only Search Console credential for `tecnoriasl.com` exists in
this environment, and `sc-domain:tecnoriasl.com` is a **verified domain property** with the service
account as `siteOwner`. Search Console data for tecnoriasl.com is therefore **not blocked** for API
reads. The previous milestone’s “BLOCKED” verdict must not be repeated.

### 1.2 The pre-existing DNS verification record

```text
$ Resolve-DnsName -Type TXT -Name tecnoriasl.com
Name           Type Strings
tecnoriasl.com  TXT {google-site-verification=ogx8tZkgS1FgRlxIUa1w2bM69JZe-yOo1ERAd4JI1Y8}
```

This is consistent with a Google **domain property** (`sc-domain:`) that was verified over DNS by a
human Google account with Cloudflare DNS access (authoritative NS: `celeste.ns.cloudflare.com`,
`cullen.ns.cloudflare.com`, per the captain’s `dig` result). **It must not be deleted, replaced or
re-created.** Its presence alone does not grant API access — the property ACL does; the ACL is what
lists the service account as `siteOwner` (§1.1).

### 1.3 What is still unavailable (precise dependencies)

| Unavailable | Precise blocking dependency |
|---|---|
| GSC **web UI** (Permissions page, Performance UI, URL Inspection UI) | A human Google account session that is a user/owner of the property. No browser profile in this environment is authenticated, and this team has no authorization to use a personal session. |
| GSC **write** operations (submit/re-submit sitemap, remove sitemap, change settings, add users) | The credential *is* `siteOwner` and therefore technically capable, but the task contract is READ-ONLY and no owner approval exists for writes. A sitemap (re)submission is a **mutating** call (`PUT /webmasters/v3/sites/{site}/sitemaps/{feedpath}`) and must be authorized before anyone runs it. |
| GSC historical exports beyond what the API returns | Nothing missing on the credential side; API quotas apply (2 000 rows/request, date-window limits). Note: reporting the figures is the captain’s deliverable, not this discovery task. |

### 1.4 Can a domain property exist *without* an authenticated Google account?

**No.** A Search Console property is an entity owned by Google accounts; it cannot exist without at
least one owning account. A service account cannot create a property or perform DNS verification —
it can only be added to an existing property by a human owner. So the only two possible situations are
(a) someone’s Google account owns the property and delegated to the service account (what the API
shows), or (b) no property exists (contradicted by the API listing). Today it is (a).

### 1.5 Where `GSC_SITE_URL` lives

| Location | Value | Command |
|---|---|---|
| Server env for the **guiatv** app | `GSC_SITE_URL=sc-domain:guiaprogramaciontv.com` | `ssh contabo "grep -nE '^(GSC_SITE_URL|GOOGLE_APPLICATION_CREDENTIALS)=' /etc/guiatv/api.env"` → lines 53, 76 |
| tecnoria web service env `/etc/tecnoria/web.env` | **not present** (only `NODE_ENV`, `PORT`, `API_INTERNAL_URL`, `GOOGLE_CLIENT_ID`) | `ssh contabo "grep -oE '^[A-Za-z_][A-Za-z0-9_]*=' /etc/tecnoria/web.env"` |
| tecnoria repo code | **not read anywhere** | `grep` over `apps/**` → no match |
| Repo docs | referenced as prose only (`ANALYTICS-MEASUREMENT.md:11`, `SEO-00-BASELINE.md:81`, `EXECUTIVE-SUMMARY.md:187`) | `grep -r "GSC_SITE_URL"` |
| Host workspaces (excluding `node_modules`, `.git`, `dist`) | only `guiatv` code (`SearchConsoleMonitor.ts:77`, `submitSitemapToSearchConsole.ts:84`) | `Select-String -Path … -Pattern 'GSC_SITE_URL'` over `Documents\workspace` |

`GSC_SITE_URL` is therefore a **guiatv** variable, not a tecnoria one, and it is **not** what gates
tecnoriasl.com access. TecnoRia has no GSC integration code at all.

---

## 2. GA4 — what the code actually does today

### 2.1 The tag (verified in source, in the deployed artifact, and on the wire)

`apps/web/src/index.html:49-55`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-LE6ETPWL23"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-LE6ETPWL23');
</script>
```

Deployed artifact (independent of the repo working tree):

```text
$ ssh contabo "grep -n 'G-LE6ETPWL23\|googletagmanager\|gtag(' /var/www/webtecnoria/apps/web/releases/current/server/index.server.html"
34:    <script async="" src="https://www.googletagmanager.com/gtag/js?id=G-LE6ETPWL23"></script>
37:      function gtag(){dataLayer.push(arguments);}
38:      gtag('js', new Date());
39:      gtag('config', 'G-LE6ETPWL23');
```

Live document (`curl -sS https://tecnoriasl.com/ -o %TEMP%\g02-home.html`, HTTP 200, 118 117 bytes):
`googletagmanager` ×1, `G-LE6ETPWL23` ×2, `gtag(` ×3, `dataLayer` ×3 — identical to the source block.

> **Line-number anchor.** `apps/web/src/index.html:49-55` refers to the repository state **at
> observation time** (`HEAD 6b86ab0`, clean tree). The working tree changed during this task because
> other team members are implementing consent in the same checkout (§9); the **deployed** artifact
> (`server/index.server.html:34-39`) is the authoritative description of what production serves today.

Loader reachable: `curl -sS "https://www.googletagmanager.com/gtag/js?id=G-LE6ETPWL23"` → `HTTP=200
SIZE=505260 CT=application/javascript`. Inside the loader: `/g/collect` ×8, `google-analytics.com` ×2,
`region1` ×1, `analytics.google.com` ×2. So the page, once JS runs, issues the standard GA4 beacon to
the `google-analytics.com` collection endpoint. *(The beacon itself was not captured here: no browser
automation was used. What is verified is the loader being fetched and the collection endpoint being
present in that loader.)*

### 2.2 What the code does **not** do

| Expected GA4 behaviour | Reality in code | Evidence |
|---|---|---|
| Consent Mode v2 defaults before the tag loads | **absent** — no `gtag('consent', …)` anywhere | `grep -r "gtag" apps/` → only `index.html:49-55`; deployed `index.server.html` has no `consent` string (`grep -in "consent\|cookiebanner\|aceptar anal"` → “no consent/cookie strings”) |
| Explicit `page_view` on SPA route changes | **absent** — `app.component.ts` only does `window.scrollTo(0,0)` on `NavigationEnd` | `apps/web/src/app/app.component.ts:18-24` |
| Conversion / lead events (`generate_lead`, `form_start`, `cta_click`, `phone_click`) | **absent** — no `gtag('event', …)` in the repo | same `grep` as above |
| Cross-domain `linker` configuration | **absent** — `gtag('config','G-LE6ETPWL23')` has no options object | `index.html:54` |
| Cookie flags / `cookie_domain` | **absent** | same |
| Server-side GA4 (Measurement Protocol) | **absent** | `apps/web/server.ts` contains no analytics code; only `getPublicRuntimeConfig()` → `googleClientId` (`server.ts:29-33`, injected at `server.ts:478-483`) |

**Consequence (and its limit):** client-side navigation produces no explicit `page_view` call. Whether
GA4 still records SPA navigations depends on the property-level *enhanced measurement → “Page changes
based on browser history events”* setting, which is **BLOCKED from verification** (no GA4 property
access, §2.3). Do not assume either way.

The only first-party “analytics” in the codebase is the admin dashboard (`apps/api/src/routes/v1/analytics.ts`,
`GET /api/v1/analytics/{dashboard,advanced}`), which reads the application database — it is unrelated to
GA4 and is not a traffic measurement.

### 2.3 GA4 access state — BLOCKED (verified by a real API refusal)

Probe (same service-account JWT, scopes `webmasters.readonly` + `analytics.readonly`):

```text
[3] GA4_ADMIN_ACCOUNTSUMMARIES_HTTP: 403
{
  "error": {
    "code": 403,
    "message": "Google Analytics Admin API has not been used in project 533857766582 before or it is disabled. Enable it by visiting https://console.developers.google.com/apis/api/analyticsadmin.googleapis.com/overview?project=533857766582 then retry.",
    "status": "PERMISSION_DENIED",
    "details": [{ "reason": "SERVICE_DISABLED", "domain": "googleapis.com",
      "metadata": { "service": "analyticsadmin.googleapis.com", "containerInfo": "533857766582" } }]
  }
}
```

Two separate blockers, both required:

1. **API disabled** in GCP project `533857766582` — note this is the same project as the public
   `googleClientId` `533857766582-…` injected into every page (`window.__TECNORIA_RUNTIME__`), so enabling
   it is a console action in a project that is already in use by the site.
2. **GA4 property membership** — GA4 permissions are granted per property (Admin → Property access
   management). Even with the API enabled, `guiatv-gsc@…` has no role on the GA4 property behind
   `G-LE6ETPWL23` unless a human GA4 Administrator adds it. The numeric property ID for
   `G-LE6ETPWL23` was **not** established (no access), and no GA4 credential other than this service
   account is present on host or server.

Not verifiable today, therefore explicitly **not claimed**: number of sessions/users/events actually
collected, whether the property receives any traffic at all, enhanced-measurement settings, data-stream
configuration, referral-exclusion list, internal-traffic filters, data retention.

### 2.4 Consequence for compliance (state, not legal advice)

Every page loads GA4 **before any consent choice** and there is no banner, no consent default and no
consent update. `/politica-de-cookies` is declared in `apps/web/src/app/site/seo-route-manifest.ts`
(`PUBLIC_PATHS`) but returns **HTTP 404** on production, so there is currently no reachable cookie
policy to disclose `_ga`. This is a measurement *and* privacy gap, and it is the reason the growth plan
cannot use GA4 numbers as a baseline yet.

---

## 3. Third-party inventory (what a first page load actually contacts)

Method: fetch every one of the 32 sitemap URLs with `curl.exe`, then extract every
`src|href|data-src|content="https?://…"`, every `url(https://…)` and every bare `https?://host/…`
occurrence, and group by host.

```text
=== NON-FIRST-PARTY HOSTS across 32 sitemap pages (any src/href/url()/bare URL) ===
HOST: auctorio.com  pages=1
HOST: www.googletagmanager.com  pages=32
```

### 3.1 Server-rendered HTML — complete list

| # | Request | Type | Where | Evidence |
|---|---|---|---|---|
| 1 | `https://www.googletagmanager.com/gtag/js?id=G-LE6ETPWL23` | async `<script>` | 32/32 pages | host scan above; `index.html:49` |
| 2 | `/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js` | `<script data-cfasync="false">`, **injected by Cloudflare**, same-origin path served by the edge | 32/32 pages | `<script>` tag dump of live HTML; the string `email-decode`/`cdn-cgi` appears in the repo **only** in the cookies page prose (`apps/web/src/app/site/pages/cookies-page.component.ts:158`), never as a script |
| 3 | `https://auctorio.com/login` | `<a target="_blank" rel="noreferrer">`, **only on `/productos/auctorio`** | 1/32 pages | §4.1 |
| — | *no* Google Fonts, *no* analytics/CDN other than the above, *no* ad or social pixels, *no* preconnect/dns-prefetch links | — | — | host scan; `<link … preconnect|dns-prefetch>` regex returned **zero** matches |

Fonts and images are first-party (`/assets/fonts/*.woff2` preloaded at `index.html:34-47`).

### 3.2 Requests only a real browser will issue

| # | Request | Trigger | Evidence |
|---|---|---|---|
| 4 | `https://region1.google-analytics.com/g/collect` (GA4 beacon) | after `gtag/js` executes | endpoint present in the loader (×8 `/g/collect`, ×1 `region1`); not captured with a browser |
| 5 | `https://talkaris.com/widget/embed.js?siteKey=tecnoria-public-site-key&v=20260320-widget-runtime-v8` | `ChatWidgetEmbedComponent` mounts on `requestIdleCallback` (timeout 3000 ms) or `setTimeout(2500)` | `apps/web/src/environments/environment.prod.ts:5-8`; `chat-widget-embed.component.ts:108-120,174-199`; component included by `site-layout.component.ts:29`; embed.js fetched → `HTTP=200 SIZE=5883` |
| 6 | `https://talkaris.com/widget/frame.html?siteKey=…&apiBase=https://talkaris.com/api&origin=https://tecnoriasl.com…` | the `embed.js` above creates this `<iframe>` | embed.js body lines 29-53 (`new URL("frame.html", widgetBaseUrl)`), read locally |
| 7 | subsequent `https://talkaris.com/api/…` calls from inside that iframe | widget conversation / lead capture | `environment.prod.ts:6` (`chatWidgetApiBaseUrl: "https://talkaris.com/api"`), and `apiBase` is forwarded into the frame URL by embed.js |
| 8 | `https://a.nel.cloudflare.com/report/v4?…` | Network Error Logging, **only on network failures** (`success_fraction: 0.0`) | live response headers: `Report-To: {"group":"cf-nel", …}` and `Nel: {"report_to":"cf-nel","success_fraction":0.0,…}` |

Notes that matter for measurement hygiene:

- The chat widget is **not** in the server-rendered HTML: the live document contains only the empty
  element `<app-chat-widget-embed ngh="5"><!----></app-chat-widget-embed>` (32/32 pages) and the
  `talkaris`/`auctorio` strings in the HTML are internal links (`/productos/talkaris`,
  `/productos/auctorio`) — **not** third-party requests. The `talkaris.com` requests start ~2.5–3 s
  after hydration on every public page that uses `site-layout`.
- The Cloudflare `email-decode.min.js` is a Cloudflare product feature, not site code; it is a
  same-origin request to the edge and does not affect GA4 attribution, but it is the second script a
  visitor loads.
- `/productos/talkaris` has **no** external link at all (verified by the host scan) — the product CTA
  stays on tecnoriasl.com.

---

## 4. Referral / attribution risk

### 4.1 Outbound links (complete list from the 32-page scan)

Exactly one external `href` exists in the rendered HTML of the whole public site:

```text
$ curl -sS https://tecnoriasl.com/productos/auctorio | grep -o 'href="https\?://[^"]*auctorio\.com[^"]*"'
href="https://auctorio.com/login"
```

Markup: `<a target="_blank" rel="noreferrer" class="button button-secondary" href="https://auctorio.com/login">Entrar al Studio</a>`
(source: `apps/web/src/app/site/pages/auctorio-page.component.ts:52` with `buildAuctorioPublicLoginUrl()`
from `apps/web/src/app/services/auctorio-links.ts:3`).

Risk assessment (what can and cannot be concluded):

- `rel="noreferrer"` suppresses the `Referer` header, so auctorio.com receives this visit as a direct
  session, and any *return* to tecnoriasl.com from auctorio.com would normally arrive **without** a
  referrer — i.e. a referral-misclassification event is unlikely from this link alone. It is still the
  only cross-domain journey that exists and must be covered by GA4 referral-exclusion / cross-domain
  `linker` configuration if it is ever measured end-to-end.
- The `talkaris.com` widget iframe is the larger structural risk: a user who finishes in the widget and
  returns (or is redirected) to a tecnoriasl.com page would be attributed to `talkaris.com` unless
  `talkaris.com` is in the GA4 **unwanted referrals** list. That list lives in GA4 property settings →
  **BLOCKED** (§2.3).
- There is **no** `gtag('config', …, { linker: { domains: […] } })`, no `allow_linker`, no
  `cookie_domain` today (`index.html:54`), so cross-domain measurement between tecnoriasl.com,
  auctorio.com and talkaris.com is not configured at all. Any claim that cross-domain journeys are
  measured would be false.
- Historical sessions already attributed to a referral source cannot be inspected without GA4 access
  (**BLOCKED**, §2.3).

### 4.2 Inbound/self-referral checks

- The live pages never link to themselves through an external host (host scan: only `tecnoriasl.com`
  appears, plus the two third parties above). No `www.` ↔ apex cross-links in content (the `www` host is
  a 301 to apex at the edge).
- `apps/web/src/main.ts:36` contains `acceso: "https://tecnoriasl.com/contacto"` — an absolute
  same-domain URL, not a referral risk.

---

## 5. Sitemap and robots — fresh production verification

### 5.1 `robots.txt`

```text
$ curl.exe -sS https://tecnoriasl.com/robots.txt
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /portal
Disallow: /acceso-restringido
Disallow: /auth-
Disallow: /api/
Disallow: /uploads/

Sitemap: https://tecnoriasl.com/sitemap.xml
[HTTP 200 CT=text/plain; charset=UTF-8]
```

SHA-256 comparison — live bytes are identical to the repo source and to the built artifact:

```text
B8AF5463B68EF28138DBE044D04CAA7EDA03E343269273A4D8448E77A29EC4D5  %TEMP%\g02-robots.txt
B8AF5463B68EF28138DBE044D04CAA7EDA03E343269273A4D8448E77A29EC4D5  apps/web/src/robots.txt
B8AF5463B68EF28138DBE044D04CAA7EDA03E343269273A4D8448E77A29EC4D5  apps/web/dist/browser/robots.txt
```

### 5.2 `sitemap.xml` — 32 URLs, all 200

```text
$ curl.exe -sS https://tecnoriasl.com/sitemap.xml
HTTP=200 SIZE=6245 CT=application/xml
URL COUNT: 32
```

Full list (as served): `/`, `/servicios`, `/servicios/{desarrollo-software-medida, automatizacion-procesos,
desarrollo-chatbots-empresas, inteligencia-artificial-empresas, plataformas-saas, consultoria-tecnologica}`,
`/soluciones`, `/casos-de-exito`, `/metodologia`, `/empresa`, `/blog`, `/productos/talkaris`,
`/productos/auctorio`, 13 `/blog/<slug>` articles, `/faq`, `/contacto`, `/politica-de-privacidad`,
`/mapa-web`.

Status sweep of every listed URL:

```text
$ for u in $(grep -o '<loc>[^<]*' sitemap.xml | cut -c6-); do curl.exe -sS -o NUL -w '%{http_code} %{content_type} '$u'\n' $u; done
200 text/html; charset=utf-8 https://tecnoriasl.com/                       … (32 lines, all 200)
TOTAL=32 NOT_200=0
```

Byte identity with the repository (so the served sitemap **is** the canonical, source-controlled one):

```text
80FF4017CEA50E5A3A7EDE9232A4FD8DCF405E1C309A405EABE14ECD77CB8018  %TEMP%\g02-sitemap.xml
80FF4017CEA50E5A3A7EDE9232A4FD8DCF405E1C309A405EABE14ECD77CB8018  apps/web/src/sitemap.xml
80FF4017CEA50E5A3A7EDE9232A4FD8DCF405E1C309A405EABE14ECD77CB8018  apps/web/dist/browser/sitemap.xml
```

Only one sitemap exists and `robots.txt` points at exactly it; there is no sitemap index. Entries carry
`<lastmod>` (home `2026-11-05`; service pages `2026-03-11` in the head of the file) with `changefreq`
and `priority`.

### 5.3 Search Console view of that sitemap

```text
[1] SITEMAPS_LIST_HTTP: 200
{ "sitemap": [ { "path": "https://tecnoriasl.com/sitemap.xml",
    "lastSubmitted": "2026-03-12T18:29:06.613Z",
    "isPending": false, "isSitemapsIndex": false, "type": "sitemap",
    "lastDownloaded": "2026-04-28T12:39:53.371Z",
    "warnings": "0", "errors": "0",
    "contents": [ { "type": "web", "submitted": "24", "indexed": "0" } ] } ] }
```

Facts that follow, stated without extrapolation:

- A sitemap **was submitted once** (2026-03-12) and was last downloaded by Google on **2026-04-28**.
- Google’s recorded sitemap contains **24** URLs; the live sitemap now contains **32**. The record has
  not been refreshed since the sitemap grew — re-submitting is a **write** action and is not authorized
  in this read-only task (§1.3).
- `errors:"0"`, `warnings:"0"`, `isPending:false`.
- `contents[].indexed` is a legacy/derived field that Google no longer maintains as an index-coverage
  metric; it must **not** be quoted as “0 pages indexed”. No index-coverage data was requested here
  (that is the captain’s live-query deliverable), so this document makes no claim about how many pages
  are indexed.

### 5.4 Route-manifest cross-check

`apps/web/src/app/site/seo-route-manifest.ts` `PUBLIC_PATHS` lists **33** public paths; the sitemap lists
**32**. The difference is `/politica-de-cookies`, which is declared public in the repo but returns
**HTTP 404** on production (`curl -o NUL -w '%{http_code}'` → `404 text/html`), so its absence from the
sitemap is correct at the moment, while the route itself is broken (and it is the page that would have
to disclose `_ga` — see §2.4). Note: repo HEAD (`6b86ab0`) is ahead of the deployed code (`3c7cdb9`), so
treat this as a deploy-drift observation, not as a sitemap defect.

---

## 6. Real metrics used in this document (source: Google Search Console API)

The only traffic figures quoted anywhere in this document are the following, copied verbatim from this
read-only probe (same service-account JWT, scope `webmasters.readonly`):

```text
POST https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Atecnoriasl.com/searchAnalytics/query
body: {"startDate":"2026-10-29","endDate":"2026-11-04","dimensions":["date"],"rowLimit":40}
[2] SEARCH_ANALYTICS_7D_HTTP: 200
{ "rows": [
  { "keys": ["2026-10-29"], "clicks": 0, "impressions": 19, "ctr": 0, "position": 15 },
  { "keys": ["2026-10-30"], "clicks": 0, "impressions": 11, "ctr": 0, "position": 17 },
  { "keys": ["2026-10-31"], "clicks": 0, "impressions": 6,  "ctr": 0, "position": 15 },
  { "keys": ["2026-11-01"], "clicks": 0, "impressions": 11, "ctr": 0, "position": 13.545454545454545 },
  { "keys": ["2026-11-02"], "clicks": 0, "impressions": 8,  "ctr": 0, "position": 15.25 } ],
  "responseAggregationType": "byProperty" }
```

Reading: 5 daily rows returned for a 7-day window (typical GSC reporting lag for 2026-11-03/04); the sum
of the returned `impressions` field is **55** and the sum of `clicks` is **0**. Positions are the values
the API returned per day (13.55–17.00). No query, page, country or device dimension was requested, so no
keyword or landing-page claim can be made from this document. Full baseline extraction is intentionally
left to the captain’s live-query task.

---

## 7. Reproduction appendix (verbatim commands)

### 7.1 GSC credential + property probe (no secrets printed)

```powershell
$code = @'
const fs = require("fs"); const crypto = require("crypto");
const j = JSON.parse(fs.readFileSync("C:/Users/Admin/.guiatv/gsc-service-account.json", "utf8"));
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const unsigned = b64({ alg: "RS256", typ: "JWT" }) + "." + b64({
  iss: j.client_email, scope: "https://www.googleapis.com/auth/webmasters.readonly",
  aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 });
const s = crypto.createSign("RSA-SHA256"); s.update(unsigned);
const assertion = unsigned + "." + s.sign(j.private_key).toString("base64url");
(async () => {
  const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }) });
  const tj = await tr.json(); console.log("TOKEN_ENDPOINT_HTTP:", tr.status, "error:", tj.error || "none");
  const r = await fetch("https://www.googleapis.com/webmasters/v3/sites", { headers: { authorization: "Bearer " + tj.access_token } });
  console.log("SITES_LIST_HTTP:", r.status); console.log("SITES_LIST_BODY:", (await r.text()).slice(0, 1200));
})();
'@
node -e $code
```

### 7.2 Live HTML, third-party scan, sitemap/robots sweep

```powershell
curl.exe -sS -D $env:TEMP\g02-home.headers -o $env:TEMP\g02-home.html https://tecnoriasl.com/ -w 'HTTP=%{http_code} SIZE=%{size_download}`n'
$h = Get-Content -Raw $env:TEMP\g02-home.html
[regex]::Matches($h, 'https?://([A-Za-z0-9._-]+)') | ForEach-Object { $_.Groups[1].Value } | Group-Object | Sort-Object Count -Descending
[regex]::Matches($h, '<script[^>]*>') | ForEach-Object { $_.Value }

# every sitemap URL: host scan + status
$locs = [regex]::Matches((Get-Content -Raw $env:TEMP\g02-sitemap.xml), '<loc>([^<]+)</loc>') | ForEach-Object { $_.Groups[1].Value }
foreach ($u in $locs) { curl.exe -sS --max-time 25 $u -o $env:TEMP\g02-page.html
  $page = Get-Content -Raw $env:TEMP\g02-page.html
  [regex]::Matches($page, '(?:src|href|data-src|content)="(https?://[^"]+)"') | ForEach-Object { $_.Groups[1].Value } }

curl.exe -sS https://tecnoriasl.com/robots.txt
curl.exe -sS https://tecnoriasl.com/sitemap.xml -o $env:TEMP\g02-sitemap.xml -w 'HTTP=%{http_code} SIZE=%{size_download} CT=%{content_type}`n'
Get-FileHash -Algorithm SHA256 -Path $env:TEMP\g02-sitemap.xml, apps\web\src\sitemap.xml, apps\web\dist\browser\sitemap.xml
Get-FileHash -Algorithm SHA256 -Path $env:TEMP\g02-robots.txt, apps\web\src\robots.txt, apps\web\dist\browser\robots.txt
```

### 7.3 Production/server read-only checks

```powershell
ssh contabo "systemctl cat tecnoria-web --no-pager | grep -iE 'Environment|ExecStart|WorkingDirectory'"
ssh contabo "grep -oE '^[A-Za-z_][A-Za-z0-9_]*=' /etc/tecnoria/web.env"
ssh contabo "grep -nE '^(GSC_SITE_URL|GOOGLE_APPLICATION_CREDENTIALS)=' /etc/guiatv/api.env"
ssh contabo "grep -n 'G-LE6ETPWL23\|googletagmanager\|gtag(' /var/www/webtecnoria/apps/web/releases/current/server/index.server.html"
ssh contabo "grep -in 'consent\|cookiebanner\|aceptar anal' /var/www/webtecnoria/apps/web/releases/current/server/index.server.html || echo 'no consent/cookie strings'"
ssh contabo "readlink -f /var/www/webtecnoria/apps/web/releases/current; date -u; command -v gcloud || echo 'no gcloud'"
ssh contabo "find /etc /opt /var/www -maxdepth 6 -iname '*service-account*.json' -o -iname '*client_secret*.json' 2>/dev/null | head"
Resolve-DnsName -Type TXT -Name tecnoriasl.com
node -e "const j=require('C:/Users/Admin/.guiatv/gsc-service-account.json');console.log('client_email:',j.client_email,'project:',j.project_id,'has_private_key:',Boolean(j.private_key));"
```

### 7.4 GA4 code inspection

```powershell
Get-Content apps\web\src\index.html                        # lines 49-55 = the whole GA4 implementation
Get-Content apps\web\src\app\app.component.ts              # NavigationEnd → scrollTo only, no page_view
Get-Content apps\web\src\environments\environment.prod.ts  # talkaris widget endpoints
Select-String -Path (Get-ChildItem -Recurse -File -Include *.ts,*.html -Path apps) -Pattern 'gtag|dataLayer|googletagmanager|G-LE6ETPWL23'
```

---

## 8. What WAVE A/implementation tasks can now assume

1. **GSC is usable read-only, today**, through `guiatv-gsc@guia-tv-8fe3c.iam.gserviceaccount.com`
   (`C:\Users\Admin\.guiatv\gsc-service-account.json`, scope `webmasters.readonly`, JWT → OAuth token →
   `webmasters/v3`). No gcloud, no browser, no service-account creation needed. The property is
   `sc-domain:tecnoriasl.com`, permission `siteOwner`.
2. **Do not write to GSC** (sitemap re-submit, user changes) without explicit owner authorization; the
   credential is technically capable, the task contract is not.
3. **Do not claim GA4 numbers.** Admin/Data access is blocked by an *API-disabled* 403 in project
   `533857766582` **and** missing GA4 property membership. The tag itself is deployed and fires without
   consent, produces no business events, and has no cross-domain/consent configuration.
4. **Sitemap/robots need no repair for correctness**: 32/32 URLs 200, byte-identical to source, single
   canonical sitemap referenced by robots. The open action is a GSC re-submission (write) because
   Google’s record still shows 24 URLs from 2026-04-28.
5. **Referral hygiene** needs two decisions that only the owner can make: whether `talkaris.com` (and
   `auctorio.com`) should be referral-excluded, and whether a cross-domain `linker` should exist. Today
   nothing is configured.

---

## 9. Scope compliance (and the shared working tree)

This task (read-only discovery) wrote **exactly one** file: this document. It performed no build, no
deploy, no service restart, no database access, no GSC/GA4 write call, and printed no credential value
(the private key was only read inside a Node process to sign one JWT).

The repository is a **shared checkout**: other team members are writing to it concurrently. Evidence, in
chronological order.

**Before any read or write of this task** (first command of the session, `git status --short`):

```text
?? .serena/
```

**After writing this document** (`git status --short`, same repository root, snapshot at 2026-11-05
02:09 local / 01:09 UTC; the tree keeps changing while teammates work):

```text
 M apps/web/src/app/app.component.html
 M apps/web/src/app/app.component.ts
 M apps/web/src/app/app.routes.ts
 M apps/web/src/app/site/components/contact-form.component.html
 M apps/web/src/app/site/components/contact-form.component.ts
 M apps/web/src/app/site/components/site-footer.component.ts
 M apps/web/src/app/site/content/site-content.ts
 M apps/web/src/app/site/seo-route-manifest.ts
 M apps/web/src/index.html
 M apps/web/src/sitemap.xml
 M package.json
?? .serena/
?? apps/web/src/app/site/components/consent-banner.component.ts
?? apps/web/src/app/site/pages/cookies-page.component.ts
?? apps/web/src/app/site/services/analytics-events.ts
?? apps/web/src/app/site/services/analytics.service.ts
?? apps/web/src/app/site/services/consent-state.ts
?? apps/web/src/app/site/services/consent.service.ts
?? docs/growth/GROWTH-02-SPEC.md
?? docs/growth/GROWTH-02-TASKS.md
?? docs/growth/_team/GROWTH-02-CONSENT-DISCOVERY.md
?? docs/growth/_team/GROWTH-02-INFRA-DRILL.md
?? docs/growth/_team/GROWTH-02-LEAD-DISCOVERY.md
?? docs/growth/_team/GROWTH-02-MEASUREMENT-DISCOVERY.md
?? docs/growth/_team/gsc-baseline.json
?? scripts/browser-consent.mjs
?? scripts/gsc-query.mjs
?? scripts/tests/
?? specs/002-measurement-consent-lead-reliability/
```

`git diff --stat` for tracked files at the same moment:

```text
 apps/web/src/app/app.component.html                |  5 ++
 apps/web/src/app/app.component.ts                  |  3 +-
 apps/web/src/app/app.routes.ts                     |  7 +++
 .../site/components/contact-form.component.html    | 12 ++++
 .../app/site/components/contact-form.component.ts  | 68 ++++++++++++++++++++--
 .../app/site/components/site-footer.component.ts   | 42 ++++++++++++-
 apps/web/src/app/site/content/site-content.ts      |  1 +
 apps/web/src/app/site/seo-route-manifest.ts        |  1 +
 apps/web/src/index.html                            | 60 +++++++++++++++++--
 apps/web/src/sitemap.xml                           |  6 ++
 package.json                                       |  3 +
 11 files changed, 195 insertions(+), 13 deletions(-)
```

**Attribution.** The delta between the two snapshots is **not** this task's output: it is the parallel
consent/analytics/lead implementation (`consent-banner.component.ts`, `consent.service.ts`,
`analytics.service.ts`, `analytics-events.ts`, `contact-form.component.*`, `scripts/browser-consent.mjs`,
`scripts/gsc-query.mjs`, the sibling discovery docs and `specs/002-…`) produced by other team members in
the same checkout while `t1` was running. `t1`'s own footprint is the single untracked file
`docs/growth/_team/GROWTH-02-MEASUREMENT-DISCOVERY.md`. Because of that concurrency, all repository line
references in this document are anchored to the tree as it was when read (`HEAD 6b86ab0`, clean), and
every production claim is anchored to the served bytes or the deployed release, not to the moving
working tree.

Consequence for the next reviewer: a `git status --short` that shows more than this one file is expected
in this workspace and must not be read as a scope violation by `t1`; verify instead that
`GROWTH-02-MEASUREMENT-DISCOVERY.md` is the only path whose content matches this report.
