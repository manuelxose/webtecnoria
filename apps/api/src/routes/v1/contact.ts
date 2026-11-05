import { randomUUID } from "node:crypto";
import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { pool } from "../../db/pool.js";
import { requireAdmin } from "../../auth/middleware.js";
import { clientHashForRequest, resolveClientIp } from "../../config/trusted-proxy.js";
import { createLeadRateLimiter, type RateLimiter } from "../../services/lead-rate-limit.js";
import { logger as defaultLogger, type Logger } from "../../services/logger.js";
import { notifyLead as defaultNotifyLead, type LeadNotification, type Notifier, type NotifyResult } from "../../services/notification.js";

export interface QueryResultLike {
  rows: Record<string, unknown>[];
}

export interface Queryable {
  query(sql: string, params?: unknown[]): Promise<QueryResultLike>;
}

export interface ContactRouterDependencies {
  pool: Queryable;
  notify: Notifier;
  limiter: RateLimiter;
  logger: Logger;
}

/**
 * Field limits. Every string has an explicit maximum; input is trimmed first so
 * that "  " is not a valid message. Minimums are unchanged from the original
 * handler (name 2, message 3): tightening a minimum drops real leads, a maximum
 * does not.
 */
const contactSchema = z.object({
  name: z.string().trim().min(2, "El nombre es demasiado corto").max(120, "El nombre es demasiado largo"),
  email: z.string().trim().max(254, "El email es demasiado largo").email("El email no es válido"),
  company: z.string().trim().max(160, "La empresa es demasiado larga").optional(),
  phone: z.string().trim().max(32, "El teléfono es demasiado largo").optional(),
  service1: z.string().trim().max(80, "La necesidad es demasiado larga").optional(),
  service2: z.string().trim().max(120, "El plazo es demasiado largo").optional(),
  message: z.string().trim().min(3, "El mensaje es demasiado corto").max(5000, "El mensaje es demasiado largo"),
  // Additive fields from the browser form. All optional on purpose: the web
  // release and the API deploy separately, and during that window the old form
  // talks to the new API. A missing flag is a fact to record, never a reason to
  // reject a paying lead.
  privacyAccepted: z.boolean().optional(),
  sourcePage: z.string().max(200).optional(),
  idempotencyKey: z.string().trim().max(64).optional(),
});

const SINGLE_LINE_FIELDS = ["name", "email", "company", "phone", "service1", "service2", "sourcePage", "idempotencyKey"] as const;

function stripNewlines(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return value.replace(/[\r\n\t\u2028\u2029]+/g, " ").trim();
}

/** A source page must be a relative path: "/x", never "//x" or "https://…". */
export function normalizeSourcePage(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const candidate = value.trim();
  if (candidate.length === 0 || candidate.length > 200) {
    return null;
  }
  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return null;
  }
  if (candidate.includes("://") || /[<>"'\\]/.test(candidate)) {
    return null;
  }

  return candidate;
}

export function classifyUserAgent(userAgent: unknown): string {
  if (typeof userAgent !== "string" || userAgent.length === 0) {
    return "unknown";
  }
  if (/bot|crawler|spider|preview|curl|wget|python-requests|httpclient/i.test(userAgent)) {
    return "automated";
  }
  if (/mobile|android|iphone|ipad/i.test(userAgent)) {
    return "mobile";
  }

  return "desktop";
}

function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

/**
 * Error class/CODE only — never a message, which can quote addresses or server
 * internals. Mirrors the sanitising in services/notification.ts on purpose: the
 * route must enforce its own guarantee instead of relying on the notifier's.
 */
export function sanitizeErrorClass(error: unknown): string {
  const code = (error as { code?: unknown } | null)?.code;
  if (typeof code === "string" && /^[A-Za-z0-9_]{1,48}$/.test(code)) {
    return code;
  }

  const name = (error as { name?: unknown } | null)?.name;
  if (typeof name === "string" && /^[A-Za-z0-9_]{1,48}$/.test(name)) {
    return name;
  }

  return "UnknownError";
}

/**
 * Same rule for a class the notifier RETURNED rather than threw. Unreachable
 * today (services/notification.ts sanitises first) but the route must not depend
 * on that: a raw SMTP string or an over-long value is stored as UnknownError.
 */
export function sanitizeErrorClassValue(value: unknown): string {
  return typeof value === "string" && /^[A-Za-z0-9_]{1,48}$/.test(value) ? value : "UnknownError";
}

