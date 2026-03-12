import { CommonEngine } from "@angular/ssr/node";
import express from "express";
import http from "node:http";
import https from "node:https";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import bootstrap from "./src/main.server";

type SessionUser = {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer" | "client";
  displayName?: string | null;
  clientId?: string | null;
};

let lastSessionApiWarningAt = 0;

function getApiInternalUrl(): URL {
  return new URL(process.env["API_INTERNAL_URL"] || "http://127.0.0.1:3001");
}

function getPublicRuntimeConfig() {
  return {
    googleClientId: process.env["GOOGLE_CLIENT_ID"] || "",
  };
}

function proxyToApi(targetBase: URL): express.RequestHandler {
  return (req, res) => {
    const targetUrl = new URL(req.originalUrl, targetBase);
    const transport = targetUrl.protocol === "https:" ? https : http;

    const upstream = transport.request(
      targetUrl,
      {
        method: req.method,
        headers: {
          ...req.headers,
          host: targetUrl.host,
          "x-forwarded-host": req.headers.host ?? "",
          "x-forwarded-proto": req.protocol,
        },
      },
      (upstreamResponse) => {
        res.status(upstreamResponse.statusCode || 502);

        Object.entries(upstreamResponse.headers).forEach(([key, value]) => {
          if (value !== undefined) {
            res.setHeader(key, value as string | string[]);
          }
        });

        upstreamResponse.pipe(res);
      }
    );

    upstream.on("error", (error) => {
      if (isConnectionRefused(error)) {
        console.warn(
          `[web:ssr] API proxy unavailable for ${req.originalUrl} -> ${targetBase.origin}`
        );
      } else {
        console.error("API proxy error:", error);
      }

      if (!res.headersSent) {
        res
          .status(503)
          .json({
            code: "API_UNAVAILABLE",
            message: "La API no esta disponible en este momento.",
          });
      }
    });

    req.pipe(upstream);
  };
}

function isConnectionRefused(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error && typeof error.code === "string" ? error.code : "";
  if (code === "ECONNREFUSED") {
    return true;
  }

  const cause = "cause" in error ? error.cause : null;
  if (cause && typeof cause === "object") {
    const causeCode =
      "code" in cause && typeof cause.code === "string" ? cause.code : "";
    if (causeCode === "ECONNREFUSED") {
      return true;
    }

    const nestedErrors =
      "errors" in cause && Array.isArray(cause.errors) ? cause.errors : [];
    return nestedErrors.some((nested) => {
      if (!nested || typeof nested !== "object" || !("code" in nested)) {
        return false;
      }

      return nested.code === "ECONNREFUSED";
    });
  }

  return false;
}

function logSessionValidationFailure(error: unknown, targetBase: URL): void {
  if (!isConnectionRefused(error)) {
    console.error("Session validation failed:", error);
    return;
  }

  const now = Date.now();
  if (now - lastSessionApiWarningAt < 15000) {
    return;
  }

  lastSessionApiWarningAt = now;
  console.warn(
    `[web:ssr] Session validation skipped because API is not reachable at ${targetBase.origin}`
  );
}

async function fetchSessionUser(
  cookieHeader: string,
  targetBase: URL
): Promise<SessionUser | null> {
  try {
    const response = await fetch(new URL("/api/v1/auth/me", targetBase), {
      headers: {
        cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SessionUser;
  } catch (error) {
    logSessionValidationFailure(error, targetBase);
    return null;
  }
}

function isDashboardPath(path: string): boolean {
  return path === "/dashboard" || path.startsWith("/dashboard/");
}

function isPortalRootPath(path: string): boolean {
  return path === "/portal";
}

function isPortalProtectedPath(path: string): boolean {
  return path.startsWith("/portal/");
}

function getPrivateHome(user: SessionUser): string {
  if (user.role === "client") {
    return "/portal/dashboard";
  }

  if (user.role === "admin" || user.role === "editor") {
    return "/dashboard";
  }

  return "/acceso-restringido";
}

export function app(): express.Express {
  const server = express();
  server.set("trust proxy", 1);
  const commonEngine = new CommonEngine();
  const port = process.env["PORT"] || 4000;
  const apiTarget = getApiInternalUrl();
  const authPages = new Set(["/auth-login", "/auth-signup", "/auth-re-password"]);

  const serverDistPath = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistPath, "../browser");
  const indexHtml = join(serverDistPath, "index.server.html");

  server.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "tecnoria-web",
      timestamp: new Date().toISOString(),
    });
  });

  server.use("/api", proxyToApi(apiTarget));
  server.use("/uploads", proxyToApi(apiTarget));

  server.get(
    "*.*",
    express.static(browserDistFolder, {
      maxAge: "1y",
    })
  );

  server.get("*", async (req, res) => {
    const cookieHeader = req.headers.cookie ?? "";
    const sessionUser = cookieHeader
      ? await fetchSessionUser(cookieHeader, apiTarget)
      : null;

    if (isDashboardPath(req.path)) {
      if (!sessionUser) {
        res.redirect(302, `/auth-login?returnUrl=${encodeURIComponent(req.originalUrl)}`);
        return;
      }

      if (sessionUser.role === "client") {
        res.redirect(302, "/portal/dashboard");
        return;
      }

      if (sessionUser.role !== "admin" && sessionUser.role !== "editor") {
        res.redirect(302, `/acceso-restringido?reason=${encodeURIComponent(sessionUser.role)}`);
        return;
      }
    }

    if (isPortalRootPath(req.path) && sessionUser) {
      res.redirect(302, getPrivateHome(sessionUser));
      return;
    }

    if (isPortalProtectedPath(req.path)) {
      if (!sessionUser) {
        res.redirect(302, `/portal?returnUrl=${encodeURIComponent(req.originalUrl)}`);
        return;
      }

      if (sessionUser.role === "client") {
        // allow
      } else if (sessionUser.role === "admin" || sessionUser.role === "editor") {
        res.redirect(302, "/dashboard");
        return;
      } else {
        res.redirect(302, `/acceso-restringido?reason=${encodeURIComponent(sessionUser.role)}`);
        return;
      }
    }

    if (authPages.has(req.path) && sessionUser) {
      res.redirect(302, getPrivateHome(sessionUser));
      return;
    }

    if (req.path === "/acceso-restringido" && !sessionUser) {
      res.redirect(302, "/auth-login");
      return;
    }

    if (req.path === "/acceso-restringido" && sessionUser) {
      if (sessionUser.role !== "viewer") {
        res.redirect(302, getPrivateHome(sessionUser));
        return;
      }
    }

    const serverPort = String(port);
    const incomingHost = req.headers.host || `localhost:${serverPort}`;
    const [hostname, hostPort] = incomingHost.split(":");
    const finalHost =
      (hostPort || serverPort) === serverPort ? incomingHost : `${hostname}:${serverPort}`;
    const renderUrl = `${req.protocol}://${finalHost}${req.originalUrl}`;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: renderUrl,
        publicPath: browserDistFolder,
      })
      .then((html) => {
        const runtimeScript = `<script>window.__TECNORIA_RUNTIME__=${JSON.stringify(
          getPublicRuntimeConfig()
        )};</script>`;

        res.setHeader("Cache-Control", "no-store");
        res.send(html.replace("</head>", `${runtimeScript}</head>`));
      })
      .catch((error) => {
        console.error("SSR Error:", error);
        res.status(500).send("Error rendering page");
      });
  });

  return server;
}

function run(): void {
  const port = process.env["PORT"] || 4000;
  const server = app();

  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default app;

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  run();
}
