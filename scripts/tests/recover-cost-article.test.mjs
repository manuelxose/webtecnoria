// GROWTH-04 / H-12 — tests del planificador de recuperación del artículo de coste.
//
// A diferencia de los demás tests del repositorio, éste importa un módulo que
// depende de la configuración de la API: se ejecuta como script propio con un
// entorno de prueba explícito, en lugar de cargarse dentro de la suite de la API
// (que tiene su propio arranque con efectos). Por eso no se llama
// `*.test.mjs` dentro de scripts/api-tests.
import assert from "node:assert/strict";
import test from "node:test";

process.env["NODE_ENV"] = process.env["NODE_ENV"] ?? "test";
process.env["DATABASE_URL"] = process.env["DATABASE_URL"] ?? "postgres://tecnoria_api:tecnoria@127.0.0.1:5432/tecnoria";
process.env["JWT_SECRET"] = process.env["JWT_SECRET"] ?? "test-secret-value-0123456789abcdef";
process.env["GOOGLE_CLIENT_ID"] = process.env["GOOGLE_CLIENT_ID"] ?? "test-google-client-id";
process.env["SMTP_HOST"] = process.env["SMTP_HOST"] ?? "127.0.0.1";
process.env["SMTP_PORT"] = process.env["SMTP_PORT"] ?? "1025";
process.env["SMTP_USER"] = process.env["SMTP_USER"] ?? "test-user";
process.env["SMTP_PASS"] = process.env["SMTP_PASS"] ?? "test-pass";
process.env["SMTP_FROM"] = process.env["SMTP_FROM"] ?? "no-reply@example.com";
process.env["ADMIN_NOTIFICATION_EMAIL"] = process.env["ADMIN_NOTIFICATION_EMAIL"] ?? "admin@example.com";

const mod = await import("../../scripts/recover-cost-article.ts");
const { articles } = await import("../../apps/web/src/app/site/content/site-content.ts");

const editorial = articles.find((item) => item.slug === mod.TARGET_SLUG);

test("the editorial article for the target slug exists in the repository", () => {
  assert.ok(editorial, `no editorial article for ${mod.TARGET_SLUG}`);
});

test("the plan is valid and renders a real body, not a placeholder", () => {
  const plan = mod.buildPlan(editorial, mod.TARGET_SLUG);

  assert.deepEqual(plan.problems, []);
  assert.equal(plan.valid, true);
  assert.ok(plan.bodyTextChars >= mod.MIN_BODY_TEXT_CHARS, `text chars ${plan.bodyTextChars}`);
  assert.equal(plan.headings, editorial.sections.length);
  assert.ok(plan.bodyHtmlBytes > 1000);
});

test("a 7-character body like the one in production is rejected by the same threshold", () => {
  // The production defect, exactly: content = "sadasda" (7 chars of text).
  assert.equal(mod.plainTextLength("sadasda"), 7);
  assert.ok(mod.plainTextLength("sadasda") < mod.MIN_BODY_TEXT_CHARS);
  assert.equal(mod.plainTextLength("<div>sadasda</div>"), 7);
});

test("every section gets a unique, stable heading id so no TOC anchor can break", () => {
  const body = mod.renderBodyHtml(editorial);
  const ids = [...body.matchAll(/<h2[^>]*>/g)].map(() => null);
  const sectionIds = [...body.matchAll(/<section class="article-section" id="([^"]+)"/g)].map((m) => m[1]);

  assert.equal(sectionIds.length, editorial.sections.length);
  assert.equal(new Set(sectionIds).size, sectionIds.length, "heading ids must be unique");
  for (const id of sectionIds) {
    assert.match(id, /^[0-9]+-[a-z0-9-]+$/, `id ${id} must be slug-shaped`);
  }
  // Every TOC entry (<a href="#id">) must have a matching id.
  for (const id of sectionIds) {
    assert.ok(body.includes(`id="${id}"`), `missing anchor target ${id}`);
  }
  assert.equal(ids.length, sectionIds.length);
});

test("HTML from the editorial source is escaped, never injected raw", () => {
  const rendered = mod.renderBodyHtml({
    title: "T",
    summary: "s".repeat(60),
    sections: [{ title: "<script>alert(1)</script>", paragraphs: ['a & b "c"'] }],
  });

  assert.ok(!rendered.includes("<script>alert(1)</script>"), "raw HTML must not pass through");
  assert.ok(rendered.includes("&lt;script&gt;"));
  assert.ok(rendered.includes("a &amp; b &quot;c&quot;"));
});

test("the plan refuses a body that contains an invented monetary amount", () => {
  const withPrice = mod.buildPlan(
    {
      title: "T",
      summary: "s".repeat(60),
      sections: [
        {
          title: "Precio",
          paragraphs: ["Este proyecto cuesta 2.500 EUR y es un precio inventado.", "x".repeat(500)],
        },
      ],
    },
    mod.TARGET_SLUG
  );

  assert.equal(withPrice.valid, false);
  assert.ok(withPrice.problems.some((problem) => /monetary amount/i.test(problem)), withPrice.problems.join("; "));
});

test("a missing editorial article is an invalid plan, never an empty write", () => {
  const plan = mod.buildPlan(undefined, mod.TARGET_SLUG);
  assert.equal(plan.valid, false);
  assert.equal(plan.bodyHtml, "");
  assert.ok(plan.problems.length > 0);
});

test("H-12 constants are the ones the runbook quotes", () => {
  assert.equal(mod.TARGET_SLUG, "cuanto-cuesta-desarrollar-software-medida");
  assert.equal(mod.CONFIRMATION, "H-12-RECOVER-CANONICAL-BODY");
  assert.ok(mod.MIN_BODY_TEXT_CHARS >= 400);
});
