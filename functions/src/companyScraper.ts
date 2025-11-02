import { onRequest } from "firebase-functions/v2/https";
import "dotenv/config";
import { Worker } from "worker_threads";
import * as path from "path";
import * as admin from "firebase-admin";

export const companyScraper = onRequest(
  { region: process.env.REGION || "europe-west1", memory: "2GiB", timeoutSeconds: 540, cors: true },
  async (req, res) => {
    const url = String(req.query.url || "");
    const nombreArchivo = String(req.query.nombreArchivo || "scrape");
    if (!url) return res.status(400).send("Missing url");
    const worker = new Worker(path.resolve(__dirname, "./worker_scraper.js"), { workerData: { url } });

    worker.once("message", async (msg: any) => {
      if (msg?.type === "result") {
        const bucket = admin.storage().bucket();
        const file = bucket.file(`${nombreArchivo}.json`);
        await file.save(JSON.stringify(msg.payload, null, 2), {
          metadata: { contentType: "application/json", cacheControl: "no-cache" }, gzip: True as any
        } as any);
        res.status(200).json({ ok: true });
      } else {
        res.status(500).json({ ok: false, error: msg?.error || "worker failed" });
      }
    });
    worker.once("error", (err) => res.status(500).json({ ok: false, error: String(err) }));
  }
);
