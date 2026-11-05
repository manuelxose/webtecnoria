# Performance benchmarks

**Date:** 2026-11-05
**Targets:** LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile (field data).
**Field data status:** **UNAVAILABLE**. No CrUX export and PageSpeed Insights returned HTTP 429. All
numbers below are lab measurements and must not be reported as field Core Web Vitals.

## 1. Baseline — unthrottled lab (infra audit)

Measured with local headless Chrome and `PerformanceObserver`; mobile = Pixel 7 emulation, desktop
= 1366×768; no CPU or network throttling. Single sample, not a percentile.

| Metric | Mobile lab | Desktop lab |
|---|---|---|
| LCP | 0.67–0.81 s | 0.71 s |
| CLS | 0.022 | 0.006 |
| TTFB (navigation) | 400–510 ms | 355 ms |
| Origin SSR TTFB | 120–133 ms | — |

This baseline is optimistic: it has no 4G/CPU throttling. It is useful as a regression reference,
not as a Core Web Vitals verdict.

## 2. Baseline — HTTP and cache

| Item | Baseline |
|---|---|
| Homepage HTML | ~121 KB uncompressed, 55 KB inline CSS |
| Initial JS | 1.32 MB raw / ~325 KB transfer (gzip) |
| HTML cache | `no-store` ×2 |
| Hashed assets | `public` + `no-store` conflict; Cloudflare BYPASS |
| Edge TTFB | 260–322 ms |

## 3. After-state — final Lighthouse (mobile, default throttling)

Run after the final deployment (`3c7cdb9`, release `20261105_012220`). Lighthouse mobile applies
simulated slow 4G and CPU throttling, so these are deliberately harsher than the unthrottled
baseline and are **not directly comparable**.

| Metric | Run 1 | Run 2 |
|---|---|---|
| Performance score | 69 | 76 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| FCP | 2.8 s | 2.7 s |
| LCP | 3.5 s | 3.3 s |
| TBT | 660 ms | 460 ms |
| CLS | 0.013 | 0.022 |
| Speed Index | 3.3 s | 3.2 s |
| Server response | 480 ms | 370 ms |

**Interpretation:** the lab is noisy on this shared host and with third-party scripts (GA4 and the
Talkaris chat widget). The two runs differ by 7 performance points and 0.2 s LCP. **Do not claim a
Core Web Vitals pass:** LCP is 3.3–3.5 s under Lighthouse mobile throttling, above the 2.5 s target.
The origin TTFB is consistently fast (~114 ms direct; ~318 ms at the edge); the remaining cost is
client-side JS/hydration, inline CSS, GA4 and the third-party widget.

Changes made to reduce client work:

- particle canvas count reduced 80 → 48, capped at ~30 fps, paused in hidden tabs;
- chat widget mount deferred to `requestIdleCallback` (or 2.5 s fallback);
- hashed assets now served with immutable cache and are Cloudflare HITs;
- no SEO content was removed for synthetic score.

## 4. After-state — HTTP and cache

| Item | After |
|---|---|
| HTML cache | `no-store` ×1 |
| Asset cache | `public, max-age=31536000, immutable` |
| Asset edge status | `cf-cache-status: HIT` |
| Asset TTFB | ~105 ms |
| HSTS | `max-age=15552000` |
| Security headers | nosniff, SAMEORIGIN, Referrer-Policy, Permissions-Policy |
| `x-powered-by` | absent |
| Sitemap URLs returning 200 | 32/32 |

## 5. Remaining performance work

1. Add consent mode/banner; GA4 currently loads unconditionally.
2. Consider a Cloudflare Cache Rule for public HTML with a purge-on-deploy hook. This is the
   largest remaining TTFB/LCP lever; it needs an API token and a purge strategy.
3. Reduce/inline CSS or split the 72 KB stylesheet; Angular currently inlines critical CSS.
4. Evaluate whether the Talkaris widget is essential on every page; it is third-party and heavy.
5. Add a real RUM/CrUX source before making any field CWV claim.
6. Add a Lighthouse CI budget once the host noise is controlled; do not gate on a single run.

## 6. Reproduce

```bash
npx --yes lighthouse@12 https://tecnoriasl.com/ \
  --chrome-path="C:\Program Files\Google\Chrome\Application\chrome.exe" \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=lighthouse.json --quiet
```

Run at least three times and report the median; a single Lighthouse run is not a stable benchmark.
