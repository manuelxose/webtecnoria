import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import type { AuthUser } from "src/app/domain/repositories/auth.repository";

@Injectable({ providedIn: "root" })
export class PrivateNavigationService {
  private readonly isBrowser: boolean;

  constructor(
    private readonly router: Router,
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  getReturnUrl(route: ActivatedRoute): string | null {
    return this.normalizeInternalUrl(route.snapshot.queryParamMap.get("returnUrl"));
  }

  getPostLoginUrl(route: ActivatedRoute, user?: Pick<AuthUser, "role"> | null): string {
    const returnUrl = this.getReturnUrl(route);
    if (returnUrl && user && this.canAccessProtectedPath(returnUrl, user.role)) {
      return returnUrl;
    }

    return this.getDefaultPrivateUrl(user?.role);
  }

  getPublicFallback(route: ActivatedRoute, fallback = "/"): string {
    const returnUrl = this.getReturnUrl(route);
    if (returnUrl && !this.isProtectedPath(returnUrl)) {
      return returnUrl;
    }

    return fallback;
  }

  async goBack(route?: ActivatedRoute, fallback = "/"): Promise<void> {
    const safeFallback = route ? this.getPublicFallback(route, fallback) : fallback;

    if (this.isBrowser && this.canUseHistoryBack()) {
      this.document.defaultView?.history.back();
      return;
    }

    await this.router.navigateByUrl(safeFallback);
  }

  private normalizeInternalUrl(url: string | null | undefined): string | null {
    const value = String(url ?? "").trim();
    if (!value || !value.startsWith("/") || value.startsWith("//")) {
      return null;
    }

    return value;
  }

  private isProtectedPath(url: string): boolean {
    return (
      url === "/dashboard"
      || url.startsWith("/dashboard/")
      || url === "/portal"
      || url.startsWith("/portal/")
      || url.startsWith("/auth-")
      || url.startsWith("/acceso-restringido")
    );
  }

  private canAccessProtectedPath(url: string, role: AuthUser["role"]): boolean {
    if (url === "/dashboard" || url.startsWith("/dashboard/")) {
      return role === "admin" || role === "editor";
    }

    if (url === "/portal" || url.startsWith("/portal/")) {
      return role === "client";
    }

    return false;
  }

  private getDefaultPrivateUrl(role: AuthUser["role"] | undefined): string {
    if (role === "client") {
      return "/portal/dashboard";
    }

    if (role === "viewer") {
      return "/acceso-restringido";
    }

    return "/dashboard";
  }

  private canUseHistoryBack(): boolean {
    if (!this.isBrowser || !this.document.defaultView) {
      return false;
    }

    const win = this.document.defaultView;
    if (win.history.length <= 1) {
      return false;
    }

    const referrer = this.document.referrer;
    if (!referrer) {
      return false;
    }

    try {
      return new URL(referrer, this.document.baseURI).origin === win.location.origin;
    } catch {
      return false;
    }
  }
}
