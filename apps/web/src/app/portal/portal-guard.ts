import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { ApiPortalRepository } from "src/app/infrastructure/repositories/api/api-portal.repository";

export const portalGuard: CanActivateFn = async (_route, _state) => {
  const router = inject(Router);
  if (!ApiPortalRepository.hasToken()) {
    return router.createUrlTree(["/portal"]);
  }
  return true;
};
