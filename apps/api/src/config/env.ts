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
  CUTOVER_AUTH: z.string().default("true"),
  CUTOVER_BLOG: z.string().default("true"),
  CUTOVER_CONTACT: z.string().default("true"),
  CUTOVER_SCRAPER: z.string().default("true"),
});

const parsed = EnvSchema.parse(process.env);
const parseBool = (value: string): boolean => value.toLowerCase() === "true";

export const env = {
  ...parsed,
  CUTOVER_AUTH: parseBool(parsed.CUTOVER_AUTH),
  CUTOVER_BLOG: parseBool(parsed.CUTOVER_BLOG),
  CUTOVER_CONTACT: parseBool(parsed.CUTOVER_CONTACT),
  CUTOVER_SCRAPER: parseBool(parsed.CUTOVER_SCRAPER),
};
