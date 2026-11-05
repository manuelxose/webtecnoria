# Contabo optimization report

**Date:** 2026-11-05
**Release after change:** `20261105_011306` (git `e68b1c4`, then `1d09c65`/`dccd540` included)
**Pre-change nginx backup:** `/var/backups/tecnoria/nginx/tecnoria.conf.20261105_005920.bak`

## 1. Applied changes

| Change | Before | After | Evidence |
|---|---|---|---|
| nginx HTML cache header | `Cache-Control: no-store` added twice | Express owns HTML `no-store`, nginx adds none | `curl -I /` -> one `no-store` |
| Hashed asset cache | `public, max-age=31536000` + `no-store`; Cloudflare BYPASS | `public, max-age=31536000, immutable`; Cloudflare HIT | `curl -I /main-ycgmtydg.js` |
| `robots.txt` / `sitemap.xml` | one-year cache + `no-store` | one-hour origin policy (Cloudflare may extend browser TTL) | `curl -I /robots.txt` |
| HSTS | absent | `max-age=15552000` | `curl -I /` |
| `X-Content-Type-Options` | absent | `nosniff` (Express; nginx for uploads/widget) | `curl -I /` |
| `X-Frame-Options` | absent | `SAMEORIGIN` | `curl -I /` |
| `Referrer-Policy` | absent | `strict-origin-when-cross-origin` | `curl -I /` |
| `Permissions-Policy` | absent | camera/microphone/geolocation disabled | `curl -I /` |
| `x-powered-by` | `Express` | absent | `curl -I /` |
| DB backup | none for tecnoria | daily 03:30, 7-day retention, verified dump | `/etc/cron.d/tecnoria-db-backup`, `/var/backups/tecnoria/postgres/` |

## 2. Measurements after the change

| Metric | Before | After |
|---|---|---|
| HTML TTFB (edge) | ~260–322 ms | ~318 ms (noise; HTML not edge-cached) |
| Origin SSR TTFB | 120–133 ms | 114 ms |
| Asset edge cache | `BYPASS` | `HIT` |
| Asset TTFB | origin round-trip every request | ~105 ms on HIT |
| HTML cache headers | `no-store` ×2 | `no-store` ×1 |
| Security headers | missing | present |
| 404 | 200 soft-404 | 404 + noindex |
| legacy URL | 200 | 301 |
| missing asset | 200 HTML | 404 text/plain |

The HTML remains dynamic by design. That is acceptable: the origin is fast (~114 ms) and private
routes must never be cached. A short edge cache for public HTML would be the next performance step,
but it requires a purge strategy and is not enabled.

## 3. Unified asset redirect chain

During the first deployment, a normalization rule redirected uppercase hashed asset paths to
lowercase. On Linux the lowercase file does not exist, so browsers received `301 -> 404`. Cloudflare
cached the 301 for six months on the affected URLs. The fix:

1. do not lowercase paths that contain a file extension;
2. index the browser output at startup and serve the matching lowercase file for cached lowercase
   URLs.

Live verification: the cached uppercase URL still 301s, the lowercase target returns `200
application/javascript`, and all 14 JS/CSS assets referenced by the homepage return 200. This keeps
the site working until the cached 301s expire; a Cloudflare purge would remove the extra hop but
requires an API token not available in this environment.

## 4. Backup evidence

```
backup ok: /var/backups/tecnoria/postgres/tecnoria_20261105_011458.dump.gz (18711 bytes)
backup ok: /var/backups/tecnoria/postgres/tecnoria_chat_20261105_011458.dump.gz (469K)
```

`pg_restore -l` was executed against both dumps by the backup script and exited 0. The dumps are
mode 0640 root:root. This proves the archive is readable; it is **not** a full restore test into a
separate database. A restore drill remains recommended.

## 5. Still open

- Offsite/Contabo panel snapshot verification (no panel access).
- Monitoring/alerting for tecnoria units (not installed).
- Cloudflare cache purge for the cached 301 URLs (no token).
- Full DB restore drill into a disposable database.
- Field Core Web Vitals (CrUX) unavailable.
