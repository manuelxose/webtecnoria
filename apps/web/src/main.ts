import { enableProdMode } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";

import { AppComponent } from "./app/app.component";
import { config } from "./app/app.config.browser";
import { environment } from "./environments/environment";

if (environment.production) {
  enableProdMode();
}

// bootstrapApplication with browser-specific providers (includes animations)
document.addEventListener("DOMContentLoaded", () => {
  bootstrapApplication(AppComponent, config).catch((err) => console.error(err));
});
