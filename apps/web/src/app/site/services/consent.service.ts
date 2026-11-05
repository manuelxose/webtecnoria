import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import {
  Injectable,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from "@angular/core";
import {
  ANALYTICS_COOKIE_NAMES,
  CONSENT_STORAGE_KEY,
  ConsentRecord,
  analyticsCookieDeletionStrings,
  consentSignals,
  cookieDomainsForHost,
  createConsentRecord,
  isAnalyticsCookieName,
  isAnalyticsGranted,
  parseConsentRecord,
  serializeConsentRecord,
  shouldPurgeAnalyticsCookies,
} from "./consent-state";

interface ConsentWindow extends Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  __tecnoriaLoadAnalytics?: () => void;
  __tecnoriaAnalyticsLoaded?: boolean;
}

/**
 * Single source of truth for the GA4 measurement id in the TypeScript layer.
 * `apps/web/src/index.html` carries the same literal inside its inline loader
 * (it cannot import ES modules); `scripts/tests/consent.test.mjs` asserts the
 * two are identical, so they cannot drift silently.
 */
export const GA_MEASUREMENT_ID = "G-LE6ETPWL23";
/** gtag's documented opt-out switch: `window['ga-disable-<id>'] = true`. */
export const GA_DISABLE_PREFIX = "ga-disable-";

/**
 * Single source of truth for the visitor's consent decision.
 *
 * SSR-safe: nothing touches `window`, `document.cookie` or `localStorage`
 * during server render; the stored decision is resolved after hydration.
 */
@Injectable({ providedIn: "root" })
export class ConsentService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly state = signal<ConsentRecord | null>(null);
  private readonly resolvedSignal = signal(false);
  private readonly openRequests = signal(0);
  /** Set on reject/withdraw so a stale grant cannot resurrect analytics. */
  private suppressed = false;

  readonly decision = this.state.asReadonly();
  readonly resolved = this.resolvedSignal.asReadonly();
  /** Increments when any "Configuración de cookies" control asks to reopen. */
  readonly openRequest = this.openRequests.asReadonly();

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      const stored = this.readStored();
      this.state.set(stored);
      this.suppressed = stored?.analytics !== true;
      if (stored) {
        this.applySignals(stored);
      }
      this.resolvedSignal.set(true);
    });
  }

  isAnalyticsGranted(): boolean {
    return isAnalyticsGranted(this.state());
  }

  /** "Aceptar": analytics only. Advertising is never granted. */
  acceptAnalytics(): void {
    this.commit(createConsentRecord(true, false));
  }

  /**
   * "Configurar" → save the explicit selection. There is no advertising
   * category any more (the site serves no ads), so `marketing` is always false.
   */
  saveSelection(analytics: boolean): void {
    this.commit(createConsentRecord(analytics === true, false));
  }

  /** "Rechazar": nothing optional is granted. */
  rejectAll(): void {
    this.commit(createConsentRecord(false, false));
  }

  /**
   * Withdrawal: forget the decision, deny every signal, delete analytics
   * cookies, set gtag's documented opt-out switch and block the loader for the
   * rest of this page session.
   */
  withdraw(): void {
    this.suppressed = true;
    this.clearStored();
    this.state.set(null);
    this.resolvedSignal.set(true);
    this.setGoogleAnalyticsDisabled(true);
    this.applySignals(null);
    this.clearAnalyticsCookies();
  }

  /** Asks the consent UI to reopen the preferences dialog (any route). */
  requestPreferences(): void {
    this.openRequests.update((count) => count + 1);
  }

  /** Loads gtag/js once, and only when analytics consent is in force. */
  ensureAnalyticsLoaded(): void {
    if (this.suppressed || !isPlatformBrowser(this.platformId)) {
      return;
    }
    if (!this.isAnalyticsGranted()) {
      return;
    }

    const win = this.document.defaultView as ConsentWindow | null;
    if (!win || win.__tecnoriaAnalyticsLoaded === true) {
      return;
    }

    win.__tecnoriaLoadAnalytics?.();
  }

  private commit(record: ConsentRecord): void {
    this.suppressed = record.analytics !== true;
    this.write(record);
    this.state.set(record);
    this.resolvedSignal.set(true);
    this.applySignals(record);

    // F-1: rejecting — or saving a selection without analytics — after a
    // previous acceptance is substantively a withdrawal. Purge the measurement
    // cookies here, not only on the explicit "Retirar consentimiento" path,
    // otherwise _ga/_ga_<id> survive for up to two years.
    if (shouldPurgeAnalyticsCookies(record)) {
      this.clearAnalyticsCookies();
    }
  }

  private applySignals(record: ConsentRecord | null): void {
    const win = this.document.defaultView as ConsentWindow | null;
    const gtag = win?.gtag;

    if (typeof gtag === "function") {
      try {
        gtag("consent", "update", consentSignals(record));
      } catch {
        // A broken tag must never break the page.
      }
    }

    // Defence in depth: with the opt-out switch set, any future dispatch that
    // bypasses the service still cannot reach Google. Cleared again when the
    // visitor grants analytics, so a re-accept within the session works.
    this.setGoogleAnalyticsDisabled(record?.analytics !== true);

    if (record?.analytics === true) {
      this.ensureAnalyticsLoaded();
    }
  }

  /** Sets `window['ga-disable-<id>']`, gtag's documented opt-out switch. */
  private setGoogleAnalyticsDisabled(disabled: boolean): void {
    const win = this.document.defaultView;
    if (!win) {
      return;
    }

    try {
      (win as unknown as Record<string, unknown>)[
        `${GA_DISABLE_PREFIX}${GA_MEASUREMENT_ID}`
      ] = disabled;
    } catch {
      // A frozen/blocked window must never break consent handling.
    }
  }

  private get storage(): Storage | null {
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }

  private readStored(): ConsentRecord | null {
    const storage = this.storage;
    if (!storage) {
      return null;
    }

    try {
      return parseConsentRecord(storage.getItem(CONSENT_STORAGE_KEY));
    } catch {
      return null;
    }
  }

  private write(record: ConsentRecord): void {
    const storage = this.storage;
    if (!storage) {
      return;
    }

    try {
      storage.setItem(CONSENT_STORAGE_KEY, serializeConsentRecord(record));
    } catch {
      // Private mode / quota: the in-memory decision still applies.
    }
  }

  private clearStored(): void {
    const storage = this.storage;
    if (!storage) {
      return;
    }

    try {
      storage.removeItem(CONSENT_STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  private clearAnalyticsCookies(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const doc = this.document;
    const win = doc.defaultView;
    if (!win) {
      return;
    }

    const names = new Set<string>(ANALYTICS_COOKIE_NAMES);
    for (const part of (doc.cookie || "").split(";")) {
      const name = part.split("=")[0]?.trim();
      if (name && isAnalyticsCookieName(name)) {
        names.add(name);
      }
    }

    // Google sets its measurement cookies on path=/ (the document root), so
    // expiry is attempted for that path only — once per domain variant (bare
    // host and registrable domain, see cookieDomainsForHost). Cookies set on
    // arbitrary sub-paths are NOT covered and nothing here claims they are.
    const domains = cookieDomainsForHost(win.location.hostname);
    for (const deletion of analyticsCookieDeletionStrings(names, domains)) {
      doc.cookie = deletion;
    }
  }
}
