#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const MAIN =
  process.argv[2] || path.resolve(__dirname, "..", "dist", "server", "main.js");
const SHIM = path.resolve(__dirname, "..", "server-dom-shim-lazy.js");
const INDEX_HTML = path.resolve(
  __dirname,
  "..",
  "dist",
  "browser",
  "index.html"
);

function waitForFile(file, interval = 300) {
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      if (fs.existsSync(file)) {
        clearInterval(timer);
        resolve(true);
      }
    }, interval);
  });
}

async function run() {
  console.log("[wrap] waiting for", MAIN);
  await waitForFile(MAIN);
  console.log("[wrap] found", MAIN);

  const args = ["--require", SHIM, MAIN];
  console.log("[wrap] spawning node", args.join(" "));

  const child = spawn(process.execPath, args, { stdio: "inherit" });

  const shutdown = () => {
    if (!child.killed) {
      try {
        child.kill("SIGTERM");
      } catch (e) {}
    }
    process.exit();
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  child.on("exit", (code, signal) => {
    console.log(`[wrap] child exited code=${code} signal=${signal}`);
    // exit wrapper with same code so nodemon can react
    process.exit(code === null ? 0 : code);
  });
}

run().catch((err) => {
  console.error("[wrap] error", err);
  process.exit(1);
});
