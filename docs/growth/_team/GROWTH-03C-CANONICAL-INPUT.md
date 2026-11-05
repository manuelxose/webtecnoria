# GROWTH-03C — Canonicalization input: HTTP/HTTPS matrix, sitemap, links, DNS and the GSC read

Task `t1` · member `release-engineer` · attempt `fd1dc923-b6ed-4ab1-9c32-7dc566c54864`
Route (as assigned): `openrouter-minimax / minimax/minimax-m3.1-flash` (L2). Cost UNKNOWN (no provider usage sample).
Evidence date: 2026-11-05. Client: Windows host (Node v24.18.0, own TLS stack) + origin host `contabo` for origin-direct and IPv4/IPv6 checks.
**Read-only**: only `GET` requests and file reads. No configuration, DNS, nginx or index change was made.

---

## 1. Canonicalization matrix (real responses)

Command (Windows host, Node `fetch` with `redirect: "manual"`, one hop at a time):

```js
const r = await fetch(url, { redirect: "manual" });
console.log(r.status, r.headers.get("location"), r.headers.get("strict-transport-security"));
```

| start URL | hop 0 | hop 1 | hop 2 | hops | final URL | HSTS |
|---|---|---|---|---:|---|---|
| `http://tecnoriasl.com/` | `301` → `https://tecnoriasl.com/` | `200` | — | **2** | `https://tecnoriasl.com/` | absent on the 301; `max-age=15552000` on the 200 |
| `http://www.tecnoriasl.com/` | `301` → `https://www.tecnoriasl.com/` | `301` → `https://tecnoriasl.com` | `200` | **3** | `https://tecnoriasl.com/` | absent on both 301s; `max-age=15552000` on the 200 |
| `https://www.tecnoriasl.com/` | `301` → `https://tecnoriasl.com` | `200` | — | **2** | `https://tecnoriasl.com/` | absent on the 301; `max-age=15552000` on the 200 |
| `https://tecnoriasl.com/` | `200` | — | — | **1** | `https://tecnoriasl.com/` | `max-age=15552000` |

Final canonical tag in the rendered HTML — **identical on all four paths**:

```
<link rel="canonical" href="https://tecnoriasl.com/">
```

Rendered HTML size at the final hop: 125,767 bytes (Cloudflare edge). Origin-direct (bypassing Cloudflare): 125,377 bytes on the wire / 125,096 bytes after `$( )` strips trailing newlines.

### Server-side corroboration (origin host, `curl -D -`)

```
-- http://tecnoriasl.com/       HTTP/1.1 301 Moved Permanently   Location: https://tecnoriasl.com/
-- http://www.tecnoriasl.com/   HTTP/1.1 301 Moved Permanently   Location: https://www.tecnoriasl.com/
-- https://www.tecnoriasl.com/  HTTP/2 301                        location: https://tecnoriasl.com
```

`/etc/nginx/sites-available/tecnoria.conf` (read-only):

```nginx
server { listen 80;  server_name tecnoriasl.com www.tecnoriasl.com;
         location ^~ /.well-known/acme-challenge/ { root /var/www/letsencrypt; }
         return 301 https://$host$request_uri; }

server { listen 443 ssl http2; server_name www.tecnoriasl.com;
         return 301 https://tecnoriasl.com$request_uri; }

server { listen 443 ssl http2; server_name tecnoriasl.com;
         add_header Strict-Transport-Security "max-age=15552000" always;
         location / { proxy_pass http://127.0.0.1:4300; } }
```

**Observations (none blocking):**

* The `www` → apex redirect emits `https://tecnoriasl.com` **without a trailing slash** for the root path, while the http → https redirect preserves `$request_uri` (so `https://www.tecnoriasl.com/` → `https://tecnoriasl.com` → the client then requests `https://tecnoriasl.com/`). These are the same URL after normalisation; cosmetic only.
* HSTS is added **only** in the apex 443 block. That is the block browsers actually end on, so the HSTS path is effective. The `http` 301 and the `www` 301 carry no HSTS — harmless (HSTS over plain HTTP is ignored; `www` is never a canonical host).
* `max-age=15552000` = **180 days**, below the 31536000 (1 year) common recommendation. See §6.

---

## 2. Sitemap hostnames

