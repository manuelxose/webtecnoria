#!/usr/bin/env node
/**
 * G03B-02 — Reproducible mobile performance baseline harness.
 *
 * Measures the LOCAL SSR BUILD served from apps/web/dist/server/server.mjs with a
 * real, installed Chrome/Edge driven over the Chrome DevTools Protocol (no
 * Playwright, no Lighthouse, no new dependency).
 *
 * WHY THIS SHAPE
 * --------------
 * scripts/browser-consent.mjs already proves that this host can launch the real
 * installed Chrome/Edge with --remote-debugging-port and drive it over the GLOBAL
 * WebSocket. scripts/seo-check.ts already proves how the SSR build is served and
 * how the API is stubbed. This harness reuses both patterns verbatim and adds the
 * measurement layer.
 *
 * DEPLOYED-BUILD RULE
 * --------------------
 * This harness NEVER builds. It measures apps/web/dist/server/server.mjs as it
 * exists on disk. If that file is missing it fails with an explicit instruction
 * to run `npm run build:ssr:web`.
 *
 * DEVICE PROFILE (fixed, asserted, never changed after the first measurement)
 * ---------------------------------------------------------------------------
 * 390x844 CSS px, deviceScaleFactor 3, mobile=true, touch (5 points), one
 * constant mobile user agent. The effective devicePixelRatio is READ BACK from
 * the page after navigation and a sample whose effective DPR is not 3 is marked
 * INVALID (it is never silently accepted).
 *
 * METRIC PROVENANCE
 * -----------------
 * Every metric carries an explicit source:
 *   - "browser-instrumentation": PerformanceObserver / PerformanceNavigationTiming
 *     / PerformanceResourceTiming values read out of the page.
 *   - "cdp": values reported by the DevTools protocol (Performance.getMetrics,
 *     Network.requestWillBeSent).
 * These are NOT Lighthouse metrics and are never labelled as such. No INP is
 * reported; the only responsiveness figure is the "long-task blocking
 * approximation" (sum of (duration - 50) over longtask entries).
 */

import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:http";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const BUILD_SOURCE_DIR = join(REPO_ROOT, "apps", "web", "dist");
const SERVER_ENTRY = join(BUILD_SOURCE_DIR, "server", "server.mjs");

// ── Fixed device profile ───────────────────────────────────────────────────────
const DEVICE = Object.freeze({
  width: 390,
  height: 844,
  deviceScaleFactor: 3,
  mobile: true,
  maxTouchPoints: 5,
});

const MOBILE_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36";

// ── Fixed throttle profiles ────────────────────────────────────────────────────
const CPU_THROTTLING_RATE = 4;

// "Slow 4G" class profile: Chrome DevTools' own Slow 4G preset values.
// downloadThroughput 200000 B/s = 1.6 Mbit/s; uploadThroughput 93750 B/s = 750 kbit/s.
const NETWORK_PROFILE = Object.freeze({
  name: "Slow 4G (Chrome DevTools preset class)",
  offline: false,
  latency: 150,
  downloadThroughput: 200000,
  uploadThroughput: 93750,
  connectionType: "cellular4g",
});

const OUTLIER_RULE =
  "A sample is flagged as an outlier when |value - median| > 2 * MAD, where MAD is the median absolute deviation of the successful samples of the same scenario (and the same metric) across all runs. When MAD is 0 the rule flags nothing.";

const SOURCE_BROWSER = "browser-instrumentation";
const SOURCE_CDP = "cdp";

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

const BROWSER_FLAGS = [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-extensions",
  "--disable-background-networking",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-renderer-backgrounding",
  "--disable-sync",
  "--disable-translate",
  "--hide-scrollbars",
  "--mute-audio",
];

const SCENARIOS = Object.freeze({
  home: { id: "home", label: "home", path: "/" },
  service: {
    id: "service",
    label: "service",
    path: "/servicios/desarrollo-software-medida",
  },
  blog: {
    id: "blog",
    label: "blog",
    path: "/blog/cuanto-cuesta-desarrollar-software-medida",
  },
});

const DEFAULT_SCENARIO_IDS = ["home", "service"];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ── CLI ────────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const options = {
    samples: 5,
    runs: 2,
    urls: [],
    scenarioIds: [],
    includeBlog: false,
    consent: "none",
    out: null,
    settleMs: 4000,
    navTimeoutMs: 45000,
    help: false,
  };

  const requireValue = (flag, index) => {
    const value = argv[index + 1];
    if (value === undefined) throw new Error(`${flag} requires a value`);
    return value;
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--samples":
        options.samples = Number.parseInt(requireValue(arg, index), 10);
        index += 1;
        break;
      case "--runs":
        options.runs = Number.parseInt(requireValue(arg, index), 10);
        index += 1;
        break;
      case "--url":
        options.urls.push(requireValue(arg, index));
        index += 1;
        break;
      case "--scenarios":
        options.scenarioIds = requireValue(arg, index)
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);
        index += 1;
        break;
      case "--include-blog":
        options.includeBlog = true;
        break;
      case "--consent":
        options.consent = requireValue(arg, index).trim().toLowerCase();
        index += 1;
        break;
      case "--out":
        options.out = requireValue(arg, index);
        index += 1;
        break;
      case "--settle-ms":
        options.settleMs = Number.parseInt(requireValue(arg, index), 10);
        index += 1;
        break;
      case "--nav-timeout-ms":
        options.navTimeoutMs = Number.parseInt(requireValue(arg, index), 10);
        index += 1;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        throw new Error(`unknown argument: ${arg}`);
    }
  }

  if (!Number.isInteger(options.samples) || options.samples < 1) {
    throw new Error("--samples must be a positive integer");
  }
  if (!Number.isInteger(options.runs) || options.runs < 1) {
    throw new Error("--runs must be a positive integer");
  }
  if (!["none", "accepted"].includes(options.consent)) {
    throw new Error('--consent must be "none" or "accepted"');
  }
  return options;
}

function usage() {
  process.stdout.write(
    [
      "Usage: node scripts/perf-baseline.mjs [options]",
      "",
      "  --samples N          successful samples per scenario (default 5)",
      "  --runs N             independent runs per scenario (default 2)",
      "  --url PATH           repeatable; overrides the default scenario set",
      "  --scenarios a,b      scenario ids: home, service, blog",
      "  --include-blog       add the blog scenario to the default set",
      "  --consent none|accepted   consent state (default none = no consent granted)",
      "  --out FILE           output JSON path",
      "  --settle-ms N        settle window after the load event (default 4000)",
      "  --nav-timeout-ms N   navigation timeout (default 45000)",
      "",
    ].join("\n")
  );
}

// ── Helpers (reused patterns from scripts/browser-consent.mjs) ─────────────────
function findChrome() {
  return CHROME_CANDIDATES.find((candidate) => existsSync(candidate)) ?? null;
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

async function waitForHttp(url, timeoutMs = 60000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // not up yet
    }
    await sleep(200);
  }
  throw new Error(`timed out waiting for ${url}`);
}

async function waitForChromeDevtools(port, timeoutMs = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return await response.json();
    } catch {
      // not up yet
    }
    await sleep(150);
  }
  throw new Error("Chrome DevTools endpoint did not start");
}

