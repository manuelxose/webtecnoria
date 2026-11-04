# Feature Specification: Tecnoria SEO and Commercial Growth Transformation

**Feature Branch**: `001-seo-growth-transformation`
**Created**: 2026-11-05
**Status**: In progress
**Input**: Existing Tecnoria site at `https://tecnoriasl.com` with near-zero organic traffic.

## Problem

The owner reports virtually no organic traffic. The cause is not assumed. Baseline evidence shows that public pages are server-rendered and fast at the origin, but per-page canonicals, Open Graph metadata and JSON-LD are absent from the server HTML; unknown URLs return HTTP 200; legacy URLs do not return real 301s; missing assets return HTML; static assets emit conflicting cache headers. Search Console access for `tecnoriasl.com` is not available in this environment, so indexation cannot be claimed.

## User Scenarios & Testing

### User Story 1 - Crawler receives a correct, indexable page (Priority: P1)

A search crawler requests a public URL. It receives HTTP 200, a self-referencing canonical, page-specific title/description, an index directive, valid JSON-LD and useful HTML without executing JavaScript.

**Independent Test**: `curl` the URL and assert status, canonical, title, robots, JSON-LD, H1 and content. No browser JS required.

**Acceptance Scenarios**:

1. **Given** `/servicios/desarrollo-software-medida`, **When** requested without JS, **Then** status is 200 and the canonical equals the live URL.
2. **Given** any public sitemap URL, **When** requested without JS, **Then** it returns 200, is indexable and has one H1.
3. **Given** a page with valid schema, **When** parsed, **Then** the JSON-LD is valid JSON and matches visible content.

### User Story 2 - Unknown, private and legacy URLs behave correctly (Priority: P1)

A crawler or user requests a removed URL, a missing asset or a private route. The response is a real 404, 301 or 302, never a soft 200 HTML page.

**Independent Test**: Request one unknown path, one legacy path, one missing `.js` asset, `/dashboard` and `/auth-login`.

**Acceptance Scenarios**:

1. **Given** an unknown path, **When** requested, **Then** status is 404 and `X-Robots-Tag` contains `noindex`.
2. **Given** `/nosotros`, **When** requested, **Then** status is 301 to `/empresa`.
3. **Given** a missing asset, **When** requested, **Then** status is 404 with a non-HTML content type.
4. **Given** `/dashboard` without a session, **When** requested, **Then** a 302 to `/auth-login` is returned and no private content is exposed.

### User Story 3 - Commercial pages convert and are measurable (Priority: P2)

A qualified visitor understands the service, sees a clear next action and can submit the contact form. Analytics records a genuine lead and the form protects customer data.

**Independent Test**: Inspect the rendered service page CTA, submit a test enquiry in a controlled environment and verify validation, success state and analytics event without duplicate counting.

**Acceptance Scenarios**:

1. **Given** the contact page, **When** required fields are empty, **Then** useful inline errors appear.
2. **Given** a valid enquiry, **When** submitted, **Then** the success state appears and a single lead event is recorded.
3. **Given** GA4 is enabled, **When** a visitor rejects non-essential cookies, **Then** analytics does not load.

### User Story 4 - Operations remain safe and recoverable (Priority: P2)

An operator can identify the current release, roll back, and serve assets with correct caching and compression.

**Independent Test**: Read `release.json`, inspect `current` symlink, check `nginx -t`, and compare cache headers before/after.

**Acceptance Scenarios**:

1. **Given** a deployment, **When** it completes, **Then** `/health` returns 200 and the live homepage contains the expected content.
2. **Given** a failed deploy, **When** rollback is needed, **Then** the previous release symlink and service restart restore the previous build.
3. **Given** a hashed asset, **When** requested twice, **Then** the response has an immutable one-year cache policy and no conflicting `no-store`.

### Edge Cases

- API unavailable during SSR: public static content still renders; private session redirects fail closed.
- Unknown blog slug: 404, not a 200 empty article.
- Trailing slash, uppercase path and `www`: one-hop 301 to the canonical URL.
- Sitemap includes only canonical, indexable, 200 URLs.
- `lastmod` is not changed to the deploy date without a content change.
- No Search Console or GA4 data is claimed without credentials.

## Requirements

### Functional Requirements

- **FR-001**: Public pages MUST emit a self-referencing canonical in server HTML.
- **FR-002**: Public pages MUST emit page-specific `og:title`, `og:description`, `og:url`, `og:type`, `twitter:*` and robots directives in server HTML.
- **FR-003**: Public pages MUST emit valid JSON-LD in server HTML; schema MUST describe visible, truthful content.
- **FR-004**: Unknown public paths MUST return 404; private/auth paths MUST return 404/302 with `noindex`.
- **FR-005**: Legacy paths MUST return single-hop 301 redirects.
- **FR-006**: Missing assets MUST return 404, never the SSR HTML shell.
- **FR-007**: Sitemap MUST list every intended canonical public page and no private/utility page.
- **FR-008**: Robots.txt MUST allow public content and disallow private areas, auth and API.
- **FR-009**: Static assets MUST have a single coherent cache policy; HTML MUST not be cached as immutable.
- **FR-010**: The contact form MUST validate, protect against abuse and expose a truthful success/error state.
- **FR-011**: GA4 MUST respect consent and record one lead event per successful submission.
- **FR-012**: Deployment MUST preserve a rollback path and pass post-deploy smoke checks.
- **FR-013**: No fabricated traffic, ranking, review, client or local-presence claim may be introduced.

### Non-Functional Requirements

- Build with `npm run build:web` exits 0.
- SEO checks `npm run test:seo` exit 0.
- No open critical/high finding at delivery.
- LCP target <= 2.5 s, INP <= 200 ms, CLS <= 0.1 at p75 (field data only if available).
- Private data and secrets are never committed or printed.

## Success Criteria

- **SC-001**: 100% of sitemap URLs return 200, self-canonical, indexable server HTML.
- **SC-002**: Unknown URLs return 404; legacy URLs return 301; missing assets return 404.
- **SC-003**: JSON-LD parses for home, service, article and FAQ pages.
- **SC-004**: Contact form validation and success path are verified in a controlled test.
- **SC-005**: Cache headers for hashed assets are coherent and measured before/after.
- **SC-006**: Search Console and GA4 status are reported as verified or explicitly blocked.
- **SC-007**: A 90-day growth plan with measurable leading indicators is delivered.

## Out of Scope

- Buying links, fake reviews, fake local listings or mass-generated location pages.
- Framework migration.
- Search Console property verification without owner access.
- DNS/firewall changes without explicit approval.
- Guaranteeing future rankings or traffic volumes.
