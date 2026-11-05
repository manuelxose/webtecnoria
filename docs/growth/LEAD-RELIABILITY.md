# Lead reliability — contact pipeline, abuse controls, notification and operator runbook

**Repository:** `C:\Users\Admin\Documents\workspace\webtecnoria`, HEAD `6b86ab0`
**Subject:** how a contact-form submission becomes a stored lead, what protects the endpoint, why the
business may still not hear about a lead, and what an operator does about it.
**Document status:** synthesis of the WAVE A audit (`_team/GROWTH-02-LEAD-DISCOVERY.md`), the WAVE C
infrastructure drill (`_team/GROWTH-02-INFRA-DRILL.md`) and the WAVE B2 implementation.
**Deployment status: NOT CLAIMED.** The API changes described here are **uncommitted working-tree
changes** on top of HEAD `6b86ab0` (`git status --short`: ` M apps/api/src/index.ts`,
` M apps/api/src/routes/v1/contact.ts`, plus the new files `apps/api/migrations/009_contact_reliability.sql`,
`apps/api/src/config/trusted-proxy.ts`, `apps/api/src/scripts/renotify-leads.ts`,
`apps/api/src/services/{lead-rate-limit,logger,notification}.ts`). Nothing here asserts that this code is
running in production; where production behaviour is stated, it is the **pre-change** behaviour measured
in the audit and is labelled as such.

Every number in this document is copied from a named file line or a pasted command output. Anything that
was not measured is written as **not measured**.

---

## 0. The one-paragraph version

A visitor submits the form on `tecnoriasl.com`; the browser posts same-origin to
`/api/v1/contact`; Cloudflare and nginx forward it to Express; zod validates it; the row is inserted into
`tecnoria.contact_messages`; **then** a notification is attempted and its outcome is stored next to the
lead. Before this milestone the last step did not exist at all: the row landed in a table that no screen,
no email and no API read (audit finding L1). Today the storage and the notification are two separate,
persisted facts — and the notification half is **blocked in production by a broken SMTP credential**, not
by code. The pipeline is protected by validation maxima, a honeypot, a two-level in-memory rate limiter,
an idempotency key with a partial unique index, a trusted-proxy client identity and an allow-listed
logger; it is **not** protected against a determined distributed flood, origin bypass, or a human filling
the honeypot.

---

## 1. The lead path, hop by hop, with its loss points

### 1.1 Hop table

| # | Hop | Anchor | What happens |
|---|---|---|---|
| 1 | Angular form | `apps/web/src/app/site/components/contact-form.component.ts:80-82` (validators), `:110-140` (payload) | Client-side validation; payload carries `privacyAccepted: true`, `sourcePage`, `idempotencyKey` and `_hp` (`:126-129`) |
| 2 | Domain port | `apps/web/src/app/domain/repositories/contact.repository.ts:3-7` | `submitLead(data): Promise<void>` — no result type, no request id |
| 3 | HTTP adapter | `apps/web/src/app/infrastructure/repositories/api/api-contact.repository.ts:19` | `POST ${baseUrl}/api/v1/contact` via `firstValueFrom`; no client-side timeout, no automatic retry |
| 4 | Same-origin URL | `apps/web/src/environments/environment.prod.ts:3` (`apiBaseUrl: ""`) | Browser posts to `https://tecnoriasl.com/api/v1/contact` |
| 5 | Edge | Cloudflare proxied A records (`infra/cloudflare-cutover.sh:30,121-122`) | TLS terminates at the edge; the origin sees a Cloudflare peer |
| 6 | nginx | `infra/nginx/tecnoria.conf:26-28` (server block), `:30` `client_max_body_size 20m`, `:43-47` forwarded headers, `:58-60` `location /api/ { proxy_pass http://127.0.0.1:3001; }` | Reverse proxy to the API on loopback |
| 7 | Express bootstrap | `apps/api/src/index.ts:19` `trust proxy "loopback"`, `:23` helmet, `:24-29` cors, `:30` `express.json({limit:"1mb"})`, `:31` cookieParser, `:35-60` access log, `:81` `/api/v1` router, `:83-85` 404, `:88-108` error middleware | Body parsed, request logged, routed |
| 8 | Route | `apps/api/src/routes/v1/index.ts:21` → `apps/api/src/routes/v1/contact.ts:117-266` | The whole lead handler (§1.2) |
| 9 | Validation | `contact.ts:33-48` (schema), `:134-140` (`safeParse`) | 400 with field-level messages; no row |
| 10 | Insert | `contact.ts:179-200` | Parameterised `INSERT … ON CONFLICT (idempotency_key) … DO NOTHING RETURNING id, created_at`, `notification_status='pending'` |
| 11 | Notification attempt | `contact.ts:230-243` → `apps/api/src/services/notification.ts:92-124` → `apps/api/src/services/email.ts:13-29` | Awaited **before** the HTTP response; never throws into the request |
| 12 | Notification persistence | `contact.ts:245-253` | Writes `notification_status`, `notification_attempts+1`, `notified_at`, `notification_error` |
| 13 | Response | `contact.ts:264` | `201 {id, duplicate, notified}` |

