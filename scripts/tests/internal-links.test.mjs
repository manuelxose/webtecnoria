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
