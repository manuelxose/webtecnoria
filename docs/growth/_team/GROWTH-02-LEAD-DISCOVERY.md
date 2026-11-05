# GROWTH-02 / WAVE A — Lead path discovery (contact form, lead reliability, notifications)

| | |
|---|---|
| Task | `t3` — WAVE A discovery: contact form, lead and notification reliability |
| Team | `tecnoria-growth-02` |
| Author | `backend-lead` (attempt `62975efd-0a17-4bfa-91d5-c659786762b4`) |
| Date | 2026-11-05 (Europe/Madrid) |
| Model class | L0 — read-only backend/lead-path audit |
| Nature | **Read-only.** No production write, no deploy, no restart, no DB write, no restore executed. |
| Repo HEAD inspected | `6b86ab096dfa71dc7ada0d6bd80e546151812108` (also the HEAD of the deployed checkout on the server) |
| Only file written | this document |

Every claim below carries either `path:line` or a command with its real output. Evidence blocks are
literal transcript fragments; long outputs are trimmed and the trim is marked.

---

## 0. Findings at a glance

| # | Severity | Finding | Anchor |
|---|---|---|---|
| F1 | **High** | A lead is written to `contact_messages`, a **dead-end table**: no admin API, no admin UI, no notification, no status. Nothing in the product reads it. | `contact.ts:25-28`, `leads.ts` only serves `leads` |
| F2 | **High** | The only email path that exists is **broken in production**: SMTP `verify()` fails with `EAUTH 534-5.7.9` (Gmail "WebLoginRequired"). Wiring notifications to `sendEmail()` today would deliver nothing. | §5 |
| F3 | **High** | `POST /api/v1/contact` is an `async` handler **without `try/catch`** and the app has **no error middleware** → a DB error becomes an unhandled promise rejection → Node 22 terminates → systemd restarts. The submitter gets a hung request, no lead is stored, and the process dies. | `contact.ts:17-31`, `index.ts:43-47`, `tecnoria-api.service:13` |
| F4 | **High** | **No rate limiting anywhere**: no `express-rate-limit` dependency, no nginx `limit_req`, 5 rapid POSTs and 4 further probes all answered `400`, never `429`. | `apps/api/package.json:14-28`, §3 |
| F5 | **High** | `req.ip` resolves to a **Cloudflare edge IP**, never the visitor, for the production chain. Empirically `172.71.148.71`, `172.70.240.3`, `104.22.123.46`, `172.68.151.17`. | §4 |
| F6 | **High** | The **origin is directly reachable** at `109.123.248.164:443`, bypassing Cloudflare entirely (`400`/`200` observed), so CF WAF/bot rules are optional for an attacker. | §4.4 |
| F7 | Medium | No max length on any field; `express.json` accepts 1 MB; `message` is unbounded `text`. One request can store ~1 MB. | `contact.ts:7-15`, `index.ts:21` |
| F8 | Medium | No idempotency key / unique constraint / server-side debounce → double submits and retries create duplicate rows. | `contact-form.component.html:176` is the only guard |
| F9 | Medium | The privacy checkbox is **client-only**: it is not part of the payload, so no consent record (text, version, timestamp, IP) is stored server-side. | `contact-form.component.ts:83-91` vs `:50-59` |
| F10 | Medium | `pg.Pool` has no `'error'` listener, no statement/connection timeout; an idle-client error terminates the process. | `pool.ts:1-6` |
| F11 | Medium | Backups exist but are **local-only, single-generation, no PITR** (`archive_mode=off`), no failure alerting; exactly one run so far and cron has not fired yet. | §6 |
| F12 | Medium | The QA gate has **zero coverage of the lead path**: no API test stage, no contact test; `test:seo` runs against a stub API that 404s everything. | §7 |
| F13 | Low | nginx `access.log` records no vhost, so `POST /api/v1/contact` lines cannot be attributed to a site — this produced a false "lost lead" signal during this audit (see F14). | §6.5 |
| F14 | Info | The single `201` in 13 days of nginx logs belongs to **electroria.com** (same box, own API on `:3201`, own DB), not to tecnoriasl.com. **No tecnoria lead was lost** on that line. Resolved and closed. | §6.5 |

Traffic reality check: `contact_messages` holds **17 rows**, newest `2026-10-16 09:23:30+02`. In the
retained nginx logs (Oct 23 → Nov 5) there is **no `201` attributable to tecnoriasl.com**. The form
works; it simply produces roughly one lead per month, and nothing tells anyone when it does.

---

## 1. End-to-end lead path

### 1.1 The chain, with anchors

1. **Page / component** — `ContactFormComponent` is rendered on `/contacto`, the home page, service
   detail pages, `/auctorio`, `/talkaris`:
   `apps/web/src/app/site/pages/contact-page.component.ts:3`, `apps/web/src/app/site/pages/home-page.component.ts:4`,
   `apps/web/src/app/site/pages/service-detail-page.component.ts:4`, `apps/web/src/app/site/pages/auctorio-page.component.ts:5`,
   `apps/web/src/app/site/pages/talkaris-page.component.ts:4`.
2. **Client validation** — reactive form definition `apps/web/src/app/site/components/contact-form.component.ts:50-59`
   (`name` min 2, `email` email, `company` min 2, `phone` `/^[0-9+()\s.-]{0,24}$/`, `projectType` required,
   `message` min 30, `privacy` requiredTrue). Markup: `apps/web/src/app/site/components/contact-form.component.html:43-184`.
3. **Submit handler** — `contact-form.component.ts:66-101`. Payload mapping at `:83-91`:
   `projectType → service1`, `timeline → service2`, `privacy` **not sent**, no honeypot, no turnstile token,
   no consent timestamp. Failure branch `:97-100` only flips `submitError`.
