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
  console.log("🔍 Checking distFolder:", distFolder);

  if (!existsSync(distFolder)) {
    console.log("⚠️  dist/browser not found, using fallback");
    distFolder = join(process.cwd(), "dist");
  }

  console.log("✅ Using distFolder:", distFolder);
  console.log("📁 distFolder exists:", existsSync(distFolder));

  const indexHtml = "index.html";
  const indexPath = join(distFolder, indexHtml);
  console.log("📄 Index HTML path:", indexPath);
  console.log("📄 Index HTML exists:", existsSync(indexPath));

  server.engine("html", ngExpressEngine({ bootstrap: AppServerModule }) as any);
  server.set("view engine", "html");
  server.set("views", distFolder);

  console.log("🚀 Express engine configured");
  console.log("🚀 View engine set to: html");
  console.log("🚀 Views directory:", distFolder);

  // Log static file requests
  server.use((req, res, next) => {
    if (
      req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)
    ) {
      console.log("📦 Static file request:", req.method, req.url);
    }
    next();
  });

  server.get("*.*", express.static(distFolder, { maxAge: "1y" }));

  server.get("*", (req, res) => {
    console.log("\n🌐 ========== NEW REQUEST ==========");
    console.log("📍 URL:", req.url);
    console.log("📍 Method:", req.method);
    console.log("📍 Headers:", JSON.stringify(req.headers, null, 2));
    console.log("🎬 Starting SSR render...");

    const startTime = Date.now();
    let renderCompleted = false;

    // Add a timeout to prevent infinite hanging
    const timeout = setTimeout(() => {
      if (!renderCompleted) {
        console.error(
          "⏱️ TIMEOUT: SSR render did not complete within 30 seconds"
        );
        console.error(
          "⏱️ This suggests an infinite subscription or async operation that never resolves"
        );
        if (!res.headersSent) {
          res.status(500).send("SSR Timeout: Rendering took too long");
        }
      }
    }, 30000); // 30 second timeout

    res.render(
      indexHtml,
      {
        req,
        providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
      },
      (err, html) => {
        renderCompleted = true;
        clearTimeout(timeout);
        const renderTime = Date.now() - startTime;

        if (err) {
          console.error("❌ SSR Error after", renderTime, "ms");
          console.error("❌ Error details:", err);
          console.error("❌ Error stack:", err.stack);
          if (!res.headersSent) {
            res.status(500).send("Error rendering page: " + err.message);
          }
          return;
        }

        console.log("✅ SSR rendered successfully in", renderTime, "ms");
        console.log("📏 HTML length:", html ? html.length : 0, "characters");
        console.log(
          "🔍 HTML preview (first 500 chars):",
          html ? html.substring(0, 500) : "EMPTY"
        );
        console.log(
          "🔍 Contains <app-root>:",
          html ? html.includes("<app-root") : false
        );
        console.log(
          "🔍 Contains <script>:",
          html ? html.includes("<script") : false
        );
        console.log("🌐 ========== REQUEST COMPLETE ==========\n");

        if (!res.headersSent) {
          res.send(html);
        }
      }
    );
  });

  return server;
}

// Solo arranca en local si ejecutas el bundle directamente:
function run() {
  const port = process.env.PORT || 4000;

  // Add global error handlers to catch silent failures
  process.on("unhandledRejection", (reason, promise) => {
    console.error("🚨 Unhandled Rejection at:", promise);
    console.error("🚨 Reason:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("🚨 Uncaught Exception:", error);
    console.error("🚨 Stack:", error.stack);
  });

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
