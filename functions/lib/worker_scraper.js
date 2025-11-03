"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const chromium_1 = __importDefault(require("@sparticuz/chromium"));
(async () => {
    const url = worker_threads_1.workerData?.url;
    try {
        const browser = await puppeteer_core_1.default.launch({
            executablePath: await chromium_1.default.executablePath(),
            headless: true,
            args: chromium_1.default.args,
            defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 1 }
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });
        const title = await page.title();
        await browser.close();
        worker_threads_1.parentPort?.postMessage({ type: "result", payload: { url, title } });
    }
    catch (e) {
        worker_threads_1.parentPort?.postMessage({ type: "error", error: e?.message || String(e) });
    }
})();
