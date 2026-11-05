# GA4 configuration — current verified state, consent coupling and operator actions

- **Milestone:** TECNORIA-GROWTH-02 · **Work package:** D2
- **Author:** `privacy-consent`
- **Date:** 2026-11-05 (Europe/Madrid)
- **Measurement ID:** `G-LE6ETPWL23`
- **Status:** the site-side tag is implemented and verified on a local build; **the GA4 property itself
  is not configured or inspected by us — access is blocked**; **the site is not deployed with these
  changes**.

> This document records what is verifiably true today. It is **not** a GA4 setup manual and it does
> **not** claim any property-level setting was changed. Every property-level item is labelled
> *NOT DONE*.

---

## 1. Current verified state

| Fact | Evidence |
|---|---|
| Measurement ID in use is `G-LE6ETPWL23` | `apps/web/src/index.html:57`, exactly once in that file |
| The old unconditional tag is gone | `apps/web/src/index.html` contains **0** `<script src=…>` tags and **0** literal `gtag('config'` calls; the built `apps/web/dist/server/index.server.html` shows the same |
| No third-party script is fetched before consent | browser E2E scenario 1: zero requests to `googletagmanager.com` / `google-analytics.com` / `doubleclick.net` with a fresh profile |
| `gtag/js` is fetched **once**, only after an affirmative analytics choice | browser E2E scenario 6: exactly 1 script element, 1 `config` command, 1 network request; a second loader call adds nothing |
| Consent Mode is **basic**: no cookieless pings | `apps/web/src/index.html:86-99` injects nothing when consent is denied; there is no advanced-mode endpoint configuration anywhere in the repo |
| No GA4 API integration exists in this repository | no `googleapis` / `google-analytics-data` dependency in `package.json`, `apps/web/package.json`, `apps/api/package.json`; no script references GA4 |
| The public runtime config exposes no analytics credential | `apps/web/server.ts:29-33` returns only `googleClientId` |

### What happens on a page load, in order

1. Inline script (`index.html:49-105`) defines `dataLayer`/`gtag` and pushes
   `consent`/`default` with `ad_storage`, `ad_user_data`, `ad_personalization`,
   `analytics_storage` = `denied`, `wait_for_update: 500`.
2. It reads `tecnoria.consent.v1` from `localStorage` inside `try/catch`.
3. If and only if the record has `analytics === true`, it calls
   `window.__tecnoriaLoadAnalytics()`, which appends the `gtag/js` script and queues
   `js` + `config`.
4. Angular resolves the consent state after hydration; any later change pushes
   `gtag('consent','update', …)` and, when analytics becomes true, calls the same loader (idempotent).

Consequence: with consent denied there is **no Google request and no GA4 cookie**. With consent
granted the tag loads and GA4 receives the automatic `page_view` for that load.

---

## 2. Access blockers (both independent, both verified)

### 2.1 Analytics Admin API is disabled in the Google Cloud project

Any attempt to read or change the property through the Analytics Admin API answers:

```
HTTP 403
{
  "error": {
    "code": 403,
    "status": "SERVICE_DISABLED"
  }
}
```

The project is `533857766582` (the same Cloud project used for the OAuth client already present in
`apps/web/server.ts:31`). The API is not enabled for that project; enabling it requires Cloud project
ownership, which the working credential set does not have.

Verified by the captain and, independently, by `analytics-search` during WAVE A.

### 2.2 No GA4 property membership

No credential available to this milestone is a member of the GA4 property behind `G-LE6ETPWL23`
(no account/property listing is possible). Even with the Admin API enabled, report reads and property
edits would be rejected for lack of membership.

### 2.3 What that blocks, concretely

- No read access to reports, Realtime, DebugView or the data stream settings.
- No ability to mark `generate_lead` as a key event (conversion).
- No ability to verify whether enhanced measurement is on, whether Ads is linked (and therefore whether
  `_gcl_au` is ever set), or what the data-retention period is.
- No baseline export. Every GA4-side number in this milestone's documents is therefore
  **`sin datos` (no data)** with the reason "no GA4 access", never an estimate.

---

