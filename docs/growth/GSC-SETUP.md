# Search Console setup and operating procedure — tecnoriasl.com

**Owner:** growth team (`tecnoria-growth-02`)
**Last verified:** 2026-11-05, 01:02–01:20 UTC (server clock `Thu Nov  5 01:07:56 UTC 2026`)
**Property:** `sc-domain:tecnoriasl.com`
**Status:** read-only API access **works**; the GSC web UI and every GSC write except one are **not** available to this team.

This document is the operational reference for reading Search Console data for `tecnoriasl.com`.
Every value below was produced by a command or an API field that is quoted next to it. Nothing here is
estimated.

---

## 1. Verified state

| Item | Verified value | How it was verified |
|---|---|---|
| Property | `sc-domain:tecnoriasl.com` (domain property, covers apex + every subdomain) | `node scripts/gsc-query.mjs sites` → `HTTP 200`; entry present |
| Permission of the service account | `siteOwner` | same response: `sc-domain:tecnoriasl.com  [siteOwner]` |
| Other properties visible to the same credential | `sc-domain:embarcarte.com` `[siteFullUser]`, `sc-domain:guiaprogramaciontv.com` `[siteOwner]` | same response (3 properties total) |
| Service account | `guiatv-gsc@guia-tv-8fe3c.iam.gserviceaccount.com` (GCP project `guia-tv-8fe3c`) | `node -e "…console.log(j.client_email, j.project_id)"` on the key file |
| Credential file (Windows host) | `C:\Users\Admin\.guiatv\gsc-service-account.json` (type `service_account`, `private_key` present) | metadata read; **value never printed** |
| Credential file (Contabo server) | `/etc/guiatv/gsc-service-account.json`, wired as `GOOGLE_APPLICATION_CREDENTIALS` by `/etc/guiatv/api.env:53` | `ssh contabo "grep -nE '^(GSC_SITE_URL\|GOOGLE_APPLICATION_CREDENTIALS)=' /etc/guiatv/api.env"` |
| Apex DNS verification record | TXT `google-site-verification=ogx8tZkgS1FgRlxIUa1w2bM69JZe-yOo1ERAd4JI1Y8` | `Resolve-DnsName -Type TXT -Name tecnoriasl.com` → one TXT string |
| Sitemap id | `https://tecnoriasl.com/sitemap.xml` | `node scripts/gsc-query.mjs sitemaps` |
| Sitemap submission (current) | `lastSubmitted` `2026-11-05T01:02:18.646Z`, PUT returned **HTTP 204**, `isPending: true` immediately after the PUT | captain's submission run, 2026-11-05 |
| Sitemap state at 01:02:24Z (6 s later) | `lastDownloaded` `2026-11-05T01:02:19.622Z`, `isPending: false`, `errors: "0"`, `warnings: "0"`, `contents[0] = {type:"web", submitted:"32", indexed:"0"}` | `docs/growth/_team/gsc-baseline.json` → `sitemaps[0]` |
| Sitemap state re-checked at 01:12:32Z | identical to the line above | `node scripts/gsc-query.mjs sitemaps` (no override needed: the tool pins the property, §2) |
| Sitemap before this milestone | `lastSubmitted` `2026-03-12T18:29:06.613Z`, `lastDownloaded` `2026-04-28T12:39:53.371Z`, `submitted:"24"`, `indexed:"0"` | discovery probe recorded in `docs/growth/_team/GROWTH-02-MEASUREMENT-DISCOVERY.md` §5.3 |
| `gcloud` / `bq` required? | No. Neither binary exists (`command -v gcloud` → “no gcloud”), and none is needed. | `ssh contabo "command -v gcloud \|\| echo 'no gcloud'"` |

---

## 2. Property selection (tool behaviour — and the trap it removes)

**You no longer set `GSC_SITE_URL` to choose a property.** Since the 2026-11-05 repair,
`scripts/gsc-query.mjs` pins the property itself (`:131-142`):

