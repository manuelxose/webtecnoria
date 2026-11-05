// GROWTH-03B — internal-link data invariants.
//
// These assertions protect the link graph at the data level, so a broken
// destination or a regression to a generic anchor is caught before the SSR
// build is ever involved. They complement scripts/seo-check.ts, which asserts
// the rendered HTML.
//
// Scope: apps/web/src/app/site/{content/site-content.ts,seo-route-manifest.ts}
// and the four templates that render article cards.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const SITE_DIR = join(REPO_ROOT, "apps", "web", "src", "app", "site");
const CONTENT = readFileSync(join(SITE_DIR, "content", "site-content.ts"), "utf8");
const ROUTES = readFileSync(join(SITE_DIR, "seo-route-manifest.ts"), "utf8");

const COST_SLUG = "cuanto-cuesta-desarrollar-software-medida";
const COST_PATH = `/blog/${COST_SLUG}`;
const SOFTWARE_PATH = "/servicios/desarrollo-software-medida";

function template(name) {
  return readFileSync(join(SITE_DIR, "pages", name), "utf8");
}

/** Paths declared as servable routes in the SEO route manifest. */
function manifestPaths() {
  return new Set([...ROUTES.matchAll(/"(\/[^"]*)"/g)].map((match) => match[1]));
}

/** Service landing paths taken from the services[] entries. */
function servicePaths() {
  const block = CONTENT.slice(CONTENT.indexOf("export const services"));
  return new Set(
    [...block.matchAll(/seo:\s*\{[\s\S]*?path:\s*"(\/servicios\/[^"]+)"/g)].map(
      (match) => match[1]
    )
  );
}

test("the six service landings are all declared in the route manifest", () => {
  const paths = servicePaths();
  assert.equal(paths.size, 6, `expected 6 service landings, found ${paths.size}`);
  const manifest = manifestPaths();
  for (const path of paths) {
    assert.ok(manifest.has(path), `${path} is not in the SEO route manifest`);
  }
});

test("every serviceArticleLinks slug resolves to a real article", () => {
  const block = CONTENT.slice(
    CONTENT.indexOf("export const serviceArticleLinks"),
    CONTENT.indexOf("export const services")
  );
  const slugs = [...block.matchAll(/"([a-z0-9-]+)"/g)].map((match) => match[1]);
  assert.ok(slugs.length > 0, "serviceArticleLinks must not be empty");
  for (const slug of slugs) {
    assert.ok(
      new RegExp(`slug:\\s*"${slug}"`).test(CONTENT),
      `serviceArticleLinks references "${slug}", which is not a declared article`
    );
  }
});

test("the cost article links contextually to the software service", () => {
  const start = CONTENT.indexOf(`slug: "${COST_SLUG}"`);
  assert.ok(start > -1, "cost article entry not found");
  const entry = CONTENT.slice(start, start + 1400);
  assert.match(entry, /serviceLinks:\s*\[/, "cost article must declare serviceLinks");
  assert.ok(
    entry.includes(`path: "${SOFTWARE_PATH}"`),
    `cost article must link to ${SOFTWARE_PATH}`
  );
  // The original conversion path must survive the change.
  assert.match(entry, /ctaLink:\s*"\/contacto"/, "the /contacto CTA must be preserved");
});

test("no published article card uses a generic anchor label", () => {
  // The article cards rendered in these templates must carry the article title
  // as anchor text, not a content-free "Leer artículo" / "Leer insight".
  for (const name of [
    "home-page.component.ts",
    "services-page.component.ts",
    "service-detail-page.component.ts",
    "blog-page.component.ts",
  ]) {
    const source = template(name);
    assert.doesNotMatch(
      source,
      /<a[^>]*\[routerLink\]="(article|item)\.(seo\.)?path"[^>]*>\s*(Leer artículo|Leer insight)\s*<\/a>/,
      `${name} still renders a generic article-card anchor`
    );
  }
});

test("service cross-link cards do not use the generic 'Explorar landing' label", () => {
  assert.doesNotMatch(
    template("service-detail-page.component.ts"),
    /Explorar landing/,
    "cross-link cards must expose the descriptive link.label as anchor text"
  );
});

test("the cost article is still reachable from the article template sidebar", () => {
  const source = template("article-page.component.ts");
  assert.match(source, /serviceLinks/, "article template must render serviceLinks");
  assert.match(
    source,
    /\[routerLink\]="\$any\(current\)\.serviceLinks\[0\]\.path"/,
    "serviceLinks must be bound as a routerLink so SSR emits a real href"
  );
});

// GROWTH-03C: a slug that exists in blog_posts renders through the CMS branch
// (`kind: "api"`), which carries no serviceLinks of its own. The cost article is
// exactly that case in production, so the GROWTH-03B contextual link never reached
// the rendered page. The API branch must inherit the editorial link from the static
// counterpart for the same slug, otherwise the sidebar silently drops it.
test("a CMS-served article still renders the editorial service link", () => {
  const source = template("article-page.component.ts");
  assert.match(
    source,
    /const staticCounterpart = getArticleBySlug\(slug\);/,
    "the API branch must look up the static counterpart for the same slug"
  );
  assert.match(
    source,
    /serviceLinks:\s*staticCounterpart\?\.serviceLinks/,
    "the API branch must carry the static article's serviceLinks"
  );
  assert.match(
    source,
    /type ApiArticleView = \{[\s\S]*?serviceLinks\?: ServiceLinkEntry\[\];[\s\S]*?\};/,
    "ApiArticleView must declare the optional serviceLinks field"
  );
});

// GROWTH-04 P0-2 — el defecto medido en producción: la fila de blog_posts del
// artículo de coste tiene content="sadasda" (7 caracteres) y GANABA sobre el
// artículo editorial del repositorio. La guarda debe fallar en cerrado.
test("the API branch fails closed on a non-editorial body", () => {
  const source = template("article-page.component.ts");

  assert.match(source, /export const MIN_ARTICLE_BODY_CHARS = 400;/, "the threshold must be explicit");
  assert.match(source, /export function isRenderableEditorialBody/, "the guard must be a named function");
  assert.match(
    source,
    /if \(apiArticle && isRenderableEditorialBody\(String\(apiArticle\.content \?\? ""\)\)\) \{/,
    "the API branch must be gated by the guard, so a placeholder body falls through to the static article"
  );
  assert.doesNotMatch(
    source,
    /if \(apiArticle\) \{[\s\S]{0,200}kind: "api"/,
    "an unguarded `if (apiArticle)` must not reach the api branch again"
  );
});

test("the guard rejects the exact production body and accepts the editorial one", () => {
  const source = template("article-page.component.ts");
  const threshold = Number(/MIN_ARTICLE_BODY_CHARS = (\d+)/.exec(source)?.[1]);

  assert.ok(threshold >= 400, `threshold ${threshold} is too low`);
  // "sadasda" is 7 characters; any editorial body is orders of magnitude larger.
  assert.ok(7 < threshold, "the production defect must be below the threshold");
  assert.ok(2289 >= threshold, "the recovered editorial body must be above the threshold");
  assert.match(
    source,
    /articleBodyTextLength\(html\) >= MIN_ARTICLE_BODY_CHARS &&/,
    "the length criterion must be present"
  );
  assert.match(
    source,
    /articleSectionCount\(html\) >= MIN_ARTICLE_BODY_SECTIONS/,
    "the body must also prove structure: a long placeholder alone is not an article"
  );
});

// GROWTH-04 F3 (revisión independiente): la longitud sola aceptaría un marcador
// largo ("BORRADOR, pendiente de revisar...") de más de 400 caracteres. La
// estructura (encabezados) es un segundo criterio independiente.
test("the guard is not length-only: a long unstructured placeholder is rejected", () => {
  const source = template("article-page.component.ts");
  const sections = Number(/MIN_ARTICLE_BODY_SECTIONS = (\d+)/.exec(source)?.[1]);

  assert.ok(Number.isFinite(sections) && sections >= 2, `section threshold ${sections} must be >= 2`);
  assert.match(source, /export function articleSectionCount/, "structure must be counted explicitly");
  assert.match(source, /<h\[23\]/, "both h2 and h3 must count as structure");
});

// GROWTH-04 P0-2 — el TOC del CMS NO se propaga (hallazgo verificado sobre el SSR
// real): el saneador de [innerHTML] elimina los `id` de los <h2> al serializar en
// servidor, así que propagar el índice produciría anclas rotas. Esta prueba fija
// la decisión y obliga a resolver el anclaje antes de reactivarla.
test("the CMS article TOC stays disabled until heading ids survive SSR", () => {
  const source = template("article-page.component.ts");

  assert.match(source, /this\.tableOfContents = \[\];/, "the API branch must clear the TOC");
  assert.doesNotMatch(
    source,
    /this\.tableOfContents = body\.entries;/,
    "the CMS TOC must not be re-enabled without a mechanism that survives SSR attribute stripping"
  );
  // Los estáticos siguen teniendo TOC: sus encabezados se pintan desde plantilla.
  assert.match(
    source,
    /this\.tableOfContents = staticArticle\.sections\.map/,
    "static articles must keep their table of contents"
  );
});

test("no article route emits the generic 'Leer artículo' anchor", () => {
  for (const name of ["article-page.component.ts", "blog-page.component.ts"]) {
    const source = template(name);
    const hits = [...source.matchAll(/>\s*(Leer artículo|Leer insight)\s*</g)];
    assert.deepEqual(
      hits.map((match) => match[0]),
      [],
      `${name} must use descriptive anchor text (39 generic anchors were measured on 13 blog routes)`
    );
  }
});

