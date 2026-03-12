import { Inject, Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import {
  AUTH_REPOSITORY,
  AuthRepository,
} from "src/app/domain/repositories/auth.repository";

@Injectable({
  providedIn: "root",
})
export class AuthGuard {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    private readonly router: Router
  ) {}

  async canActivate(
    _next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const user = await this.authRepository.me();

    if (!user) {
      return this.router.createUrlTree(["/auth-login"], {
        queryParams: { returnUrl: state.url },
      });
    }

    if (user.role === "client") {
      return this.router.createUrlTree(["/portal/dashboard"]);
    }

    if (user.role !== "admin" && user.role !== "editor") {
      return this.router.createUrlTree(["/acceso-restringido"], {
        queryParams: { returnUrl: state.url, reason: user.role },
      });
    }

    return true;
  }
}
