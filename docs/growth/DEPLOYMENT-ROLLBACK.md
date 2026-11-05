# Deployment and rollback

**Date:** 2026-11-05
**Target:** Contabo VPS `109.123.248.164`, `https://tecnoriasl.com`
**Pre-deploy release:** `apps/web/releases/20260320_110038`
**Pre-deploy git HEAD:** `8b45733`
**Final release:** `apps/web/releases/20261105_012220` (code `3c7cdb9`, GitHub Actions run `41940740641`; final docs HEAD `f77c7b2`)
**Nginx backup:** `/var/backups/tecnoria/nginx/tecnoria.conf.20261105_005920.bak`
**Nginx pre-change SHA-256:** `757158cb1f770486a008646b6ad19344c1adf180a3a567dfa29c205747bc36aa`

## 1. Deployment path

1. Commit on `master` and push.
2. GitHub Actions `.github/workflows/deploy.yml` SSHes to the VPS as `deploy`.
3. `sudo /var/www/webtecnoria/infra/deploy-webtecnoria.sh`:
   - `git fetch` + `git pull --ff-only origin master`;
   - `npm install --no-audit --no-fund`;
   - build API, restart `tecnoria-api`, smoke `127.0.0.1:3001/health`;
   - build web SSR via `publish-frontend-release.sh`, validate staging, publish a timestamped
     release, repoint `current`, restart `tecnoria-web`, smoke local and public.
4. The service entry is `/var/www/bin/run-release-entry.sh` with the `releases/current` symlink.

The nginx config is **not** copied by the deploy script. It is applied manually with a backup and
`nginx -t` (see §3).

## 2. Pre-deploy checks (executed)

| Check | Result |
|---|---|
| `npm run build:web` | exit 0 |
| `npm run test:seo` | exit 0, 32 public routes, JSON-LD, 404/301, cache, sitemap |
| `npm run build:api` | exit 0 |
| `git diff --check` | no output |
| Independent review | PASS WITH FINDINGS; findings fixed and re-reviewed |
| Pre-deploy release recorded | `20260320_110038` |
| Nginx backup recorded | `.20261105_005920.bak` |

## 3. Apply the nginx change

```bash
ssh contabo
ts=$(date +%Y%m%d_%H%M%S)
cp -a /etc/nginx/sites-available/tecnoria.conf \
  /var/backups/tecnoria/nginx/tecnoria.conf.$ts.bak
install -m 0644 /var/www/webtecnoria/infra/nginx/tecnoria.conf \
  /etc/nginx/sites-available/tecnoria.conf
nginx -t
systemctl reload nginx
curl -sSI https://tecnoriasl.com/main-*.js | grep -i cache-control
```

If `nginx -t` fails, restore the backup and reload before any further action.

## 4. Post-deploy smoke checks

```bash
curl -sS -o /dev/null -w '%{http_code}\n' https://tecnoriasl.com/
curl -sS -o /dev/null -w '%{http_code}\n' https://tecnoriasl.com/servicios
curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' https://tecnoriasl.com/nosotros
curl -sS -o /dev/null -w '%{http_code}\n' https://tecnoriasl.com/this-does-not-exist
curl -sS -o /dev/null -w '%{http_code} %{content_type}\n' https://tecnoriasl.com/assets/nope.js
curl -sS https://tecnoriasl.com/ | grep -E 'rel="canonical"|application/ld\+json|name="robots"'
curl -sS https://tecnoriasl.com/sitemap.xml | grep -c '<loc>'
curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' https://tecnoriasl.com/dashboard
```

Expected: 200 public, 301 legacy, 404 unknown/missing asset, canonical/robots/JSON-LD in raw HTML,
32 sitemap URLs, 302 private.

## 5. Rollback

**Application:**

```bash
ssh contabo
readlink -f /var/www/webtecnoria/apps/web/releases/current   # note current
ln -sfn /var/www/webtecnoria/apps/web/releases/20260320_110038 \
  /var/www/webtecnoria/apps/web/releases/.current_tmp
mv -Tf /var/www/webtecnoria/apps/web/releases/.current_tmp \
  /var/www/webtecnoria/apps/web/releases/current
systemctl restart tecnoria-web
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4300/health
```

**Nginx:**

```bash
cp -a /var/backups/tecnoria/nginx/tecnoria.conf.20261105_005920.bak \
  /etc/nginx/sites-available/tecnoria.conf
nginx -t && systemctl reload nginx
```

**Git:** do not hard-reset production. Revert with a new commit (`git revert c5a3284`) and push; the
workflow deploys the revert.

## 6. Known deployment risks

- A new public route absent from `seo-route-manifest.ts` will return 404. Add the route and a
  sitemap entry before deploying; `test:seo` checks sitemap drift but cannot know about a route that
  exists only in `app.routes.ts`.
- The blog publication check calls the API on first request for a non-static slug; a 1.2s timeout
  and a 60s cache limit the impact.
- The deploy script runs `npm install` on the server; a dependency resolution change can fail the
  build. The previous release symlink remains available.
- No automatic database migration is run unless `MIGRATE=1`; this release has no migrations.
