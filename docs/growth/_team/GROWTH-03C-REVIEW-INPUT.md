# GROWTH-03C — Independent review evidence (independent-reviewer)

Date: 2026-11-05 (Europe/Madrid). Reviewer family: DeepSeek V4 Pro (different family from MiniMax/GLM implementers).
Scope: release candidate = commits `415e2ca`, `6500f35`, `6cfcb4f` (baseline `68c19cc`, origin/master `894e7c6`).
Rule applied: read-only; no implementation edits, no deploy, no service restart. This file is the only written artifact.

## 1. Actual diff (reviewed byte-by-byte)

`git -c color.ui=false --no-pager diff 68c19cc HEAD` → 5 files, 50 insertions, 3 deletions. No change outside the declared scope.

| File | Purpose | Verdict |
|---|---|---|
| `apps/web/angular.json` (+1) | `"aot": true` added to the production configuration (base options keep `"aot": false` at line 22). | Correct |
| `apps/web/src/polyfills.ts` | Drops `import '@angular/localize/init'`, replaced with an explanatory comment. | Correct (see F1) |
| `apps/web/src/app/site/pages/article-page.component.ts` (+11) | Adds optional `serviceLinks?` to `ApiArticleView`; API branch inherits `serviceLinks` from `getArticleBySlug(slug)?.serviceLinks`. | Correct, SSR-safe |
| `infra/bin/publish-frontend-release.sh` (+8) | H-10 fix: `printf '%s' "$body" | grep -Fq` → `grep -Fq -- "$text" <<<"$body"`. | Correct (see F2) |
| `scripts/tests/internal-links.test.mjs` (+24) | New regression test asserting the API branch carries `staticCounterpart?.serviceLinks`. | Source-level test (see F6) |

## 2. Performance — independent reproduction on the final bytes

Built the final tree myself: `npm run build:ssr:web` → exit 0, "Prerendered 0 static routes", "Application bundle generation complete. [30.230 seconds]".

Built `dist/browser` top scripts (my build, actual bytes):

```
polyfills-RNHY7D3N.js   34,609 B   (was 500,258 B in perf-03c-before.json)
main-S5IVJD3W.js       128,733 B   (identical name+size to perf-03c-after.json)
chunk-M6HQQAKG.js      186,663 B   (identical name+size to perf-03c-after.json)
chunk-4RZWRMQW.js       93,500 B   (identical name+size to perf-03c-after.json)
```

`grep -E 'compiler_facade|jitCompiler|compileComponent|@angular/compiler' polyfills-RNHY7D3N.js` → **No matches** (JIT compiler removed from the client polyfills bundle).

Conclusion: the "after" measurement is byte-identical to my independent build of the final commit (content-addressed chunk names match), and the polyfills bundle shrank from 500,258 B to 34,609 B. The root cause (aot:false shipping the JIT compiler) is confirmed.

Recorded medians (from `docs/growth/_team/perf-03c-{before,after}.json`, cross-run scenario aggregate):

| Metric (home) | before | after |
|---|---|---|
| jsTransferBytes | 1,392,801 B (1,360.2 KiB) | 674,563 B (658.8 KiB) |
| blocking approx | 3,095.0 ms | 906.5 ms |
| LCP | 878 ms | 878 ms (not claimed) |
| service jsTransfer | 1,369,570 B | 650,207 B |
| service blocking | 1,189.5 ms | 436.0 ms |

Methodology is sound: same harness, same profile (390x844 DPR3, 4x CPU, Slow 4G, isolated cache, consent=none), 5 samples x 2 runs, medians + MAD recorded, build fingerprints before (`c2332f75…`) and after (`1249508e…`). The blocking metric is explicitly labelled "long-task blocking approximation … NOT Lighthouse Total Blocking Time (TBT)" — not mislabelled. LCP not claimed.

## 3. H-10 diagnosis — independent reproduction on contabo (read-only)

Live origin body: `curl https://tecnoriasl.com/` → 125,767 bytes; "TecnoRia" occurs 13 times, first at byte 243.

Loop over the exact old pipeline under `set -o pipefail` (200 iterations):

```
OLD_pipe_fail: fail=200 exit0=0 exit141=200 other=0
NEW_herestring: fail=0 pass=100
```

Exit 141 = 128 + SIGPIPE. The classification (shell defect in `verify_expected_text`, not an application failure, not a readiness race) is fully supported by my own reproduction: 100 % false failures on the old form, 0 % on the here-string form.

Deployment-path note (F2): `infra/bin/deploy-tecnoria-web.sh` execs `/var/www/bin/publish-frontend-release.sh` (a shared server-managed script outside this repo), not the repo's `infra/bin/` copy. Observed on the server: `/var/www/bin/publish-frontend-release.sh` already carries the identical here-string fix (mtime 2026-11-05 19:01 CET); `/var/www/webtecnoria/infra/bin/publish-frontend-release.sh` (repo checkout at 894e7c6) still has the old `printf | grep -Fq` form.

## 4. HTTP/HTTPS canonicalization — Node fetch matrix

| Input | Chain | Final |
|---|---|---|
| `http://tecnoriasl.com/` | 301 → `https://tecnoriasl.com/` | 200, HSTS `max-age=15552000`, canonical `https://tecnoriasl.com/` |
| `http://www.tecnoriasl.com/` | 301 → `https://www.tecnoriasl.com/` → 301 → `https://tecnoriasl.com` | 200, canonical self |
| `https://www.tecnoriasl.com/` | 301 → `https://tecnoriasl.com` | 200, canonical self |
| `https://tecnoriasl.com/` | — | 200, canonical self |

