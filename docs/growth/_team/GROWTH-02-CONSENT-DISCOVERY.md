# GROWTH-02-CONSENT-DISCOVERY — Cookie, storage and consent state of tecnoriasl.com

- **Task:** `t2` / **A2** — WAVE A discovery: privacy, consent and storage state
- **Auditor:** `privacy-consent` (Privacy & consent engineer)
- **Date:** 2026-11-05 (Europe/Madrid)
- **Method:** READ-ONLY. Repository reads (`read`/`grep`/`glob`), external HTTPS probes against
  `https://tecnoriasl.com` and `https://talkaris.com`, and inspection of the **production**
  JavaScript bundles actually served. No build, no deploy, no server filesystem write, no service
  restart, no configuration change. The only file written by this task is this document.
- **Scope:** storage inventory, third-party origins and their timing, SSR-safe insertion points for a
  consent UI, current legal-page claims vs. actual behaviour, and the concrete AEPD / Google Consent
  Mode v2 requirements.
- **Non-goals:** implementing the banner, writing legal copy, approving legal text. Those belong to
  B1 and to the controller / counsel (see §6.4 and §9).

---

## 1. Executive summary

1. **There is no consent mechanism of any kind.** Production HTML contains **zero** occurrences of
   `consent` and **zero** occurrences of `cookie`; the shipped `main-*.js` bundle contains **zero**
   occurrences of `consent`, `gtag`, `dataLayer`, `localStorage` or `sessionStorage`. There is no
   banner, no preferences panel, no consent record, no withdrawal path.
2. **GA4 loads and fires before any choice.** `apps/web/src/index.html:49` loads
   `https://www.googletagmanager.com/gtag/js?id=G-LE6ETPWL23` in `<head>` (async) and
   `apps/web/src/index.html:50-55` immediately runs `gtag('config','G-LE6ETPWL23')`. No
   `gtag('consent','default',…)` precedes it. Consequence: a request to Google, the standard GA4
   cookies (`_ga`, `_ga_LE6ETPWL23`) and a `page_view` hit happen on first load, for every route,
   without consent.
3. **The chat widget is a real third-party origin, not the same-origin proxy the repo documents.**
   The production environment chunk (`chunk-CQ4UNF2Y.js`, served) contains
   `chatWidgetBaseUrl:"https://talkaris.com/widget/"` and
   `chatWidgetApiBaseUrl:"https://talkaris.com/api"`, i.e. `apps/web/src/environments/environment.prod.ts:5-6`
   as built. `docs/DEPLOYMENT-SSR.md:13` and `infra/nginx/tecnoria.conf:69-85` describe same-origin
   `/chat-widget/` + `/chat-api/` proxying (and that proxy does work — verified), but the shipped app
   does **not** use it. Every public page therefore mounts a `talkaris.com` iframe and issues a
   `GET https://talkaris.com/api/v1/widget/config/tecnoria-public-site-key` ~2.5–3 s after load,
   with no interaction and no consent.