4. **Domain port** — `apps/web/src/app/domain/repositories/contact.repository.ts:3-7`
   (`submitLead(data): Promise<void>` — no result type, no request id).
5. **Adapter** — `apps/web/src/app/infrastructure/repositories/api/api-contact.repository.ts:19`:
   `this.http.post(\`${this.baseUrl}/api/v1/contact\`, data)` via `firstValueFrom`. No timeout, no retry,
   no idempotency header.
6. **DI wiring** — `apps/web/src/app/app.repository.providers.ts:32,45`.
7. **Base URL** — `apps/web/src/app/infrastructure/http/api-base-url.token.ts:17-19`: in the browser it
   returns `environment.apiBaseUrl`, and `apps/web/src/environments/environment.prod.ts:3` sets it to `""`
   (prod replacement wired at `apps/web/angular.json:43-46`). So the browser posts **same-origin** to
   `https://tecnoriasl.com/api/v1/contact`.
8. **Edge** — Cloudflare (proxied A records; `infra/cloudflare-cutover.sh:30,121-122` sets `proxied: true`
   for `tecnoriasl.com` and `www` → `109.123.248.164`).
9. **nginx** — `infra/nginx/tecnoria.conf`, byte-identical to the deployed
   `/etc/nginx/sites-available/tecnoria.conf` (both, and the repo blob, hash to
   `017683785014bd1544be7c8ea59694d4c4d8f3f2` via `git hash-object`, sha256
   `28e744f8999ce1eef4e052d25724285c00103e79f55d44549a64b203077b871a`):
   `:26-28` the `tecnoriasl.com` server block, `:30` `client_max_body_size 20m`,
   `:43-47` `Host`, `X-Real-IP $remote_addr`, `X-Forwarded-For $proxy_add_x_forwarded_for`,
   `X-Forwarded-Proto`, `X-Forwarded-Host`, `:58-60` `location /api/ { proxy_pass http://127.0.0.1:3001; }`.
10. **Express bootstrap** — `apps/api/src/index.ts`: `:12` `app.set("trust proxy", 1)`, `:14` helmet,
    `:15-20` cors, `:21` `express.json({ limit: "1mb" })`, `:22` cookieParser, `:23` morgan,
    `:43` `app.use("/api/v1", v1Router)`, `:45-47` catch-all 404. **No error middleware** after the router.
11. **Route registration** — `apps/api/src/routes/v1/index.ts:21` `v1Router.use("/contact", contactRouter)`.
12. **Handler** — `apps/api/src/routes/v1/contact.ts`:
    `:7-15` zod schema (`z.string().min(2)`, `z.string().email()`, four optional strings, `message` min 3 —
    **no `.max()`, no `.trim()`, no normalization**);
    `:18-22` `safeParse` → `400 {code:"INVALID_INPUT"}`;
    `:25-28` parameterized `INSERT INTO contact_messages (...) VALUES ($1..$7) RETURNING id`;
    `:30` `res.status(201).json({ id: query.rows[0].id })`.
13. **Pool** — `apps/api/src/db/pool.ts:4-6` `new Pool({ connectionString: env.DATABASE_URL })`
    (default `max: 10`, no `connectionTimeoutMillis`, no `statement_timeout`, no `'error'` listener).
14. **Runtime** — `infra/systemd/tecnoria-api.service:10-14`: `WorkingDirectory=/var/www/webtecnoria/apps/api`,
    `EnvironmentFile=/etc/tecnoria/api.env`, `ExecStart=/usr/bin/node .../dist/index.js`,
    `Restart=always`, `RestartSec=2`. The deployed build matches the repo: `dist/index.js:11`
    contains `app.set("trust proxy", 1)` and `dist/routes/v1/contact.js:21` contains the same INSERT.
15. **Database** — `tecnoria.contact_messages`, verified live (the `chr(...)` concatenation is only there
    to survive the outer shell quoting; the identifiers are the literal ones):

```
$ sudo -u postgres psql -d tecnoria -At -c "select column_name, data_type, coalesce(character_maximum_length::text, chr(45)), is_nullable from information_schema.columns where table_name = chr(99)||chr(111)||chr(110)||chr(116)||chr(97)||chr(99)||chr(116)||chr(95)||chr(109)||chr(101)||chr(115)||chr(115)||chr(97)||chr(103)||chr(101)||chr(115) order by ordinal_position"
id|uuid|-|NO
name|text|-|NO
email|text|-|NO
phone|text|-|YES
company|text|-|YES
service_1|text|-|YES
service_2|text|-|YES
message|text|-|NO
created_at|timestamp with time zone|-|NO
```

16. **Response** — `201 {"id":"<uuid>"}` (55 bytes), morgan line written to journald, Angular sets
    `submitSuccess` and resets the form (`contact-form.component.ts:93-96`).

### 1.2 Where a lead can be silently lost today

