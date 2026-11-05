# GROWTH-03C — Independent post-deployment verification of release `20261105_191921`

Task `t5` · member `release-engineer` · attempt `ee8a5d32-3ca2-4223-80c5-f74020a82f1a`
Route (as assigned): `openrouter-minimax / minimax/minimax-m3.1-flash` (L2). Cost UNKNOWN (no provider usage sample).
Verification date: 2026-11-05, ~19:21–19:30 CET. Host `contabo` (vmi2962975), server clock CET (UTC+01:00).

**Read-only discipline honoured.** Only HTTP `GET`, file reads, `systemctl show|is-active|list-units`, `sha256sum`, `find`, `stat`, `grep`, `curl`, `git show|diff|log` and `gh api` (read paths). No deploy, no restart, no reload, no write to the server, no repository mutation other than this file. The release verifier `scripts/release-verify.mjs` was read first and confirmed to be fetch-only before being run.

**Overall verdict: PASS (8/8 items).** Three deviations from the captain's brief are reported in §10; none is a defect in the release.

---

## Summary

| # | item | verdict |
|---|---|---|
| 1 | Release identity: symlink, `release.json`, server `git rev-parse HEAD` = `7289627`, fingerprint, both rollback releases materialised | **PASS** |
| 2 | Shared-script fix in both copies, equal sha256, here-string assertion present, `.bak-2026-11-05-h10` exists | **PASS** |
| 3 | Services `tecnoria-web` / `tecnoria-api` / `nginx` active, `ActiveEnterTimestamp` matches release, API `/health` 200, `NRestarts` | **PASS** |
| 4 | `node scripts/release-verify.mjs` → 19/19; own `--resolve` spot-checks (6 routes) → canonical + 200 | **PASS** |
| 5 | GROWTH-03B behaviours live in the rendered HTML (3 checks) | **PASS** |
| 6 | Live polyfills is the AOT bundle (34,609 B, no JIT markers) and the shell references it | **PASS** |
| 7 | No unplanned changes; no other project affected | **PASS** (one cumulative-range note, §7 and §10.2) |
| 8 | Release identifier + deployment timestamp for the GSC monitoring window | **PASS** (§8) |

---

## 1. Release identity — PASS

```bash
readlink -f /var/www/webtecnoria/apps/web/releases/current
cat /var/www/webtecnoria/apps/web/releases/current/release.json
cd /var/www/webtecnoria && git rev-parse HEAD && git status -sb
```

```
lrwxrwxrwx 1 root root 54 2026-11-05 19:19:22.227743251 +0100
  /var/www/webtecnoria/apps/web/releases/current -> /var/www/webtecnoria/apps/web/releases/20261105_191921
/var/www/webtecnoria/apps/web/releases/20261105_191921

{"app":"tecnoria-web","releasedAt":"2026-11-05T19:19:22+01:00","service":"tecnoria-web.service",
 "fingerprint":"6fc0aab3907808ab9e4de10df58954554552d7b45eadec2f312d933777217f2d"}

72896271b1d37f58ace600ca645eedd522fbab04      <- server git HEAD
## master...origin/master                       <- clean, in sync with origin/master
7289627 docs(growth): GROWTH-03C release, performance, canonical, lead-risk, monitoring and GROWTH-04 handoff
6cfcb4f fix(deploy): make the expected-text release assertion deterministic (H-10)
6500f35 fix(web): keep the editorial service link on CMS-served articles
```

* Active release = **`20261105_191921`** — matches the captain.
* Server HEAD = **`72896271b1d37f58ace600ca645eedd522fbab04`** = `7289627` — matches, and the working tree is clean and level with `origin/master`.
* `release.json` fingerprint = **`6fc0aab3907808ab9e4de10df58954554552d7b45eadec2f312d933777217f2d`** — **identical to the captain's value**.

Fingerprint re-derived independently with the script's **own** `release_fingerprint` algorithm (`find browser server -type f -print0 | sort -z | … | sha256sum`):

