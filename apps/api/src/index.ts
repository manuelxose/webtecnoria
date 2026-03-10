import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import v1Router from "./routes/v1/index.js";

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
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

async function start(): Promise<void> {
  await ensureDatabaseConnection();

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

void start();