| ID | Loss mechanism | Evidence |
|---|---|---|
| **L1** | **Nobody is told.** No email, no webhook, no queue, no `leads` row, no admin endpoint over `contact_messages`. The row exists only in a table no screen reads. | `contact.ts:17-31` has no `sendEmail`; `grep sendEmail apps` returns only `auth.ts:144,158,209`; `leads.ts` serves the separate `leads` table (`leads` = 0 rows, live count) |
| **L2** | **DB error kills the request and the process.** No `try/catch` in the async handler, no error middleware, Node 22 exits on unhandled rejection, systemd restarts. Client sees a hang/reset, not a `5xx`. | `contact.ts:17-31`, `index.ts:43-47` (no `(err,req,res,next)`), `tecnoria-api.service:13` |
| **L3** | **Idle-client error kills the process.** `Pool` without `'error'` listener emits an unhandled `'error'` event (Postgres restart, `pg_terminate_backend`, network blip). | `pool.ts:1-6` |
| **L4** | **Restart during submit.** No `SIGTERM` handler, no graceful shutdown, no `TimeoutStopSec`; a deploy restart cuts in-flight requests. Whether the INSERT committed is unknown to both sides → retry produces a duplicate or a hole. | `index.ts:63-72` (no signal handling), `tecnoria-api.service:12-14` |
| **L5** | **Crash-loop at boot.** `ensureDatabaseConnection()` calls `process.exit(1)`; with `Restart=always`/`RestartSec=2` a DB outage becomes a silent 2-second crash loop with no alerting. Every lead in that window is refused. | `index.ts:49-61`, `tecnoria-api.service:13-14` |
| **L6** | **Pool saturation.** 1 MB bodies × unlimited volume against `max: 10` connections, no `statement_timeout`, no `connectionTimeoutMillis` → contact traffic can starve `/auth`, `/blog`, `/leads`. | `pool.ts:4-6`, `contact.ts:26` |
| **L7** | **No audit trail.** morgan logs method/URL/status only (`index.ts:23`, `"combined"`). The row id, email and payload never reach a log; the only IP logged is the CF edge (F5). If a row were deleted, nothing would show it. | §4 evidence block |
| **L8** | **No consent record.** The privacy checkbox exists only in the browser (`contact-form.component.html:159-173`), is not in the form payload (`contact-form.component.ts:83-91`), and `contact_messages` has no consent column. Accepting the privacy policy leaves no server-side evidence — a GDPR/art.7 problem for the same lead flow. | schema + payload above |

**Not a loss, but adjacent:** `POST /api/v1/auth/access-request` inserts into `access_requests`
(`auth.ts:120-130`) and then awaits **two** `sendEmail()` calls inside the request (`auth.ts:143-169`).
With the SMTP failure of §5 the route always falls into `catch` and answers `502`
(`auth.ts:172-184`) **after the row was already inserted** — a user-visible failure with a persisted
record, i.e. the exact duplicate-on-retry pattern. Live `access_requests`: 3 rows, newest `2026-03-12`,
so the blast radius today is small but the pattern is the one that must not be copied into the contact route.

---

## 2. Abuse surface

Response evidence for volume (`P1..P4` are this audit's probes; the `5×400` burst is the previously
recorded probe run, visible in the same journal excerpt):

```
Nov 05 01:48:56 ... "POST /api/v1/contact HTTP/1.1" 400 52 "-" "curl/8.5.0"   (earlier burst: 6 log lines, 5 distinct CF edge IPs, 400 every time)
Nov 05 01:52:32 ... 172.71.148.71 ... "POST /api/v1/contact HTTP/1.1" 400 52 ... "growth02-probe-p1"
Nov 05 01:52:32 ... 172.70.240.3  ... "POST /api/v1/contact HTTP/1.1" 400 52 ... "growth02-probe-p2"
Nov 05 01:52:32 ... 127.0.0.1     ... "POST /api/v1/contact HTTP/1.1" 400 52 ... "growth02-probe-p3"
Nov 05 01:52:32 ... 192.0.2.5     ... "POST /api/v1/contact HTTP/1.1" 400 52 ... "growth02-probe-p4"
```

Ten contact POSTs in two bursts, zero `429`, zero delay. `contact_messages` count before/after the probes:
`17` / `17` (all probes were invalid payloads or `413`, so no row was created — this audit wrote nothing
to the DB).

