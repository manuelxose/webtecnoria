# INFRA-AUDIT — Tecnoria (tecnoriasl.com)

- **Auditor:** infra-sre (Contabo / SRE)
- **Date:** 2026-11-05 (Europe/Madrid)
- **Method:** READ-ONLY. SSH (`contabo` alias, root) for host inspection + external HTTPS probes from the auditor machine. No service restarts, no config edits, no firewall/DNS changes, no deploys.
- **Scope:** OS/versions, services, TLS, nginx, systemd, deployment/rollback, backups, log rotation, monitoring, HTTP behavior, logs/crawlers, Core Web Vitals (lab), recommendations.
- **Secret/IP policy:** no secret values, env values, private keys, or visitor IPs are reproduced. Certificate/key files are referenced by path only. Cloudflare CDN edge ranges are referred to in aggregate, not listed.

## 1. Executive summary

The site is **live and reachable**, served by **Cloudflare (proxy) → nginx → Angular SSR (Express)** on a shared Contabo VPS. Origin SSR is healthy (~120 ms TTFB). The dominant performance issue is that **nothing is cached at the Cloudflare edge** (`cf-cache-status: BYPASS/DYNAMIC` everywhere) because a blanket nginx `add_header Cache-Control "no-store"` on `location /` adds a **second, conflicting `Cache-Control`** header that defeats the app's own `public, max-age=31536000` on hashed JS/CSS, `robots.txt` and `sitemap.xml`. Reliability gaps: **no scheduled backup for the `tecnoria`/`tecnoria_chat` PostgreSQL databases** and **no monitoring/alerting for tecnoria**. Lab Core Web Vitals are already "good"; field (CrUX) data is unavailable.

## 2. Host facts (observed)

| Item | Value |
|---|---|
| OS | Ubuntu 24.04.3 LTS (Noble), kernel 6.8.0-147-generic |
| CPU | 6 vCPU AMD EPYC (1 socket, 6 cores, 1 thread/core) |
| RAM | 11 Gi total, ~8 Gi available; swap 4 Gi (unused) |
| Disk | /dev/sda1 145 G, 65 G used, 80 G avail (45%) |
| Load | transient 3.90 → settled 0.50 (6-core box; noisy neighbors) |
| nginx | 1.24.0 (Ubuntu), built with `--with-http_v2_module` (no brotli, no http3/quic modules) |
| Node | v22.21.0, npm 10.9.4; no pm2 (services managed by systemd) |
| Uptime | 14 days; 4 SSH sessions |
| Other tenants | Electroria, GuiaTV, Talkaris, Auctorio/content-ai (many `content-ai-*` workers), Embarcarte — **shared host** |

## 3. Services (systemd, all active/running unless noted)

| Unit | NRestarts | RSS | Notes |
|---|---|---|---|
| tecnoria-web | 0 | ~122 MB | Angular SSR, `ExecStart=run-release-entry.sh …/releases/current/server/server.mjs`, user `tecnoria`, `Restart=always RestartSec=2` |
| tecnoria-api | 0 | ~35 MB | Node `/var/www/webtecnoria/apps/api/dist/index.js`, wants postgresql |
| tecnoria-chat-api / -portal / -widget | 0 | 72/115/16 MB | run from `/var/www/talkaris/…` |
| tecnoria-chat-ingest | 1 | ~47 MB | `--watch` |
| mongod, postgresql@16-main, valkey, docker, nginx | running | — | shared infra |

Last start of tecnoria-web/api: 2026-10-21 21:18. No crash-looping on tecnoria units.

## 4. TLS / certificate

- Origin cert: **Cloudflare Origin CA** (`/var/lib/tecnoria/ssl/origin.crt`), subject `CloudFlare Origin Certificate`, valid **2026-03-10 → 2041-03-06**. Edge/visitor cert is Cloudflare-managed. `.selfsigned.*.bak` files dated 2026-03-10 show the origin was migrated from a self-signed cert to Cloudflare Origin CA.
- nginx: `ssl_protocols TLSv1.2 TLSv1.3; ssl_session_cache 10m; ssl_session_timeout 1d`. Origin cert/key are **not** shown here (paths only).

