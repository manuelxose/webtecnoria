# GROWTH-03B — Verified internal-link findings and exact patch plan

**Task:** G03B-03 (t3) — evidence only, no content edits.
**Author:** internal-link-architect (`openrouter-minimax / minimax/minimax-m3.1-flash`, L1).
**Attempt:** `da6b62de-6d21-4ac6-b928-c437ff739cb7`.
**Verified against:** HEAD `894e7c6e057df3e7bacb8b15f39c1d3b47e98ae7` (confirmed by `git rev-parse HEAD`;
working tree has only untracked docs/`.dsh-tmp`/`.serena` — no tracked file is modified).
**Sources read:** `docs/growth/GROWTH-03-INTERNAL-LINKS.md` (prior audit, read fully) + targeted reads/greps
of current source. No other file under `docs/growth/*.md` was read.
**Write scope:** this file only. No application file, template, CSS, test or manifest was modified.

---

## 0. Method and limits

All line numbers below were re-derived from the current working tree, not copied from the prior audit.
Every citation is quoted from the file at that exact line. Where the prior audit is wrong or imprecise,
that is stated explicitly in §2.

Limits (same as the prior audit, restated): counts are **static** (template + content data), not
rendered-HTML measurements; per render site, not per crawl path; no crawl, no traffic or ranking claim.
GSC evidence is still outstanding, therefore **nothing in this document is authorised for application**.

---

## 1. Verified claims

| # | Claim | Verdict | Current evidence (file:line, quoted) |
|---|---|---|---|
| 1 | `solutionNeeds` covers only software / chatbots / saas; IA, `automatizacion-procesos` and `consultoria-tecnologica` have no spotlight | **CONFIRMED** | `site-content.ts:448` `export const solutionNeeds: SolutionSpotlight[] = [`; entries close at `:485`. Paths: `:458` `path: "/servicios/desarrollo-software-medida"`; `:470` `path: "/servicios/desarrollo-chatbots-empresas"`; `:482` `path: "/servicios/plataformas-saas"`. No entry has a path under `/servicios/inteligencia-artificial-empresas`, `/servicios/automatizacion-procesos` or `/servicios/consultoria-tecnologica`. |
| 2 | `crossLink` anchor renders literal "Explorar landing"; descriptive label is only an `<h3>` | **CONFIRMED** | `service-detail-page.component.ts:130` `<h3>{{ link.label }}</h3>`; `:132` `<a class="text-link text-link--light service-cross-link-card__link" [routerLink]="link.path">`; `:133` `Explorar landing`; `:134` `</a>`. |
| 3 | Generic anchors to the cost article | **CONFIRMED (all four)** | `home-page.component.ts:409` `<article class="editorial-card home-editorial-card" *ngFor="let article of featuredInsights">`, `:415` `<a class="text-link" [routerLink]="article.seo.path">Leer artículo</a>` (source `:471` `featuredInsights = getArticlesBySlugs(featuredInsightSlugs);`). `services-page.component.ts:187` loop, `:193` `<a class="text-link" [routerLink]="article.seo.path">Leer artículo</a>`. `service-detail-page.component.ts:172` loop, `:178` `<a class="text-link" [routerLink]="article.seo.path">Leer insight</a>`. `blog-page.component.ts:284` loop over `cluster.articles`, `:304` `<a class="text-link" [routerLink]="article.path">Leer artículo</a>`. |
| 4 | Cost article has `ctaLink "/contacto"` and zero outbound links to any `/servicios` page | **CONFIRMED** | Entry object `site-content.ts:1429–1498` (array opens `:1428` `export const articles: ArticleEntry[] = [`; slug `:1430`; `ctaLabel: "Solicitar diagnóstico"` `:1436`; `ctaLink: "/contacto"` `:1437`; `seo.path` `:1442`; `sections` `:1448–1497`). No other link-bearing field exists in the entry. |
| 5 | Article page renders sections via `*ngFor` with plain `<p>{{ paragraph }}</p>` (no HTML, no anchors) | **CONFIRMED** | `article-page.component.ts:84` `*ngFor="let section of $any(current).sections; let index = index"`; `:87` `<h2>{{ section.title }}</h2>`; `:88` `<p *ngFor="let paragraph of section.paragraphs">{{ paragraph }}</p>`; `:89–91` bullets `<li *ngFor="let bullet of section.bullets">{{ bullet }}</li>`. The only `[innerHTML]` is `:96` in the `#apiArticleBlock` branch, which does **not** serve the static cost article. |
| 6 | `serviceArticleLinks` holds the cost article under software, saas and consulting only | **CONFIRMED** | `site-content.ts:493` `export const serviceArticleLinks: Record<string, string[]> = {`; slug at `:495` (software), `:516` (saas), `:522` (consulting). Not present under automation `:499–503`, chatbots `:504–508`, ai `:509–513`. |
| 7 | crossLink declarations per service; none targets `/servicios/plataformas-saas` | **CONFIRMED** | software `:653` (2: `:656` `/servicios/automatizacion-procesos`, `:662` `/servicios/consultoria-tecnologica`); automation `:793` (2: `:796` chatbots, `:802` IA); chatbots `:939` (2: `:942` IA, `:948` automation); ai `:1079` (2: `:1082` chatbots, `:1088` consulting); saas `:1219` (2: `:1222` consulting, `:1228` software); **consulting (`:1236–1362`) declares none**. 10 cards total. No `path` value equals `/servicios/plataformas-saas`. |
| 8 | `/servicios` links to each of the six service pages — with which anchor text? | **CONFIRMED that all six are linked; the anchor text is NEITHER node label nor `shortName`** | `services-page.component.ts:100` `<article class="surface-card …" *ngFor="let service of serviceCards">` with `:275` `serviceCards = services;` (6 entries). Card heading `:112` `<h3>{{ service.name }}</h3>`. The anchor is `:169–171`: `<a class="button button-primary" [routerLink]="service.seo.path">` / `Ver detalle del servicio` — i.e. the **generic** CTA; `service.name` is *not* in the anchor and `shortName` is not used on this page. |
| 9 | Footer renders all six services; anchor text source | **CONFIRMED** | `site-footer.component.ts:99` `<li *ngFor="let service of serviceLinks">`; `:100` `<a [routerLink]="service.seo.path">{{ service.shortName }}</a>`; `:154` `serviceLinks = services;`. Anchor text source = **`service.shortName`** (descriptive). |

