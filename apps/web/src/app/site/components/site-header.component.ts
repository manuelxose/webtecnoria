import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import {
  primaryNavigation,
  SITE_NAME,
} from "../content/site-content";

@Component({
  selector: "app-site-header",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="site-header">
      <div class="site-container header-bar">
        <a class="brand" routerLink="/" aria-label="Ir a la home de TecnoRia">
          <span class="brand-mark">TR</span>
          <span class="brand-copy">
            <strong>{{ siteName }}</strong>
            <small>Software, automatizacion e IA</small>
          </span>
        </a>

        <nav class="desktop-nav" aria-label="Navegacion principal">
          <a
            *ngFor="let item of navigation"
            [routerLink]="item.path"
            routerLinkActive="is-active"
            [routerLinkActiveOptions]="{ exact: item.path === '/' }"
          >
            {{ item.label }}
          </a>
        </nav>

        <div class="header-actions">
          <a class="button button-secondary hide-mobile" href="tel:+34682047802">
            Llamar ahora
          </a>
          <a class="button button-primary" routerLink="/contacto">
            Solicitar diagnostico
          </a>
          <button
            class="menu-toggle"
            type="button"
            [attr.aria-expanded]="menuOpen"
            aria-label="Abrir menu"
            (click)="toggleMenu()"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <div class="mobile-panel" [class.is-open]="menuOpen">
        <nav class="mobile-nav site-container" aria-label="Menu movil">
          <a
            *ngFor="let item of navigation"
            [routerLink]="item.path"
            routerLinkActive="is-active"
            [routerLinkActiveOptions]="{ exact: item.path === '/' }"
          >
            {{ item.label }}
          </a>
          <div class="mobile-nav-actions">
            <a class="button button-primary" routerLink="/contacto">
              Pedir presupuesto
            </a>
            <a class="button button-secondary" href="mailto:oficina@tecnoriasl.com">
              Escribir email
            </a>
          </div>
        </nav>
      </div>
    </header>
  `,
})
export class SiteHeaderComponent {
  navigation = primaryNavigation;
  menuOpen = false;
  siteName = SITE_NAME;

  constructor(private readonly router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.menuOpen = false;
      }
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}
