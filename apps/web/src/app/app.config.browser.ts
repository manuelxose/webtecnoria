import { ApplicationConfig, mergeApplicationConfig } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideClientHydration } from "@angular/platform-browser";
import { appConfig } from "./app.config";

const browserConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(), // Must be in both browser and server
    provideAnimations(), // Animations only for browser
  ],
};

export const config = mergeApplicationConfig(appConfig, browserConfig);
