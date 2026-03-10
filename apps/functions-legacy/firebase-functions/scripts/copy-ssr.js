// Copies your Angular SSR bundle next to functions so SSR handler can require it.
// Set SOURCE_MAIN via env or fallback to ./dist/server/main.js relative to repo.
const fs = require("fs");
const path = require("path");

const SRC = process.env.SOURCE_MAIN || path.resolve(process.cwd(), "dist/server/main.js");
const DST = path.resolve(__dirname, "..", "angular-ssr", "main.js");

fs.mkdirSync(path.dirname(DST), { recursive: true });
if (!fs.existsSync(SRC)) {
  console.error("SSR main not found:", SRC);
  process.exit(1);
}
fs.copyFileSync(SRC, DST);
console.log("Copied SSR:", SRC, "->", DST);

// Optional index.html for DOM shim
const SRC_HTML = process.env.SOURCE_INDEX_HTML || path.resolve(process.cwd(), "dist/browser/index.html");
const DST_HTML = path.resolve(__dirname, "..", "angular-ssr", "index.html");
if (fs.existsSync(SRC_HTML)) {
  fs.copyFileSync(SRC_HTML, DST_HTML);
  console.log("Copied index.html:", SRC_HTML, "->", DST_HTML);
} else {
  console.warn("index.html not found (optional):", SRC_HTML);
}
