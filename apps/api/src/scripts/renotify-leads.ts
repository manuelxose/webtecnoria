/**
 * Operator recovery for leads whose notification did not happen.
 *
 *   node --import tsx apps/api/src/scripts/renotify-leads.ts --dry-run --limit 10
 *   node --import tsx apps/api/src/scripts/renotify-leads.ts --limit 20
 *
 * Scope is deliberately narrow:
 *   - only rows created on/after the cutover constant (2026-11-05), so the 17
 *     historical leads that predate notifications can never be emailed;
 *   - only 'pending' or 'failed' rows with fewer than MAX_ATTEMPTS attempts;
 *   - at most one send attempt per row per run;
 *   - a broken SMTP server makes this a no-op, never a crash.
 */

import { pool } from "../db/pool.js";
import { notifyLead, type LeadNotification } from "../services/notification.js";
import { createLogger } from "../services/logger.js";

/** Cutover: nothing created before this instant may ever be notified. */
export const NOTIFY_SINCE = "2026-11-05T00:00:00.000Z";
export const MAX_ATTEMPTS = 3;

const logger = createLogger();

export interface RenotifyOptions {
  dryRun: boolean;
  limit: number;
}

export function parseArgs(argv: string[]): RenotifyOptions {
  const dryRun = argv.includes("--dry-run");
  const limitIndex = argv.indexOf("--limit");
  const rawLimit = limitIndex >= 0 ? Number(argv[limitIndex + 1]) : 20;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(100, Math.trunc(rawLimit)) : 20;

  return { dryRun, limit };
}

interface PendingRow {
  id: string;
  created_at: Date;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service_1: string | null;
  service_2: string | null;
  message: string;
  source_page: string | null;
  notification_attempts: number;
}

export async function runRenotify(options: RenotifyOptions): Promise<{ scanned: number; sent: number; failed: number }> {
  const pending = await pool.query<PendingRow>(
    `SELECT id, created_at, name, email, phone, company, service_1, service_2, message,
            source_page, notification_attempts
       FROM contact_messages
      WHERE notification_status IN ('pending', 'failed')
        AND notification_attempts < $1
        AND created_at >= $2
      ORDER BY created_at ASC
      LIMIT $3`,
    [MAX_ATTEMPTS, NOTIFY_SINCE, options.limit]
  );

  const rows = pending.rows;
  logger.log({ event: "renotify_scan", count: rows.length, detail: options.dryRun ? "dry-run" : "live" });

  if (options.dryRun) {
    for (const row of rows) {
      logger.log({ event: "renotify_would_send", count: row.notification_attempts });
    }
    return { scanned: rows.length, sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;
  const attempted = new Set<string>();

  for (const row of rows) {
    if (attempted.has(row.id)) {
      continue;
    }
    attempted.add(row.id);

    const lead: LeadNotification = {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      service1: row.service_1,
      service2: row.service_2,
      message: row.message,
      sourcePage: row.source_page,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : undefined,
    };

    const result = await notifyLead(lead);

    await pool.query(
      `UPDATE contact_messages
          SET notification_status = $2,
              notification_attempts = notification_attempts + 1,
              notified_at = CASE WHEN $2 = 'sent' THEN NOW() ELSE NULL END,
              notification_error = $3
        WHERE id = $1`,
      [row.id, result.status, result.status === "failed" ? result.errorClass : null]
    );

    if (result.status === "sent") {
      sent += 1;
      logger.log({ event: "renotify_sent", count: sent });
    } else {
      failed += 1;
      logger.log({ event: "renotify_failed", errorClass: result.errorClass, count: failed });
    }
  }

  return { scanned: rows.length, sent, failed };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  try {
    const summary = await runRenotify(options);
    logger.log({ event: "renotify_summary", count: summary.scanned, detail: `sent=${summary.sent} failed=${summary.failed}` });
  } catch (error) {
    // SMTP unreachable or DB unavailable: report and exit without a stack trace.
    logger.log({
      event: "renotify_error",
      errorClass: error instanceof Error ? error.name : "UnknownError",
    });
    process.exitCode = 1;
  } finally {
    await pool.end().catch(() => undefined);
  }
}

const isDirectRun = process.argv[1]
  ? import.meta.url === new URL(`file:///${process.argv[1].replace(/\\/g, "/").replace(/^\//, "")}`).href
  : false;

if (isDirectRun) {
  void main();
}
