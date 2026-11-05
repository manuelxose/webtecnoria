/**
 * Pure analytics event model (no Angular, no DOM, no imports).
 *
 * `AnalyticsService` is a thin wrapper around these functions; keeping the
 * payload construction here lets `scripts/tests/analytics-dispatch.test.mjs`
 * assert the allowed fields and run the PII scan against the real builder.
 *
 * Keeping this module import-free is deliberate: the node:test suites load it
 * through Node's native type stripping, which resolves only exact file paths,
 * while the Angular build forbids `.ts` specifiers. The public route allow-list
 * is therefore injected by the caller (AnalyticsService passes the real
 * `PUBLIC_PATHS`), which also makes the enumeration testable with any list.
 */

export const LEAD_EVENT_NAME = "generate_lead";
export const LEAD_PARAM_KEYS: readonly string[] = [
  "form_type",
  "service_category",
  "source_page",
];

export interface LeadEventInput {
  formType: string;
  serviceCategory: string;
  sourcePage: string;
}

export interface LeadEvent {
  name: string;
  params: Record<string, string>;
}

export type GtagCommand = (...args: unknown[]) => void;

export interface LeadDispatchOptions {
  /** gtag command function, the documented way to send an event to GA4. */
  gtag?: GtagCommand | null;
  /** Present because gtag() itself queues into it; never the primary path. */
  dataLayer?: unknown[] | undefined;
  analyticsGranted: boolean;
  runtimeLoaded: boolean;
  input: LeadEventInput;
  /**
   * Public route allow-list (`PUBLIC_PATHS`). Injected rather than imported so
   * this module stays dependency-free; an absent list collapses every path to
   * "/", which is the safe direction.
   */
  allowedPaths?: ReadonlySet<string>;
}

function clean(value: string, fallback: string): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  // Keep the parameter space enumerable: short, printable, no free text.
  return /^[a-z0-9/_-]{1,64}$/i.test(trimmed) ? trimmed : fallback;
}

/**
 * `source_page` is enumerated, not filtered: only routes declared as public in
 * `seo-route-manifest.ts` (passed in as `allowedPaths`) may travel as an event
 * parameter, so a slug that happened to contain personal data can never be
 * measured. Anything else collapses to "/".
 */
export function allowlistedSourcePage(
  value: unknown,
  allowedPaths?: ReadonlySet<string>
): string {
  const allowed = allowedPaths ?? EMPTY_PATHS;
  const raw = typeof value === "string" ? value.trim() : "";
  if (raw.length === 0) {
    return "/";
  }

  const candidates = [raw, raw.split(/[?#]/)[0] ?? ""];
  for (const candidate of candidates) {
    if (candidate && allowed.has(candidate)) {
      return candidate;
    }
  }

  return "/";
}

const EMPTY_PATHS: ReadonlySet<string> = new Set<string>([]);

export function buildLeadEvent(
  input: LeadEventInput,
  allowedPaths?: ReadonlySet<string>
): LeadEvent {
  return {
    name: LEAD_EVENT_NAME,
    params: {
      form_type: clean(input.formType, "contact"),
      service_category: clean(input.serviceCategory, "other"),
      source_page: allowlistedSourcePage(input.sourcePage, allowedPaths),
    },
  };
}

export function canDispatchLead(options: {
  analyticsGranted: boolean;
  runtimeLoaded: boolean;
}): boolean {
  return options.analyticsGranted === true && options.runtimeLoaded === true;
}

/**
 * Sends `generate_lead` to Google Analytics.
 *
 * PRIMARY PATH: `window.gtag("event", name, params)`. gtag.js only interprets
 * command tuples it is handed through the gtag function; pushing a bare Array
 * into dataLayer is not a documented command form and may never be sent.
 *
 * FALLBACK (bounded, documented): when no gtag function exists but a dataLayer
 * array does, push the GTM-style event object `{event, ...params}`, which is the
 * other form gtag.js/GTM is documented to consume. If neither exists, nothing is
 * sent and the caller learns about it via the boolean.
 */
export function dispatchGenerateLead(options: LeadDispatchOptions): boolean {
  if (!canDispatchLead(options)) {
    return false;
  }

  const event = buildLeadEvent(options.input, options.allowedPaths);

  if (typeof options.gtag === "function") {
    try {
      options.gtag("event", event.name, event.params);
      return true;
    } catch {
      // Fall through to the dataLayer form rather than losing the event.
    }
  }

  if (Array.isArray(options.dataLayer)) {
    options.dataLayer.push({ event: event.name, ...event.params });
    return true;
  }

  return false;
}

/** Guards the form submit handler: no request while invalid or in flight. */
export function canStartSubmission(state: {
  invalid: boolean;
  inFlight: boolean;
}): boolean {
  return state.invalid !== true && state.inFlight !== true;
}

export function createIdempotencyKey(random: () => number = Math.random): string {
  const stamp = Date.now().toString(36);
  const noise = Math.floor(Math.abs(random()) * 0x100000000)
    .toString(36)
    .padStart(6, "0")
    .slice(0, 6);
  return `lead-${stamp}-${noise}`;
}

/** Stable, non-PII label for a project type: never free text. */
export const SERVICE_CATEGORY_LABELS: Readonly<Record<string, string>> = {
  "Software a medida": "software-a-medida",
  "Automatización de procesos": "automatizacion-procesos",
  "Chatbots o asistentes": "chatbots-asistentes",
  "IA aplicada a negocio": "ia-aplicada",
  "Plataforma o SaaS": "plataforma-saas",
  "Revisión de software existente": "revision-software",
  "Consultoría tecnológica": "consultoria-tecnologica",
};

export function serviceCategoryFor(projectType: string): string {
  return SERVICE_CATEGORY_LABELS[projectType] ?? "other";
}
