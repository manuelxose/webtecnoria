# Conversion measurement — metrics, sources and what is measurable today

- **Milestone:** TECNORIA-GROWTH-02 · **Work package:** D2
- **Author:** `privacy-consent`
- **Date:** 2026-11-05 (Europe/Madrid)
- **Status:** the measurement layer is implemented and verified **on a local build**; the site is
  **not deployed**; GA4 reporting access is **blocked**; lead notification delivery is **blocked** by
  the SMTP credential.

> Rule of this document: **no invented numbers.** Every figure below is traceable to
> `docs/growth/_team/gsc-baseline.json`, a `psql` query quoted in
> [`_team/GROWTH-02-LEAD-DISCOVERY.md`](_team/GROWTH-02-LEAD-DISCOVERY.md), or a command output pasted
> here. Anything unavailable is written as **`sin datos`** with the reason.

---

## 1. Two data planes that must not be mixed

| | **Operational plane** | **Behavioural plane** |
|---|---|---|
| Source | PostgreSQL `tecnoria.contact_messages` (and the notification status added by WAVE B2) | Google Analytics 4, measurement ID `G-LE6ETPWL23` |
| Contains personal data | **Yes** (name, email, phone, company, message) — stays inside the company, never exported to analytics | **No** — only `form_type`, `service_category`, `source_page` |
| Consent needed | **No** — it is the service the visitor explicitly requested (form submission) | **Yes** — nothing is sent without analytics consent |
| Who reads it | Operations / sales, through the database or the admin surface | Whoever holds GA4 property access |
| Current status | **Measurable now** (read-only queries) | **Blocked** — no property access (`GA4-CONFIGURATION.md` §2) |

The two planes may only be compared **as aggregate counts**. Joining a GA4 session to a database row
would require an identifier, and no such identifier is collected — deliberately.

---

## 2. Metric set

Status legend: **measurable now** = can be produced today with the access this milestone has;
**blocked** = the instrument exists but the data source is not reachable; **not instrumented** = the
event does not exist yet; **sin datos** = no number can be stated.

| # | Metric | Exact definition | Source | Consent dependency | Status today |
|---|---|---|---|---|---|
| M-1 | Organic landing sessions | GA4 sessions whose session source/medium is `google / organic` (or any organic), counted per session-start date | GA4 reports | **Required** — no GA4 tag without analytics consent | **Blocked**: no GA4 access. **`sin datos`** |
| M-2 | Service-page engagement | Number of `page_view` events with `page_location` matching `/servicios/*`, and the share of consented sessions that include at least one | GA4 reports | **Required** | **Blocked**: no GA4 access. **`sin datos`** |
| M-3 | Form initiation | Count of a `form_start` event fired when the contact form is first interacted with | **Not implemented** — no such event exists in the code | Would require analytics consent | **Not instrumented.** Not measurable. **`sin datos`** |
| M-4 | Confirmed lead | Rows in `tecnoria.contact_messages` created in the period (the API answered `201`) | PostgreSQL | **None** (operational) | **Measurable now.** Total **17** rows, `min(created_at) = 2026-03-10 13:25:24.421152+01`, `max(created_at) = 2026-10-16 09:23:30.607981+02` |
| M-5 | Notified lead | Confirmed leads whose operator notification reached `sent` (status persisted separately from storage) | PostgreSQL (B2 columns) + SMTP | **None** (operational) | **Blocked**: SMTP credential — `EAUTH`, `responseCode 534`, `534-5.7.9 … WebLoginRequired` (see [`_team/GROWTH-02-INFRA-DRILL.md`](_team/GROWTH-02-INFRA-DRILL.md) §3). Delivery count **`sin datos`** |
| M-6 | Lead conversion rate | `confirmed leads / sessions`, per period; and `confirmed leads / organic sessions` once organic can be isolated | needs **M-1** (denominator) and **M-4** (numerator) | Denominator requires consent | **Blocked** — the denominator does not exist. **`sin datos`** |
| M-7 | Search visibility (top-of-funnel proxy) | Google Search Console impressions, clicks, CTR and average position for the property | Search Console API (`sc-domain:tecnoriasl.com`) | **None** (server-side search data) | **Measurable now** — see §6 |
| M-8 | Analytics consent rate | Share of visitors who grant analytics (GA4 consent-mode reporting, or a first-party counter) | GA4 / not instrumented | n/a | **Blocked** (no GA4 access). **`sin datos`** |

---

## 3. Operational lead counting (available today)

Query used (read-only, run on the production host; source: A3 discovery §verification):

