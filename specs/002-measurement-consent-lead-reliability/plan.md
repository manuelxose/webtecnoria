# Implementation Plan: Measurement, Consent and Lead Reliability

**Feature**: `002-measurement-consent-lead-reliability`
**Spec**: `spec.md`
**Created**: 2026-11-05

## Technical Context

- **Frontend**: Angular 20 standalone components, SSR via `@angular/ssr` `outputMode: server`,
  `provideClientHydration()`. Entry document `apps/web/src/index.html`, server entry
  `apps/web/server.ts`, client bootstrap `apps/web/src/main.ts`.
- **Backend**: Express 4 + TypeScript ESM (`apps/api`), `pg` pool, `zod` validation, `nodemailer`
  for SMTP, `helmet`, `morgan`. Deployed as `tecnoria-api.service`.
- **Edge**: Cloudflare (proxied, `server: cloudflare`) → nginx `infra/tecnoria.conf` →
  `127.0.0.1:4300` (SSR) and `127.0.0.1:3001` (API).
- **Tests**: `node:test` (Node 24) + `tsx`, plus a dependency-free Chrome DevTools Protocol driver.
  No Playwright/Puppeteer is installed and none will be added.
- **Deployment**: push to `master` → GitHub Actions → SSH → `infra/deploy-webtecnoria.sh`
  (release directory + symlink + smoke).

## Constraints that shape the design

1. **Basic consent mode, not advanced.** Advanced mode sends cookieless pings before consent; the
   brief explicitly forbids Google network requests before affirmative analytics consent. Therefore
   the `gtag` library must not even be *downloaded* before consent. That means the hardcoded
   `<script async src=".../gtag/js">` in `index.html` must be removed and injected at runtime by
   the consent service.
2. **SSR safety.** Any `window`/`document`/`localStorage` access must be behind
   `isPlatformBrowser(platformId)`. The consent default must be readable by a plain `<script>` in
   `index.html` (executed before any Angular bundle) so that a returning "accept" visitor is not
   served a document that then has to be re-evaluated.
3. **No new dependencies.** Consent state machine, storage wrapper and rate limiter are hand-written
   and small (`ponytail` level: smallest complete change).
4. **One writer at a time in this checkout.** AgentTeams does not isolate Git worktrees and the
   monorepo has a single `node_modules`; concurrent writers would collide on `dist/` and on the
   fixed test ports (`4417`/`4418`). Implementation tasks are therefore serialised, with read-only
   discovery parallelised.
5. **Trusted proxy.** `trust proxy: 1` on a Cloudflare→nginx chain resolves `req.ip` to the
   Cloudflare edge address, collapsing all visitors into a handful of rate-limit buckets. The fix is
   explicit: trust only Cloudflare's published ranges, use `CF-Connecting-IP` only when the peer is
   a trusted Cloudflare address, and hash the result before storing it.

## Design decisions

### D1 — Consent state machine (web)

`ConsentService` (root-provided, browser-only side effects):

- `STATE_KEY = "tecnoria.consent.v1"` in `localStorage`, wrapped in try/catch (Safari private mode).
- Shape: `{ version: 1, analytics: boolean, marketing: boolean, ts: string }`.
- `analytics` and `marketing` default to `false`; there is no preselected optional category.
- `read()` returns `null` when absent/stale/corrupt → the banner is shown.
- `acceptAnalytics()`, `rejectAll()`, `withdraw()` produce a new record and dispatch
  `gtag('consent','update', ...)`.
- `marketing` is only ever set by an explicit marketing toggle; accepting analytics never sets it.

A tiny inline script in `index.html` (before the module scripts) reads the stored record and sets
`window.dataLayer` + `gtag('consent','default', ...)`. It never loads `gtag/js`.

`ConsentService.loadAnalytics()` appends the `gtag/js` script tag and calls `gtag('config', ...)` —
and only when `analytics === true`. This is the single point where a Google request can originate.

### D2 — Consent UI (web)

A standalone, SSR-safe `ConsentBannerComponent` rendered in the site shell (`app.component`), not in
`index.html`, so it hydrates normally:

- Rendered only after the platform check, so no hydration mismatch.
- Three equally prominent buttons: `Aceptar`, `Rechazar`, `Configurar`.
- `Configurar` expands two toggles (Analítica, Publicidad), both unchecked.
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`, focus moved to the
  heading on open, focus trapped, `Escape` closes without accepting.
- Positioned bottom-left with a reserved, small height; no layout shift because it is
  `position: fixed`.
- A permanently reachable `Configuración de cookies` button in the site footer reopens preferences
  and offers withdrawal.
- All styling inline in the component (no new global CSS file, no new dependency).

### D3 — `generate_lead` (web)

A thin `AnalyticsService.trackLead()` that:

- returns early when `analytics` consent is absent or the `gtag` runtime is not loaded;
- sends only `form_type`, `service_category`, `source_page`;
- is called by `ContactFormComponent` **only** after the repository promise resolves;
- is guarded by an `inFlight` flag in the component plus an idempotency key per attempt, so a double
  click cannot produce a second request or a second event.

### D4 — Contact API hardening (api)

`apps/api/src/routes/v1/contact.ts` is refactored into a factory
`createContactRouter({ pool, notifier, limiter })` so it is unit-testable without a live database.
Order of operations:

1. `express.json({ limit })` already global (1 MB); add a per-route body guard.
2. Honeypot check (`_company_website` must be empty) → success-shaped `201`, no write, log
   `contact_spam_honeypot`.
3. Zod schema with `.trim()`, `.max()` on every field and an explicit email regex; normalise
   newlines out of single-line fields.
4. Rate limit keyed on the trusted client identifier → `429` + `Retry-After`.
5. Insert with `ON CONFLICT (idempotency_key) DO NOTHING RETURNING id`; on conflict return the
   existing id and skip re-notification.
6. Notification attempt is separated: insert commits first (`status='stored'`), then a notification
   attempt updates `notification_status` to `sent`/`failed`. The HTTP response is `201` once the row
   exists; a notification failure is logged, never surfaced as a submission failure.
7. Structured single-line JSON log with a hashed client id.

Schema migration adds to `contact_messages`: `source_page`, `idempotency_key` (unique, nullable),
`notification_status` (`pending|sent|failed`), `notification_attempts`, `notified_at`,
`client_hash`, `user_agent_class`. Migration is additive and idempotent (`IF NOT EXISTS`).

Recovery: `apps/api/src/scripts/renotify-leads.ts` re-sends `pending`/`failed` rows older than N
minutes, at most once, and is a no-op when SMTP is not configured.

### D5 — Tests

| Suite | Where | Mechanism |
| --- | --- | --- |
| A Consent (unit) | `scripts/tests/consent.test.mjs` | state machine + storage fakes |
| A Consent (browser) | `scripts/tests/browser-consent.mjs` | CDP: real Chromium, real SSR build, network capture |
| B Contact form | `scripts/tests/contact-api.test.mjs` | `createContactRouter` with fake pool/notifier |
| C Analytics dispatch | `scripts/tests/analytics-dispatch.test.mjs` | fake `gtag`, asserts counts and parameters |
| D PII leakage | `scripts/tests/no-pii.test.mjs` | scans event payloads and log records |
| E SEO regression | `npm run test:seo` (existing) | unchanged |
| F Production smoke | `scripts/growth-smoke.mjs` | live HTTP assertions |
| G Responsive | `scripts/tests/browser-consent.mjs` | CDP device metrics override |
| H Accessibility | `scripts/tests/browser-consent.mjs` | CDP: roles, names, focus trap, keyboard path |
| I Abuse / rate limit | `scripts/tests/contact-api.test.mjs` | limiter unit tests |
| J Rollback readiness | `docs/growth/DEPLOYMENT-ROLLBACK.md` + `scripts/growth-smoke.mjs --release` | release dir + symlink check |

`qa/qa-manifest.json` gains `test:consent`, `test:contact`, `test:analytics` stages.

### D6 — Monitoring

`scripts/growth-monitor.mjs` performs the day-7/14/30 checklist headlessly and writes a JSON
observation file: HTTP 200, sitemap count 32, real 404, no pre-consent Google request in served HTML,
contact endpoint rejects invalid input, TLS, release id, notification backlog count. It never sends a
real lead.

## File ownership (disjoint)

| Owner | Paths |
| --- | --- |
| `privacy-consent` | `apps/web/src/index.html`, `apps/web/src/app/site/components/consent-*`, `apps/web/src/app/site/services/consent.service.ts`, `apps/web/src/app/site/services/analytics.service.ts`, `apps/web/src/app/site/components/contact-form.component.ts`, `apps/web/src/app/app.component.*`, `apps/web/src/app/site/components/site-footer.component.ts`, `apps/web/src/app/site/pages/cookies-page.component.ts`, `apps/web/src/app/app.routes.ts`, `scripts/tests/*`, `scripts/browser-*.mjs` |
| `backend-lead` | `apps/api/src/routes/v1/contact.ts`, `apps/api/src/services/notification.ts`, `apps/api/src/services/lead-rate-limit.ts`, `apps/api/src/config/trusted-proxy.ts`, `apps/api/src/scripts/renotify-leads.ts`, `apps/api/src/db/migrations/*`, `apps/api/src/index.ts` (proxy + logging only) |
| `analytics-search` | `docs/growth/GSC-SETUP.md`, `SEARCH-BASELINE.md`, `GA4-CONFIGURATION.md`, `CONVERSION-MEASUREMENT.md`, `scripts/growth-monitor.mjs` |
| Captain | `specs/002-*`, `docs/growth/GROWTH-02-*.md`, `docs/growth/CONSENT-IMPLEMENTATION.md`, `qa/qa-manifest.json`, deployment |

## Verification commands

```
npm run build:web          # SSR build must succeed
npm run build:api          # tsc must succeed
npm run test:seo           # 32/32 + HTTP semantics (unchanged)
npm run test:consent       # node:test suites A
npm run test:contact       # node:test suites B, D-partial, I
npm run test:analytics     # node:test suite C, D
npm run test:browser       # CDP browser suites A(browser), G, H
node scripts/growth-smoke.mjs --base https://tecnoriasl.com
```

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Consent default script blocks rendering | Inline script is < 700 bytes, no network, no DOM access |
| Hydration mismatch from banner | Banner renders only after `isPlatformBrowser` + `afterNextRender` |
| Rate limiter memory growth | Fixed-size map keyed by hash with periodic sweep |
| Notification failure hides a lead | Storage outcome and notification outcome are separate columns |
| SEO regression | `test:seo` is a required gate and runs against a real SSR server |
| Trusted-proxy change weakens logging | Only Cloudflare ranges honoured; hash stored, never raw IP |
