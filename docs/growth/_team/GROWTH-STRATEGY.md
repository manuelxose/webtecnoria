# TecnoRia — Commercial organic growth strategy and intent map

Owner: growth-strategist (task t2) · Date: 2026-11-05 · Status: working strategy, no code changes.
Scope: tecnoriasl.com. Deliverable of record for the SEO/growth workstream.

## 0. Evidence protocol (read before any number below)

| Tag | Meaning |
|---|---|
| `[REPO]` | Read directly from this repository, path + line cited. |
| `[LIVE]` | Fetched from https://tecnoriasl.com on 2026-11-05 (HTTP 200). |
| `[SERP]` | Page observed in results for a named query via the `web_search` index on 2026-11-05 — **not** a geo-localised Google SERP, rank position or local pack. |
| `[HYP]` | Hypothesis from reasoning; validate before it drives spend. |

Hard limits: **no search volumes, difficulty scores, rankings or CTR** — I had no Search Console, Keyword
Planner or geo-localised SERP access, and no analytics, CRM or client-permission data. Any "1.900
búsquedas/mes" figure for this market would be invention. `[SERP]` proves only that *some* page ranks for
the query and these showed up — not who ranks first in Vigo. Competitor claims are quoted as *theirs*.

---

## 1. What Tecnoria actually sells

### 1.1 Offer — six service lines, one delivery process

`[REPO]` `apps/web/src/app/site/content/site-content.ts:526-1362`, routed at `app.routes.ts:494-540`.
Six landings, each with its own copy, FAQ and cross-links: **software a medida**
(`/servicios/desarrollo-software-medida` — custom apps, internal tools, private portals, backoffices,
integrations, reporting); **automatización de procesos** (`/servicios/automatizacion-procesos` — manual
work removal, CRM/ERP/form sync, rules, alerts, logs); **chatbots**
(`/servicios/desarrollo-chatbots-empresas` — web/WhatsApp/internal assistants on real knowledge,
escalation rules); **IA aplicada** (`/servicios/inteligencia-artificial-empresas` — agents, copilots,
document classification, supervised AI in operations); **plataformas y SaaS**
(`/servicios/plataformas-saas` — multi-user products, MVPs, portals, marketplaces, roles/billing);
**consultoría tecnológica** (`/servicios/consultoria-tecnologica` — audit, architecture review,
prioritisation). Delivery `[REPO]` `site-content.ts:392-423`: Discovery → Blueprint → Build by increments →
Launch → Evolution — a project business by phases, plus two own SaaS products (Talkaris, Auctorio).

### 1.2 Proof assets that exist — and their weakness

- 8 case studies `[REPO]` `site-content.ts:1362-1521`: 2 own products, 1 named client platform
  (guiaprogramaciontv.com), 5 sector-only narratives. 3 testimonials, all anonymous (role + generic
  company) `[REPO]` `:2430-2449`.
- Product stats `[REPO]` `site-content.ts:2581-2586, 2679-2684`: "99.9% uptime", "<200ms latencia",
  "60% reducción de tickets", "10× velocidad editorial", "100% control de marca". One testimonial repeats
  the same 60% `[REPO]` `:2443-2447` — stat and quote restate each other; no independent source.

**Finding (trust, high).** Unverifiable precision claims are live `[LIVE]`; they are the first thing a
technical buyer tests, and untraceable they cost more trust than they buy. Publish the method/sample or
remove them — never replace them with new invented numbers.

### 1.3 Contact path and geography

- `[REPO]` `site-content.ts:1-9`: `oficina@tecnoriasl.com`, `+34 682 04 78 02`,
  `SITE_REGION = "Galicia, España"`; footer "Galicia · España" (`site-footer.component.ts:40`). The form
  (`contact-form.component.html:52-169`) asks name, email, company, phone, need, timeline, message — no
  budget field, no booking, no WhatsApp entry.
