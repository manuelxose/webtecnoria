import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";
import { ChatWidgetEmbedComponent } from "./chat-widget-embed.component";
import { SiteFooterComponent } from "./site-footer.component";
import { SiteHeaderComponent } from "./site-header.component";

@Component({
  selector: "app-site-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    SiteHeaderComponent,
    SiteFooterComponent,
    ChatWidgetEmbedComponent,
  ],
  template: `
    <a class="skip-link" href="#main-content">Saltar al contenido</a>
    <div class="site-shell">
      <app-site-header></app-site-header>

      <main id="main-content" class="site-main">
        <router-outlet></router-outlet>
      </main>

      <app-site-footer></app-site-footer>
      <app-chat-widget-embed></app-chat-widget-embed>

      <div class="floating-bar" aria-label="Acceso rapido a contacto">
        <div class="floating-bar__copy">
          <strong>Diagnostico inicial</strong>
          <span>Para software, chatbots o automatizacion</span>
        </div>
        <div class="floating-bar__actions">
          <a class="button button-ghost" href="tel:+34682047802">682 04 78 02</a>
          <a class="button button-primary" routerLink="/contacto">Pedir reunion</a>
        </div>
      </div>
    </div>
  `,
})
export class SiteLayoutComponent {}
