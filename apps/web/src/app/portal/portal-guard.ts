import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import {
  AUTH_REPOSITORY,
  AuthRepository,
} from "src/app/domain/repositories/auth.repository";

export const portalGuard: CanActivateFn = async (_route, state) => {
  const router = inject(Router);
  const authRepository = inject<AuthRepository>(AUTH_REPOSITORY);
  const user = await authRepository.me();

  if (!user) {
    return router.createUrlTree(["/portal"], {
      queryParams: { returnUrl: state.url },
    });
  }

  if (user.role === "client") {
    return true;
  }

  if (user.role === "admin" || user.role === "editor") {
    return router.createUrlTree(["/dashboard"]);
  }

  return router.createUrlTree(["/acceso-restringido"], {
    queryParams: { returnUrl: state.url, reason: user.role },
  });
};