| Mechanism | Behaviour |
|---|---|
| default | `sc-domain:tecnoriasl.com` (`DEFAULT_SITE`) |
| ambient `GSC_SITE_URL` | **ignored** when it differs from the property being queried; the script prints a warning and continues with the correct property |
| `--site <property>` | deliberately targets another property, e.g. `node scripts/gsc-query.mjs sitemaps --site sc-domain:embarcarte.com` |
| `GSC_SITE_URL_OVERRIDE` | honoured as an alternative **default** when explicitly set (lower precedence than `--site`) |

Real output of an innocent `inspect` run on this host (the ambient variable is still set at user scope,
so the warning appears every time — it is expected, not an error):

```text
$ node scripts/gsc-query.mjs inspect "https://tecnoriasl.com/productos/talkaris"
# WARNING: ambient GSC_SITE_URL=sc-domain:guiaprogramaciontv.com ignored; querying sc-domain:tecnoriasl.com. Use --site to target another property.
# service account: guiatv-gsc@guia-tv-8fe3c.iam.gserviceaccount.com
# property: sc-domain:tecnoriasl.com
HTTP 200
```

Confirm which property a run used from its `# property:` header (or the `"property"` field that
`baseline` writes into the JSON) — not from the environment.

### 2.1 History — why this exists (not an operating requirement)

This Windows host has `GSC_SITE_URL` defined at **user scope**, pointing at a different site:

```text
$ Get-ItemProperty -Path 'HKCU:\Environment' -Name GSC_SITE_URL | Select-Object GSC_SITE_URL
GSC_SITE_URL
------------
sc-domain:guiaprogramaciontv.com
```

Before the fix, the script read the property from `GSC_SITE_URL` and only fell back to
`sc-domain:tecnoriasl.com` when it was unset. A plain `node scripts/gsc-query.mjs sitemaps` therefore
queried **guiaprogramaciontv.com** and printed six sitemaps from that property:

```text
# property: sc-domain:guiaprogramaciontv.com
HTTP 200
{"path":"https://guiaprogramaciontv.com/sitemap.xml", … "submitted":"4011" …}
```

That run is the mechanism behind the previous milestone's “GSC is for guiaprogramaciontv.com”
conclusion. The repair removes the footgun instead of documenting a workaround: the property is now
pinned, a differing ambient value is ignored **with a visible warning**, and targeting another property
is an explicit `--site` decision. Leaving `GSC_SITE_URL` set is harmless; setting it is no longer
required anywhere in this procedure.

---

## 3. Authentication mechanics

The script signs a JWT itself with `node:crypto`; there is no gcloud, no browser flow, no npm
dependency (`scripts/gsc-query.mjs:19-72`).

1. Read `GOOGLE_APPLICATION_CREDENTIALS` → parse the service-account JSON; refuse anything that is not
   `type: "service_account"` with a `client_email` and `private_key` (`:32-42`).
2. Build claims `{ iss: client_email, scope, aud: "https://oauth2.googleapis.com/token", iat, exp: iat+3600 }`
   and sign `base64url(header).base64url(claims)` with **RS256** using the private key (`:44-57`).
3. `POST https://oauth2.googleapis.com/token` with
   `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=<jwt>` (`:59-71`).
4. Call the Search Console API with `Authorization: Bearer <access_token>` (`:84-101`).

Scopes (`scripts/gsc-query.mjs:25-26`):

| Constant | Scope | Used by |
|---|---|---|
| `SCOPE_READ` | `https://www.googleapis.com/auth/webmasters.readonly` | `sites`, `sitemaps`, `query`, `inspect`, `baseline` |
| `SCOPE_WRITE` | `https://www.googleapis.com/auth/webmasters` | **only** `submit-sitemap` (`:134`) |

The access token is never printed, cached to disk, or written to the baseline file. The service-account
key is never printed either — only its `client_email` is echoed (`:140`).

Prerequisite for any of this in a fresh shell (the property needs no variable — §2):

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "$env:USERPROFILE\.guiatv\gsc-service-account.json"
```

If `GOOGLE_APPLICATION_CREDENTIALS` is unset the script fails closed with
`ERROR GOOGLE_APPLICATION_CREDENTIALS is not set` (`:34-36`) — it never falls back to another credential.

---

## 4. Commands

All examples assume the two environment variables from §3. All calls hit
`https://searchconsole.googleapis.com`, which is the same API as `www.googleapis.com/webmasters/v3`.