### 1.1 Data-model facts needed by the plan (verified)

| Symbol | Location | Shape |
|---|---|---|
| `SeoEntry` | `site-content.ts:11–16` | `title, description, path, keywords?` |
| `ServiceLinkEntry` | `site-content.ts:71–75` | `label, path, description` (reusable as-is) |
| `ServiceEntry` | `site-content.ts:77–99` | includes `crossLinks?: ServiceLinkEntry[]` (`:97`), `relatedCaseSlugs?: string[]` (`:98`) |
| `ArticleSection` | `site-content.ts:114–118` | `title, paragraphs: string[], bullets?: string[]` — **plain strings, no link node** |
| `ArticleEntry` | `site-content.ts:120–132` | `slug, title, category, summary, readingTime, ctaLabel, ctaLink, publishedAt?, tags?, seo: SeoEntry, sections: ArticleSection[]` — **no inline-link field, no `linkLabel`, no `serviceLinks`** |
| `SolutionSpotlight` | `site-content.ts:149–155` | `title, description, bullets: string[], path, label` |
| `.text-link` class | `apps/web/src/styles.css:513` | global utility → usable from any component without new CSS |
| `sr-only` / `visually-hidden` | — | **does not exist anywhere in `apps/web/src`** (grep: 0 matches) |

**What the model allows without a component change:** `ArticleEntry.ctaLink` is the *only* link field on
an article, and it is single-valued. `sections[].paragraphs` / `bullets` are plain strings rendered by
text interpolation (`article-page.component.ts:88`, `:90`), so a URL written inside a paragraph renders as
literal text — it cannot become an anchor. `sections[].bullets` are the same. The "Relacionados" block
(`article-page.component.ts:133–151`) is built from `articles` only (`:277–286`), so it cannot carry a
service link either. Conclusion: **without a template change the only possible outbound service link
from an article is to repurpose `ctaLink`.**