## 5. nginx routing (tecnoria.conf)

- `:80` → `301 https://$host$request_uri`.
- `www.tecnoriasl.com:443` → `301 https://tecnoriasl.com$request_uri`.
- `tecnoriasl.com:443` (`http2`): `/health`→4300, `/api/`→3001, `/uploads/`→3001 (`expires 30d, immutable`), `/chat-api/`→4101, `/chat-widget/`→4102 (`expires 30d`), `/`→4300 (web SSR).
- Global nginx.conf: `gzip on` (level 5, min 512, types incl. text/css/js/json/svg/fonts), `sendfile on`, `worker_processes auto`, `worker_connections 768`, `server_tokens off` **commented out**.
- **No security headers and no `proxy_hide_header X-Powered-By`** in the tecnoria server block.

## 6. HTTP measurements (public, external client, 2026-11-05 ~00:48 CET)

| URL | Code | Cache-Control (as seen) | Content-Encoding | cf-cache-status | TTFB |
|---|---|---|---|---|---|
| `/` | 200 | `no-store` **×2** | gzip | DYNAMIC | ~260 ms |
| `/servicios` | 200 | `no-store` ×2 | gzip (16.5 KB) | DYNAMIC | ~322 ms |
| `/servicios/desarrollo-software-medida` | 200 | `no-store` ×2 | gzip (15.4 KB) | DYNAMIC | ~257 ms |
| `/pagina-inexistente-xyz-404-test` | **200 (soft-404)** | `no-store` ×2 | gzip (7.9 KB) | DYNAMIC | ~267 ms |
| `/robots.txt` | 200 | `public, max-age=31536000` **+** `no-store` | gzip | BYPASS | ~132 ms |
| `/sitemap.xml` | 200 | `public, max-age=31536000` **+** `no-store` | gzip | DYNAMIC | ~150 ms |
| `/main-B2FNCNNT.js` | 200 | `public, max-age=31536000` **+** `no-store` | gzip | **BYPASS** | — |
| `/styles-KGNLOAAK.css` | 200 | `public, max-age=31536000` **+** `no-store` | gzip | **BYPASS** | — |
| `http://tecnoriasl.com/` | 301 → `https://tecnoriasl.com/` | — | — | — | OK |
| `https://www.tecnoriasl.com/` | 301 → `https://tecnoriasl.com` | — | — | — | OK |

- Origin-direct TTFB (`curl http://127.0.0.1:4300/` on host): **120–133 ms** → SSR is healthy; the extra edge latency is Cloudflare→origin round-trip with no edge cache.
- Homepage HTML is ~121 KB uncompressed, mostly **inline `<style>` blocks** (Angular inlines component CSS into the SSR HTML).
- **HTTP/2** on at origin (nginx `http2`) and Cloudflare edge; **HTTP/3** advertised via `alt-svc: h3=":443"`. Brotli **not** applied (gzip only). Client probe used HTTP/1.1 (local curl lacks `--http2`).
- Headers observed: `Server: cloudflare`, `x-powered-by: Express` (origin info leak). **Missing on tecnoria responses:** `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`.

## 7. Logs, reliability, crawlers

- Log rotation present: `/etc/logrotate.d/nginx` → daily, `rotate 14`, compress, postrotate `nginx rotate`. Current access log ~690 KB/day partial, `.1` 22 MB (full prior day); error log small (2.9 KB).
- **tecnoriasl.com errors:** none in the last 7 days of `error.log` (no upstream/5xx for tecnoria).
- Shared-host note: `guiaprogramaciontv.com` is repeatedly `connect() failed (111: Connection refused)` to upstreams `127.0.0.1:4000`/`127.0.0.1:3000` (a tenant crash/loop, not tecnoria) — evidence this is a busy, multi-tenant box.
- Crawler activity on `tecnoriasl.com` (access.log Nov 4–5): **~14 Googlebot/Bingbot fetches, essentially all HTTP 200**; Bingbot near-zero. Low crawl volume consistent with a small, infrequently-updated site. (IPs aggregated/omitted per policy.)

