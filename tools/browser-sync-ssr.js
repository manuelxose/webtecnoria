#!/usr/bin/env node
const browserSync = require("browser-sync").create();
const path = require("path");

const PORT = process.env.SSR_PORT || 4000;
const BROWSER_SYNC_PORT = process.env.BROWSER_SYNC_PORT || 3000;

console.log("[browser-sync] Starting proxy to SSR server...");

browserSync.init({
  proxy: `localhost:${PORT}`,
  port: BROWSER_SYNC_PORT,
  open: false,
  notify: false,
  files: [path.join(__dirname, "..", "dist", "browser", "**", "*")],
  watchOptions: {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100,
    },
  },
  logLevel: "info",
  logPrefix: "BrowserSync",
  reloadDelay: 0,
  reloadDebounce: 500,
});

console.log(
  `[browser-sync] Open http://localhost:${BROWSER_SYNC_PORT} in your browser`
);
console.log(`[browser-sync] Proxying SSR server at http://localhost:${PORT}`);
console.log("[browser-sync] Watching dist/browser for changes...");