Storage shape: the table had 9 columns before this milestone (audit §1.1) and has **18** after migration
009 (`apps/api/migrations/009_contact_reliability.sql:9-36`; the integration guard asserts 18 —
`scripts/api-tests/integration.docker.test.mjs:189`).

### 1.2 The handler, in order (one line each)

`contact.ts`:

1. `:121` client identity = HMAC of the resolved visitor IP (`config/trusted-proxy.ts:231-248`).
2. `:126-131` **honeypot first**: a non-empty `_hp` returns a success-shaped `201` with a random UUID and
   writes nothing.
3. `:134-140` zod validation → `400 {code:"INVALID_INPUT", fields}`.
4. `:145-150` single-line fields get CR/LF/tab/U+2028/U+2029 collapsed to spaces.
5. `:152-161` `sourcePage` normalised to a relative path; missing `privacyAccepted` / `idempotencyKey`
   are logged but never rejected (web/API deploy-window compatibility).
6. `:164-175` rate limit → `429` + `Retry-After`.
7. `:179-200` insert; `:202-226` duplicate resolution (same key → same id, `duplicate: true`).
8. `:230-243` notification; `:245-253` outcome persisted; `:255-262` operator log; `:264` response.

### 1.3 Where a lead can still be lost — per hop

| ID | Hop | Mechanism | Anchor | Was this a pre-existing defect? |
|---|---|---|---|---|
| **P1** | Client | User closes the tab or the request fails; the UI only flips `submitError`, there is no retry and no queued submission | `contact-form.component.ts` submit error branch (audit §1.1 step 3) | yes |
| **P2** | Edge / nginx | Body over the Express 1 MB cap → `413`; nginx itself allows `20m` so the effective cap is Express | `index.ts:30`, `tecnoria.conf:30` (audit §2) | yes |
| **P3** | Validation | Any invalid field → `400`, no row; a legitimately confused user is lost unless they correct it | `contact.ts:134-140` | yes |
| **P4** | Honeypot | A human (autofill, browser extension, accessibility tool) that puts text in the hidden `_hp` field receives a **success-shaped 201** and the lead is silently discarded | `contact.ts:126-131` | new control, new (small) false-positive surface |
| **P5** | Rate limit | The 6th submission from the same client hash within 10 minutes → `429`, no row; clients behind a shared NAT/egress (e.g. a corporate proxy, or CGNAT) share one hash | `contact.ts:164-175`, `lead-rate-limit.ts:50-55` | yes (control introduced) |
| **P6** | Insert | Database error → terminal error middleware answers `500 {code:"INTERNAL"}`; no row. Since B2 the process no longer dies (previously an unhandled rejection could kill it) | `contact.ts:179-200`, `index.ts:88-108` | previously fatal — L2 in the audit |
| **P7** | Notification | The lead is stored but nobody is told; the request still returns `201`. **This is the dominant loss today** because SMTP is blocked | `contact.ts:243`, `notification.ts:105-123`, §4 | previously total — L1 |
| **P8** | Response | The row commits but the response is lost (network drop, restart). A retry with the same idempotency key is a no-op; a retry **without** a key (old cached bundle) creates a second row | `contact.ts:184`, `:206-226` | idempotency is new |
| **P9** | Shutdown | `SIGTERM` now drains connections (`index.ts:133-173`), but an in-flight INSERT that has not committed is not retried by the server | `index.ts:149-164` | L4 in the audit |
| **P10** | Process | A crash-loop at boot (`ensureDatabaseConnection()` → `process.exit(1)`, `index.ts:116-128`) refuses every lead for the duration; still **no alerting** on that loop | `index.ts:116-128`, systemd `Restart=always` | L5 in the audit |

Historical fact, not a hypothesis: **before this milestone there was no notification path at all.** The
audit's L1 states it plainly — no email, no webhook, no queue, no `leads` row, no admin endpoint over
`contact_messages`; `grep sendEmail apps` matched only `auth.ts:144,158,209`
(`_team/GROWTH-02-LEAD-DISCOVERY.md:117`). The 17 historical rows in the table are exactly that: stored,
never announced.

---

## 2. Controls that are actually implemented

