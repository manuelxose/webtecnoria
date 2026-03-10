import bcrypt from "bcryptjs";
import { type Response, Router } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";
import { pool } from "../../db/pool.js";
import { requireAuth, type AuthedRequest } from "../../auth/middleware.js";
import { signSessionToken } from "../../auth/tokens.js";

const router = Router();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: "Invalid payload" });
    return;
  }

  const { email, password } = parsed.data;
  const query = await pool.query(
    "SELECT id, email, password_hash, role FROM users WHERE email = $1 LIMIT 1",
    [email]
  );

  if (query.rowCount === 0) {
    res.status(401).json({ code: "INVALID_CREDENTIALS", message: "Wrong credentials" });
    return;
  }

  const user = query.rows[0] as {
    id: string;
    email: string;
    password_hash: string;
    role: "admin" | "editor" | "viewer";
  };

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    res.status(401).json({ code: "INVALID_CREDENTIALS", message: "Wrong credentials" });
    return;
  }

  const token = signSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  setSessionCookie(res, token);

  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
  });
});

router.post("/refresh", requireAuth, (req: AuthedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ code: "UNAUTHENTICATED", message: "Missing session" });
    return;
  }

  const token = signSessionToken({
    sub: req.user.id,
    email: req.user.email,
    role: req.user.role,
  });

  setSessionCookie(res, token);

  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
  });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(env.COOKIE_NAME, { path: "/" });
  res.status(204).send();
});

router.get("/me", requireAuth, (req: AuthedRequest, res) => {
  res.json(req.user);
});

function setSessionCookie(res: Response, token: string): void {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 8,
    path: "/",
  });
}

export default router;