## 3. Consent dependency of every analytics action

| Action | Requires analytics consent | Notes |
|---|---|---|
| Fetch `https://www.googletagmanager.com/gtag/js` | **Yes** | Only `window.__tecnoriaLoadAnalytics()` inserts it, and only when the stored record grants analytics |
| Send `page_view` | **Yes** | Implicit result of `config`; no `config` without consent |
| Send `generate_lead` | **Yes** + confirmed lead | Double gate: consent and `window.__tecnoriaAnalyticsLoaded === true` |
| Set `_ga`, `_ga_LE6ETPWL23` | **Yes** | GA4 library cookies; they do not exist before consent |
| Send advertising signals (`ad_storage`, `ad_user_data`, `ad_personalization`) as `granted` | **Yes, and only via the explicit "Publicidad" toggle** | "Aceptar" grants analytics only (`ConsentService.acceptAnalytics()`) |
| Purge analytics cookies | n/a (withdrawal) | `withdraw()` deletes `_ga`, `_ga_<id>`, `_gid`, `_gat*`, `_gcl_*` and blocks the loader for the session |
| Cloudflare email-decode script / NEL reporting | n/a | Cloudflare-injected, not ours and not analytics; described in the cookie policy |

---

## 4. Every event the site sends today

| Event | Parameters | Trigger | Consent | Where it is produced |
|---|---|---|---|---|
| `consent` / `default` (command, not an event) | `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` = `denied`, `wait_for_update: 500` | Inline script, before anything else, every load | none | `apps/web/src/index.html:65-71` |
| `consent` / `update` (command) | the four signals, mapped from the record (`marketing` → the three ad signals) | every accept / reject / withdraw / resolution of a stored record | none | `apps/web/src/app/site/services/consent.service.ts:132-147`, mapping at `consent-state.ts:122-133` |
| `js` + `config` (commands) | `G-LE6ETPWL23` | inside `__tecnoriaLoadAnalytics()` | **analytics** | `apps/web/src/index.html:86-99` |
| `page_view` | GA4 automatic (`page_location`, `page_referrer`) — the site sends no custom parameters | after `config`, i.e. after consent | **analytics** | GA4 itself |
| `generate_lead` | **exactly** `form_type`, `service_category`, `source_page` | only after the contact API confirms a `201`, at most once per submission attempt | **analytics** | `apps/web/src/app/site/services/analytics.service.ts:28-49`; contract in `analytics-events.ts:9-105`; caller `contact-form.component.ts:137-141` |

`service_category` is taken from a closed map (`SERVICE_CATEGORY_LABELS`,
`analytics-events.ts:93-102`) — `software-a-medida`, `automatizacion-procesos`,
`chatbots-asistentes`, `ia-aplicada`, `plataforma-saas`, `revision-software`,
`consultoria-tecnologica`, otherwise `other`. `source_page` is the pathname (e.g. `/contacto`),
sanitised to `/^[a-z0-9/_-]{1,64}$/i`, falling back to `/`.

**No other event exists.** There is no `form_start`, no scroll/CTA/outbound-click tracking, no
`page_view` re-send on Angular route changes, no user-id, no custom dimensions.

### 4.1 What is NOT sent (explicit non-send list)

- No name, surname, email, phone, company or message body — the PII scan in
  `scripts/tests/analytics-dispatch.test.mjs` fails the suite if any submitted value appears in the
  serialized `generate_lead` payload.
- No free text at all: `service_category` is a closed label map and free text collapses to `other`.
- No user identifier, no `client_id` override, no email hashing, no `user_id` parameter.
- No `timeline`, no budget or project description, no form field not listed above.
- No advertising signals as `granted` unless the visitor explicitly enables "Publicidad".
- No measurement when consent is denied — not even a cookieless ping (basic mode).

---

## 5. Operator actions required once GA4 access exists — **NOT DONE**

> **Status: nothing in this section has been executed.** It is a checklist for a future **authorized
> operator** with GA4 property access. Recording them here does not claim they are configured, and
> none of them can be verified from this repository.

