// Real-browser consent E2E (node:test + Chrome DevTools Protocol).
//
// No test framework, no Playwright: it launches the installed Chrome/Edge with
// --headless=new --remote-debugging-port, drives it over the global WebSocket
// and asserts the consent behaviour of the SSR build served locally.
//
// The API is stubbed by a same-origin proxy so form submissions can return 201
// or 500 deterministically without touching a database.

import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer, request as httpRequest } from "node:http";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const SERVER_ENTRY = join(REPO_ROOT, "apps", "web", "dist", "server", "server.mjs");

const GOOGLE_HOST_PATTERN =
  /googletagmanager\.com|google-analytics\.com|doubleclick\.net|googlesyndication\.com|googleadservices\.com/;

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

async function waitForHttp(url, timeoutMs = 40000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      }
    } catch {
      // not up yet
    }
    await sleep(200);
  }
  throw new Error(`timed out waiting for ${url}`);
}

function startSsrServer(port) {
  const child = spawn(process.execPath, [SERVER_ENTRY], {
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: "production",
      API_INTERNAL_URL: "http://127.0.0.1:1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stderr.on("data", (chunk) => {
    const text = String(chunk);
    if (!text.includes("Session validation")) {
      process.stderr.write(`[ssr] ${text}`);
    }
  });

  return child;
}

/** Same-origin proxy: stubs POST /api/v1/contact, forwards everything else. */
function startStubProxy(port, ssrPort, state) {
  const proxy = createServer((req, res) => {
    if (req.url === "/__stub/mode") {
      const url = new URL(req.url, "http://127.0.0.1");
      state.mode = Number(url.searchParams.get("value") || "201");
      res.writeHead(200, { "content-type": "text/plain" });
      res.end(String(state.mode));
      return;
    }

    if (req.method === "POST" && req.url.startsWith("/api/v1/contact")) {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          state.contactRequests.push(JSON.parse(body || "{}"));
        } catch {
          state.contactRequests.push({});
        }

        if (state.mode === 500) {
          res.writeHead(500, { "content-type": "application/json" });
          res.end(JSON.stringify({ code: "STUB_ERROR", message: "stubbed failure" }));
          return;
        }

        res.writeHead(201, { "content-type": "application/json" });
        res.end(JSON.stringify({ id: `stub-${state.contactRequests.length}` }));
      });
      return;
    }

    const upstream = httpRequest(
      {
        host: "127.0.0.1",
        port: ssrPort,
        path: req.url,
        method: req.method,
        headers: { ...req.headers, host: `127.0.0.1:${ssrPort}` },
      },
      (upstreamResponse) => {
        res.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
        upstreamResponse.pipe(res);
      }
    );

    upstream.on("error", (error) => {
      if (!res.headersSent) {
        res.writeHead(502, { "content-type": "text/plain" });
      }
      res.end(`proxy error: ${error.message}`);
    });

    req.pipe(upstream);
  });

  return proxy;
}

function startCdp(webSocketUrl) {
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
        handler(message.params);
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

async function waitForChromeDevtools(port, timeoutMs = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // not up yet
    }
    await sleep(150);
  }
  throw new Error("Chrome DevTools endpoint did not start");
}

const JSDOM_HELPERS = `
  window.__test = {
    dialog() {
      return document.querySelector('[role="dialog"]');
    },
    bannerButtons() {
      const dialog = this.dialog();
      return dialog ? [...dialog.querySelectorAll('button')].map((b) => ({
        text: b.textContent.trim(),
        className: b.getAttribute('class'),
      })) : [];
    },
    clickText(text) {
      const target = [...document.querySelectorAll('button, a')]
        .find((node) => node.textContent.trim() === text);
      if (!target) return false;
      target.click();
      return true;
    },
    submitContactForm() {
      const button = document.querySelector('form button[type="submit"]');
      if (!button) return false;
      button.click();
      return true;
    },
    storage() {
      try { return window.localStorage.getItem('tecnoria.consent.v1'); } catch { return 'THREW'; }
    },
    consentCommands() {
      return (window.dataLayer || [])
        .map((entry) => Array.prototype.slice.call(entry))
        .filter((entry) => entry[0] === 'consent');
    },
    configCommands() {
      return (window.dataLayer || [])
        .map((entry) => Array.prototype.slice.call(entry))
        .filter((entry) => entry[0] === 'config');
    },
    leadEvents() {
      return (window.dataLayer || [])
        .map((entry) => Array.prototype.slice.call(entry))
        .filter((entry) => entry[0] === 'event' && entry[1] === 'generate_lead');
    },
    gtagScripts() {
      return [...document.querySelectorAll('script[src]')]
        .filter((s) => s.src.includes('googletagmanager.com')).length;
    },
    analyticsCookies() {
      return document.cookie.split(';').map((c) => c.trim().split('=')[0]).filter((n) => n.startsWith('_ga'));
    },
    bannerRect() {
      const banner = document.querySelector('.consent') || document.querySelector('[role="dialog"]');
      if (!banner) return null;
      const r = banner.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, height: r.height, width: r.width, vh: window.innerHeight, vw: window.innerWidth };
    },
    heroRect() {
      const hero = document.querySelector('h1');
      if (!hero) return null;
      const r = hero.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
    },
  };
  true;
`;

