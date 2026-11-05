# Feature Specification: Measurement, Consent and Lead Reliability

**Feature Branch**: `002-measurement-consent-lead-reliability`
**Created**: 2026-11-05
**Status**: In progress
**Input**: `TECNORIA-GROWTH-02` brief, milestone 01 handoff (commit `3c7cdb9`, release `20261105_012220`).

## Problem

Milestone 01 made the public site crawlable, fast at the origin and truthful. It did not make the
site **measurable**, and it left two production defects:

1. **GA4 loads unconditionally.** `apps/web/src/index.html` lines 49-55 contain
   `<script async src="https://www.googletagmanager.com/gtag/js?id=G-LE6ETPWL23">` plus
   `gtag('config', 'G-LE6ETPWL23')` with no consent default and no consent interface. Verified live:
   the served HTML contains one `googletagmanager` occurrence and the page opens a connection to
   Google before any user choice exists. This is an EU/Spanish privacy exposure and it also
   inflates TBT on mobile.
2. **Leads arrive silently and unmeasured.** `POST /api/v1/contact` validates with a schema that has
   no maximum lengths, inserts into `contact_messages` and returns `201 {id}`. There is no rate
   limiting, no honeypot, no idempotency, no structured log and **no notification code path at
   all** — `apps/api/src/services/email.ts` is never called from `contact.ts`. Production holds 17
   rows and nobody knows how many of them were seen. No `generate_lead` event exists, so a lead is
   invisible to reporting even when it succeeds.

Search Console and GA4 admin-level access are not available in this environment. Those tasks are
classified BLOCKED and are not simulated.

## User Scenarios & Testing

### User Story 1 — A visitor chooses before anything is measured (Priority: P1)

A first-time visitor in the EU lands on any page. No Google Analytics request is made. A consent
interface offers Accept, Reject and Configure with equal prominence. The visitor's choice is
remembered across navigation and reload, can be changed later from an always-available control, and
optional categories are never preselected.

**Independent Test**: launch a real Chromium browser against the built SSR server, capture all
network requests, assert zero requests to `googletagmanager.com`/`google-analytics.com` before a
choice; click Accept; assert `analytics_storage` becomes `granted` and requests appear; repeat for
Reject; reload and assert persistence; reopen preferences and withdraw.

**Acceptance Scenarios**:

1. **Given** a fresh profile, **When** the page loads, **Then** `gtag('consent','default',...)` has
   already run with `analytics_storage`, `ad_storage`, `ad_user_data` and `ad_personalization` all
   `denied`, and no request to a Google analytics origin has been issued.
2. **Given** the banner, **When** the visitor clicks "Aceptar", **Then** only `analytics_storage`
   becomes `granted`; advertising consent stays `denied`.
3. **Given** the banner, **When** the visitor clicks "Rechazar", **Then** no analytics request is
   ever issued and the choice is persisted.
4. **Given** a stored "accept" choice, **When** the visitor reloads or navigates to another route,
   **Then** the banner does not reappear and analytics resumes without a new prompt.
5. **Given** a stored choice, **When** the visitor reopens preferences and selects "Retirar
   consentimiento", **Then** optional storage is deleted and analytics stops for that session.
6. **Given** keyboard-only operation, **When** tabbing through the banner, **Then** focus order is
   logical, focus is visible, focus is trapped inside the dialog, `Escape` does not silently accept,
   and the dialog has an accessible name and description.

### User Story 2 — A successful enquiry is counted exactly once (Priority: P1)

A visitor with analytics consent submits the contact form successfully. Exactly one `generate_lead`
event is sent, containing no personal data. A failed or invalid submission sends none. A double
click does not create two leads.

**Independent Test**: fake the HTTP layer at the component boundary and the `gtag` boundary; assert
event count for success, validation failure, network failure, double submit, and no-consent cases.

**Acceptance Scenarios**:

1. **Given** analytics consent granted and a `201` response, **When** the form is submitted, **Then**
   exactly one `generate_lead` is dispatched, after the response, with `form_type`,
   `service_category` and `source_page` only.
2. **Given** validation failure, **When** submitted, **Then** no `generate_lead` is dispatched and no
   HTTP request is made.
3. **Given** a `4xx`/`5xx` response, **When** submitted, **Then** no `generate_lead` is dispatched and
   the UI shows a retryable error.
4. **Given** analytics consent absent, **When** a submission succeeds, **Then** no analytics request
   or event is sent at all.
5. **Given** a rapid double click, **When** the second event fires, **Then** only one request is sent
   and only one lead row exists.
6. **Given** no personal data, **When** the event is built, **Then** name, email, phone, company and
   message are absent from every parameter.

### User Story 3 — An abusive or broken submission cannot hurt the business (Priority: P1)

An attacker submits a flood of requests, or a bot fills a hidden field, or a single visitor retries.
The API rejects abuse with a safe error, never logs personal data, and the operator can see what
happened.

**Acceptance Scenarios**:

1. **Given** more than the configured limit from one client within the window, **When** another
   submission arrives, **Then** the response is `429` with `Retry-After` and no database write occurs.
2. **Given** a filled honeypot field, **When** submitted, **Then** the API returns a success-shaped
   response with no database write and logs `spam_honeypot`.
3. **Given** over-length input, **When** submitted, **Then** the response is `400` with a field-level
   message and no truncation into the database.
4. **Given** a newline or header-shaped value in a text field, **When** submitted, **Then** the value
   cannot inject an email header or a log line.
