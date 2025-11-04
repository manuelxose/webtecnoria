import { ApplicationConfig, mergeApplicationConfig } from "@angular/core";
import { provideServerRendering } from "@angular/platform-server";
import { provideClientHydration } from "@angular/platform-browser";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { appProviders } from "./app.config";

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideClientHydration(),
    provideNoopAnimations(), // Animations don't work on server
  ],
};

export const serverProviders = mergeApplicationConfig(
  { providers: appProviders },
  serverConfig
).providers;