### 4.1 `sites` — which properties exist and with what permission

```powershell
node scripts/gsc-query.mjs sites
```

```text
# service account: guiatv-gsc@guia-tv-8fe3c.iam.gserviceaccount.com
# property: sc-domain:tecnoriasl.com
HTTP 200
sc-domain:guiaprogramaciontv.com  [siteOwner]
sc-domain:tecnoriasl.com  [siteOwner]
sc-domain:embarcarte.com  [siteFullUser]
```

The order of the three entries is whatever the API returns and is **not stable** between runs — always
match on the `siteUrl` string, never on position.

### 4.2 `sitemaps` — submission state, counters, errors

```powershell
node scripts/gsc-query.mjs sitemaps
```

```text
HTTP 200
{"path":"https://tecnoriasl.com/sitemap.xml","lastSubmitted":"2026-11-05T01:02:18.646Z",
 "lastDownloaded":"2026-11-05T01:02:19.622Z","isPending":false,"errors":"0","warnings":"0",
 "contents":[{"type":"web","submitted":"32","indexed":"0"}]}
```

Read `lastSubmitted` as “when we last told Google about this sitemap”, `lastDownloaded` as “when Google
last fetched it”, `isPending` as “the fetch is queued/under way”, and `errors`/`warnings` as Google's
parse diagnostics. Treat `contents[].indexed` as a **legacy counter** (§6).

### 4.3 `query` — search analytics

```powershell
node scripts/gsc-query.mjs query --days 28
node scripts/gsc-query.mjs query --days 28 --dimension query
node scripts/gsc-query.mjs query --days 28 --dimension page
node scripts/gsc-query.mjs query --days 90 --dimension country
node scripts/gsc-query.mjs query --days 90 --dimension device
```

The date window is “last N days including today”: `startDate = today-(N-1)`, `endDate = today`
(`scripts/gsc-query.mjs:103-106`), `rowLimit: 100`, `dataState: "all"` (`:106-112`). With
`--dimension` omitted, the API returns one row = the property total (`keys: []`). Each row prints
`keys, clicks, impressions, ctr, position` (`:200-209`). `--dimension` accepts
`query | page | country | device` (anything else returns rows with an empty/odd dimension — verify the
`# … dimension=` header line).

### 4.4 `inspect` — URL Inspection for one URL

```powershell
node scripts/gsc-query.mjs inspect "https://tecnoriasl.com/servicios"
```

```text
HTTP 200
{
  "inspectionResult": {
    "inspectionResultLink": "https://search.google.com/search-console/inspect?resource_id=sc-domain:tecnoriasl.com&id=…",
    "indexStatusResult": {
      "verdict": "PASS",
      "coverageState": "Submitted and indexed",
      "robotsTxtState": "ALLOWED",
      "indexingState": "INDEXING_ALLOWED",
      "lastCrawlTime": "2026-10-25T23:21:18Z",
      "pageFetchState": "SUCCESSFUL",
      "googleCanonical": "https://tecnoriasl.com/servicios",
      "userCanonical": "https://tecnoriasl.com/servicios",
      "crawledAs": "MOBILE"
    }
  }
}
```

`inspect` sends `{inspectionUrl, siteUrl}` to `v1/urlInspection/index:inspect` (`:213-228`). The URL must
belong to the property, otherwise the API returns an error object instead of `inspectionResult`.

### 4.5 `baseline` — the reproducible snapshot

```powershell
node scripts/gsc-query.mjs baseline --out docs/growth/_team/gsc-baseline.json
```

Writes one JSON file (`:230-300`) containing: `queriedAt`, `property`, `serviceAccount`, `sitemaps`,
`totals` for 7/28/90/480 days, 28-day `byQuery`/`byPage`/`byCountry`/`byDevice`, and a 480-day
`sixteenMonthQueries` list. It is the **only** file this tool writes, and it is a read-only action
against Google. `docs/growth/_team/gsc-baseline.json` (`queriedAt 2026-11-05T01:02:24.127Z`) is the
source for `docs/growth/SEARCH-BASELINE.md`.

