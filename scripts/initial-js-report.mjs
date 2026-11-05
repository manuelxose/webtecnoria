// GROWTH-04 t4 — mide el JavaScript inicial real desde la plantilla SSR generada.
//
// "Inicial" = lo que el navegador descarga antes de hidratar: los dos <script>
// (polyfills + main) más cada <link rel=modulepreload>. Es la misma definición
// que usó GROWTH-03C (725.992 B antes de AOT).
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const INDEX = "apps/web/dist/server/index.server.html";
const BROWSER = "apps/web/dist/browser";
const SERVER = "apps/web/dist/server";

if (!existsSync(INDEX)) {
  console.error(`missing ${INDEX}; run npm run build:web first`);
  process.exit(1);
}

const html = readFileSync(INDEX, "utf8");

const modulepreload = [...html.matchAll(/<link rel="modulepreload" href="([^"]+\.js)"/g)].map((m) => m[1]);
const scripts = [...html.matchAll(/<script src="([^"]+\.js)"/g)].map((m) => m[1]);

const files = [...new Set([...scripts, ...modulepreload])];
const rows = [];
let total = 0;

for (const file of files) {
  // El bundle del navegador vive en dist/browser; si no está ahí, se prueba en server.
  const browserPath = join(BROWSER, file);
  const serverPath = join(SERVER, file);
  const path = existsSync(browserPath) ? browserPath : serverPath;
  const bytes = existsSync(path) ? readFileSync(path).length : 0;
  total += bytes;
  rows.push({ file, bytes, kind: scripts.includes(file) ? "script" : "modulepreload" });
}

rows.sort((a, b) => b.bytes - a.bytes);

console.log(`initial JS files: ${rows.length}`);
for (const row of rows) {
  console.log(`  ${row.bytes.toString().padStart(8)} B  ${row.kind.padEnd(14)} ${row.file}`);
}
console.log(`TOTAL INITIAL JS: ${total} B (${(total / 1024).toFixed(1)} KiB)`);

// Datos para comparar: top 3 por tamaño.
console.log(
  `top3 share: ${((rows.slice(0, 3).reduce((sum, row) => sum + row.bytes, 0) / total) * 100).toFixed(1)}%`
);
