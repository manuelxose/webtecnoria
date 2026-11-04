# Tasks: Tecnoria SEO and Commercial Growth Transformation

**Input**: `spec.md`, `plan.md`
**Status**: implementation complete; deployment pending
**Legend**: `[x]` done, `[ ]` pending, `[B]` blocked on owner access/approval.

## Phase 1 — Discovery

- [x] T001 Capture live raw HTML for home, services, service detail, contact, blog, article, FAQ, map, legacy, 404 and missing asset.
- [x] T002 Inspect repository architecture, routes, SSR server, SeoService, sitemap, robots and deployment workflow.
- [x] T003 Inspect Contabo host, nginx, systemd, TLS, release state, backups, logs and crawler activity (read-only).
- [x] T004 Record search/analytics access: GSC `tecnoriasl.com` unavailable; GA4 property present but admin access unproven.
- [x] T005 Produce `docs/growth/SEO-00-BASELINE.md`.

## Phase 2 — Technical SEO repair

- [x] T010 Add serializable canonical/robots/Open Graph/Twitter/JSON-LD placeholders to `index.html`.
- [x] T011 Update `SeoService` to update existing head nodes and emit one JSON-LD `@graph`.
- [x] T012 Add public/legacy route manifest and HTTP 301 redirects.
- [x] T013 Return real 404 for unknown URLs, `/404`, unknown blog articles and missing assets.
- [x] T014 Add `X-Robots-Tag: noindex` and `Cache-Control: no-store` for private routes.
- [x] T015 Remove `x-powered-by`, add security headers at Express layer.
- [x] T016 Repair sitemap (32 URLs) and robots private disallows.
- [x] T017 Add `scripts/seo-check.ts` covering every public route and HTTP edge case.
- [x] T018 Add `qa/qa-manifest.json` build + SEO stages.
- [x] T019 Fix product CTA query encoding and trailing-slash/uppercase duplication.
- [x] T020 Remove unverified LocalBusiness/LocalBusiness address and duplicate ProfessionalService.
- [x] T021 Remove anonymous testimonials, unverified generic case studies and numeric marketing claims.
- [ ] T022 Apply nginx config change on production and reload (backup + `nginx -t` required).
- [ ] T023 Add scheduled PostgreSQL backup for `tecnoria` and `tecnoria_chat` (owner approval).
- [ ] T024 Add monitoring/alerting (owner approval).

## Phase 3 — Growth and content

- [x] T030 Produce keyword/intent/competitor/content strategy from repository and public SERPs.
- [ ] T031 Owner decisions: real address/locality, legal name/NIF, client naming permission, pricing policy.
- [ ] T032 Add pricing/decision/comparison page only after T031.
- [ ] T033 Add sector pages only after demand and proof are validated.
- [ ] T034 Add verified case-study detail pages only when each has enough unique evidence.
- [ ] T035 Publish the 30/60/90-day content calendar and assign owners.

## Phase 4 — UX, CRO and measurement

- [x] T040 Remove unverifiable trust claims from home/contact/products/case studies.
- [x] T041 Document form validation, spam and consent gaps in `docs/growth/UX-CRO-REVIEW.md`.
- [ ] T042 Add consent banner + GA4 consent mode (legal copy review required).
- [ ] T043 Add single `generate_lead` event after successful submission, gated by consent.
- [ ] T044 Test contact form end-to-end against staging DB/SMTP.
- [x] T045 Measure lab LCP/CLS via infra audit; field data unavailable.

## Phase 5 — Infrastructure and performance

- [x] T050 Document Contabo audit, backup gap, cache conflict and security headers.
- [ ] T051 Apply nginx change (remove blanket `no-store`, add HSTS) and verify cache headers.
- [ ] T052 Measure after-state with same lab method and record in `PERFORMANCE-BENCHMARKS.md`.
- [ ] T053 Confirm Contabo panel snapshots/offsite backup externally.

## Phase 6 — Review and release

- [x] T060 Independent static review by Claude Sonnet 5.5; findings recorded.
- [x] T061 Fix duplicate security headers, blog API timeout behavior, unverified stats and auth-path 404.
- [ ] T062 Re-run independent review on final diff.
- [ ] T063 Commit and push to `master`; monitor GitHub Actions deploy.
- [ ] T064 Apply nginx config on production with backup and rollback.
- [ ] T065 Post-deploy smoke: 200/404/301, canonical, JSON-LD, sitemap, assets, private routes.
- [ ] T066 Record release id and update `FINAL-DELIVERY.md`.
- [ ] T067 Archive AgentTeams team.

## Blocked items

- **GSC**: no property/credentials for `tecnoriasl.com`.
- **CrUX/field CWV**: no API/field data source.
- **Local SEO**: no verified physical address, legal identity or Google Business Profile.
- **Consent**: no approved legal copy/CMP; GA4 currently loads without a consent signal.
- **Backups/monitoring**: require owner approval and a restore test.