| Vector | Concrete attempt | Blocked today? | Evidence |
|---|---|---|---|
| **Volume / flood** | Loop valid payloads | **No.** Nothing counts requests. No `express-rate-limit` in `apps/api/package.json:14-28`; no `limit_req`/`limit_conn` anywhere in `/etc/nginx/`; CF-side rules not verifiable without an API token (unverified, treat as absent). | probes above |
| **Storage exhaustion** | 1 MB `message` per request, unlimited rows | **Partly.** `express.json({limit:"1mb"})` caps a single body (`index.ts:21`); nothing caps rate or total size. nginx allows `20m` (`tecnoria.conf:30`), so the effective cap is Express's 1 MB. Empirically `1 500 043`-byte body → `413`. Disk: 80 G free. | §6 `df` |
| **Field length** | 1 MB `name`, `email`, `company` | **No.** `z.string().min(2)` / `.email()` have no upper bound (`contact.ts:8-15`). Only `message` is realistically throttled by the 1 MB body cap. | `contact.ts:7-15` |
| **Header spoofing (`X-Forwarded-For`)** | Public host + `X-Forwarded-For: 203.0.113.77` | **Ignored** on the public path (`req.ip` still the CF edge), but **not because of a control**: it is an accident of the hop count. Direct-to-node (`:3001`) requests set `req.ip` to any value. Any future IP-keyed limiter would be built on a value that is attacker-chosen on one path and shared-by-many on the other. | §4 probes P2/P4 |
| **Origin bypass** | Connect straight to `109.123.248.164:443` | **No.** `400` for the contact POST, `200` for `/health`; ufw allows `Nginx Full`/`80`/`443` from anywhere. All Cloudflare-side protection is skippable. | §4.4 |
| **Unicode / bidi / zero-width** | `RLO`/`U+202E`, `U+200B`, homoglyphs, 4-byte emoji in `name`/`company`/`message` | **No.** No normalization, no `trim()`, no control-character filter (`contact.ts:7-15`; contrast `auth.ts:124-128`, which trims). Stored raw. Display spoofing / log-forging surface for any future viewer or email. | `contact.ts` vs `auth.ts:124-128` |
| **Email header injection** | CRLF in `name`/`company` reaching a `Subject:` line | **Not exploitable today** (no email is sent from this route). **Latent:** the same interpolation pattern already exists at `auth.ts:160` (`subject: \`Nueva solicitud de acceso privada: ${body.company}\``). nodemailer 7 encodes header values, so the realistic risk is display phishing, not SMTP injection. | `auth.ts:158-168`, `email.ts:31-39` |
| **ReDoS** | Long adversarial `email` | **No regex is user-controlled**, and zod's email pattern has no nested quantifiers (linear). With no length cap the pattern still runs over up to 1 MB per request — CPU amplification (bounded by volume), not catastrophic backtracking. Angular's `phone` pattern (`contact-form.component.ts:54`) is a simple character class and is client-side only. | `contact.ts:9`, `contact-form.component.ts:54` |
| **Double submit / retry** | Double click; retry after timeout | **No.** Only guard is `[disabled]="isSubmitting"` in the template (`contact-form.component.html:176`). No unique constraint, no idempotency key, no debounce, no server-side dedupe (schema above has no such column/index). | schema, `api-contact.repository.ts:19` |
| **Bots / spam** | Automated POST | **No.** No honeypot field in `contact-form.component.html:43-184`, no Turnstile/reCAPTCHA token, no origin/`Sec-Fetch-Site` check, no CF WAF rule verified. Gmail-style spam will land as rows. | template + `contact.ts` |
| **SQL injection** | `'; DROP ...--` in any field | **Yes.** Parameterized `$1..$7` (`contact.ts:26-27`). | same |
| **Type confusion** | Arrays/objects/null in string fields | **Yes.** `safeParse` rejects → `400` (`contact.ts:18-22`). | same |
| **Wrong content type** | `text/plain` body | **Yes.** `express.json` leaves `req.body` empty → zod fails → `400`. | `index.ts:21` |
| **Error-detail leakage** | malformed input | **Yes.** Generic `"Invalid payload"` (`contact.ts:20`); no zod issue echo (contrast `leads.ts:120`). | same |
| **CSRF** | cross-site form post | **Not applicable** (no cookies/credentials consumed), but that also means **no origin gate**: any site can post leads. | `index.ts:15-20` |

---

## 3. Trusted proxy correctness — what `req.ip` actually is

### 3.1 Code and infra facts

- `apps/api/src/index.ts:12` — `app.set("trust proxy", 1)`.
- `infra/nginx/tecnoria.conf:44-45` — `X-Real-IP $remote_addr`; `X-Forwarded-For $proxy_add_x_forwarded_for`
  (`$proxy_add_x_forwarded_for` = incoming `X-Forwarded-For` + `", "` + the TCP peer of nginx).
- Layout: nginx terminates TLS on `:443` and proxies `/api/` to `127.0.0.1:3001`
  (`tecnoria.conf:58-60`); node **binds all interfaces** — `ss -lntp` shows `LISTEN 0 511 *:3001` — and is
  kept private only by ufw (which allows `22/80/443` and nothing else). So the socket peer of Express is
  always `127.0.0.1` (nginx) on real traffic, and nginx's peer is the **Cloudflare edge**, never the
  visitor. (Binding `PORT` to loopback in `index.ts:66` would be belt-and-braces.)
- No `set_real_ip_from` / `real_ip_header` exists anywhere in `/etc/nginx/` (grep returns nothing),
  although nginx is built `--with-http_realip_module`. Nothing restores the visitor IP.
