import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from "@angular/core";
import { environment } from "src/environments/environment";

type WidgetWindow = Window & typeof globalThis & {
  TecnoriaChatWidgetConfig?: {
    siteKey: string;
    apiBase: string;
    widgetBaseUrl: string;
    widgetOrigin: string;
  };
};

type WidgetEnvironment = typeof environment & {
  chatWidgetBaseUrl?: string;
  chatWidgetOrigin?: string;
};

@Component({
  selector: "app-chat-widget-embed",
  standalone: true,
  template: "",
})
export class ChatWidgetEmbedComponent implements OnInit, OnDestroy {
  private readonly scriptId = "tecnoria-chat-widget-loader";
  private readonly runtimeEnvironment = environment as WidgetEnvironment;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId) || !this.runtimeEnvironment.chatWidgetEnabled) {
      return;
    }

    const widgetBaseUrl = this.resolveWidgetBaseUrl();
    if (!widgetBaseUrl) {
      return;
    }

    const win = this.document.defaultView as WidgetWindow | null;
    if (win) {
      win.TecnoriaChatWidgetConfig = {
        siteKey: this.runtimeEnvironment.chatWidgetSiteKey,
        apiBase: this.runtimeEnvironment.chatWidgetApiBaseUrl,
        widgetBaseUrl,
        widgetOrigin: widgetBaseUrl,
      };
    }

    if (this.document.getElementById(this.scriptId)) {
      return;
    }

    const script = this.document.createElement("script");
    script.id = this.scriptId;
    script.async = true;
    script.src = new URL("embed.js", widgetBaseUrl).toString();
    script.dataset["siteKey"] = this.runtimeEnvironment.chatWidgetSiteKey;
    script.dataset["apiBase"] = this.runtimeEnvironment.chatWidgetApiBaseUrl;
    script.dataset["widgetBaseUrl"] = widgetBaseUrl;
    script.dataset["widgetOrigin"] = widgetBaseUrl;
    this.document.body.appendChild(script);
  }

  ngOnDestroy(): void {
    // SiteLayout lives for the full public session; keep the loader mounted.
  }

  private resolveWidgetBaseUrl(): string {
    const configuredBaseUrl =
      this.runtimeEnvironment.chatWidgetBaseUrl
      ?? this.runtimeEnvironment.chatWidgetOrigin
      ?? "";

    if (!configuredBaseUrl) {
      return "";
    }

    const widgetUrl = new URL(configuredBaseUrl, this.document.baseURI);
    if (!widgetUrl.pathname.endsWith("/")) {
      widgetUrl.pathname = `${widgetUrl.pathname}/`;
    }
    return widgetUrl.toString();
  }
}