/**
 * Totales agregados para la vista de operador SIN datos personales.
 *
 * Todo lo que sale de aquí es un contador o una marca de tiempo: no se
 * devuelve ninguna fila, así que ningún nombre, email, teléfono, mensaje,
 * client_hash, id o idempotency_key puede llegar al payload.
 *
 * Los tramos de antigüedad se calculan en SQL con NOW() - INTERVAL (no en
 * JavaScript): el reloj de la base de datos es la única fuente de verdad y la
 * consulta sigue siendo un único viaje de ida y vuelta.
 */
const NOTIFICATION_SUMMARY_TOTALS_SQL = `SELECT
            (COUNT(*) FILTER (WHERE notification_status = 'pending'))::int AS pending,
            (COUNT(*) FILTER (WHERE notification_status = 'failed'))::int AS failed,
            (COUNT(*) FILTER (WHERE notification_status = 'sent'))::int AS sent,
            (COUNT(*) FILTER (WHERE notification_status = 'legacy'))::int AS legacy,
            (COUNT(*) FILTER (
               WHERE notification_status = 'pending'
                 AND created_at <= NOW() - INTERVAL '1 minute'
             ))::int AS pending_older_m1,
            (COUNT(*) FILTER (
               WHERE notification_status = 'pending'
                 AND created_at <= NOW() - INTERVAL '15 minutes'
             ))::int AS pending_older_m15,
            (COUNT(*) FILTER (
               WHERE notification_status = 'pending'
                 AND created_at <= NOW() - INTERVAL '60 minutes'
             ))::int AS pending_older_m60,
            (MIN(created_at) FILTER (WHERE notification_status = 'pending'))::timestamptz AS oldest_pending_at
          FROM contact_messages`;

/**
 * Clases de error de las notificaciones fallidas, agrupadas y recortadas.
 *
 * La clase es un identificador técnico (EAUTH, ETIMEDOUT…), nunca el texto
 * del error: la respuesta SMTP original puede citar direcciones y el motor
 * nunca la guarda.
 */
const NOTIFICATION_FAILED_BY_CLASS_SQL = `SELECT
            COALESCE(notification_error, 'UnknownError') AS error_class,
            (COUNT(*))::int AS error_count
          FROM contact_messages
          WHERE notification_status = 'failed'
          GROUP BY COALESCE(notification_error, 'UnknownError')
          ORDER BY error_count DESC, error_class ASC
          LIMIT 10`;

/** Un contador es siempre un entero no negativo, sea lo que devuelva el driver. */
function toCount(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.trunc(parsed);
}

/** Un timestamptz como ISO 8601, o null cuando no hay ninguna fila que fecharla. */
function toTimestamp(value: unknown): string | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  return null;
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fields[key]) {
      fields[key] = issue.message;
    }
  }

  return fields;
}