| Control | Mechanism with the real numbers | Anchor | What it does **not** protect against |
|---|---|---|---|
| Server-side field maxima | `name ≤120`, `email ≤254`, `company ≤160`, `phone ≤32`, `service1 ≤80`, `service2 ≤120`, `message ≤5000`, `sourcePage ≤200`, `idempotencyKey ≤64`; `.trim()` first so `"   "` is not a message | `apps/api/src/routes/v1/contact.ts:33-48` | Total row size is still bounded only by the 1 MB body cap; no Unicode normalisation or bidi/zero-width filtering (only CR/LF/tab/U+2028/U+2029 in single-line fields, `:52-58`); `message` keeps its newlines by design |
| Body cap | `express.json({ limit: "1mb" })`; nginx allows `20m`, so Express is the effective limit (audit measured a 1 500 043-byte body → `413`) | `apps/api/src/index.ts:30`; audit §2 | Anything under 1 MB in one request still gets parsed and validated; it does not cap request rate |
| Honeypot `_hp` | Read from the raw body **before** zod (`_hp` is not in the schema). Filled → `201 {id:<random uuid>, duplicate:false, notified:"skipped"}`, **no row**, log `contact_spam_honeypot`. Absent or non-string (`12345`, `{a:1}`) → treated as empty, **no validation error** | `contact.ts:126-131`, schema `:33-48` | Most bots leave hidden fields empty; a human autofill can trip it (P4); no CAPTCHA |
| Per-client rate limit | **5 submissions / 10 minutes**, token bucket keyed by the HMAC client hash; the **first** submission of an unseen key is never refused by its own bucket | `apps/api/src/services/lead-rate-limit.ts:49-55`, `:138-149` | Rotating identities (new IP per request) always starts with a fresh bucket; the map is in-process, so a restart forgets every bucket |
| Global rate limit | **120 submissions / 10 minutes**, applied to **every** submission including first-time keys, so identity rotation cannot exceed the ceiling (≈17 280/day) | `lead-rate-limit.ts:127-136` | A real flood still consumes the ceiling and then refuses legitimate visitors (`429`); in-memory, single process |
| Distinct rejection telemetry | `contact_rate_limited_key` vs `contact_rate_limited_global` (different events, both with `client`, `status: 429`) | `contact.ts:167-171` | Logs are stdout-only; nothing pages an operator |
| Idempotency | Client-generated key in the body; `ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING`; a duplicate returns the **same** id with `duplicate:true` and no second row or email | `contact.ts:184`, `:206-226`; `apps/api/migrations/009_contact_reliability.sql:40-42` | Old cached bundles send no key (logged as `contact_no_idempotency_key`); a malicious client can reuse one key to suppress its own later rows; nothing expires keys |
| Trusted-proxy client identity | `app.set("trust proxy", "loopback")`; the peer is accepted as the client only if it is in the embedded Cloudflare ranges (15 IPv4 + 7 IPv6, snapshot 2026-11-05); `CF-Connecting-IP` is trusted **only** from such a peer; multi-value/invalid headers are rejected and fall back to the peer | `apps/api/src/index.ts:19`; `apps/api/src/config/trusted-proxy.ts:15-42`, `:161-213` | Direct-to-origin requests bypass Cloudflare entirely (audit §2: ufw allows 80/443 from anywhere) and are hashed as their own address; the CIDR snapshot goes stale unless `node scripts/refresh-cloudflare-ranges.mjs` is run; a spoofed header from a non-Cloudflare peer is ignored but not punished |
| Non-reversible client id | HMAC-SHA256 of the IP with a key derived from `JWT_SECRET`, truncated to 16 hex chars; raw IP never stored or logged | `trusted-proxy.ts:215-248` | A secret rotation changes every hash (rate-limit buckets and historical `client_hash` values stop matching); the hash is still a stable pseudonym for one IP |
| Allow-listed logger | `LogFields` is a closed interface (12 optional fields), strings capped at 120 chars, at most 12 field names; **there is no API to log an arbitrary object** | `apps/api/src/services/logger.ts:10-24`, `:30-68` | Call sites still choose what goes into `detail`/`fields`; a future careless call could put a message body there — the allow-list constrains the shape, not the content policy |
| Error containment | Terminal error middleware answers `500 {code:"INTERNAL"}` with no stack/message; `pool.on("error")` logs and survives; `unhandledRejection` is logged instead of killing the process; `SIGTERM`/`SIGINT` drain the server and pool (10 s force-exit) | `index.ts:88-108`, `:112-114`, `:184-191`, `:133-173` | A 500 still loses that lead (P6); the shutdown drain does not retry an uncommitted INSERT (P9); Windows cannot deliver POSIX `SIGTERM`, so that path was proven with an injected exit (B2 report) |

