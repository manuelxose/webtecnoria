import { enableProdMode } from "@angular/core";
import { bootstrapApplication, BootstrapContext } from "@angular/platform-browser";
import { environment } from "./environments/environment";

import { AppComponent } from "./app/app.component";
import { serverProviders } from "./app/app.config.server";

if (environment.production) {
  enableProdMode();
}

// Export a default bootstrap function used by server bundles
export default function bootstrap() {
  return bootstrapApplication(AppComponent, { providers: serverProviders }, context);
}

export { renderModule, renderModuleFactory } from "@angular/platform-server";