## 8. Deployment, backup, monitoring

- **Release state:** `releases/current → 20260320_110038` (built **2026-03-20**); 5 releases retained. Deploy = `deploy-tecnoria-web.sh` → `publish-frontend-release.sh` (`npm run build:ssr`, publish, repoint `current`, restart, health-check `127.0.0.1:4300/` expecting `"IA aplicada para empresas"`). Rollback = repoint `current` symlink to a prior release + restart (safe, scripted).
- **Backups:** **No cron/systemd-timer backup for `tecnoria` or `tecnoria_chat` Postgres DBs found.** `/var/backups/` holds only Auctorio dumps; `/var/www/backups/` has a single `content-ai-platform-20260825…dump`. Only `auctorio-backup` and `embarcarte` cron entries exist. **This is the top reliability gap** (verify Contabo panel snapshots as a possible external safety net).
- **Monitoring:** `sysstat` (sar) collection present; **no** node_exporter/netdata/prometheus/alerting. `guiatv-health-watchdog.timer` exists for GuiaTV only; **tecnoria has no watchdog or uptime/alerting**.
- `unattended-upgrades` running (auto security updates on). Disk 45% used — ample headroom.

## 9. Core Web Vitals (lab only — field data NOT available)

Measured with local headless Chrome (CDP PerformanceObserver; mobile = Pixel 7 emulation, desktop = 1366×768; **no CPU/network throttling**), read-only, 2026-11-05:

| Metric | Mobile (lab) | Desktop (lab) | Status |
|---|---|---|---|
| LCP | ~0.67–0.81 s | ~0.71 s | Good (<2.5 s) |
| CLS | ~0.022 | ~0.006 | Good (<0.1) |
| TTFB (nav) | ~400–510 ms | ~355 ms | — |

- **Field (CrUX) data: UNAVAILABLE.** PageSpeed Insights API returned `429 RESOURCE_EXHAUSTED` (no API key/quota) and no CrUX export is configured. Do **not** treat these as field/RUM numbers; they are single-machine lab samples without throttling, so real 4G mobile will be slower.
- FCP was not reliably captured by this method and is not reported.

## 10. Prioritized recommendations (each with benefit / risk / rollback)

**P0 — reliability**

1. **Add scheduled PostgreSQL backups for `tecnoria` + `tecnoria_chat`** (daily `pg_dump`, gzip, N-day retention, mirror the existing `auctorio-backup` cron pattern). *Benefit:* prevents data loss; *Risk:* low (read-only dump, watch disk); *Rollback:* remove cron entry. **Needs approval (writes to server + disk).**

**P1 — performance (largest, low-risk win)**

2. **Fix the conflicting `Cache-Control` header.** In `tecnoria.conf`, remove the blanket `add_header Cache-Control "no-store"` from `location /`; instead: (a) serve hashed static assets with `Cache-Control: public, max-age=31536000, immutable` (ideally `proxy_hide_header Cache-Control` + own `add_header`, or serve `browser/` assets directly via nginx `root`), and (b) set HTML to a short edge cache `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` (or `no-store` only for genuinely personalized pages). *Benefit:* unblocks Cloudflare edge caching of JS/CSS/`robots.txt`/`sitemap.xml` → origin offload + much lower asset/HTML TTFB; *Risk:* low if the immutable rule is restricted to content-hashed filenames (`*-[A-Z0-9]{6,}.js|.css`); *Rollback:* restore previous config + `nginx -t && systemctl reload nginx`. **Needs approval (nginx change + reload).**