5. **Given** any submission, **When** logged, **Then** no email, phone, message body or IP address in
   clear appears in the log line.

### User Story 4 — A lead is stored, notified and recoverable (Priority: P1)

The stored submission and the operator notification are different facts. A lead that is stored but
not notified is visible as such and can be re-notified without creating a duplicate lead.

**Acceptance Scenarios**:

1. **Given** a valid submission, **When** the database insert succeeds and the email is accepted by
   the SMTP server, **Then** the response is `201` and the row records notification state
   `sent` with a timestamp.
2. **Given** the insert succeeds and the SMTP send throws, **When** the response is returned, **Then**
   the lead is still stored, the response is `201`, and the row records `failed` with an error
   class — the visitor is not told a false failure.
3. **Given** a failed notification, **When** the operator runs the recovery command, **Then** the
   pending row is re-sent exactly once and its state becomes `sent`.
4. **Given** the same submission is retried by the client, **When** the same idempotency key is
   presented again, **Then** no second row is created and the original id is returned.

### User Story 5 — Search visibility is measured or explicitly blocked (Priority: P2)

The owner either sees real Search Console data or a precise, executable list of what is missing.

**Acceptance Scenarios**:

1. **Given** no authenticated Google account, **Then** the milestone records GSC as BLOCKED with the
   exact missing authorization and a ready-to-execute DNS TXT + sitemap submission procedure.
2. **Given** a future GSC property, **Then** `docs/growth/SEARCH-BASELINE.md` defines the exact
   queries, date window and export format to fill, with no placeholders presented as data.

### User Story 6 — Nothing previously validated regresses (Priority: P1)

**Independent Test**: `npm run test:seo` plus the new suites.

**Acceptance Scenarios**:

1. **Then** all 32 sitemap URLs still return 200, SSR canonical/metadata/JSON-LD unchanged, unknown
   URLs still 404, legacy URLs still 301, private routes still noindex, immutable asset caching
   unchanged.

## Requirements

### Functional

- **FR-001** Consent defaults (`denied` on all four consent types) MUST be set before any Google tag
  script is added or executed.
- **FR-002** No request to a Google analytics/advertising origin may occur before affirmative
  analytics consent (basic consent mode).
- **FR-003** Accept, Reject and Configure MUST be presented with equivalent visual prominence and in
  one step for Reject.
- **FR-004** Optional categories MUST default to unselected.
- **FR-005** The choice MUST persist across navigation and reload using a strictly-necessary
  first-party store, and MUST be changeable and withdrawable from a permanently reachable control.
- **FR-006** Advertising consent MUST NOT be granted as a side effect of accepting analytics.
- **FR-007** `generate_lead` MUST fire only after a confirmed successful lead creation, at most once
  per confirmed lead, and only with analytics consent granted.
- **FR-008** Every analytics event parameter MUST be non-personal and documented.
- **FR-009** The contact API MUST apply server-side validation with explicit maximum lengths and
  normalisation, independent of client validation.
- **FR-010** The contact API MUST apply a per-client rate limit with a safe `429` and `Retry-After`.
- **FR-011** The contact API MUST reject honeypot-positive submissions without writing to the
  database.
- **FR-012** The contact API MUST accept an idempotency key and never create a duplicate lead for a
  repeated key.
- **FR-013** The contact API MUST send an operator notification through the configured SMTP service
  and persist notification outcome separately from storage outcome.
- **FR-014** Logs MUST be structured, MUST NOT contain message bodies, email addresses, phone numbers
  or clear-text IP addresses.
- **FR-015** A recovery mechanism MUST exist to re-notify stored-but-unnotified leads.
- **FR-016** Client IP MUST be derived from a trusted proxy chain; forwarded headers from untrusted
  peers MUST NOT be honoured.
- **FR-017** A monitoring procedure MUST exist for day 7, day 14 and day 30.

### Non-functional

- **NFR-001** The consent component MUST NOT worsen LCP or TBT versus the measured baseline; removing
  the pre-consent GA4 download is expected to improve both.
- **NFR-002** The consent interface MUST meet WCAG 2.2 AA for keyboard and screen-reader use.
- **NFR-003** `npm run test:seo` MUST keep passing, 32/32.
- **NFR-004** No new runtime dependency may be added for consent or rate limiting.
- **NFR-005** The change MUST be deployable by the existing GitHub Actions workflow without altering
  unrelated services.

### Key Entities

- **Consent record**: `version`, `analytics` (bool), `marketing` (bool), `timestamp`, stored
  first-party. Not a database row.
- **Contact message**: existing `contact_messages` row plus notification state, idempotency key,
  source page and a hashed client identifier.
- **Lead event**: GA4 `generate_lead` with `form_type`, `service_category`, `source_page`.

## Success Criteria

- **SC-001** Zero Google requests before consent, proven by a real browser network capture.
- **SC-002** `generate_lead` event count equals confirmed lead count for the same window.
- **SC-003** Notification delivery state is visible per lead and recoverable.
- **SC-004** 32/32 sitemap URLs and all milestone-01 SEO assertions still pass.
- **SC-005** Lead pipeline failures are observable without reading personal data.

## Out of Scope

- Mass content generation, backlinks, paid acquisition.
- A second analytics vendor.
- Legal sign-off of the privacy/cookie policy text (controller approval required).
- Search Console property creation without an authenticated Google account.
- Cloudflare cache purges without API credentials.