Not present at all (verified absence, not an omission of this document): no CAPTCHA/Turnstile, no WAF rule
verified on the Cloudflare side (no API token), no CSRF/origin gate (the endpoint consumes no cookies and
therefore accepts a post from any site), no per-account or per-email throttling, no persistent/shared
rate-limit store.

---

## 3. Storage outcome vs notification outcome

They are independent facts, by design (`notification.ts:1-10`), and the database stores both.

| `notification_status` | Set by | Meaning | Operator sees |
|---|---|---|---|
| `legacy` | Column DEFAULT for pre-existing rows (`migrations/009_contact_reliability.sql:15-18`, no `UPDATE` anywhere in 009) | Row predates notifications; must never be notified | `notification_status='legacy'`, `notification_attempts=0` |
| `pending` | Insert path sets it literally (`contact.ts:183`) | Stored, notification not yet resolved | brief window only; the handler awaits the attempt before responding |
| `sent` | Handler or `renotify-leads` (`contact.ts:245-253`, `renotify-leads.ts:101-109`) | The transport accepted the message | `notification_status='sent'`, `notified_at` set, `notification_error NULL` |
| `failed` | Same | The transport refused; only an error **class** is stored (never SMTP text) | `notification_status='failed'`, `notification_error='EAUTH'` (today), `notification_attempts` incremented |

Because the HTTP response is sent **after** the attempt (`contact.ts:243` then `:264`), a lead is never
lost to a notification failure — but the visitor waits for it: the notifier races a **10 000 ms** timeout
(`notification.ts:93`) and returns `ETIMEDOUT` as a class. A hung SMTP server therefore delays a successful
submission by up to 10 seconds before the same `201` is returned.

The browser does not act on `notified` (`contact.ts:264` returns it; the Angular adapter returns `void`,
`contact.repository.ts:3-7`) — the notification outcome is an operator fact, not a user-facing one.

---

## 4. Delivery status: SMTP is BLOCKED in production

Measured twice, independently (WAVE A §4 and WAVE C §3), with a `transporter.verify()` probe that sends no
message and never prints a credential. Re-proven 2026-11-05T01:07:54.464Z:

```text
TRANSPORT={"host":"smtp.gmail.com","port":587,"secure":false,"authUserDomain":"tecnoriasl.com",
"authUserEqualsFrom":true,"fromDomain":"tecnoriasl.com","adminDomain":"tecnoriasl.com",
"authPassLengthBucket":"<=16"}
NODEMAILER_VERSION=7.0.13
VERIFY_RESULT=FAILED
error_name=Error
error_code=EAUTH
error_responseCode=534
error_command=AUTH PLAIN
error_message=Invalid login: 534-5.7.9 Please log in with your web browser and then try again. For more
534-5.7.9 information, go to 534 5.7.9 https://support.google.com/mail/?p=WebLoginRequired
```

| Fact | Value | Source |
|---|---|---|
| Transport | `smtp.gmail.com:587`, `secure:false` (STARTTLS), `auth.user` domain `tecnoriasl.com`, `auth.user === SMTP_FROM` | drill §3.2 |
| Error class | `EAUTH`, `responseCode 534`, failing command `AUTH PLAIN` | drill §3.3 |
| Server text | `534-5.7.9 … WebLoginRequired` | drill §3.3 |
| What it proves | Google refuses the **credential**, not the connection (TCP/TLS succeeded); 534 is permanent, so retrying locks the account further | drill §3.3-3.4 |
| What no code change can fix | Nothing in the repository: `email.ts:18-26` matches the probe line for line; all SMTP env vars are present (the API boots) | drill §3.4 |
| Exact external action | (1) Owner enables 2-Step Verification and creates a Gmail **app password**, replaces `SMTP_PASS` in `/etc/tecnoria/api.env`, restarts `tecnoria-api` (a scheduled, approved action), re-runs `verify()`; or (2) move to a transactional provider with API keys and configure SPF + DKIM + DMARC for `tecnoriasl.com` | drill §3.5 |

**Proof scope — stated precisely.** The notification code path is proven only against a **local Mailpit
sink** in the isolated Docker integration run: one submission → `201 notified:"sent"`, `notification_status='sent'`,
`notified_at IS NOT NULL`, `notification_attempts=1`, and Mailpit reporting
`{"total":1,"subject":"Nueva solicitud de diagnóstico — tecnoriasl.com","to":["oficina@tecnoriasl.com"]}`
(subject constant: `notification.ts:32`). That is a **code-path** proof, not production delivery.
Production has no mail sink at all: `systemctl list-unit-files "*mailpit*"` → no rows, `docker ps | grep -i
"mailpit\|smtp"` → none, `ss -lntp | grep -E ":(1025|8025) "` → nothing listening (drill §3.6). Mailpit
exists only as the dev service `infra/docker-compose.dev.yml:18-27`, started by `npm run dev:deps:up`.

