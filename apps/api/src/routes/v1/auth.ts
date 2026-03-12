import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "node:crypto";
import { type Response, Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../../auth/middleware.js";
import { signSessionToken } from "../../auth/tokens.js";
import { env } from "../../config/env.js";
import { pool } from "../../db/pool.js";
import { sendEmail } from "../../services/email.js";
import { verifyGoogleCredential } from "../../services/google-oauth.js";

const router = Router();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const GoogleLoginSchema = z.object({
  credential: z.string().min(1),
});

const AccessRequestSchema = z.object({
  name: z.string().min(2),
  company: z.string().min(2),
  email: z.string().email(),
  phone: z.string().trim().optional(),
  message: z.string().trim().optional(),
});

const PasswordRecoverySchema = z.object({
  email: z.string().email(),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8),
});

type DbUser = {
  id: string;
  email: string;
  password_hash: string | null;
  role: "admin" | "editor" | "viewer" | "client";
  display_name: string | null;
  google_sub: string | null;
  email_verified_at: string | null;
  client_id: string | null;
};

router.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: "Invalid payload" });
    return;
  }

  const user = await findUserByEmail(parsed.data.email);
  if (!user || !user.password_hash) {
    res.status(401).json({ code: "INVALID_CREDENTIALS", message: "Wrong credentials" });
    return;
  }

  const isValid = await bcrypt.compare(parsed.data.password, user.password_hash);
  if (!isValid) {
    res.status(401).json({ code: "INVALID_CREDENTIALS", message: "Wrong credentials" });
    return;
  }

  setSessionCookie(res, user);
  res.json(toAuthUser(user));
});

router.post("/google", async (req, res) => {
  const parsed = GoogleLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: "Invalid payload" });
    return;
  }

  try {
    const googleUser = await verifyGoogleCredential(parsed.data.credential);
    const user = await findUserByEmail(googleUser.email);

    if (!user) {
      res.status(403).json({
        code: "ACCESS_NOT_GRANTED",
        message: "This Google account is not authorized for the private area",
      });
      return;
    }

    if (user.google_sub && user.google_sub !== googleUser.sub) {
      res.status(403).json({
        code: "GOOGLE_ACCOUNT_MISMATCH",
        message: "Google account does not match the authorized user",
      });
      return;
    }

    const updated = await upsertGoogleIdentity(user, googleUser.sub, googleUser.name);
    setSessionCookie(res, updated);
    res.json(toAuthUser(updated));
  } catch (error) {
    console.error("Google login failed:", error);
    res.status(401).json({ code: "INVALID_GOOGLE_CREDENTIAL", message: "Invalid Google credential" });
  }
});

router.post("/access-request", async (req, res) => {
  const parsed = AccessRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: "Invalid payload" });
    return;
  }

  try {
    const body = parsed.data;
    const inserted = await pool.query(
      `INSERT INTO access_requests (name, company, email, phone, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        body.name.trim(),
        body.company.trim(),
        body.email.trim().toLowerCase(),
        body.phone?.trim() || null,
        body.message?.trim() || null,
      ]
    );

    const publicUrl = env.CORS_ORIGIN.replace(/\/$/, "");
    const requestSummary = [
      `Nombre: ${body.name}`,
      `Empresa: ${body.company}`,
      `Email: ${body.email}`,
      body.phone ? `Telefono: ${body.phone}` : null,
      body.message ? `Contexto: ${body.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await Promise.all([
      sendEmail({
        to: body.email,
        subject: "Hemos recibido tu solicitud de acceso a TecnoRia",
        text: [
          `Hola ${body.name},`,
          "",
          "Hemos recibido tu solicitud de acceso al area privada de TecnoRia.",
          "Revisaremos el encaje y los permisos necesarios antes de habilitar el usuario.",
          "",
          "Si necesitamos mas contexto, te escribiremos a este mismo email.",
          "",
          `Mientras tanto puedes volver a la web en ${publicUrl}.`,
        ].join("\n"),
      }),
      sendEmail({
        to: env.ADMIN_NOTIFICATION_EMAIL,
        subject: `Nueva solicitud de acceso privada: ${body.company}`,
        text: [
          "Se ha registrado una nueva solicitud de acceso privada.",
          "",
          requestSummary,
          "",
          `Request ID: ${inserted.rows[0].id}`,
        ].join("\n"),
      }),
    ]);

    res.status(201).json({ id: inserted.rows[0].id });
  } catch (error) {
    console.error("Access request failed:", error);

    const message =
      error instanceof Error && /smtp|mail|email/i.test(error.message)
        ? "No se pudo enviar la confirmacion por email. Revisa la configuracion SMTP."
        : "No se pudo registrar la solicitud en este momento.";

    res.status(502).json({
      code: "ACCESS_REQUEST_FAILED",
      message,
    });
  }
});

