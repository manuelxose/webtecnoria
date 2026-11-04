# Technical SEO audit and repair

**Date:** 2026-11-05
**Baseline:** `docs/growth/SEO-00-BASELINE.md`
**Implementation:** `apps/web/server.ts`, `apps/web/src/index.html`,
`apps/web/src/app/site/services/seo.service.ts`, `apps/web/src/app/site/seo-route-manifest.ts`.
**Verification:** `npm run test:seo` -> `SEO checks passed: 32 public routes, JSON-LD, 404/301, cache and sitemap.`

## Findings and disposition

| ID | Severity | Finding | Evidence | Repair | State |
|---|---|---|---|---|---|
| F1 | P0 | Unknown URLs returned HTTP 200 (soft 404) | `curl -o /dev/null -w '%{http_code}' .../url-inexistente` -> 200 | public route manifest + `res.status(404)` + `X-Robots-Tag: noindex` | FIXED |
| F2 | P0 | Missing assets returned 200 HTML | `.../assets/nope.js` -> 200 text/html | static fallthrough guard returns 404 `text/plain` | FIXED |
| F3 | P0 | ~34 legacy URLs returned 200 at the old URL | `/nosotros` -> 200, canonical `/empresa` only | HTTP-layer map in `seo-route-manifest.ts`, 301 before SSR | FIXED |
| F4 | P1 | Canonical, robots, og/twitter and JSON-LD absent from raw SSR | live `curl` at 00:42 UTC: no canonical/robots/JSON-LD | serializable placeholders in `index.html`; `SeoService` updates existing nodes; single `@graph` script | FIXED |
| F5 | P1 | Unknown blog article = 200 with default title, no metadata | `/blog/articulo-inexistente` -> 200, index title | API publication check + 404; `noIndex` branch in article page | FIXED |
| F6 | P1 | Sitemap had 24 URLs; 6 articles and 2 products missing | `grep -c '<loc>'` -> 24; `site-content.ts` -> 13 articles + 2 products | sitemap now 32 URLs; test compares all public routes | FIXED |
| F7 | P2 | Product CTAs encoded `?` in path | `/contacto%3Fproducto%3Dtalkaris` | CTA path changed to `/contacto` | FIXED |
| F8 | P3 | Trailing-slash duplicate | `/servicios/` -> 200 | 301 to `/servicios` | FIXED |
| F9 | P3 | `x-powered-by: Express` | response header | Express `disable("x-powered-by")` + nginx `proxy_hide_header` | FIXED |
| F10 | P3 | `/404` returned 200 | `/404` -> 200 | 404 + noindex | FIXED |
| F11 | P2 | LocalBusiness schema had `addressLocality: "Galicia"` (a region) and duplicated ProfessionalService nodes | `seo.service.ts` createLocalBusinessSchema | removed unverified LocalBusiness; single Organization remains | FIXED |
| F12 | P2 | FAQ rich results are retired (May 2026) | Google Search documentation | FAQPage markup kept only as semantic description; no rich-result claim | ACCEPTED |

## Why the placeholder repair is minimal

Angular's SSR build serializes the initial `index.html` head. Tags created later with
`document.createElement` or `Meta.addTag` are not present in the emitted response, but
`Meta.updateTag` updates existing tags. Adding the canonical, robots, Open Graph, Twitter and a
single JSON-LD script to `index.html` makes every page's values serializable with no new
dependency, no server-side head duplication and no framework migration. The browser path still
updates the same nodes on client-side navigation.

## Route semantics

- `/` and every sitemap URL: 200, self-canonical, `index, follow`, exactly one H1, valid JSON-LD.
- Unknown path: 404, `X-Robots-Tag: noindex, nofollow`, no canonical.
- `/blog/:slug`: allowed when in the static manifest **or** published by the API; otherwise 404.
- Legacy map: single-hop 301, preserving query string.
- Trailing slash, uppercase path, `/index.html`: single-hop 301.
- Private `/dashboard`, `/portal`, `/auth-*`, `/acceso-restringido`: redirect or noindex, no
  private content in the SSR shell.

## Robots and sitemap

`robots.txt` now disallows `/dashboard`, `/portal`, `/acceso-restringido`, `/auth-`, `/api/` and
`/uploads/`, and references the sitemap. The sitemap contains 32 canonical 200 URLs, including all
13 static articles and both product pages; changed pages use `lastmod` 2026-11-05, unchanged pages
keep 2026-03-11.

## Structured data

`SeoService` emits one JSON-LD `@graph` containing Organization/ProfessionalService, WebSite,
WebPage and page-specific BreadcrumbList, Service, Article and/or FAQPage. `SoftwareApplication`
for the two products no longer carries an `offers` node without a price. No review, rating,
LocalBusiness address or client claim is marked up without evidence.

## Remaining technical risks

- A new public page must be added to `seo-route-manifest.ts` or it will return 404 until the
  manifest is updated. `npm run test:seo` catches sitemap drift, not a brand-new route absent from
  both. This is documented in `DEPLOYMENT-ROLLBACK.md`.
- Search Console indexation is not verified; no property access exists.
- Field Core Web Vitals are unavailable; lab values are in `PERFORMANCE-BENCHMARKS.md`.
- nginx cache/security changes must be applied separately from the app release.
