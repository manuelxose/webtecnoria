// Lightweight runner to start the Angular Universal server with proper shims.
// Loads Zone and a DOM shim before requiring the built server bundle.
try {
  require('zone.js/dist/zone-node');
} catch (err) {
  console.error('Failed to load zone-node, make sure zone.js is installed:', err && err.message);
}

try {
  require('./server-dom-shim.js');
} catch (err) {
  console.error('Failed to apply server DOM shim:', err && err.message);
}

const path = require('path');
const port = process.env.PORT || 4000;
const serverBundle = path.join(process.cwd(), 'dist', 'landrick-angular', 'server', 'main.js');

try {
  const srv = require(serverBundle);
  // The bundle exports an `app` function. Use it to create and start the server.
  if (srv && typeof srv.app === 'function') {
    const server = srv.app();
    server.listen(port, () => {
      console.log(`Node Express server listening on http://localhost:${port}`);
    });
  } else if (typeof srv === 'function') {
    // fallback: bundle might export the app directly
    const server = srv();
    server.listen(port, () => {
      console.log(`Node Express server listening on http://localhost:${port}`);
    });
  } else {
    console.error('Server bundle did not export an app() function. Exports keys:', Object.keys(srv || {}));
    process.exit(1);
  }
} catch (err) {
  console.error('Failed to require server bundle:', err && err.stack || err);
  process.exit(1);
}
