// Lazy shim loader — reuses the existing server-dom-shim.js
try {
  require("./server-dom-shim.js");
} catch (e) {
  // If the shim isn't available, let Node continue; the app may still run.
  // We log to stderr so it's obvious in server startup logs.
  console.error(
    "server-dom-shim-lazy: failed to load server-dom-shim.js",
    e && e.message
  );
}