3. **Add security headers + hide server fingerprint.** In `tecnoria.conf`: `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;` `X-Content-Type-Options nosniff`, `X-Frame-Options SAMEORIGIN` (or `DENY`), `Referrer-Policy strict-origin-when-cross-origin`, `Permissions-Policy camera=(), microphone=(), geolocation=()`; add `proxy_hide_header X-Powered-By;` (or set `app.disable('x-powered-by')` in Express). *Benefit:* security posture, removes info leak; *Risk:* low (introduce CSP only later, permissive first); *Rollback:* revert + reload. **Needs approval (nginx/app change).**

4. **Return a true HTTP 404** for missing pages instead of 200 + `noindex` meta (current soft-404). *Benefit:* correct crawl/indexing; *Risk:* low; *Rollback:* revert app catch-all. (App-side; coordinate with growth/implementation team.)

**P2 — content freshness**

5. **Refresh `sitemap.xml` `lastmod` and redeploy current code.** Sitemap `lastmod` is frozen at **2026-03-11** and production release at **2026-03-20**. *Benefit:* fresh crawl signals; *Risk:* deploy risk — mitigated by the existing release-symlink rollback; *Rollback:* repoint `current` to prior release + restart. **Needs approval (deploy).**

**P3 — optional**

6. **Brotli** (Cloudflare "Brotli" toggle, or add `ngx_brotli` at origin): ~15–20% smaller HTML vs gzip. *Benefit:* marginal on already-gzipped HTML; *Risk:* low; *Rollback:* toggle off.
7. **Monitoring/alerting for tecnoria** (uptime probe + a lightweight exporter/alert, e.g. node_exporter + external alert, or Cloudflare health checks). *Benefit:* early detection of the crash-loop class seen on a tenant; *Risk:* low; *Rollback:* remove agent/config. **Needs approval (agent install).**
8. **Evaluate shared-host isolation.** `content-ai-*` workers caused a transient load 3.9 spike on the 6-core box. *Benefit:* predictable SSR latency; *Risk:* n/a (advisory); *Rollback:* n/a.

## 11. Flags requiring explicit approval

- Any nginx edit + reload (items 2, 3).
- Any deploy/redeploy (item 5).
- Adding DB backup cron and monitoring agent (items 1, 7).

No server changes were made during this audit.

## 12. Commands run (evidence, abridged)

- `ssh contabo 'uname -r; nproc; free -h; df -h; nginx -v; node -v; systemctl list-units --type=service --state=running'`
- `ssh contabo 'cat /etc/nginx/sites-available/tecnoria.conf; nginx -T | grep -iE "gzip|add_header|http2"; nginx -V'`
- `ssh contabo 'openssl x509 -in /var/lib/tecnoria/ssl/origin.crt -noout -subject -issuer -dates'`
- `ssh contabo 'systemctl show tecnoria-{web,api,chat-*} -p ActiveState -p NRestarts -p MemoryCurrent'`
- `ssh contabo 'ls releases/current; cat /var/www/bin/deploy-tecnoria-web.sh; crontab -l; ls /etc/cron.d; cat /etc/logrotate.d/nginx'`
- `ssh contabo 'grep Googlebot|bingbot access.log | awk … | uniq -c'` (aggregated, IPs omitted)
- `curl.exe -sS --compressed -o NUL -D - -w "ttfb=… code=…" <each URL>` for `/`, `/servicios`, service page, 404, `robots.txt`, `sitemap.xml`, http→https, www→apex, `main-*.js`, `styles-*.css`
- `ssh contabo 'curl -s -o /dev/null -w "ttfb=…" http://127.0.0.1:4300/'` (origin TTFB)
- Local headless Chrome (CDP) script for lab LCP/CLS (script removed after run; values in §9).
- PageSpeed Insights API attempt → `429 RESOURCE_EXHAUSTED` (field data unavailable).

## 13. Residual risks (read-only scope)

- Field/RUM CWV and real-user traffic shaping are not measurable from this read-only access (no CrUX, no RUM beacon).
- Contabo panel-level snapshots/offsite backups were not inspected (no panel access) — confirm externally.
- Crawler counts are from the shared nginx access log and are approximate (IPs and partial lines omitted).