```
RELEASE 20261105_011306 stored=cd339ef2…6dec recomputed=cd339ef2…6dec MATCH
RELEASE 20261105_011656 stored=96dd1d3f…5e10 recomputed=96dd1d3f…5e10 MATCH
RELEASE 20261105_012220 stored=6d5562e1…73fa recomputed=6d5562e1…73fa MATCH
RELEASE 20261105_052852 stored=25fd5e80…7c61 recomputed=25fd5e80…7c61 MATCH
RELEASE 20261105_191921 stored=6fc0aab3…7f2d recomputed=6fc0aab3…7f2d MATCH
```

### Rollback material still present — PASS

| release | dir | `browser/` | `server/` | `server/server.mjs` | `server/index.server.html` | `release.json` |
|---|---|---:|---:|---|---|---|
| `20261105_191921` (active) | yes | 108 files | 95 files | yes | yes | yes |
| **`20261105_052852`** (previous) | **yes** | 108 files | 95 files | **yes** | **yes** | yes (`25fd5e80…7c61`) |
| **`20261105_012220`** (rollback target) | **yes** | 107 files | 93 files | **yes** | **yes** | yes (`6d5562e1…73fa`) |

Both the immediately-previous release and the designated rollback target are still on disk and fully materialised, so an in-place rollback remains possible. Retention risk is unchanged from the t1 finding: `KEEP_RELEASES=5` means `20261105_012220` is pruned after ~4 more publishes (`20261105_011306` and `20261105_011656` are the two older ones still present).

---

## 2. Shared-script fix — PASS

```bash
sha256sum /var/www/bin/publish-frontend-release.sh \
          /var/www/webtecnoria/infra/bin/publish-frontend-release.sh
grep -n 'EXPECTED_TEXT\|grep -Fq\|grep -Fc\|<<<' /var/www/bin/publish-frontend-release.sh
ls -la /var/www/bin/publish-frontend-release.sh.bak-2026-11-05-h10
```

```
0ea046c4a33bb6703e17e73d08f41d086dc470c3e1b4da4d0327beda477831fa  /var/www/bin/publish-frontend-release.sh
0ea046c4a33bb6703e17e73d08f41d086dc470c3e1b4da4d0327beda477831fa  /var/www/webtecnoria/infra/bin/publish-frontend-release.sh

24:EXPECTED_TEXT="${EXPECTED_TEXT:-}"
230:  if [ -z "${PUBLIC_URL}" ] || [ -z "${EXPECTED_TEXT}" ]; then
240:    # H-10: `printf '%s' "$body" | grep -Fq "$text"` is NOT a safe way to test for a match
246:    if grep -Fq -- "${EXPECTED_TEXT}" <<<"${body}"; then
252:  echo "Expected text not found on ${PUBLIC_URL}: ${EXPECTED_TEXT}" >&2

-rwxr-xr-x 1 root root 8657 2026-11-05 01:18:05.755615759 +0100 /var/www/bin/publish-frontend-release.sh.bak-2026-11-05-h10
d0499d3edbcf59cc0a1e7a1933973e9562e1b5b1ac7a0bfc0351237cd8ab2cfd  /var/www/bin/publish-frontend-release.sh.bak-2026-11-05-h10
```

* Both copies are **byte-identical**, sha256 `0ea046c4a33bb6703e17e73d08f41d086dc470c3e1b4da4d0327beda477831fa` — **matches the captain's `0ea046c4…`**.
* The installed file contains the **here-string assertion** at line 246: `if grep -Fq -- "${EXPECTED_TEXT}" <<<"${body}"; then` — i.e. exactly the fix I proposed in the t1 report, and the `printf | grep -Fq` pipeline is gone (only mentioned in the explanatory comment on line 240).
* The backup `publish-frontend-release.sh.bak-2026-11-05-h10` **exists** and its sha256 `d0499d3e…` is exactly the pre-fix script I fingerprinted in t1 — the rollback copy is intact.
* **The fix works in production:** the deploy job log shows the smoke gate passing for the first time — `2026-11-05T18:19:26.567Z ==> tecnoria-web: release published` with **no** `Expected text not found` line, and the nginx access log records the deploy's own origin-direct smoke requests at `19:19:26` with `200`.

---

## 3. Services — PASS

