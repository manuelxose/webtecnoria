import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  CORS_ORIGIN: z.string().default("http://localhost:4000"),
  COOKIE_NAME: z.string().default("tecnoria_session"),
  UPLOADS_DIR: z.string().default("./uploads"),
  GOOGLE_CLIENT_ID: z.string().min(1),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().email(),
  ADMIN_NOTIFICATION_EMAIL: z.string().email(),
  CUTOVER_AUTH: z.string().default("true"),
  CUTOVER_BLOG: z.string().default("true"),
  CUTOVER_CONTACT: z.string().default("true"),
  CUTOVER_SCRAPER: z.string().default("true"),
  AUCTORIO_PUBLISHER_TOKEN: z.string().default(""),
  AUCTORIO_STUDIO_INTERNAL_URL: z.string().url().default("http://127.0.0.1:4400"),
  AUCTORIO_PUBLIC_LOGIN_URL: z.string().url().default("https://auctorio.com/login"),
  AUCTORIO_LAUNCH_CLIENT_ID: z.string().default("webtecnoria"),
  AUCTORIO_LAUNCH_SHARED_SECRET: z.string().min(16).default("studio-launch-dev-secret-change-me"),
  AUCTORIO_FIRST_PARTY_WORKSPACES: z.string().default("tecnoria"),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => {
    const key = issue.path.join(".") || "UNKNOWN_ENV";
    return `${key}: ${issue.message}`;
  });

  console.error("[api] Missing or invalid environment variables:");
  issues.forEach((issue) => console.error(`- ${issue}`));
  console.error("[api] Revisa tu .env antes de arrancar la API.");
  process.exit(1);
}

const parseBool = (value: string): boolean => value.toLowerCase() === "true";

export const env = {
  ...parsed.data,
  CUTOVER_AUTH: parseBool(parsed.data.CUTOVER_AUTH),
  CUTOVER_BLOG: parseBool(parsed.data.CUTOVER_BLOG),
  CUTOVER_CONTACT: parseBool(parsed.data.CUTOVER_CONTACT),
  CUTOVER_SCRAPER: parseBool(parsed.data.CUTOVER_SCRAPER),
};
