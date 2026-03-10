// src/app/app.config.ts
import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideClientHydration } from "@angular/platform-browser";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { allIcons } from "angular-feather/icons";
import { FeatherModule } from "angular-feather";
import { routes } from "./app.routes";
import { repositoryProviders } from "./app.repository.providers";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    importProvidersFrom(FeatherModule.pick(allIcons)),
    ...repositoryProviders,
  ],
};