4. **Only two first-party cookies are possible today:** the API session cookie
   `tecnoria_session` (httpOnly, `SameSite=Lax`, 8 h, set only on login) and the GA4 `_ga*` cookies
   (first-party, set by Google's script on our origin). Public pages set **no** server cookie
   (`Set-Cookie` absent on the observed responses).
5. **No cookie policy page and no cookie-policy route exist.** `apps/web/src/app/app.routes.ts`
   only has `politica-de-privacidad` (`:611-617`). The privacy page
   (`apps/web/src/app/site/pages/privacy-page.component.ts:28-42`) describes processing **only** for
   "datos enviados desde los formularios de contacto"; it does not mention analytics, the chat
   widget, Google login, third parties, international transfers or cookies. It is also the only
   stated rights channel, and it omits the rights of objection and portability.
6. **Cloudflare injects its own first-party-path script** for email obfuscation
   (`/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js`, `data-cfasync="false"`), plus
   `NEL`/`Report-To` reporting to `a.nel.cloudflare.com`. Both are Cloudflare-controlled: we cannot
   remove the injection from the origin; only the Cloudflare zone setting can.
7. **The consent UI can be SSR-safe and LCP-neutral** with two touch points: the **default + loader
   gate** must stay in `apps/web/src/index.html` (replacing `:49-55`), because that HTML is what the
   SSR server renders as `index.server.html` (`apps/web/server.ts:283`, `:470-489`); the **banner UI**
   belongs in `apps/web/src/app/app.component.html:3`, the only global outlet, mounted with
   `ngSkipHydration` and client-only state resolution (detail in §4).

Verdict of this discovery: the current state is **not consent-compliant** and the privacy
information is **materially incomplete**. Nothing in this document certifies legal compliance; §6.4
lists what the controller or counsel must approve.

---

## 2. Storage inventory (cookies, localStorage, sessionStorage, IndexedDB)

### 2.1 What is actually set today

| # | Name | Type / scope | Set by (exact code path) | When | Class |
|---|---|---|---|---|---|
| S-1 | `tecnoria_session` | First-party cookie, `HttpOnly`, `SameSite=Lax`, `Secure` in production, `Max-Age` 8 h, `Path=/` | **Set:** `apps/api/src/routes/v1/auth.ts:390-396` (`res.cookie(env.COOKIE_NAME, token, { httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "lax", maxAge: 1000*60*60*8, path: "/" })`). Name default: `apps/api/src/config/env.ts:10` (`COOKIE_NAME: z.string().default("tecnoria_session")`). **Read:** `apps/api/src/auth/middleware.ts:16` and `:54`; parser registered at `apps/api/src/index.ts:22`. **Cleared:** `apps/api/src/routes/v1/auth.ts:306-311` (logout). **SSR read (not set):** `apps/web/server.ts:386-389` → `fetchSessionUser` `:136-156`; browser-side forwarding of the header during SSR via `apps/web/src/app/infrastructure/http/ssr-cookie.interceptor.ts:7-16` | Only on successful login (`/api/v1/auth/login`) or refresh (`auth.ts:288-303`); never on anonymous page loads | **Strictly necessary** (authentication/security) — exempt from consent |
| S-2 | `_ga` | First-party cookie, 2 years | Not set by our code. Set by the GA4 library loaded at `apps/web/src/index.html:49`; configured at `:50-55`. GA4's own documentation of the pair: <https://support.google.com/analytics/answer/11397207?hl=en> | On first page load, **before any choice** | **Analytics** — consent required |
| S-3 | `_ga_LE6ETPWL23` (pattern `_ga_<container-id>`, 2 years) | First-party cookie, 2 years | Same as S-2 (session-state cookie for measurement ID `G-LE6ETPWL23`) | On first page load, **before any choice** | **Analytics** — consent required |
| S-4 | `_gcl_au` (conditional) | First-party cookie | Google Ads / GA4-Ads link. Documented as "additional cookies" once a GA4 property is linked to a Google Ads account: <https://support.google.com/analytics/answer/11397207?hl=en> | On load, **only if** the property is Ads-linked | **Marketing** — consent required. **Status: unknown**, cannot be verified without GA4 admin access (blocked, `docs/growth/GROWTH-02-SPEC.md:140`) |
| S-5 | `tecnoria-theme` | localStorage key (JSON/string) | **Read:** `apps/web/src/app/core/admin/system/settings-page.component.ts:153`; **Write:** `:199` | Only in the private admin settings page (no public route renders this component) | **Strictly necessary / preference** (theme), admin-only |

### 2.2 What is contacted or mounted but sets no storage of its own (verified)

| # | Item | Evidence | Class |
|---|---|---|---|
| S-6 | Talkaris chat widget: `embed.js` | `https://talkaris.com/widget/embed.js?v=20260320-widget-runtime-v8` (HTTP 200) contains **no** `cookie`, `localStorage`, `sessionStorage`, `indexedDB` API usage. It only creates an `<iframe>` pointing at `<widgetBaseUrl>frame.html` | Functional (chat). Vendor storage, if any, is on the `talkaris.com` origin — third-party context |
| S-7 | Talkaris widget frame (`https://talkaris.com/widget/frame.html`) | Inline JS only; no storage APIs; `init()` issues `GET ${apiBase}/v1/widget/config/<siteKey>` on mount (`:48103` region of the file), conversation is created by `POST /v1/widget/sessions` in `ensureSession()` — **user action**, and events via `logEvent()` — user action. State (`conversationId`) is in memory | Functional (chat); the config `GET` is an automatic third-party contact at idle |
| S-8 | Talkaris widget API | `GET https://talkaris.com/api/v1/widget/config/tecnoria-public-site-key` → HTTP 200, `Content-Type: application/json`, **no `Set-Cookie`** observed. Conversation/session POSTs were **not** exercised (would create real data) | Functional |
| S-9 | Google Identity Services | `apps/web/src/app/auth/auth-login/auth-login.component.ts:240` (`script.src = "https://accounts.google.com/gsi/client"`), triggered automatically from `ngAfterViewInit` → `setupGoogleLogin()` (`:75-83`, `:106-120`). Only on `/auth-login` and `/portal` (both render `AuthLoginComponent`) | Functional/security (optional login method). Its vendor-managed state (e.g. FedCM/`accounts.google.com` cookies) is **not** in our code and must be confirmed with a browser network trace in V1 |
| S-10 | Cloudflare Email Address Obfuscation | Production HTML: `<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js">` and two `<span class="__cf_email__" data-cfemail="…">[email protected]</span>` plus rewritten `href="/cdn-cgi/l/email-protection#…"` | Strictly necessary (delivers the address); **Cloudflare-injected, cannot be removed from our code** |
| S-11 | Cloudflare bot-management cookie `__cf_bm` (conditional) | **Not observed**: the production homepage response carried **no `Set-Cookie`** at all. It appears only when Cloudflare Bot Fight Mode / Managed Challenge applies to a request | Strictly necessary (security). Cloudflare-managed |

### 2.3 Storage assets that exist but are not user storage (documented to avoid false positives)

- **No Service Worker / CacheStorage / IndexedDB** anywhere: `apps/web/ngsw-config.json` does not
  exist, and `grep` over `apps/web/src` for `ServiceWorker|serviceWorker|ngsw|caches.open|indexedDB`
  returns nothing.
- **`ng-state` inline JSON** (`<script id="ng-state" type="application/json">`) is Angular SSR
  transfer state embedded in the HTML, not a cookie or browser storage. On private routes it can
  carry the serialized session user; those responses are sent with `Cache-Control: no-store`
  (`apps/web/server.ts:482`). Not a consent item; a PII-in-HTML note for the security review.
- **`window.__TECNORIA_RUNTIME__`** (`apps/web/server.ts:478-483`) currently contains only
  `googleClientId` (public OAuth client id). Not personal data.

### 2.4 Residual verification for V1 (browser trace, CDP)

The following cannot be settled by static reading and must be captured with a real browser network +
storage trace in V1: exact GA4 cookie names/expiry actually issued (`_ga*`, `_gcl_au`), any
`accounts.google.com` state on `/auth-login`, and whether any Talkaris cookie appears on our origin
(it should not, since the widget is a `talkaris.com` iframe).

---

## 3. Third-party origin inventory and timing

Class legend: **FPC** = first-party-controlled (our code, our origin), **CF** = Cloudflare-injected
(our origin/path but Cloudflare-owned, not removable in code), **3P** = third-party vendor origin.

| Origin / URL | Class | Purpose | Trigger moment | Code path |
|---|---|---|---|---|
| `https://www.googletagmanager.com/gtag/js?id=G-LE6ETPWL23` | 3P (Google) | Loads the GA4 tag | **First paint** — `<script async>` in `<head>`, parse time of the document | `apps/web/src/index.html:49` |
| `https://*.google-analytics.com` (`region1.google-analytics.com`) + `gtag('config')` page_view | 3P (Google) | Analytics collection; `_ga` cookies | **First paint / immediately after** the tag loads — no consent gate | `apps/web/src/index.html:50-55`; GA4 automatic `page_view`: <https://support.google.com/analytics/answer/9234069?hl=en> |
| `https://talkaris.com/widget/embed.js` | 3P (Talkaris, our own product) | Chat widget loader | **Idle**: `requestIdleCallback(..., {timeout: 3000})`, or `setTimeout(2500)` fallback, on every public page | `apps/web/src/app/site/components/chat-widget-embed.component.ts:89-121`; URL built at `:177-181` from `environment.prod.ts:5` |
| `https://talkaris.com/widget/frame.html` (iframe) | 3P (Talkaris) | Chat UI | Immediately after `embed.js` executes (idle) | `chat-widget-embed.component.ts:174-198` + `embed.js` |
| `https://talkaris.com/api/v1/widget/config/<siteKey>` | 3P (Talkaris) | Widget configuration fetch | **Idle**, automatically, even if the visitor never opens the chat | `frame.html` `init()`; `environment.prod.ts:6` |
| `https://talkaris.com/api/v1/widget/sessions`, `/v1/widget/conversations/...` | 3P (Talkaris) | Creates the conversation, chat messages, handover | **User action** (open/send) | `frame.html` `ensureSession()` / `postJson()` |
| `https://accounts.google.com/gsi/client` | 3P (Google) | Google Identity Services button | **On view init of `/auth-login` and `/portal`** (microtask after `ngAfterViewInit`), i.e. not a user action | `apps/web/src/app/auth/auth-login/auth-login.component.ts:75-83`, `:240` |
| `/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js` | **CF** | Decodes obfuscated `mailto:`/email spans | **Document parse**, before the app bundles (`data-cfasync="false"`) | Injected by Cloudflare into every HTML response; no repo code |
| `https://a.nel.cloudflare.com/report/v4?...` | **CF** | NEL (Network Error Logging) reports | Browser-side error reporting; headers `NEL` + `Report-To` on every response | Cloudflare response headers (observed on `https://tecnoriasl.com/`) |
| Same-origin `/api/*`, `/uploads/*`, `/chat-api/*`, `/chat-widget/*` | FPC | Our API, uploads and the same-origin chat proxies (nginx `infra/nginx/tecnoria.conf:69-85`) | On demand | `apps/web/server.ts:302-303`; app repositories under `apps/web/src/app/infrastructure/repositories/api/` |

Notes that matter for the consent design:

- **No external fonts, images, scripts or CDNs** are referenced by the site itself: the only hosts in
  `apps/web/src` are `tecnoriasl.com` (`site-content.ts:1`), `accounts.google.com`
  (`auth-login.component.ts:240`) and `talkaris.com` (`environment.prod.ts:5-6`). No `<iframe>`
  embeds other than the chat widget.
- **The same-origin chat proxy exists and works** — `https://tecnoriasl.com/chat-widget/embed.js` →
  200 and `https://tecnoriasl.com/chat-api/health` → 200 — but the shipped bundle does not use it.
  Whether to switch to it is a B1 decision; it changes the *origin* of the requests, **not** the fact
  that Talkaris is a separate processor/controller.
- **Cloudflare's own injections cannot be removed by us**: the email-decode script and NEL reporting
  are zone-level features. They are strictly-necessary/technical and outside the consent banner's
  control; the cookie table must nevertheless describe them.

---

## 4. Where the consent UI can live (SSR analysis and exact insertion points)

### 4.1 How the HTML is produced (facts)

- `apps/web/src/index.html` is the single page template (`apps/web/angular.json:19`), with SSR entry
  `apps/web/server.ts` (`angular.json:35-38`).
- The SSR server builds `index.server.html` from that template (`apps/web/server.ts:283`) and renders
  each request with `CommonEngine.render(...)` (`:470-489`), injecting
  `window.__TECNORIA_RUNTIME__` before `</head>` (`:478-483`) and sending `Cache-Control: no-store`
  (`:482`). **Therefore the GA tag and anything else in `index.html` is present in every
  server-rendered response** — verified against the live site.
- Hydration is enabled globally: `provideClientHydration()` at `apps/web/src/app/app.config.ts:17`.
  Any DOM the client produces that differs from the SSR DOM raises a hydration mismatch, so the
  consent component must be **deterministic on the server** or explicitly excluded with
  `ngSkipHydration`.
- The repo already shows the SSR-safe pattern in use: `isPlatformBrowser` guards at
  `apps/web/src/app/app.component.ts:21` and `apps/web/src/app/site/components/chat-widget-embed.component.ts:90`.
  Angular 20.3 also provides `afterNextRender`, the preferred hook for browser-only reads.
- `apps/web/src/app/app.component.html` contains only `<router-outlet></router-outlet>` (line 3), so it
  is the **only** global mount point. `SiteLayoutComponent`
  (`apps/web/src/app/site/components/site-layout.component.ts:19-31`) wraps **only** the public site;
  it is not used by `/auth-login`, `/dashboard` or `/portal` (`apps/web/src/app/app.routes.ts:178-476`).

### 4.2 Recommended insertion points

**IP-1 — Consent defaults and the analytics loader gate: `apps/web/src/index.html`, replacing lines
49-55.** This is mandatory and cannot be done in Angular. The two Google scripts are inline in the
document head; no Angular code can precede them on a fresh page load, and the same bytes are baked
into `index.server.html` (`server.ts:283`). The replacement must, in this order:

1. define `window.dataLayer` / `gtag` and call `gtag('consent','default', { ad_storage:'denied',
   ad_user_data:'denied', ad_personalization:'denied', analytics_storage:'denied',
   wait_for_update: 500 })` — no external request;
2. expose a single `window.__tecnoriaLoadAnalytics()` that injects the
   `googletagmanager.com/gtag/js` script and then calls `gtag('config','G-LE6ETPWL23')`;
3. never call that loader unless analytics consent has been granted.

Everything in IP-1 executes only in the browser (inline scripts are not executed by
`CommonEngine.render`), so it is SSR-safe by construction. Recommended over "keep `gtag('config')`
and rely on consent defaults alone": with the deferred loader, **no request to Google leaves the
page before consent** (FR-002), whereas basic consent mode still fetches `gtag/js` at first paint.

**IP-2 — Banner / preferences / withdrawal UI: `apps/web/src/app/app.component.html`, a new
standalone component after line 3 (`<router-outlet></router-outlet>`).** Justification:

- It is the only outlet that covers **every** route, including the private ones that still receive
  the GA tag from `index.html` (the footer-only placement would leave `/auth-login`, `/dashboard` and
  `/portal` without any withdrawal control).
- SSR-safety: initialize the component state to "undecided/hidden", and resolve the stored decision
  only in `afterNextRender()` or under `isPlatformBrowser` (pattern already used at
  `app.component.ts:21` and `chat-widget-embed.component.ts:90`); never touch `window`,
  `localStorage` or `document` during render. Add `ngSkipHydration` on the host element
  (supported in Angular 20.3) so the client-rendered visibility cannot collide with the SSR DOM.
- LCP/CLS: render the banner as a **fixed-position overlay** (out of normal flow), as the widget
  loader already does (`position: fixed` in `talkaris.com/widget/embed.js`). A fixed overlay cannot
  reflow the document, so it cannot shift the LCP element; the same reasoning is demanded by
  `NFR-001` in `docs/growth/GROWTH-02-SPEC.md:106`. Keep it compact (a bottom bar, not a full-page
  modal) and never render it above the hero content.
- Because the analytics loader is deferred to consent **and** the banner is the only thing that can
  grant it, the banner appearing a few hundred ms after hydration is harmless: nothing is measured
  before the choice either way.

**IP-3 — Permanent withdrawal entry point: `apps/web/src/app/site/components/site-footer.component.ts:90-97`**
(the "Accesos" list, which already holds the privacy link at `:94`). Add a "Cookies" link next to it.
Because the footer is public-site-only, IP-2 must additionally expose the withdrawal control on
private routes (a small persistent "Cookies" control rendered by the global component, or an entry in
the admin/portal chrome). AEPD requires withdrawal to be as easy as granting
(<https://www.aepd.es/documento/ps-00531-2024.pdf>).

**IP-4 — New cookie-policy route (B1, outside A2's write scope).** `apps/web/src/app/app.routes.ts`
(insert next to `:611-617`), plus `apps/web/src/app/site/seo-route-manifest.ts:32-33`
(`PUBLIC_PATHS`), plus `apps/web/src/sitemap.xml`, plus the `mapa-web` groups. This is not optional
plumbing: `scripts/seo-check.ts:211-213` asserts **every** `PUBLIC_PATHS` entry appears in
`sitemap.xml`, and `apps/web/server.ts:450-461` marks non-public paths as 404/`noindex`, so a cookie
page added to routing alone would be a soft-404. `NFR-003` (`docs/growth/GROWTH-02-SPEC.md:108`)
expects `npm run test:seo` to keep passing 32/32.

### 4.3 Rejected alternatives

| Alternative | Why not |
|---|---|
| Put the banner in `SiteLayoutComponent` (`site-layout.component.ts:19-31`) | Covers only public routes; the GA tag is global. Also the widget component there would be a second, unrelated mount |
| Add the banner markup directly in `index.html` | Works and is zero-risk for hydration, but duplicates state/logic outside Angular, complicates i18n/a11y consistency and testing with the rest of the codebase. Acceptable fallback only |
| Rely on `gtag('consent','default')` alone without deferring the loader | Leaves a `googletagmanager.com` request before consent, which FR-002 explicitly forbids |
| CSS-animated banner in normal flow | Would shift layout and put LCP at risk (NFR-001) |

---

## 5. Existing legal pages vs. actual behaviour

### 5.1 What exists

| Page | Route | File |
|---|---|---|
| "Política de privacidad" | `/politica-de-privacidad` | `apps/web/src/app/site/pages/privacy-page.component.ts` (declared in `apps/web/src/app/app.routes.ts:611-617`, linked from `site-footer.component.ts:94` and `contact-form.component.html:168`) |
| "Política de cookies" | **does not exist** — no route, no component, no link | `apps/web/src/app/app.routes.ts` (whole file) |

The privacy page has four sections: *Responsable del tratamiento* (`:27-30`), *Finalidad* (`:31-34`),
*Conservación* (`:35-38`), *Derechos* (`:39-42`).

### 5.2 Findings — claims that are false, incomplete or unsupported

| ID | Severity | Finding | Evidence |
|---|---|---|---|
| **F-01** | **High** | The privacy page scopes the controller's processing to *"los datos enviados desde los formularios de contacto"*. That statement is **factually wrong by omission**: on every page load the site sends data to Google (GA4 hit + `_ga` cookies), mounts a `talkaris.com` iframe that fetches widget configuration, and on the login page loads Google Identity Services. None of those channels is disclosed, nor are the recipients, purposes, legal bases, retention or international transfers | `apps/web/src/app/site/pages/privacy-page.component.ts:28-34`; §2–§3 above |
| **F-02** | **High** | **No cookie policy and no consent mechanism exist**, while non-exempt analytics cookies are set on first load. There is no first-layer notice, no accept/reject choice, no configuration panel, no consent record, and **no withdrawal path** (AEPD requires withdrawal to be as easy as granting) | `apps/web/src/index.html:49-55`; production HTML has 0 occurrences of `cookie`/`consent`; `apps/web/src/app/app.routes.ts` |
| **F-03** | **High** | GA4 is initialised and a `page_view` is dispatched **before** any consent, including for EEA visitors — the first thing every visitor's browser does after parsing the head | `apps/web/src/index.html:49-55`; live HTML contains both scripts; `gtag('config')` immediately follows |
| **F-04** | **Medium** | The chat widget contacts a third-party origin (`talkaris.com`) at idle on every public page with **no interaction and no disclosure**. The privacy page never mentions the chat, its processor or the transfer | `apps/web/src/app/site/components/chat-widget-embed.component.ts:89-121`, `:174-198`; `environment.prod.ts:5-6`; live `chunk-CQ4UNF2Y.js` |
| **F-05** | **Medium** | **Documentation vs. production mismatch:** `docs/DEPLOYMENT-SSR.md:13` and `infra/nginx/tecnoria.conf:69-85` state that the chat is published same-origin through `/chat-widget/` and `/chat-api/` "avoiding extra subdomains", but the deployed bundle calls `https://talkaris.com/…`. Either the env file or the deployment expectation is wrong; the shipped behaviour is the one that matters for consent and for the cookie table | `environment.prod.ts:5-6`; served `chunk-CQ4UNF2Y.js`; `https://tecnoriasl.com/chat-widget/embed.js` returns 200 (proxy unused by the app) |
| **F-06** | **Medium** | The rights section lists only *acceso, rectificación, supresión o limitación* and omits *oposición* and *portabilidad*, plus the right to withdraw consent and to complain to the AEPD. Legally imprecise for a GDPR notice | `privacy-page.component.ts:39-42` |
| **F-07** | **Low** | No mention anywhere of the identity/contact details of the controller beyond the brand name, no DPO/contact, no retention periods expressed concretely, no legal bases | `privacy-page.component.ts:28-38` |
| **F-08** | **Low** | The privacy page's own claims cannot be independently checked against a cookie table: there is no page where a visitor can see which cookies/storage exist | §5.1 |

Not a finding (already known and correctly stated elsewhere): `docs/growth/ANALYTICS-MEASUREMENT.md:15`
and `docs/growth/SECURITY-REVIEW.md:29` already record "no banner, no consent mode". This document
confirms them against production and adds the storage/third-party detail.

---

## 6. What AEPD and Google concretely require (technical requirements, not legal copy)

### 6.1 AEPD / Spanish regime — the binding points

| Requirement | Concrete meaning for this site | Official source |
|---|---|---|
| Prior, informed, unambiguous consent for non-exempt storage | No `_ga*` cookie and no analytics request before an affirmative action. "Continue browsing" is **not** valid consent; cookie walls that offer no alternative are **not** allowed | AEPD, *La AEPD actualiza su Guía sobre el uso de cookies*: <https://www.aepd.es/es/prensa-y-comunicacion/notas-de-prensa/aepd-actualiza-guia-cookies> |
| Two-layer information | Layer 1 (banner) must identify the controller, the purposes, the type of cookies (own/third-party), and explain how to accept, configure **and** reject, with a link to layer 2 (the cookie policy). The first layer must not be a mere "we use cookies, OK" | AEPD resolution AI-00289-2023 (applies art. 22.2 LSSI and the Cookies Guide): <https://www.aepd.es/documento/ai-00289-2023.pdf> |
| Reject must be as easy as accept | A visible reject-all control in a single step, not only inside a settings panel | AEPD resolution AI-00289-2023: <https://www.aepd.es/documento/ai-00289-2023.pdf> |
| Withdrawal at any time, as easy as consent | Permanent access to the settings/withdrawal control; the same number of steps | AEPD resolution PS-00531-2024: <https://www.aepd.es/documento/ps-00531-2024.pdf> |
| Cookie policy content and duration/refresh criteria | Cookie table (name, owner, purpose, expiry), purposes, identification of third parties, instructions to revoke, and renewal of consent | AEPD, *Guía sobre el uso de cookies*: <https://www.aepd.es/guias/guia-cookies.pdf> |
| Exemption analysis | Only storage strictly necessary for providing the service (session, security, user-requested preference, load balancing) is exempt. GA4 analytics on this site is **not** exempt (it is not needed to deliver the page and is not limited to aggregate, non-identifying statistics). The chat and Google login are optional features requested by the user, which is a different legal argument than "strictly necessary for the page" | AEPD, *Guía sobre el uso de cookies*: <https://www.aepd.es/guias/guia-cookies.pdf> |

Legal basis framing (for counsel, not engineering): LSSI art. 22.2 for storage/device access, GDPR
art. 6.1.a for the processing that depends on the choice. Both are cited by AEPD in the documents
above; engineering does not get to decide the legal basis.

### 6.2 Google Consent Mode v2 — the four signals and the sequence

| Requirement | Concrete meaning here | Official source |
|---|---|---|
| Four parameters | `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization` | <https://developers.google.com/tag-platform/security/guides/consent> |
| Default **denied** before any Google tag runs | `gtag('consent','default', { ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied', analytics_storage:'denied' })` placed **before** the tag/`config` | <https://developers.google.com/tag-platform/security/guides/consent> |
| Update only after an explicit choice | `gtag('consent','update', { analytics_storage:'granted' })` on accept; `ad_*` stay `denied` unless a separate ads consent model exists (FR-006 of the spec forbids bundling) | <https://developers.google.com/tag-platform/security/guides/consent> |
| Async/banner race | `wait_for_update` (ms) if the banner can load after the tags | <https://developers.google.com/tag-platform/security/guides/consent> |
| Basic vs advanced mode | This milestone specifies **basic** mode: with consent denied, Google tags do not send measurement hits. Advanced mode (cookieless pings) is **out of scope** | <https://developers.google.com/tag-platform/security/guides/consent> |
| EEA + CMP | Google additionally requires a Google-certified CMP for personalised ads / ad measurement in the EEA. This site runs no ads today, so the Ads-related consequence is minimal, but the CMP statement matters if Ads is ever linked | <https://support.google.com/google-ads/answer/14546213?hl=en> |
| What GA4 sends and stores | `page_view` is collected by default via enhanced measurement; GA4 stores `_ga` (2 years) and `_ga_<container-id>` (2 years), and adds Ads cookies only when an Ads link exists | <https://support.google.com/analytics/answer/9234069?hl=en> · <https://support.google.com/analytics/answer/11397207?hl=en> |
| Consent-mode effect on GA4 reporting | Denied analytics consent prevents measurement; behaviour/consent-mode reporting in GA4 | <https://support.google.com/analytics/answer/9976101?hl=en> |

### 6.3 Technical requirements for B1 (derived, testable)

| ID | Requirement | Traces to |
|---|---|---|
| TR-1 | `gtag('consent','default', …)` with the four parameters `denied` exists in `index.html` **before** any Google script tag is added or executed | FR-001, §6.2 |
| TR-2 | No request to `googletagmanager.com`, `google-analytics.com`, `doubleclick.net` or `google.com` before analytics consent. Enforced by the deferred loader (IP-1), not only by consent defaults | FR-002 |
| TR-3 | Accept / Reject / Configure buttons with equal visual prominence; "Reject" completes in one step from layer 1 | FR-003, AEPD AI-00289-2023 |
| TR-4 | Optional categories start unchecked; accepting analytics does not set `ad_*` to granted | FR-004, FR-006 |
| TR-5 | Decision persisted first-party (e.g. `localStorage` key documented in the cookie table) with timestamp + version, survives navigation/refresh | FR-005 |
| TR-6 | A permanently reachable withdrawal/reopen control exists on **all** routes, not only the public footer; changing the choice takes effect immediately (reload or live teardown of GA4) | FR-005, AEPD PS-00531-2024 |
| TR-7 | Cookie policy route exists, is in `PUBLIC_PATHS`, `sitemap.xml` and the footer, contains the full cookie table (including `tecnoria_session`, `_ga*`, `__cf_bm`, email-decode script, chat and Google login) and the withdrawal instructions | §5, AEPD guide, §4.2 IP-4 |
| TR-8 | The chat widget is gated: no `talkaris.com` request before consent (or before an explicit click-to-load), and the widget is not mounted on private routes | §3, FR-002 spirit |
| TR-9 | Google Identity Services loads only on an explicit user action (click), not on page view | §3, minimisation; needs product decision |
| TR-10 | The banner is SSR-safe (no `window`/`localStorage` during server render), uses `ngSkipHydration` or deterministic server markup, and is `position: fixed` so it cannot shift layout | §4.2, NFR-001 |
| TR-11 | Acceptance/rejection is verifiable in a browser trace: with "reject", the network panel shows **no** Google or Talkaris request on the public pages; with "accept", GA4 hits appear and `_ga*` exist | FR-001–FR-003, V1 |
| TR-12 | `npm run test:seo` still passes and the schema/route counts are updated when a cookie page is added | NFR-003, `scripts/seo-check.ts:211-213` |

### 6.4 Requires controller / counsel approval (do not decide in engineering)

1. **Legal copy** of the cookie policy, its first layer and the privacy-policy update (F-01, F-06,
   F-07) — approval is listed as externally blocked in `docs/growth/GROWTH-02-SPEC.md:73-74,142`.
2. **Controller identity and contact details**, DPO/contact address, and the actual retention periods.
3. **International transfers and processors**: Google Ireland/LLC (GA4), Talkaris (separate product),
   Cloudflare (CDN/bot management/email obfuscation). Whether Talkaris acts as processor for us or as
   an independent controller must be a contract/legal decision.
4. **Exemption position**: whether the chat and Google login are treated as user-requested optional
   features (loaded only on demand) or as strictly necessary. This changes TR-8/TR-9 from "nice to
   have" to mandatory gating.
5. **Consent renewal interval** and whether the chat may be loaded before consent with a
   "click-to-load" pattern instead of a consent signal.
6. **Whether `ad_*` signals are needed at all** (no ads today). Keeping them permanently `denied` is
   the conservative engineering default and needs legal acknowledgement, not invention.

---

## 7. Implementation impact map (for B1; read-only here)

| File | Change | Owner |
|---|---|---|
| `apps/web/src/index.html:49-55` | Consent default + deferred GA4 loader | B1 |
| `apps/web/src/app/app.component.html:3` | Mount global consent component | B1 |
| `apps/web/src/app/site/components/site-footer.component.ts:90-97` | "Cookies" link in *Accesos* | B1 |
| `apps/web/src/app/app.routes.ts:611-617` | New `/politica-de-cookies` route | B1 |
| `apps/web/src/app/site/pages/cookies-page.component.ts` (new) | Cookie policy page | B1 + counsel text |
| `apps/web/src/app/site/seo-route-manifest.ts:32-33` | Add path to `PUBLIC_PATHS` | B1 |
| `apps/web/src/sitemap.xml` | Add the URL (else `test:seo` fails) | B1 |
| `apps/web/src/app/site/content/site-content.ts` (`sitemapGroups`) | Add to *Mapa web* | B1 |
| `apps/web/src/app/site/components/chat-widget-embed.component.*` | Consent/click-to-load gate + optional same-origin proxy decision (F-05) | B1 |
| `apps/web/src/app/site/services/consent.service.ts`, `analytics.service.ts` (new) | State, persistence, `trackLead()` | B1 |
| `apps/web/src/environments/environment.prod.ts:5-6` | Decide: `talkaris.com` vs same-origin `/chat-widget/` | B1 + infra |
| `docs/growth/*` legal/measurement docs | Update claims after implementation | D1 / X4 |

Nothing above was modified by this task.

---

## 8. Evidence (what was actually run)

Repository reads (read-only): `apps/web/src/index.html`, `apps/web/src/app/app.component.{ts,html}`,
`apps/web/src/app/app.config.ts`, `apps/web/src/app/app.routes.ts`,
`apps/web/src/app/site/components/{site-layout,site-footer,chat-widget-embed}.component.ts`,
`apps/web/src/app/site/pages/privacy-page.component.ts`, `apps/web/src/app/site/seo-route-manifest.ts`,
`apps/web/src/app/auth/auth-login/auth-login.component.ts`,
`apps/web/src/app/core/admin/system/settings-page.component.ts`,
`apps/web/src/app/infrastructure/http/ssr-cookie.interceptor.ts`,
`apps/web/src/environments/environment{,.prod}.ts`, `apps/web/server.ts`, `apps/web/angular.json`,
`apps/web/package.json`, `apps/api/src/{index.ts,config/env.ts,auth/middleware.ts,routes/v1/auth.ts}`,
`scripts/seo-check.ts`, `apps/web/src/sitemap.xml`, `docs/growth/GROWTH-02-{SPEC,TASKS}.md`,
`docs/DEPLOYMENT-SSR.md`, `infra/nginx/tecnoria.conf`, `docs/growth/ANALYTICS-MEASUREMENT.md`.

Production probes (external HTTPS from the auditor machine, 2026-11-05 ~00:51–01:10 CET):

| Probe | Result |
|---|---|
| `GET https://tecnoriasl.com/` | 200; `server: cloudflare`; `cache-control: no-store`; `x-content-type-options: nosniff`; `referrer-policy: strict-origin-when-cross-origin`; `x-frame-options: SAMEORIGIN`; `permissions-policy: camera=(), microphone=(), geolocation=()`; `strict-transport-security: max-age=15552000`; NEL/Report-To to `a.nel.cloudflare.com`; **no `Set-Cookie`** |
| Homepage HTML scan | `googletagmanager.com/gtag/js` script **present**; `gtag('config','G-LE6ETPWL23')` **present**; `consent` **0**; `cookie` **0**; `email-decode.min.js` **present**; `__cf_email__` **2**; `/cdn-cgi/l/email-protection#…` **present**; `data-cfasync` **1**; no Rocket Loader, no `cf-beacon`, no challenge platform |
| `GET /main-7FA6DAL5.js` | 116,438 bytes; `consent` 0; `gtag` 0; `dataLayer` 0; `localStorage` 0; `sessionStorage` 0 |
| `GET /chunk-CQ4UNF2Y.js` | `{production:!0,apiBaseUrl:"",chatWidgetEnabled:!0,chatWidgetBaseUrl:"https://talkaris.com/widget/",chatWidgetApiBaseUrl:"https://talkaris.com/api",chatWidgetSiteKey:"tecnoria-public-site-key",chatWidgetAssetVersion:"20260320-widget-runtime-v8"}` |
| `GET https://talkaris.com/widget/embed.js?v=20260320-widget-runtime-v8` | 200; no `cookie`/`localStorage`/`sessionStorage`/`indexedDB`; creates `<iframe>` → `frame.html` |
| `GET https://talkaris.com/widget/frame.html` | 200; inline JS; auto `GET ${apiBase}/v1/widget/config/<siteKey>`; `POST /v1/widget/sessions` in `ensureSession()`; no storage APIs |
| `GET https://talkaris.com/api/v1/widget/config/tecnoria-public-site-key` | 200 JSON; **no `Set-Cookie`** |
| `GET https://tecnoriasl.com/chat-widget/embed.js` | 200 (same-origin proxy works, unused by the app) |
| `GET https://tecnoriasl.com/chat-api/health` | 200 |
| `GET https://tecnoriasl.com/politica-de-privacidad` | 200 |
| Citation URL check | 200 for `aepd.es/guias/guia-cookies.pdf`, `aepd.es/es/prensa-y-comunicacion/notas-de-prensa/aepd-actualiza-guia-cookies`, `aepd.es/documento/ai-00289-2023.pdf`, `aepd.es/documento/ps-00531-2024.pdf`, `developers.google.com/tag-platform/security/guides/consent`, `support.google.com/google-ads/answer/14546213`, `support.google.com/analytics/answer/9234069`, `support.google.com/analytics/answer/11397207`, `support.google.com/analytics/answer/9976101` (a previously guessed `google-ads/answer/13554020` returned 404 and was **not** used) |

Write-scope check — `git status --short` **before** this task started:

```
$ git status --short
?? .serena/
```

`git status --short` **after** this task finished:

```
$ git status --short
?? .serena/
?? docs/growth/GROWTH-02-SPEC.md
?? docs/growth/GROWTH-02-TASKS.md
?? docs/growth/_team/GROWTH-02-CONSENT-DISCOVERY.md
?? docs/growth/_team/GROWTH-02-LEAD-DISCOVERY.md
?? specs/002-measurement-consent-lead-reliability/
```

Only **`docs/growth/_team/GROWTH-02-CONSENT-DISCOVERY.md`** was written by this task (that is the
single allowed write). The other new untracked paths appeared during the same window from the other
WAVE A / specification tasks running in parallel (`GROWTH-02-SPEC.md`, `GROWTH-02-TASKS.md`,
`specs/002-…` from the captain; `GROWTH-02-LEAD-DISCOVERY.md` from `backend-lead`), and `.serena/`
pre-existed. No tracked file was modified and nothing was committed.

---

## 9. Open items and risks

1. **V1 browser trace is mandatory** for §2.4 (`_ga*` names/expiry actually issued, `_gcl_au`
   presence, `accounts.google.com` state, absence of Talkaris cookies on our origin).
2. **GA4 admin access is blocked** (`GROWTH-02-SPEC.md:140`): cannot confirm Ads linkage, Signals,
   data-retention settings or that enhanced measurement is what the docs assume.
3. **Same-origin vs `talkaris.com` chat** (F-05): a deployment decision that must be settled before
   the cookie table is written, because the cookie/party descriptions differ.
4. **Withdrawal control on private routes** has no existing UI host (the footer is public-only) — the
   global component must provide it (TR-6).
5. **Legal approval is external** (`GROWTH-02-SPEC.md:142`). Engineering can ship a conservative
   interim configuration, but must not state compliance.