- Cloudflare's documented behaviour: `CF-Connecting-IP` carries the visitor; `X-Forwarded-For` is
  **appended to**, not replaced, when the request already contains one
  ([Cloudflare HTTP headers](https://developers.cloudflare.com/fundamentals/reference/http-headers/),
  fetched 2026-11-05).

### 3.2 Resolution (reasoned, then measured)

Chain: `visitor → CF edge → nginx (127.0.0.1:443) → node (127.0.0.1:3001)`.

1. At nginx, `X-Forwarded-For` becomes `<whatever CF sent>, <CF edge IP>`, because nginx appends its peer.
2. Express with `trust proxy 1` trusts exactly one hop from the socket — that is nginx on loopback — and
   then returns the **rightmost** `X-Forwarded-For` entry.
3. That entry is the **Cloudflare edge IP**. The visitor IP is therefore **never** `req.ip`.

### 3.3 Measured — the concrete value

```
$ ssh contabo 'curl -X POST https://tecnoriasl.com/api/v1/contact -H "content-type: application/json" -d "{}" -H "user-agent: growth02-probe-p1" ...'
400
$ journalctl -u tecnoria-api --since -2min | grep growth02-probe
172.71.148.71 - - ... "POST /api/v1/contact HTTP/1.1" 400 52 "-" "growth02-probe-p1"
```

`172.71.148.71 ∈ 172.64.0.0/13` — a Cloudflare range
([cloudflare.com/ips-v4](https://www.cloudflare.com/ips-v4), 15 ranges fetched 2026-11-05). The addresses
observed for `POST /api/v1/contact` in this audit's two bursts were
`172.68.151.17`, `172.71.148.71`, `172.71.247.228`, `104.22.123.46`, `172.70.247.240`, `172.70.240.3` —
six distinct Cloudflare edges, i.e. the value is not even stable per client.

Four probes, four paths (nginx access log and API journal agree):

| Probe | Path | Header sent | `req.ip` observed | Meaning |
|---|---|---|---|---|
| P1 | public host → CF → nginx → node | — | `172.71.148.71` | CF edge (visitor lost) |
| P2 | public host, spoofed XFF | `X-Forwarded-For: 203.0.113.77` | `172.70.240.3` | spoof ignored — but only because the last hop is CF's |
| P3 | `--resolve tecnoriasl.com:443:127.0.0.1` (nginx directly), spoofed XFF | `X-Forwarded-For: 198.51.100.9` | `127.0.0.1` | nginx appended its own peer last |
| P4 | `http://127.0.0.1:3001` (node directly), spoofed XFF | `X-Forwarded-For: 192.0.2.5` | `192.0.2.5` | **arbitrary** `req.ip` on the internal port |

So today: `req.ip` = *a Cloudflare edge address* on real traffic, and *an attacker-chosen string* on any
request that reaches node without nginx in front. Any future rate limiter, abuse counter, audit log or
fraud rule keyed on `req.ip` would be built on a value that is simultaneously **not the visitor** and
**forgeable**.

### 3.4 The exact fix (not implemented — needs a WAVE B task)

1. **Restore the visitor IP at nginx** (this is the only place the peer is a genuine Cloudflare edge):
   ```nginx
   # /etc/nginx/conf.d/cloudflare-realip.conf  (new file, included by nginx.conf:65)
   set_real_ip_from 173.245.48.0/20;   set_real_ip_from 103.21.244.0/22; set_real_ip_from 103.22.200.0/22;
   set_real_ip_from 103.31.4.0/22;     set_real_ip_from 141.101.64.0/18; set_real_ip_from 108.162.192.0/18;
   set_real_ip_from 190.93.240.0/20;   set_real_ip_from 188.114.96.0/20; set_real_ip_from 197.234.240.0/22;
   set_real_ip_from 198.41.128.0/17;   set_real_ip_from 162.158.0.0/15;  set_real_ip_from 104.16.0.0/13;
   set_real_ip_from 104.24.0.0/14;     set_real_ip_from 172.64.0.0/13;   set_real_ip_from 131.0.72.0/22;
   # + the ipv6 list from https://www.cloudflare.com/ips-v6
   real_ip_header CF-Connecting-IP;
   real_ip_recursive on;
   ```
   `set_real_ip_from` is what makes `CF-Connecting-IP` trustworthy: it is only honoured when the peer is
   a Cloudflare address, so a direct connection cannot claim an arbitrary visitor IP.
2. **Then rewrite the forwarded pair** in `infra/nginx/tecnoria.conf:44-45`, because after the restore
   `$remote_addr` *is* the visitor and `$proxy_add_x_forwarded_for` would duplicate it:
   ```nginx
   proxy_set_header X-Real-IP $remote_addr;
   proxy_set_header X-Forwarded-For $remote_addr;
   ```
3. **Keep Express at one trusted hop**, but make it explicit rather than positional:
   `app.set("trust proxy", "loopback")` (`index.ts:12`). Do **not** raise the count to 2 and do **not**
   use `true`: with CF appending to a client-supplied `X-Forwarded-For`, a hop count is satisfied by any
   forged prefix — exactly the mistake this file's P2/P4 rows demonstrate.
4. **Close the bypass**: restrict `:443`/`:80` to the Cloudflare ranges (ufw/iptables), and enable
   Cloudflare **Authenticated Origin Pulls** so a forged `CF-Connecting-IP` from a non-CF peer cannot be
   delivered at all.
5. **Re-verify after the change** with the same three probes (public URL, direct origin, direct node) and
   confirm the journal shows the probe's real public address on the first two and that the third is no
   longer reachable.

### 3.5 `X-Forwarded-For` sanity note

Because Cloudflare *appends* to an existing `X-Forwarded-For`, the header at the origin may legitimately
contain attacker-supplied left-hand entries. Correctness therefore depends on reading from the **right**,
past the trusted hops — which is what `real_ip_recursive on` + `set_real_ip_from` does, and what a bare
hop count does not.

---

## 4. Email delivery reality

### 4.1 Code paths

```
$ grep -rn "sendEmail|ADMIN_NOTIFICATION_EMAIL|nodemailer" apps
apps/api/src/services/email.ts:1,18,31        (definition)
apps/api/src/routes/v1/auth.ts:9              (import)
apps/api/src/routes/v1/auth.ts:144            sendEmail → to: body.email            (access request, applicant copy)
apps/api/src/routes/v1/auth.ts:158-159        sendEmail → to: env.ADMIN_NOTIFICATION_EMAIL (access request, admin copy)
apps/api/src/routes/v1/auth.ts:209            sendEmail → to: user.email            (password recovery)
apps/api/src/config/env.ts:18                 ADMIN_NOTIFICATION_EMAIL (required by env schema)
apps/api/.env.example:14                      ADMIN_NOTIFICATION_EMAIL=oficina@tecnoriasl.com
```

**The contact route sends no email.** `contact.ts` does not import `email.ts` and never calls
`sendEmail`. `ADMIN_NOTIFICATION_EMAIL` is used in exactly **one** place (`auth.ts:159`) — the private-area
access request, not the public lead form. `env.ts:18` makes it mandatory, so it is configured, and
`/etc/tecnoria/api.env` contains all six SMTP keys (names confirmed, values never read into this report).

### 4.2 Verification method (no message sent, no credential printed)

A throwaway Node script was piped over SSH **stdin** (`ssh contabo 'node --input-type=module -'`), run as
`root`, in memory — no file was created on the server or in the repo. It parsed `/etc/tecnoria/api.env`
itself (no shell expansion, so no value could leak into a shell trace or history), resolved the deployed
`nodemailer` through `createRequire("/var/www/webtecnoria/apps/api/package.json")`, built the same
transport as `apps/api/src/services/email.ts:18-26`, and called `transporter.verify()` — an SMTP
`EHLO`/`AUTH`/`NOOP` handshake that sends **no message**. Output was scrubbed of the host, user and
password strings before printing.

```
PRESENT=SMTP_HOST,SMTP_PORT,SMTP_PASS,SMTP_USER,SMTP_FROM,ADMIN_NOTIFICATION_EMAIL
META={"smtpPort":"587","secure":false,"smtpHostTld":"gmail.com","fromDomain":"tecnoriasl.com","adminDomain":"tecnoriasl.com","userEqualsFrom":true}
NODEMAILER=7.0.13
VERIFY_FAIL code=EAUTH responseCode=534 msg=Invalid login: 534-5.7.9 Please log in with your web browser and then try again. ... 534 5.7.9 https://support.google.com/mail/?p=WebLoginRequired ...
```

### 4.3 Verdict

**BLOCKED — SMTP authentication fails.** The transport is *reachable* (TCP to port 587 succeeded, TLS
negotiated, `AUTH` was attempted and the server answered `534-5.7.9 WebLoginRequired`); the credentials
are **not accepted**. Google is refusing the login for a browser-interactive reason (typically an expired
or revoked app password, or 2-Step Verification / "less secure app" policy on the Gmail account).

Consequences, in order of importance:

1. If `contact.ts` were wired to `sendEmail()` **today**, the notification would fail — and, if wired the
   way `auth.ts` wires it (await before responding), the route would answer `502` for a lead that was
   already inserted. Any WAVE B notification work must (a) repair SMTP first, and (b) never let email
   failure change the HTTP outcome of a stored lead.
2. `POST /api/v1/auth/access-request` currently returns `502` on every call (`auth.ts:172-184`) after
   inserting the row (`auth.ts:120-130`). Live `access_requests`: 3 rows, newest `2026-03-12` — dormant,
   but it is a working example of the anti-pattern.
3. Password recovery (`auth.ts:209-222`) silently cannot deliver. It answers `202` either way
   (`auth.ts:225-229`), so the failure is invisible.

Not covered by this audit (explicitly out of scope): SPF/DKIM/DMARC alignment for a
`smtp.gmail.com` sender with a `tecnoriasl.com` `From` (`userEqualsFrom: true`). Flagged for the
deliverability task.

---

## 5. Database and backup reality

### 5.1 What exists

```
$ ssh contabo 'ls -lh /var/www/backups; ls -lh /var/backups/tecnoria/postgres; df -h /'
/var/www/backups:            content-ai-platform-20260825-201230.dump   1.5M   (NOT tecnoria)
/var/backups/tecnoria/postgres:
  tecnoria_20261105_011458.dump.gz        19K
  tecnoria_chat_20261105_011458.dump.gz  469K
/dev/sda1  145G  65G used  80G avail  45%   (filesystem of / and /var)
```

- **Exactly one generation exists** (2026-11-05 01:14), even though the script keeps 7 days.
- SHA-256 of the dumps recorded for the future drill:
  `tecnoria_20261105_011458.dump.gz` → `9942aba92491db79a032cbf7972e83d3256e3a266f336493b8524910c66083aa`;
  `tecnoria_chat_20261105_011458.dump.gz` → `1b5e453fb765f45f80df0604d8c8b0b8aefa2185756597cff8cc360ad3d71e1b`.
- Schedule: `/etc/cron.d/tecnoria-db-backup` →
  `30 3 * * * root /usr/local/sbin/tecnoria-db-backup >> /var/log/tecnoria-db-backup.log 2>&1`.
  The deployed script is byte-identical to the repo
  (`md5 fcd41d5708aa9539bfcc03c3ab0db0f1` for both `/usr/local/sbin/tecnoria-db-backup` and
  `infra/bin/backup-tecnoria-db.sh`). `/var/log/tecnoria-db-backup.log` **does not exist yet**, and the
  cron file is dated the same minute as the dump → the single dump came from a manual run, cron has not
  fired at 03:30 yet.
- Script behaviour (`infra/bin/backup-tecnoria-db.sh`): `:4` `DEST=/var/backups/tecnoria/postgres`,
  `:5` `RETENTION_DAYS=7`, `:6` dumps `tecnoria` and `tecnoria_chat`, `:13` `pg_dump -Fc | gzip -9`,
  `:14` `gzip -t`, `:15` `pg_restore -l > /dev/null` (archive integrity only), `:16` `chmod 0640`,
  `:20` deletes dumps older than 7 days.
- **No offsite copy, no encryption at rest, no upload, no failure alert** (grep of the script: it only
  prints and writes a log line). `CREATE`d/`DROP`ped inside the same filesystem as the database.
- **No PITR**: `archive_mode=off`, `wal_level=replica`, `archive_command` unset → recovery granularity is
  the last nightly dump: **RPO up to 24 h**, **RTO** = full `pg_restore` of a 19 K archive (seconds).
  Server loss = total backup loss.

### 5.2 What a legitimate non-destructive restore drill requires

Preconditions (all cheap, none satisfied yet as a procedure):

1. **Never** restore into `tecnoria`. Target a disposable database, e.g.
   `tecnoria_drill_YYYYMMDD`, owned by `postgres`, created empty.
2. Record the source archive's SHA-256 before and after (`9942aba9…` above) to prove the artifact under
   test is unchanged.
3. Restore with `pg_restore --no-owner --role=postgres -d tecnoria_drill_…` from
   `gunzip -c tecnoria_20261105_011458.dump.gz`, and capture the exact exit code.
4. Assert content, not just "no error": `SELECT count(*) FROM contact_messages` must equal the live count
   at dump time (**17**), the column set must match §1.1.15, and `users`/`blog_posts`/`leads` counts must
   match the live DB at the same instant (they are the tables that matter for auth/blog).
5. Confirm the live service is untouched: `systemctl is-active tecnoria-api` before **and** after, and a
   public `GET /health` → `200`. (Both are `active` today.)
6. `DROP DATABASE tecnoria_drill_…` and record the drop as part of the drill evidence.
7. Space budget: dump 19 K gz; restored `tecnoria` ≈ its current size **9 167 kB** (`pg_database_size`);
   add indexes/WAL. Budget ≤ 50 MB worst case.

**Disk-space verdict: permits it comfortably.** `df -h /` → **80 G available, 45 % used**; the drill
needs < 0.1 % of that. The blockers are procedural (approval for the window + a disposable DB name), not
capacity.

Also worth recording for WAVE B: one generation of backup exists, so "restore from yesterday" is not yet
possible; retention only starts working after several cron runs, and nothing alerts if a run fails.

### 5.3 Resolved false alarm — the "missing lead"

An earlier read of the nginx log suggested a lost lead; it is **not** one. Evidence chain:

```
$ zcat /var/log/nginx/access.log* | grep "POST /api/v1/contact" | grep " 201 "
104.22.195.16 - - [31/Oct/2026:08:45:21 +0100] "POST /api/v1/contact HTTP/2.0" 201 55 "https://electroria.com/" "Mozilla/5.0 (Macintosh; ...) Version/26.3 Safari/605.1.15"
$ sudo -u postgres psql -d tecnoria -At -c "select count(*), min(created_at), max(created_at) from contact_messages"
17|2026-03-10 13:25:24.421152+01|2026-10-16 09:23:30.607981+02
$ sudo -u postgres psql -d electroria -At -c "select count(*), min(created_at), max(created_at) from contact_messages"
13|2026-03-18 12:31:52.356317+01|2026-10-31 08:45:21.187424+01
$ grep -n "location /api/|proxy_pass" /etc/nginx/sites-available/electroria.conf
69:  location /api/ {
70:    proxy_pass http://127.0.0.1:3201;
```

`electroria.com` is served by the same nginx from the same box with **its own API on `:3201`** and its own
`electroria` database, whose newest `contact_messages` row is `2026-10-31 08:45:21.187` — the same second
as the `201`. The referrer is `https://electroria.com/`. So that accepted submission is electroria's, and
`tecnoria` has no missing row. **Root cause of the confusion:** `access.log` records no vhost (F13), so
`POST /api/v1/contact` lines from two different sites are indistinguishable. Costa: one hour of the audit.

Residual, real observation from the same data: in 13 retained days there is **no `201` for
tecnoriasl.com**. Combined with `max(created_at)=2026-10-16` and `leads`=0 rows, the public form is
delivering ~1 lead/month and the business has no signal for it (F1).

---

## 6. Existing tests — what the gate can and cannot catch

`qa/qa-manifest.json:4-26` declares exactly three stages:

| Stage id | argv | required | timeout | kind |
|---|---|---|---|---|
| `build-web` | `npm run build:web` | yes | 600 s | build |
| `seo-http` | `npm run test:seo` | yes | 180 s | integration |
| `build-api` | `npm run build:api` | yes | 300 s | build |

`npm run test:seo` → `tsx scripts/seo-check.ts` (`package.json:26`). What that script actually does
(`scripts/seo-check.ts`):

- boots a **stub API on `127.0.0.1:4418` that answers `404` to everything** (`:52-56`);
- spawns the SSR server on `127.0.0.1:4417` against that stub (`:58-70`);
- asserts canonical, `robots`, OG/Twitter tags, single `<h1>`, JSON-LD, 404/301/302 behaviour, asset
  caching, `robots.txt`, `sitemap.xml` (`:78-222`), then prints a summary (`:223-225`).

**The contact route is never exercised.** No request in the suite is a `POST`, and the API under test is a
stub. There is also **no API test stage at all**: `apps/api/package.json:7-13` has `dev`, `build`, `start`,
`migrate`, `seed:admin` — no `test`, and no test-runner dependency.

Repo-wide test inventory (excluding `node_modules`): seven Angular component specs, none related to
contact:

```
apps/web/src/app/app.component.spec.ts
apps/web/src/app/auth/auth-login/auth-login.component.spec.ts
apps/web/src/app/auth/auth-re-password/auth-re-password.component.spec.ts
apps/web/src/app/auth/auth-signup/auth-signup.component.spec.ts
apps/web/src/app/core/admin/admin-panel/admin-panel.component.spec.ts
apps/web/src/app/core/admin/editor-blog/editor-blog.component.spec.ts
apps/web/src/app/core/admin/lista-blogs/lista-blogs.component.spec.ts
```

**Conclusion:** the declared verification set proves the site builds and stays SEO-correct. It cannot
detect a regression in validation, persistence, rate limiting, notification or the trusted-proxy
behaviour — i.e. everything in this report. A lead-path stage (API contract test + an abuse test) does not
exist and is the single highest-value verification gap for WAVE B.

---

## 7. Recommended WAVE B scope (not implemented here)

Ordered by risk reduction per unit of work; each item is a separate task with its own review.

1. **Make the lead visible** (F1): `contact.ts` writes the lead *and* enqueues a notification; add an
   admin read path for `contact_messages` **or** migrate the write into `leads` (`source:"web_form"`, the
   enum already exists at `leads.ts:13`). Recommended: single write into `leads` + a notification outbox
   row in one transaction, so notification failure can never lose or duplicate a lead.
2. **Repair SMTP before any notification work** (F2): rotate the Gmail credential to a working app
   password (or move to a transactional provider with SPF/DKIM for `tecnoriasl.com`), prove with
   `transporter.verify()` = true, and record the evidence.
3. **Never let email decide the HTTP outcome**: insert + outbox commit → `201`; outbox worker delivers
   with retry/backoff and dead-letter. Removes the `access-requests` 502-after-insert pattern.
4. **Error containment** (F3, L2/L3/L4): `try/catch` in the handler, a terminal error middleware,
   `process.on("unhandledRejection")`, `pool.on("error")`, `statement_timeout`, `connectionTimeoutMillis`,
   and a `SIGTERM` handler with `server.close()` + pool drain.
5. **Abuse controls** (F4, F6, F9): Cloudflare Turnstile or a honeypot + a per-IP/per-session limiter
   **after** the trusted-proxy fix; nginx `limit_req` as a second layer; close `:443` to non-CF sources.
6. **Trusted proxy fix** (§3.4) — prerequisite for *any* IP-keyed control.
7. **Consent record** (F9): send a consent flag + policy version + timestamp, store them, and log the
   request id. Ties directly into the Consent Mode v2 workstream.
8. **Field limits and normalization** (F7, unicode): `.max()` per field, `.trim()`, strip control/bidi
   characters, reject non-printable in `name`/`company`.
9. **Idempotency** (F8): client-generated `Idempotency-Key` + unique index, or a 60-second
   (email, message-hash) de-dupe.
10. **Verification** (§6): a `qa-manifest` stage that boots the real API against a disposable database and
    asserts `400`/`413`/`429`/`201`/duplicate behaviour — this is what makes items 1-9 regressions-proof.
11. **Backups** (F11): run the drill of §5.2, add offsite copy + failure alerting, and record a restore
    evidence file per quarter.

---

## 8. Repository state at the end of this audit

```
Baseline (first step, 2026-11-05 01:51:03):   Final (2026-11-05 01:58:29):
$ git status --short                          $ git status --short
?? .serena/                                   ?? .serena/
                                              ?? docs/growth/GROWTH-02-SPEC.md
                                              ?? docs/growth/GROWTH-02-TASKS.md
                                              ?? docs/growth/_team/GROWTH-02-CONSENT-DISCOVERY.md
                                              ?? docs/growth/_team/GROWTH-02-LEAD-DISCOVERY.md   <- this audit
                                              ?? specs/002-measurement-consent-lead-reliability/
```

Attribution, so the boundary is unambiguous:

- `.serena/` was already untracked **before** this task started and was neither created nor touched here.
- Every other line appeared **while this audit was running** and belongs to teammates writing in the same
  checkout; their `mtime`s (all between `01:51:28` and `01:52:29`, vs. this file at `01:58:29`) place them
  before this document was written: `docs/growth/GROWTH-02-SPEC.md`, `docs/growth/GROWTH-02-TASKS.md`,
  `docs/growth/_team/GROWTH-02-CONSENT-DISCOVERY.md`,
  `specs/002-measurement-consent-lead-reliability/{spec,tasks,plan}.md`. None of them was written, edited
  or relied on by this audit. The untracked list is a moving target because the team writes concurrently,
  so this snapshot is authoritative only for the two timestamps above.
- The **only** file written by this audit is `docs/growth/_team/GROWTH-02-LEAD-DISCOVERY.md`
  (mtime `01:59`, ~41 KB). No tracked file was modified, added or deleted.

Production hygiene: no service was restarted, no deploy was run, no restore was executed, and
`contact_messages` still holds exactly **17** rows before and after all probes (`17` → `17`). Two
temporary files used to measure the payload cap (`/tmp/growth02-big.json`, `/tmp/growth02-big.txt` on the
server) were created solely for the `413` measurement and deleted in the same command; no repository file
was involved, and the Node SMTP probe ran from stdin without creating any file.

---

## 9. Evidence appendix (exact commands)

| Purpose | Command |
|---|---|
| nginx behaviour | `ssh contabo 'grep -n "proxy_set_header\|real_ip\|listen\|client_max" /etc/nginx/sites-available/tecnoria.conf'` |
| realip/limit modules | `ssh contabo 'nginx -V 2>&1 \| grep -Ei "realip\|limit_req"; grep -rn "limit_req\|set_real_ip_from\|real_ip_header" /etc/nginx/'` → realip built-in, no directives, no limiter |
| `req.ip` P1..P4 | `ssh contabo 'curl -X POST https://tecnoriasl.com/api/v1/contact …; curl --resolve tecnoriasl.com:443:127.0.0.1 …; curl http://127.0.0.1:3001/api/v1/contact …'` then `journalctl -u tecnoria-api --since -2min \| grep growth02-probe` |
| origin bypass | `curl -k --resolve tecnoriasl.com:443:109.123.248.164 https://tecnoriasl.com/health` → `200`; `…/api/v1/contact` → `400` |
| payload cap | 1 500 043-byte body → `413`, then `select count(*) from contact_messages` → `17` |
| schema/state | `sudo -u postgres psql -d tecnoria -At -c "select column_name, data_type, coalesce(character_maximum_length::text, chr(45)), is_nullable from information_schema.columns where table_name = chr(99)||…||chr(115) order by ordinal_position"`; `… -c "select count(*), min(created_at), max(created_at) from contact_messages"` → `17\|2026-03-10…\|2026-10-16…` |
| SMTP | `ssh contabo 'node --input-type=module -' < script` → `VERIFY_FAIL code=EAUTH responseCode=534` |
| backups/disk | `ssh contabo 'ls -lh /var/backups/tecnoria/postgres /var/www/backups; df -h /; cat /etc/cron.d/tecnoria-db-backup'` |
| WAL | `sudo -u postgres psql -At -c "show archive_mode"` → `off`; `"show wal_level"` → `replica`; `"show archive_command"` → `(disabled)` |
| tests | `cat qa/qa-manifest.json`; `grep -rn "test" apps/api/package.json`; `scripts/seo-check.ts:52-70` |