### 4.6 `submit-sitemap` — the single write

```powershell
node scripts/gsc-query.mjs submit-sitemap            # PUT the default sitemap URL
node scripts/gsc-query.mjs submit-sitemap --url https://tecnoriasl.com/sitemap.xml
```

This is the **only** command that requests `SCOPE_WRITE` (`:26`, `:134-138`) and the only one that
mutates Google state (`:177-189`). The 2026-11-05 run returned **HTTP 204** (no body), and the property
then reported `lastSubmitted = 2026-11-05T01:02:18.646Z`. HTTP 204 means “accepted”, not “crawled” and
not “indexed” (§6). Run it only with explicit owner authorization — see §5.

---

## 5. Read-only vs write rule

| Class | Commands | Effect | Authorization needed |
|---|---|---|---|
| Read | `sites`, `sitemaps`, `query`, `inspect`, `baseline` | none; `baseline` only writes a local JSON file | none — safe to run at will |
| Write | `submit-sitemap` | `PUT /webmasters/v3/sites/{site}/sitemaps/{feedpath}` → Google records/refreshes the sitemap and re-queues a fetch | **explicit owner approval, every time** |

Why `submit-sitemap` is the only write: the service account is `siteOwner`, so it *could* also manage
users, remove sitemaps or change settings. This toolchain deliberately exposes none of that — the script
has no code path for it, and the write scope is requested only inside the `submit-sitemap` branch
(`scripts/gsc-query.mjs:134`). Keep it that way: adding a second write command would silently widen the
blast radius of a `siteOwner` credential.

Rules for the write:

1. Confirm the property first (`node scripts/gsc-query.mjs sites`) and read the `# property:` header of
   the write run. The tool pins `sc-domain:tecnoriasl.com` and ignores a differing ambient
   `GSC_SITE_URL` (§2), so a wrong-property write requires an explicit `--site`, not an accident.
2. Confirm the sitemap is valid and reachable *before* submitting:
   `curl -sS -o NUL -w '%{http_code}' https://tecnoriasl.com/sitemap.xml` → `200`, and the `<loc>` count
   matches what you expect.
3. Record the `lastSubmitted` value before and after; an unchanged value means the PUT did not land.
4. Only after a deploy that added/removed URLs. Routine re-submission on a schedule is pointless and,
   per Google, can slow down crawl scheduling.

---

## 6. Sitemap submission is not indexation

Two facts observed side by side on 2026-11-05 prove it:

- Sitemap counters: `submitted: "32"`, `indexed: "0"` (`docs/growth/_team/gsc-baseline.json` →
  `sitemaps[0].contents[0]`).
- URL Inspection for the same site: `/`, `/servicios`, `/servicios/desarrollo-software-medida`,
  `/contacto` and `/blog/cuanto-cuesta-desarrollar-software-medida` all return
  `coverageState: "Submitted and indexed"`, `verdict: "PASS"` (details and timestamps in
  `docs/growth/SEARCH-BASELINE.md` §7).
- `/productos/talkaris` is in the same sitemap and, at the 2026-11-05T01:25:29Z re-inspection, returns
  `coverageState: "Discovered - currently not indexed"`, `verdict: "NEUTRAL"`, no `lastCrawlTime` — it
  has never been crawled. (An earlier inspection the same day returned `URL is unknown to Google`; both
  literals and their timestamps are recorded in `docs/growth/SEARCH-BASELINE.md` §7.)

So `indexed: "0"` is a stale/legacy counter, not index coverage; and a URL being in a freshly submitted
sitemap does not mean Google has discovered it. Treat `sitemaps` as transport diagnostics and
`inspect` as the index authority.

What a successful submission actually buys: the sitemap is registered/refreshed and a fetch is queued
(`isPending`), then Google downloads it (`lastDownloaded`) and parses it (`errors`, `warnings`). Discovery
of individual URLs, crawling, canonical selection and indexation are separate steps the API does not
guarantee.