| # | Action | Why it matters | Done? |
|---|---|---|---|
| O-1 | Confirm the data stream for `tecnoriasl.com` points at `G-LE6ETPWL23` and that the site's events arrive (Realtime after a consented visit) | The only proof that the tag, the stream and the property are the same | **No** |
| O-2 | Mark `generate_lead` as a **key event** (Admin → Events → mark as key event) | Without it the event is not a conversion and cannot be reported as one | **No** |
| O-3 | Turn **Enhanced measurement** page-change tracking on or off deliberately (it affects SPA `page_view` behaviour in Angular route changes) | The site does not send manual `page_view`; the property setting decides whether `/servicios` → `/contacto` counts | **No** |
| O-4 | Configure **referral exclusions** for `auctorio.com` and `talkaris.com` | Both are our own products/domains; without exclusion their referrals can close sessions and distort attribution | **No** |
| O-5 | Review **PII / data-redaction** settings: ensure "improve Google signals" and any ad-personalisation features stay off unless the controller approves them, and confirm no query-string or form data can reach GA4 | The site sends no PII by construction; the property settings must not add collection that the cookie policy does not describe | **No** |
| O-6 | Set **data retention** (2 or 14 months) deliberately and record the choice | It bounds how far back any baseline or conversion analysis can go | **No** |
| O-7 | Decide whether a **Google Ads** link is wanted; if not, confirm it is absent (it would add `_gcl_au` and require `marketing` consent to be meaningful) | The cookie policy currently states there are no advertising cookies; an Ads link would change it | **No** |
| O-8 | Record the accepted settings (screenshot or export) as milestone evidence | A verbal "it's on" is not evidence | **No** |

Additional, outside GA4 but part of the same measurement chain: the **SMTP credential** for lead
notification is blocked (`EAUTH 534-5.7.9 WebLoginRequired`, see
[`_team/GROWTH-02-INFRA-DRILL.md`](_team/GROWTH-02-INFRA-DRILL.md)). Until it works, a `generate_lead`
event can be counted while the human notification of that same lead cannot be delivered — see
[`CONVERSION-MEASUREMENT.md`](CONVERSION-MEASUREMENT.md) §5.

---

## 6. How to verify the tag once access exists

These are verification recipes, not results:

1. **Fresh browser profile**, open `https://tecnoriasl.com/` with DevTools → Network, filter
   `google`. Expected: **nothing**. Accept analytics, expected: one `gtag/js` request, then GA4
   collect requests.
2. **Reject and reload**: expected zero Google requests on every route and after reload.
3. **Tag Assistant / DebugView**: a consented visit should show `page_view`; a `/contacto` submit with
   a `201` should show one `generate_lead` with only the three parameters above.
4. **Cross-check against the database**: a `generate_lead` without a matching row in
   `contact_messages` (or vice versa, allowing for consent denials) is a defect — see
   `CONVERSION-MEASUREMENT.md` §4.
5. **Withdrawal**: after "Retirar consentimiento", `document.cookie` must not contain `_ga*` and no
   further Google request may appear for the rest of the session.

Until the deployment task runs, none of this is proven against production.

---

## 7. Unknowns (no access, not guessed)

| Question | Status |
|---|---|
| Is the GA4 property linked to Google Ads (and therefore is `_gcl_au` ever set)? | **Unknown** — no property access |
| Is Google Signals / ads personalisation enabled? | **Unknown** |
| Data retention period currently configured | **Unknown** |
| Enhanced measurement page-change tracking on/off | **Unknown** |
| Any other tag, audience, trigger or integration inside the property | **Unknown** |
| Historical GA4 traffic baseline | **`sin datos`** — no report access; nothing is estimated in this milestone |

A missing number is written as `sin datos` with the reason (no GA4 access), never as an estimate.

---

## 8. No compliance claim

Consent Mode v2 is a measurement-privacy mechanism, not a legal instrument. This configuration does
not make the site compliant, and nothing here should be read as legal advice or as approval of the
banner/cookie-policy wording — that approval is `PENDING CONTROLLER/COUNSEL APPROVAL` and belongs to
the controller or its counsel, not to engineering.
