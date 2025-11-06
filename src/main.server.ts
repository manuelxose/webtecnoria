// src/main.server.ts
import { ApplicationRef } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { config } from "./app/app.config.server";

// Para CommonEngine, exportamos una función que acepta BootstrapContext
// El BootstrapContext contiene document y url que CommonEngine inyecta
const bootstrap = (context?: any): Promise<ApplicationRef> => {
  // Fusionamos el contexto del servidor (document, url) con nuestra configuración
  const mergedConfig = {
    ...config,
    ...(context || {}),
  };

  return bootstrapApplication(AppComponent, mergedConfig);
};

export default bootstrap;
