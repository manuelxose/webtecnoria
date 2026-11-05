// GROWTH-04 P0-2 — prueba de render real del SSR construido.
//
// El test de fuente de internal-links.test.mjs demuestra que la guarda existe;
// esto demuestra que FUNCIONA con el cuerpo real de producción. Se sirve el build
// ya generado (apps/web/dist) con un /api/v1/blog/* falso que devuelve exactamente
// el defecto medido (content="sadasda") y se comprueba el HTML renderizado.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const SLUG = "cuanto-cuesta-desarrollar-software-medida";
const PORT = 4731;
const API_PORT = 4732;

// La fila real de producción, tal cual se midió el 2026-11-05.
const DEFECT_ROW = {
  id: "5f03106b-842c-46c2-b08c-6023ec82401d",
  slug: SLUG,
  title: "Cuánto cuesta desarrollar software a medida y de qué depende realmente",
  shortDescription: "Un marco realista para entender coste, alcance, arquitectura y prioridad antes de pedir presupuesto.",
  content: "sadasda",
  image: "/assets/images/brand/services-system-architecture.webp",
  tags: ["Decisión"],
  author: "TecnoRia",
  status: "publish",
  publishedAt: "2026-01-15T00:00:00.000Z",
  updatedAt: "2026-01-15T00:00:00.000Z",
  createdAt: "2026-01-15T00:00:00.000Z",
};

// Variante sana: el mismo artículo con un cuerpo editorial real (varias secciones,
// SIN ids, como llega del CMS) para probar la rama que sí debe pintar el cuerpo.
// Debe cumplir AMBOS umbrales de la guarda (F3): >= 400 caracteres Y >= 3
// encabezados. El artículo real de coste tiene 5 secciones y 2.289 caracteres.
const HEALTHY_ROW = {
  ...DEFECT_ROW,
  updatedAt: "2026-11-05T00:00:00.000Z",
  content: [
    "<section class=\"article-section\"><h2>No compras código</h2><p>" + "El coste depende del problema y de su alcance. ".repeat(8) + "</p></section>",
    "<section class=\"article-section\"><h2>Variables que mueven el presupuesto</h2><p>" + "Integraciones, permisos y calidad esperada. ".repeat(8) + "</p></section>",
    "<section class=\"article-section\"><h2>Construir por fases</h2><p>" + "Un MVP serio concentra la inversión donde desbloquea negocio. ".repeat(8) + "</p></section>",
  ].join(""),
};

let currentRow = DEFECT_ROW;

const api = createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${API_PORT}`);
  res.setHeader("content-type", "application/json");
  if (url.pathname.startsWith("/api/v1/blog/") && url.pathname.endsWith(`/${SLUG}`)) {
    res.end(JSON.stringify(currentRow));
    return;
  }
  if (url.pathname === "/api/v1/blog" || url.pathname === "/api/v1/blog/") {
    res.end(JSON.stringify({ docs: [currentRow], total: 1 }));
    return;
  }
  res.statusCode = 404;
  res.end(JSON.stringify({ code: "NOT_FOUND" }));
});

function run(cmd, args, env) {
  // Sin shell: con shell=true, un ejecutable en "C:\Program Files\..." se parte
  // por el espacio y el hijo muere con '"C:\Program" no se reconoce...'.
  return spawn(cmd, args, { env: { ...process.env, ...env } });
}

function waitFor(url, attempts = 180) {
  return new Promise((resolve, reject) => {
    let n = 0;
    let lastError = "";
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.status < 500) return resolve(res);
        lastError = `status ${res.status}`;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
      if (++n >= attempts) return reject(new Error(`timeout waiting for ${url} (last: ${lastError})`));
      setTimeout(tick, 1000);
    };
    tick();
  });
}

const failures = [];
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(name);
};

const bodyOf = (html) => {
  const m = /<div[^>]*class="article-richtext"[^>]*>([\s\S]*?)<\/div>/.exec(html);
  return m ? m[1] : "";
};
const textOf = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

async function fetchArticle(label) {
  const res = await fetch(`http://127.0.0.1:${PORT}/blog/${SLUG}`);
  const html = await res.text();
  console.log(`\n--- ${label}: status ${res.status}, ${html.length} bytes ---`);
  return html;
}

