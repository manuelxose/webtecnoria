// DOM shim and Zone.js are loaded via --require flags before this file runs
// So we can directly require Angular dependencies

const { ngExpressEngine } = require("@nguniversal/express-engine");
const express = require("express");
const { join } = require("path");
const { AppServerModule } = require("./src/main.server");
const { APP_BASE_HREF } = require("@angular/common");
const { existsSync } = require("fs");

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();

  // Try browser folder first (local development), fallback to parent folder (Cloud Functions)
  let distFolder = join(process.cwd(), "dist/landrick-angular/browser");
  if (!existsSync(distFolder)) {
    distFolder = join(process.cwd(), "dist/landrick-angular");
  }

  // Always use index.html - works for both local and Cloud Functions
  const indexHtml = "index.html";

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine(
    "html",
    ngExpressEngine({
      bootstrap: AppServerModule,
    })
  );

  server.set("view engine", "html");
  server.set("views", distFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get(
    "*.*",
    express.static(distFolder, {
      maxAge: "1y",
    })
  );

  // All regular routes use the Universal engine
  server.get("*", (req, res) => {
    res.render(indexHtml, {
      req,
      providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
    });
  });

  return server;
}

function run() {
  const port = process.env.PORT || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || "";
if (moduleFilename === __filename || moduleFilename.includes("iisnode")) {
  run();
}

export * from "./src/main.server";