Consequence for the business, today: **a stored lead produces no notification**, and the row records
`notification_status='failed'`, `notification_error='EAUTH'`. Recording the failure is the whole point of
the split — the lead is not lost in the database, but nobody is told.

---

## 5. Operator runbook

### 5.1 See what is stored (read path)

Both endpoints require an admin/editor session: `requireAdmin` answers `401 {code:"UNAUTHENTICATED"}` when
the session is missing or invalid (`apps/api/src/auth/middleware.ts:18`, `:33`) and
`403 {code:"FORBIDDEN"}` for any other role (`:37-41`).

| Endpoint | Contract | Anchor |
|---|---|---|
| `GET /api/v1/contact/messages?limit=20&before=<ISO>` | `requireAdmin`; `limit` clamped to **1..100**, default **20**; `before` filters `created_at < $1` and returns `400` with a field error if the date is invalid; order `created_at DESC`; response `{items, nextBefore}` where `nextBefore` is the last row's `created_at` when a full page was returned | `contact.ts:270-310` |
| `GET /api/v1/contact/messages/:id` | `requireAdmin`; `200` with the row or `404 {code:"NOT_FOUND"}` | `contact.ts:312-332` |

Returned columns: `id, created_at, name, email, phone, company, service_1, service_2, message,
source_page, notification_status, notification_attempts, notified_at, notification_error, privacy_accepted,
user_agent_class, client_hash` (`contact.ts:293-295`). Note that these responses **contain personal data**
by design — do not paste them into tickets, chats or analytics.

Equivalent read-only SQL (production host, no API needed):

```bash
sudo -u postgres psql -d tecnoria -c \
  "select created_at, notification_status, notification_attempts, notification_error, source_page
     from contact_messages order by created_at desc limit 20"
```

### 5.2 Tell whether a notification actually went out

`notification_status='sent'` **and** `notified_at IS NOT NULL` **and** `notification_error IS NULL` — all
three, because the handler always writes the status it observed. In a developer environment you can
additionally confirm the sink received it (Mailpit API, `total`). In production **there is no sink**, so
`sent` is impossible today: any `sent` row would predate a credential fix and should be treated with
suspicion. The truthful production answer today is `failed` + `EAUTH`.

### 5.3 Recover leads that were not notified

`apps/api/src/scripts/renotify-leads.ts`:

```bash
# 1) Always look first. Dry-run performs no UPDATE at all.
node --import tsx apps/api/src/scripts/renotify-leads.ts --dry-run --limit 10

# 2) Then send, in a bounded batch.
node --import tsx apps/api/src/scripts/renotify-leads.ts --limit 20
```

| Guard | Value | Anchor |
|---|---|---|
| Cutover constant — nothing created before it may ever be notified | `NOTIFY_SINCE = "2026-11-05T00:00:00.000Z"` | `renotify-leads.ts:20` |
| Attempt cap | `MAX_ATTEMPTS = 3`; rows with `notification_attempts >= 3` are never selected again | `renotify-leads.ts:21`, `:59` |
| Selection | `notification_status IN ('pending','failed') AND notification_attempts < $1 AND created_at >= $2 ORDER BY created_at ASC LIMIT $3` | `renotify-leads.ts:54-64` |
| Batch size | `--limit` default **20**, clamped to **100** | `renotify-leads.ts:30-37` |
| One attempt per row per run | `attempted` Set | `renotify-leads.ts:78-84` |
| Broken SMTP is a no-op, not a crash | handler catches, logs `renotify_error`, `process.exitCode = 1`, pool closed | `renotify-leads.ts:123-138` |
| Log events | `renotify_scan`, `renotify_would_send`, `renotify_sent`, `renotify_failed`, `renotify_summary`, `renotify_error` | `renotify-leads.ts:67-133` |

**Why the 17 historical rows can never be re-notified.** Two independent protections:

1. Migration 009 adds `notification_status text NOT NULL DEFAULT 'legacy'` (`:18`) and the file contains
   **no data `UPDATE`** — pre-existing rows became `legacy` by default, and the renotify query only selects
   `pending`/`failed`.
2. Even if a status were wrong, `created_at >= '2026-11-05T00:00:00.000Z'` excludes them: the newest of
   the 17 historical rows is `2026-10-16 09:23:30.607981+02` (`_team/GROWTH-02-INFRA-DRILL.md:182`;
   `CONVERSION-MEASUREMENT.md:57`).

