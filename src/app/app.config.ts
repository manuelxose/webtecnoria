import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideHttpClient } from "@angular/common/http";

import { routes } from "./app.routes";

// For Angular 15 compatibility export a providers array (no explicit Provider[] type)
export const appProviders = [
  provideRouter(routes, withEnabledBlockingInitialNavigation()),
  provideAnimations(),
  provideHttpClient(),
];