---

## 7. Credential rotation and replacement

Three distinct cases. Pick the one that matches what you are doing.

### 7.1 Rotate the key of the *same* service account (`guiatv-gsc@…`) — no GSC change needed

The GSC permission belongs to the service-account **identity**, so a new key does not change `siteOwner`.

1. In Google Cloud console → project `guia-tv-8fe3c` → IAM & Admin → Service Accounts →
   `guiatv-gsc` → Keys → *Add key* → JSON. (No `gcloud` CLI is available on this host; use the console.)
2. Replace the file content at `C:\Users\Admin\.guiatv\gsc-service-account.json` (host) and, if the
   server tooling needs it, at `/etc/guiatv/gsc-service-account.json` (root-owned, mode `600`).
3. Verify: `node scripts/gsc-query.mjs sites` → `HTTP 200` and the three properties with the same
   permission levels.
4. Delete the old key in the same console page **after** the new one is verified.
5. Never commit the JSON. It lives outside the repository on purpose; `git check-ignore` is irrelevant
   because the file is not inside the checkout at all. If you ever copy it into the repo,
   `.gitignore` it *and* rotate it immediately.

### 7.2 Replace the service account with a *new* identity — requires GSC UI access (blocked, §8)

A brand-new service account is unknown to Search Console. Someone with GSC access must add it in
*Settings → Users and permissions* (or re-verify the property). The API cannot do this for a domain
property, and this team has no browser session for the owning Google account. **Do not delete the old
service account/key until the new one has been delegated**, or the only working read path is lost.

### 7.3 If the key is lost or compromised

1. Revoke the key immediately in the Cloud console (Keys → delete).
2. Create a replacement key per §7.1. The `siteOwner` grant survives, because it is attached to the
   service account, not to the key.
3. Check for misuse in the GSC UI (not available here) and in GCP audit logs for `webmasters.googleapis.com`.

### 7.4 Verification after any rotation

```powershell
node scripts/gsc-query.mjs sites                       # HTTP 200, sc-domain:tecnoriasl.com [siteOwner]
node scripts/gsc-query.mjs sitemaps                    # the 32-URL sitemap, errors 0
node scripts/gsc-query.mjs inspect "https://tecnoriasl.com/"   # verdict PASS
```

If `sites` returns 401/403, the token exchange failed (wrong key, clock skew, or key deleted). If it
returns 200 but the tecnoriasl property is absent, you are using a different service-account identity
(§7.2).

---

## 8. What is still unavailable, and why (precise blockers)

