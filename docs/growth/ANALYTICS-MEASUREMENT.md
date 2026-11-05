# Analytics and search measurement

**Date:** 2026-11-05
**Status:** PARTIAL — implementation present, access and consent incomplete.

## 1. What exists

| System | Evidence | Status |
|---|---|---|
| GA4 `G-LE6ETPWL23` | `gtag/js` + `gtag('config')` in `apps/web/src/index.html` and live HTML | present |
| Google Search Console | `GSC_SITE_URL=sc-domain:guiaprogramaciontv.com` in the environment | **not for tecnoriasl.com** |
| Bing Webmaster Tools | no credentials/import visible | not verified |
| Server logs | nginx access/error logs on Contabo | available read-only |
| CRM | `leads` table and admin UI in `apps/api` | present but no analytics/CRM export reviewed |
| Consent | no banner, no consent mode | **not compliant yet** |
| Lead event | no `generate_lead`/`form_submit` event | missing |
| Sitemap submission | no GSC access | not verified |

## 2. Search Console blocker

The service-account credential in this environment is scoped to `guiaprogramaciontv.com`. There is
no verified property for `tecnoriasl.com` and no owner delegation. Therefore:

- no impressions, clicks, queries, CTR, position or index coverage can be reported;
- no sitemap submission was made;
- no manual action or security issue can be ruled out from GSC.

To unblock: add the owner account (or the service account) to a `tecnoriasl.com` property in Search
Console, then export the last 90 days and 16 months by query/page/country/device. Do not read this
document as evidence that the site is or is not indexed.

## 3. GA4 status

GA4 is loaded on every page, including before any consent choice. That is a privacy gap under
GDPR/ePrivacy for EU visitors. It also means the site currently has no defensible consent record for
analytics cookies.

Recommended minimum implementation (not yet done):

1. Default consent to denied before `gtag('config')`:
   `gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied'})`.
2. A small accessible banner with “Aceptar analítica” and “Rechazar”; store the choice; call
   `gtag('consent','update',{analytics_storage:'granted'})` only on accept.
3. Keep a consent record (timestamp + choice) in the CRM or a first-party store.
4. Only then add a single `generate_lead` event after a successful contact submission, with
   `form_name`, `project_type` and `timeline` (no free-text message or personal data).
5. Do not send PII (name, email, phone, message) to GA4.

Legal copy must be approved by the owner; this document does not provide legal advice.

## 4. Events to implement after consent

| Event | Trigger | Parameters | Deduplication |
|---|---|---|---|
| `form_start` | first focus in the contact form | `form_name=contacto` | once per page view |
| `generate_lead` | API returns 201 for a valid submission | `form_name`, `project_type`, `timeline` | once per successful submit; reset on new attempt |
| `cta_click` | click on service/product CTA | `cta_label`, `destination` | once per click |
| `phone_click` / `email_click` | tel/mailto click | `placement` | once per click |

The contact form currently has no analytics event. Do not add it until consent is implemented.

## 5. Dashboard specification

A reusable dashboard should show, by week and by cluster:

- GSC: impressions, clicks, CTR, average position, indexed valuable pages, non-brand queries.
- GA4: organic sessions, landing-page engagement, form starts, successful leads, conversion rate.
- CRM: qualified leads, discovery calls, won/lost and source.
- Core Web Vitals: field p75 if CrUX/RUM exists; lab otherwise, clearly labelled.
- Server: 5xx rate, TTFB, error-log count.
- SEO health: sitemap URLs, canonical mismatches, 404/301 counts.

Separate observations from projections. Do not infer revenue from sessions without CRM data.

## 6. Baseline storage

The first baseline is `docs/growth/SEO-00-BASELINE.md` plus the GSC export (once access exists) and
the lab performance table in `PERFORMANCE-BENCHMARKS.md`. Store the export outside the repository if
it contains query-level data; never commit personal data.
