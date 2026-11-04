# UX and conversion review

**Date:** 2026-11-05
**Scope:** public site, contact journey, trust surface, mobile/accessibility risks.
**Method:** rendered HTML inspection, SEOmator 7.0.0 single-page audit (browser-rendered), source
review. No user testing, heatmaps or A/B test data was available.

## 1. What changed

| Change | Why | File |
|---|---|---|
| Removed three anonymous testimonials | Quotes had no named author/company and one repeated an unsourced 60% claim | `home-page.component.ts`, `site-content.ts` |
| Replaced the proof section with Talkaris, Auctorio and Guía TV links | These are verifiable products/client work | `home-page.component.ts` |
| Removed five generic case studies | No named client or permission; impact claims were unverifiable | `site-content.ts` |
| Kept three verified projects | Two own products + named client platform | `site-content.ts` |
| Replaced numeric product stats | 99.9% uptime, <200 ms, 60% tickets, 10× speed had no source | `site-content.ts` |
| Removed “<24h” SLA from contact, form, footer and meta | Unverified service commitment | contact/footer/home |
| Removed “indexación en Google Search Console” from the Guía TV claim | Not verifiable from this repository | `site-content.ts` |
| Bumped 11.5px tech tags to 12px | Mobile readability | `styles.css` |

## 2. Contact journey

The form asks name, email, company, optional phone, need, timeline, message and privacy consent.
Validation is inline and the submit button disables while sending. Success and error states are
announced with `role="status"`/`role="alert"`.

**Still missing / blocker:**

- **No spam protection** (no honeypot, no rate limit, no CAPTCHA). A bot can POST directly to
  `/api/v1/contact`.
- **No API-side rate limiting** and no maximum lengths on several fields.
- **No admin notification** is sent by the contact route; the row is stored in `contact_messages`
  but the team is not emailed. The auth flow already has SMTP; contact should use it.
- **No consent banner/consent mode.** GA4 `G-LE6ETPWL23` loads unconditionally, and SEOmator flags
  “no consent update”. This is a legal/privacy risk, not just a measurement gap.
- **No lead conversion event.** A successful submission is not sent to GA4; only page views exist.
- **No end-to-end test** against a staging DB/SMTP. The form has not been submitted in this session.

These are recorded as open, not silently marked complete. See `ANALYTICS-MEASUREMENT.md` and
`FINAL-DELIVERY.md`.

## 3. Trust surface

- Business identity: email, phone and “Galicia, España” are present; street address, legal name,
  NIF and team are absent. For B2B procurement this is the largest conversion handicap.
- Privacy policy page exists and the form links to it; SEOmator’s “no privacy policy link” finding is
  a false positive caused by the footer link rendering.
- No social profile links are published. Do not add profiles until the owner confirms the accounts.
- Case studies now state that only own projects or client-authorized work are shown.

## 4. Mobile and accessibility

SEOmator reported 4 potential horizontal-scroll elements because images declare `width="1024"`.
The global CSS sets `img { max-width: 100% }`, so this is a **likely false positive**; it still
warrants a real mobile browser check. It also reported one 11.5px CSS token (fixed to 12px) and
several tight line-heights used in display headings, not body copy.

Positive signals already present: skip link, one H1 per page, visible focus styles, labelled form
fields, inline errors, reduced-motion support (check `styles.css`), and 44px-class touch targets.

**Needs a real browser test:** 320px/375px viewport, keyboard-only form completion, screen-reader
announcement of success/error, and mobile LCP. Lab data in `PERFORMANCE-BENCHMARKS.md` is not field
data.

## 5. CRO priorities

1. Add verified legal identity and, if the owner wants local SEO, a real locality.
2. Add one proof strip per commercial landing using a named/authorized case, not a quote.
3. Add a short “what happens next” block to each service CTA (already partly present on contact).
4. Add spam protection and admin notification before promoting the form.
5. Add consent + a single `generate_lead` event, then measure form-start → submit → qualified lead.
6. Only then test hero/CTA variants; do not A/B test on a sample too small to reach significance.

## 6. What was not done

No visual redesign, no new component library, no animation changes. The site already has a coherent
design system; the constraint is trust and measurement, not decoration. No A/B test was run because
there is no traffic baseline or analytics access to size it.
