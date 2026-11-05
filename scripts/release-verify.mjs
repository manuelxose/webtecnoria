#!/usr/bin/env node
// GROWTH-03C — verificación de la release en producción, de sólo lectura.
//
// Comprueba el estado REAL servido por https://tecnoriasl.com contra lo que el
// repositorio dice que debería servirse. No despliega, no escribe, no reinicia nada.
//
//   node scripts/release-verify.mjs                 # contra producción
//   node scripts/release-verify.mjs --base http://127.0.0.1:4300   # contra un build local
//
// Sale 0 sólo si TODAS las comprobaciones pasan. Cada fallo imprime el motivo exacto.

// GROWTH-04 — utilidades puras exportadas (no red, no I/O) para que
// scripts/tests/release-verify.test.mjs pueda verificar que las comprobaciones
// nuevas tienen dientes.

// Umbral mínimo de cuerpo de artículo: el defecto P0-1 ('sadasda') tenía ~7
// caracteres; un artículo real siempre supera 400.
export const MIN_BODY_CHARS = 400;

// Anchuras genéricas prohibidas en cualquier ruta del sitemap (P0-5).
const GENERIC_ANCHOR_RE = />\s*(Leer artículo|Leer insight)\s*</g;

export function genericAnchorCount(html) {
  return (html.match(GENERIC_ANCHOR_RE) ?? []).length;
}

// Texto plano del cuerpo del artículo: bloques .article-richtext (artículos CMS)
// o secciones .article-section (artículos estáticos).
export function stripHtmlText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&[a-z]+#?0*?[0-9]*;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function articleBodyText(html) {
  const chunks = [];
  // Artículo CMS: el div.richtext es el último hijo de <article ...>, así que el
  // cierre no ambiguo es el primer </article> posterior.
  for (const m of html.matchAll(
    /class="article-richtext"[^>]*>([\s\S]*?)<\/article>/gi
  )) {
    chunks.push(m[1]);
  }
  // Artículo estático: secciones .article-section completas.
  for (const m of html.matchAll(
    /<section[^>]*class="[^"]*article-section[^"]*"[^>]*>([\s\S]*?)<\/section>/gi
  )) {
    chunks.push(m[1]);
  }
  return stripHtmlText(chunks.join(" "));
}