```
$ sudo -u postgres psql -d tecnoria -At -c "select count(*), min(created_at), max(created_at) from contact_messages"
17|2026-03-10 13:25:24.421152+01|2026-10-16 09:23:30.607981+02
```

What that tells us, without any behavioural tracking:

- The `contact_messages` table holds **17** rows in total, dating from **2026-03-10** to
  **2026-10-16**. There is no row after **2026-10-16** at the time of that query.
- The separate `leads` table had **0** rows (same discovery), so nothing in the product read these
  submissions.
- Until WAVE B2, **no notification path existed at all** — a stored lead was invisible to the business
  (`GROWTH-02-LEAD-DISCOVERY.md` findings L1/L8). That is why "leads" and "leads we heard about" were
  previously the same number only by accident.

Consequences for counting:

- **Use the database for the operational number.** It is exact, needs no consent, and cannot be
  affected by ad blockers, consent refusals or analytics outages.
- **Never use GA4 `generate_lead` as the business count.** It is a lower bound: consent-denied
  visitors never produce an event.
- The database contains PII. Exports stay internal; dashboards use counts and non-personal
  categories only. No PII ever enters the analytics plane (`GA4-CONFIGURATION.md` §4.1).

---

## 4. Behavioural analytics and the `generate_lead` event

`generate_lead` is implemented and consent-gated (`AnalyticsService.trackLead`,
`apps/web/src/app/site/services/analytics.service.ts:28-49`; payload contract
`analytics-events.ts:9-105`; call site `contact-form.component.ts:113-143`):

- fires **only** after the contact API returns `201`;
- **at most once** per submission attempt (in-flight guard + per-attempt idempotency key);
- **only** when analytics consent is in force and the gtag runtime is loaded;
- carries **only** `form_type`, `service_category`, `source_page`.

Therefore:

- A discrepancy of the form *events ≤ rows* is expected and correct (consent refusals, blocked
  trackers, ad blockers).
- A discrepancy of the form *events > rows* is a defect (double counting or an event fired without a
  confirmed lead) and must be investigated.
- Because no identifier links the two planes, reconciliation is done on **period counts**, not on
  individual records.

Today the comparison itself is impossible: the event exists, but no one can read GA4
(`sin datos`), and the site is not deployed with the change yet.

---

## 5. The funnel and where it currently breaks

```
organic landing  →  service page  →  form initiation  →  confirmed lead  →  notified lead
   (M-1)             (M-2)             (M-3)               (M-4)             (M-5)
   blocked          blocked         not instrumented     measurable       blocked (SMTP)
```

| Stage | Instrument | Current state |
|---|---|---|
| Organic landing | GA4 session | **Blocked.** No GA4 access; tag only loads after consent (which is the intended behaviour, and also why the number will be a lower bound). |
| Service page | GA4 `page_view` | **Blocked** for the same reason. The page set itself is verified (33 public routes, `npm run test:seo`). |
| Form initiation | would need a `form_start` event | **Not instrumented.** No such event exists; adding it would also require analytics consent and a contract update. Do not report on it. |
| Confirmed lead | `contact_messages` row | **Measurable now.** Last row **2026-10-16**; the count is the operational truth. |
| Notified lead | notification status (WAVE B2) + SMTP | **Blocked at the SMTP credential.** The credential is rejected with `EAUTH 534-5.7.9 WebLoginRequired`, so even a correctly implemented notification cannot be delivered in production today. Verified pre-B2 in WAVE C; the B2 implementation is in progress by `backend-lead`. |

Honest summary: **today the funnel has no measurable start, and its end is measurable but silent.**
The only reliable numbers available are the database count (M-4) and Search Console (M-7).

---

## 6. Search baseline (the only live top-of-funnel data)

Source: `docs/growth/_team/gsc-baseline.json`, property `sc-domain:tecnoriasl.com`, queried
`2026-11-05T01:02:24.127Z`.

| Window | Clicks | Impressions | CTR | Avg. position |
|---|---:|---:|---:|---:|
| 7 days | 0 | 51 | 0 | 15.59 |
| 28 days | 3 | 216 | 1.39 % | 19.92 |
| 90 days | 15 | 702 | 2.14 % | 26.03 |
| 480 days | 78 | 34 810 | 0.22 % | 51.88 |

Sitemap status at the same query: `https://tecnoriasl.com/sitemap.xml`, submitted
`2026-11-05T01:02:18Z`, downloaded `2026-11-05T01:02:19Z`, **0** warnings, **0** errors, 32 URLs
submitted, **0** reported as indexed **at that instant** (a value that must be re-read later; it is
not evidence that pages are not indexed).

