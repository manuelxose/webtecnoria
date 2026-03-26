import { CommonModule, DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from "@angular/core";
import { RouterModule } from "@angular/router";
import { environment } from "src/environments/environment";

type WidgetRuntimeConfig = {
  siteKey: string;
  apiBase: string;
  widgetBaseUrl: string;
  widgetOrigin: string;
  assetVersion?: string;
  brandLabel?: string;
  sourceSite?: string;
  contactUrl?: string;
};

type WidgetWindow = Window & typeof globalThis & {
  TecnoriaChatWidgetConfig?: WidgetRuntimeConfig;
  TalkarisWidgetConfig?: WidgetRuntimeConfig;
  ChatPortalWidgetConfig?: WidgetRuntimeConfig;
  __talkarisWidgetRuntime?: { destroy?: () => void };
};

type WidgetEnvironment = typeof environment & {
  chatWidgetBaseUrl?: string;
  chatWidgetOrigin?: string;
  chatWidgetAssetVersion?: string;
};

@Component({
  selector: "app-chat-widget-embed",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside
      *ngIf="widgetState !== 'ready' && shouldRenderFallback"
      class="chat-fallback"
      [attr.data-state]="widgetState"
      aria-live="polite"
    >
      <div class="chat-fallback__status" *ngIf="widgetState === 'loading'">
        <span class="chat-fallback__pulse" aria-hidden="true"></span>
        <div>
          <span class="chat-fallback__eyebrow">Asistente conversacional</span>
          <strong>Cargando acceso al chat</strong>
        </div>
      </div>

      <ng-container *ngIf="widgetState === 'error'">
        <span class="chat-fallback__eyebrow">Asistente conversacional</span>
        <strong>El chatbot no ha cargado todavia.</strong>
        <p>
          Puedes reintentar la carga o escribirnos directamente mientras
          recuperamos el acceso conversacional.
        </p>
      </ng-container>

      <div class="chat-fallback__actions" *ngIf="widgetState !== 'idle'">
        <button class="button button-primary" type="button" (click)="retryLoad()">
          {{ widgetState === "loading" ? "Reintentar carga" : "Reintentar chat" }}
        </button>
        <a class="button button-secondary" routerLink="/contacto">Ir a contacto</a>
      </div>
    </aside>
  `,
})
export class ChatWidgetEmbedComponent implements OnInit, OnDestroy {
  private readonly scriptId = "tecnoria-chat-widget-loader";
  private readonly iframeSelector = [
    'iframe[title="Tecnoria Chat Widget"]',
    'iframe[title="Talkaris Widget"]',
    'iframe[aria-label="Tecnoria Chat Widget"]',
    'iframe[aria-label="Talkaris Widget"]',
  ].join(", ");
  private readonly runtimeEnvironment = environment as WidgetEnvironment;
  private observer?: MutationObserver;
  private readinessTimeoutId?: number;

  widgetState: "idle" | "loading" | "ready" | "error" = "idle";
  shouldRenderFallback = false;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId) || !this.runtimeEnvironment.chatWidgetEnabled) {
      return;
    }

    this.mountWidget();
  }

  ngOnDestroy(): void {
    this.clearTimers();
    this.observer?.disconnect();
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

  retryLoad(): void {
    this.cleanupWidgetArtifacts();
    this.mountWidget();
  }

  private mountWidget(): void {
    const widgetBaseUrl = this.resolveWidgetBaseUrl();
    if (!widgetBaseUrl) {
      this.widgetState = "error";
      this.shouldRenderFallback = true;
      return;
    }

    this.cleanupWidgetArtifacts(false);
    this.widgetState = "loading";
    this.shouldRenderFallback = true;
    this.configureWidgetRuntime(widgetBaseUrl);
    this.observeWidgetFrame();

    const script = this.document.createElement("script");
    script.id = this.scriptId;
    script.async = true;
    const embedUrl = new URL("embed.js", widgetBaseUrl);
    if (this.runtimeEnvironment.chatWidgetAssetVersion) {
      embedUrl.searchParams.set("v", this.runtimeEnvironment.chatWidgetAssetVersion);
    }
    script.src = embedUrl.toString();
    script.dataset["siteKey"] = this.runtimeEnvironment.chatWidgetSiteKey;
    script.dataset["apiBase"] = this.runtimeEnvironment.chatWidgetApiBaseUrl;
    script.dataset["widgetBaseUrl"] = widgetBaseUrl;
    script.dataset["widgetOrigin"] = widgetBaseUrl;
    script.dataset["assetVersion"] = this.runtimeEnvironment.chatWidgetAssetVersion || "";
    script.dataset["brandLabel"] = "TecnoRia";
    script.dataset["sourceSite"] = this.document.location.origin;
    script.dataset["contactUrl"] = new URL("/contacto", this.document.baseURI).toString();
    script.onload = () => this.markReadyIfFrameExists();
    script.onerror = () => this.handleWidgetError();

    this.clearTimers();
    this.readinessTimeoutId = this.document.defaultView?.setTimeout(() => {
      this.handleWidgetError();
    }, 4500);

    this.document.body.appendChild(script);
    this.markReadyIfFrameExists();
  }

  private configureWidgetRuntime(widgetBaseUrl: string): void {
    const win = this.document.defaultView as WidgetWindow | null;
    if (!win) {
      return;
    }

    const config: WidgetRuntimeConfig = {
      siteKey: this.runtimeEnvironment.chatWidgetSiteKey,
      apiBase: this.runtimeEnvironment.chatWidgetApiBaseUrl,
      widgetBaseUrl,
      widgetOrigin: widgetBaseUrl,
      assetVersion: this.runtimeEnvironment.chatWidgetAssetVersion,
      brandLabel: "TecnoRia",
      sourceSite: this.document.location.origin,
      contactUrl: new URL("/contacto", this.document.baseURI).toString(),
    };

    win.TecnoriaChatWidgetConfig = config;
    win.TalkarisWidgetConfig = config;
    win.ChatPortalWidgetConfig = config;
  }

  private observeWidgetFrame(): void {
    this.observer?.disconnect();

    this.observer = new MutationObserver(() => {
      this.markReadyIfFrameExists();
    });

    this.observer.observe(this.document.body, {
      childList: true,
      subtree: true,
    });
  }

  private markReadyIfFrameExists(): void {
    if (!this.findWidgetFrame()) {
      return;
    }

    this.widgetState = "ready";
    this.shouldRenderFallback = false;
    this.clearTimers();
    this.observer?.disconnect();
  }

  private handleWidgetError(): void {
    if (this.widgetState === "ready") {
      return;
    }

    this.widgetState = "error";
    this.shouldRenderFallback = true;
    this.cleanupWidgetArtifacts(false);
  }

  private cleanupWidgetArtifacts(resetState = true): void {
    this.clearTimers();
    this.observer?.disconnect();

    (this.document.defaultView as WidgetWindow | null)?.__talkarisWidgetRuntime?.destroy?.();
    this.document.querySelectorAll(`#${this.scriptId}`).forEach((node) => node.remove());
    this.document.querySelectorAll(this.iframeSelector).forEach((node) => node.remove());

    if (resetState) {
      this.widgetState = "idle";
      this.shouldRenderFallback = false;
    }
  }

  private clearTimers(): void {
    if (this.readinessTimeoutId && this.document.defaultView) {
      this.document.defaultView.clearTimeout(this.readinessTimeoutId);
    }

    this.readinessTimeoutId = undefined;
  }

  private findWidgetFrame(): HTMLIFrameElement | null {
    return this.document.querySelector<HTMLIFrameElement>(this.iframeSelector);
  }
}