`https://tecnoriasl.com/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /portal
Disallow: /acceso-restringido
Disallow: /auth-
Disallow: /api/
Disallow: /uploads/
Sitemap: https://tecnoriasl.com/sitemap.xml
```

* **One** `Sitemap:` directive, **https**, apex host only.
* `https://tecnoriasl.com/sitemap.xml` → 6,419 bytes, **33 `<loc>` entries, 33/33 on host `tecnoriasl.com`** (0 on `www`, 0 on `http`).
* First entries: `https://tecnoriasl.com/`, `https://tecnoriasl.com/servicios`, `https://tecnoriasl.com/servicios/desarrollo-software-medida`.

---

## 3. Internal-link hostnames in the rendered home page

Absolute-URL hosts found in the rendered HTML (origin-direct body and Cloudflare-edge body agree):

| host | occurrences |
|---|---:|
| `tecnoriasl.com` | 9 |
| `schema.org` | 1 |
| `www.googletagmanager.com` | 1 |
| `www.tecnoriasl.com` | **0** |
| `http://tecnoriasl.com` | **0** |

Root-relative `href="/…"` links: **63** at the origin, **65** at the Cloudflare edge. The two extra are Cloudflare's own injected `/cdn-cgi/…` references (`cdn-cgi` occurrences: **2** at the edge, **0** at the origin).

* **No `www` links, no `http://` links, no absolute links to any other host.** Every navigation link is root-relative or points at the apex https host. The canonical tag is present and identical at the edge and at the origin.
* Edge vs origin body delta: origin 125,096 (captured) vs edge 125,486–125,767, i.e. **+390 bytes of Cloudflare-injected markup** (Rocket Loader / `cdn-cgi` script tags). Two edge fetches of the same URL differ at byte 119,453 because the injected script carries a per-response id. **This is edge behaviour, not an application defect, and it does not affect canonicalization.**

---

## 4. IPv4 vs IPv6 consistency

DNS (Node `dns.resolve4` / `resolve6`):

```
tecnoriasl.com      A     -> 188.114.96.5, 188.114.97.5
tecnoriasl.com      AAAA  -> 2a06:98c1:3120::5, 2a06:98c1:3121::5
www.tecnoriasl.com  A     -> 188.114.97.5, 188.114.96.5
www.tecnoriasl.com  AAAA  -> 2a06:98c1:3120::5, 2a06:98c1:3121::5
```

Both hostnames resolve to the **same four addresses**; both families are present for apex and `www`.

Live fetch parity (origin host):

```
curl -4 https://tecnoriasl.com/    -> 200  bytes=125767  remote=188.114.96.3
curl -6 https://tecnoriasl.com/    -> 200  bytes=125767  remote=2a06:98c1:3120::3
curl -4 --resolve tecnoriasl.com:443:127.0.0.1 -k -> 200 bytes=125377   (origin-direct)
```

**Verdict: IPv4 and IPv6 are consistent** — same status, same body size, same redirects, same canonical, on the same Cloudflare anycast addresses. (The address seen by the client varies per request — `…96.3` vs `…96.5` — which is normal Cloudflare anycast behaviour, not a configuration inconsistency.)

---

## 5. GSC read: is the `http://tecnoriasl.com/` impression row a live technical defect?

### The evidence (existing repo artefacts, read-only)

`docs/growth/_team/gsc-baseline.json` (property `sc-domain:tecnoriasl.com`, `queriedAt` 2026-11-05T01:02:24.127Z), `byPage`:

| page | clicks | impressions | ctr | position |
|---|---:|---:|---:|---:|
| `https://tecnoriasl.com/` | 2 | 33 | 0.0606 | 7.12 |
| `http://tecnoriasl.com/` | **0** | **18** | 0 | 10.56 |
| `https://clientes.tecnoriasl.com/` | 1 | 5 | 0.2 | 4.4 |

`docs/growth/_team/GROWTH-03B-AUDIT-INPUT.md` line 30 (independent audit, DeepSeek V4 Pro): *"`http://tecnoriasl.com/` indexed separately: d90 12 rows / 21 imp / 0 clicks — **CONFIRMED**."* (d90 = 2026-08-05..2026-11-02.)

### Verdict: **expected consolidation — NOT a live technical defect.**

Reasoning, tied to the live measurements above:

1. The **live** behaviour is already correct: `http://` → `301` → `https://tecnoriasl.com/`; the canonical tag is self-referential `https://tecnoriasl.com/`; the sitemap contains **only** `https://tecnoriasl.com/` URLs; `robots.txt` points only at the https sitemap; the rendered page contains **no** `http://` or `www` absolute links.
2. The GSC property is a **domain property** (`sc-domain:tecnoriasl.com`), so every scheme and subdomain variant of the domain is aggregated into the same property. Google reports a **Page row per URL variant it has seen**, and the `http://` variant is a historical row from crawls before/around the https migration.
3. The row is a **strict minority with zero clicks** (18 impressions / 0 clicks vs 33 / 2 for the https row in the same export; 21 impressions / 0 clicks in d90). Impressions on the legacy row are historical and will decay on their own now that every http request 301s to https.
4. There is **no live defect to fix**: nothing in the current stack emits `http://` or `www` canonicals, links or sitemap entries.

### Smallest safe correction: **none on the infrastructure side.**

Do **not** touch nginx, do **not** change the canonical tag, do **not** add `hreflang`, do **not** change the sitemap, do **not** add a second `http` host. Any of those would be a change with no measurable upside and real risk.

Optional **operator-only** actions (none required, none executed by me):

1. GSC **URL Inspection** on `http://tecnoriasl.com/` → confirm Google reports the declared canonical as `https://tecnoriasl.com/`. Read-only check.
2. GSC **URL Inspection → Request indexing** on `https://tecnoriasl.com/` to accelerate consolidation of the legacy row. Needs GSC UI access and owner authorisation.
3. The GSC **Removals** tool *can* retire the http row faster, but it is a visibility action with a real downside risk (a mis-scoped removal can suppress the https URL as well). **Not recommended** as "the smallest safe correction".
4. Keep the existing repo rule: filter the property by host and exclude the legacy WordPress noise (`clientes.tecnoriasl.com`, `cms.tecnoriasl.com`) — `https://clientes.tecnoriasl.com/` is present in the same export (1 click / 5 impressions) and must not be read as TECNORIA demand.

---

## 6. Backlog items (not for this release)

| id | severity | item | evidence | suggested action |
|---|---|---|---|---|
| CAN-1 | low | HSTS `max-age=15552000` (180 d) below the 1-year norm; no `includeSubDomains` | `add_header Strict-Transport-Security "max-age=15552000" always;` in the apex 443 block only | After verifying every subdomain is HTTPS-only, raise to `31536000` and consider `includeSubDomains`. Cosmetic; do not bundle with the link release. |
| CAN-2 | low | `www` → apex redirect emits `https://tecnoriasl.com` without the trailing slash | live `curl -D -` on `https://www.tecnoriasl.com/` | Normalise to `https://tecnoriasl.com$request_uri` for exact-match with the http→https rule. Equivalent URL after normalisation; no SEO effect. |
| CAN-3 | low | Cloudflare injects ~390 bytes of `cdn-cgi` markup and varies it per response | origin 125,096 vs edge 125,486–125,767 bytes; `cdn-cgi` occurrences 2 at the edge, 0 at the origin | Document as expected edge behaviour. If the team wants byte-identical edge output, evaluate Rocket Loader — but the canonical, hosts and site links are already identical. |

---

## 7. Commands used (all read-only)

```bash
# client-side matrix (Node v24.18.0)
node canon-matrix.js    # fetch(url,{redirect:"manual"}) per hop; canonical extraction;
                        # robots.txt + sitemap.xml <loc> host census; dns.resolve4/resolve6

# origin host
curl -sS -o /dev/null -D - http://tecnoriasl.com/
curl -sS -o /dev/null -D - http://www.tecnoriasl.com/
curl -sS -o /dev/null -D - https://www.tecnoriasl.com/
curl -4 -fsS -o /dev/null -w '%{http_code} %{size_download} %{remote_ip}\n' https://tecnoriasl.com/
curl -6 -fsS -o /dev/null -w '%{http_code} %{size_download} %{remote_ip}\n' https://tecnoriasl.com/
curl -fsS --resolve 'tecnoriasl.com:443:127.0.0.1' -k https://tecnoriasl.com/ | wc -c
cat /etc/nginx/sites-available/tecnoria.conf
```

**Final status of this task: PASS — matrix, sitemap, link-host, DNS/IPv4/IPv6 facts and the GSC read are all backed by executed output. No infrastructure was changed.**