```bash
systemctl is-active tecnoria-web.service tecnoria-api.service nginx.service
systemctl show tecnoria-web.service -p ActiveState -p SubState -p ActiveEnterTimestamp -p ExecMainStartTimestamp -p MainPID -p NRestarts
systemctl show tecnoria-api.service -p ActiveState -p ActiveEnterTimestamp -p MainPID -p NRestarts
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3001/health
```

```
tecnoria-web.service     active
tecnoria-api.service     active
nginx.service            active

MainPID=1288326
NRestarts=0
ExecMainStartTimestamp=Thu 2026-11-05 19:19:23 CET
ActiveState=active
SubState=running
ActiveEnterTimestamp=Thu 2026-11-05 19:19:23 CET

MainPID=1287455
NRestarts=0
ActiveState=active
ActiveEnterTimestamp=Thu 2026-11-05 19:18:38 CET

api_health_status=200
web_local_status=200
```

* `tecnoria-web` `ActiveEnterTimestamp` = **19:19:23 CET**, one second after `release.json releasedAt = 19:19:22 CET` — **matches the release time**.
* `tecnoria-web` **NRestarts = 0** (no crash-loop, no restart since the deploy).
* `tecnoria-api` restarted at 19:18:38 CET (before the web release, as designed by the deploy script: migrate → restart API → publish web).
* API `/health` → **200**; SSR origin `http://127.0.0.1:4300/` → **200**.

---

## 4. Release verifier + own route spot-checks — PASS

### 4a. Repo verifier (production, read-only)

```bash
node scripts/release-verify.mjs
```

```
PASS  http://tecnoriasl.com/ redirige a https — status=301 location=https://tecnoriasl.com/
PASS  https://www.tecnoriasl.com/ redirige al apex — status=301 location=https://tecnoriasl.com
PASS  sitemap.xml responde 200 — status=200
PASS  sitemap declara 33 rutas — locs=33
PASS  las 33 rutas del sitemap responden 200 con canonical único propio — fallos=0
PASS  la home no usa anclas genéricas de artículo — ocurrencias=0
PASS  la home enlaza insights con texto descriptivo
PASS  el artículo de coste responde 200 — status=200
PASS  el artículo de coste enlaza contextualmente al servicio — label=true
PASS  no queda el ancla 'Explorar landing' — ocurrencias=0
PASS  bundle de polyfills servido (home) < 100 KB — polyfills-RNHY7D3N.js 34609 B
PASS  sin compilador JIT en el bundle (home)
PASS  bundle de polyfills servido (artículo) < 100 KB — polyfills-RNHY7D3N.js 34609 B
PASS  sin compilador JIT en el bundle (artículo)
PASS  ninguna carga de analítica en el HTML servido sin consentimiento — 0 etiquetas
PASS  el bootstrap de consentimiento está presente y gateado
PASS  /this-page-does-not-exist-test-123 responde 404 — status=404
PASS  /blog/not-a-real-article responde 404 — status=404
PASS  HSTS presente en la respuesta 200 — max-age=15552000

19/19 comprobaciones OK
EXIT_CODE=0
```

**19/19 independently reproduced** — the captain's figure is confirmed, not assumed.

### 4b. My own origin-form spot-checks (6 routes)

```bash
curl -fsS --max-time 25 --resolve 'tecnoriasl.com:443:127.0.0.1' -k "https://tecnoriasl.com$path"
```

```
PASS   /                                                status=200 canonical_count=1 href=https://tecnoriasl.com/                                              expected=https://tecnoriasl.com/
PASS   /servicios                                       status=200 canonical_count=1 href=https://tecnoriasl.com/servicios                                     expected=https://tecnoriasl.com/servicios
PASS   /servicios/desarrollo-software-medida            status=200 canonical_count=1 href=https://tecnoriasl.com/servicios/desarrollo-software-medida              expected=https://tecnoriasl.com/servicios/desarrollo-software-medida
PASS   /blog                                            status=200 canonical_count=1 href=https://tecnoriasl.com/blog                                      expected=https://tecnoriasl.com/blog
PASS   /blog/cuanto-cuesta-desarrollar-software-medida  status=200 canonical_count=1 href=https://tecnoriasl.com/blog/cuanto-cuesta-desarrollar-software-medida expected=https://tecnoriasl.com/blog/cuanto-cuesta-desarrollar-software-medida
PASS   /faq                                             status=200 canonical_count=1 href=https://tecnoriasl.com/faq                                       expected=https://tecnoriasl.com/faq
```