export function createContactRouter(deps: ContactRouterDependencies): Router {
  const router = Router();

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const clientHash = clientHashForRequest(req);

      // 1. Honeypot, before validation: a bot that fills the hidden field must
      //    never produce a validation error (that would reveal the field) and
      //    must never create a row. An absent field is empty, not spam.
      const honeypot = typeof body["_hp"] === "string" ? body["_hp"].trim() : "";
      if (honeypot.length > 0) {
        deps.logger.log({ event: "contact_spam_honeypot", client: clientHash, status: 201 });
        res.status(201).json({ id: randomUUID(), duplicate: false, notified: "skipped" });
        return;
      }

      // 2. Validation.
      const parsed = contactSchema.safeParse(body);
      if (!parsed.success) {
        const fields = fieldErrors(parsed.error);
        deps.logger.log({ event: "contact_invalid_input", client: clientHash, status: 400, fields: Object.keys(fields) });
        res.status(400).json({ code: "INVALID_INPUT", fields });
        return;
      }

      const data = parsed.data;

      // 3. Single-line fields must not carry line breaks.
      for (const field of SINGLE_LINE_FIELDS) {
        const cleaned = stripNewlines(data[field]);
        if (cleaned !== undefined) {
          (data as Record<string, unknown>)[field] = cleaned;
        }
      }

      const sourcePage = normalizeSourcePage(data.sourcePage);
      const privacyAccepted = data.privacyAccepted === true;
      const idempotencyKey = data.idempotencyKey && data.idempotencyKey.length > 0 ? data.idempotencyKey : null;

      if (!privacyAccepted) {
        deps.logger.log({ event: "contact_privacy_not_accepted", client: clientHash, status: 201 });
      }
      if (idempotencyKey === null) {
        deps.logger.log({ event: "contact_no_idempotency_key", client: clientHash, status: 201 });
      }

      // 4. Rate limit, once the payload is known valid.
      const decision = deps.limiter.consume(clientHash);
      if (!decision.allowed) {
        // Two distinct events so an operator can tell one abuser from a flood.
        deps.logger.log({
          event: decision.scope === "global" ? "contact_rate_limited_global" : "contact_rate_limited_key",
          client: clientHash,
          status: 429,
        });
        res.setHeader("Retry-After", String(decision.retryAfter));
        res.status(429).json({ code: "RATE_LIMITED", retryAfter: decision.retryAfter });
        return;
      }

      // 5. Insert. The idempotency key makes a retry (double click, network
      //    retry, web/API deploy window) a no-op instead of a second row.
      const inserted = await deps.pool.query(
        `INSERT INTO contact_messages
           (name, email, phone, company, service_1, service_2, message, source_page,
            idempotency_key, privacy_accepted, client_hash, user_agent_class, notification_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'pending')
         ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
         RETURNING id, created_at`,
        [
          data.name,
          data.email.toLowerCase(),
          data.phone ?? null,
          data.company ?? null,
          data.service1 ?? null,
          data.service2 ?? null,
          data.message,
          sourcePage,
          idempotencyKey,
          privacyAccepted,
          clientHash,
          classifyUserAgent(req.headers["user-agent"]),
        ]
      );

      let id = inserted.rows[0]?.["id"] as string | undefined;
      let createdAt = inserted.rows[0]?.["created_at"];
      let duplicate = false;

      if (!id) {
        const existing = await deps.pool.query(
          "SELECT id, created_at, notification_status FROM contact_messages WHERE idempotency_key = $1",
          [idempotencyKey]
        );
        id = existing.rows[0]?.["id"] as string | undefined;
        createdAt = existing.rows[0]?.["created_at"];
        duplicate = true;
      }

      if (!id) {
        // Should be impossible: either the insert returned a row or the key
        // exists. Fail loudly rather than claim the lead was stored.
        throw new Error("lead insert returned no row and no existing id");
      }

      if (duplicate) {
        deps.logger.log({ event: "contact_duplicate_ignored", client: clientHash, status: 201, duplicate: true });
        res.status(201).json({ id, duplicate: true, notified: "skipped" });
        return;
      }

      // 6. Notification, strictly after the row exists, and never able to change
      //    the HTTP result of a stored lead.
      const lead: LeadNotification = {
        id,
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone ?? null,
        company: data.company ?? null,
        service1: data.service1 ?? null,
        service2: data.service2 ?? null,
        message: data.message,
        sourcePage,
        createdAt: createdAt instanceof Date ? createdAt.toISOString() : undefined,
      };

      // The route must not trust the notifier: a throwing, malformed or
      // unsanitised notifier is a failed notification, never a failed lead. The
      // row already exists at this point, so the HTTP result stays 201 whatever
      // happens here.
      let result: NotifyResult;
      try {
        const candidate = await deps.notify(lead);
        if (!candidate || (candidate.status !== "sent" && candidate.status !== "failed")) {
          result = { status: "failed", errorClass: "InvalidNotifierResult" };
        } else if (candidate.status === "failed") {
          // A RETURNED class is as untrusted as a thrown one: the verifier
          // injected a real address and a 300-char string through this path.
          result = { status: "failed", errorClass: sanitizeErrorClassValue(candidate.errorClass) };
        } else {
          result = { status: "sent" };
        }
      } catch (error) {
        result = { status: "failed", errorClass: sanitizeErrorClass(error) };
      }

      // The lead is already stored. Recording the notification outcome is a
      // second fact, not part of the submission: if this UPDATE fails, the
      // visitor still gets a 201 for a lead that really was saved.
      try {
        await deps.pool.query(
          `UPDATE contact_messages
              SET notification_status = $2,
                  notification_attempts = notification_attempts + 1,
                  notified_at = CASE WHEN $2 = 'sent' THEN NOW() ELSE NULL END,
                  notification_error = $3
            WHERE id = $1`,
          [id, result.status, result.status === "failed" ? result.errorClass : null]
        );
      } catch (error) {
        deps.logger.log({
          event: "contact_notification_state_not_persisted",
          client: clientHash,
          status: 201,
          errorClass: sanitizeErrorClass(error),
        });
      }

      deps.logger.log({
        event: "contact_lead_stored",
        client: clientHash,
        status: 201,
        duplicate: false,
        notified: result.status,
        errorClass: result.status === "failed" ? result.errorClass : undefined,
      });

      res.status(201).json({ id, duplicate: false, notified: result.status });
    })
  );

  // ---- Admin read path: until now a stored lead had no reader at all. ----

  router.get(
    "/messages",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const rawLimit = Number(req.query["limit"] ?? 20);
      const limit = Number.isFinite(rawLimit) ? Math.min(100, Math.max(1, Math.trunc(rawLimit))) : 20;
      const before = typeof req.query["before"] === "string" ? req.query["before"] : null;

      const params: unknown[] = [];
      let where = "";

      if (before) {
        const parsedDate = new Date(before);
        if (Number.isNaN(parsedDate.getTime())) {
          res.status(400).json({ code: "INVALID_INPUT", fields: { before: "Fecha no válida" } });
          return;
        }
        params.push(parsedDate.toISOString());
        where = "WHERE created_at < $1";
      }

      params.push(limit);
      const result = await deps.pool.query(
        `SELECT id, created_at, name, email, phone, company, service_1, service_2, message,
                source_page, notification_status, notification_attempts, notified_at,
                notification_error, privacy_accepted, user_agent_class, client_hash
           FROM contact_messages
           ${where}
          ORDER BY created_at DESC
          LIMIT $${params.length}`,
        params
      );

      const items = result.rows;
      const last = items[items.length - 1]?.["created_at"];
      res.json({
        items,
        nextBefore: items.length === limit && last ? new Date(String(last)).toISOString() : null,
      });
    })
  );

  // ---- Vista de operador sin PII (GROWTH-04 / P0-5). ----
  //
  // EL ORDEN IMPORTA: esta ruta se declara ANTES que "/messages/:id". Express
  // empareja las rutas en orden de declaración, así que un ":id" declarado
  // primero se tragaría "notification-summary" y respondería 404 en lugar del
  // agregado. La prueba de scripts/api-tests/lead-summary.test.mjs lo
  // demuestra de las dos maneras (comportamiento y orden de declaración).
  //
  // El payload es un agregado: recuentos, antigüedad y clases de error. Nunca
  // contiene nombre, email, teléfono, empresa, mensaje, client_hash, id ni
  // idempotency_key, de modo que el operador puede vigilar la cola sin abrir
  // un solo lead ni exponer datos personales.
  router.get(
    "/messages/notification-summary",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const [totals, classes] = await Promise.all([
        deps.pool.query(NOTIFICATION_SUMMARY_TOTALS_SQL),
        deps.pool.query(NOTIFICATION_FAILED_BY_CLASS_SQL),
      ]);

      const row = totals.rows[0] as Record<string, unknown> | undefined;
      const pending = toCount(row?.["pending"]);
      const failed = toCount(row?.["failed"]);

      const failedByClass = classes.rows
        .map((entry) => ({
          // Se sanea otra vez aquí: la ruta no confía en lo que hay en la tabla.
          errorClass: sanitizeErrorClassValue(entry["error_class"]),
          count: toCount(entry["error_count"]),
        }))
        .sort((left, right) => right.count - left.count || left.errorClass.localeCompare(right.errorClass))
        .slice(0, 10);

      // Sólo contadores agregados: ni una fila, ni un identificador.
      deps.logger.log({
        event: "contact_notification_summary_read",
        count: pending + failed,
        status: 200,
      });

      res.json({
        counts: {
          pending,
          failed,
          sent: toCount(row?.["sent"]),
          legacy: toCount(row?.["legacy"]),
        },
        pendingOlderThan: {
          m1: toCount(row?.["pending_older_m1"]),
          m15: toCount(row?.["pending_older_m15"]),
          m60: toCount(row?.["pending_older_m60"]),
        },
        oldestPendingAt: toTimestamp(row?.["oldest_pending_at"]),
        failedByClass,
        readAt: new Date().toISOString(),
      });
    })
  );

  router.get(
    "/messages/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const result = await deps.pool.query(
        `SELECT id, created_at, name, email, phone, company, service_1, service_2, message,
                source_page, notification_status, notification_attempts, notified_at,
                notification_error, privacy_accepted, user_agent_class, client_hash
           FROM contact_messages WHERE id = $1`,
        [req.params.id]
      );

      const item = result.rows[0];
      if (!item) {
        res.status(404).json({ code: "NOT_FOUND", message: "Mensaje no encontrado" });
        return;
      }

      res.json(item);
    })
  );

  return router;
}

/** Default router wired to the real dependencies (used by routes/v1/index.ts). */
const contactRouter = createContactRouter({
  pool: pool as unknown as Queryable,
  notify: defaultNotifyLead,
  limiter: createLeadRateLimiter(),
  logger: defaultLogger,
});

export default contactRouter;