test("consent mode v2 + accessible banner behave correctly in a real browser", async (t) => {
  const chromePath = findChrome();
  if (!chromePath) {
    t.skip("No Chromium binary found (Chrome/Edge); browser consent test skipped.");
    return;
  }

  if (!existsSync(SERVER_ENTRY)) {
    t.diagnostic("SSR build missing; running npm run build:web once");
    const build = spawn("npm", ["run", "build:web"], {
      cwd: REPO_ROOT,
      stdio: "inherit",
      shell: true,
    });
    const exitCode = await new Promise((resolve) => build.on("exit", resolve));
    assert.equal(exitCode, 0, "build:web must succeed before the browser test");
  }

  const ssrPort = await getFreePort();
  const proxyPort = await getFreePort();
  const devtoolsPort = await getFreePort();
  const userDataDir = mkdtempSync(join(tmpdir(), "tecnoria-consent-"));
  const state = { mode: 201, contactRequests: [] };

  const ssr = startSsrServer(ssrPort);
  const proxy = startStubProxy(proxyPort, ssrPort, state);
  await new Promise((resolve) => proxy.listen(proxyPort, "127.0.0.1", resolve));

  const baseUrl = `http://127.0.0.1:${proxyPort}`;
  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-sync",
      "--disable-translate",
      "--hide-scrollbars",
      "--mute-audio",
      `--remote-debugging-port=${devtoolsPort}`,
      `--user-data-dir=${userDataDir}`,
      "--window-size=1280,900",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let cdp;
  let sessionId;
  const googleRequests = [];
  const consoleMessages = [];

  try {
    await waitForHttp(`${baseUrl}/health`, 60000);
    const version = await waitForChromeDevtools(devtoolsPort);
    cdp = startCdp(version.webSocketDebuggerUrl);
    await cdp.opened;

    const target = await cdp.send("Target.createTarget", { url: "about:blank" });
    const attached = await cdp.send("Target.attachToTarget", {
      targetId: target.targetId,
      flatten: true,
    });
    sessionId = attached.sessionId;

    const send = (method, params = {}) => cdp.send(method, params, sessionId);

    cdp.on("Network.requestWillBeSent", (params) => {
      if (GOOGLE_HOST_PATTERN.test(params.request.url)) {
        googleRequests.push(params.request.url);
      }
    });
    cdp.on("Runtime.consoleAPICalled", (params) => {
      const text = (params.args ?? []).map((arg) => arg.value ?? arg.description ?? "").join(" ");
      consoleMessages.push(`${params.type}: ${text}`);
    });
    cdp.on("Runtime.exceptionThrown", (params) => {
      consoleMessages.push(`exception: ${params.exceptionDetails?.text ?? "unknown"}`);
    });

    await send("Page.enable");
    await send("Network.enable");
    await send("Runtime.enable");

    const evaluate = async (expression) => {
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
      return result.result.value;
    };

    const loadPage = async (path) => {
      const loaded = new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`navigation timeout: ${path}`)), 20000);
        const onLoad = () => {
          clearTimeout(timer);
          resolve();
        };
        cdp.on("Page.loadEventFired", onLoad);
      });
      await send("Page.navigate", { url: `${baseUrl}${path}` });
      await loaded;
      await evaluate(JSDOM_HELPERS);
    };

    const waitFor = async (expression, timeoutMs = 8000) => {
      const started = Date.now();
      while (Date.now() - started < timeoutMs) {
        if (await evaluate(expression)) {
          return true;
        }
        await sleep(60);
      }
      throw new Error(`timed out waiting for: ${expression}`);
    };

    const pressKey = async (key, code = key, modifiers = 0) => {
      const keyCodeMap = { Escape: 27, Tab: 9, Enter: 13 };
      await send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key,
        code,
        windowsVirtualKeyCode: keyCodeMap[key] ?? 0,
        nativeVirtualKeyCode: keyCodeMap[key] ?? 0,
        modifiers,
      });
      await send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key,
        code,
        windowsVirtualKeyCode: keyCodeMap[key] ?? 0,
        nativeVirtualKeyCode: keyCodeMap[key] ?? 0,
        modifiers,
      });
      await sleep(80);
    };

    const fillContactForm = () =>
      evaluate(`(() => {
        const set = (selector, value) => {
          const element = document.querySelector(selector);
          if (!element) throw new Error('missing ' + selector);
          const prototype = element instanceof HTMLTextAreaElement
            ? HTMLTextAreaElement.prototype
            : element instanceof HTMLSelectElement
              ? HTMLSelectElement.prototype
              : HTMLInputElement.prototype;
          Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        };
        set('#name', 'Ana Perez');
        set('#email', 'ana.perez@acme-example.com');
        set('#company', 'ACME Robotics SL');
        set('#phone', '+34 600 123 456');
        set('#projectType', 'Software a medida');
        set('#message', 'Necesitamos integrar el CRM con el ERP antes de enero sin romper la operativa diaria.');
        document.querySelector('#privacy').click();
        return true;
      })()`);

    /**
     * Real mouse click through CDP Input events.
     *
     * F-3 test fix: `element.click()` does not move focus, so a focus-losing
     * defect could hide behind it. Dispatching mousePressed/mouseReleased at the
     * element's centre is what a visitor actually does, and Chrome focuses the
     * control as it would for a real pointer.
     */
    const clickReal = async (text, selector = "button, a") => {
      // Scroll first, settle, THEN measure: measuring in the same frame as
      // scrollIntoView gives pre-scroll coordinates, so the click lands on
      // whatever happened to be at that point (this silently broke clicks on
      // elements far down the page, e.g. the footer consent link).
      const found = await evaluate(`(() => {
        const nodes = [...document.querySelectorAll(${JSON.stringify(selector)})];
        const element = nodes.find((node) => (node.textContent || '').trim() === ${JSON.stringify(text)});
        if (!element) return false;
        element.scrollIntoView({ block: 'center', behavior: 'instant' });
        return true;
      })()`);

      if (!found) {
        throw new Error(`no control with text: ${text}`);
      }

      await sleep(250);

      const point = await evaluate(`(() => {
        const nodes = [...document.querySelectorAll(${JSON.stringify(selector)})];
        const element = nodes.find((node) => (node.textContent || '').trim() === ${JSON.stringify(text)});
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      })()`);

      if (!point) {
        throw new Error(`no control with text: ${text}`);
      }

      await send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: point.x,
        y: point.y,
        button: "none",
        clickCount: 0,
      });
      await send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: point.x,
        y: point.y,
        button: "left",
        clickCount: 1,
      });
      await send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: point.x,
        y: point.y,
        button: "left",
        clickCount: 1,
      });
      await sleep(250);
    };

    const activeElementInfo = () =>
      evaluate(`(() => {
        const active = document.activeElement;
        const dialog = document.querySelector('[role="dialog"]');
        if (!active) return null;
        return {
          tag: active.tagName,
          text: (active.textContent || '').trim().slice(0, 40),
          inDialog: !!(dialog && dialog.contains(active)),
          isDialog: active === dialog,
          isBody: active === document.body,
        };
      })()`);

    const waitForGoogleHit = async (pattern, timeoutMs = 15000) => {
      const started = Date.now();
      while (Date.now() - started < timeoutMs) {
        const hit = googleRequests.find((url) => pattern.test(url));
        if (hit) {
          return hit;
        }
        await sleep(150);
      }
      throw new Error(`timed out waiting for a Google hit matching ${pattern}`);
    };

    const acceptConsent = async () => {
      await waitFor("!!window.__test.dialog()");
      await clickReal("Aceptar");
      await sleep(400);
    };

    // ── Scenario 1: fresh profile, zero third-party analytics requests ──────
    await t.test("fresh load contacts no Google host and denies every signal", async () => {
      await loadPage("/");
      await waitFor("!!window.__test.dialog()");
      await sleep(1200);

      assert.deepEqual(googleRequests, [], `unexpected Google requests: ${googleRequests.join(", ")}`);

      const commands = await evaluate("window.__test.consentCommands()");
      const first = commands[0];
      assert.ok(first, "expected a consent default command");
      assert.equal(first[1], "default");
      assert.deepEqual(
        {
          ad_storage: first[2].ad_storage,
          ad_user_data: first[2].ad_user_data,
          ad_personalization: first[2].ad_personalization,
          analytics_storage: first[2].analytics_storage,
        },
        {
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
          analytics_storage: "denied",
        }
      );

      const consentUpdateIdx = commands.findIndex((command) => command[1] === "update");
      assert.equal(consentUpdateIdx, -1, "no consent update before any choice");
      assert.deepEqual(
        await evaluate("window.__test.configCommands()"),
        [],
        "gtag config must not be queued before consent"
      );
      assert.equal(await evaluate("window.__test.storage()"), null);
    });

    // ── Scenario 2: banner semantics, equal prominence, unchecked toggles ───
    await t.test("banner is a labelled dialog with three equal actions", async () => {
      const meta = await evaluate(`(() => {
        const dialog = window.__test.dialog();
        const label = document.getElementById(dialog.getAttribute('aria-labelledby'));
        const desc = document.getElementById(dialog.getAttribute('aria-describedby'));
        return {
          role: dialog.getAttribute('role'),
          modal: dialog.getAttribute('aria-modal'),
          name: label ? label.textContent.trim() : '',
          description: desc ? desc.textContent.trim() : '',
          buttons: window.__test.bannerButtons(),
        };
      })()`);

      assert.equal(meta.role, "dialog");
      assert.equal(meta.modal, "true");
      assert.ok(meta.name.length > 0, "dialog needs an accessible name");
      assert.ok(meta.description.length > 0, "dialog needs a description");

      const labels = meta.buttons.map((button) => button.text);
      for (const expected of ["Aceptar", "Rechazar", "Configurar"]) {
        assert.ok(labels.includes(expected), `missing button: ${expected}`);
      }

      const classes = new Set(
        meta.buttons
          .filter((button) => ["Aceptar", "Rechazar", "Configurar"].includes(button.text))
          .map((button) => button.className)
      );
      assert.equal(classes.size, 1, `actions must share one class: ${[...classes].join(" | ")}`);

      assert.equal(await evaluate("window.__test.clickText('Configurar')"), true);
      await sleep(200);

      const toggles = await evaluate(`(() => {
        const boxes = [...window.__test.dialog().querySelectorAll('input[type="checkbox"]')];
        return {
          count: boxes.length,
          checked: boxes.map((b) => b.checked),
          labels: boxes.map((b) => (b.closest('label')?.textContent || '').trim()),
          text: window.__test.dialog().textContent,
        };
      })()`);
      // F-6: the advertising category was removed; only analytics may appear.
      assert.equal(toggles.count, 1, "only the analytics toggle may render");
      assert.deepEqual(toggles.checked, [false], "the optional category must start unchecked");
      assert.match(toggles.labels[0], /Analítica/i);
      assert.equal(/publicidad/i.test(toggles.text), false, "no advertising category may be offered");
    });

    // ── Scenario 3: Escape closes without granting ──────────────────────────
    await t.test("Escape closes the dialog without consent", async () => {
      await pressKey("Escape");
      await sleep(250);

      assert.equal(await evaluate("!!window.__test.dialog()"), false);
      assert.equal(await evaluate("window.__test.storage()"), null);
      assert.deepEqual(googleRequests, []);
      assert.equal(
        await evaluate(
          "[...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Configuración de cookies')"
        ),
        true,
        "a permanent reopen control must remain reachable"
      );
    });

    // ── Scenario 4: reject persists across routes and reload ────────────────
    await t.test("reject keeps every Google host blocked across routes and reload", async () => {
      await loadPage("/");
      await waitFor("!!window.__test.dialog()");
      assert.equal(await evaluate("window.__test.clickText('Rechazar')"), true);
      await sleep(300);

      const stored = JSON.parse(await evaluate("window.__test.storage()"));
      assert.equal(stored.version, 1);
      assert.equal(stored.analytics, false);
      assert.equal(stored.marketing, false);
      assert.equal(typeof stored.ts, "string");

      googleRequests.length = 0;
      for (const route of ["/servicios", "/contacto", "/blog"]) {
        await loadPage(route);
        await sleep(700);
        assert.equal(await evaluate("!!window.__test.dialog()"), false, `banner must stay closed on ${route}`);
      }
      await loadPage("/");
      await sleep(900);

      assert.deepEqual(googleRequests, [], `Google requests after reject: ${googleRequests.join(", ")}`);
      const afterReload = JSON.parse(await evaluate("window.__test.storage()"));
      assert.equal(afterReload.analytics, false);
    });

    // ── Scenario 4b: a corrupt stored record falls back to undecided ────────
    await t.test("corrupt stored record shows the banner instead of throwing", async () => {
      const exceptionsBefore = consoleMessages.filter((message) =>
        message.startsWith("exception:")
      ).length;

      await evaluate(
        "window.localStorage.setItem('tecnoria.consent.v1', '{not-json' )"
      );
      await loadPage("/");
      await waitFor("!!window.__test.dialog()");
      assert.equal(
        await evaluate("window.__test.storage()"),
        "{not-json",
        "a corrupt record must not be rewritten on read"
      );
      assert.deepEqual(googleRequests, [], "a corrupt record must not load analytics");

      const exceptionsAfter = consoleMessages.filter((message) =>
        message.startsWith("exception:")
      ).length;
      assert.equal(exceptionsAfter, exceptionsBefore, "a corrupt record must not throw");
    });

    // ── Scenario 5: accept grants analytics only and loads gtag once ────────
    await t.test("accept grants analytics only and loads gtag/js once", async () => {
      await evaluate("window.localStorage.clear()");
      await loadPage("/");
      googleRequests.length = 0;
      await acceptConsent();

      const stored = JSON.parse(await evaluate("window.__test.storage()"));
      assert.equal(stored.analytics, true);
      assert.equal(stored.marketing, false);

      const commands = await evaluate("window.__test.consentCommands()");
      const update = commands.find((command) => command[1] === "update");
      assert.ok(update, "a consent update must follow the choice");
      assert.equal(update[2].analytics_storage, "granted");
      assert.equal(update[2].ad_storage, "denied");
      assert.equal(update[2].ad_user_data, "denied");
      assert.equal(update[2].ad_personalization, "denied");

      assert.equal(await evaluate("window.__test.gtagScripts()"), 1);
      const configCommands = await evaluate("window.__test.configCommands()");
      assert.equal(configCommands.length, 1, "exactly one gtag config after consent");
      assert.equal(configCommands[0][1], "G-LE6ETPWL23");
      await sleep(800);
      const gtagRequests = googleRequests.filter((url) => url.includes("googletagmanager.com"));
      assert.equal(gtagRequests.length, 1, `gtag/js must be requested once: ${gtagRequests.join(", ")}`);

      // A second accept cannot happen, and the loader stays idempotent.
      await evaluate("window.__tecnoriaLoadAnalytics()");
      assert.equal(await evaluate("window.__test.gtagScripts()"), 1);
      await sleep(300);
      assert.equal(
        googleRequests.filter((url) => url.includes("googletagmanager.com")).length,
        1
      );
    });

    // ── Scenario 6: withdrawal purges analytics cookies and stops tracking ──
    await t.test("withdrawal removes the record, purges cookies and stops requests", async () => {
      // Seed the two GA4 cookies so the purge is proved, not assumed.
      await evaluate(`(() => {
        document.cookie = '_ga=stub-value; path=/';
        document.cookie = '_ga_LE6ETPWL23=stub-value; path=/';
        return window.__test.analyticsCookies().length;
      })()`);
      const seeded = await evaluate("window.__test.analyticsCookies()");
      assert.equal(seeded.length, 2, `expected seeded analytics cookies, got ${seeded.join(", ")}`);

      assert.equal(await evaluate("window.__test.clickText('Configuración de cookies')"), true);
      await waitFor("!!window.__test.dialog()");
      await sleep(200);

      const labels = (await evaluate("window.__test.bannerButtons()")).map((b) => b.text);
      assert.ok(labels.includes("Retirar consentimiento"), "withdrawal must be offered");

      assert.equal(await evaluate("window.__test.clickText('Retirar consentimiento')"), true);
      await sleep(400);

      assert.equal(await evaluate("window.__test.storage()"), null);
      const cookies = await evaluate("window.__test.analyticsCookies()");
      assert.deepEqual(cookies, [], `analytics cookies must be deleted: ${cookies.join(", ")}`);

      const commands = await evaluate("window.__test.consentCommands()");
      const last = commands[commands.length - 1];
      assert.equal(last[1], "update");
      assert.equal(last[2].analytics_storage, "denied");
      assert.equal(last[2].ad_storage, "denied");

      googleRequests.length = 0;
      await loadPage("/contacto");
      await sleep(1200);
      assert.deepEqual(googleRequests, [], `Google requests after withdrawal: ${googleRequests.join(", ")}`);
    });

    // ── Scenario 7: generate_lead only after a confirmed 201 ───────────────
    await t.test("generate_lead fires once and only after a confirmed lead", async () => {
      await evaluate("window.localStorage.clear()");
      await loadPage("/");
      await acceptConsent();

      // HTTP error: request happens, no event.
      await loadPage("/contacto");
      state.mode = 500;
      state.contactRequests.length = 0;
      await fillContactForm();
      assert.equal(await evaluate("window.__test.submitContactForm()"), true);
      await waitFor("!!document.querySelector('.alert-error')");
      assert.equal(state.contactRequests.length, 1);
      assert.deepEqual(await evaluate("window.__test.leadEvents()"), []);

      // Success: exactly one request, one event, allowed parameters only.
      await loadPage("/contacto");
      state.mode = 201;
      state.contactRequests.length = 0;
      await fillContactForm();
      assert.equal(await evaluate("window.__test.submitContactForm()"), true);
      await waitFor("!!document.querySelector('#success-message')");

      assert.equal(state.contactRequests.length, 1);
      const events = await evaluate("window.__test.leadEvents()");
      assert.equal(events.length, 1);
      const params = events[0][2];
      assert.deepEqual(Object.keys(params).sort(), ["form_type", "service_category", "source_page"]);
      assert.equal(params.form_type, "contact");
      assert.equal(params.service_category, "software-a-medida");
      assert.equal(params.source_page, "/contacto");

      const serialized = JSON.stringify(events);
      for (const secret of ["Ana Perez", "ana.perez", "+34 600", "ACME", "integrar el CRM"]) {
        assert.equal(serialized.includes(secret), false, `${secret} leaked into generate_lead`);
      }

      // Rapid double submit: one request and one event for the confirmed lead.
      await loadPage("/contacto");
      state.contactRequests.length = 0;
      await fillContactForm();
      await evaluate(`(() => {
        const button = [...document.querySelectorAll('button[type="submit"]')][0];
        button.click();
        button.click();
        return true;
      })()`);
      await waitFor("!!document.querySelector('#success-message')");
      await sleep(400);

      assert.equal(state.contactRequests.length, 1, "double click must send one request");
      assert.equal(
        (await evaluate("window.__test.leadEvents()")).length,
        1,
        "exactly one generate_lead for the single confirmed lead"
      );
    });

    // ── Scenario 8: success without analytics consent sends no event ───────
    await t.test("success without analytics consent sends no generate_lead", async () => {
      await evaluate("window.localStorage.clear()");
      await loadPage("/contacto");
      await waitFor("!!window.__test.dialog()");
      await clickReal("Rechazar");
      await sleep(250);

      state.mode = 201;
      state.contactRequests.length = 0;
      await fillContactForm();
      assert.equal(await evaluate("window.__test.submitContactForm()"), true);
      await waitFor("!!document.querySelector('#success-message')");

      assert.equal(state.contactRequests.length, 1);
      assert.deepEqual(await evaluate("window.__test.leadEvents()"), []);
    });

    // ── Scenario 9: keyboard path, focus trap and visible focus ring ───────
    await t.test("dialog traps focus, Escape does not grant, keyboard is usable", async () => {
      await evaluate("window.localStorage.clear()");
      await loadPage("/");
      await waitFor("!!window.__test.dialog()");
      await sleep(250);

      assert.equal(
        await evaluate(
          "!!document.activeElement && !!document.activeElement.closest('[role=\"dialog\"]')"
        ),
        true,
        "focus must move into the dialog on open"
      );

      for (let step = 0; step < 8; step += 1) {
        await pressKey("Tab");
        assert.equal(
          await evaluate(
            "!!document.activeElement && !!document.activeElement.closest('[role=\"dialog\"]')"
          ),
          true,
          `focus escaped the dialog after ${step + 1} Tab presses`
        );
      }

      const focusRing = await evaluate(`(() => {
        const style = getComputedStyle(document.activeElement);
        return {
          outlineStyle: style.outlineStyle,
          outlineWidth: parseFloat(style.outlineWidth || '0'),
          boxShadow: style.boxShadow,
          tag: document.activeElement.tagName,
        };
      })()`);
      assert.ok(
        (focusRing.outlineStyle !== "none" && focusRing.outlineWidth > 0) ||
          (focusRing.boxShadow && focusRing.boxShadow !== "none"),
        `focused control needs a visible ring: ${JSON.stringify(focusRing)}`
      );

      await pressKey("Escape");
      await sleep(200);
      assert.equal(await evaluate("!!window.__test.dialog()"), false);
      assert.equal(await evaluate("window.__test.storage()"), null);
    });

    // ── Scenario 10: no layout shift / hero overlap at mobile viewports ────
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 360, height: 640 },
    ]) {
      await t.test(`banner stays compact at ${viewport.width}x${viewport.height}`, async () => {
        await send("Emulation.setDeviceMetricsOverride", {
          width: viewport.width,
          height: viewport.height,
          deviceScaleFactor: 1,
          mobile: true,
        });
        await evaluate("window.localStorage.clear()");
        await loadPage("/");
        await waitFor("!!window.__test.dialog()");
        await sleep(200);

        const rect = await evaluate("window.__test.bannerRect()");
        const hero = await evaluate("window.__test.heroRect()");

        assert.ok(rect, "banner must be measurable");
        assert.ok(
          rect.height <= viewport.height * 0.35,
          `banner too tall: ${rect.height}px of ${viewport.height}px`
        );

        if (hero) {
          const overlaps = rect.top < hero.bottom && rect.bottom > hero.top;
          assert.equal(overlaps, false, "banner must not cover the hero heading");
        }

        const dialog = await evaluate(`(() => {
          const d = window.__test.dialog();
          return { role: d.getAttribute('role'), name: document.getElementById(d.getAttribute('aria-labelledby')).textContent.trim() };
        })()`);
        assert.equal(dialog.role, "dialog");
        assert.ok(dialog.name.length > 0);
      });
    }

    // ── R3 repairs: findings F-1, F-2, F-3, F-4, F-6, F-7 + regression guards ──

    await t.test("F-4/F-6: the dialog discloses Talkaris, links the policy and has no advertising control", async () => {
      await evaluate("window.localStorage.clear()");
      await loadPage("/");
      await waitFor("!!window.__test.dialog()");

      const info = await evaluate(`(() => {
        const dialog = window.__test.dialog();
        const text = dialog.textContent.replace(/\\s+/g, ' ').trim();
        const links = [...dialog.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
        return {
          text,
          links,
          checkboxes: [...dialog.querySelectorAll('input[type="checkbox"]')].length,
          mentionsTalkaris: /talkaris\\.com/i.test(text),
          mentionsAdvertising: /publicidad/i.test(text),
        };
      })()`);

      assert.equal(info.mentionsTalkaris, true, "the dialog must disclose the Talkaris widget");
      assert.ok(
        info.links.includes("/politica-de-cookies"),
        `the dialog needs a real link to the policy: ${JSON.stringify(info.links)}`
      );
      assert.equal(info.mentionsAdvertising, false, "no advertising category may remain in the dialog");
      assert.equal(info.checkboxes, 0, "no optional category is shown until Configurar");
    });

    await t.test("F-7: Configurar initialises the control from the stored decision", async () => {
      await evaluate("window.localStorage.clear()");
      await loadPage("/");
      await waitFor("!!window.__test.dialog()");
      await acceptConsent();

      await waitFor("!!window.__test.storage()");
      await clickReal("Configuración de cookies", "button.consent-reopen");
      await waitFor("!!window.__test.dialog()");
      await clickReal("Configurar");
      await sleep(250);

      const toggle = await evaluate(`(() => {
        const box = window.__test.dialog().querySelector('input[type="checkbox"]');
        return box ? box.checked : null;
      })()`);
      assert.equal(toggle, true, "with analytics granted the control must open checked");

      await pressKey("Escape");
      await sleep(200);
    });

    await t.test("F-3: focus survives Configurar, Escape works, Tab cannot escape and focus returns", async () => {
      await evaluate("window.localStorage.clear()");
      await loadPage("/");
      await waitFor("!!window.__test.dialog()");
      await sleep(200);

      // Real click on Configurar destroys the button; focus must land inside.
      await clickReal("Configurar");
      await sleep(300);
      const afterConfig = await activeElementInfo();
      assert.equal(afterConfig.inDialog, true, `focus left the dialog: ${JSON.stringify(afterConfig)}`);

      for (let step = 0; step < 6; step += 1) {
        await pressKey("Tab");
        const current = await activeElementInfo();
        assert.equal(current.inDialog, true, `Tab escaped the dialog at step ${step + 1}`);
      }

      // Force focus out of the dialog, then Tab must pull it back in.
      await evaluate("document.body.focus(); document.activeElement.blur(); true");
      await pressKey("Tab");
      const pulledBack = await activeElementInfo();
      assert.equal(pulledBack.inDialog, true, "Tab from body must be pulled back into the dialog");

      // Escape from anywhere while open closes without granting.
      await pressKey("Escape");
      await sleep(250);
      assert.equal(await evaluate("!!window.__test.dialog()"), false, "Escape must close the dialog");
      assert.equal(await evaluate("window.__test.storage()"), null, "Escape must not grant anything");

      // Focus returns to a real control, not to body.
      const afterClose = await activeElementInfo();
      assert.equal(afterClose.isBody, false, "focus must be restored after closing");
      assert.equal(
        await evaluate("document.activeElement.classList.contains('consent-reopen')"),
        true,
        "focus should return to the persistent consent control"
      );
    });

    await t.test("F-1: rejecting after accepting purges the measurement cookies", async () => {
      await evaluate("window.localStorage.clear()");
      await loadPage("/");
      await waitFor("!!window.__test.dialog()");
      await acceptConsent();
      await waitForGoogleHit(/googletagmanager\.com\/gtag\/js/);
      await sleep(1500);

      const before = await evaluate("window.__test.analyticsCookies()");
      assert.ok(before.length > 0, `expected _ga cookies after accepting, got ${JSON.stringify(before)}`);

      await clickReal("Configuración de cookies", "button.consent-reopen");
      await waitFor("!!window.__test.dialog()");
      await clickReal("Retirar consentimiento");
      await sleep(400);

      let after = await evaluate("window.__test.analyticsCookies()");
      assert.deepEqual(after, [], `cookies survived the withdrawal: ${JSON.stringify(after)}`);

      // Accept again, then REJECT (not explicit withdrawal) — the F-1 path that
      // used to leave _ga in place.
      await evaluate("window.localStorage.clear()");
      await loadPage("/");
      await waitFor("!!window.__test.dialog()");
      await acceptConsent();
      await sleep(1500);
      assert.ok((await evaluate("window.__test.analyticsCookies()")).length > 0);

      await clickReal("Configuración de cookies", "button.consent-reopen");
      await waitFor("!!window.__test.dialog()");
      await clickReal("Rechazar");
      await sleep(500);

      after = await evaluate("window.__test.analyticsCookies()");
      assert.deepEqual(after, [], `F-1: rejecting after accepting left cookies: ${JSON.stringify(after)}`);
      let record = JSON.parse(await evaluate("window.__test.storage()"));
      assert.equal(record.analytics, false);

      // And the "Configure → save without analytics" path must purge too.
      await evaluate("window.localStorage.clear()");
      await loadPage("/");
      await waitFor("!!window.__test.dialog()");
      await acceptConsent();
      await sleep(1500);
      assert.ok((await evaluate("window.__test.analyticsCookies()")).length > 0);

      await clickReal("Configuración de cookies", "button.consent-reopen");
      await waitFor("!!window.__test.dialog()");
      await clickReal("Configurar");
      await sleep(250);

      // F-7 means the panel opens showing the current grant, so withdrawing via
      // "save" requires the visitor to uncheck the box first.
      const openedChecked = await evaluate(
        "window.__test.dialog().querySelector('input[type=\"checkbox\"]').checked"
      );
      assert.equal(openedChecked, true, "F-7: the panel must reflect the stored grant");
      await clickReal("Analítica (Google Analytics)", "label");
      await sleep(150);
      await clickReal("Guardar selección");
      await sleep(500);

      after = await evaluate("window.__test.analyticsCookies()");
      assert.deepEqual(after, [], `F-1: saving a selection without analytics left cookies: ${JSON.stringify(after)}`);
      record = JSON.parse(await evaluate("window.__test.storage()"));
      assert.equal(record.analytics, false);
      assert.equal(record.marketing, false);
      assert.equal(record.marketing, false);
    });

    await t.test("F-2: generate_lead reaches google-analytics.com /g/collect with the event name", async () => {
      await evaluate("window.localStorage.clear()");
      await loadPage("/contacto");
      await waitFor("!!window.__test.dialog()");
      await acceptConsent();

      // Prove the runtime is really speaking to GA before the lead.
      const pageViewHit = await waitForGoogleHit(/google-analytics\.com\/g\/collect/);
      t.diagnostic(`baseline collect: ${pageViewHit.slice(0, 120)}`);

      googleRequests.length = 0;
      state.mode = 201;
      state.contactRequests.length = 0;
      await fillContactForm();
      await evaluate("window.__test.submitContactForm()");
      await waitFor("!!document.querySelector('#success-message')");

      const hit = await waitForGoogleHit(/en=generate_lead/, 20000);
      t.diagnostic(`generate_lead collect: ${hit}`);

      assert.match(hit, /google-analytics\.com\/g\/collect/);
      assert.match(hit, /en=generate_lead/);
      assert.match(hit, /ep\.source_page=%2Fcontacto|ep\.source_page=\/contacto/);

      const decoded = decodeURIComponent(hit);
      for (const secret of ["Ana Perez", "ana.perez", "+34 600", "ACME", "integrar el CRM"]) {
        assert.equal(decoded.includes(secret), false, `${secret} leaked into the collect request`);
      }
    });

    await t.test("custom selection grants analytics and never the advertising signals", async () => {
      await evaluate("window.localStorage.clear()");
      await loadPage("/");
      await waitFor("!!window.__test.dialog()");
      await clickReal("Configurar");
      await sleep(200);

      await evaluate(`(() => {
        const box = window.__test.dialog().querySelector('input[type="checkbox"]');
        box.click();
        return box.checked;
      })()`);
      await clickReal("Guardar selección");
      await sleep(500);

      const record = JSON.parse(await evaluate("window.__test.storage()"));
      assert.equal(record.analytics, true);
      assert.equal(record.marketing, false);

      const updates = (await evaluate("window.__test.consentCommands()")).filter((c) => c[1] === "update");
      const last = updates[updates.length - 1];
      assert.equal(last[2].analytics_storage, "granted");
      for (const signal of ["ad_storage", "ad_user_data", "ad_personalization"]) {
        assert.equal(last[2][signal], "denied", `${signal} must never be granted`);
      }
    });

    await t.test("regression: expired and future-dated records load no Google and show the dialog", async () => {
      for (const [label, ts] of [
        ["expired", "2020-01-01T00:00:00.000Z"],
        ["future", "2030-01-01T00:00:00.000Z"],
      ]) {
        await loadPage("/");
        await evaluate(
          `window.localStorage.setItem('tecnoria.consent.v1', ${JSON.stringify(
            JSON.stringify({ version: 1, analytics: true, marketing: false, ts })
          )})`
        );
        googleRequests.length = 0;
        await loadPage("/");
        await waitFor("!!window.__test.dialog()");
        await sleep(1200);

        assert.deepEqual(googleRequests, [], `${label} record must not contact Google: ${googleRequests[0] ?? ""}`);
        assert.equal(await evaluate("!!window.__test.dialog()"), true, `${label} record must ask again`);
      }
    });

    await t.test("regression: a corrupt record does not throw and shows the dialog", async () => {
      await loadPage("/");
      await evaluate("window.localStorage.setItem('tecnoria.consent.v1', '{\"version\":1,\"analytics\":true')");
      googleRequests.length = 0;
      await loadPage("/");
      await waitFor("!!window.__test.dialog()");
      await sleep(800);

      assert.equal(await evaluate("!!window.__test.dialog()"), true);
      assert.deepEqual(googleRequests, []);
      const fatal = consoleMessages.filter((message) => /^exception:/.test(message));
      assert.deepEqual(fatal, [], `corrupt record threw: ${fatal.join(" | ")}`);
    });

    await t.test("regression: a returning visitor with a valid grant sees no dialog and loads gtag once", async () => {
      await evaluate("window.localStorage.clear()");
      await loadPage("/");
      await waitFor("!!window.__test.dialog()");
      await acceptConsent();
      await sleep(600);

      googleRequests.length = 0;
      await loadPage("/");
      await sleep(1500);

      assert.equal(await evaluate("!!window.__test.dialog()"), false, "no dialog for a stored grant");
      const gtagHits = googleRequests.filter((url) => /googletagmanager\.com\/gtag\/js/.test(url));
      assert.equal(gtagHits.length, 1, `exactly one gtag/js expected, got ${gtagHits.length}`);
    });

    await t.test("G-2: after the FOOTER link is used once, every decision leaves the dialog closed", async () => {
      const footerLink = "button.footer-consent-link";
      const decisionCloses = async (label, act) => {
        await act();
        await sleep(600);
        const open = await evaluate("!!window.__test.dialog()");
        assert.equal(open, false, `G-2: the dialog re-opened after ${label}`);
      };

      // The regression only appears once the FOOTER path has been used: that is
      // what makes the open-request effect re-run. The .consent-reopen path calls
      // openPreferences() directly, which is exactly why the suite missed this.
      await evaluate("window.localStorage.clear()");
      await loadPage("/");
      await waitFor("!!window.__test.dialog()");

      // 1) Open from the footer, then Accept.
      await clickReal("Configuración de cookies", footerLink);
      await waitFor("!!window.__test.dialog()");
      await decisionCloses("Aceptar (opened from the footer)", () => clickReal("Aceptar", "[role=dialog] *"));

      // 2) Open from the footer again, then Reject.
      await clickReal("Configuración de cookies", footerLink);
      await waitFor("!!window.__test.dialog()");
      await decisionCloses("Rechazar (opened from the footer)", () => clickReal("Rechazar", "[role=dialog] *"));

      // 3) Open from the footer, configure, and save.
      await clickReal("Configuración de cookies", footerLink);
      await waitFor("!!window.__test.dialog()");
      await clickReal("Configurar", "[role=dialog] *");
      await sleep(200);
      await decisionCloses("Guardar selección (opened from the footer)", () =>
        clickReal("Guardar selección", "[role=dialog] *")
      );

      // 4) And withdrawal, which shares the same close path.
      await clickReal("Configuración de cookies", footerLink);
      await waitFor("!!window.__test.dialog()");
      await decisionCloses("Retirar consentimiento (opened from the footer)", () =>
        clickReal("Retirar consentimiento", "[role=dialog] *")
      );
    });

    await t.test("no hydration errors were reported", async () => {
      const hydration = consoleMessages.filter((message) => /NG0\d\d\d/.test(message));
      assert.deepEqual(hydration, [], `hydration errors: ${hydration.join(" | ")}`);
    });
  } finally {
    cdp?.close();
    try {
      proxy.close();
    } catch {
      // ignore
    }
    try {
      proxy.closeAllConnections?.();
    } catch {
      // ignore
    }
    ssr.kill();
    try {
      spawn("taskkill", ["/pid", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
    } catch {
      chrome.kill();
    }
    await sleep(300);
    try {
      rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
});
