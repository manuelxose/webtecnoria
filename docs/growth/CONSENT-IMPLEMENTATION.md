# Consent implementation — Consent Mode v2 (basic), consent UI and withdrawal

- **Milestone:** TECNORIA-GROWTH-02 · **Work package:** B1 (implementation), D2 (this record)
- **Author:** `privacy-consent` (implementer of B1)
- **Date:** 2026-11-05 (Europe/Madrid)
- **Status:** implemented and verified **on a local SSR build**; **NOT deployed to production**.
- **Companion documents:** [`GA4-CONFIGURATION.md`](GA4-CONFIGURATION.md), [`CONVERSION-MEASUREMENT.md`](CONVERSION-MEASUREMENT.md), discovery record [`_team/GROWTH-02-CONSENT-DISCOVERY.md`](_team/GROWTH-02-CONSENT-DISCOVERY.md)

> **No legal-compliance claim.** A consent interface is not legal compliance. The wording on the banner
> and on `/politica-de-cookies` is interim and marked `PENDING CONTROLLER/COUNSEL APPROVAL`; the
> controller (or its counsel) must approve the final text. Nothing here has been verified against the
> deployed production site, because the change is not deployed yet.

---

## 1. What problem this fixes

Before this work, `apps/web/src/index.html` shipped a static
`<script async src="https://www.googletagmanager.com/gtag/js?id=G-LE6ETPWL23">` plus an immediate
`gtag('config','G-LE6ETPWL23')`. Because that HTML is baked into the SSR template
(`apps/web/server.ts:283`, rendered at `:470-489`), **every** page view — public and private — fetched
Google's tag, set `_ga` / `_ga_LE6ETPWL23` and sent a `page_view`, with no consent and no way to say
no. That is the defect this work package removes.

The fix is **basic Consent Mode v2**: every signal defaults to `denied`, the Google tag is only
injected after an affirmative analytics choice, and the choice is persistent, revisable and
withdrawable.

---

## 2. Architecture at a glance

| Layer | File | Responsibility |
|---|---|---|
| Document head | `apps/web/src/index.html:49-105` | Consent **default** (`denied`), deferred loader `window.__tecnoriaLoadAnalytics()`, called only when the stored record grants analytics |
| State model (pure) | `apps/web/src/app/site/services/consent-state.ts` | Record shape, parse/validate/expiry, signal mapping, cookie-name filter. No Angular, no DOM |
| State service | `apps/web/src/app/site/services/consent.service.ts` | Persistence, signal updates, loader gating, withdrawal + cookie purge, "reopen preferences" requests |
| UI | `apps/web/src/app/site/components/consent-banner.component.ts` | Accessible dialog, three equal actions, two optional toggles, focus trap, Escape |
| Global mount | `apps/web/src/app/app.component.html:8` | `<app-consent-banner ngSkipHydration>` next to the only `<router-outlet>` |
| Footer entries | `apps/web/src/app/site/components/site-footer.component.ts:119-127`, `:162` | "Política de cookies" link + "Configuración de cookies" button |
| Policy page | `apps/web/src/app/site/pages/cookies-page.component.ts` (route `apps/web/src/app/app.routes.ts:618-624`) | Cookie table, third parties, withdrawal instructions, 5 `PENDING CONTROLLER/COUNSEL APPROVAL` markers |
| Measurement | `apps/web/src/app/site/services/analytics.service.ts`, `analytics-events.ts` | Consent-gated `generate_lead` with a closed parameter set |

### Why the default and the loader live in `index.html` and not in Angular

The two Google scripts were **inline in the document head** and are compiled into
`index.server.html`, which `apps/web/server.ts:283` serves for every SSR response. No Angular
component can run before a synchronous inline script in the same document, so any default placed in a
component would arrive late — and the old tag would already have been fetched. The default therefore
has to sit in the head, before anything else, and the loader has to be a plain function the Angular
service can call later.

Angular owns everything from the decision onwards: persistence, the dialog, the signal updates and
withdrawal.

---

## 3. The inline consent default and the deferred loader

`apps/web/src/index.html:49-105` (single block, no third-party request):

