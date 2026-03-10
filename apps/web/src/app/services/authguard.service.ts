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
    _state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const user = await this.authRepository.me();

    if (!user) {
      return this.router.parseUrl("/auth-login");
    }

    if (user.role !== "admin" && user.role !== "editor") {
      return this.router.parseUrl("/acceso-restringido");
    }

    return true;
  }
}