| Capability | Status | Precise reason | What would unblock it |
|---|---|---|---|
| GSC **web UI** (Performance report, Indexing pages, Settings, Users) | BLOCKED | No browser session authenticated as a Google account that is a user/owner of `sc-domain:tecnoriasl.com`. The service account can hold `siteOwner`, but it cannot open the UI, and this team has no authorization to use a personal session. | An owner opens the UI, or exports the report and hands over the file. |
| GSC **writes other than sitemap submission** (add/remove users, remove sitemap, property settings) | BLOCKED | Not implemented in the toolchain by design; the `siteOwner` credential is technically capable, but there is no owner authorization for these actions. | A written owner approval plus a new, reviewed command in `scripts/gsc-query.mjs`. |
| GA4 **Admin / Data API** access (property settings, reports) | BLOCKED | Verified by API: `GET https://analyticsadmin.googleapis.com/v1beta/accountSummaries` → **HTTP 403 `SERVICE_DISABLED`** — “Google Analytics Admin API has not been used in project 533857766582 before or it is disabled”; `details[0].reason = "SERVICE_DISABLED"`, `metadata.containerInfo = "533857766582"`. | Enable `analyticsadmin.googleapis.com` (and `analyticsdata.googleapis.com`) in project `533857766582`. |
| GA4 **property membership** for the service account | BLOCKED | GA4 permissions are granted per property (Admin → Property access management). `guiatv-gsc@…` holds no role on the GA4 property behind `G-LE6ETPWL23`; nothing in this environment proves otherwise. The numeric property id for `G-LE6ETPWL23` is unknown. | A GA4 Administrator adds the service-account email as Viewer (or Analyst) on that property. |
| **Cloudflare cache operations** (purge, rules) | BLOCKED for this toolchain | No Cloudflare credential is wired into any tecnoria or growth tooling: `CLOUDFLARE_API_TOKEN` is **not** in the process environment (`Get-Item Env:CLOUDFLARE_API_TOKEN` → not present). Credential *material* does exist elsewhere but is unverified: `C:\Users\Admin\.guiatv\cloudflare.env` defines `CLOUDFLARE_API_TOKEN` (53 chars, not exported), and the Contabo server has `/root/.config/cloudflare/api.env` with populated `CF_API_TOKEN` (40 chars) and `CF_ACCOUNT_ID` (32 chars). Neither has been tested for the `Zone.Cache Purge` permission, and a purge is a **write** that needs owner authorization. | Verify the token's zone permissions with a read-only `GET /client/v4/zones`, then get approval for the purge call. |
| Indexing API / URL Inspection *indexing requests* | NOT USED | The Indexing API is for job-posting/livestream pages only; it would be misuse here. Not implemented. | Not needed. |
| Scheduled automated baseline runs | NOT IMPLEMENTED | `scripts/gsc-query.mjs baseline` is manual today. Verified 2026-11-05: `ssh contabo "crontab -l \| grep -iE 'gsc\|search\|baseline\|growth'"` → no matching crontab entries, `systemctl list-timers --all` → no matching timers, and the Windows scheduler has no such task (the only name match, `RecommendedTroubleshootingScanner`, is a built-in Windows task). | Add a scheduled task (host) or systemd timer (server) that runs the command and stores the JSON. |

No blocked item above is a property/verification problem: the property exists, is verified, and the
service account owns it. The blockers are **credentials and permissions in other systems** (Google
Analytics, Cloudflare) and **human UI access**, not Search Console for tecnoriasl.com.

---

## 9. Operating rules

1. **Never print or commit the private key.** Only `client_email` may appear in logs and docs.
2. **Never export `GSC_SITE_URL` to choose a property.** The tool pins `sc-domain:tecnoriasl.com` and
   warns when the ambient value differs; use `--site <property>` when another property is genuinely
   intended (§2).
3. **Read-only by default.** Any new call that changes Google state needs its own review and owner
   approval; do not extend `submit-sitemap` into a general writer.
4. **Numbers come from `baseline`, not from ad-hoc queries**, so that a report can be reproduced. If you
   must use an ad-hoc query, record its exact command and window.
5. **Row tables are not additive.** On 2026-11-05 the 28-day property total was 216 impressions, the 32
   query rows summed to 169 (GSC suppresses low-volume queries) and the 19 page rows summed to 251
   (page-level rows exceeded the total; reproduced twice). Use the totals row for totals and row tables
   only for relative ranking. See `docs/growth/SEARCH-BASELINE.md` §10.
6. **`dataState: "all"` is in use**, so the most recent 2–3 days can still change. Re-run `baseline`
   before quoting a new period instead of editing an old file.
7. **Do not delete the apex TXT record** `google-site-verification=ogx8tZkgS1FgRlxIUa1w2bM69JZe-yOo1ERAd4JI1Y8`.
   It is the DNS proof behind the domain property.
8. **`submitted`/`indexed` counters are not coverage.** Use `inspect` for index status (§6).

---

## 10. Post-change checklist

Run after any credential, property or tooling change:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "$env:USERPROFILE\.guiatv\gsc-service-account.json"
node scripts/gsc-query.mjs sites                 # 200 + sc-domain:tecnoriasl.com [siteOwner]
node scripts/gsc-query.mjs sitemaps              # 200 + the 32-URL sitemap, errors "0"
node scripts/gsc-query.mjs query --days 7        # one row: clicks/impressions/ctr/position
node scripts/gsc-query.mjs inspect "https://tecnoriasl.com/"
```

Expected shape of a healthy run: four `HTTP 200` lines, the property string `sc-domain:tecnoriasl.com`
in every `# property:` header, `errors:"0"` in the sitemap, and `verdict: "PASS"` with
`coverageState: "Submitted and indexed"` for the homepage.

