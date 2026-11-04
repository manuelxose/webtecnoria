# Implementation Plan: Tecnoria SEO and Commercial Growth Transformation

**Branch**: `master` (production workflow) | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

## Summary

Repair the server-rendered SEO layer and HTTP semantics first, then validate measurement and conversion, then improve delivery performance. The chosen approach keeps Angular 20 SSR and the existing deployment pipeline; no migration.

Technical root causes found in baseline:

1. Angular `Meta`/DOM additions that are not present in `index.html` are not serialized by the SSR build. Only pre-existing tags (title, description, existing `og:image`, `twitter:image`) survive.
2. Unknown routes are rendered by the Angular wildcard but the Express handler always returns 200.
3. Legacy routes are Angular redirects, so the first response is 200 at the old URL.
4. Missing static files fall through to SSR and return HTML.
5. Nginx adds `Cache-Control: no-store` to every proxied response, conflicting with the one-year policy from Express.

## Technical Context

- **Language**: TypeScript 5.8, Node 22 on server, Node 24 locally.
- **Framework**: Angular 20 SSR (`@angular/ssr/node`), Express 4.
- **Server**: Ubuntu 24.04, nginx 1.24, systemd, Cloudflare proxy.
- **Testing**: Node built-in test runner / fetch assertions; build and TypeScript compilation.
- **Target**: `https://tecnoriasl.com` on Contabo VPS 109.123.248.164.
- **Performance**: origin TTFB measured 0.26–0.31 s; HTML transfer ~30–120 KB; initial JS 325 KB compressed.
- **Constraints**: no Search Console property for `tecnoriasl.com`; no GA4 admin access proven; no destructive infrastructure changes without a rollback.

## Constitution Check

- Evidence-first: all findings have curl/file evidence. PASS.
- Search correctness: canonical, robots, sitemap and status codes are the primary implementation. PASS.
- Security/privacy: no secrets in documents; private routes noindex. PASS.
- Accessibility: changes are server/head only; no removal of content. PASS.
- Performance: measured before/after; no synthetic-only claim. PASS.
- Minimum complexity: placeholders in `index.html`, a route manifest, small server changes. PASS.
- Independent review: required before deployment. PENDING.

## Project Structure

```text
apps/web/
├── server.ts                                  # HTTP semantics, static cache, 404/301
├── src/index.html                             # SSR-serializable SEO placeholders
└── src/app/site/
    ├── seo-route-manifest.ts                  # Public paths + legacy redirects
    └── services/seo.service.ts                # Per-page canonical/meta/JSON-LD
apps/web/src/robots.txt                        # Crawl policy
apps/web/src/sitemap.xml                       # Public URL inventory
scripts/seo-check.mjs                          # Automated HTTP/HTML assertions
infra/nginx/tecnoria.conf                      # Cache/compression fix
docs/growth/                                   # Evidence and strategy documents
```

## Milestones

| ID | Scope | Acceptance |
|---|---|---|
| SEO-00 | Baseline: repository, live HTTP, server, DNS, deploy | `docs/growth/SEO-00-BASELINE.md` |
| SEO-01 | Canonical/meta/JSON-LD, 404/301, sitemap, robots | `npm run test:seo` passes |
| SEO-02 | Keyword/intent/competitor map | strategy docs with sourced evidence |
| SEO-03 | Content architecture and service-page gaps | prioritised, no thin pages |
| SEO-04 | UX/CRO and form measurement | controlled form test + review |
| SEO-05 | Contabo audit, cache, TLS, backups | diff + measured headers |
| SEO-06 | Core Web Vitals baseline/after | lab data, field data status explicit |
| SEO-07 | Analytics and Search Console status | verified or blocked |
| SEO-08 | Ethical distribution plan | no purchased links/spam |
| SEO-09 | Independent review | findings resolved or accepted |
| SEO-10 | Deploy and verify | release id + post-deploy checks |
| SEO-11 | 30/60/90 plan | measurable leading indicators |

## Verification

```bash
npm run build:web
npm run test:seo
node --check scripts/seo-check.mjs
```

Server checks (read-only before change):

```bash
curl -sSI https://tecnoriasl.com/
curl -sS https://tecnoriasl.com/robots.txt
curl -sS https://tecnoriasl.com/sitemap.xml
```

Deployment gate: build passes, SEO checks pass, independent review completed, backup and rollback documented, smoke checks pass.

## Risks and Rollback

- **Risk**: adding head placeholders could leave stale metadata if a page does not call `SeoService`. Mitigation: all public page components call it; 404/private are noindexed by header.
- **Risk**: server route allowlist can 404 a new public page until the manifest is updated. Mitigation: manifest test and documented rule.
- **Risk**: nginx cache change could cache HTML. Mitigation: Express keeps `no-store` for HTML; only remove the conflicting nginx header.
- **Rollback**: previous release symlink remains; restore `tecnoria.conf` from the timestamped backup and `nginx -t && systemctl reload nginx`; restart `tecnoria-web` on the previous release.

## Open Questions

- Does the owner have Search Console access for `tecnoriasl.com`? Not available in this environment.
- Is GA4 `G-LE6ETPWL23` owned by the business? Property present; admin access not proven.
- Is the phone/email/region sufficient for LocalBusiness eligibility? No verified street address, so use `ProfessionalService`/`Organization`, not a LocalBusiness rich-result claim.

## Delivery Status

- SEO-00: evidence collected.
- SEO-01: implementation in progress.
- SEO-02..11: tracked in [tasks.md](./tasks.md).
