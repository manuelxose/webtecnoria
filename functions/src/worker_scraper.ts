import { workerData, parentPort } from "worker_threads";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

(async () => {
  const url: string = workerData?.url;
  try {
    const browser = await puppeteer.launch({
      executablePath: await chromium.executablePath(),
      headless: true,
      args: chromium.args,
      defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 1 }
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });
    const title = await page.title();
    await browser.close();
    parentPort?.postMessage({ type: "result", payload: { url, title } });
  } catch (e:any) {
    parentPort?.postMessage({ type: "error", error: e?.message || String(e) });
  }
})();