### 1.2 Rendering surface facts (verified)

- `solutionNeeds` is rendered on **two** pages: `services-page.component.ts:210` (`:277` `scenarios = solutionNeeds;`) and `solutions-page.component.ts:65` (`:98` `needs = solutionNeeds;`, anchor `:71` `[routerLink]="need.path"` → `{{ need.label }}`).
- `services-page.component.ts:217` renders `<span class="services-scenario-card__label">Ruta {{ i + 1 }}</span>` → appending spotlights renumbers "Ruta N".
- The static article branch runs server-side: `article-page.component.ts:266–276` sets `this.article` and `:292–313` sets SEO, and `scripts/seo-check.ts:127–137` asserts the `Article` JSON-LD for `/blog/cuanto-cuesta-desarrollar-software-medida` from the SSR HTML → the static article body **is** in the server-rendered HTML.

---

## 2. Corrections to the prior audit (verified against source)

| Prior audit statement | Verdict now | Note |
|---|---|---|
| §5 classifies `services-page.component.ts:169` as "weakly specific — Ver detalle del servicio" | **Imprecise** | The anchor text is generic; `service.name` (`:112`) is *not* in the anchor. It is a generic anchor, one of the six generic surfaces the audit says the generic class covers — the audit's own list omitted it. |
| §2/§5 do not list `article-page.component.ts:149` `<a class="text-link" [routerLink]="item.path">Leer artículo</a>` | **Incomplete** | A 7th generic anchor site (outbound from an article to other articles). It does not link *to* the cost article, so it is not one of its inbounds. |
| §3 says the cost article has "exactly one" outbound (`/contacto`) | **CONFIRMED** | Plus the hardcoded `/blog` button at `article-page.component.ts:120` and the 3 related-article cards at `:134–151` — none of which point to a service. |
| §2 says "`solutionNeeds` covers software (L458), chatbots (L470), saas (L482)" | **CONFIRMED**, with one nuance the audit did not state | The 2nd spotlight's *title* is "Automatización y atención conectada" but its `path` (`:470`) is the **chatbots** landing, not `/servicios/automatizacion-procesos`. So the copy already mentions automation while the link points elsewhere — relevant if the Lead later adds an automation spotlight. |
| §3 cites `site-content.ts:488` (cost slug in `featuredInsightSlugs`) | **CONFIRMED** | `featuredInsightSlugs` `:487–491`. |
| §6 fix #4 cites "append 2 entries in the shape of L449–460" | **CONFIRMED but incomplete** | The correct shape is `SolutionSpotlight` (`:149–155`): `title, description, bullets[], path, label`. The audit's `L449–460` is the *first entry*, which is the right template, but the interface is the authoritative shape. Also: each entry is rendered on **both** `/servicios` and `/soluciones`. |
| §0 excludes the footer from inbound counts; §2 says footer anchor = `service.shortName` | **CONFIRMED** | `site-footer.component.ts:100`. |

---

## 3. Ranked patch plan (NOT applied)

Legend — **Type**: data-only / template-only / data+template. **SSR**: will the new anchor text appear in
the server-rendered HTML? **Regression guard**: which *existing* test would catch a break.
All proposals are one-line, reversible (single-file `git checkout`), add no route, no page, no
dependency, and touch no canonical/title/meta/JSON-LD input (see §4).

### Rank 1 — B: "Explorar landing" → the crossLink's own label (10 cards, 5 services)

| Field | Value |
|---|---|
| File / line | `apps/web/src/app/site/pages/service-detail-page.component.ts:133` |
| Current | `              Explorar landing` |
| Proposed | `              {{ link.label }}` |
| Type | template-only (1 line) |
| SSR | Yes — `link.label` is already interpolated at `:130` on the same card |
| Regression guard | none today; `npm run test:seo` catches only a broken build/SSR (see §5) |

Note: the label is then visible twice in the card (`:130` `<h3>` and the anchor). Variant **B2** removes
the duplication by turning the heading into the link (still template-only, 2 lines changed):
replace `:130–134` with