// Tabla de contenidos: ids vacíos o duplicados dentro del <article> cuando la
// TOC está renderizada.
export function tocIssues(html) {
  const issues = { empty: [], duplicates: [], tocPresent: false };
  const toc = html.match(/class="article-toc[\s\S]*?<\/div>/i);
  if (!toc) return issues;
  issues.tocPresent = true;
  const region = html.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? "";
  const ids = [...region.matchAll(/\sid="([^"]*)"/g)].map((m) => m[1]);
  for (const id of ids) if (!id.trim()) issues.empty.push(id);
  const seen = new Set();
  for (const id of ids) {
    if (id.trim() && seen.has(id)) issues.duplicates.push(id);
    seen.add(id);
  }
  return issues;
}

const args = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const BASE = argOf("--base", "https://tecnoriasl.com").replace(/\/$/, "");
const APEX = "https://tecnoriasl.com";
const COST_PATH = "/blog/cuanto-cuesta-desarrollar-software-medida";
const SERVICE_PATH = "/servicios/desarrollo-software-medida";
const SERVICE_LABEL = "Ver el servicio de desarrollo de software a medida";

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

async function get(path) {
  const normalized = path.startsWith("http") ? path : path.startsWith("/") ? path : `/${path}`;
  const url = normalized.startsWith("http") ? normalized : `${BASE}${normalized}`;
  const res = await fetch(url, { redirect: "manual", headers: { "user-agent": "tecnoria-release-verify/1.0" } });
  const body = res.status >= 200 && res.status < 300 ? await res.text() : "";
  return { url, status: res.status, location: res.headers.get("location"), headers: res.headers, body };
}

const canonicals = (html) => [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((m) => m[1]);

async function main() {
  // 1. Consolidación de host: http y www deben redirigir al apex https en un salto razonable.
  for (const [label, url, expected] of [
    ["http://tecnoriasl.com/ redirige a https", "http://tecnoriasl.com/", `${APEX}/`],
    ["https://www.tecnoriasl.com/ redirige al apex", "https://www.tecnoriasl.com/", APEX],
  ]) {
    const r = await get(url);
    check(label, r.status === 301 && (r.location ?? "").startsWith(expected), `status=${r.status} location=${r.location}`);
  }

  // 2. Sitemap: todos los <loc> responden 200 y con un único canonical propio.
  const sitemap = await get("/sitemap.xml");
  const locs = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check("sitemap.xml responde 200", sitemap.status === 200, `status=${sitemap.status}`);
  check("sitemap declara 33 rutas", locs.length === 33, `locs=${locs.length}`);

  let routeFailures = 0;
  const routeBodies = new Map();
  for (const loc of locs) {
    const path = loc.replace(APEX, "") || "/";
    const r = await get(path);
    routeBodies.set(path, r.body);
    const cans = canonicals(r.body);
    const ok = r.status === 200 && cans.length === 1 && cans[0] === loc;
    if (!ok) {
      routeFailures += 1;
      console.log(`        route FAIL ${path} status=${r.status} canonicals=${JSON.stringify(cans)}`);
    }
  }
  check("las 33 rutas del sitemap responden 200 con canonical único propio", routeFailures === 0, `fallos=${routeFailures}`);

  // 2b. Integridad de contenido por ruta (P0-1 / P0-5). El defecto de coste
  // ('sadasda') y las anclas genéricas 'Leer artículo'/'Leer insight' deben
  // quedar atrapados aquí, en TODAS las rutas del sitemap, no solo en la home.
  const articleRoutes = [...routeBodies.entries()].filter(([path]) => path.startsWith("/blog/"));

  // Cuerpo del artículo (bloque .article-richtext de CMS o secciones
  // .article-section de estáticos) con al menos MIN_BODY_CHARS caracteres.
  const shortBodies = [];
  for (const [path, body] of articleRoutes) {
    const text = articleBodyText(body);
    if (body && text.length < MIN_BODY_CHARS) shortBodies.push(`${path} (${text.length} chars)`);
  }
  check(
    `cada artículo de /blog tiene cuerpo >= ${MIN_BODY_CHARS} caracteres`,
    shortBodies.length === 0,
    shortBodies.length ? shortBodies.join("; ") : `${articleRoutes.length} artículos OK`
  );

  // Anclas genéricas: cero en cada una de las 33 rutas del sitemap. Nota de
  // alcance: 'Leer artículo' dentro de la rejilla de relacionados del
  // article-page también es ancla genérica y cuenta como defecto (P0-5).
  const genericRoutes = [];
  for (const [path, body] of routeBodies) {
    const n = genericAnchorCount(body);
    if (n > 0) genericRoutes.push(`${path} (${n})`);
  }
  check(
    "ninguna ruta del sitemap usa anclas genéricas de artículo ('Leer artículo'/'Leer insight')",
    genericRoutes.length === 0,
    genericRoutes.length ? genericRoutes.join("; ") : `${routeBodies.size} rutas OK`
  );

  // TOC: cuando la tabla de contenidos está renderizada, sin ids vacíos ni
  // duplicados dentro del <article>.
  const tocFailures = [];
  for (const [path, body] of articleRoutes) {
    const issues = tocIssues(body);
    if (!issues.tocPresent) continue;
    if (issues.empty.length || issues.duplicates.length) {
      tocFailures.push(`${path} empty=${JSON.stringify(issues.empty)} dup=${JSON.stringify(issues.duplicates)}`);
    }
  }
  check(
    "la tabla de contenidos de cada artículo no tiene ids vacíos ni duplicados",
    tocFailures.length === 0,
    tocFailures.length ? tocFailures.join("; ") : "OK"
  );

  // 3. Comportamientos de enlazado de GROWTH-03B/03C.
  const home = await get("/");
  const genericArticle = (home.body.match(/>\s*(Leer artículo|Leer insight)\s*</g) ?? []).length;
  check("la home no usa anclas genéricas de artículo", genericArticle === 0, `ocurrencias=${genericArticle}`);
  check("la home enlaza insights con texto descriptivo", (home.body.match(/class="text-link"[^>]*>[^<]{20,}</g) ?? []).length > 0, "");

  const cost = await get(COST_PATH);
  check("el artículo de coste responde 200", cost.status === 200, `status=${cost.status}`);
  const serviceLink = cost.body.includes(SERVICE_LABEL) && cost.body.includes(`href="${SERVICE_PATH}"`);
  check("el artículo de coste enlaza contextualmente al servicio", serviceLink, `label=${cost.body.includes(SERVICE_LABEL)}`);
  const genericCross = (home.body.match(/Explorar landing/g) ?? []).length;
  check("no queda el ancla 'Explorar landing'", genericCross === 0, `ocurrencias=${genericCross}`);

  // 4. JavaScript inicial: el compilador JIT no debe estar en el bundle del cliente.
  const shells = [await get("/"), cost];
  for (const [i, page] of shells.entries()) {
    const scripts = [...page.body.matchAll(/(?:src|href)="([^"]+\.js)"/g)].map((m) => m[1]);
    const polyfills = scripts.find((s) => s.includes("polyfills"));
    const loaded = await get(polyfills);
    const bytes = loaded.body.length;
    check(
      `bundle de polyfills servido ${i === 0 ? "(home)" : "(artículo)"} < 100 KB`,
      bytes > 0 && bytes < 102400,
      `${polyfills} ${bytes} B`
    );
    check(
      `sin compilador JIT en el bundle ${i === 0 ? "(home)" : "(artículo)"}`,
      !loaded.body.includes("parseTemplate") && !loaded.body.includes("compileComponent"),
      ""
    );
  }

  // 5. Consentimiento: la SSR no debe emitir NINGUNA carga real de analítica antes de consentir.
  //    Ojo: el bootstrap de consentimiento contiene la cadena "googletagmanager.com" dentro de una
  //    variable (TAG_URL) sin cargarla. Lo que se prohíbe es una etiqueta <script src> o <link href>
  //    que provoque una petición, no la presencia del literal.
  const analyticsTagLoads = [
    ...home.body.matchAll(/<(script|link)\b[^>]*\b(?:src|href)="([^"]*(?:googletagmanager|google-analytics)[^"]*)"/gi),
  ].map((m) => m[2]);
  check(
    "ninguna carga de analítica en el HTML servido sin consentimiento",
    analyticsTagLoads.length === 0,
    analyticsTagLoads.length ? analyticsTagLoads.join(",") : "0 etiquetas"
  );
  check(
    "el bootstrap de consentimiento está presente y gateado",
    home.body.includes("window.dataLayer") && home.body.includes("TAG_URL"),
    ""
  );

  // 6. 404 reales y cabeceras.
  for (const path of ["/this-page-does-not-exist-test-123", "/blog/not-a-real-article"]) {
    const r = await get(path);
    check(`${path} responde 404`, r.status === 404, `status=${r.status}`);
  }
  const hsts = home.headers.get("strict-transport-security");
  check("HSTS presente en la respuesta 200", Boolean(hsts && hsts.includes("max-age=")), hsts ?? "ausente");

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} comprobaciones OK`);
  if (failed.length > 0) {
    console.log("FALLOS:");
    for (const f of failed) console.log(` - ${f.name} ${f.detail}`);
    process.exitCode = 1;
  }
  return failed.length === 0;
}

// Entrada con guardia: los tests importan este módulo por sus funciones puras
// sin ejecutar la verificación en red.
import { pathToFileURL } from "node:url";
const isMain =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await main();
}
