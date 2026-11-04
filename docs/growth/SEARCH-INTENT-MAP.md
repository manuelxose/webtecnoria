# Search intent map

**Date:** 2026-11-05
**Rule:** one primary intent per URL. Intent labels are analytical, not measured volumes.

| Intent stage | User question | Page | Primary action | Notes |
|---|---|---|---|---|
| Brand | “TecnoRia / Tecnoria” | `/`, `/empresa` | trust then contact | unique brand entity; no verified legal name yet |
| Problem-aware | “mi operativa no escala”, “todo es manual” | `/`, `/soluciones` | read a service page | avoid claiming a named sector without proof |
| Solution-aware | “software a medida”, “automatizar procesos” | six service landings | request diagnosis | strongest commercial intent |
| Product-aware | “plataforma de chatbots”, “software editorial con IA” | `/productos/talkaris`, `/productos/auctorio` | see product / contact | do not reuse service-page titles |
| Evaluation | “cuánto cuesta”, “software a medida vs estándar” | two decision articles | contact or read service | no invented price ranges |
| Comparison | “agencia vs software factory”, “cómo elegir proveedor de IA” | **missing** | — | P1 content gap |
| Proof | “casos de éxito”, “experiencias” | `/casos-de-exito` | contact | only verified projects are shown |
| Trust | “quiénes son”, “cómo trabajan” | `/empresa`, `/metodologia` | contact | legal identity/team missing |
| Transactional | “contacto”, “pedir presupuesto” | `/contacto` | submit form | no budget field; qualification can improve |
| Support / FAQ | “mantenimiento”, “plazos”, “IA para empresas” | `/faq` | service link | FAQ rich results retired; keep useful answers |
| Local | “software a medida Vigo/Galicia” | **blocked** | — | no verified address/locality; do not fake |
| Informational | “cómo migrar legacy”, “qué es discovery” | blog cluster | newsletter/contact | 13 static articles; 6 were missing from sitemap |

## Intent split that must be enforced

- **Chatbots:** service landing = implementation; Talkaris = product/platform; article = decision
  criteria. Different H1, title, FAQ and CTA.
- **Software a medida:** landing = custom build; SaaS landing = product build; cost article =
  budget; build-vs-buy article = decision.
- **Discovery:** `/metodologia` = how the engagement works; consulting landing = buying the
  service; discovery article = what to expect.
- **FAQ:** visible answers can stay; do not expect FAQ rich results (retired May 2026).

## Not mapped because evidence is missing

- City pages (Vigo, A Coruña, Santiago, etc.) — no local entity evidence.
- Sector pages — client permission and case-level proof are missing.
- Pricing pages — owner has not supplied ranges or a floor.
- Kit Digital / IA360 — accreditation status is unknown; no agent claim is allowed.