Re-notification sends the **stored** content (`name/email/phone/company/service_1/service_2/message/
source_page`), so it is equivalent to the original attempt — not a re-render from the web form.

---

## 6. Data protection posture

**What is stored** (all in `tecnoria.contact_messages`): `name`, `email`, `phone`, `company`, `service_1`,
`service_2`, `message`, `source_page`, `privacy_accepted` (boolean), `client_hash` (HMAC, 16 hex),
`user_agent_class` (`desktop|mobile|automated|unknown`, `contact.ts:80-92`), plus operational columns
(`notification_*`, `created_at`).

**What is logged** (single-line JSON, allow-listed): `ts`, `event`, `method`, `path` (query stripped),
`status`, `durationMs`, `client` (the HMAC hash), `errorClass`, `duplicate`, `notified`, `fields` (field
**names** that failed validation, max 12), `count`, `detail`. Anchors: `logger.ts:10-24`, `:30-68`;
`index.ts:35-60`.

**What is deliberately never logged**: email address, phone, message body, company, name, raw IP, the
query string, and the raw `User-Agent` string (only its coarse class is stored). The concrete proof is the
real operator output of a submission (§6.1) and the test that posts `?email=leak@example.com&phone=600000000&message=secret`
and asserts none of those values appear in the captured stdout (B2 acceptance evidence).
Notification failures store an error **class** only, never the SMTP response text (`notification.ts:1-10`,
`:70-82`).

**What never goes to analytics**: the whole personal record. The behavioural plane receives only
`form_type`, `service_category` and `source_page` — see `CONVERSION-MEASUREMENT.md` §1, which states the
two planes may only be compared as aggregate counts and never joined to a session.

### 6.1 The two real operator lines, verbatim (a successful submission to the local Mailpit sink)

```json
{"ts":"2026-11-05T02:49:29.525Z","event":"http_request","method":"POST","path":"/api/v1/contact","status":201,"durationMs":85,"client":"36bedac64feb6583"}
{"ts":"2026-11-05T02:49:29.523Z","event":"contact_lead_stored","status":201,"client":"36bedac64feb6583","duplicate":false,"notified":"sent"}
```

Neither line contains an email address, a phone number, a message body, a raw IP or a query string. The
first line's `path` is the real path — an earlier build logged `"/"` because `req.path` was read inside the
`finish` handler; it is now captured at request start (`index.ts:37-39`).

### 6.2 Retention and legal wording — open items, not claims

- **No retention or deletion job exists.** `grep` over `apps/api` and `infra` finds no `DELETE`/retention
  logic touching `contact_messages`; the only `DELETE` in the backup script is
  `infra/bin/backup-tecnoria-db.sh:20` for dump files older than `RETENTION_DAYS=7`. Rows accumulate
  indefinitely (17 today).
- **`privacy_accepted` is a boolean, not a consent record.** There is no timestamp, no policy version and
  no consent text snapshot; the web form always sends `privacyAccepted: true` once its required checkbox
  passes client-side validation (`contact-form.component.ts:80`, `:126`). It proves the flag, not the
  wording the visitor saw.
- **Legal wording is not approved.** The cookie policy carries `PENDING CONTROLLER/COUNSEL APPROVAL`
  markers; the lead/privacy wording needs the same controller/counsel sign-off. Nothing in this document
  is a compliance statement.

---

## 7. Backup and recovery reality

Everything below was measured in the WAVE C drill (`_team/GROWTH-02-INFRA-DRILL.md`), not copied from a
runbook.

**The dump path was wrong in the task brief and is corrected here.** The real dumps live where
`infra/bin/backup-tecnoria-db.sh:4` puts them — `DEST="${DEST:-/var/backups/tecnoria/postgres}"`. There is
no tecnoria dump in `/var/www/backups/`; that directory holds another project's dump
(`content-ai-platform-20260825-201230.dump`).

