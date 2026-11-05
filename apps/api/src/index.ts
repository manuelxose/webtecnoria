import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { NextFunction, Request, Response } from "express";
import { env } from "./config/env.js";
import { clientHashForRequest } from "./config/trusted-proxy.js";
import { pool } from "./db/pool.js";
import v1Router from "./routes/v1/index.js";
import { createLogger } from "./services/logger.js";

const app = express();
// client -> Cloudflare -> nginx (127.0.0.1) -> node. Only loopback is trusted, so
// req.ip is the address that connected to nginx; the visitor address is
// recovered in config/trusted-proxy.ts by validating that peer against the
// embedded Cloudflare ranges.
app.set("trust proxy", "loopback");

const logger = createLogger();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Compact single-line JSON access log. Field values (email, phone, message) are
// never passed in; the client is a salted hash and the path is query-free.
app.use((req: Request, res: Response, next: NextFunction) => {
  const startedAt = process.hrtime.bigint();
  // Capture the path at request start: by the time `finish` fires, a mounted
  // router has stripped its prefix from req.url and req.path would read "/".
  const requestPath = (req.originalUrl || req.path || "/").split("?")[0] || "/";

  res.on("finish", () => {
    let client: string | undefined;
    try {
      client = clientHashForRequest(req);
    } catch {
      client = undefined;
    }

    logger.log({
      event: "http_request",
      method: req.method,
      path: requestPath,
      status: res.statusCode,
      durationMs: Number(process.hrtime.bigint() - startedAt) / 1_000_000,
      client,
    });
  });

  next();
});

app.use("/uploads", express.static(path.resolve(env.UPLOADS_DIR)));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "tecnoria-api",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/v1/feature-flags", (_req, res) => {
  res.json({
    auth: env.CUTOVER_AUTH,
    blog: env.CUTOVER_BLOG,
    contact: env.CUTOVER_CONTACT,
    scraper: env.CUTOVER_SCRAPER,
  });
});

app.use("/api/v1", v1Router);

app.use((req, res) => {
  res.status(404).json({ code: "NOT_FOUND", message: `Route ${req.path} not found` });
});

// Terminal error middleware: never leaks a stack trace or an error message.
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  // Honour a 4xx carried by the error: body-parser reports 400 for malformed
  // JSON and 413 for a body over the limit. Anything else stays an internal 500.
  const carried = (error ?? {}) as { status?: unknown; statusCode?: unknown };
  const raw = typeof carried.status === "number" ? carried.status : carried.statusCode;
  const status =
    typeof raw === "number" && Number.isInteger(raw) && raw >= 400 && raw <= 499 ? raw : 500;

  const errorClass =
    error && typeof error === "object" && "name" in error && typeof error.name === "string"
      ? error.name
      : "UnknownError";

  logger.log({
    event: "http_error",
    method: req.method,
    path: req.path,
    status,
    errorClass,
  });

  if (status === 500) {
    res.status(500).json({ code: "INTERNAL" });
    return;
  }

  res.status(status).json({ code: status === 413 ? "PAYLOAD_TOO_LARGE" : "BAD_REQUEST" });
});

// A pool error (idle client terminated by a Postgres restart, network blip) must
// never become an unhandled 'error' event that kills the process.
pool.on("error", (error: Error) => {
  logger.log({ event: "db_pool_error", errorClass: error.name });
});

async function ensureDatabaseConnection(): Promise<void> {
  try {
    await pool.query("SELECT 1");
  } catch (error) {
    console.error("[api] DATABASE_URL is configured but the database is not reachable.");

    if (error instanceof Error) {
      console.error(`[api] ${error.message}`);
    }

    process.exit(1);
  }
}

let server: ReturnType<typeof app.listen> | undefined;
let shuttingDown = false;

export async function shutdown(
  signal: string,
  exit: (code: number) => void = (code) => process.exit(code)
): Promise<void> {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  logger.log({ event: "shutdown_started", detail: signal });

  const finish = (code: number) => {
    logger.log({ event: "shutdown_complete", detail: signal });
    exit(code);
  };

  const forceExit = setTimeout(() => finish(1), 10_000);
  forceExit.unref?.();

  if (server) {
    await new Promise<void>((resolve) => server?.close(() => resolve()));
  }

  try {
    await pool.end();
  } catch {
    // Pool already closed.
  }

  clearTimeout(forceExit);
  finish(0);
}

/** Registered by start(); exported so tests can assert the wiring exists. */
export function registerSignalHandlers(): void {
  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.on(signal, () => {
      void shutdown(signal);
    });
  }
}

async function start(): Promise<void> {
  await ensureDatabaseConnection();

  server = app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });

  registerSignalHandlers();

  process.on("unhandledRejection", (reason) => {
    // Log and keep serving: an unhandled rejection in one request must not take
    // the whole lead pipeline down.
    logger.log({
      event: "unhandled_rejection",
      errorClass: reason instanceof Error ? reason.name : "UnknownError",
    });
  });
}

export { app };

/**
 * G-3: decide whether this module is the process entry point.
 *
 * `import.meta.url` is already a real path; `process.argv[1]` is not. Comparing
 * them raw means a symlinked checkout (or a `..` segment) can silently make the
 * entry point a no-op: the process exits 0, systemd restart-loops, and nothing
 * listens. Resolving both sides with realpathSync removes that trap.
 */
export function isDirectEntryPoint(entryPath: string | undefined, moduleUrl: string): boolean {
  if (!entryPath) {
    return false;
  }

  const canonical = (target: string): string => {
    try {
      return realpathSync(target);
    } catch {
      return target;
    }
  };

  try {
    return canonical(entryPath) === canonical(fileURLToPath(moduleUrl));
  } catch {
    return false;
  }
}

// Only bootstrap when executed directly, so tests can import this module to
// exercise the real middleware chain without starting a server.
if (isDirectEntryPoint(process.argv[1], import.meta.url)) {
  void start();
}
