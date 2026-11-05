# 90-day organic growth plan

**Start:** 2026-11-05
**Baseline:** no Search Console access; no verified traffic figure. Targets below are process and
leading-indicator targets, not forecasts of traffic or revenue.

## Days 0–30 — fix the floor and start measuring

**Objectives:** make every intended public page crawlable, canonical and measurable; remove trust
liabilities; establish the baseline.

| Action | Owner | Leading indicator | Evidence |
|---|---|---|---|
| Deploy the SSR SEO/HTTP fixes | Engineering | 32/32 public routes pass `test:seo` | release id + test output |
| Apply nginx cache/HSTS change | SRE | hashed assets return one immutable cache header; HTML no-store | `curl -I` before/after |
| Verify GSC property and sitemap submission | Owner/SEO | property verified; sitemap submitted | GSC screenshot/export |
| Add consent + GA4 consent mode | Engineering/legal | consent choice stored; analytics only after accept | browser test |
| Add form spam protection + admin notification | Engineering | test submission stored and notified | staging test |
| Remove unsourced claims | Content | 0 unsourced numeric claims in public copy | content diff |
| Baseline GSC/GA4 export | SEO | 90-day and 16-month export stored | export file (not committed) |
| Confirm legal identity/locality/clients | Owner | answers to the 7 decisions | signed brief |

**Exit criteria:** no critical SEO regression; every sitemap URL is 200/indexable/self-canonical;
GSC access exists; consent and lead measurement are live; no fabricated proof remains.

## Days 31–60 — proof and decision content

**Objectives:** turn verified projects into indexable proof; answer buying questions.

| Action | Owner | Leading indicator |
|---|---|---|
| Publish 3 verified case-study detail pages (Talkaris, Auctorio, Guía TV) with permission | Content/engineering | 3 indexable URLs with unique problem/solution/impact |
| Publish pricing/engagement page | Owner/content | one page with real ranges or a documented “desde” floor |
| Publish one comparison asset (build vs buy / how to evaluate an AI supplier) | Content | organic impressions on decision queries |
| Add case links from the 2–3 most relevant service landings | Engineering | internal links + click events |
| Start one local page only if locality is verified | Content | NAP consistent on site and one directory |
| Add `form_start` / `generate_lead` once consent exists | Engineering | event count matches CRM submissions |

**Exit criteria:** ≥3 new indexable proof URLs; ≥2 decision assets linked from money pages; lead
events reconcile with the CRM; no duplicate intent pages.

## Days 61–90 — clusters and evidence-led refinement

**Objectives:** deepen the clusters that show impressions; prune what does not.

| Action | Owner | Leading indicator |
|---|---|---|
| Review GSC queries/pages by cluster | SEO | query/page export with non-brand split |
| Improve pages with impressions but CTR < 2% | Content | title/description/H1 changes, CTR movement after 28 days |
| Expand the strongest cluster (automation, AI governance or legacy) | Content | 1 hub + 2–3 spokes with real method |
| Decide one sector bet using observed demand | Owner/SEO | one sector page or explicit deferral |
| Prune/merge articles with zero impressions and duplicate intent | Content | redirect map, no 404s |
| Review CWV lab + field (if CrUX exists) | SRE | LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at p75 (field only) |
| Decide next 90 days | Lead | documented decision with evidence |

**Exit criteria:** cluster-level GSC data exists; at least one page improved from a measured CTR
action; no unresolved critical finding; next-quarter plan approved.

## Weekly monitoring procedure

1. Export GSC last 7/28 days: clicks, impressions, CTR, position by page/query.
2. Check index coverage: new excluded URLs, canonical mismatches, soft 404s, server errors.
3. Check sitemap status and last crawl date.
4. Check GA4: organic sessions, form starts, leads, conversion rate; reconcile with CRM.
5. Check CWV/field data (if available) and lab Lighthouse for changed templates.
6. Check nginx 5xx and TTFB; verify certificate/log rotation.
7. Record one observation, one decision and one owner per week in the growth log.
8. Re-run `npm run test:seo` after every deploy.

## Target ranges (not forecasts)

| Metric | Baseline | 90-day target | Notes |
|---|---|---|---|
| Public routes passing SEO checks | 32/32 (after fix) | 32/32 + new pages | process target |
| Sitemap URLs returning 200 | 32/32 (after fix) | 100% | process target |
| GSC property | none | verified + sitemap submitted | access blocker |
| Consent/lead event | none | implemented and reconciled | compliance |
| Indexed verified case URLs | 0 | 3 if permission exists | content blocker |
| CWV p75 | field unknown; lab good | field: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 | field only |
| Qualified leads | not measurable | define after consent + CRM | no invented number |

## Risks and contingencies

- **No GSC access:** all search conclusions remain unverified. Escalate to owner; do not substitute
  third-party rank scrapes for GSC.
- **No legal identity/locality:** no local page, LocalBusiness schema or directory campaign. Keep the
  site region-level and remote-friendly.
- **No client permission:** keep three verified projects; do not invent case studies.
- **Consent reduces analytics volume:** expected; use CRM lead counts as the commercial source of truth.
- **Shared host noise:** monitor TTFB and 5xx; move to isolated infrastructure only if measured.