```js
var GA_ID = 'G-LE6ETPWL23';              // appears exactly once in the file
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
window.gtag('consent', 'default', {      // line 65
  ad_storage: 'denied', ad_user_data: 'denied',
  ad_personalization: 'denied', analytics_storage: 'denied',
  wait_for_update: 500
});
function analyticsAllowed() {            // line 73 — try/catch around localStorage
  ... record.version === 1 && record.analytics === true ...
}
window.__tecnoriaLoadAnalytics = function () {   // line 86
  if (window.__tecnoriaAnalyticsLoaded) return;  // idempotent
  window.__tecnoriaAnalyticsLoaded = true;
  var script = document.createElement('script');
  script.async = true; script.src = TAG_URL + GA_ID;   // no static <script src>
  document.head.appendChild(script);
  window.gtag('js', new Date());
  window.gtag.apply(null, ['config', GA_ID]);   // config only inside the gated loader
};
if (analyticsAllowed()) { window.__tecnoriaLoadAnalytics(); }   // lines 101-103
```

Consequences, all asserted by tests:

- **No `<script src=...>` element at all** in `index.html`, and no literal
  `gtag('config'` call anywhere: the config command is issued inside the loader, through the gtag
  shim, which is why it is written as `gtag.apply(null, ['config', GA_ID])`.
- **No request to `googletagmanager.com`** before consent — proven by network capture, not by
  inspection (see §9).
- `wait_for_update: 500` leaves a 500 ms window for the Angular layer to push the real decision on a
  returning visit, so the first hit is attributed correctly.
- The loader is idempotent (`__tecnoriaAnalyticsLoaded`), so accepting twice, or the service and the
  inline bootstrap racing on a returning visit, cannot double-load the tag.

---

## 4. State machine and persistence

### Record

| Field | Type | Meaning |
|---|---|---|
| `version` | `1` (literal) | Schema version; any other value ⇒ undecided |
| `analytics` | boolean | Google Analytics (only signal that loads the tag) |
| `marketing` | boolean | Advertising; defaults `false` and is **never** set by "Aceptar" |
| `ts` | ISO-8601 string | When the choice was made |

- **Storage:** `localStorage`, key **`tecnoria.consent.v1`** (`consent-state.ts:9`).
- **Expiry:** 24 months (`CONSENT_MAX_AGE_MS`, `consent-state.ts:13`); older ⇒ undecided, banner shows.
- **Clock-skew tolerance:** a record dated more than 60 s in the future ⇒ undecided.
- **Corrupt/missing record ⇒ undecided**, never an exception: `parseConsentRecord`
  (`consent-state.ts:52`) returns `null` for absent, non-JSON, wrong version, wrong types, invalid
  `ts`, stale or future-dated input. The stored bytes are never rewritten on read.
- **localStorage is always wrapped in `try/catch`** (`consent.service.ts:55`, `:149-195`): private
  mode, disabled storage or quota errors degrade to "decision in memory only", never to a crash.

### Transitions

| Trigger | Effect on record | Consent update pushed | Loader |
|---|---|---|---|
| `acceptAnalytics()` (`:75`) | `{analytics:true, marketing:false}` | analytics granted, all ad signals denied | called once |
| `saveSelection(a, m)` (`:80`) | explicit `{analytics:a, marketing:m}` | per flags; ad signals granted only if `m===true` | called if `a` |
| `rejectAll()` (`:85`) | `{analytics:false, marketing:false}` | all four denied | never |
| `withdraw()` (`:93`) | key **removed**, decision `null` | all four denied | blocked for the session |
| returning visit with a valid record | unchanged | update replayed on resolution | called if `analytics===true` |

Advertising is never implied: `consentSignals()` (`consent-state.ts:122`) maps `marketing` to
`ad_storage`, `ad_user_data` and `ad_personalization`, and `acceptAnalytics()` hard-codes
`marketing:false`.

### SSR safety

- The service resolves the stored decision inside `afterNextRender` (`consent.service.ts:55`), i.e.
  in the browser only. During server render nothing touches `window`, `localStorage` or
  `document.cookie`.