function startSsrServer(port, apiBaseUrl, entry = SERVER_ENTRY) {
  const child = spawn(process.execPath, [entry], {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: "production",
      API_INTERNAL_URL: apiBaseUrl,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stderr.on("data", (chunk) => {
    const text = String(chunk);
    if (!text.includes("Session validation")) process.stderr.write(`[ssr] ${text}`);
  });

  return child;
}

/** Same-origin API stub (pattern reused from scripts/seo-check.ts): every call 404s. */
function startApiStub(port) {
  const server = createServer((request, response) => {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ code: "NOT_FOUND" }));
  });
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

/**
 * SHA-256 fingerprint of a build tree (relative path + size + mtime).
 *
 * It is the proof that every sample of a run was measured against the SAME
 * build bytes. A concurrent `npm run build:web` in the same checkout replaces
 * the hashed asset names, which would silently invalidate the comparison.
 */
function buildFingerprint(root) {
  const hash = createHash("sha256");
  const entries = [];
  const walk = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, item.name);
      if (item.isDirectory()) {
        walk(full);
      } else if (item.isFile()) {
        const stat = statSync(full);
        entries.push(`${relative(root, full)}|${stat.size}|${stat.mtimeMs}`);
      }
    }
  };
  if (!existsSync(root)) return { root, fileCount: 0, sha256: null };
  walk(root);
  entries.sort();
  for (const entry of entries) hash.update(entry);
  return { root, fileCount: entries.length, sha256: hash.digest("hex") };
}

/**
 * Copies the existing build to a temporary directory so the measured bytes can
 * not change under the harness while it runs (a concurrent rebuild in the same
 * checkout replaces the hashed chunk names). The copy is of an existing build:
 * this harness never builds anything.
 */
function copyBuildSnapshot(sourceRoot) {
  const target = mkdtempSync(join(tmpdir(), "tecnoria-perf-build-"));
  cpSync(sourceRoot, target, { recursive: true });
  return target;
}

/** CDP client over the GLOBAL WebSocket (Node >= 22). Listeners receive sessionId. */function startCdp(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let nextId = 1;
  const pending = new Map();
  const listeners = new Map();

  const opened = new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve());
    socket.addEventListener("error", () => reject(new Error("CDP socket error")));
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) {
        reject(new Error(`${message.error.message} (${message.error.code})`));
      } else {
        resolve(message.result);
      }
      return;
    }

    if (message.method) {
      for (const handler of listeners.get(message.method) ?? []) {
        handler(message.params, message.sessionId);
      }
    }
  });

  return {
    opened,
    send(method, params = {}, sessionId) {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params, sessionId }));
      });
    },
    on(method, handler) {
      const handlers = listeners.get(method) ?? [];
      handlers.push(handler);
      listeners.set(method, handlers);
    },
    close() {
      try {
        socket.close();
      } catch {
        // ignore
      }
    },
  };
}

