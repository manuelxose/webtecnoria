# GROWTH-03B — Enlazado interno: cambios aplicados

**Evidencia de partida:** [`GROWTH-03B-GSC-EVIDENCE.md`](GROWTH-03B-GSC-EVIDENCE.md)
**Plan verificado de origen:** `docs/growth/_team/GROWTH-03B-LINK-PLAN.md`
**Regla aplicada:** sin evidencia, no hay cambio. Cada modificación cita el dato que la justifica.

---

## 1. Puerto de autorización (decisión del Lead)

| Candidato | Decisión | Justificación |
|---|---|---|
| **A** — anclas genéricas de insights destacados | **AUTORIZADO** | El artículo de coste tenía **6 de 6** entrantes con texto genérico y 267 imp / 0 clics |
| **B** — «Explorar landing» | **AUTORIZADO** | El texto describía el acto, no el destino; la etiqueta descriptiva ya existía como `<h3>` |
| **C** — enlaces contextuales información → servicio | **AUTORIZADO** (solo artículo de coste) | El artículo tenía **cero** salidas a `/servicios`; su intención (precio) es la del servicio comercial |
| **D** — `plataformas-saas` en `solutionNeeds` | **NO AUTORIZADO** | Ya recibe 5 entrantes; el déficit real no está ahí |
| **F** — entradas `solutionNeeds` para IA/automatización | **RECHAZADO** | `/servicios/desarrollo-chatbots-empresas` y `/servicios/inteligencia-artificial-empresas` tienen **0 filas en 28, 90 y 480 días**: no hay demanda medida que servir |
| **E** — añadir el artículo a `serviceArticleLinks.automation` | **APLAZADO** | Muestra de automatización: 2 filas / 15 imp. El defecto del artículo era de salida, no de entradas |
| Títulos, canonical, meta, JSON-LD | **NO TOCADOS** | Fuera de alcance; el `title` se decide con evidencia en el próximo hito |

---

## 2. Cambios aplicados

### 2.1 Anclas descriptivas en tarjetas de artículos (candidato A)

Seis entrantes genéricos al artículo de coste pasan a llevar el **título del artículo** como texto
de enlace, que ya se renderizaba inmediatamente encima como `<h3>`:

| Archivo | Antes | Después |
|---|---|---|
| `pages/home-page.component.ts:415` | `Leer artículo` | `{{ article.title }}` |
| `pages/services-page.component.ts:193` | `Leer artículo` | `{{ article.title }}` |
| `pages/service-detail-page.component.ts:178` | `Leer insight` | `{{ article.title }}` |
| `pages/blog-page.component.ts:304` | `Leer artículo` | `{{ article.title }}` |

Sin campo nuevo, sin cambio de modelo de datos, sin CSS nuevo.

### 2.2 «Explorar landing» (candidato B)

`pages/service-detail-page.component.ts`: la tarjeta de ruta complementaria renderizaba `<h3>{{ link.label }}</h3>`
más un enlace aparte con el texto fijo `Explorar landing`. Ahora **la etiqueta descriptiva es el
propio enlace**, anidado en el encabezado, y el `<a>` redundante desaparece. Se evita duplicar texto
para lectores de pantalla y se elimina la etiqueta sin valor descriptivo.

### 2.3 Enlace contextual del artículo de coste al servicio (candidato C)

- `content/site-content.ts`: `ArticleEntry` gana un campo **opcional**
  `serviceLinks?: ServiceLinkEntry[]` (reutiliza el tipo existente, sin crear otro).
- El artículo de coste declara **un** enlace:
  «Ver el servicio de desarrollo de software a medida» → `/servicios/desarrollo-software-medida`.
- `pages/article-page.component.ts`: la barra lateral lo renderiza **antes** del botón de `/contacto`.

Decisiones de diseño deliberadas:

- **Se conserva** `ctaLink: "/contacto"`. La alternativa «solo datos» (repuntar `ctaLink` al
  servicio) habría **eliminado la única vía de conversión** del artículo y se rechazó.
- Es **un** enlace contextual, no una retahíla: el artículo **no** se convierte en página de puerta.
- El campo es opcional y el bloque va condicionado: **el resto de artículos no cambia**.

---

## 3. Por qué estos enlaces son útiles al lector

- Un lector que busca «cuánto cuesta desarrollar software a medida» está **decidiendo comprar**.
  El enlace le lleva al servicio que responde a esa decisión, no a una página aleatoria.
- El texto de cada enlace **describe su destino**: ninguna ancla repite una palabra clave fuera de
  contexto, no hay texto oculto, no hay enlaces de sitio añadidos para inflar recuentos.
- No se añadió **ningún** enlace sitewide ni se creó ninguna URL nueva.

---

## 4. Lo que se deja explícitamente fuera

| Elemento | Motivo |
|---|---|
| `article-page.component.ts:157` — «Leer artículo» (artículo → artículo) | **No** es entrante al artículo de coste; fuera del alcance autorizado |
| `blog-page.component.ts:184` — «Leer artículo destacado» | CTA de tarjeta destacada; no es entrante al artículo de coste |
| `solutionNeeds` (IA / automatización) | Rechazado por ausencia de demanda medida |
| `serviceArticleLinks.automation` | Aplazado por muestra insuficiente (2 filas) |

Estos cuatro elementos quedan registrados como deuda para el próximo hito, **no** como resueltos.

---

## 5. Verificación (HTML renderizado real, no solo código fuente)

Servido el SSR construido y leídos los anclajes reales:

| Página | Enlaces verificados al artículo de coste | Enlaces al servicio |
|---|---|---|
| `/` | «Cuánto cuesta desarrollar software a medida y de qué depende realmente» | — |
| `/servicios` | mismo título | — |
| `/servicios/plataformas-saas` | mismo título | «Desarrollo de software a medida» (ruta complementaria) |
| `/blog/cuanto-cuesta-desarrollar-software-a-medida` | — | «Ver el servicio de desarrollo de software a medida» |

`Explorar landing` **ausente** del documento completo de páginas de servicio.

Pruebas: `npm run test:seo`, `npm run test:links` (ver
[`GROWTH-03B-DELIVERY.md`](GROWTH-03B-DELIVERY.md) §3).

---

## 6. Integridad de enlaces

| Comprobación | Método | Resultado |
|---|---|---|
| Las 6 landings de servicio están en `seo-route-manifest.ts` | `test:links` | 6/6 |
| Cada slug de `serviceArticleLinks` es un artículo real | `test:links` | PASS |
| El artículo de coste enlaza al servicio y conserva `/contacto` | `test:links` | PASS |
| Ninguna tarjeta usa ancla genérica | `test:links` | PASS |
| El SSR emite un `href` real (no solo `routerLink`) | `test:seo` sobre HTML | PASS |
| Canonical, títulos, meta y JSON-LD sin cambios | `test:seo` en 33 rutas | PASS |

**Aviso honesto:** antes de este hito **ninguna prueba** del repositorio verificaba el texto de un
enlace (búsqueda de las tres cadenas genéricas en `scripts/`: 0 coincidencias). Las nuevas
aserciones se validaron con una **prueba de mutación**: revertir un ancla a texto genérico produjo
`pass 5 / fail 1` con el mensaje esperado, y tras restaurar el archivo se recuperó 6/6.