| Item | Measured value |
|---|---|
| Dump under test | `/var/backups/tecnoria/postgres/tecnoria_20261105_011458.dump.gz` |
| Size | **18 711 bytes** |
| Timestamp / mode | 2026-11-05 01:14, `0640 root:root` |
| SHA-256 before → after drill | `9942aba92491db79a032cbf7972e83d3256e3a266f336493b8524910c66083aa` → **identical** |
| Format | custom archive, gzip-compressed (`pg_dump -Fc \| gzip -9`, `backup-tecnoria-db.sh:13`); `PGDMP` magic confirmed |
| Archive listing | 173 TOC lines, 20 `TABLE DATA` entries — **not** accepted as restore evidence |
| Drill database | `tecnoria_restore_drill_20261105_0208` (created, restored, dropped) |
| `pg_restore` | **exit 0**, single pass `--no-owner --role=postgres`, **0 bytes** of stdout+stderr (no warnings) |
| Parity, live vs restored | `contact_messages` 17 / 17, `users` 7 / 7, `clients` 1 / 1, `projects` 0 / 0, `invoices` 1 / 1, `contracts` 0 / 0, `tickets` 0 / 0 |
| Structural parity | `contact_messages` column count 9 / 9 (pre-migration state); `max(created_at)` identical to the microsecond (`2026-10-16 09:23:30.607981+02`) |
| Drop + residue | `dropdb` exit 0; `RESIDUE_COUNT=0` |
| Live database untouched | `contact_messages` 17 before/after; `tecnoria-api` and `tecnoria-web` `ActiveEnterTimestamp` byte-identical; nginx mtime unchanged; dump sha256 unchanged |

**Open risks (measured absent, not assumed):**

1. **No PITR.** `archive_mode=off`, `wal_level=replica`, `archive_command` disabled. Worst-case loss window
   is bounded only by the daily cron (`/etc/cron.d/tecnoria-db-backup`, `30 3 * * *`), which had **not yet
   fired once** at drill time (`/var/log/tecnoria-db-backup.log` did not exist).
2. **Single generation.** Only one dump exists; a corrupt dump cannot be replaced from a second one.
3. **No offsite copy and no encryption.** The dump sits on the same filesystem as the database (`/dev/sda1`);
   server loss = total loss.
4. **No failure alert.** The backup script writes to a log that does not exist yet; a silent failure is
   indistinguishable from a backup that never ran.
5. **Retention never exercised.** `RETENTION_DAYS=7` has never deleted anything (one generation).
6. **Parity is counts + column set + newest timestamp**, not a row-level digest; the stronger drill
   (per-table `md5(string_agg(...))`) was not run.

---

## 8. Environment hazard: `127.0.0.1:5432` is not a disposable container

Discovered during the B2 integration work and recorded here because it can destroy unrelated data.

On this Windows host, **`127.0.0.1:5432` is answered by an unrelated PostgreSQL instance** — PostgreSQL
16.15 (Ubuntu build, `data_directory /var/lib/postgresql/16/main`) serving the databases **`tecnoria`**,
**`tecnoria_chat`** and **`content_ai`** (names as recorded by the B2 run that identified the instance).
It wins the loopback race against Docker Desktop's port proxy, so a naive integration test pointed at
`127.0.0.1:5432` would write test leads into somebody else's database. (It only failed loudly in the first
attempt because the unrelated instance lacked the new columns.) Re-checked while writing this document:
`Test-NetConnection -ComputerName 127.0.0.1 -Port 5432` → `True`, i.e. the listener is still there.

Do not confuse this instance with the Contabo server's own PostgreSQL, which is a different machine and
lists different databases (`content_ai_platform`, `electroria`, `tecnoria`, `tecnoria_chat`, templates —
`sudo -u postgres psql -l` on `contabo`).

Isolation actually implemented:

| Layer | Mechanism | Anchor |
|---|---|---|
| Ports | Compose override publishes Postgres on **`127.0.0.1:55432`**, Mailpit on **`127.0.0.1:11025`/`18025`** with `!override` so the dev defaults (`5432`, `1025`, `8025`) are replaced | `scripts/api-tests/compose.override.yml:12-19` |
| Connection string | The test sets `DATABASE_URL` to `postgres://postgres:postgres@127.0.0.1:55432/tecnoria` | `scripts/api-tests/integration.docker.test.mjs:30`, `:167-168` |
| Guard before any write | After building and migrating, a dedicated pool asserts `current_database() = 'tecnoria'` **and** that `contact_messages` has exactly **18** columns; otherwise the run aborts | `integration.docker.test.mjs:179-191` |
| Freshness | `DROP DATABASE IF EXISTS tecnoria; CREATE DATABASE tecnoria` inside the container, then all 9 migrations; `count(*) = 0` asserted | `integration.docker.test.mjs:128-141` |
| Teardown | `down -v` in `finally`; no containers or volumes left behind | B2 report |

Residual risk that remains: anyone who runs `infra/docker-compose.dev.yml` **without** the override still
publishes `0.0.0.0:5432`, and on this host that collides with the unrelated instance. Use
`scripts/api-tests/run-all.mjs` (which applies the override), and never point a test at `:5432`.

---

## 9. Adjacent production defects found but **not** fixed in this milestone

Both share one root cause: the production SMTP credential is rejected with `EAUTH` / `534-5.7.9
WebLoginRequired` (§4). Neither was touched by WAVE B2 — they are recorded so the next milestone does not
rediscover them.

