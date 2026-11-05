# Security and privacy review

**Date:** 2026-11-05
**Scope:** public web SSR, nginx edge, contact form, private routes, metadata.
**Method:** source review, live headers, SEOmator security checks, server read-only inspection.
No penetration test, dependency audit or secret scan was run.

## 1. Implemented hardening

| Control | State |
|---|---|
| HTTPS + HTTP→HTTPS + www→apex | already present |
| `x-powered-by` | disabled in Express; hidden at nginx |
| `X-Content-Type-Options: nosniff` | Express (public pages), nginx (`/uploads`, `/chat-widget`) |
| `X-Frame-Options: SAMEORIGIN` | Express |
| `Referrer-Policy: strict-origin-when-cross-origin` | Express |
| `Permissions-Policy` | Express |
| HSTS | nginx, `max-age=15552000` (180 days), no `includeSubDomains`/preload |
| Private noindex | `X-Robots-Tag: noindex, nofollow` for dashboard/portal/auth/access and 404 |
| Private cache | `Cache-Control: no-store` on private responses |
| 404 / missing assets | real 404, no SSR HTML shell |
| Email obfuscation | Cloudflare `/cdn-cgi/l/email-protection` (seen as a false 404 by crawlers) |

## 2. Open findings

| Severity | Finding | Impact | Required fix |
|---|---|---|---|
| High | Contact endpoint has no rate limit or spam control | bot floods `contact_messages` | add honeypot + API rate limit, then monitor |
| High | No consent mode/banner; GA4 loads before consent | GDPR/ePrivacy exposure | consent UI + `gtag('consent')` default/update |
| Medium | Contact route stores but does not notify the team | leads can be missed | send admin email via existing SMTP, never fail the insert |
| Medium | No CSP | XSS impact if an injection appears | add a report-only CSP first, then enforce after testing inline styles/scripts |
| Medium | No automated dependency/security scan | unknown vulnerable packages | add `npm audit --omit=dev` or Dependabot/OSV scan in CI |
| Low | HSTS not on `/uploads`/`/chat-widget` at baseline | those paths lack HSTS | fixed by repeating HSTS in those locations |
| Low | No `includeSubDomains`/preload | weaker HSTS | evaluate after all subdomains are HTTPS |
| Low | `security-leaked-secrets` SEOmator finding | false positive: Google OAuth **client IDs** are public | record as false positive; do not print credentials |

## 3. Secret handling

- No secret value is present in this document or commit.
- Runtime secrets live in `/etc/tecnoria/*.env` and GitHub Actions secrets.
- `.env*` files are gitignored.
- The report references environment-variable names only.
- The Google OAuth client ID exposed in `window.__TECNORIA_RUNTIME__` is a public client identifier,
  not a client secret. It is expected in browser code. A client *secret* must never be shipped.

## 4. Private route exposure

`/dashboard`, `/portal/*`, `/auth-*` and `/acceso-restringido` redirect or render a noindex page.
The Express handler validates the session cookie against the internal API; the SSR shell does not
include private data when the session is absent. `robots.txt` disallows these paths, but robots is
not an access control — the 302/session check is.

## 5. Third-party skills/tools

- Marketing skills: MIT, prompt-only; no runtime code added to the site.
- Spec Kit: CLI 1.3.0, DSH integration; scaffolding only.
- SEOmator 7.0.0: MIT, run via `npx` in a temp directory; it fetched the public site and rendered it
  with local Chrome. It was not added as a runtime dependency.
- Microsoft TokenEconomizer: **not installed**; no DSH adapter exists in this installation. Its
  Claude Code/Codex hooks were not added.

## 6. Residual risk statement

The security dimension is **PARTIAL**, not PASS. Functional SEO tests passed, but no penetration
test, consent audit, dependency scan or production secret scan was performed. Do not treat the SEO
PASS as evidence of security isolation.