- The banner renders **nothing on the server** because its `resolved()` signal is `false` until that
  client-side resolution; the component is mounted with `ngSkipHydration`
  (`apps/web/src/app/app.component.html:8`) so Angular does not attempt to reconcile a client tree
  whose visibility depends on browser storage.
- Result: the server HTML and the first client frame agree (no banner), and the banner appears right
  after hydration. This was verified in a real browser: `0` hydration errors (`NG0xxx`) were recorded
  across all 13 scenarios.

---

## 5. The consent UI

`apps/web/src/app/site/components/consent-banner.component.ts`

- Fixed bottom overlay (`position: fixed`) — out of normal flow, so it cannot shift layout or the LCP
  element. Compact by construction: at 390×844 and 360×640 the measured bar is under 35 % of the
  viewport height and does not intersect the page `H1` (asserted, see §9).
- **Three equal actions**: `Aceptar`, `Rechazar`, `Configurar` share the identical class
  `button button-secondary consent__action` — same visual weight, no dark pattern. `Rechazar` is one
  click from the first layer.
- `Configurar` expands two toggles, **Analítica** and **Publicidad**, both **unchecked** on first
  visit and never pre-ticked (property binding only, no `checked` attribute in the markup). Saving
  calls `saveSelection()`.
- When a decision already exists, the same component renders the permanent control
  **«Configuración de cookies»** (`:135`); opening it pre-fills the toggles from the current record and
  shows **«Retirar consentimiento»**.
- Bilingual strings are Spanish (site language); the component carries no external configuration.

### Permanent re-open entry points

1. The global control rendered by the banner component when the dialog is closed — present on **every**
   route, including `/auth-login`, `/dashboard` and `/portal`, because it is mounted in
   `app.component.html:8` rather than in the site layout.
2. Footer entries on public routes: "Política de cookies" link
   (`site-footer.component.ts:119`) and "Configuración de cookies" button (`:121-127`, handler at
   `:162` → `ConsentService.requestPreferences()`).
3. The cookie policy page itself (`/politica-de-cookies`, `app.routes.ts:618-624`) explains both.

`requestPreferences()` (`consent.service.ts:103`) increments a signal the banner watches, so any
surface can reopen the dialog without coupling to the banner instance.

---

## 6. Withdrawal and cookie purge

`withdraw()` (`consent.service.ts:93-100`):

1. sets `suppressed = true` **before** anything else, so no later path can load the tag in this
   session;
2. removes `tecnoria.consent.v1` from `localStorage`;
3. sets the decision to `null` and pushes `gtag('consent','update', …)` with all four signals
   `denied`;
4. runs `clearAnalyticsCookies()` (`:196-229`), which:
   - collects the known names `_ga`, `_gid`, `_gat`, `_gcl_au`, `_gcl_aw`
     (`consent-state.ts:142-148`),
   - **plus** every cookie in the jar whose name matches `isAnalyticsCookieName()`
     (`consent-state.ts:137`; `_ga`, `_ga_<id>`, `_gid`, `_gat*`, `_gcl_*`) — so `_ga_LE6ETPWL23` is
     purged even though the frontend never hard-codes it,
   - expires each one with `Max-Age=0` for `path=/`, for the bare host and for `.` + registrable
     domain (skipped for IP hosts);
5. afterwards the decision is undecided: the banner reappears on the next navigation and the
   "Configuración de cookies" control stays available.

Verified in a real browser with **seeded** `_ga` and `_ga_LE6ETPWL23` cookies: 2 present before
withdrawal, 0 after, and no further Google request on the following page load.

---

## 7. Accessibility implementation

| Requirement | Implementation | Where |
|---|---|---|
| Dialog semantics | `role="dialog"`, `aria-modal="true"` | `consent-banner.component.ts:41-42` |
| Accessible name | `aria-labelledby="consent-title"` → visible title | `:43` |
| Accessible description | `aria-describedby="consent-desc"` → explanatory paragraph | `:44` |
| Focus moves in on open | effect → `queueMicrotask` → focus the dialog (`tabindex="-1"`) | `:300-318`, `:416` |
| Tab is trapped | `@HostListener("keydown")` wraps at the last focusable element and back to the first; focusables queried inside the dialog only | `:362-408`, selector `:15-21` |
| Shift+Tab wraps backwards | first/last logic with `event.shiftKey` | `:396-408` |
| Escape closes **without** consent | `Escape` → `close()` (dismiss only), no service call | `:368-372` |
| Keyboard reachable | all actions are native `<button>`/`<input type="checkbox">` in DOM order | template `:82-130` |
| Visible focus ring | global `button:focus-visible { outline: 3px solid … }` (`apps/web/src/styles.css:117-125`) + component rules for the reopen control (`:252`) | asserted in browser |
| Equal prominence | identical class for the three first-layer actions | template |