```
            <h3><a class="text-link text-link--light service-cross-link-card__link" [routerLink]="link.path">{{ link.label }}</a></h3>
            <p>{{ link.description }}</p>
```

B2 changes heading semantics (the anchor becomes the heading) — a UX/a11y judgement for the Lead.
B1 is the smaller diff; B2 is the cleaner card. **Lead picks one; do not apply both.**

### Rank 2 — A + C: descriptive anchor text on the article cards (6 inbounds of the cost article)

Smallest diff = reuse the title the card already shows. No data, no interface, no CSS change.

| Site | File / line | Current | Proposed |
|---|---|---|---|
| home featured insights | `home-page.component.ts:415` | `<a class="text-link" [routerLink]="article.seo.path">Leer artículo</a>` | `<a class="text-link" [routerLink]="article.seo.path">{{ article.title }}</a>` |
| `/servicios` featured insights | `services-page.component.ts:193` | `<a class="text-link" [routerLink]="article.seo.path">Leer artículo</a>` | `<a class="text-link" [routerLink]="article.seo.path">{{ article.title }}</a>` |
| service-detail related insights | `service-detail-page.component.ts:178` | `<a class="text-link" [routerLink]="article.seo.path">Leer insight</a>` | `<a class="text-link" [routerLink]="article.seo.path">{{ article.title }}</a>` |
| blog list card | `blog-page.component.ts:304` | `<a class="text-link" [routerLink]="article.path">Leer artículo</a>` | `<a class="text-link" [routerLink]="article.path">{{ article.title }}</a>` |
| (optional, 7th site) article "Relacionados" | `article-page.component.ts:149` | `<a class="text-link" [routerLink]="item.path">Leer artículo</a>` | `<a class="text-link" [routerLink]="item.path">{{ item.title }}</a>` |

- **Type**: template-only (4–5 lines, 4 files). **SSR**: yes (`article.title` / `item.title` are already
  rendered as the card heading at `home-page.component.ts:411`, `services-page.component.ts:189`,
  `service-detail-page.component.ts:174`, `blog-page.component.ts:300`).
- **Rejected alternatives (and why):**
  - `article.seo.title` — shorter and keyword-shaped (`"Cuánto cuesta desarrollar software a medida"`),
    but it exists only on `ArticleEntry`; `blog-page.component.ts` iterates `BlogCardView`
    (`:21–27`, built at `:333–345`) which has **no** `seo` field → using it would require widening the
    view type and the mapping (larger diff, 3 extra edits). Only worth it if the Lead wants a uniform
    shorter anchor and accepts a bigger diff.
  - New `linkLabel` field on `ArticleEntry` (`site-content.ts:120–132`) + a value for all 13 article
    entries + the `BlogCardView` type/mapping + the 4 template lines → the **largest** diff for the same
    SEO effect. Rejected.
  - Keep "Leer artículo" visible and add `aria-label="{{ article.title }}"` → smallest *visual* diff,
    but Google weights visible anchor text; `aria-label` is not a substitute. Rejected for SEO purposes.
  - Keep the short CTA and append a visually-hidden title → needs a `sr-only` utility that does **not**
    exist in `apps/web/src` → new CSS. Rejected (out of the minimal-diff scope).
- **Cost of duplication:** the anchor text then repeats the card heading verbatim (screen readers hear
  the same title twice per card). Accepted trade-off, but the Lead should be told.

### Rank 3 — D: give the cost article an outbound link to `/servicios/desarrollo-software-medida`

**Contingent on GSC Q4 evidence — this plan only states the mechanism.**

**Mechanism (i) — reuse an existing field (data-only, no component change).** The only existing field
is `ctaLink` (`site-content.ts:1437`).
- Current: `    ctaLink: "/contacto",` → Proposed: `    ctaLink: "/servicios/desarrollo-software-medida",`
- and `site-content.ts:1436` `ctaLabel: "Solicitar diagnóstico"` → e.g. `ctaLabel: "Ver software a medida"`.
- **Cost/risk:** removes the article's *only* conversion path (`/contacto`) from its primary CTA
  (rendered `article-page.component.ts:117–119`). Lead-generation and GA4 `generate_lead` flows are
  business-critical; this trades a conversion for an internal link. **Not recommended.**

