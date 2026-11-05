/**
 * Lead notification.
 *
 * Two rules shape this module:
 *  1. Storage outcome and notification outcome are separate facts. `notifyLead`
 *     never throws into the request path, so a failing SMTP server can never
 *     turn a stored lead into an HTTP error.
 *  2. Only an error CLASS/CODE is ever reported back (e.g. `EAUTH`), never the
 *     raw SMTP response, which can quote addresses and server internals.
 */

export interface LeadNotification {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service1?: string | null;
  service2?: string | null;
  message: string;
  sourcePage?: string | null;
  createdAt?: string;
}

export type NotifyResult =
  | { status: "sent" }
  | { status: "failed"; errorClass: string };

export type Notifier = (lead: LeadNotification) => Promise<NotifyResult>;

/** Constant: no field value ever reaches the subject line. */
export const LEAD_SUBJECT = "Nueva solicitud de diagnóstico — tecnoriasl.com";

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
}

export interface BuildEmailOptions {
  to: string;
}

export function buildLeadEmail(lead: LeadNotification, options: BuildEmailOptions): EmailPayload {
  const lines = [
    "Se ha recibido una nueva solicitud desde el formulario de contacto.",
    "",
    `Nombre: ${lead.name}`,
    `Email: ${lead.email}`,
    lead.phone ? `Teléfono: ${lead.phone}` : null,
    lead.company ? `Empresa: ${lead.company}` : null,
    lead.service1 ? `Necesidad: ${lead.service1}` : null,
    lead.service2 ? `Plazo: ${lead.service2}` : null,
    lead.sourcePage ? `Página de origen: ${lead.sourcePage}` : null,
    "",
    "Mensaje:",
    lead.message,
    "",
    `ID: ${lead.id}`,
    lead.createdAt ? `Recibido: ${lead.createdAt}` : null,
  ].filter((line): line is string => line !== null);

  return {
    to: options.to,
    subject: LEAD_SUBJECT,
    text: lines.join("\n"),
  };
}

function errorClassOf(error: unknown): string {
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

export interface NotifierOptions {
  /** Transport. Injected so tests never touch a real SMTP server. */
  send: (payload: EmailPayload) => Promise<unknown>;
  /** Recipient, read at call time. */
  to?: () => string | undefined;
  timeoutMs?: number;
}

export function createNotifier(options: NotifierOptions): Notifier {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const recipient = options.to ?? (() => process.env["ADMIN_NOTIFICATION_EMAIL"]);

  return async function notify(lead: LeadNotification): Promise<NotifyResult> {
    const to = recipient();
    if (!to) {
      return { status: "failed", errorClass: "MissingRecipient" };
    }

    let timer: NodeJS.Timeout | undefined;
    try {
      const payload = buildLeadEmail(lead, { to });
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          const error = new Error("notification timeout");
          (error as { code?: string }).code = "ETIMEDOUT";
          reject(error);
        }, timeoutMs);
        timer.unref?.();
      });

      await Promise.race([options.send(payload), timeout]);
      return { status: "sent" };
    } catch (error) {
      return { status: "failed", errorClass: errorClassOf(error) };
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  };
}

/**
 * Production notifier. The transport is imported lazily so that loading this
 * module (in tests, or in a process without SMTP configuration) never triggers
 * the strict env validation that `services/email.ts` performs at import time.
 */
export const notifyLead: Notifier = createNotifier({
  send: async (payload) => {
    const { sendEmail } = await import("./email.js");
    await sendEmail(payload);
  },
});