For the production-side checklist (HTTP, sitemap count, 404, pre-consent Google tag, contact endpoint,
TLS, TTFB, release) use `node scripts/growth-monitor.mjs`; it writes a timestamped JSON observation
file under `docs/growth/_team/`.

Real run on 2026-11-05 (the consent bundle was **not** deployed yet at that moment, so the pre-consent
invariant correctly FAILs; the tool exits 1 on any FAIL):

```text
$ node scripts/growth-monitor.mjs --base https://tecnoriasl.com --release 20261105_012220 --out %TEMP%\growth-monitor-demo-2026-11-05.json
# growth-monitor  2026-11-05T01:20:04.649Z
# base            https://tecnoriasl.com
# release         20261105_012220

STATUS  CHECK                                            DETAIL
-------------------------------------------------------------------------------------------------
PASS    GET / returns 200                                HTTP 200, 118117 bytes
PASS    served HTML contains a <title>                   <title>Software a medida e IA para empresas en Galicia | TecnoRia</title>
PASS    sitemap.xml lists URLs                           HTTP 200, 32 <loc> entries
PASS    unknown path returns 404                         GET /growth-monitor-460c9a7dc432 -> HTTP 404
FAIL    no pre-consent Google tag in served HTML         found in served HTML: <script src="...googletagmanager.com..."> x1, gtag('config' x1 (expected only after the consent bundle is deployed)
PASS    POST /api/v1/contact rejects an invalid payload  HTTP 400 for body {}
PASS    TLS certificate has enough days left             53 days (valid_to Dec 28 17:58:36 2026 GMT)
PASS    TTFB within budget                               955 ms (budget 2000 ms)
UNKNOWN expected release id is the one served            "20261105_012220" not present in served HTML (no release marker exposed); cannot confirm the served release from HTML

OVERALL FAIL  (pass=7 fail=1 skip=0 unknown=1)
[exit code: 1]
```

Interpretation of that run: seven of the eight objective checks pass; the single FAIL is the
*pre-deployment* state that the consent milestone is meant to change (a `googletagmanager.com`
script tag and `gtag('config'` are still in the served HTML, loaded before any consent choice). The
UNKNOWN row means the served HTML exposes no release marker, so the release id cannot be verified from
the page — that is a tooling gap to close in the deploy pipeline, not a production fault.

The observation JSON is written to `--out` (default `docs/growth/_team/monitor-<timestamp>.json`) and
contains only status codes, counts and timings — no PII, no lead payload. The contact probe sends an
empty JSON body, so it can never create a lead.


---

## 11. Code map (`scripts/gsc-query.mjs`)

| Lines | What lives there |
|---|---|
| `19-26` | imports, default property, read/write scope constants |
| `28-42` | `b64url`, `loadServiceAccount` (fails closed) |
| `44-72` | JWT signing + token exchange |
| `74-82` | date helpers (`daysAgo`, `isoDate`) |
| `84-101` | `call()` — bearer request, JSON or text body |
| `103-118` | `searchAnalytics()` — window, dimensions, `rowLimit: 100`, `dataState: "all"` |
| `120-126` | `arg()` — `--name value` parsing |
| `128-142` | command dispatch, scope selection, `# service account` / `# property` headers |
| `143-176` | `sites`, `sitemaps` |
| `177-189` | `submit-sitemap` (the only write) |
| `190-212` | `query` |
| `213-229` | `inspect` (URL Inspection v1) |
| `230-301` | `baseline` (writes the JSON snapshot) |

Related documents: `docs/growth/SEARCH-BASELINE.md` (what the numbers say),
`docs/growth/_team/GROWTH-02-MEASUREMENT-DISCOVERY.md` (credential and third-party discovery),
`docs/growth/ANALYTICS-MEASUREMENT.md` (analytics/consent plan — note its GSC section is obsolete).
