import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../db/pool.js";

async function run(): Promise<void> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const migrationsDir = path.resolve(__dirname, "../../migrations");

  const files = (await readdir(migrationsDir))
    .filter((name) => name.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    const sql = await readFile(fullPath, "utf8");
    // eslint-disable-next-line no-console
    console.log(`Applying migration: ${file}`);
    await pool.query(sql);
  }
}

run()
  .then(async () => {
    await pool.end();
    // eslint-disable-next-line no-console
    console.log("Migrations completed");
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error("Migration failed", error);
    await pool.end();
    process.exit(1);
  });
