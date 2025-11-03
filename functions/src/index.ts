import * as admin from "firebase-admin";
import { onInit } from "firebase-functions/v2/core";
import { onRequest } from "firebase-functions/v2/https";

// Inicializar Firebase Admin una sola vez
admin.initializeApp();

// Variables para cachear el servidor SSR
let cachedServer: any = null;
let isInitialized = false;

// Inicialización diferida para SSR
onInit(async () => {
  if (!isInitialized) {
    try {
      const path = require("path");
      const fs = require("fs");

      const absMainPath = path.resolve(
        __dirname,
        "..",
        "angular-ssr",
        "main.js"
      );

      // DOM shim
      try {
        const idx = path.resolve(__dirname, "..", "angular-ssr", "index.html");
        if (fs.existsSync(idx)) {
          const shimPath = path.resolve(
            __dirname,
            "../server-dom-shim-lazy.js"
          );
          if (fs.existsSync(shimPath)) {
            const shim = require(shimPath);
            if (typeof shim === "function") shim(idx);
          }
        }
      } catch (e) {
        console.warn("DOM shim not loaded:", (e as any)?.message || e);
      }

      const moduleLoaded = require(absMainPath);
      cachedServer = moduleLoaded.app
        ? moduleLoaded.app()
        : moduleLoaded.default
        ? moduleLoaded.default()
        : moduleLoaded;

      isInitialized = true;
      console.log("✅ SSR server initialized successfully");
    } catch (err) {
      console.error("❌ SSR initialization error:", err);
      throw err;
    }
  }
});

// Función SSR con onInit
export const ssr = onRequest(
  {
    region: "europe-west1",
    memory: "1GiB",
    timeoutSeconds: 60,
    cors: true,
  },
  async (req, res) => {
    try {
      if (!isInitialized || !cachedServer) {
        console.warn("⏳ Server not yet initialized, waiting...");
        if (!cachedServer) {
          return res.status(503).send("Server is initializing, please retry");
        }
      }
      return cachedServer(req, res);
    } catch (err) {
      console.error("SSR error:", err);
      return res.status(500).send("Internal Server Error");
    }
  }
);

// Importar y exportar las demás funciones
export { sendEmailNotification } from "./sendEmailNotification";
export { indexBlogPost } from "./indexBlogPost";
export { createCompanyWorkbook, appendCompaniesToSheet } from "./sheets";
export { companyScraper } from "./companyScraper";
export { updateSitemap } from "./updateSitemap";
