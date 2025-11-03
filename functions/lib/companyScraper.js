"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyScraper = void 0;
const https_1 = require("firebase-functions/v2/https");
require("dotenv/config");
const worker_threads_1 = require("worker_threads");
const path = __importStar(require("path"));
const admin = __importStar(require("firebase-admin"));
exports.companyScraper = (0, https_1.onRequest)({
    region: process.env.REGION || "europe-west1",
    memory: "2GiB",
    timeoutSeconds: 540,
    cors: true,
}, async (req, res) => {
    const url = String(req.query.url || "");
    const nombreArchivo = String(req.query.nombreArchivo || "scrape");
    if (!url) {
        res.status(400).send("Missing url");
        return;
    }
    const worker = new worker_threads_1.Worker(path.resolve(__dirname, "./worker_scraper.js"), {
        workerData: { url },
    });
    worker.once("message", async (msg) => {
        if (msg?.type === "result") {
            const bucket = admin.storage().bucket();
            const file = bucket.file(`${nombreArchivo}.json`);
            await file.save(JSON.stringify(msg.payload, null, 2), {
                metadata: {
                    contentType: "application/json",
                    cacheControl: "no-cache",
                },
                gzip: true,
            });
            res.status(200).json({ ok: true });
        }
        else {
            res
                .status(500)
                .json({ ok: false, error: msg?.error || "worker failed" });
        }
    });
    worker.once("error", (err) => res.status(500).json({ ok: false, error: String(err) }));
});
