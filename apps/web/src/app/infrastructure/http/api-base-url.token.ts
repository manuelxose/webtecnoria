import { isPlatformBrowser } from "@angular/common";
import { inject, InjectionToken, PLATFORM_ID } from "@angular/core";
import { REQUEST } from "@angular/core";
import { environment } from "src/environments/environment";

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/$/, "");
}

export const API_BASE_URL = new InjectionToken<string>("API_BASE_URL", {
  providedIn: "root",
  factory: () => {
    const platformId = inject(PLATFORM_ID);
    const request = inject(REQUEST, { optional: true });
    const configuredPublicUrl = environment.apiBaseUrl?.trim() ?? "";

    if (isPlatformBrowser(platformId) && !request) {
      return normalizeBaseUrl(configuredPublicUrl);
    }

    const internalUrl =
      typeof process !== "undefined" ? process.env["API_INTERNAL_URL"]?.trim() : "";

    return normalizeBaseUrl(
      internalUrl || configuredPublicUrl || "http://127.0.0.1:3001"
    );
  },
});
