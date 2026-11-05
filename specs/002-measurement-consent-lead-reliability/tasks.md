# Tasks: Measurement, Consent and Lead Reliability

**Input**: `spec.md`, `plan.md`
**Status**: in progress
**Legend**: `[x]` done, `[ ]` pending, `[B]` blocked on owner access/approval, `[~]` in progress.

## Phase 1 - Discovery (parallel, read-only)

- [~] T001 GSC/GA4/sitemap measurement state, third-party inventory — `analytics-search`
- [~] T002 Cookie/consent/storage inventory, legal page truthfulness — `privacy-consent`
- [~] T003 Contact path, abuse surface, trusted proxy, SMTP reachability, backup state — `backend-lead`

## Phase 2 - Specification

- [x] T010 Spec Kit artifact `specs/002-.../spec.md`
- [x] T011 Spec Kit artifact `specs/002-.../plan.md`
- [x] T012 Spec Kit artifact `specs/002-.../tasks.md`
- [ ] T013 Reconcile discovery into `docs/growth/GROWTH-02-SPEC.md` and `GROWTH-02-TASKS.md`

## Phase 3 - Consent Mode v2 (web, owner `privacy-consent`)

- [ ] T020 Remove the unconditional GA4 tag from `apps/web/src/index.html`; add consent-default inline script
- [ ] T021 `ConsentService`: storage record, defaults, update, withdrawal, `loadAnalytics()` gate
- [ ] T022 `ConsentBannerComponent`: Accept / Reject / Configure, equal prominence, no preselection
- [ ] T023 Focus trap, Escape handling, accessible name/description, keyboard path
- [ ] T024 Footer "Configuración de cookies" permanent reopen + withdrawal control
- [ ] T025 Cookie policy route `politica-de-cookies` with truthful current-state text (counsel approval flagged)
- [ ] T026 Mobile viewport layout without layout shift

## Phase 4 - Lead tracking (web, owner `privacy-consent`)

- [ ] T030 `AnalyticsService.trackLead()` consent-gated, non-PII parameters only
- [ ] T031 `ContactFormComponent`: idempotency key, in-flight guard, success-only event, retryable errors
- [ ] T032 Honeypot field in the form markup (hidden, non-focusable, `aria-hidden`)

## Phase 5 - Contact API reliability (api, owner `backend-lead`)

- [ ] T040 `createContactRouter` factory with injectable pool/notifier/limiter
- [ ] T041 Zod schema: trim, max lengths, normalisation, explicit email regex
- [ ] T042 Honeypot + timing check, success-shaped response, no write
- [ ] T043 Per-client token-bucket rate limit, `429` + `Retry-After`, bounded memory
- [ ] T044 Idempotency key + unique index, duplicate-safe response
- [ ] T045 Trusted proxy resolution (Cloudflare ranges, `CF-Connecting-IP`), hashed client id
- [ ] T046 Notification service + separate `notification_status` persistence
- [ ] T047 Structured JSON logging without PII
- [ ] T048 Migration for new `contact_messages` columns
- [ ] T049 `renotify-leads.ts` recovery command

## Phase 6 - Tests

- [ ] T050 Suite A consent unit tests
- [ ] T051 Suite A consent browser tests (CDP, real Chromium)
- [ ] T052 Suite B contact form/API tests
- [ ] T053 Suite C analytics dispatch tests
- [ ] T054 Suite D PII leakage tests
- [ ] T055 Suite G responsive + H accessibility browser tests
- [ ] T056 Suite I abuse/rate-limit tests
- [ ] T057 Suite F production smoke script
- [ ] T058 Suite J rollback readiness check
- [ ] T059 `qa/qa-manifest.json` stages for the new suites

## Phase 7 - Measurement and reporting

- [ ] T060 `GSC-SETUP.md` with executable DNS TXT + sitemap procedure
- [ ] T061 `SEARCH-BASELINE.md` with explicit missing-data markers
- [ ] T062 `GA4-CONFIGURATION.md`
- [ ] T063 `CONVERSION-MEASUREMENT.md`
- [ ] T064 `LEAD-RELIABILITY.md`
- [ ] T065 `CONSENT-IMPLEMENTATION.md`
- [ ] T066 `scripts/growth-monitor.mjs` + day 7/14/30 procedure

## Phase 8 - Infrastructure verification

- [ ] T070 Non-destructive PostgreSQL restore drill into an isolated database
- [ ] T071 Cloudflare cached legacy redirect assessment (BLOCKED without API token)
- [ ] T072 SMTP end-to-end notification verification

## Phase 9 - Review and release

- [ ] T080 Cross-verification of web work by `backend-lead`
- [ ] T081 Cross-verification of api work by `privacy-consent`
- [ ] T082 Independent review by Claude Sonnet 5.5 (not an implementer)
- [ ] T083 Repairs for all critical/major findings
- [ ] T084 `GROWTH-02-INDEPENDENT-AUDIT.md`
- [ ] T085 Production deploy through GitHub Actions
- [ ] T086 Production smoke + consent default verification + SEO regression verification
- [ ] T087 `GROWTH-02-DELIVERY.md` with final verdict
- [ ] T088 `TECNORIA-GROWTH-03` handoff

## Blocked (external authorization)

- [B] T090 Google Search Console property creation + DNS TXT verification + sitemap submission
- [B] T091 GA4 admin/data access for behavioural reporting and baseline export
- [B] T092 Cloudflare API access for targeted cache invalidation
- [B] T093 Legal approval of privacy/cookie policy text by the data controller or counsel
