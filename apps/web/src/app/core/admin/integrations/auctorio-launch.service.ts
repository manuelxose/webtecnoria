import { isPlatformBrowser } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { API_BASE_URL } from "src/app/infrastructure/http/api-base-url.token";
import {
  type AuctorioWorkspaceSlug,
  buildAuctorioPublicLoginUrl,
} from "../../../services/auctorio-links";

type LaunchResponse = {
  redirectUrl: string;
};

@Injectable({ providedIn: "root" })
export class AuctorioLaunchService {
  private readonly baseUrl: string;
  private readonly isBrowser: boolean;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) baseUrl: string,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.isBrowser = isPlatformBrowser(platformId);
  }

  buildPublicLoginUrl(options?: {
    workspace?: AuctorioWorkspaceSlug;
    returnTo?: string;
  }): string {
    return buildAuctorioPublicLoginUrl(options);
  }

  async getStudioLaunchUrl(options?: {
    workspace?: AuctorioWorkspaceSlug;
    returnTo?: string;
  }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.post<LaunchResponse>(
          `${this.baseUrl}/api/v1/integrations/auctorio/launch`,
          {
            workspace: options?.workspace ?? "tecnoria",
            returnTo: options?.returnTo ?? "/studio/dashboard",
          },
          { withCredentials: true }
        )
      );

      return response.redirectUrl;
    } catch (error: any) {
      if (
        [404, 409, 500, 502, 503, 504].includes(Number(error?.status || 0)) ||
        error?.error?.code === "AUCTORIO_INTERACTIVE_LOGIN_REQUIRED"
      ) {
        return buildAuctorioPublicLoginUrl({
          workspace: options?.workspace ?? "tecnoria",
          returnTo: options?.returnTo ?? "/studio/dashboard",
        });
      }

      throw error;
    }
  }

  async openStudioInNewTab(options?: {
    workspace?: AuctorioWorkspaceSlug;
    returnTo?: string;
  }): Promise<void> {
    const redirectUrl = await this.getStudioLaunchUrl(options);

    if (!this.isBrowser) {
      return;
    }

    const popup = window.open("", "_blank");
    if (popup) {
      popup.opener = null;
      popup.location.replace(redirectUrl);
      return;
    }

    window.location.assign(redirectUrl);
  }
}