async function main() {
  api.listen(API_PORT);

  const server = run(process.execPath, ["apps/web/dist/server/server.mjs"], {
    PORT: String(PORT),
    API_INTERNAL_URL: `http://127.0.0.1:${API_PORT}`,
    NODE_ENV: "production",
  });

  // Un fallo de arranque del SSR se informa, no se espera en silencio.
  let serverOutput = "";
  server.stdout?.on("data", (chunk) => {
    serverOutput += String(chunk);
  });
  server.stderr?.on("data", (chunk) => {
    serverOutput += String(chunk);
  });
  server.on("exit", (code) => {
    if (code !== null && code !== 0) {
      console.error(`SSR server exited early with code ${code}:\n${serverOutput}`);
    }
  });

  try {
    const ready = await waitFor(`http://127.0.0.1:${PORT}/`).catch((error) => {
      console.error(`\n--- SSR server output ---\n${serverOutput}\n-------------------------`);
      throw error;
    });
    void ready;

    // 1) EL DEFECTO REAL: la fila con content="sadasda".
    currentRow = DEFECT_ROW;
    const defectHtml = await fetchArticle("defect row (content=sadasda)");
    const defectBody = bodyOf(defectHtml);

    check(
      "the 7-char CMS body is NOT rendered as the article",
      !textOf(defectBody).includes("sadasda"),
      `article-richtext text = ${JSON.stringify(textOf(defectBody).slice(0, 60))}`
    );
    check(
      "the page falls back to the full editorial body (static article)",
      (defectHtml.match(/class="article-section"/g) ?? []).length >= 4,
      `article-section blocks = ${(defectHtml.match(/class="article-section"/g) ?? []).length}`
    );
    check(
      "the fallback body has real text (>= 400 chars in article sections)",
      textOf(defectHtml).length > 400 && textOf(defectHtml).includes("Variables que suelen mover el presupuesto"),
      `${textOf(defectHtml).length} chars`
    );
    check(
      "the static fallback still renders its TOC with matching anchors",
      defectHtml.includes("Recorrido del artículo") && /href="#[1-9]-[a-z0-9-]+"/.test(defectHtml),
      ""
    );

    // 2) LA RAMA SANA: un cuerpo editorial real, SIN ids, servido por el CMS.
    currentRow = HEALTHY_ROW;
    const healthyHtml = await fetchArticle("healthy CMS row (real body, no ids)");
    const healthyBody = bodyOf(healthyHtml);

    check("a real CMS body IS rendered", textOf(healthyBody).length >= 400, `${textOf(healthyBody).length} chars`);
    // HALLAZGO (verificado sobre el SSR real): el saneador de [innerHTML] elimina
    // los `id` al serializar en servidor, así que un índice para artículos CMS
    // produciría anclas rotas. La decisión es NO propagar el TOC en esa rama; esta
    // prueba la fija para que nadie lo reactive sin resolver el anclaje.
    check(
      "no CMS TOC is rendered while SSR strips heading ids",
      !healthyHtml.includes("Recorrido del artículo"),
      "TOC must stay disabled for CMS articles until anchors survive SSR"
    );
    check(
      "SSR still strips id from CMS headings (the reason the TOC is disabled)",
      [...healthyHtml.matchAll(/<h2[^>]*>/g)].every((m) => !/\bid="/.test(m[0])),
      JSON.stringify([...healthyHtml.matchAll(/<h2[^>]*>/g)].map((m) => m[0]))
    );
    check(
      "the healthy CMS article keeps its service link and canonical",
      healthyHtml.includes("Ver el servicio de desarrollo de software a medida") &&
        healthyHtml.includes(`<link rel="canonical" href="https://tecnoriasl.com/blog/${SLUG}"`),
      ""
    );
    check("no generic 'Leer artículo' anchor remains", !/>\s*Leer artículo\s*</.test(healthyHtml), "");
  } finally {
    server.kill();
    api.close();
  }

  console.log(`\n${failures.length === 0 ? "ALL CHECKS PASS" : `FAILURES: ${failures.join(" | ")}`}`);
  process.exitCode = failures.length === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
