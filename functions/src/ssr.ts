import { onRequest } from "firebase-functions/v2/https";
import "dotenv/config";
import * as path from "path";
import * as fs from "fs";

let cachedServer: any = null;

function getOrInitServer() {
  if (cachedServer) return cachedServer;

  const mainPathEnv = process.env.SSR_MAIN_PATH || "angular-ssr/main.js";
  const absMainPath = path.resolve(__dirname, "..", mainPathEnv);

  // DOM shim: optional index.html to emulate browser APIs
  try {
    const idxCandidates = [
      process.env.SSR_INDEX_HTML ? path.resolve(process.env.SSR_INDEX_HTML) : "",
      path.resolve(__dirname, "..", "angular-ssr", "index.html"),
    ].filter(Boolean);

    const idx = idxCandidates.find((p) => p && fs.existsSync(p));
    if (idx) {
      const shim = require(path.resolve(__dirname, "../server-dom-shim-lazy.js"));
      if (typeof shim === "function") shim(idx);
    }
  } catch (e) {
    console.warn("DOM shim not loaded:", (e as any)?.message || e);
  }

  // Load server bundle
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const moduleLoaded = require(absMainPath);
  cachedServer = moduleLoaded.app
    ? moduleLoaded.app()
    : moduleLoaded.default
      ? moduleLoaded.default()
      : moduleLoaded;

  return cachedServer;
}

export const ssr = onRequest(
  {
    region: process.env.REGION || "europe-west1",
    memory: "1GiB",
    timeoutSeconds: 60,
    cors: true,
  },
  (req, res) => {
    try {
      const server = getOrInitServer();
      return server(req, res);
    } catch (err) {
      console.error("SSR error:", err);
      return res.status(500).send("Internal Server Error");
    }
  }
);
