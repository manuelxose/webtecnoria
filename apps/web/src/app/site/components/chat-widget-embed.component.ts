import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from "@angular/core";
import { environment } from "src/environments/environment";

type WidgetWindow = Window & typeof globalThis & {
  TecnoriaChatWidgetConfig?: {
    siteKey: string;
    apiBase: string;
    widgetOrigin: string;
  };
};

@Component({
  selector: "app-chat-widget-embed",
  standalone: true,
  template: "",
})
export class ChatWidgetEmbedComponent implements OnInit, OnDestroy {
  private readonly scriptId = "tecnoria-chat-widget-loader";

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId) || !environment.chatWidgetEnabled) {
      return;
    }

    const win = this.document.defaultView as WidgetWindow | null;
    if (win) {
      win.TecnoriaChatWidgetConfig = {
        siteKey: environment.chatWidgetSiteKey,
        apiBase: environment.chatWidgetApiBaseUrl,
        widgetOrigin: environment.chatWidgetOrigin,
      };
    }

    if (this.document.getElementById(this.scriptId)) {
      return;
    }

    const script = this.document.createElement("script");
    script.id = this.scriptId;
    script.async = true;
    script.src = `${environment.chatWidgetOrigin}/embed.js`;
    script.dataset["siteKey"] = environment.chatWidgetSiteKey;
    script.dataset["apiBase"] = environment.chatWidgetApiBaseUrl;
    script.dataset["widgetOrigin"] = environment.chatWidgetOrigin;
    this.document.body.appendChild(script);
  }

  ngOnDestroy(): void {
    // SiteLayout lives for the full public session; keep the loader mounted.
  }
}
