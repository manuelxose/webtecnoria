# SEO-00 — Baseline and zero-traffic investigation

**Date:** 2026-11-05 (Europe/Madrid)
**Scope:** live `https://tecnoriasl.com`, repository `webtecnoria`, Contabo origin.
**Status:** PASS for discovery. Search Console and CrUX field data are BLOCKED (no access).

## 1. Repository identity

| Item | Observed value |
|---|---|
| Repository | `https://github.com/manuelxose/webtecnoria.git` |
| Branch / HEAD before work | `master` / `8b45733` (2026-10-17) |
| Staging | empty before this work; `master` tracks `origin/master` |
| Frontend | Angular 20.3.10, standalone components, SSR via `@angular/ssr/node` |
| Backend | Express 4 API in `apps/api`, PostgreSQL |
| Build | `npm run build:web` (Angular application builder, SSR entry `server.ts`) |
| Tests before work | no web tests configured (`"test": "echo (tests not configured)"`) |
| Deployment | GitHub Actions on push to `master` -> `infra/deploy-webtecnoria.sh` |
| Production host | Contabo VPS, nginx 1.24, systemd, Cloudflare proxy |

## 2. Domain and HTTP

| Check | Observed |
|---|---|
| Preferred host | `https://tecnoriasl.com` |
| DNS | Cloudflare proxied; apex and `www` share Cloudflare addresses |
| `http://tecnoriasl.com/` | 301 -> `https://tecnoriasl.com/` |
| `https://www.tecnoriasl.com/` | 301 -> `https://tecnoriasl.com` |
| TLS | Cloudflare Origin CA certificate valid to 2041-03-06 |
| Origin TTFB | 120–133 ms (localhost 4300) |
| Edge TTFB | 260–322 ms; `cf-cache-status: DYNAMIC/BYPASS` |
| HTML cache | `Cache-Control: no-store` twice (Express + nginx) |

## 3. Raw server HTML — the decisive finding

A plain `curl` of the live pages at 00:42 UTC returned:

- page-specific `<title>` and meta description: **present**;
- `<link rel="canonical">`: **absent**;
- `<meta name="robots">`: **absent**;
- `og:title`, `og:description`, `og:url`, `twitter:card`: **absent**;
- JSON-LD: **absent**;
- full body content and one H1: **present**.

The same tags appeared after browser hydration. Angular's `Meta` and direct DOM nodes created
after the SSR template was built were not serialized. This means a crawler that receives the raw
SSR response sees the page without canonical, robots directives or structured data, even though a
JavaScript-capable browser sees them.

**Likely impact:** weak consolidation signals, inconsistent indexation, no rich-result eligibility,
and no reliable canonical for duplicate/legacy URLs. This is consistent with low organic
discoverability. It is not proof of the entire traffic cause; Search Console data is unavailable.

## 4. Indexation and crawlability

| Check | Baseline | Result |
|---|---|---|
| `robots.txt` | `Allow: /`, disallows dashboard/auth/api; sitemap referenced | reachable, incomplete private coverage |
| `sitemap.xml` | 24 URLs, 7 of 13 articles, no product pages | incomplete |
| unknown URL | HTTP 200, 404 page, `noindex` meta | soft 404 |
| missing asset | HTTP 200 `text/html` | wrong status/content type |
| legacy URL `/nosotros` | HTTP 200 at old URL | no 301 |
| `/404` | HTTP 200 | soft 404 |
| trailing slash `/servicios/` | HTTP 200 duplicate | no canonical 301 |
| private `/dashboard` | 302 to login | correct |
| `x-powered-by` | `Express` | information leak |

## 5. Server-side traffic evidence

- nginx access log: ~14 Googlebot/Bingbot fetches in the observed window; nearly all 200.
- No tecnoria 5xx errors in the last 7 days.
- Log rotation: daily, 14 files, compressed.
- No scheduled PostgreSQL backup for `tecnoria` / `tecnoria_chat` found.
- No monitoring/alerting for tecnoria units.
- Shared host: other tenants, transient load spikes; `tecnoria-web` and `tecnoria-api` had 0 restarts.

## 6. Measurement access

| System | Status | Evidence |
|---|---|---|
| Google Search Console | **BLOCKED** | `GSC_SITE_URL` is `sc-domain:guiaprogramaciontv.com`; no `tecnoriasl.com` property/credentials available |
| GA4 | property present | `G-LE6ETPWL23` loaded in HTML; admin/data access not proven |
| CrUX / field CWV | **UNAVAILABLE** | PageSpeed Insights API returned 429; no CrUX/RUM export |
| Server logs | available read-only | aggregated crawler counts only |

Do not read this document as evidence of a specific traffic number, ranking or query. No such data
was available.

## 7. Evidence-supported diagnosis

| Hypothesis | Verdict | Confidence |
|---|---|---|
| Search engines blocked by robots/noindex | No — public pages are allowed/indexable | High |
| Site unavailable / 5xx | No — origin healthy | High |
| Canonical/robots/structured data missing in raw SSR | **Yes** | High |
| Soft 404 / missing-asset 200 / legacy 200 | **Yes** | High |
| Sitemap incomplete | **Yes** | High |
| Domain authority / backlinks insufficient | Plausible, not measured | Medium |
| Search demand or positioning mismatch | Plausible, needs Search Console/SERP data | Medium |
| Analytics failing to measure | Unknown — GA4 present, no admin access | Low |

## 8. Reproduction commands

```bash
curl -sSI https://tecnoriasl.com/
curl -sS https://tecnoriasl.com/robots.txt
curl -sS https://tecnoriasl.com/sitemap.xml
curl -sS -o /dev/null -w '%{http_code} %{content_type}\n' https://tecnoriasl.com/this-does-not-exist
curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' https://tecnoriasl.com/nosotros
curl -sS -o /dev/null -w '%{http_code} %{content_type}\n' https://tecnoriasl.com/assets/nope.js
ssh contabo 'systemctl status tecnoria-web --no-pager; nginx -v; ls -l /var/www/webtecnoria/apps/web/releases/current'
```

## 9. Access still required from the owner

1. Add the service account / owner account to a `tecnoriasl.com` Search Console property.
2. Confirm GA4 admin access and the lead event naming.
3. Confirm a real business address/locality and legal identity before any LocalBusiness schema or
   local landing page.
4. Confirm which case studies/testimonials are real and may be published with attribution.
5. Approve database backups, nginx reload and production deploy (all reversible).