**Mechanism (ii) — optional `serviceLinks` on `ArticleEntry` + a small template block (recommended).**
1. `site-content.ts:120–132` — add one optional field to `ArticleEntry` (no new type needed;
   `ServiceLinkEntry` at `:71–75` already has `label`/`path`/`description`):
   `  serviceLinks?: ServiceLinkEntry[];`
2. `site-content.ts:1429–1498` — add to the cost article entry (e.g. after `seo` at `:1447`):
   `    serviceLinks: [ { label: "Desarrollo de software a medida", path: "/servicios/desarrollo-software-medida", description: "…" } ],`
3. `apps/web/src/app/site/pages/article-page.component.ts` — new block in the "Siguiente paso" aside
   (`:110–121`), inserted between `:119` and the hardcoded `/blog` button at `:120`:
```
              <div class="article-callout" *ngIf="$any(current).serviceLinks?.length">
                <a class="text-link" [routerLink]="$any(current).serviceLinks[0].path">
                  {{ $any(current).serviceLinks[0].label }}
                </a>
              </div>
```
   `$any(current)` is required because `article` is a union (`:174–188`) — this matches the existing
   pattern at `:84` and `:96`.
- **Type**: data + template (3 files, ~10 lines).
- **SSR**: Yes — the static branch is server-rendered (§1.2); `*ngIf` on `$any(current).serviceLinks` is
  false for API articles, so API-sourced articles are unaffected.
- **Cost/risk:** the only real risk is a template typo → SSR/build failure, which `npm run build:web` +
  `npm run test:seo` catch immediately. No CSS needed (`.text-link` is global, `styles.css:513`).
  The `/contacto` CTA stays. Contained to one article: the field is optional, so every other article is
  unaffected. Reversible by deleting one object literal.
- **Verdict: mechanism (ii) is the safest minimal mechanism.** (i) is the smallest diff but converts a
  conversion path into an internal link.

### Rank 4 — F: `solutionNeeds` coverage (data-only)

- **Worthwhile?** Partially. `solutionNeeds` is the only `/servicios` surface with a descriptive anchor
  (`services-page.component.ts:224` → `{{ item.label }}`, and `solutions-page.component.ts:71`), and each
  entry also lands on `/soluciones`. But the *weakest* service by inbound count, `desarrollo-software-medida`
  (Σ 4 non-footer), **already has a spotlight** (`:458`). IA (Σ 5) and consulting (Σ 7) are the ones
  without one — adding them spreads link equity to pages that are not the weakest, so the internal-linking
  case for F is weaker than for D. Cheapest and most defensible: **one IA entry** (IA has products and
  GSC impressions but no spotlight); consulting and `automatizacion-procesos` are optional.
- **Exact data shape** (`SolutionSpotlight`, `site-content.ts:149–155`):
  `  { title: string, description: string, bullets: string[], path: "/servicios/<service-path>", label: string }`
  where `path` must equal that service's `seo.path` and `label` is the anchor text rendered at
  `services-page.component.ts:224` / `solutions-page.component.ts:71`.
- **Type**: data-only (append inside `:448–485`). **SSR**: yes. **Side effect to flag:** `services-page.component.ts:217`
  renders "Ruta N" → new entries renumber the existing cards ("Ruta 4", "Ruta 5").
- If an automation spotlight is ever wanted, note that the *existing* 2nd spotlight already carries
  automation copy but points at chatbots (`:470`) — repointing it is a **content** change needing the
  Lead/GSC sign-off.

### Rank 5 — E: inbound links to the cost article from other pages (data-only)

- Highest-value single variant: add `"cuanto-cuesta-desarrollar-software-medida"` to
  `serviceArticleLinks.automation` (`site-content.ts:499–503`). Data-only, one line; renders in the
  "Contenido de apoyo" block of the automation service page (`service-detail-page.component.ts:160–182`)
  with the anchor from `:178`.
- **Reader value:** moderate — a visitor on the automation page gets a realistic cost framework.
- **Condition:** apply **after** Rank 2 (C), otherwise the new inbound carries the generic "Leer insight"
  anchor and adds no keyword value.