- **No street address, postal code, city, legal name or CIF/NIF anywhere in `apps/web/src`** — the only
  geography token in the site source is "Galicia". Third parties do name a city: LinkedIn "Tecno Ria
  Vigo" `[SERP]` [linkedin.com/company/tecno-ria-vigo](https://es.linkedin.com/company/tecno-ria-vigo);
  a B2B index lists "Tecno Ria Vigo … Vigo, Spain" `[SERP]`
  [find-lead.com](https://find-lead.com/companies/spain/?page=28).

**Finding (local, high).** The site claims a region but never a locality while third parties name a city:
a local-relevance gap (`addressLocality: "Galicia"` is a region, not a locality) *and* a NAP
inconsistency. No honest local strategy is possible until this is resolved.

---

## 2. Page inventory vs search intent

| URL | Primary intent | Issues |
|---|---|---|
| `/` | Brand + mixed commercial | `[LIVE]` `keywords` meta targets "software a medida galicia" while nothing local exists on the page |
| `/servicios` | Commercial hub | Competes with its own 6 children; its own doc assigns it the children's terms `[REPO]` `docs/seo-architecture.md:18` |
| 6 service landings | BOFU commercial | Good unique copy, but no pricing, no named proof, no sector framing, overlapping terms |
| `/soluciones` | Scenario commercial | Repackages the same three offers as the landings `[REPO]` `site-content.ts:448-485`; no new vocabulary |
| `/casos-de-exito` | Proof | **No per-case URL** — no route exists `[REPO]` `app.routes.ts:542-547`; proof is not indexable |
| `/metodologia` | Trust / discovery | "discovery técnico" targeted here *and* by the consulting landing *and* by a blog article |
| `/empresa` | Brand | No team, no legal identity, no history, no named people |
| `/blog` (13 articles) | Informational | 6 of 13 absent from sitemap (§4) |
| `/faq` | Support / BOFU | FAQPage duplicated on `/` and `/faq` `[REPO]` `faq-page.component.ts:81-87`; +18 service FAQs |
| `/productos/talkaris`, `/productos/auctorio` | Product commercial | Not in main nav `[REPO]` `site-content.ts:255-263, 2382-2390`, not in sitemap |
| `/contacto` | Transactional | Correct; qualification is thin (no budget/scheduling anchor) |

### 2.1 Cannibalisation risks (ranked)

1. **Chatbot demand split three ways** — service landing, `/productos/talkaris` and
   `/blog/chatbots-atencion-cliente-empresa` all target chatbot/asistente terms `[REPO]`
   (`site-content.ts:824-835, 2589-2601, 1777-1840`). Split: landing = service, product = platform,
   article = decision; enforce distinct title/H1/FAQ sets.
2. **"Software a medida"** across landing, SaaS landing and two build-vs-buy articles. **Discovery/
   consultoría** across landing, `/metodologia` and article. **`/soluciones` vs the landings** — same
   offers, no new information.
3. **FAQ duplication** on `/`, `/faq` and every landing; FAQ rich results are largely unavailable to
   commercial sites `[HYP]`, so duplication mostly adds schema noise.

### 2.2 Gaps the offer supports but the site does not serve

- **No sector page** — admitted in the repo's own audit `[REPO]` `docs/seo-architecture.md:148-153`,
  although the cases hold the material (industria-distribución, servicios B2B, media); **no locality page
  and no honest locality string** (§1.3).
- **No pricing/engagement page.** Nothing states a range, floor or discovery cost, while competitors
  publish anchors `[SERP]` (Kōdo: web 48 h / 290 €, MVP 2–4 semanas); for "cuánto cuesta desarrollar
  software a medida" we have an article but no next step that mentions money. **No comparison/decision
  page** either ("agencia vs software factory", "software a medida vs low-code", "cómo evaluar un
  proveedor de IA") — a format competitors run `[SERP]`.
- **No funding-program content.** Spain's Plan IA360 / Bono IA (600 M€ for pymes and autónomos) is real
  `[SERP]` [one.gob.es](https://one.gob.es/es/contenidos/el-plan-ia360-impulsa-la-adopcion-de-la-inteligencia-artificial-en-empresas-y-personas),
  [Forbes](https://forbes.es/ultima-hora/1025015/sanchez-anuncia-un-bono-de-600-millones-para-que-pymes-y-autonomos-incorporen-la-ia/);
  a competitor already runs content + waitlist `[SERP]` [kodofactory.es](https://kodofactory.es/). Do
  **not** claim agent/beneficiary status — no evidence exists — only explain and prepare.
- **No named clients, team page or legal identity.** For a company selling risk reduction, zero
  verifiable entity data is the single largest conversion handicap.

---

## 3. Competitor observations (2026-11-05)

Queries: `desarrollo software a medida Galicia`, `software a medida Vigo`, `automatización de procesos
empresas Galicia`, `automatización de procesos RPA Vigo`, `consultoría tecnológica Galicia`, `consultoría
IA empresas Galicia`, `implantación de IA en empresas España`, `desarrollo de SaaS a medida empresa
España`, `desarrollo de chatbots para empresas España`, `empresa de desarrollo de software en Vigo`.
All `[SERP]`.

### 3.1 Galicia / Vigo set

| Player | Observed positioning (and why it matters) |
|---|---|
| **Q2BSTUDIO** | RPA + IA + software; **several near-duplicate local URLs** for "automatización de procesos en Vigo" ([1](https://www.q2bstudio.com/nuestro-blog/181356/automatizacion-de-procesos-en-vigo-con-nuestros-servicios-especializados-mejora-la-eficiencia-y-productividad-de-tu-negocio-de-forma-innovadora-y-tecnologica#1), [2](https://q2bstudio.com/nuestro-blog/120402/empresa-especializada-automatizacion-procesos-vigo-mejora-eficiencia-negocio-soluciones-medida-contactanos-hoy#1), [3](https://www.q2bstudio.com/nuestro-blog/181379/optimiza-tus-procesos-en-vigo-con-nuestros-servicios-de-automatizacion-mejora-la-eficiencia-y-la-productividad-de-tu-empresa-de-forma-rapida-y-sencilla#1)) — local demand is real, but the templated city format is the doorway risk §6 forbids. |
| **BlackHold Consulting** | "Presencia especial en Vigo y Galicia", agentes IA con tus datos ([site](https://www.blackholdconsulting.com/consultoria-estrategica-automatizacion-inteligencia-artificial-empresas/)) — direct clash on "IA + Galicia". |
| **Medranet** (Vigo coop.) | IA (agentes, chatbots, RAG) + SEO técnico/GEO/AEO + web a medida ([Gaiástech](https://gaiastech.xunta.gal/gl/mapa-de-capacidades-dixitais-de-galicia/medranet-sociedade-cooperativa-galega)) — same three offers *plus* SEO; likely to beat us on AI+conversion terms. |
| **Morse**, **Possible** (Vigo), **Inovalabs** (2003) | IA on-premise + DevOps + AI Act compliance ([Gaiástech](https://gaiastech.xunta.gal/es/node/10883)); consultoría/software/móvil/ciberseguridad/IA ([ASIME](https://asime.es/glossary/possible-incorporated-s-l/)); process standardisation + automatización + BI/IA ([CEAGA](https://www.ceaga.com/empresas/inovalabs-digital-s-l/)) — sector associations already index them; we are absent, and the regulatory angle is unclaimed by us. |
| **ITG** (Galicia tech centre) | Free digital diagnostics for Galician firms ([itg.es](https://itg.es/diagnosticos-tecnologicos-gratuitos-transformacion-digital/)) — free "diagnóstico" competes with our paid discovery, so the paid-vs-free story must be sharp. |
| **Directories** | Cluster TIC Galicia [mapatic](https://mapatic.clusterticgalicia.com/es/servicios/desarrollo-de-aplicaciones-y-webapps/) and [Gaiástech](https://gaiastech.xunta.gal/gl/mapa-de-capacidades-dixitais-de-galicia) map Galicia suppliers by service and province — the highest-value local citation targets; Tecnoria was **not** observed there `[SERP]`, so confirm rather than assume. |

### 3.2 National set (shape of competition, not a ranking)

- **Kōdo Factory** (Alicante) [kodofactory.es](https://kodofactory.es/): software factory + AI agents,
  productised entry price, "prototipo 48 h", "MVP 2–4 semanas", Plan IA360/Kit Digital content,
  anti-vendor "cinco preguntas para elegir una software factory", own product — **sells a method and a
  price anchor, not a stack.** Closest analogue to what Tecnoria could be.
- **Indicus** (Madrid) [indicus.es](https://indicus.es/): software a medida + API integrations + "IA
  donde aporta valor real". **Sysprovider** [aplicaciones web a medida](https://www.sysprovider.es/desarrollo-de-software/aplicaciones-web/):
  portals/SaaS, own Spanish hosting, 24×7 — infrastructure trust as differentiator. **Fides**/**Base10**
  (Madrid, via [TIC Negocios](https://ticnegocios.camaramadrid.es/servicios/producto/fides-tecnologia-a-medida/www.tp.com/www.tp.com/)):
  consultancy bundles with IA and managed services.

### 3.3 Genuine, evidenced differentiation (use this)

1. **It ships and operates its own SaaS** (Talkaris, Auctorio) plus a live client platform with SSR/SEO
   `[REPO]` `site-content.ts:1362-1424, 2504-2701`. No Galicia competitor observed shows comparable
   product work; "software de producción real, no demos" `[LIVE]` is defensible.
2. **Full chain** — discovery → build → automation → AI → evolution under one accountable team, where
   local players sell one slice.
3. **Boring engineering substance** already in the repo (multi-tenant isolation, dry-run publishing,
   escalation rules, QA gates). Publish that instead of adjectives.

---

## 4. Structural defects that cap organic performance (fix before content)

| # | Defect | Evidence | Impact |
|---|---|---|---|
| 1 | Sitemap stale: 24 URLs, missing 6 of 13 articles (`discovery-tecnico…`, `crm-erp-o-software-propio…`, `automatizacion-documental…`, `asistentes-internos…`, `roadmap-producto-b2b…`, `cuadros-de-mando-operativos…`) and both product pages, which are also absent from primary navigation | `[REPO]` `apps/web/src/sitemap.xml` vs `site-content.ts:1523-2315, 255-263, 2382-2390`, `app.routes.ts:570-582` | Half the editorial output and the whole own-IP advantage are undiscoverable |
| 2 | Case studies have slugs but no routes | `[REPO]` `site-content.ts:101-112` vs `app.routes.ts:542-547` | Proof cannot be indexed, linked or cited |
| 3 | Local entity schema duplicated and invalid: two `ProfessionalService` nodes, one `["ProfessionalService","LocalBusiness"]` with `addressLocality: "Galicia"`, no street/postal/geo, no `sameAs` | `[REPO]` `seo.service.ts:151-177`; `[LIVE]` home `<head>` | Ambiguous entity, no local eligibility, nothing disambiguates it |
| 4 | FAQPage emitted on `/` and `/faq` and per-service | `[REPO]` `seo.service.ts`, `site-content.ts:2334-2380` | Duplicated Q&A entities, no upside |
| 5 | 34 legacy redirects from a former web/SEO/marketing-agency footprint (`agencia-adwords`, `agencia-de-linkbuilding`, `email-marketing`, `kit-digital` variants) funnelled into software/consulting/blog — audit GSC impressions before changing anything; do not mass-410 blindly | `[REPO]` `app.routes.ts:5-176` | Old topical identity leaks in; residual-impression URLs may redirect mismatched intent (`agencia-adwords` → consultoría) |

---

## 5. Prioritised query → page map

Rules: one primary intent per URL; no page opens without a differentiated answer; no invented volumes.
Cost: **S** = copy/meta/links; **M** = new sections or 1–3 pages; **L** = new silo or new routes + data.

### Tier 0 — pre-conditions (everything else is discounted without them)

| # | Action | Evidence | Cost |
|---|---|---|---|
| 0.1 | Regenerate sitemap from `site-content.ts`; include product and case URLs | §4 #1–#2 | S |
| 0.2 | Add `/casos-de-exito/:slug` route + template (problem → solution → impact, real data only) | §4 #2 | M |
| 0.3 | One `Organization`/`LocalBusiness` node with real locality + `sameAs`; drop the duplicate; remove FAQPage from `/` | §4 #3–#4 | S |
| 0.4 | Publish legal identity (razón social, NIF, domicilio) + real locality, or an explicit remote-first + travel statement — see §8.1 | §1.3 | S |
| 0.5 | Audit and fix unsourced precision claims (60%, 99.9%, <200ms, 10×) | §1.2 | S |
| 0.6 | Baseline measurement: GSC + analytics, cluster-level impressions/clicks, form-start vs submit | none exists for me | M |

### Tier 1 — retarget existing URLs (best return per hour)

| Page | Primary intent | Secondary | Contested by | Cost |
|---|---|---|---|---|
| `/servicios/desarrollo-software-medida` | "desarrollo de software a medida" | "empresa de desarrollo de software" | national + Galicia players `[SERP]` | S |
| `/servicios/automatizacion-procesos` | "automatización de procesos" | "automatización de procesos con IA", "integración de sistemas" | Q2B/BlackHold/Medranet `[SERP]` | S |
| `/servicios/inteligencia-artificial-empresas` | "inteligencia artificial para empresas" | "implantar IA en la empresa", "consultoría IA" | crowded `[SERP]` | S |
| `/servicios/desarrollo-chatbots-empresas` | "chatbots para empresas" | "chatbot atención al cliente" | own product + article (§2.1) | S |
| `/servicios/plataformas-saas` | "desarrollo de SaaS" | "crear un SaaS", "MVP SaaS" | Kōdo/Indicus/Sysprovider `[SERP]` | S |
| `/servicios/consultoria-tecnologica` (+ split intent with `/metodologia`, §2.1) | "consultoría tecnológica" | "auditoría de software", "revisión de arquitectura" | Possible/Fides/Base10 `[SERP]` | S |
| `/productos/talkaris`, `/productos/auctorio` | "plataforma de chatbots" / "software editorial con IA" | "chatbot multicanal", "automatizar publicación de contenido" | must not reuse landing terms; Auctorio uncontested `[HYP]` | S |

Execution standard per landing (this is the work): one intent in title/H1/first 100 words; a scoped "how an
engagement starts" block; one proof strip (named, or anonymised with consent); three FAQs answering
*buying* objections; links to the 2–3 Tier-2 assets; delete any H2 a sibling page already owns.

### Tier 2 — new pages the business can actually support

| Page | Justification | Prerequisite | Cost |
|---|---|---|---|
| Pricing / engagement model | Biggest BOFU gap; competitors publish anchors `[SERP]` | Owner sets ranges/floor | M |
| "Software a medida vs low-code vs producto estándar" | Competitor-format decision content `[SERP]` | none | M |
| "Cómo evaluar un proveedor de IA" (buyer checklist) | Link/citation format that earns | none | M |
| Sector: industria y distribución | Real case exists; dense Galicia cluster `[SERP]` (CEAGA, ASIME) | case URL + sector permission | L |
| Sector: servicios B2B | Real case; matches ICP | case URL | L |
| Sector: media / contenido digital | Named client platform | client permission | L |
| Local: one "tecnología para empresas en Vigo/Galicia" page | Local intent contested; third parties attribute Vigo | §0.4 resolved | M |
| Kit Digital / Plan IA360 guide | Real, current, competitors already rank `[SERP]` | legal check, no agent claim | M |

### Tier 3 — clusters (after Tiers 0–2, measured)

**A · Automation economics** (hub: automatización): process-audit checklist, RPA vs API integration,
document automation in finance, cost-of-manual-work model. **B · Applied AI with governance** (hub: IA):
pilot-to-production, evaluation/escalation design, knowledge-base quality, AI Act for pymes.
**C · Legacy & modernisation** (hub: consultoría): rewrite sequencing, strangler pattern in plain Spanish,
backoffice evolve vs replace. **D · Product/SaaS build** (hub: plataformas-saas): MVP scope, multi-tenant
basics, pricing instrumentation. Each: 1 hub + 3–4 spokes + 1 decision asset; merge or kill any existing
article without a distinct intent.

---

## 6. Programmatic SEO: explicitly restricted

Permitted (each page carries unique evidence): **case-study URLs** (8, real — problem, solution, impact,
sector, services) and **Talkaris/Auctorio docs or changelog** if genuinely maintained.

Not permitted — already forbidden by the repo's own rule `[REPO]` `docs/seo-architecture.md:155-160`:
city pages ("software a medida en {ciudad}") at scale (precisely the Q2BSTUDIO pattern `[SERP]`; a domain
with no local entity doing this is a liability), service × sector matrices from templates, FAQ-volume
pages from scraped questions, and any page whose only difference is a swapped noun. Gate for any future
set: (a) first-party data per page, (b) a human-written paragraph a sibling reader could not get there,
(c) unique title/H1, (d) hub internal links, (e) in the sitemap, (f) owner + review date. Miss one → do
not publish.

---

## 7. Trust improvements (by conversion leverage)

1. Legal entity block (razón social, NIF, domicilio) in footer, aviso legal and schema — non-negotiable
   for B2B procurement.
2. Replace anonymous testimonials with named attribution where permission exists; otherwise state
   "referencia bajo petición" rather than presenting a role-only quote as proof.
3. Quantified cases **with method**: what was measured, over what period, by whom. If numbers are
   forbidden, publish scope and architecture instead of percentages.
4. Team/credential page — who does the work; the E-E-A-T surface is currently empty. Remove or source
   every precision claim (§1.2).
5. Publish the engagement model: phases, what a discovery includes and costs, what follows.
6. Security/privacy posture page for buyers handing over operational data (multi-tenant isolation,
   dry-run publishing, access rules — already true in the repo), and consistent NAP across site, LinkedIn,
   Gaiástech, Cluster TIC, ASIME/CEAGA if eligible.

---

## 8. 30 / 60 / 90-day plan

**Days 0–30 — fix the floor, start measuring.** Tier 0.1–0.5; baseline 0.6; Tier-1 retargeting of all
six landings + two product pages + intent split for `/metodologia` (copy/meta/links only); resolve §8.1;
audit the 34 legacy redirects against GSC impressions. *Exit:* sitemap = routes = content; no duplicate
schema nodes; every precision claim sourced or removed; a baseline report anyone can re-run.

**Days 31–60 — decision content + proof.** Case-study URLs (8) with method-based impact; pricing page +
one comparison asset; Cluster A hub + 2 spokes with real method detail; one local page **only if** §0.4
produced a locality story, plus Gaiástech/Cluster TIC listings after eligibility check; UTM + events on
form start/submit and product CTAs. *Exit:* ≥3 new indexable proof URLs; ≥2 decision pages linked from
landings; entity consistent on-site and in ≥1 directory.

**Days 61–90 — clusters + one sector bet.** Cluster B (AI governance) and **one** sector page chosen by
observed GSC demand; Kit Digital/IA360 explainer after legal review (no agent claims); per-cluster GSC
review (impressions, non-brand clicks, position bands, assisted conversions); prune articles that earn no
impressions and duplicate a sibling intent; decide a second sector only if the first moves, else invest in
Talkaris/Auctorio product intent — own IP is the durable moat.

### 8.1 Business decisions only the owner can make (blocking — do not guess)

| # | Question |
|---|---|
| 1 | Real publishable address/locality (Vigo?) or remote-first? |
| 2 | Legal name and NIF/registry data for aviso legal and schema. |
| 3 | Which clients may be named, and may any metric be published (with method)? |
| 4 | Pricing policy: ranges, a floor, or "desde" anchors? |
| 5 | Kit Digital / IA360: accredited agent or not? Until confirmed, content stays explanatory. |
| 6 | Coverage: Galicia-first, Spain-wide, or both? It changes every local decision. |
| 7 | Languages: Spanish only, or Spanish + Galician? The Galicia directories are bilingual `[SERP]` and Galician pages look uncontested `[HYP]`. |

---

## 9. Measurement guardrails, and what this document did not do

KPIs in order: non-brand impressions by cluster → clicks → form starts → qualified leads → discovery
calls booked (revenue attribution needs CRM data I do not have). No vanity metric enters the roadmap: no
"positions" without a query set, no "traffic" without a cluster. Re-baseline before and after each tier
with the same query set and date window; if a figure cannot be re-derived from GSC/analytics it does not go
in a report, and any "X% more traffic" claim must name the query set, period and export used.

Scope honesty: no demand measurement (no volumes, difficulty, rankings — §0); no view of what Tecnoria
currently ranks for (needs Search Console); no verification of Gaiástech/Cluster TIC membership,
accreditations or the legal entity; no code, infrastructure or git changes (out of scope — every Tier 0/1
item is an engineering task with the repo paths already identified); no competitor copy or numbers reused
as ours. Next consumer: §5 Tier 0 is the dependency for everything else, and §8.1 lists the questions that
must be answered before any local or pricing page is written.