These are the only real numbers this milestone can quote for demand. They are **not** sessions and
must not be used as a conversion-rate denominator.

---

## 7. Lead conversion rate — formula and why it cannot be computed today

Definition once a denominator exists:

```
lead conversion rate (period, segment) =
    count(contact_messages.created_at in period, matching segment)
    --------------------------------------------------------------
    count(sessions in period, matching segment)

organic lead conversion rate =
    confirmed leads from organic sessions / organic sessions
```

What is missing today:

1. **No denominator.** GA4 sessions are unreadable (no property access) and, even with access, the
   number only covers consented visitors — it is a **lower bound**, not a census.
2. **No segment attribution.** The database row does not know the session that produced it; only the
   `source_page` pathname is recorded on the analytics side, and only for consented submissions.
3. **No deployment.** The consent and `generate_lead` work is not live, so there is nothing to read
   yet even if access existed.

Therefore the correct current statement is: **lead conversion rate = `sin datos` (no GA4 access, no
deployed measurement)**. Any percentage quoted today would be invented.

**When it becomes computable:** after deployment + GA4 access, compute it per 28-day window, and
report it as a **bounded estimate** ("consented sessions only"), never as an exact rate. The
operational lead count (M-4) remains the source of truth for the numerator.

---

## 8. Review cadence — day 7 / 14 / 30

Anchored to the **deployment date** of the measurement change (task X2), which does not exist yet.
At each review, record the same fields so the series is comparable, and re-run the same queries.

| When | What to record | Source |
|---|---|---|
| **Day 7** | `select count(*), max(created_at) from contact_messages` (leads since deployment); notification delivery count for those leads; GSC `d7` and `d28` windows; whether GA4 Realtime ever showed events; any consent-related console error | psql, SMTP log, GSC API, GA4 (if access) |
| **Day 14** | Same, plus: GSC `d28` window vs the day-7 pull; top queries/pages movement; number of leads with `notified` ≠ `sent` | same |
| **Day 30** | Same, plus: GSC `d90` window vs baseline in §6; first pass at M-6 **only if** a denominator exists; consent rate (M-8) if GA4 consent-mode reporting is available | same |

What to compare, explicitly:

- **GSC windows against the §6 baseline** (7/28/90/480 days) — same property, same query, same
  aggregation. Movement is only meaningful against those numbers.
- **Lead counts against the database**, never against GA4.
- **Notification delivery against confirmed leads**: every confirmed lead must end `sent`, or be
  listed with its failure reason. This is the control that closes the silent-lead defect.
- **Do not compare against invented history.** There is no GA4 baseline to regress against.

Review outcomes are recorded as `sin datos` where a source is still blocked — the value of the
cadence is that each blocked source is re-checked and named, not that a number is produced.

---

## 9. Source register (every number in this document)

| Number | Source | How obtained |
|---|---|---|
| 17 rows; `2026-03-10` → `2026-10-16` | PostgreSQL `tecnoria.contact_messages` | `psql -At -c "select count(*), min(created_at), max(created_at) from contact_messages"` (quoted §3; discovery A3) |
| `leads` = 0 rows | same database | A3 discovery §verification |
| 0 / 51 / 0 / 15.59 (7 d) | `docs/growth/_team/gsc-baseline.json` | `totals.d7` |
| 3 / 216 / 1.39 % / 19.92 (28 d) | same file | `totals.d28` |
| 15 / 702 / 2.14 % / 26.03 (90 d) | same file | `totals.d90` |
| 78 / 34 810 / 0.22 % / 51.88 (480 d) | same file | `totals.d480` |
| Sitemap: 32 submitted, 0 indexed, 0 warnings/errors | same file | `sitemaps[0]` |
| SMTP `EAUTH` / `534` / `5.7.9 WebLoginRequired` | [`_team/GROWTH-02-INFRA-DRILL.md`](_team/GROWTH-02-INFRA-DRILL.md) §3 | drill output |
| 33 public routes | `npm run test:seo` | `SEO checks passed: 33 public routes, JSON-LD, 404/301, cache and sitemap.` |

`sin datos` (with reason): organic sessions, service-page engagement, form initiation, conversion
rate, notified leads, consent rate, historical GA4 traffic — **no GA4 access** and/or **no deployed
measurement**.

---

## 10. What this document does not claim

- No compliance claim: consent-based measurement is not legal compliance, and the wording remains
  `PENDING CONTROLLER/COUNSEL APPROVAL`.
- No deployment claim: the site is not live with these changes; every behaviour described was
  verified against a local SSR build.
- No performance or growth claim: there is no traffic baseline to compare against, and none is
  invented here.