- `href="http://` internal links in homepage HTML: **0**.
- `https?://www.` occurrences: 1 — it is `https://www.googletagmanager.com/gtag/js?id=` (third-party GTM loader URL), not an internal www link. t1's "no www links" holds for the site's own domain.
- Sitemap: 33 URLs, all `https://tecnoriasl.com/` apex, 0 non-apex, 0 non-https.
- DNS: AAAA `2a06:98c1:3121::5`, `2a06:98c1:3120::5` (IPv6 present); A `188.114.97.5`, `188.114.96.5` (Cloudflare). IPv4/IPv6 parity confirmed.

## 5. Regression suites — re-run on the final bytes (all exit 0)

- `npm run build:ssr:web` → exit 0.
- `npm run test:seo` → "SEO checks passed: 33 public routes, JSON-LD, 404/301, cache, sitemap and anchor integrity."
- `npm run test:consent` → 22/22 pass.
- `npm run test:analytics` → 15/15 pass.
- `npm run test:browser` → 24/24 pass, incl. "no hydration errors were reported", "accept grants analytics only and loads gtag/js once", "success without analytics consent sends no generate_lead".
- `npm run test:links` → 7/7 pass (incl. the new "a CMS-served article still renders the editorial service link").
- `npm run test:perf` → 6/6 pass.
- `npm run test:api` → 61/61 pass.

## 6. Security / privacy / consent

- Full diff contains no credentials, tokens or PII. `angular.json` `cli.analytics` UUID is pre-existing, not added by this diff.
- No `$localize`/`i18n` usage anywhere in `apps/web/src` (grep → only the new comment). Removing the localize import is safe.
- Consent preserved: browser suite proves no analytics/generate_lead request fires before consent; no hydration errors.
- Private routes / auth / 404 covered by seo + api suites (no change in this diff).
- t2's pre-existing lead-admin finding (`GET /api/v1/contact/messages` with `requireAdmin`) is in production commit 894e7c6, NOT introduced by this diff; out of scope here.

## 7. Rollback

Server: `/var/www/webtecnoria/apps/web/releases/` retains 6 releases; `current -> 20261105_052852`. Rollback target `20261105_012220` is present with `browser/main-7FA6DAL5.js` and `server/server.mjs` (reachable, has browser+server). t1's note that the target is pruned after ~4 more publishes stands.

## Findings

| id | severity | file | problem | required fix |
|---|---|---|---|---|
| F1 | low | `apps/web/src/polyfills.ts` | Comment attributes the 500,258 B to `@angular/localize/init`, but the measured localize-only removal was −507 B; the compiler came from `aot:false` (JIT). The committed comment misattributes the root cause. | Reword the comment: the 500 KB was the JIT compiler from `aot:false`; `@angular/localize/init` was an unused ~507 B import. |
| F2 | medium | `infra/bin/publish-frontend-release.sh` | The deploy executes `/var/www/bin/publish-frontend-release.sh` (shared, server-managed, not in this repo), not this repo copy. The repo commit fixes a non-authoritative copy; the production fix lives in the shared file (observed already fixed, mtime 19:01 CET). Drift/provenance risk; consistent with t1's "needs operator + 3 app owners". | Confirm with the operator that the shared `/var/www/bin/` fix is intentional and coordinated; ideally track that file's provenance or sync it from the repo. Non-blocking: production is already fixed. |
| F3 | low | (t3 summary) | "initial JS 725,992 → 262,338 B" appears only in the t3 summary, not in the recorded perf artifacts (which record `jsTransferBytes` and per-script sizes). Headline reduction is confirmed; this sub-metric is not independently reproducible from the artifacts. | Either record the "initial JS" aggregate in the perf harness, or drop the specific number from the release notes. |
| F4 | low | perf artifacts | Both `before`/`after` artifacts record `git.commit = 68c19cc` (the "after" ran on a dirty tree before the commits landed). No material impact: I reproduced the final build and it is byte-identical to the "after" artifact. | Record the final commit id when re-running the harness post-commit. |
| F5 | low | perf artifacts | The "after" run captured one third-party `talkaris.com` chat-widget request absent from "before" (flaky widget load), slightly contaminating total-transfer comparison. | Not required; optionally isolate chat-widget requests when comparing transfer. |
| F6 | low | `scripts/tests/internal-links.test.mjs` | The new test asserts source text via regex (change detector), not runtime behaviour; it would pass with a runtime bug in the sidebar rendering. | Prefer a runtime assertion (render the CMS-served slug and assert the href) once the SSR harness supports it. |

## Verdict

**PASS** — no critical or high finding is open. The candidate is safe to deploy.

Independently measured: polyfills 500,258 B → 34,609 B (JIT compiler removed); total JS transfer home 1,360.2 → 658.8 KiB (−51.6 %); blocking approximation home 3,095.0 → 906.5 ms, service 1,189.5 → 436.0 ms; LCP 878 → 878 ms (correctly not claimed). H-10 reproduced 200/200 fail (exit 141) vs 100/100 pass on the here-string form. All 7 regression suites green on the final bytes. Canonicalization matrix and rollback target verified.

The medium finding F2 (shared deploy-script provenance) must be confirmed with the operator before or at deployment, but the production smoke path is already observed to carry the fix.