I also swept **all 33 sitemap routes** through the origin form: **33/33 returned `200` with exactly one `<link rel="canonical">`**, each matching its own sitemap `<loc>` (the repo verifier independently asserted the same with a strict string comparison: `fallos=0`).

> Note on my own tooling: a first sweep of mine printed `ROUTES_NOT_OK=33`. That was a **quoting bug in my probe** (the expected canonical was compared as a shell word with escaped quotes), not a product defect — the per-route canonical printed in the same line was correct in all 33 cases. The corrected comparison in §4b and the independent JS verifier both pass 33/33.

---

## 5. GROWTH-03B behaviours live — PASS

Checked against the **origin-rendered** HTML (`--resolve …:127.0.0.1 -k`), not only the Cloudflare edge.

| behaviour | result |
|---|---|
| no generic `Leer artículo` / `Leer insight` anchors **on the home** | **PASS** — `Leer artículo` = **0**, `Leer insight` = **0** on `/` |
| no `Explorar landing` **anywhere** | **PASS** — **0** occurrences across **all 33** sitemap routes (40+0+0 aggregate) |
| cost article renders the sidebar link `Ver el servicio de desarrollo de software a medida` → `/servicios/desarrollo-software-medida` | **PASS** — label ×1, `href="/servicios/desarrollo-software-medida"` ×2, status 200, canonical self-referential |

Rendered anchor (origin HTML, cost article):

```html
<…class="article-sidebar__service-link"><a class="text-link" href="/servicios/desarrollo-software-medida">
  Ver el servicio de desarrollo de software a medida </a></p>
```

Descriptive home insight anchors (the GROWTH-03B replacement for the generic anchors):

```html
class="text-link" href="/blog/cuanto-cuesta-desarrollar-software-medida">Cuánto cuesta desarrollar software a medida y de qué depende realmente
class="text-link" href="/blog/chatbots-atencion-cliente-empresa">Cuándo un chatbot para atención al cliente tiene sentido de verdad
class="text-link" href="/blog/migrar-software-legacy-sin-romper-operativa">Cómo migrar software legacy sin romper la operativa
```

