// GROWTH-04 (t3) — pruebas de las comprobaciones nuevas de release-verify y del
// anclaje de ventanas de gsc-query-page. Solo funciones puras y código fuente:
// sin red, sin credenciales, sin producción.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  MIN_BODY_CHARS,
  articleBodyText,
  stripHtmlText,
  genericAnchorCount,
  tocIssues,
} from "../release-verify.mjs";
import { isValidIsoDate, windowRange } from "../gsc-query-page.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const verifySource = readFileSync(`${ROOT}release-verify.mjs`, "utf8");
const gscSource = readFileSync(`${ROOT}gsc-query-page.mjs`, "utf8");

const article = (bodyHtml, opts = {}) => `
<article class="article-content">
  <h1>${opts.title ?? "t"}</h1>
  <div class="article-richtext">${bodyHtml}</div>
  <div class="article-toc"><a href="#intro">intro</a></div>
  <section class="article-section" id="intro"><h2>intro</h2><p>texto</p></section>
  <a href="/blog/x">Leer artículo</a>
</article>
<aside class="related"><article class="card"><a href="/blog/y">Leer artículo</a></article></aside>
`;

test("MIN_BODY_CHARS: el umbral es >= 400", () => {
  assert.ok(Number.isFinite(MIN_BODY_CHARS) && MIN_BODY_CHARS >= 400, MIN_BODY_CHARS);
});

test("articleBodyText extrae .article-richtext y .article-section", () => {
  const long = "palabra ".repeat(100);
  const html = article(`<p>${long}</p>`);
  const text = articleBodyText(html);
  assert.ok(text.includes("palabra"));
  assert.ok(text.length >= MIN_BODY_CHARS, `len=${text.length}`);
  // El texto fuera del cuerpo (relacionados, aside) no entra.
  assert.ok(!text.includes("relacionados"));
});

test("articleBodyText: el defecto P0-1 ('sadasda') queda por debajo del umbral", () => {
  const text = articleBodyText(article("<p>sadasda</p>"));
  assert.ok(text.length < MIN_BODY_CHARS, `len=${text.length}`);
  assert.ok(text.includes("sadasda"));
  assert.ok(text.length < MIN_BODY_CHARS, `len=${text.length}`);
});

test("articleBodyText funciona con artículos estáticos (solo secciones)", () => {
  const paragraphs = `<p>${"contenido estatico ".repeat(60)}</p>`;
  const html = `<article class="article-content"><section class="article-section" id="a">${paragraphs}</section></article>`;
  const text = articleBodyText(html);
  assert.ok(text.includes("contenido estatico"));
  assert.ok(text.length >= MIN_BODY_CHARS, `len=${text.length}`);
});

test("stripHtmlText elimina etiquetas y colapsa espacios", () => {
  assert.equal(stripHtmlText("<p>hola <b>mundo</b></p>\n<p>x</p>"), "hola mundo x");
});

test("genericAnchorCount cuenta las anclas genéricas prohibidas", () => {
  assert.equal(genericAnchorCount('<a href="/a">Leer artículo</a>'), 1);
  assert.equal(genericAnchorCount('<a href="/a">Leer insight</a>'), 1);
  assert.equal(genericAnchorCount('<a href="/a">Ver el servicio</a>'), 0);
  assert.equal(
    genericAnchorCount('<a>Leer artículo</a><a>Leer insight</a><a>Leer artículo</a>'),
    3
  );
});

test("tocIssues detecta ids vacíos y duplicados cuando la TOC está presente", () => {
  const bad = `<article><div class="article-toc"><a href="#"></a><a href="#s1">s1</a></div>
    <section id="" class="article-section">a</section><section id="s1">b</section><section id="s1">c</section></article>`;
  const issues = tocIssues(bad);
  assert.equal(issues.tocPresent, true);
  assert.ok(issues.empty.length >= 1, JSON.stringify(issues));
  assert.deepEqual(issues.duplicates, ["s1"]);
});

test("tocIssues no marca fallo sin TOC renderizada", () => {
  const issues = tocIssues("<article><section id='s1'>x</section></article>");
  assert.equal(issues.tocPresent, false);
  assert.deepEqual(issues.empty, []);
  assert.deepEqual(issues.duplicates, []);
});

test("release-verify itera TODAS las rutas del sitemap (cuerpo y anclas por ruta)", () => {
  // El cuerpo se recoge en el bucle de rutas y las comprobaciones 2b iteran.
  assert.ok(verifySource.includes("routeBodies.set(path, r.body)"));
  assert.ok(verifySource.includes('path.startsWith("/blog/")'));
  const forOfBodies = verifySource.matchAll(/for \(const \[path, body\] of (routeBodies|articleRoutes)\)/g);
  assert.ok([...forOfBodies].length >= 2, "faltan iteraciones por ruta");
  assert.ok(verifySource.includes("genericAnchorCount(body)"));
  assert.ok(verifySource.includes("articleBodyText(body)"));
});

test("release-verify es de solo lectura (no writeFileSync/mkdir/exit != en flujo normal)", () => {
  assert.ok(!verifySource.includes("writeFileSync"));
  assert.ok(!verifySource.includes("unlink"));
});

test("isValidIsoDate acepta fechas reales YYYY-MM-DD y rechaza lo demás", () => {
  for (const good of ["2026-11-05", "2024-02-29"]) {
    assert.equal(isValidIsoDate(good), true, good);
  }
  for (const bad of [
    "2026-13-01",
    "2026-02-30",
    "2026-11-05T00:00:00Z",
    "20261105",
    "2026-1-5",
    "",
    null,
    undefined,
  ]) {
    assert.equal(isValidIsoDate(bad), false, String(bad));
  }
});

test("gsc-query-page main() está con guardia (los tests no disparan red)", () => {
  assert.ok(gscSource.includes("pathToFileURL"));
  assert.ok(gscSource.includes("if (isMain)"));
});

test("windowRange sin overrides mantiene el comportamiento rodante (d28)", () => {
  const now = new Date(Date.UTC(2026, 10, 5)); // 2026-11-05
  const { startDate, endDate, anchored } = windowRange(28, now);
  // finalisation offset 3 -> end 2026-11-02, start 2026-10-06
  assert.equal(endDate, "2026-11-02");
  assert.equal(startDate, "2026-10-06");
  assert.equal(anchored, false);
});

test("windowRange respeta --start y --end anclados", () => {
  const now = new Date(Date.UTC(2026, 10, 5));
  const both = windowRange(28, now, { start: "2025-01-01", end: "2025-01-28" });
  assert.equal(both.startDate, "2025-01-01");
  assert.equal(both.endDate, "2025-01-28");
  assert.equal(both.anchored, true);
  // solo end: mantiene la longitud declarada hacia atrás
  const endOnly = windowRange(28, now, { end: "2026-11-01" });
  assert.equal(endOnly.startDate, "2026-10-05");
  assert.equal(endOnly.endDate, "2026-11-01");
  // solo start: mantiene la longitud declarada hacia delante
  const startOnly = windowRange(28, now, { start: "2026-10-06" });
  assert.equal(startOnly.startDate, "2026-10-06");
  assert.equal(startOnly.endDate, "2026-11-02");
});

test("gsc-query-page registra el anclaje y valida --start/--end", () => {
  assert.ok(gscSource.includes("isValidIsoDate"));
  assert.ok(gscSource.includes("requestedWindow"));
  assert.ok(gscSource.includes('arg("start")'));
  assert.ok(gscSource.includes('arg("end")'));
  assert.ok(gscSource.includes("must be <= --end"));
});