### Known accessibility gap (accepted, documented)

When the dialog is open the rest of the page is **not** marked `inert` / `aria-hidden`. Focus cannot
escape (Tab is trapped) and pointer interactions outside the bar do nothing, so the practical risk is
low for a non-fullscreen cookie bar — but `aria-modal="true"` promises more than is delivered to
screen-reader virtual cursors. Fixing it requires wrapping or inerting the application root; it is
listed as open work in §10 and should be decided by the reviewer.

---

## 8. What `generate_lead` does, and what it will never carry

`apps/web/src/app/site/services/analytics.service.ts:28-49` and
`analytics-events.ts:9-105`:

- `trackLead()` returns `false` unless analytics consent is in force **and** the gtag runtime is
  loaded (`window.__tecnoriaAnalyticsLoaded === true`); it calls `ensureAnalyticsLoaded()` first, so a
  granted-then-reload race does not drop the event.
- The event is `generate_lead` with exactly `form_type`, `service_category`, `source_page`
  (`LEAD_PARAM_KEYS`, `analytics-events.ts:10`). `service_category` comes from a closed map
  (`SERVICE_CATEGORY_LABELS`, `:93`) — free text collapses to `other`.
- The contact form only calls it **after** `await this.contactRepository.submitLead(...)` resolves
  (`contact-form.component.ts:113-143`), guarded by `canStartSubmission()` (`:92`), an `inFlight`
  flag and a per-attempt `idempotencyKey` (`:111`, kept across retries, cleared on success `:134`).

Full event inventory and the non-send list: [`GA4-CONFIGURATION.md`](GA4-CONFIGURATION.md) §4-§5.

---

## 9. Verification matrix

All rows below come from `npm run test:browser` (real headless Chrome driven over the DevTools
Protocol, no Playwright, no new dependency) and `npm run test:consent` / `npm run test:analytics`.
`node --test` reports **14 tests / 14 pass** for the browser file: **13 scenario sub-tests + the
parent** test. The numbered rows below are *checks*, not a 1:1 map of sub-test names — several
sub-tests assert more than one row (e.g. sub-test "accept…" covers rows 6 and part of 1).
Nothing was executed against production.

| # | Scenario | What is asserted | Result |
|---|---|---|---|
| 1 | First visit (fresh profile) | zero requests to `googletagmanager.com` / `google-analytics.com` / `doubleclick.net`; `window.dataLayer[0]` is the `consent`/`default` command with all four signals `denied`; no `consent update`; no `config` command; storage empty | **PASS** |
| 2 | Banner semantics | `role=dialog`, `aria-modal=true`, non-empty name and description; `Aceptar`/`Rechazar`/`Configurar` present with **one identical class**; `Configurar` renders exactly 2 checkboxes, both `checked=false` | **PASS** |
| 3 | Escape from the first layer | dialog closes, `localStorage` stays `null`, zero Google requests, reopen control remains | **PASS** |
| 4 | Reject | record `{version:1, analytics:false, marketing:false, ts}`; full loads of `/servicios`, `/contacto`, `/blog` and a reload of `/` produce **zero** Google requests and no banner | **PASS** |
| 5 | Corrupt stored record | `'{not-json'` in `localStorage` ⇒ banner shown, analytics not loaded, value not rewritten, **no uncaught exception** | **PASS** |
| 6 | Accept | stored `analytics:true, marketing:false`; `consent update` has `analytics_storage:'granted'` and all three ad signals `'denied'`; exactly **1** gtag script tag, **1** config command, **1** network request; an extra loader call adds nothing | **PASS** |
| 7 | Withdrawal | reopen control opens the dialog with "Retirar consentimiento"; after clicking: key removed, **seeded `_ga` + `_ga_LE6ETPWL23` deleted** (2 → 0), last consent command is `update` with analytics/ad denied, next page load makes zero Google requests | **PASS** |
| 8 | `generate_lead` on failure | API stubbed `500` ⇒ 1 POST, **0** events | **PASS** |
| 9 | `generate_lead` on success | API stubbed `201` ⇒ 1 POST, **1** event, params exactly `form_type`/`service_category`/`source_page` (`contact`, `software-a-medida`, `/contacto`), serialized payload contains none of the submitted name/email/phone/company/message; rapid double click ⇒ 1 POST, 1 event | **PASS** |
| 10 | Success without consent | after `Rechazar`, a confirmed `201` fires 1 POST and **0** events | **PASS** |
| 11 | Keyboard | focus lands inside the dialog on open; 8 consecutive `Tab` presses never leave it; focused control has a computed outline; `Escape` closes without granting | **PASS** |
| 12 | Mobile 390×844 | bar height ≤ 35 % of viewport, does not intersect the page `H1`, dialog still named | **PASS** |
| 13 | Mobile 360×640 | same checks | **PASS** |
| 14 | Hydration | no `NG0xxx` console/hydration error across the whole run | **PASS** |