**Context reported for honesty (not a violation of the stated criterion):** `Leer artículo` still appears **40 times in total, all outside the home** — 1 on `/blog` (`class="button button-primary" …> Leer artículo destacado`, the featured-article CTA) and 3 on each article page, on the related-articles cards (`class="text-link" href="/blog/…">Leer artículo</a>`, each preceded by the article's own descriptive title and excerpt). The criterion as written is home-scoped and the home is clean at 0/0.

---

## 6. Polyfills bundle is the AOT one — PASS

```bash
curl -fsS --resolve 'tecnoriasl.com:443:127.0.0.1' -k "$sm/" | grep -o -E '(src|href)="[^"]*polyfills[^"]*\.js"'
curl -fsS --resolve 'tecnoriasl.com:443:127.0.0.1' -k -o /dev/null -w '%{http_code} %{size_download}\n' "$sm/polyfills-RNHY7D3N.js"
```

```
shell_references=src="polyfills-RNHY7D3N.js"
served_status=200 served_bytes=34609
  served marker parseTemplate            occurrences=0
  served marker compileComponent         occurrences=0
  served marker compileNgModuleFactory   occurrences=0
  served marker ɵcompile                occurrences=0
  served marker JitCompiler              occurrences=0
  served marker jit_compiler             occurrences=0
  served marker compileNgModule          occurrences=0
```

* The shell **references** `polyfills-RNHY7D3N.js` (relative `src`, resolved against the apex).
* The served bundle is **exactly 34,609 bytes** — matches the claimed size.
* **Zero** JIT-compiler markers in the served bundle.

On-disk confirmation across every retained release — the AOT switch is what removed the compiler:

```
20261105_011306 polyfills-OLE7FRBA.js bytes=500258 jit_marker_lines=3
20261105_011656 polyfills-OLE7FRBA.js bytes=500258 jit_marker_lines=3
20261105_012220 polyfills-OLE7FRBA.js bytes=500258 jit_marker_lines=3
20261105_052852 polyfills-OLE7FRBA.js bytes=500258 jit_marker_lines=3
20261105_191921 polyfills-RNHY7D3N.js bytes=34609  jit_marker_lines=0
```

**−465,649 bytes (−93.1 %)** and the JIT markers are gone, measured on the live artifacts, not inferred from the commit.

---

## 7. No unplanned changes / no collateral damage — PASS

### 7a. Commit scope

`git show --stat 7289627` touches **only** paths inside the allowed set:

```
apps/web/src/polyfills.ts
docs/growth/GROWTH-03C-CANONICAL.md
docs/growth/GROWTH-03C-GSC-MONITORING.md
docs/growth/GROWTH-03C-JS-ANALYSIS.md
docs/growth/GROWTH-03C-LEAD-RISK.md
docs/growth/GROWTH-03C-PERFORMANCE.md
docs/growth/GROWTH-03C-RELEASE.md
docs/growth/GROWTH-04-HANDOFF.md
docs/growth/_team/GROWTH-03C-CANONICAL-INPUT.md
docs/growth/_team/GROWTH-03C-GSC-INPUT.md
docs/growth/_team/GROWTH-03C-LEAD-INPUT.md
docs/growth/_team/GROWTH-03C-RELEASE-INPUT.md
docs/growth/_team/GROWTH-03C-REVIEW-INPUT.md
docs/growth/_team/perf-03c-after.json
docs/growth/_team/perf-03c-before.json
15 files changed, 21989 insertions(+), 4 deletions(-)
```

### 7b. Cumulative deployed range (6 commits, `894e7c6..7289627`)

| commit | paths |
|---|---|
| `94de3ab` GROWTH-03B links + evidence | `apps/web/**`, `scripts/**`, `docs/**`, **`.gitignore`**, **`package.json`**, **`qa/qa-manifest.json`** |
| `68c19cc` docs | `docs/**` |
| `415e2ca` AOT | `apps/web/angular.json`, `apps/web/src/polyfills.ts` |
| `6500f35` editorial service link | `apps/web/**`, `scripts/tests/**` |
| `6cfcb4f` H-10 fix | `infra/bin/publish-frontend-release.sh` (8 lines) |
| `7289627` delivery docs + polyfills comment | `apps/web/src/polyfills.ts`, `docs/**` |

**Deviation from the literal allow-list (reported, benign):** the cumulative deployment also carries three paths outside `{apps/web/**, scripts/**, infra/bin/publish-frontend-release.sh, docs/**}` — `.gitignore`, `package.json`, `qa/qa-manifest.json` — all introduced by the already-reviewed `94de3ab`. Their content is inert:
* `.gitignore` → adds `.serena/` and `.dsh-tmp/` (the fix for audit finding G03B-F2).
* `package.json` → adds `test:links`, `test:perf`, `perf:baseline` scripts and extends `test:all`.
* `qa/qa-manifest.json` → adds one **optional** stage `perf-baseline` with `"required": false`.

No production runtime behaviour, no dependency, no nginx/systemd/deploy-script change outside the reviewed H-10 file.

### 7c. No other project affected — PASS

```bash
systemctl is-active <each service>; systemctl show … -p ActiveEnterTimestamp -p NRestarts
ls -la <their releases/current>
curl -fsS -o /dev/null -w '%{http_code} %{size_download}' <their public URL>
```

```
electroria-web.service             active=active  enter=Wed 2026-10-21 21:18:29 CEST  restarts=0
electroria-api.service             active=active  enter=Wed 2026-10-21 21:18:29 CEST  restarts=0
tecnoria-chat-portal.service       active=active  enter=Thu 2026-10-22 14:57:51 CEST  restarts=0
content-ai-studio.service          active=active  enter=Wed 2026-10-21 21:18:27 CEST  restarts=0
guiatv-ssr.service                 active=active  enter=Thu 2026-11-05 18:44:39 CET  restarts=0
guiatv-api.service                 active=active  enter=Thu 2026-11-05 18:48:28 CET  restarts=0

/var/www/electroria/apps/web/releases/current            -> 20260822_162111   (mtime 2026-08-22)
/var/www/talkaris/apps/portal/releases/current           -> 20261022_145750   (mtime 2026-10-22)
/var/www/content-ai-platform/apps/studio-web/releases/current -> 20260902_120308 (mtime 2026-09-02)

https://electroria.com/   status=200 bytes=250094
https://talkaris.com/     status=200 bytes=57611
https://auctorio.com/      status=200 bytes=64032
https://guiatv.es/         status=200 bytes=603619
https://embarcarte.com/   status=200 bytes=23845
```

* Every other project's service is **active with `NRestarts=0`**.
* None of them was restarted by this deployment: their `ActiveEnterTimestamp`s are either weeks old, or (guiatv) 18:44/18:48 CET — **35 min before** our 19:19 deploy, i.e. guiatv's own independent deploy.
* Their release symlinks are untouched (mtimes 2026-08-22 / 2026-10-22 / 2026-09-02).
* All five public sites return **200**.
* The shared-script fix did change the smoke behaviour for `electroria-web`, `talkaris-portal` and `auctorio-studio` — that is the **intended** effect of the H-10 fix, and it only removes false negatives.

### 7d. The deploy itself

```bash
gh run view 42082908353 --json conclusion,createdAt,updatedAt,headSha
gh api repos/manuelxose/webtecnoria/actions/jobs/<job_id>/logs
```

```
{"conclusion":"success","createdAt":"2026-11-05T18:18:09Z","updatedAt":"2026-11-05T18:19:29Z",
 "headSha":"72896271b1d37f58ace600ca645eedd522fbab04","workflowName":"Deploy a producción (Contabo)"}

job deploy: started 18:18:12Z, completed 18:19:28Z, conclusion=success  (1 m 16 s)
2026-11-05T18:18:21.4657768Z Fast-forward
2026-11-05T18:18:38.4707068Z Migrations completed
2026-11-05T18:19:21.1829380Z ==> tecnoria-web: publishing release
2026-11-05T18:19:22.3066244Z ==> tecnoria-web: reloading systemd and restarting tecnoria-web.service
2026-11-05T18:19:26.5671101Z ==> tecnoria-web: release published
```

Conclusion **success**, 1 m 16 s, at 2026-11-05T18:19:29Z — **matches the captain exactly**. The run covers `7289627` (`headSha` confirms) and the H-10 smoke gate passed.

---

## 8. T0 for the Search Console monitoring window

| fact | value |
|---|---|
| **Release identifier** | **`20261105_191921`** (`/var/www/webtecnoria/apps/web/releases/20261105_191921`) |
| **Release fingerprint** | `6fc0aab3907808ab9e4de10df58954554552d7b45eadec2f312d933777217f2d` |
| `release.json` `releasedAt` | **2026-11-05T19:19:22+01:00** = 2026-11-05T18:19:22Z |
| `tecnoria-web.service` `ActiveEnterTimestamp` | 2026-11-05T19:19:23+01:00 = 18:19:23Z |
| Deploy's first **public** 200 of the new build (nginx log, origin-direct) | **2026-11-05T19:19:26+01:00** = 18:19:26Z |
| Actions run `42082908353` | created 18:18:09Z, concluded **18:19:29Z** (success) |
| Deployed commit | `72896271b1d37f58ace600ca645eedd522fbab04` |

**Recommended T0 = `2026-11-05T18:19:26Z` (2026-11-05T19:19:26+01:00)** — the first verified instant at which the new build was served `200` to the public path. That is the correct anchor for a GSC impression window, because it is when a crawler could first see the new HTML.

Secondary anchors, if a more conservative window is preferred:
* **T0_release** = `2026-11-05T18:19:22Z` (release published / `release.json releasedAt`)
* **T0_service** = `2026-11-05T18:19:23Z` (SSR process entered `active`)
* **T0_pipeline** = `2026-11-05T18:19:29Z` (Actions run concluded)

For a daily GSC comparison, use T0 = **2026-11-05T18:19:26Z** and take the first full daily window starting **2026-11-06T00:00:00Z** (partial day 2026-11-05 excluded or handled as a partial).

---

## 9. Commands used (all read-only)

```bash
# local
git rev-parse HEAD origin/master 7289627 ; git status -sb ; git log --oneline 894e7c6..7289627
git show --stat 7289627 ; git diff --name-only 894e7c6..7289627 ; git diff 894e7c6..7289627 -- .gitignore package.json qa/qa-manifest.json
node scripts/release-verify.mjs
gh run view 42082908353 --json … ; gh api repos/manuelxose/webtecnoria/actions/runs/42082908353/jobs ; gh api …/actions/jobs/<id>/logs

# remote (contabo)
readlink -f /var/www/webtecnoria/apps/web/releases/current ; cat …/current/release.json
cd /var/www/webtecnoria && git rev-parse HEAD && git status -sb
sha256sum /var/www/bin/publish-frontend-release.sh /var/www/webtecnoria/infra/bin/publish-frontend-release.sh /var/www/bin/publish-frontend-release.sh.bak-2026-11-05-h10
grep -n 'EXPECTED_TEXT\|grep -Fq\|<<<' /var/www/bin/publish-frontend-release.sh
systemctl is-active / systemctl show / systemctl list-units --type=service --state=running
curl -fsS --max-time 25 --resolve 'tecnoriasl.com:443:127.0.0.1' -k "https://tecnoriasl.com$path"
curl -fsS http://127.0.0.1:3001/health ; curl -fsS http://127.0.0.1:4300/
find /var/www/webtecnoria/apps/web/releases/current/browser -maxdepth 1 -name 'polyfills*.js' -printf '%p %s bytes\n'
ss -ltn
```

---

## 10. Explicit disagreements with the captain's brief

**10.1 — Port `3021` does not exist on the host.** The brief said to spot-check with `--resolve to 127.0.0.1,3021`. `ss -ltn` shows the SSR on **4300** (`proxy_pass http://127.0.0.1:4300`) and the API on **3001**; there is no listener on 3021 (there is one on **3201**, bound to 127.0.0.1, which is not the SSR). I therefore used the origin form the brief also specified — `--resolve tecnoriasl.com:443:127.0.0.1 -k` — for every route check. **No product issue; the brief's port hint was simply wrong.**

**10.2 — The cumulative deployed range carries three paths outside the literal allow-list.** `git show --stat 7289627` (the literal check) passes. But the deployment consists of **six** commits (`894e7c6..7289627`), and that range also touches **`.gitignore`**, **`package.json`** and **`qa/qa-manifest.json`**. All three come from the already-reviewed `94de3ab` and are inert (ignore rules, npm test scripts, one optional QA stage — §7b). No action needed; recorded so the allow-list is not silently widened.

**10.3 — "Leer artículo" is still present outside the home.** The requirement as written is home-scoped and the home is clean (0 occurrences of both `Leer artículo` and `Leer insight`). But the string still appears 40 times elsewhere: once on `/blog` as the featured-article CTA (`Leer artículo destacado`) and 3× per article page on the related-articles cards (`<a class="text-link" href="/blog/…">Leer artículo</a>`, each preceded by a descriptive title + excerpt). These are contextual list/CTA labels, not the generic insight-card anchors GROWTH-03B replaced. **Not a defect against the stated criterion**, but it is the obvious candidate if GROWTH-04 wants to remove generic link text site-wide.

No disagreement with any of the captain's **stated facts**: release id, fingerprint `6fc0aab3…7f2d`, script sha256 `0ea046c4…`, Actions run success in 1 m 16 s at 2026-11-05T18:19:29Z, server HEAD = `7289627`, and the 19/19 verifier result were each independently reproduced by my own commands.

---

**Final status of this task: PASS — 8/8 items verified independently with executed commands; the three deviations above are documentation/expectation issues, not defects in release `20261105_191921`.**