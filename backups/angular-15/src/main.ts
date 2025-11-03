import { enableProdMode } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";

import { AppComponent } from "./app/app.component";
import { appProviders } from "./app/app.config";
import { environment } from "./environments/environment";

if (environment.production) {
  enableProdMode();
}

// bootstrapApplication with functional providers
document.addEventListener("DOMContentLoaded", () => {
  bootstrapApplication(AppComponent, { providers: appProviders }).catch((err) =>
    console.error(err)
  );
});
