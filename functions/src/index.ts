import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";

admin.initializeApp();

export const ssr = onRequest(
  {
    region: "europe-west1",
    memory: "1GiB",
    timeoutSeconds: 60,
    cors: true,
  },
  (req, res) => {
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

      // Load server bundle
      const moduleLoaded = require(absMainPath);
      const server = moduleLoaded.app
        ? moduleLoaded.app()
        : moduleLoaded.default
        ? moduleLoaded.default()
        : moduleLoaded;

      return server(req, res);
    } catch (err) {
      console.error("SSR error:", err);
      return res.status(500).send("Internal Server Error");
    }
  }
);
