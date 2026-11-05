/**
 * Single-line JSON logger for the API.
 *
 * Only a fixed, allow-listed set of fields is ever emitted, and free-text
 * fields are length-capped. There is no API to log arbitrary objects, which is
 * what keeps email addresses, phone numbers, message bodies, raw IPs and query
 * strings out of the journal by construction.
 */

export interface LogFields {
  event: string;
  method?: string;
  path?: string;
  status?: number;
  durationMs?: number;
  client?: string;
  errorClass?: string;
  duplicate?: boolean;
  notified?: string;
  /** Coarse, non-identifying counters (e.g. field names that failed validation). */
  fields?: string[];
  count?: number;
  detail?: string;
}

export interface Logger {
  log(fields: LogFields): void;
}

const MAX_STRING = 120;
const MAX_FIELDS = 12;

function cap(value: string): string {
  return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
}

function safePath(path: unknown): string | undefined {
  if (typeof path !== "string") {
    return undefined;
  }
  // Strip any query string defensively, even though req.path has none.
  const withoutQuery = path.split("?")[0] ?? "/";
  return cap(withoutQuery);
}

function buildLine(fields: LogFields): string {
  const line: Record<string, unknown> = {
    ts: new Date().toISOString(),
    event: cap(String(fields.event ?? "unknown")),
  };

  if (fields.method) line["method"] = cap(String(fields.method).toUpperCase());
  const path = safePath(fields.path);
  if (path) line["path"] = path;
  if (typeof fields.status === "number") line["status"] = fields.status;
  if (typeof fields.durationMs === "number") line["durationMs"] = Math.round(fields.durationMs);
  if (fields.client) line["client"] = cap(String(fields.client));
  if (fields.errorClass) line["errorClass"] = cap(String(fields.errorClass));
  if (typeof fields.duplicate === "boolean") line["duplicate"] = fields.duplicate;
  if (fields.notified) line["notified"] = cap(String(fields.notified));
  if (typeof fields.count === "number") line["count"] = fields.count;
  if (fields.detail) line["detail"] = cap(String(fields.detail));
  if (Array.isArray(fields.fields) && fields.fields.length > 0) {
    line["fields"] = fields.fields.slice(0, MAX_FIELDS).map((name) => cap(String(name)));
  }

  return JSON.stringify(line);
}

export function createLogger(sink: (line: string) => void = (line) => process.stdout.write(`${line}\n`)): Logger {
  return {
    log(fields: LogFields): void {
      try {
        sink(buildLine(fields));
      } catch {
        // A logger must never break a request.
      }
    },
  };
}

export const logger: Logger = createLogger();
