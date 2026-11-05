# Independent audit

**Date:** 2026-11-05
**Reviewer:** Claude Sonnet 5.5 via `subagent_claude_code` (not the implementer).
**Scope:** working-tree diff, raw SSR logic, nginx config, content-integrity edits.
**Constraint:** the reviewer's shell was denied by the agent harness, so it reviewed source and
diffs statically. The captain ran the build and tests separately. This is recorded rather than
pretending the reviewer executed them.

## 1. First review — PASS WITH FINDINGS

| # | Severity | Finding | Resolution |
|---|---|---|---|
| 1 | Medium | Duplicate security headers: nginx + Express | Fixed: nginx only adds HSTS; Express owns nosniff/frame/referrer/permissions |
| 2 | Medium | nginx `add_header` inheritance drops HSTS in `/uploads` and `/chat-widget` | Fixed: HSTS repeated in both locations |
| 3 | Medium | Blog 404 depended on an API call; a timeout could 404 a valid article | Fixed: only a clean API 404 yields 404; timeouts/5xx fall through to 200 + noindex, cached 60s |
| 4 | Low | 404 page head could retain a home canonical | Verified: `noIndex` removes canonical; live 404 has no canonical |
| 5 | Low | `/auth-*` wildcard returned 200 for fake auth paths | Fixed: exact private whitelist; legacy auth routes 301 |
| 6 | Low | Private 302s lacked `no-store` | Fixed: private paths get `Cache-Control: no-store` |
| 7 | Low | Immutable cache could apply to unhashed JS/CSS | Fixed: only `-XXXXXXXX.ext` gets immutable; others 30 days |
| 8 | Low | HSTS conservative | Accepted: 180 days, no includeSubDomains/preload |
| 9 | Medium | Remaining numeric/placeholder product stats and 24h SLA | Fixed: qualitative stats; 24h copy removed from page, form, footer and meta |

## 2. Second review — PASS WITH FINDINGS

The re-review confirmed fixes 1, 3, 5, 6, 7 and the 404 head. It found:

| # | Severity | Finding | Resolution |
|---|---|---|---|
| 1 | Medium | Footer still said “Respuesta inicial < 24h laborables” | Fixed: “Filtro de encaje y siguiente paso” |
| 2 | Medium | HSTS not inherited in uploads/widget | Fixed: repeated in both locations |
| 3 | Medium | `/uploads/` emitted two `Cache-Control` headers and `immutable` on unhashed files | Fixed: removed duplicate `add_header`; `expires 30d` only |
| 4 | Medium | Blog cache unbounded | Fixed: 500-entry cap with expired-entry eviction |
| 5 | Low | API-down blog behavior | Documented: 200 + `noindex` is intentional to avoid deindexing valid articles |
| 6 | Low | HSTS no includeSubDomains | Accepted |
| 7 | Low | Route/sitemap drift risk | Documented; `test:seo` checks sitemap vs manifest |

## 3. Additional finding discovered by the captain after deployment

A path-normalization rule redirected uppercase hashed asset paths to lowercase. On case-sensitive
Linux this produced `301 -> 404` for every JS/CSS asset; Cloudflare cached the 301. This was not
caught by the first static reviews. It was found by live `curl` and fixed:

1. extension-bearing paths are no longer lowercased;
2. the server indexes the browser output and serves the matching lowercase file for cached
   lowercase URLs;
3. `test:seo` now asserts the hashed asset is not redirected and the lowercase URL returns 200.

## 4. Evidence run by the captain

| Command | Result |
|---|---|
| `npm run build:web` | exit 0 |
| `npm run test:seo` | exit 0: 32 public routes, JSON-LD, 404/301, cache, sitemap |
| `npm run build:api` | exit 0 |
| `git diff --check` | no output |
| GitHub Actions deploy | success, `3ef170f` |
| live 32 sitemap URLs | 32/32 HTTP 200 |
| live home assets | all 14 JS/CSS return 200 after redirect |
| live 404 | 404 + `X-Robots-Tag: noindex` |
| live legacy | 301 to `/empresa` |
| live missing asset | 404 `text/plain` |

## 5. Final verdict

**PASS WITH FINDINGS.** No open blocker was found in the reviewed scope. The remaining findings are
product/legal decisions (consent, legal identity, pricing, client permissions, Cloudflare purge) and
are listed in `FINAL-DELIVERY.md`. The SEO claim is limited to technical eligibility, not achieved
rankings or traffic.
