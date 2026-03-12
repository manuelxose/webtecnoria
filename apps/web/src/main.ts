import { enableProdMode } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";

import { AppComponent } from "./app/app.component";
import { config } from "./app/app.config.browser";
import { environment } from "./environments/environment";

if (environment.production) {
  enableProdMode();
}

function showConsoleGreeting(): void {
  if (!environment.production || typeof window === "undefined") {
    return;
  }

  console.log(
    "%cTECNoRIA%cSYSTEM SIGNAL",
    "background: #0b1020; color: #f5f7fb; padding: 8px 12px; border: 1px solid #1368ff; border-right: 0; border-radius: 999px 0 0 999px; font: 700 12px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; letter-spacing: 0.18em;",
    "background: #dffcf7; color: #0b1020; padding: 8px 12px; border: 1px solid #18b4a7; border-left: 0; border-radius: 0 999px 999px 0; font: 700 12px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; letter-spacing: 0.18em;"
  );
  console.log(
    "%cSoftware a medida, automatización, IA aplicada y chatbots conectados a negocio.",
    "color: #0b1020; font: 700 16px/1.45 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; margin-top: 8px;"
  );
  console.log(
    "%cSi has abierto DevTools, probablemente estas evaluando una decision importante.",
    "color: #51607a; font: 600 12px/1.6 'Manrope', ui-sans-serif, system-ui, sans-serif;"
  );

  if (typeof console.table === "function") {
    console.table([
      {
        perfil: "Proyecto",
        encaje: "Software, automatización, IA o chatbots con foco en operativa y conversión",
        acceso: "https://tecnoriasl.com/contacto",
      },
      {
        perfil: "Talento",
        encaje: "Producto, frontend, backend, IA o sistemas con criterio tecnico real",
        acceso: "oficina@tecnoriasl.com + GitHub / portfolio",
      },
    ]);
  }

  console.log(
    "%cNo perseguimos ruido. Construimos sistemas que tienen que rendir cuando ya no mira nadie.",
    "color: #1368ff; font: 600 12px/1.6 'Manrope', ui-sans-serif, system-ui, sans-serif;"
  );
}

document.addEventListener("DOMContentLoaded", () => {
  bootstrapApplication(AppComponent, config)
    .then(() => showConsoleGreeting())
    .catch((err) => console.error(err));
});
