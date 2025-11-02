import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppBrowserModule } from "./app/app.browser.module";
import { environment } from "./environments/environment";

if (environment.production) {
  enableProdMode();
}

// ✅ Solo una inicialización, dentro del evento DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  platformBrowserDynamic()
    .bootstrapModule(AppBrowserModule)
    .catch((err) => console.error(err));
});