### Matrix continuation — required checks that are **not** fully exercised

These four required checks are part of the same matrix; they are listed separately so their status
cannot be mistaken for a generic PASS.

| Required check | Result | Honest status |
|---|---|---|
| **Custom selection saved end-to-end** (toggle Analítica on, save) | **PARTIAL** | The toggles render unchecked, and `saveSelection()` + `createConsentRecord`/`consentSignals` are unit-tested, but the browser suite does not click a toggle and save it. **Not exercised in a browser.** |
| **Screen reader announcement** | **NOT EXERCISED** | No screen reader (NVDA/JAWS/VoiceOver) was driven. Semantics were verified syntactically (role, name, description, focus order); real AT output is unverified. |
| **Returning visitor with a valid granted record across a full reload** | **PARTIAL** | Sub-test "accept…" asserts the stored grant and a single tag load in the same session; the reload-with-grant path is unit-tested, not exercised as its own browser sub-test. |
| **Marketing ("Publicidad") toggle → ad signals `granted`** | **NOT EXERCISED** | Unit-tested only (`consent-state.ts` `consentSignals`); never driven in a browser. |

---

## 10. Commands and real output

Run from the repository root on 2026-11-05, against a local SSR build. Quoted verbatim (tail lines
of one full run; the per-test timings vary between runs, the pass counts did not).

```
$ npm run build:web
Application bundle generation complete. [24.095 seconds] - 2026-11-05T01:06:58.715Z
▲ [WARNING] src/app/site/pages/home-page.component.css exceeded maximum budget. Budget 6.00 kB was not met by 646 bytes with a total of 6.65 kB.
Output location: C:\Users\Admin\Documents\workspace\webtecnoria\apps\web\dist
→ exit 0  (the CSS warning pre-exists this work package)

$ npm run test:seo
SEO checks passed: 33 public routes, JSON-LD, 404/301, cache and sitemap.
→ exit 0  (33 = previous 32 + /politica-de-cookies; sitemap.xml has 33 <loc> entries)

$ npm run test:consent
ℹ tests 11
ℹ pass 11
ℹ fail 0
→ exit 0

$ npm run test:analytics
ℹ tests 12
ℹ pass 12
ℹ fail 0
→ exit 0

$ npm run test:browser
▶ consent mode v2 + accessible banner behave correctly in a real browser
  ✔ fresh load contacts no Google host and denies every signal (3479.9686ms)
  ✔ banner is a labelled dialog with three equal actions (226.5622ms)
  ✔ Escape closes the dialog without consent (363.5508ms)
  ✔ reject keeps every Google host blocked across routes and reload (10275.4098ms)
  ✔ corrupt stored record shows the banner instead of throwing (1014.4039ms)
  ✔ accept grants analytics only and loads gtag/js once (3503.5345ms)
  ✔ withdrawal removes the record, purges cookies and stops requests (2622.3333ms)
  ✔ generate_lead fires once and only after a confirmed lead (11651.5559ms)
  ✔ success without analytics consent sends no generate_lead (9437.6657ms)
  ✔ dialog traps focus, Escape does not grant, keyboard is usable (2992.4438ms)
  ✔ banner stays compact at 390x844 (2189.4577ms)
  ✔ banner stays compact at 360x640 (1591.9583ms)
  ✔ no hydration errors were reported (1.6720ms)
ℹ tests 14
ℹ pass 14
ℹ fail 0
→ exit 0
```

