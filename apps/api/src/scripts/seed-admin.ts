import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (email)
     DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin', updated_at = NOW()`,
    [email, passwordHash]
  );

  // eslint-disable-next-line no-console
  console.log(`Admin user seeded: ${email}`);
  await pool.end();
}

main().catch(async (error: unknown) => {
  // eslint-disable-next-line no-console
  console.error("Seed admin failed:", error);
  await pool.end();
  process.exit(1);
});