| ID | Defect | Severity | Evidence | Root cause |
|---|---|---|---|---|
| **D1** | `POST /api/v1/auth/access-request` inserts the request row and **then** awaits two `sendEmail()` calls inside the request; the SMTP failure lands in `catch` and the route answers **`502`** — after the row was already persisted. The user sees a failure, retries, and creates a duplicate access request. | **High** (user-visible error + persisted duplicate; 3 rows today, newest `2026-03-12`, so blast radius is small but the pattern is wrong) | `apps/api/src/routes/v1/auth.ts:120-130` (insert), `:144` and `:158` (two sends), `:180` (`502` in the catch); audit §1.2 | SMTP `EAUTH` |
| **D2** | Password recovery answers **`202`** regardless of whether the mail was sent, so a broken credential is invisible to the user and to the operator; expired/absent reset mail looks like success. | **Medium-High** (silent auth failure; self-service recovery is effectively dead while SMTP is blocked) | `apps/api/src/routes/v1/auth.ts:209` (`await sendEmail(...)`) and `:225` (`res.status(202)`); drill §3.5 | SMTP `EAUTH` |

The lead route itself was built the other way round on purpose: insert → attempt → persist outcome →
respond, with the notification failure never able to change the stored-lead outcome (`contact.ts:228-264`).

Also adjacent, already fixed by B2 but worth knowing: the old contact handler had no `try/catch`, no error
middleware and no pool `'error'` listener, so a database blip could kill the API process (audit L2/L3);
`index.ts:88-114` now contains those three controls.

---

## 10. Honest limitations of this document

1. **Not a deployment claim.** The API code described is the working tree (uncommitted), not the deployed
   build. `git status --short` shows the modified/untracked files; nothing in this document asserts the
   production `tecnoria-api` service runs this code. The pre-change production behaviour comes from the
   audit and is labelled as such.
2. **No production delivery proof.** Every "sent" claim in §5 is about a **local Mailpit** run. Production
   SMTP is `EAUTH`; no message has been delivered from production in this milestone.
3. **Rate-limit numbers are policy, not load-tested capacity.** 5/10 min and 120/10 min are justified
   against the measured real volume (~2 leads/month in the audit's operational data) but were exercised
   with unit/integration tests, not with a production traffic replay. The limiter is in-process: a restart
   clears it, and it cannot be shared across multiple API processes.
4. **No alerting exists for any of it.** Nothing pages on `contact_rate_limited_global`, on
   `notification_status='failed'`, on `db_pool_error`, on a crash loop or on a missed backup. All of it is
   stdout/journald that a human must read.
5. **The 17 historical rows were counted, not inspected.** Their content was never read by this
   documentation task; the newest timestamp and the count are the only facts used.
6. **No PII was copied into this document**, and the operator examples must not be pasted elsewhere.
7. **Legal posture is unapproved.** `privacy_accepted` is a boolean; retention has no job; the privacy
   wording still needs controller/counsel approval. Nothing here is a compliance certification.
8. **The backup drill is a single event** (one dump, one throwaway database, one pass). It proves *that
   dump* restored; it does not prove recurring backup health, and it was not repeated after the API
   migration 009 (which changes the schema that a future restore would carry — the drill predates it).
9. **Time-sensitive values.** The Cloudflare CIDR snapshot (2026-11-05) and the dump identity (2026-11-05
   01:14) will age; re-run `node scripts/refresh-cloudflare-ranges.mjs` and the drill procedure when they
   do.
10. **Read this with the source files open.** Line numbers are valid for the working tree at the time of
    writing; the API package is under active change by other members of the milestone.

---

## 11. Source register

| Fact | Source |
|---|---|
| Original lead path, L1-L8 loss findings, abuse surface, measured `req.ip`, pre-milestone backup state | `docs/growth/_team/GROWTH-02-LEAD-DISCOVERY.md` |
| Dump identity/size/sha256, restore drill, parity, residue, PITR/offsite/alerting gaps, SMTP verbatim, rollback readiness | `docs/growth/_team/GROWTH-02-INFRA-DRILL.md` |
| Operational vs behavioural planes, metric definitions, historical row count and newest lead | `docs/growth/CONVERSION-MEASUREMENT.md` |
| Every `file:line` anchor in §1-§9 | The repository files named inline (read at HEAD `6b86ab0` + uncommitted B2 changes) |
| Real operator log lines, Mailpit assertion, 18-column guard, port-5432 hazard, rate-limit and honeypot confirmations | B2 task evidence (`t6` output) and `scripts/api-tests/*.test.mjs` |
