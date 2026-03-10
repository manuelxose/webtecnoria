import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import {
  footerLinks,
  services,
  SITE_EMAIL,
  SITE_NAME,
  SITE_PHONE_LABEL,
  SITE_PHONE,
  SITE_REGION,
} from "../content/site-content";

@Component({
  selector: "app-site-footer",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="site-footer">
      <div class="site-container footer-grid">
        <div class="footer-brand">
          <a class="brand" routerLink="/">
            <span class="brand-mark">TR</span>
            <span class="brand-copy">
              <strong>{{ siteName }}</strong>
              <small>Tecnologia que mueve negocio real</small>
            </span>
          </a>
          <p>
            Disenamos y desarrollamos soluciones para empresas y proyectos que
            necesitan digitalizar procesos, lanzar plataformas, desplegar
            chatbots o introducir IA con criterio.
          </p>
        </div>

        <div>
          <h3>Mapa rapido</h3>
          <ul class="footer-list">
            <li *ngFor="let item of quickLinks">
              <a [routerLink]="item.path">{{ item.label }}</a>
            </li>
            <li>
              <a routerLink="/auth-login">Acceso privado</a>
            </li>
          </ul>
        </div>

        <div>
          <h3>Servicios</h3>
          <ul class="footer-list">
            <li *ngFor="let service of serviceLinks">
              <a [routerLink]="service.seo.path">{{ service.shortName }}</a>
            </li>
          </ul>
        </div>

        <div>
          <h3>Contacto</h3>
          <ul class="footer-list">
            <li><a [href]="'tel:' + phone">{{ phoneLabel }}</a></li>
            <li><a [href]="'mailto:' + email">{{ email }}</a></li>
            <li>{{ region }}</li>
          </ul>
          <a class="button button-primary footer-button" routerLink="/contacto">
            Cuentanos tu caso
          </a>
        </div>
      </div>

      <div class="site-container footer-bar">
        <p>{{ siteName }} {{ year }}. Web pensada para captar demanda organica y convertirla en conversaciones de negocio.</p>
        <div class="footer-meta">
          <a routerLink="/auth-login">Acceso privado</a>
          <a routerLink="/politica-de-privacidad">Privacidad</a>
          <a routerLink="/mapa-web">Mapa web</a>
        </div>
      </div>
    </footer>
  `,
})
export class SiteFooterComponent {
  quickLinks = footerLinks;
  serviceLinks = services;
  email = SITE_EMAIL;
  phone = SITE_PHONE;
  phoneLabel = SITE_PHONE_LABEL;
  region = SITE_REGION;
  siteName = SITE_NAME;
  year = new Date().getFullYear();
}
