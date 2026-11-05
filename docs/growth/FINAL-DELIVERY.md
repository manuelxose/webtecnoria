# Final delivery record

**Date:** 2026-11-05
**Production:** https://tecnoriasl.com
**Final commit:** `3c7cdb9`
**Release:** `apps/web/releases/20261105_012220`
**GitHub Actions run:** 41940740641 (success)
**Overall verdict:** **PARTIAL** — technical SEO and deployment are complete; growth measurement,
consent, local/legal identity and field Core Web Vitals remain externally blocked.

## 1. Milestone verdicts

| Milestone | Verdict | Evidence |
|---|---|---|
| SEO-00 Baseline and root cause | PASS | `SEO-00-BASELINE.md`; raw SSR vs live |
| SEO-01 Technical crawl/index repair | PASS | 32/32 sitemap URLs 200 + canonical + robots + JSON-LD; 404/301; `test:seo` exit 0 |
| SEO-02 Keyword/commercial strategy | PARTIAL | strategy delivered; no GSC volumes/rankings; owner decisions blocked |
| SEO-03 Architecture and content | PARTIAL | trust/content defects fixed; no new local/pricing/case pages without owner input |
| SEO-04 UX/CRO and conversion | PARTIAL | trust claims removed; form spam/consent/lead event open |
| SEO-05 Contabo infrastructure | PARTIAL | nginx cache/HSTS applied; DB backup installed and verified; monitoring/offsite restore open |
| SEO-06 Core Web Vitals | PARTIAL | lab before/after; field unavailable; LCP 3.3–3.5 s under Lighthouse mobile |
| SEO-07 Analytics/search measurement | BLOCKED/PARTIAL | GA4 present but no admin access or consent; no GSC property |
| SEO-08 Authority/distribution | PARTIAL | ethical strategy and target list; no outreach executed |
| SEO-09 Independent review | PASS | two Claude Sonnet 5.5 reviews; findings fixed; no open blocker |
| SEO-10 Production deployment | PASS | GitHub Actions success; post-deploy smoke passed |
| SEO-11 90-day plan | PASS | `90-DAY-GROWTH-PLAN.md` |

## 2. Technical changes

- Canonical, robots, Open Graph, Twitter and JSON-LD now exist in **raw server HTML**.
- Public route manifest + real 301 legacy redirects; unknown URLs/missing assets return 404.
- Unknown blog slugs are 404 when the API confirms absence; API outages do not deindex valid
  articles.
- Sitemap now 32 canonical URLs (13 articles + 2 products + 11 core/legal pages).
- Private routes are noindexed, no-store and redirect unauthenticated users.
- `x-powered-by` removed; HSTS and security headers added.
- nginx no longer adds a conflicting `no-store` to hashed assets; assets are immutable and
  Cloudflare-cached.
- Database backup installed at 03:30 daily with `pg_restore -l` verification and 7-day retention.

## 3. Post-deploy verification (live)

| Check | Result |
|---|---|
| All 32 sitemap URLs | 200, self-canonical, `index, follow`, valid JSON-LD (`bad=0`) |
| Homepage | 200, canonical `https://tecnoriasl.com/`, JSON-LD `@graph` |
| Service page | 200, self-canonical, Service + Breadcrumb + FAQ schema |
| `/nosotros` | 301 -> `/empresa` |
| unknown URL | 404 + `X-Robots-Tag: noindex, nofollow` |
| missing asset | 404 `text/plain` |
| `/dashboard` | 302 -> `/auth-login?returnUrl=...`, `Cache-Control: no-store` |
| `/auth-foo` | 404, noindex |
| hashed homepage assets | all 14 JS/CSS return 200; immutable; Cloudflare HIT/MISS as expected |
| `robots.txt` | public allowed; dashboard/portal/auth/api/uploads disallowed; sitemap referenced |
| origin TTFB | 114 ms |
| edge TTFB | ~318 ms |

## 4. Independent review

Two static reviews by Claude Sonnet 5.5 (not the implementer) found and drove fixes for duplicate
headers, API-timeout article deindexing, unbounded blog cache, auth-path handling, unverified
claims and nginx inheritance. The reviewer could not run shell commands in its session; the captain
ran and recorded the build/test exit codes. See `INDEPENDENT-AUDIT.md`.

## 5. Still blocked or open

| Blocker | Exact requirement |
|---|---|
| Search Console | owner adds the account/service account to a `tecnoriasl.com` property; export 90/480 days |
| GA4 admin/data | owner confirms property access; legal approval for consent copy |
| Consent / lead event | approved CMP copy + GA4 consent mode; then one `generate_lead` event |
| Local SEO | verified street address/locality, legal name/NIF, Google Business Profile eligibility |
| Client proof | written permission for named clients and any metric, with method |
| Pricing/decision pages | owner sets ranges/floor and approves claims |
| Field CWV | CrUX/RUM access; Lighthouse lab is not a field pass |
| Cloudflare purge | API token with `Cache Purge`; cached 301s for old asset URLs remain an extra hop |
| Offsite backup/restore drill | Contabo panel snapshot confirmation and a restore into a disposable DB |
| Monitoring | approval to install an uptime/5xx/TLS alert |

## 6. What is not claimed

- No claim that organic traffic has increased.
- No claim that the site is indexed or ranking; GSC is unavailable.
- No claim of a Core Web Vitals pass; LCP is above target under Lighthouse mobile.
- No claim of GDPR compliance; consent is not implemented.
- No claim that the 301 cache chain is fully purged; the lowercase fallback keeps the site working,
  but a Cloudflare purge would remove the extra hop.
- No claim that the contact form was submitted end-to-end in production; no staging DB/SMTP test.

## 7. Next release recommendation

1. Add consent + lead measurement (P1).
2. Add form spam protection and admin notification (P1).
3. Verify GSC and submit the sitemap (P1, owner).
4. Resolve legal identity/locality and publish the engagement model (P1, owner).
5. Add verified case-study URLs and one comparison asset (P2).
6. Purge the old asset 301s / add a Cloudflare HTML cache rule with purge-on-deploy (P2).
7. Add a restore drill and monitoring (P2).