// ── Statistics ─────────────────────────────────────────────────────────────────
function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function standardDeviation(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance =
    values.reduce((total, value) => total + (value - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function medianAbsoluteDeviation(values, med) {
  return median(values.map((value) => Math.abs(value - med)));
}

function aggregate(values, sampleIndexes) {
  if (!values.length) {
    return {
      count: 0,
      median: null,
      min: null,
      max: null,
      standardDeviation: null,
      mad: null,
      outliers: [],
      outlierRule: OUTLIER_RULE,
    };
  }
  const med = median(values);
  const mad = medianAbsoluteDeviation(values, med);
  const outliers = [];
  if (mad > 0) {
    values.forEach((value, index) => {
      if (Math.abs(value - med) > 2 * mad) {
        outliers.push({
          sampleIndex: sampleIndexes[index],
          value,
          deviationFromMedian: value - med,
        });
      }
    });
  }
  return {
    count: values.length,
    median: med,
    min: Math.min(...values),
    max: Math.max(...values),
    standardDeviation: standardDeviation(values),
    mad,
    outliers,
    outlierRule: OUTLIER_RULE,
  };
}

// ── Browser instrumentation (installed BEFORE the document loads) ──────────────
const INSTRUMENTATION_SOURCE = `(() => {
  const state = {
    lcp: null,
    lcpEntryCount: 0,
    cls: 0,
    layoutShiftEntryCount: 0,
    longTaskCount: 0,
    longTaskTotalMs: 0,
    longTaskBlockingApproximationMs: 0,
    longTasks: [],
    observerErrors: []
  };
  window.__perf = state;

  const observe = (type, handler) => {
    try {
      const observer = new PerformanceObserver((list) => handler(list.getEntries()));
      observer.observe({ type: type, buffered: true });
    } catch (error) {
      state.observerErrors.push(type + ': ' + (error && error.message ? error.message : String(error)));
    }
  };

  observe('largest-contentful-paint', (entries) => {
    for (const entry of entries) {
      state.lcpEntryCount += 1;
      const element = entry.element;
      state.lcp = {
        startTime: entry.startTime,
        size: entry.size,
        url: entry.url || null,
        renderTime: entry.renderTime || null,
        loadTime: entry.loadTime || null,
        elementTag: element ? element.tagName : null,
        elementId: element && element.id ? element.id : null,
        elementClass: element && element.className ? String(element.className).slice(0, 160) : null,
        elementText: element && element.textContent ? element.textContent.trim().slice(0, 80) : null
      };
    }
  });

  observe('layout-shift', (entries) => {
    for (const entry of entries) {
      if (!entry.hadRecentInput) {
        state.cls += entry.value;
        state.layoutShiftEntryCount += 1;
      }
    }
  });

  observe('longtask', (entries) => {
    for (const entry of entries) {
      state.longTaskCount += 1;
      state.longTaskTotalMs += entry.duration;
      state.longTaskBlockingApproximationMs += Math.max(0, entry.duration - 50);
      if (state.longTasks.length < 20) {
        state.longTasks.push({
          startTime: entry.startTime,
          duration: entry.duration,
          name: entry.name,
          attribution: entry.attribution
            ? {
                containerType: entry.attribution.containerType || null,
                containerName: entry.attribution.containerName || null,
                containerSrc: entry.attribution.containerSrc || null,
                containerId: entry.attribution.containerId || null
              }
            : null
        });
      }
    }
  });

  const classify = (entry) => {
    const type = entry.initiatorType || 'other';
    if (type === 'script') return 'script';
    if (type === 'img' || type === 'image') return 'image';
    if (type === 'font') return 'font';
    if (type === 'css') return 'css';
    if (type === 'link') return 'css';
    if (type === 'xmlhttprequest') return 'xhr';
    if (type === 'fetch') return 'fetch';
    if (type === 'beacon') return 'beacon';
    if (type === 'iframe') return 'iframe';
    const name = String(entry.name || '').toLowerCase();
    if (/\\.m?js(\\?|$)/.test(name)) return 'script';
    if (/\\.css(\\?|$)/.test(name)) return 'css';
    if (/\\.(woff2?|ttf|otf|eot)(\\?|$)/.test(name)) return 'font';
    if (/\\.(webp|png|jpe?g|avif|gif|svg)(\\?|$)/.test(name)) return 'image';
    return type || 'other';
  };

  window.__perfCollect = () => {
    const navigationEntries = performance.getEntriesByType('navigation');
    const nav = navigationEntries[0] || null;
    const resources = performance.getEntriesByType('resource');

    const byType = {};
    const scripts = [];
    let totalTransferBytes = 0;
    let totalEncodedBytes = 0;

    for (const resource of resources) {
      const type = classify(resource);
      const transferSize = resource.transferSize || 0;
      const encodedBodySize = resource.encodedBodySize || 0;
      const decodedBodySize = resource.decodedBodySize || 0;
      if (!byType[type]) {
        byType[type] = { count: 0, transferBytes: 0, encodedBytes: 0, decodedBytes: 0 };
      }
      byType[type].count += 1;
      byType[type].transferBytes += transferSize;
      byType[type].encodedBytes += encodedBodySize;
      byType[type].decodedBytes += decodedBodySize;
      totalTransferBytes += transferSize;
      totalEncodedBytes += encodedBodySize;
      if (type === 'script') {
        scripts.push({
          url: resource.name,
          transferSize: transferSize,
          encodedBodySize: encodedBodySize,
          decodedBodySize: decodedBodySize,
          initiatorType: resource.initiatorType || null
        });
      }
    }

    scripts.sort((a, b) => (b.transferSize || b.encodedBodySize) - (a.transferSize || a.encodedBodySize));

    const navigation = nav
      ? {
          type: nav.type,
          requestStart: nav.requestStart,
          responseStart: nav.responseStart,
          responseEnd: nav.responseEnd,
          startTime: nav.startTime,
          domInteractive: nav.domInteractive,
          domContentLoadedEventStart: nav.domContentLoadedEventStart,
          domContentLoadedEventEnd: nav.domContentLoadedEventEnd,
          loadEventStart: nav.loadEventStart,
          loadEventEnd: nav.loadEventEnd,
          transferSize: nav.transferSize,
          encodedBodySize: nav.encodedBodySize,
          decodedBodySize: nav.decodedBodySize,
          ttfbMs: nav.responseStart - nav.requestStart,
          ttfbFromNavigationStartMs: nav.responseStart - nav.startTime,
          domInteractiveMs: nav.domInteractive - nav.startTime,
          domContentLoadedMs: nav.domContentLoadedEventEnd - nav.startTime,
          loadMs: nav.loadEventEnd - nav.startTime,
          responseTimeMs: nav.responseEnd - nav.responseStart
        }
      : null;

    let consentRecord = null;
    try {
      consentRecord = window.localStorage.getItem('tecnoria.consent.v1');
    } catch (error) {
      consentRecord = null;
    }

    const scriptOrigins = {};
    for (const script of document.querySelectorAll('script[src]')) {
      let origin = 'unknown';
      try {
        origin = new URL(script.src).host || 'unknown';
      } catch (error) {
        origin = 'unknown';
      }
      scriptOrigins[origin] = (scriptOrigins[origin] || 0) + 1;
    }

    const chatFallback = document.querySelector('.chat-fallback');
    const images = Array.from(document.querySelectorAll('img')).slice(0, 12).map((img) => ({
      src: img.currentSrc || img.src || null,
      loading: img.getAttribute('loading'),
      fetchpriority: img.getAttribute('fetchpriority'),
      decoding: img.getAttribute('decoding'),
      widthAttr: img.getAttribute('width'),
      heightAttr: img.getAttribute('height'),
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete
    }));

    const dom = {
      canvasCount: document.querySelectorAll('canvas').length,
      heroMeshOrbCount: document.querySelectorAll('.hero-mesh-orb').length,
      chatWidgetScriptPresent: !!document.getElementById('tecnoria-chat-widget-loader'),
      chatWidgetFallbackState: chatFallback ? (chatFallback.getAttribute('data-state') || null) : null,
      h1Count: document.querySelectorAll('h1').length,
      h1Text: (document.querySelector('h1') || {}).textContent
        ? document.querySelector('h1').textContent.trim().replace(/\\s+/g, ' ').slice(0, 120)
        : null,
      imageCount: document.querySelectorAll('img').length,
      images: images,
      styleSheetCount: document.styleSheets.length,
      fontFaceStatus: document.fonts ? document.fonts.status : null
    };

    return {
      lcp: state.lcp,
      lcpEntryCount: state.lcpEntryCount,
      cls: state.cls,
      layoutShiftEntryCount: state.layoutShiftEntryCount,
      longTaskCount: state.longTaskCount,
      longTaskTotalMs: state.longTaskTotalMs,
      longTaskBlockingApproximationMs: state.longTaskBlockingApproximationMs,
      longTasks: state.longTasks,
      observerErrors: state.observerErrors,
      navigation: navigation,
      resources: {
        total: resources.length,
        totalTransferBytes: totalTransferBytes,
        totalEncodedBytes: totalEncodedBytes,
        byType: byType,
        jsTransferBytes: byType.script ? byType.script.transferBytes : 0,
        jsEncodedBytes: byType.script ? byType.script.encodedBytes : 0,
        largestScripts: scripts.slice(0, 5)
      },
      consent: {
        storedRecord: consentRecord,
        dialogPresent: !!document.querySelector('[role="dialog"]'),
        reopenControlPresent: !!document.querySelector('.consent-reopen')
      },
      scriptOrigins: scriptOrigins,
      dom: dom,
      device: {
        devicePixelRatio: window.devicePixelRatio,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        screenWidth: window.screen ? window.screen.width : null,
        screenHeight: window.screen ? window.screen.height : null,
        userAgent: navigator.userAgent,
        hardwareConcurrency: navigator.hardwareConcurrency || null,
        deviceMemory: navigator.deviceMemory === undefined ? null : navigator.deviceMemory,
        readyState: document.readyState,
        locationHref: window.location.href
      }
    };
  };
  true;
})();`;

// ── Sample execution ───────────────────────────────────────────────────────────
async function collectSample({ cdp, url, settleMs, navTimeoutMs, consent }) {
  // A dedicated (incognito-like) browser context per sample: localStorage,
  // cookies and the consent record start EMPTY for every sample, so the consent
  // state is identical in every sample and in every run.
  const browserContext = await cdp.send("Target.createBrowserContext", {
    disposeOnDetach: false,
  });
  const target = await cdp.send("Target.createTarget", {
    url: "about:blank",
    browserContextId: browserContext.browserContextId,
  });
  const attached = await cdp.send("Target.attachToTarget", {
    targetId: target.targetId,
    flatten: true,
  });
  const sessionId = attached.sessionId;
  const send = (method, params = {}) => cdp.send(method, params, sessionId);

  const requestHosts = new Map();
  const requestUrls = [];
  const onRequestWillBeSent = (params, eventSessionId) => {
    if (eventSessionId !== sessionId) return;
    const requestUrl = params.request?.url ?? "";
    let host = "unknown";
    let hostname = "unknown";
    try {
      const parsedUrl = new URL(requestUrl);
      host = parsedUrl.host || "unknown";
      hostname = parsedUrl.hostname || "unknown";
    } catch {
      host = "unknown";
      hostname = "unknown";
    }
    requestHosts.set(host, (requestHosts.get(host) ?? 0) + 1);
    requestUrls.push({ url: requestUrl, hostname, at: Date.now() });
  };
  cdp.on("Network.requestWillBeSent", onRequestWillBeSent);

  let loadResolve;
  let loadReject;
  const loadPromise = new Promise((resolve, reject) => {
    loadResolve = resolve;
    loadReject = reject;
  });
  const onLoadEventFired = (_params, eventSessionId) => {
    if (eventSessionId === sessionId) loadResolve();
  };
  cdp.on("Page.loadEventFired", onLoadEventFired);

  const navTimer = setTimeout(() => {
    loadReject(new Error(`navigation timeout after ${navTimeoutMs} ms: ${url}`));
  }, navTimeoutMs);

  try {
    await send("Page.enable");
    await send("Network.enable");
    await send("Runtime.enable");
    try {
      await send("Performance.enable");
    } catch {
      // Performance domain is optional: main-thread metrics degrade gracefully.
    }

    // ── FINAL mobile configuration, applied BEFORE any page is opened ────────
    await send("Emulation.setDeviceMetricsOverride", {
      width: DEVICE.width,
      height: DEVICE.height,
      deviceScaleFactor: DEVICE.deviceScaleFactor,
      mobile: DEVICE.mobile,
    });
    await send("Emulation.setTouchEmulationEnabled", {
      enabled: true,
      maxTouchPoints: DEVICE.maxTouchPoints,
    });
    await send("Emulation.setUserAgentOverride", {
      userAgent: MOBILE_USER_AGENT,
      acceptLanguage: "es-ES,es;q=0.9,en;q=0.8",
      platform: "Android",
    });
    await send("Emulation.setCPUThrottlingRate", { rate: CPU_THROTTLING_RATE });
    await send("Network.emulateNetworkConditions", {
      offline: NETWORK_PROFILE.offline,
      latency: NETWORK_PROFILE.latency,
      downloadThroughput: NETWORK_PROFILE.downloadThroughput,
      uploadThroughput: NETWORK_PROFILE.uploadThroughput,
      connectionType: NETWORK_PROFILE.connectionType,
    });
    // Cache state is identical for every sample: disabled + flushed before nav.
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    await send("Network.clearBrowserCache");

    await send("Page.addScriptToEvaluateOnNewDocument", { source: INSTRUMENTATION_SOURCE });

    const readMetrics = async () => {
      try {
        const result = await send("Performance.getMetrics");
        const map = {};
        for (const metric of result.metrics ?? []) map[metric.name] = metric.value;
        return map;
      } catch {
        return null;
      }
    };
    const metricSnapshot = (map) => {
      if (!map) return null;
      const picked = {};
      for (const name of [
        "TaskDuration",
        "ScriptDuration",
        "LayoutDuration",
        "RecalcStyleDuration",
        "DevToolsCommandDuration",
        "Documents",
        "Frames",
        "Nodes",
        "LayoutCount",
        "RecalcStyleCount",
        "JSEventListeners",
      ]) {
        if (typeof map[name] === "number") picked[name] = map[name];
      }
      return picked;
    };
    const baseline = await readMetrics();

    const navigation = await send("Page.navigate", { url });
    if (navigation.errorText) {
      throw new Error(`navigation failed: ${navigation.errorText}`);
    }
    await loadPromise;
    clearTimeout(navTimer);

    const loadEventAt = Date.now();
    await sleep(settleMs);

    let consentAction = { requested: consent, bannerDismissed: false, found: null };
    if (consent === "accepted") {
      const clicked = await evaluate(
        send,
        `(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const target = buttons.find((button) => (button.textContent || '').trim() === 'Aceptar');
          if (!target) return { clicked: false };
          target.click();
          return { clicked: true };
        })()`
      );
      consentAction = {
        requested: consent,
        bannerDismissed: Boolean(clicked?.clicked),
        found: Boolean(clicked?.clicked),
      };
      await sleep(1000);
    }

    const collected = await evaluate(
      send,
      "JSON.stringify(window.__perfCollect ? window.__perfCollect() : null)"
    );
    const finalMetrics = await readMetrics();

    const delta = (name) => {
      if (!baseline || !finalMetrics) return null;
      const before = baseline[name];
      const after = finalMetrics[name];
      if (typeof before !== "number" || typeof after !== "number") return null;
      return after - before;
    };

    const parsed = collected ? JSON.parse(collected) : null;
    const hosts = {};
    for (const [host, count] of requestHosts) hosts[host] = count;
    const thirdPartyHosts = [
      ...new Set(
        requestUrls
          .map((entry) => entry.hostname)
          .filter((hostname) => hostname !== "127.0.0.1" && hostname !== "localhost")
      ),
    ];

    const effectiveDpr = parsed?.device?.devicePixelRatio ?? null;
    const invalidReasons = [];
    if (effectiveDpr !== DEVICE.deviceScaleFactor) {
      invalidReasons.push(
        `effective devicePixelRatio is ${effectiveDpr}, expected ${DEVICE.deviceScaleFactor}`
      );
    }

    return {
      valid: invalidReasons.length === 0,
      invalidReasons,
      url,
      finalUrl: parsed?.device?.locationHref ?? url,
      device: {
        source: SOURCE_BROWSER,
        expectedDevicePixelRatio: DEVICE.deviceScaleFactor,
        effectiveDevicePixelRatio: effectiveDpr,
        viewportCssPx: { width: DEVICE.width, height: DEVICE.height },
        innerWidth: parsed?.device?.innerWidth ?? null,
        innerHeight: parsed?.device?.innerHeight ?? null,
        screenWidth: parsed?.device?.screenWidth ?? null,
        screenHeight: parsed?.device?.screenHeight ?? null,
        userAgent: parsed?.device?.userAgent ?? null,
        hardwareConcurrency: parsed?.device?.hardwareConcurrency ?? null,
        deviceMemory: parsed?.device?.deviceMemory ?? null,
        readyState: parsed?.device?.readyState ?? null,
      },
      navigation: parsed?.navigation
        ? { source: SOURCE_BROWSER, ...parsed.navigation }
        : { source: SOURCE_BROWSER, ttfbMs: null },
      lcp: parsed?.lcp
        ? {
            source: SOURCE_BROWSER,
            startTimeMs: parsed.lcp.startTime,
            size: parsed.lcp.size,
            url: parsed.lcp.url,
            renderTime: parsed.lcp.renderTime,
            loadTime: parsed.lcp.loadTime,
            elementTag: parsed.lcp.elementTag,
            elementId: parsed.lcp.elementId,
            elementClass: parsed.lcp.elementClass,
            elementText: parsed.lcp.elementText,
            entryCount: parsed.lcpEntryCount,
          }
        : { source: SOURCE_BROWSER, startTimeMs: null, url: null, entryCount: parsed?.lcpEntryCount ?? 0 },
      cls: { source: SOURCE_BROWSER, value: parsed?.cls ?? 0, entryCount: parsed?.layoutShiftEntryCount ?? 0 },
      longTasks: {
        source: SOURCE_BROWSER,
        count: parsed?.longTaskCount ?? 0,
        totalMs: parsed?.longTaskTotalMs ?? 0,
        blockingApproximationMs: parsed?.longTaskBlockingApproximationMs ?? 0,
        label: "long-task blocking approximation (sum of duration - 50 over longtask entries)",
        entries: parsed?.longTasks ?? [],
      },
      resources: parsed?.resources
        ? { source: SOURCE_BROWSER, ...parsed.resources }
        : { source: SOURCE_BROWSER, total: 0, byType: {}, jsTransferBytes: 0, largestScripts: [] },
      requests: {
        source: SOURCE_CDP,
        total: requestUrls.length,
        byHost: hosts,
        thirdPartyHosts,
        thirdPartyRequestCount: requestUrls.filter(
          (entry) => entry.hostname !== "127.0.0.1" && entry.hostname !== "localhost"
        ).length,
        observationWindow:
          "from Page.navigate until the metrics were collected (load event + settle window)",
      },
      mainThread: {
        source: SOURCE_CDP,
        metric: "Performance.getMetrics (TaskDuration / ScriptDuration deltas)",
        taskDurationMs: delta("TaskDuration"),
        scriptDurationMs: delta("ScriptDuration"),
        layoutDurationMs: delta("LayoutDuration"),
        recalcStyleDurationMs: delta("RecalcStyleDuration"),
        rawBeforeNavigation: metricSnapshot(baseline),
        rawAfterNavigation: metricSnapshot(finalMetrics),
        cdpTaskDurationBelowLongTaskTotal:
          typeof delta("TaskDuration") === "number" &&
          (parsed?.longTaskTotalMs ?? 0) > 50 &&
          delta("TaskDuration") < (parsed?.longTaskTotalMs ?? 0) / 2,
        note:
          "Performance.getMetrics TaskDuration/ScriptDuration are reported exactly as the protocol returned them. They are compared against the longtask observer total (browser-instrumentation); neither value is Lighthouse Total Blocking Time.",
      },
      consent: {
        source: SOURCE_BROWSER,
        requested: consentAction.requested,
        effectiveState: (() => {
          const record = parsed?.consent?.storedRecord ?? null;
          if (!record) return "not-granted";
          try {
            const parsedRecord = JSON.parse(record);
            return parsedRecord.analytics === true ? "accepted" : "rejected";
          } catch {
            return "undecided";
          }
        })(),
        bannerDismissedInThisSample: consentAction.bannerDismissed,
        bannerPresentAfterLoad: parsed?.consent?.dialogPresent ?? null,
        storedRecord: parsed?.consent?.storedRecord ?? null,
        reopenControlPresent: parsed?.consent?.reopenControlPresent ?? null,
        isolatedBrowserContext: true,
      },
      scriptOrigins: parsed?.scriptOrigins ?? {},
      dom: {
        source: SOURCE_BROWSER,
        canvasCount: parsed?.dom?.canvasCount ?? null,
        heroMeshOrbCount: parsed?.dom?.heroMeshOrbCount ?? null,
        chatWidgetScriptPresent: parsed?.dom?.chatWidgetScriptPresent ?? null,
        chatWidgetFallbackState: parsed?.dom?.chatWidgetFallbackState ?? null,
        h1Count: parsed?.dom?.h1Count ?? null,
        h1Text: parsed?.dom?.h1Text ?? null,
        imageCount: parsed?.dom?.imageCount ?? null,
        images: parsed?.dom?.images ?? [],
        styleSheetCount: parsed?.dom?.styleSheetCount ?? null,
        fontFaceStatus: parsed?.dom?.fontFaceStatus ?? null,
      },
      observerErrors: parsed?.observerErrors ?? [],
      timing: {
        source: SOURCE_BROWSER,
        settleWaitMs: settleMs,
        wallClockFromLoadToCollectMs: Date.now() - loadEventAt,
      },
    };
  } finally {
    clearTimeout(navTimer);
    try {
      await cdp.send("Target.closeTarget", { targetId: target.targetId });
    } catch {
      // ignore
    }
    try {
      await cdp.send("Target.disposeBrowserContext", {
        browserContextId: browserContext.browserContextId,
      });
    } catch {
      // ignore
    }
  }
}

async function evaluate(send, expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    const description =
      result.exceptionDetails.exception?.description ?? result.exceptionDetails.text;
    throw new Error(`evaluate failed: ${description}`);
  }
  return result.result?.value ?? null;
}

// ── Environment ────────────────────────────────────────────────────────────────
function gitInfo() {
  const run = (args) => {
    try {
      return execFileSync("git", args, {
        cwd: REPO_ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim();
    } catch {
      return null;
    }
  };
  const status = run(["status", "--porcelain"]);
  return {
    commit: run(["rev-parse", "HEAD"]),
    branch: run(["branch", "--show-current"]),
    dirty: status ? status.length > 0 : null,
    dirtyPaths: status ? status.split(/\r?\n/).filter(Boolean) : [],
  };
}

function browserVersionFromExecutable(executablePath) {
  try {
    const output = execFileSync(executablePath, ["--version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 10000,
    });
    const text = String(output).trim();
    return text || null;
  } catch {
    return null;
  }
}

// ── Report printing ────────────────────────────────────────────────────────────
function formatNumber(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return Number(value).toFixed(digits);
}

function printTable(report) {
  const lines = [];
  const config = report.configuration;
  const env = report.environment;

  lines.push("");
  lines.push(`TECNORIA mobile performance baseline — ${report.generatedAt.dateLocal}`);
  lines.push(
    `Device: ${DEVICE.width}x${DEVICE.height} @${DEVICE.deviceScaleFactor}x mobile, touch ${DEVICE.maxTouchPoints} | CPU ${CPU_THROTTLING_RATE}x | ${NETWORK_PROFILE.name} (latency ${NETWORK_PROFILE.latency} ms, down ${NETWORK_PROFILE.downloadThroughput} B/s, up ${NETWORK_PROFILE.uploadThroughput} B/s)`
  );
  lines.push(
    `Consent: ${config.consentState} | cache: disabled + cleared per sample | samples/scenario: ${config.samplesPerScenario} | runs: ${config.runsPerScenario}`
  );
  lines.push(
    `Browser: ${env.browser.product ?? "unknown"} ${env.browser.revision ?? ""} (${env.browser.executablePath})`
  );
  lines.push(
    `Node: ${env.nodeVersion} | OS: ${env.os.platform} ${env.os.release} ${env.os.arch} | git: ${env.git.commit?.slice(0, 7) ?? "?"} (dirty: ${env.git.dirty ? "yes" : "no"})`
  );
  lines.push(
    `Build: served from ${env.build?.servedFrom ?? "?"} (fingerprint ${env.build?.servedFingerprintBefore?.sha256?.slice(0, 12) ?? "?"}) | source build changed during run: ${env.build?.sourceChangedDuringRun ? "YES" : "no"}`
  );
  lines.push("");

  const header = [
    "scenario".padEnd(16),
    "run".padStart(4),
    "n".padStart(3),
    "LCP ms".padStart(10),
    "CLS".padStart(9),
    "longTsk".padStart(8),
    "longTot".padStart(9),
    "block~ms".padStart(9),
    "mainThr ms".padStart(11),
    "JS KiB".padStart(9),
    "reqs".padStart(6),
    "dpr".padStart(4),
  ].join(" ");
  lines.push(header);
  lines.push("-".repeat(header.length));

  for (const scenario of report.scenarios) {
    for (const run of scenario.runs) {
      const medians = run.medians;
      lines.push(
        [
          scenario.label.padEnd(16),
          String(run.runIndex).padStart(4),
          String(medians.samples).padStart(3),
          formatNumber(medians.lcpMs).padStart(10),
          formatNumber(medians.cls, 4).padStart(9),
          String(medians.longTaskCount).padStart(8),
          formatNumber(medians.longTaskTotalMs).padStart(9),
          formatNumber(medians.longTaskBlockingApproximationMs).padStart(9),
          formatNumber(medians.mainThreadTaskMs).padStart(11),
          formatNumber(medians.jsTransferBytes / 1024).padStart(9),
          String(medians.requestCount).padStart(6),
          String(medians.devicePixelRatio).padStart(4),
        ].join(" ")
      );
    }
  }

  lines.push("");
  for (const scenario of report.scenarios) {
    const medians = scenario.aggregates;
    lines.push(
      `median ${scenario.label}: LCP ${formatNumber(medians.lcpMs?.median)} ms | CLS ${formatNumber(medians.cls?.median, 4)} | long tasks ${medians.longTaskCount?.median} (blocking approx ${formatNumber(medians.longTaskBlockingApproximationMs?.median)} ms) | main thread ${formatNumber(medians.mainThreadTaskMs?.median)} ms | JS transfer ${formatNumber(medians.jsTransferBytes?.median / 1024)} KiB | requests ${medians.requestCount?.median} | TTFB ${formatNumber(medians.ttfbMs?.median)} ms`
    );
    const variation = scenario.runToRunVariation;
    if (variation) {
      const parts = [];
      for (const [metric, value] of Object.entries(variation.metrics ?? {})) {
        if (!value) continue;
        parts.push(
          `${metric} ${value.delta >= 0 ? "+" : ""}${formatNumber(value.delta)} (${formatNumber(value.deltaPercent, 1)}%)`
        );
      }
      lines.push(
        `run-to-run variation ${scenario.label} (run ${variation.runA} vs run ${variation.runB}): ${parts.join(" | ") || "n/a"}`
      );
    }
    const outliers = Object.entries(scenario.outliers ?? {});
    if (outliers.length) {
      for (const [metric, entries] of outliers) {
        lines.push(
          `outliers ${scenario.label} ${metric}: ${entries.map((entry) => `sample#${entry.sampleIndex}=${formatNumber(entry.value)}`).join(", ")}`
        );
      }
    }
    lines.push(
      `samples ${scenario.label}: ${scenario.successfulSamples}/${scenario.requestedSamples} successful, ${scenario.invalidSamples} invalid, ${scenario.failedSamples} failed`
    );
  }

  lines.push("");
  lines.push(`JSON: ${report.outputPath}`);
  lines.push("");
  process.stdout.write(lines.join("\n"));
}

// ── Sample → metric extraction ─────────────────────────────────────────────────
function extractMetrics(sample) {
  return {
    lcpMs: sample.lcp?.startTimeMs ?? null,
    cls: sample.cls?.value ?? null,
    ttfbMs: sample.navigation?.ttfbMs ?? null,
    ttfbFromNavigationStartMs: sample.navigation?.ttfbFromNavigationStartMs ?? null,
    domContentLoadedMs: sample.navigation?.domContentLoadedMs ?? null,
    loadMs: sample.navigation?.loadMs ?? null,
    longTaskCount: sample.longTasks?.count ?? null,
    longTaskTotalMs: sample.longTasks?.totalMs ?? null,
    longTaskBlockingApproximationMs: sample.longTasks?.blockingApproximationMs ?? null,
    mainThreadTaskMs: sample.mainThread?.taskDurationMs ?? null,
    scriptDurationMs: sample.mainThread?.scriptDurationMs ?? null,
    jsTransferBytes: sample.resources?.jsTransferBytes ?? null,
    resourceCount: sample.resources?.total ?? null,
    requestCount: sample.requests?.total ?? null,
    devicePixelRatio: sample.device?.effectiveDevicePixelRatio ?? null,
  };
}

const METRIC_SOURCES = {
  lcpMs: SOURCE_BROWSER,
  cls: SOURCE_BROWSER,
  ttfbMs: SOURCE_BROWSER,
  ttfbFromNavigationStartMs: SOURCE_BROWSER,
  domContentLoadedMs: SOURCE_BROWSER,
  loadMs: SOURCE_BROWSER,
  longTaskCount: SOURCE_BROWSER,
  longTaskTotalMs: SOURCE_BROWSER,
  longTaskBlockingApproximationMs: SOURCE_BROWSER,
  mainThreadTaskMs: SOURCE_CDP,
  scriptDurationMs: SOURCE_CDP,
  jsTransferBytes: SOURCE_BROWSER,
  resourceCount: SOURCE_BROWSER,
  requestCount: SOURCE_CDP,
  devicePixelRatio: SOURCE_BROWSER,
};

function aggregateSamples(samples) {
  const metrics = {};
  const successful = samples.filter((sample) => sample.valid);
  for (const name of Object.keys(METRIC_SOURCES)) {
    const values = [];
    const indexes = [];
    successful.forEach((sample, index) => {
      const value = extractMetrics(sample)[name];
      if (typeof value === "number" && Number.isFinite(value)) {
        values.push(value);
        indexes.push(sample.sampleIndex ?? index + 1);
      }
    });
    metrics[name] = { source: METRIC_SOURCES[name], ...aggregate(values, indexes) };
  }
  return metrics;
}

function medianMap(samples) {
  const aggregated = aggregateSamples(samples);
  const medians = {};
  for (const [name, stats] of Object.entries(aggregated)) {
    medians[name] = stats.median;
  }
  medians.samples = samples.filter((sample) => sample.valid).length;
  return medians;
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`perf-baseline: ${error.message}`);
    usage();
    process.exitCode = 1;
    return;
  }
  if (options.help) {
    usage();
    return;
  }

  // DEPLOYED-BUILD RULE: measure the existing build; never build.
  if (!existsSync(SERVER_ENTRY)) {
    console.error(
      [
        `perf-baseline: SSR build not found at ${SERVER_ENTRY}`,
        "This harness measures an existing build and never builds.",
        "Run:",
        "  npm run build:ssr:web",
        `and re-run: node scripts/perf-baseline.mjs --samples ${options.samples}`,
      ].join("\n")
    );
    process.exitCode = 1;
    return;
  }

  const chromePath = findChrome();
  if (!chromePath) {
    console.error(
      "perf-baseline: no Chromium binary found (Chrome/Edge). Install Chrome or Edge and re-run."
    );
    process.exitCode = 1;
    return;
  }

  const scenarioDefs = [];
  if (options.urls.length) {
    options.urls.forEach((path, index) => {
      const normalized = path.startsWith("/") ? path : `/${path}`;
      scenarioDefs.push({
        id: `url-${index + 1}`,
        label: normalized === "/" ? "home" : normalized.slice(1).replace(/\//g, "-").slice(0, 15),
        path: normalized,
      });
    });
  } else {
    const ids = options.scenarioIds.length ? options.scenarioIds : DEFAULT_SCENARIO_IDS;
    for (const id of ids) {
      if (!SCENARIOS[id]) throw new Error(`unknown scenario id: ${id}`);
      scenarioDefs.push(SCENARIOS[id]);
    }
    if (
      options.includeBlog &&
      !scenarioDefs.some((scenario) => scenario.id === "blog")
    ) {
      scenarioDefs.push(SCENARIOS.blog);
    }
  }

  const now = new Date();
  const localDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const outputPath = options.out
    ? options.out
    : join("docs", "growth", "_team", `perf-baseline-${localDate}.json`);

  const ssrPort = await getFreePort();
  const apiPort = await getFreePort();
  const devtoolsPort = await getFreePort();
  const userDataDir = mkdtempSync(join(tmpdir(), "tecnoria-perf-"));
  const apiBaseUrl = `http://127.0.0.1:${apiPort}`;
  const baseUrl = `http://127.0.0.1:${ssrPort}`;

  // Immutable copy of the EXISTING build: the bytes under measurement can not
  // change while the harness runs, even if somebody rebuilds the checkout.
  const sourceFingerprintBefore = buildFingerprint(BUILD_SOURCE_DIR);
  let buildRoot = BUILD_SOURCE_DIR;
  let servedFrom = "source";
  let snapshotRoot = null;
  try {
    snapshotRoot = copyBuildSnapshot(BUILD_SOURCE_DIR);
    buildRoot = snapshotRoot;
    servedFrom = "snapshot";
  } catch (error) {
    console.error(
      `perf-baseline: could not snapshot the build (${error.message}); serving directly from ${BUILD_SOURCE_DIR}.`
    );
  }
  const servedEntry = join(buildRoot, "server", "server.mjs");
  const servedFingerprintBefore = buildFingerprint(buildRoot);

  const apiServer = await startApiStub(apiPort);
  const ssr = startSsrServer(ssrPort, apiBaseUrl, servedEntry);

  let chrome;
  let cdp;

  try {
    await waitForHttp(`${baseUrl}/health`, 60000);

    chrome = spawn(
      chromePath,
      [
        ...BROWSER_FLAGS,
        `--remote-debugging-port=${devtoolsPort}`,
        `--user-data-dir=${userDataDir}`,
        `--window-size=${DEVICE.width},${DEVICE.height}`,
        "about:blank",
      ],
      { stdio: "ignore" }
    );

    const devtools = await waitForChromeDevtools(devtoolsPort);
    cdp = startCdp(devtools.webSocketDebuggerUrl);
    await cdp.opened;

    const browserVersion = await cdp.send("Browser.getVersion");
    const git = gitInfo();

    const environment = {
      dateUtc: now.toISOString(),
      dateLocal: now.toString(),
      dateLocalIso: `${localDate}T${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`,
      localTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      os: {
        platform: os.platform(),
        release: os.release(),
        arch: os.arch(),
        cpuCount: os.cpus().length,
        cpuModel: os.cpus()[0]?.model ?? null,
        totalMemoryBytes: os.totalmem(),
      },
      nodeVersion: process.version,
      git,
      browser: {
        executablePath: chromePath,
        executableVersion: browserVersionFromExecutable(chromePath),
        product: browserVersion.product ?? null,
        revision: browserVersion.revision ?? null,
        userAgent: browserVersion.userAgent ?? null,
        jsVersion: browserVersion.jsVersion ?? null,
        protocolVersion: browserVersion.protocolVersion ?? null,
        flags: BROWSER_FLAGS,
      },
      server: {
        entry: servedEntry,
        sourceEntry: SERVER_ENTRY,
        servedFrom,
        port: ssrPort,
        baseUrl,
        apiInternalUrl: apiBaseUrl,
      },
      build: {
        sourceDir: BUILD_SOURCE_DIR,
        servedFrom,
        snapshotDir: snapshotRoot,
        sourceFingerprintBefore,
        servedFingerprintBefore,
        sourceFingerprintAfter: null,
        servedFingerprintAfter: null,
        sourceChangedDuringRun: null,
        servedTreeChangedDuringRun: null,
        note:
          "The build is never rebuilt by this harness. A temporary copy of the existing dist tree is served so that a concurrent rebuild in the same checkout cannot change the measured bytes; the SHA-256 fingerprints below prove which bytes were served.",
      },
    };

    const configuration = {
      samplesPerScenario: options.samples,
      runsPerScenario: options.runs,
      warmupLoadsPerRun: 1,
      isolatedBrowserContextPerSample: true,
      settleMsAfterLoad: options.settleMs,
      navigationTimeoutMs: options.navTimeoutMs,
      consentState: options.consent,
      cacheState: {
        cacheDisabledPerSample: true,
        browserCacheClearedBeforeEachNavigation: true,
        note: "Network.setCacheDisabled(true) + Network.clearBrowserCache() before every navigation, so every sample starts from an empty HTTP cache.",
      },
      device: {
        viewportCssPx: { width: DEVICE.width, height: DEVICE.height },
        deviceScaleFactor: DEVICE.deviceScaleFactor,
        mobile: DEVICE.mobile,
        maxTouchPoints: DEVICE.maxTouchPoints,
        userAgent: MOBILE_USER_AGENT,
        dprAssertion:
          "window.devicePixelRatio is read after every navigation; a sample whose effective DPR is not 3 is marked invalid and excluded from the aggregates.",
      },
      cpuThrottlingRate: CPU_THROTTLING_RATE,
      networkProfile: NETWORK_PROFILE,
      procedure: [
        "One discarded warm-up page load per scenario and run.",
        "Every sample uses a FRESH browser target (new document) inside a dedicated browser context (empty localStorage/cookies), with the final mobile configuration applied before any navigation.",
        "Emulation.setDeviceMetricsOverride(390x844, deviceScaleFactor 3, mobile true), Emulation.setTouchEmulationEnabled(5 points) and one constant mobile user agent are applied before the first navigation and never changed afterwards.",
        "Emulation.setCPUThrottlingRate(4) and Network.emulateNetworkConditions (Slow 4G class) are applied before the navigation of every sample.",
        "Page.addScriptToEvaluateOnNewDocument installs the PerformanceObservers (largest-contentful-paint, layout-shift, longtask) before the document loads.",
        "After the load event the harness waits a fixed settle window and then reads the navigation/resource/observer data out of the page with Runtime.evaluate.",
        "CDP Performance.getMetrics is sampled before and after the navigation and reported as a delta (TaskDuration, ScriptDuration).",
      ],
      scenarios: scenarioDefs.map((scenario) => ({
        id: scenario.id,
        label: scenario.label,
        path: scenario.path,
        url: `${baseUrl}${scenario.path}`,
      })),
      urls: scenarioDefs.map((scenario) => `${baseUrl}${scenario.path}`),
    };

    const methodology = {
      metricSources: {
        "browser-instrumentation":
          "PerformanceNavigationTiming, PerformanceResourceTiming and PerformanceObserver (largest-contentful-paint, layout-shift, longtask) read out of the page with Runtime.evaluate.",
        cdp:
          "Chrome DevTools Protocol: Performance.getMetrics (TaskDuration, ScriptDuration, LayoutDuration, RecalcStyleDuration) and Network.requestWillBeSent (request counting, host attribution).",
      },
      metricSourceByName: METRIC_SOURCES,
      outlierRule: OUTLIER_RULE,
      labels: {
        lcpMs: "Largest Contentful Paint candidate start time (browser instrumentation).",
        cls: "Cumulative Layout Shift, layout-shift entries with hadRecentInput excluded.",
        longTaskBlockingApproximationMs:
          "Long-task blocking approximation = sum of (longtask duration - 50). This is NOT Lighthouse Total Blocking Time (TBT).",
        mainThreadTaskMs:
          "CDP Performance.getMetrics TaskDuration delta for the navigation (main-thread task time).",
        scriptDurationMs: "CDP Performance.getMetrics ScriptDuration delta for the navigation.",
        jsTransferBytes:
          "Sum of PerformanceResourceTiming transferSize over resources classified as scripts (encodedBodySize is reported separately as a fallback).",
        requestCount: "CDP Network.requestWillBeSent count during the navigation (document + subresources).",
        ttfbMs: "PerformanceNavigationTiming responseStart - requestStart.",
      },
      notMeasured: [
        "Lighthouse metrics (this harness is not Lighthouse and reports no Lighthouse score).",
        "Real Total Blocking Time (TBT) as Lighthouse defines it.",
        "INP / interaction responsiveness (no interaction is performed; only a long-task approximation is reported).",
        "Field data (CrUX, RUM, real-user Core Web Vitals).",
        "Cross-origin resource transfer sizes are 0 without Timing-Allow-Origin; third-party request counts are still reported.",
      ],
    };

    const scenarioResults = [];

    for (const scenario of scenarioDefs) {
      const url = `${baseUrl}${scenario.path}`;
      const runs = [];
      let warmupError = null;

      for (let runIndex = 1; runIndex <= options.runs; runIndex += 1) {
        const warmupStartedAt = new Date().toISOString();
        let warmup = null;
        try {
          warmup = await collectSample({
            cdp,
            url,
            settleMs: options.settleMs,
            navTimeoutMs: options.navTimeoutMs,
            consent: options.consent,
          });
          warmup = {
            startedAt: warmupStartedAt,
            valid: warmup.valid,
            devicePixelRatio: warmup.device?.effectiveDevicePixelRatio ?? null,
            lcpMs: warmup.lcp?.startTimeMs ?? null,
            discarded: true,
          };
        } catch (error) {
          warmupError = String(error?.message ?? error);
          warmup = { startedAt: warmupStartedAt, discarded: true, error: warmupError };
        }

        const samples = [];
        for (let sampleIndex = 1; sampleIndex <= options.samples; sampleIndex += 1) {
          const startedAt = new Date().toISOString();
          try {
            const sample = await collectSample({
              cdp,
              url,
              settleMs: options.settleMs,
              navTimeoutMs: options.navTimeoutMs,
              consent: options.consent,
            });
            samples.push({ runIndex, sampleIndex, startedAt, ...sample });
          } catch (error) {
            samples.push({
              runIndex,
              sampleIndex,
              startedAt,
              valid: false,
              failed: true,
              error: String(error?.message ?? error),
            });
          }
          process.stdout.write(
            `  ${scenario.label} run ${runIndex} sample ${sampleIndex}/${options.samples} done\n`
          );
        }

        runs.push({
          runIndex,
          warmup,
          samples,
          medians: medianMap(samples),
          aggregates: aggregateSamples(samples),
        });
      }

      const allSamples = runs.flatMap((run) => run.samples);
      const aggregates = aggregateSamples(allSamples);
      const successfulSamples = allSamples.filter((sample) => sample.valid).length;
      const invalidSamples = allSamples.filter(
        (sample) => sample.valid === false && sample.failed !== true
      ).length;
      const failedSamples = allSamples.filter((sample) => sample.failed === true).length;

      const outliers = {};
      for (const [name, stats] of Object.entries(aggregates)) {
        if (stats.outliers?.length) outliers[name] = stats.outliers;
      }

      let runToRunVariation = null;
      if (runs.length >= 2) {
        const runA = runs[0].medians;
        const runB = runs[1].medians;
        const metrics = {};
        for (const name of [
          "lcpMs",
          "cls",
          "ttfbMs",
          "longTaskBlockingApproximationMs",
          "mainThreadTaskMs",
          "jsTransferBytes",
          "requestCount",
        ]) {
          const a = runA[name];
          const b = runB[name];
          if (typeof a !== "number" || typeof b !== "number") continue;
          metrics[name] = {
            source: METRIC_SOURCES[name],
            runA: a,
            runB: b,
            delta: b - a,
            deltaPercent: a === 0 ? null : ((b - a) / a) * 100,
          };
        }
        runToRunVariation = { runA: runs[0].runIndex, runB: runs[1].runIndex, metrics };
      }

      scenarioResults.push({
        id: scenario.id,
        label: scenario.label,
        path: scenario.path,
        url,
        requestedSamples: options.samples * options.runs,
        successfulSamples,
        invalidSamples,
        failedSamples,
        warmupError,
        runs,
        aggregates,
        outliers,
        runToRunVariation,
      });
    }

    environment.build.sourceFingerprintAfter = buildFingerprint(BUILD_SOURCE_DIR);
    environment.build.servedFingerprintAfter = buildFingerprint(buildRoot);
    environment.build.sourceChangedDuringRun =
      environment.build.sourceFingerprintBefore.sha256 !==
      environment.build.sourceFingerprintAfter.sha256;
    environment.build.servedTreeChangedDuringRun =
      environment.build.servedFingerprintBefore.sha256 !==
      environment.build.servedFingerprintAfter.sha256;

    const report = {
      schemaVersion: "tecnoria-perf-baseline/1",
      generatedAt: {
        dateUtc: now.toISOString(),
        dateLocal: now.toString(),
        dateLocalIso: environment.dateLocalIso,
        timeZone: environment.localTimeZone,
      },
      outputPath,
      configuration,
      environment,
      methodology,
      scenarios: scenarioResults,
      summary: {
        totalSamples: scenarioResults.reduce(
          (total, scenario) => total + scenario.requestedSamples,
          0
        ),
        successfulSamples: scenarioResults.reduce(
          (total, scenario) => total + scenario.successfulSamples,
          0
        ),
        invalidSamples: scenarioResults.reduce(
          (total, scenario) => total + scenario.invalidSamples,
          0
        ),
        failedSamples: scenarioResults.reduce(
          (total, scenario) => total + scenario.failedSamples,
          0
        ),
      },
    };

    mkdirSync(join(REPO_ROOT, "docs", "growth", "_team"), { recursive: true });
    writeFileSync(join(REPO_ROOT, outputPath), `${JSON.stringify(report, null, 2)}\n`, "utf8");

    printTable(report);

    const shortfalls = scenarioResults.filter(
      (scenario) => scenario.successfulSamples < scenario.requestedSamples
    );
    if (shortfalls.length) {
      for (const scenario of shortfalls) {
        console.error(
          `perf-baseline: scenario "${scenario.label}" produced ${scenario.successfulSamples}/${scenario.requestedSamples} successful samples (${scenario.invalidSamples} invalid, ${scenario.failedSamples} failed).`
        );
      }
      process.exitCode = 1;
    }
  } finally {
    cdp?.close();
    try {
      apiServer.close();
      apiServer.closeAllConnections?.();
    } catch {
      // ignore
    }
    ssr.kill();
    if (chrome?.pid) {
      try {
        spawn("taskkill", ["/pid", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
      } catch {
        chrome.kill();
      }
    }
    await sleep(300);
    try {
      rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
    if (snapshotRoot) {
      try {
        rmSync(snapshotRoot, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

