import { ngExpressEngine } from "@nguniversal/express-engine";
import * as express from "express";
import { join } from "path";
import { existsSync } from "fs";
import { APP_BASE_HREF } from "@angular/common";
import { AppServerModule } from "./src/main.server";

export function app() {
  const server = express();

  // Preferente: dist/browser. Fallback: dist/ por si empaquetas distinto.
  let distFolder = join(process.cwd(), "dist", "browser");
  if (!existsSync(distFolder)) distFolder = join(process.cwd(), "dist");

  const indexHtml = "index.html";

  server.engine("html", ngExpressEngine({ bootstrap: AppServerModule }) as any);
  server.set("view engine", "html");
  server.set("views", distFolder);

  server.get("*.*", express.static(distFolder, { maxAge: "1y" }));

  server.get("*", (req, res) => {
    res.render(indexHtml, {
      req,
      providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
    });
  });

  return server;
}

// Solo arranca en local si ejecutas el bundle directamente:
function run() {
  const port = process.env.PORT || 4000;
  const server = app();
  server.listen(port, () =>
    console.log(`SSR listening on http://localhost:${port}`)
  );
}

declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || "";
if (moduleFilename === __filename || moduleFilename.includes("iisnode")) {
  run();
}

export * from "./src/main.server";