router.post("/password-recovery", async (req, res) => {
  const parsed = PasswordRecoverySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: "Invalid payload" });
    return;
  }

  try {
    const email = parsed.data.email.trim().toLowerCase();
    const user = await findUserByEmail(email);

    if (user) {
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);

      await pool.query(
        "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')",
        [user.id, tokenHash]
      );

      const resetUrl = `${env.CORS_ORIGIN.replace(/\/$/, "")}/auth-re-password?token=${rawToken}`;

      await sendEmail({
        to: user.email,
        subject: "Recupera tu acceso a TecnoRia",
        text: [
          `Hola ${user.display_name || user.email},`,
          "",
          "Hemos recibido una solicitud para restablecer tu password del area privada.",
          "Puedes fijar una nueva password desde este enlace:",
          resetUrl,
          "",
          "Este enlace caduca en 1 hora y solo puede usarse una vez.",
          "Si no has solicitado este cambio, puedes ignorar este mensaje.",
        ].join("\n"),
      });
    }

    res.status(202).json({
      ok: true,
      message:
        "Si existe una cuenta asociada a ese email, enviaremos un enlace para recuperar el acceso.",
    });
  } catch (error) {
    console.error("Password recovery failed:", error);
    res.status(502).json({
      code: "PASSWORD_RECOVERY_FAILED",
      message: "No se pudo enviar el email de recuperacion. Revisa la configuracion SMTP.",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  const parsed = ResetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: "Invalid payload" });
    return;
  }

  const tokenHash = hashToken(parsed.data.token);
  const tokenQuery = await pool.query<{
    id: string;
    user_id: string;
  }>(
    `SELECT id, user_id
     FROM password_reset_tokens
     WHERE token_hash = $1
       AND used_at IS NULL
       AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  if (tokenQuery.rowCount === 0) {
    res.status(400).json({ code: "INVALID_TOKEN", message: "Token expired or invalid" });
    return;
  }

  const tokenRecord = tokenQuery.rows[0];
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await pool.query(
    `UPDATE users
     SET password_hash = $1,
         email_verified_at = COALESCE(email_verified_at, NOW()),
         updated_at = NOW()
     WHERE id = $2`,
    [passwordHash, tokenRecord.user_id]
  );

  await pool.query(
    `UPDATE password_reset_tokens
     SET used_at = NOW()
     WHERE user_id = $1
       AND used_at IS NULL`,
    [tokenRecord.user_id]
  );

  res.status(204).send();
});

router.post("/refresh", requireAuth, (req: AuthedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ code: "UNAUTHENTICATED", message: "Missing session" });
    return;
  }

  setSessionCookie(res, {
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    display_name: req.user.displayName ?? null,
    client_id: req.user.clientId ?? null,
  });

  res.json(req.user);
});

router.post("/logout", (_req, res) => {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  res.status(204).send();
});

router.get("/me", requireAuth, (req: AuthedRequest, res) => {
  res.json(req.user);
});

async function findUserByEmail(email: string): Promise<DbUser | null> {
  const query = await pool.query<DbUser>(
    `SELECT id,
            email,
            password_hash,
            role,
            COALESCE(display_name, full_name) AS display_name,
            google_sub,
            email_verified_at,
            client_id
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email.trim().toLowerCase()]
  );

  return query.rowCount ? query.rows[0] : null;
}

async function upsertGoogleIdentity(
  user: DbUser,
  googleSub: string,
  displayName?: string
): Promise<DbUser> {
  const query = await pool.query<DbUser>(
    `UPDATE users
     SET google_sub = COALESCE(google_sub, $1),
         display_name = COALESCE($2, display_name),
         email_verified_at = COALESCE(email_verified_at, NOW()),
         updated_at = NOW()
     WHERE id = $3
     RETURNING id,
               email,
               password_hash,
               role,
               COALESCE(display_name, full_name) AS display_name,
               google_sub,
               email_verified_at,
               client_id`,
    [googleSub, displayName?.trim() || null, user.id]
  );

  return query.rows[0];
}

function toAuthUser(user: DbUser) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    role: user.role,
    clientId: user.client_id,
  };
}

function hashToken(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function setSessionCookie(
  res: Response,
  user: Pick<DbUser, "id" | "email" | "role" | "display_name" | "client_id">
): void {
  const token = signSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    displayName: user.display_name,
    clientId: user.client_id,
  });

  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 8,
    path: "/",
  });
}

export default router;
