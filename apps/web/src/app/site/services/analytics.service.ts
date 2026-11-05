import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { PUBLIC_PATHS } from "../seo-route-manifest";
import {
  LeadEventInput,
  dispatchGenerateLead,
  type GtagCommand,
} from "./analytics-events";
import { ConsentService } from "./consent.service";

interface AnalyticsWindow extends Window {
  dataLayer?: unknown[];
  gtag?: GtagCommand;
  __tecnoriaAnalyticsLoaded?: boolean;
}

/**
 * Consent-gated measurement. Every method returns early unless analytics
 * consent is in force and the gtag runtime is present.
 */
@Injectable({ providedIn: "root" })
export class AnalyticsService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly consent = inject(ConsentService);

  /**
   * Fires `generate_lead` with non-PII parameters only.
   * Call it exclusively after the lead has been confirmed by the API.
   */
  trackLead(input: LeadEventInput): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    if (!this.consent.isAnalyticsGranted()) {
      return false;
    }

    this.consent.ensureAnalyticsLoaded();

    const win = this.document.defaultView as AnalyticsWindow | null;
    if (win?.__tecnoriaAnalyticsLoaded !== true) {
      return false;
    }

    // The gtag command function is the documented delivery path; the dataLayer
    // is only the fallback inside dispatchGenerateLead. `PUBLIC_PATHS` is the
    // real allow-list, so source_page can only ever be a known public route.
    return dispatchGenerateLead({
      gtag: win.gtag,
      dataLayer: win.dataLayer,
      analyticsGranted: true,
      runtimeLoaded: true,
      input,
      allowedPaths: PUBLIC_PATHS,
    });
  }
}
