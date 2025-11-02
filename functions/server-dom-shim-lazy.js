let initialized = false;
module.exports = function initializeDOMShim(indexHtmlPath) {
  if (initialized) return;
  initialized = true;

  try {
    require("zone.js/node");
  } catch {
    try { require("zone.js/dist/zone-node"); } catch {}
  }

  const fs = require("fs");
  const domino = (() => { try { return require("domino"); } catch { return null; } })();

  if (domino && indexHtmlPath && fs.existsSync(indexHtmlPath)) {
    const tpl = fs.readFileSync(indexHtmlPath, "utf8");
    const win = domino.createWindow(tpl);
    global.window = win;
    global.document = win.document;
    global.navigator = win.navigator;
    global.Event = win.Event;
    global.Element = win.Element;
    global.HTMLElement = win.HTMLElement;
    global.Node = win.Node;
    global.HTMLDocument = win.HTMLDocument;
    global.DocumentFragment = win.DocumentFragment;
    if (!global.window.location) global.window.location = { hostname: "localhost", href: "http://localhost" };
    if (!global.document.location) global.document.location = global.window.location;
    return;
  }

  // Fallback minimal mocks
  global.window = { navigator: { userAgent: "node" }, location: { hostname: "localhost", href: "http://localhost" } };
  global.document = { body: {}, head: {}, location: global.window.location };
  global.navigator = global.window.navigator;
};