- **Why it is not higher:** the cost article already has 6 non-footer inbounds (home featured, `/servicios`
  featured, 3 relatedInsights, blog card) + sitemap. The article's actual structural defect is the
  **outbound** side (Rank 3), not the inbound count. Adding inbounds to a link sink does not fix a sink.

---

## 4. Candidate G — canonical / title / meta description / JSON-LD impact

**None of A, B, C, D, E or F changes a canonical URL, `<title>`, meta description or JSON-LD.** Verified:

- Canonical, `og:url`, title/description come from `SeoService.update()` (`apps/web/src/app/site/services/seo.service.ts:36–38`, `:67`, `:94`) fed by `config.path` / `config.description`; the article page sets them from the content data (`article-page.component.ts:292–298`), the service page from `service.seo`. Anchor text is not an input to any of them.
- JSON-LD: `createArticleSchema` (`seo.service.ts:191`) takes title/description/path/image; `createServiceSchema` (`:138`) takes the service's own name/description; the `@graph` `WebPage` (`:261`) / `BreadcrumbList` (`:111`) nodes never enumerate anchors. No schema enumerates `crossLinks`, `solutionNeeds` or `relatedInsights`.
- `scripts/seo-check.ts` asserts canonical per `PUBLIC_PATHS` (`:95–113`), exactly one `<h1>` (`:90`, `:107–111`), robots/og/twitter (`:83–88`), JSON-LD presence and types (`:91–93`, `:125`, `:137`), sitemap coverage (`:205–214`). Ranks 1–5 change none of those inputs: they only change the text inside existing `<a>` elements (A, B, C) or add **one `<a>` inside an existing aside** (D(ii)) — no new `<h1>`, no new route, no new `PUBLIC_PATHS` entry.
- The single residual risk is a **build/SSR failure** from a template typo, which `npm run build:web` + `npm run test:seo` catch immediately. `solutionNeeds` (F) does not touch `/servicios` or `/soluciones` canonical/title/JSON-LD either (each page's SEO comes from its own `seo.update`).

---

## 5. Test inventory — what renders SSR HTML and what is asserted about anchors

| Suite | Command | Renders SSR HTML? | Asserts anything about anchor text? |
|---|---|---|---|
| `scripts/seo-check.ts` | `npm run test:seo` | **Yes** — spawns `apps/web/dist/server/server.mjs` (`:58–70`), requests every `PUBLIC_PATHS` route (`:95–113`) | **No.** It asserts status, canonical (`:82`, `:101`), robots meta (`:84`, `:102`), og/twitter (`:87–89`), `<h1>` count (`:90`, `:107–111`), JSON-LD (`:91–93`, `:112`, `:125`, `:137`), 404/301 redirects (`:139–164`), cache headers (`:174–197`), robots.txt + sitemap (`:199–221`). **Zero anchor assertions.** |
| `scripts/browser-consent.mjs` | `npm run test:browser` (optional stage, `qa/qa-manifest.json:47–53`) | **Yes** — builds the SSR app and drives Chrome over CDP (`:20`, `:305`) | **No.** It asserts consent behaviour, GA4 gating, contact-form payload, and hydration cleanliness (`:1264`). `clickText()` is used only for consent buttons (`:625`, `:665`, `:760`, `:767`); the only anchor check is inside the consent dialog (`:960`, `:971–974` → `/politica-de-cookies`). |
| `scripts/tests/consent.test.mjs` | `npm run test:consent` | No — reads `apps/web/src/index.html` (`:219–221`) | No |
| `scripts/tests/analytics-dispatch.test.mjs` | `npm run test:analytics` | No — reads `contact-form.component.html` | No |
| `scripts/perf-baseline.mjs` | (perf harness) | Yes (measures the SSR build) | No |

**Grep of `scripts/` for the three generic literals — all zero matches:**

| Literal | Matches in `scripts/` |
|---|---|
| `Leer artículo` | **0** |
| `Leer insight` | **0** |
| `Explorar landing` | **0** |

⇒ **No existing test would catch a regression in any of these anchor texts.** `npm run test:seo` is
mandatory after any of Ranks 1–3 (it is the only gate that would notice a broken build), but it is *not*
an anchor guard. New assertions are required.

### 5.1 Proposed NEW assertions

**(a) In `scripts/seo-check.ts`** — rendered-HTML guards, added after the article block (after `:137`).
Smallest diff: one helper + per-URL assertions; no new file, no `package.json` change, no
`qa/qa-manifest.json` change (the existing `seo-http` stage runs it).

```
    const anchorTexts = (html: string, href: string): string[] =>
      [...html.matchAll(new RegExp(`<a[^>]+href="${href}"[^>]*>([\\s\\S]*?)</a>`, "gi"))].map((m) =>
        m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      );
```

Then, for the cost article inbound (home + services + blog + 3 service pages), assert the anchor text
carries the title, e.g. on `articleHtml` / the home and services pages:

```
    assert.ok(
      anchorTexts(homeHtml, "/blog/cuanto-cuesta-desarrollar-software-medida").some((t) =>
        t.includes("Cuánto custa desarrollar software a medida")
      ),
      "the cost-article inbound anchor must be descriptive"
    );
```

and a per-href negative guard (scoped to the href, because the page legitimately contains other
"Leer artículo" anchors, e.g. `article-page.component.ts:149`):

```
    for (const href of ["/blog/cuanto-cuesta-desarrollar-software-medida"]) {
      for (const text of anchorTexts(articleHtml, href)) {
        assert.doesNotMatch(text, /^(Leer artículo|Leer insight|Explorar landing)$/);
      }
    }
```

and for the crossLink cards, on each service page:

```
    assert.ok(
      anchorTexts(serviceHtml, "/servicios/consultoria-tecnologica").some((t) =>
        t.includes("Consultoría tecnológica")
      ),
      "crossLink anchors must render the crossLink label"
    );
```

**(b) New `scripts/tests/internal-links.test.mjs`** — *data-invariant* guards that need no SSR
(plain `node:test` + `readFileSync` of the content module source, or a small parse of the TS exports).
Recommended assertions:

1. Every `serviceArticleLinks[serviceKey]` slug exists in `articles` (no dead related-insight links).
2. Every `solutionNeeds[].path` equals an existing service `seo.path`.
3. Every `crossLinks[].path` equals an existing service `seo.path` (would have caught a bad path).
4. **Guard the invariant the audit found broken:** at most N of the article cards may use a generic
   anchor string — i.e. assert that the templates no longer contain the literals `>Leer artículo<`,
   `>Leer insight<`, `>Explorar landing<` (a source-level grep over the four component files), so a
   future edit cannot silently reintroduce a generic anchor.
5. If D(ii) ships: assert `ArticleEntry` declares `serviceLinks?` and that every `serviceLinks[].path`
   is an existing service `seo.path`.

Note for the implementer: adding a **new npm script** for (b) requires editing `package.json` and
`qa/qa-manifest.json` — outside this task's write scope. If the Lead prefers zero manifest churn,
(b) can be folded into the existing `test:seo` stage as additional `assert` blocks.

---

## 6. Authorisation status and sequencing

- **Nothing here is applied.** GSC query+page evidence is still outstanding, so no content change is
  authorised. Every entry above is a plan with an exact current line and an exact proposed replacement.
- Suggested order once the Lead releases the block: **Rank 2 (A+C) → Rank 1 (B) → Rank 3 (D(ii)) → Rank 4 (F) → Rank 5 (E)**.
  Ranks 1–3 are pure anchor/label changes and can ship together as one reviewed patch (4 files, 5 lines).
- After any implementation: `npm run build:web` then `npm run test:seo` (mandatory, `qa/qa-manifest.json:6–18`),
  then the new §5.1 assertions, then independent review by a different model family (MiniMax implementer → DeepSeek V4 Pro / Claude Sonnet 5.5 reviewer).
- Files this plan does **not** touch: `site-content.ts`, any `*.component.ts`, any CSS, `qa/qa-manifest.json`,
  `package.json`, any `docs/growth/*.md` other than this file.