Test entry points: `package.json:27-29` (`test:consent`, `test:analytics`, `test:browser`), files
`scripts/tests/consent.test.mjs`, `scripts/tests/analytics-dispatch.test.mjs`,
`scripts/browser-consent.mjs`. The browser test builds nothing itself unless
`apps/web/dist/server/server.mjs` is missing; it serves that build on a free port behind a same-origin
stub proxy for `POST /api/v1/contact`, so a real form submission can be made deterministic.

---

## 11. What is NOT done (explicit)

| Item | Status |
|---|---|
| **Legal wording approved** | **No.** Banner text, cookie-policy copy and the privacy-policy update are interim. `cookies-page.component.ts` carries 5 `PENDING CONTROLLER/COUNSEL APPROVAL` markers; the controller/counsel must approve final wording. Engineering cannot approve it. |
| **Background `inert` while the dialog is open** | **No.** Tab is trapped and `aria-modal` is set, but the page behind is not inert (§7). |
| **Production verification** | **No.** The change is not deployed. Everything above was measured against a local SSR build with a stubbed API. Production smoke (network capture on `tecnoriasl.com`, cookie inspection, GA4 Realtime) is pending the deployment step and is owned by the deployment/verification tasks. |
| **Talkaris chat widget** | **No change.** The widget still loads `https://talkaris.com/widget/embed.js` on idle on every public page, and its frame calls `https://talkaris.com/api/v1/widget/config/<siteKey>` without consent (discovery §3). Out of scope for B1 by decision; documented finding for GROWTH-03. |
| **Google Identity Services on `/auth-login`** | **No change.** `accounts.google.com/gsi/client` still loads on view init of `/auth-login` and `/portal` (`auth-login.component.ts:75-83`, `:240`). Flagged during discovery; not gated in B1. |
| **`_gcl_au` / Ads linkage** | **Unknown.** Cannot be confirmed without GA4 admin access (see `GA4-CONFIGURATION.md` §2). The withdrawal purge covers `_gcl_*` if it ever appears. |
| **CMP certification** | **No.** No third-party CMP was added (and none is needed for basic mode with no ads); Google's certified-CMP requirement applies to EEA ad serving, which this site does not do. |

---

## 12. Files touched by this work package

Implementation (B1):

```
apps/web/src/index.html
apps/web/src/app/app.component.ts
apps/web/src/app/app.component.html
apps/web/src/app/app.routes.ts
apps/web/src/app/site/services/consent-state.ts            (new)
apps/web/src/app/site/services/consent.service.ts          (new)
apps/web/src/app/site/services/analytics-events.ts         (new)
apps/web/src/app/site/services/analytics.service.ts        (new)
apps/web/src/app/site/components/consent-banner.component.ts   (new)
apps/web/src/app/site/components/contact-form.component.ts
apps/web/src/app/site/components/contact-form.component.html
apps/web/src/app/site/components/site-footer.component.ts
apps/web/src/app/site/pages/cookies-page.component.ts      (new)
apps/web/src/app/site/seo-route-manifest.ts
apps/web/src/app/site/content/site-content.ts
apps/web/src/sitemap.xml
scripts/tests/consent.test.mjs                             (new)
scripts/tests/analytics-dispatch.test.mjs                  (new)
scripts/browser-consent.mjs                                (new)
package.json                                               (three test scripts)
```

`apps/api/**` was not modified: the extra form fields (`privacyAccepted`, `sourcePage`,
`idempotencyKey`, `_hp`) are ignored by the current zod schema (`apps/api/src/routes/v1/contact.ts:7-15`
strips unknown keys), so the web change can ship ahead of the API change without breaking submissions.

