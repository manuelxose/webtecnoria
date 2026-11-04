# Contabo infrastructure audit

**Date:** 2026-11-05
**Access:** root SSH to Contabo VPS `109.123.248.164` (host alias `contabo`), read-only.
**Status:** PASS for discovery; backup and monitoring gaps are open.

## 1. Host facts

| Item | Observed |
|---|---|
| OS | Ubuntu 24.04.3 LTS, kernel 6.8.0-147-generic |
| CPU / RAM | 6 vCPU AMD EPYC; 11.9 GB RAM, 4 GB swap |
| Disk | 145 GB, 65 GB used (45%), 80 GB free |
| nginx | 1.24.0, HTTP/2 and gzip modules; no brotli, no HTTP/3 at origin |
| Node | v22.21.0; no PM2; systemd units |
| Shared host | Electroria, GuiaTV, Talkaris/Auctorio/content-ai, Embarcarte and others |
| Uptime | 14+ days; 4 SSH sessions at audit time |

## 2. Tecnoría services

| Unit | State | Notes |
|---|---|---|
| `tecnoria-web` | active, 0 restarts | Angular SSR on 127.0.0.1:4300 |
| `tecnoria-api` | active, 0 restarts | Express on 127.0.0.1:3001 |
| PostgreSQL 16 | active | local socket and 127.0.0.1:5432 |
| nginx | active | 80/443, HTTP/2 |

No tecnoria 5xx errors in the last 7 days. Origin SSR TTFB measured 120–133 ms.

## 3. TLS and routing

- Cloudflare Origin CA certificate valid 2026-03-10 → 2041-03-06.
- `:80` → 301 HTTPS; `www` → 301 apex.
- `/api/` → 3001; `/uploads/` → 3001; `/chat-api/` → 4101; `/chat-widget/` → 4102; `/` → 4300.
- `server_tokens` was not disabled; `x-powered-by: Express` leaked from origin.
- No HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` or CSP
  at the nginx layer at baseline; the Express app now sets most of these.

## 4. The main performance defect

`location /` added `Cache-Control: no-store` to every proxied response, including hashed JS/CSS,
`robots.txt` and `sitemap.xml`. The app already set `public, max-age=31536000` for those files, so
clients received **two conflicting** `Cache-Control` headers and Cloudflare showed
`cf-cache-status: BYPASS/DYNAMIC` on every asset. HTML also received the header twice.

## 5. Deployment and rollback

- Current release: `apps/web/releases/current -> 20260320_110038`, built 2026-03-20.
- GitHub Actions `deploy.yml` runs `infra/deploy-webtecnoria.sh` on push to `master`.
- Web deploy uses `publish-frontend-release.sh`: build, validate staging, copy to a timestamped
  release, repoint `current`, restart `tecnoria-web`, smoke local and public.
- Rollback: repoint `current` to the previous release and restart; previous releases are retained
  (5 by default).
- The current release directory does not contain `release.json` (older publish format), so the
  release identifier must be recorded from the symlink/path and git commit.

## 6. Backups and monitoring

- **No scheduled PostgreSQL backup** for `tecnoria` or `tecnoria_chat` found.
- `/var/backups/` holds only Auctorio dumps; `/var/www/backups/` has one content-ai dump.
- `auctorio-backup` and `embarcarte` cron entries exist; tecnoria has none.
- Log rotation: nginx daily, 14 compressed files.
- No node_exporter, netdata, Prometheus or alerting for tecnoria.
- `unattended-upgrades` is running; disk headroom is healthy.
- Shared host has noisy-neighbour risk; a `content-ai-*` load spike was observed.

## 7. Crawler and error evidence

- ~14 Googlebot/Bingbot fetches in the observed nginx window; nearly all HTTP 200.
- No tecnoria upstream/5xx errors in the last 7 days.
- `guiaprogramaciontv.com` had repeated `connect() failed (111)` to its own upstreams — a different
  tenant, not tecnoria.

## 8. Risks and required approvals

| Change | Risk | Rollback | Approval |
|---|---|---|---|
| nginx cache/header edit + reload | low if backed up and `nginx -t` passes | restore config + reload | required |
| add PostgreSQL backup timer | low; disk usage | remove timer | required |
| add monitoring agent | low | remove agent/config | required |
| deploy app release | medium; mitigated by release symlink | repoint + restart | required |

No server changes were made during the audit.