---

## 13. Repair round R3 (after the independent L4 review)

An independent review (Claude Sonnet 5.5, read-only shell) raised findings F-1, F-2, F-3, F-4, F-6,
F-7, F-8 and F-10. All were confirmed against execution and repaired by `backend-lead`. This section
supersedes any earlier statement that conflicts with it.

| Finding | Repair | Proof |
|---|---|---|
| **F-1** Rejecting after accepting kept `_ga*` for up to two years | `commit()` now purges when the resulting record has `analytics !== true` (rule kept pure as `shouldPurgeAnalyticsCookies`), so "Rechazar" and "Guardar selección sin analítica" behave like withdrawal | unit: accept→reject leaves no `_ga/_ga_<id>/_gid/_gcl_*` and record `false/false`; browser: both paths asserted against a real cookie jar |
| **F-2** `generate_lead` was pushed as a bare Array into `dataLayer`, which gtag is not documented to consume | dispatched via `window.gtag("event", name, params)`; documented fallback is the GTM-style object push; `AnalyticsService` passes `gtag` through | **captured hit**: `region1.google-analytics.com/g/collect?...&en=generate_lead&ep.form_type=contact&ep.service_category=software-a-medida&ep.source_page=%2Fcontacto` |
| **F-3** Focus died when the panel opened, so Escape and the Tab trap stopped working; focus was not restored | keydown handling moved to `document` (capture) while open; real focus move into the panel after "Configurar"; focus restored to the triggering control or `.consent-reopen` on close | browser: focus stays in the dialog after a real click, Tab cannot escape (including from `body`), Escape closes without granting, focus returns to `.consent-reopen` |
| **F-3 test weakness** the suite used JS `element.click()`, which never moves focus | clicks now go through `Input.dispatchMouseEvent`; keys through `Input.dispatchKeyEvent` | the same assertions fail against the old behaviour (focus falls to `body`) |
| **F-6** the "Publicidad" toggle could grant ad signals while the policy says no ads are used | advertising category removed from the UI; `saveSelection(analytics)` only; `marketing` stays `false`; ad signals are never granted | browser: exactly one checkbox, no "publicidad" text, ad signals `denied` after a custom selection |
| **F-7** the panel forced both toggles to `false` on open, contradicting the stored record | the control is initialised from `consent.isAnalyticsGranted()` | browser: after accepting, reopening shows the box checked |
| **F-4** the dialog neither mentioned the Talkaris widget nor linked the policy | interim disclosure option (a): the dialog states that the chat widget contacts talkaris.com on page load and links `/politica-de-cookies` | browser: the link exists and the text mentions talkaris.com |
| **F-8** the `domain=.tecnoriasl.com` purge branch was never exercised | purge logic extracted to pure helpers (`cookieDomainsForHost`, `analyticsCookieDeletionStrings`) and unit-tested with a simulated cookie jar, including a multi-label public-suffix guard (`example.co.uk` never yields `.co.uk`) | unit: dotted-domain and host-only cookies both removed on a `www.tecnoriasl.com` origin |
| **F-10** `source_page` was filtered by a permissive character class | enumerated against `PUBLIC_PATHS`, injected by `AnalyticsService`; anything else collapses to `/` | unit: `/cliente/ana-maria-perez`, `javascript:` and non-listed paths all become `/` |

Regression guards added to the browser suite: expired record → zero Google requests **and** dialog;
future-dated record → same; corrupt record → no throw, dialog shown; returning visitor with a valid grant
→ no dialog and exactly one `gtag/js`; custom selection → analytics granted with all ad signals denied.

### What changed in the "not done" list

- The advertising category no longer exists, so "the toggle could grant ad signals" is no longer a risk.
- The Talkaris widget still loads before consent, but the dialog now discloses it and links the policy;
  gating it remains an open product decision (GROWTH-03), not a silent omission.
- Cookie retention on rejection is fixed; the earlier statement that only explicit withdrawal purged
  cookies is obsolete.
- `source_page` is now an enumerated value, not a filtered string.

