import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import {
  brandLogos,
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
  styleUrls: ["./site-footer.component.css"],
  template: `
    <footer class="site-footer">
      <div class="site-container site-footer__shell">
        <section class="site-footer__lead">
          <div class="site-footer__brand-block">
            <a class="brand-logo brand-logo--light" routerLink="/">
              <img
                class="brand-logo__asset"
                [src]="logos.lockup.light.src"
                [alt]="logos.lockup.light.alt"
                [attr.width]="logos.lockup.light.width"
                [attr.height]="logos.lockup.light.height"
              >
            </a>
            <p>
              Ingeniería de software, automatización e IA aplicada para
              empresas que necesitan una arquitectura sólida, una operativa
              más limpia y decisiones tecnológicas bien planteadas.
            </p>
            <div class="site-footer__signals">
              <span>Galicia · España</span>
              <span>Respuesta inicial &lt; 24h laborables</span>
              <span>Software, automatización e IA aplicada</span>
            </div>
          </div>

          <div class="site-footer__cta">
            <span class="panel-label">¿Hablamos?</span>
            <h2>Tu próximo sistema merece una base técnica que no se quede corta.</h2>
            <p>
              Cuéntanos el cuello de botella, la oportunidad o la idea que
              quieres convertir en producto. Te devolvemos criterio y un
              siguiente paso útil, sin rodeos.
            </p>
            <div class="site-footer__actions">
              <a class="button button-primary" routerLink="/contacto">Solicitar diagnóstico</a>
              <a class="button button-secondary" [href]="'tel:' + phone">{{ phoneLabel }}</a>
              <a class="button button-secondary" [href]="'mailto:' + email">{{ email }}</a>
            </div>
          </div>
        </section>

        <div class="footer-grid">
          <div>
            <h3>Mapa rápido</h3>
            <ul class="footer-list">
              <li *ngFor="let item of quickLinks">
                <a [routerLink]="item.path">{{ item.label }}</a>
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
          </div>

          <div>
            <h3>Accesos</h3>
            <ul class="footer-list">
              <li><a routerLink="/auth-login">Área privada</a></li>
              <li><a routerLink="/politica-de-privacidad">Política de privacidad</a></li>
              <li><a routerLink="/mapa-web">Mapa web</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bar">
          <p>
            © {{ year }} {{ siteName }}. Ingeniería de software, automatización
            e inteligencia artificial aplicada para empresas.
          </p>
          <div class="footer-meta">
            <a routerLink="/servicios">Servicios</a>
            <a routerLink="/blog">Recursos</a>
            <a routerLink="/contacto">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class SiteFooterComponent {
  logos = brandLogos;
  quickLinks = footerLinks;
  serviceLinks = services;
  email = SITE_EMAIL;
  phone = SITE_PHONE;
  phoneLabel = SITE_PHONE_LABEL;
  region = SITE_REGION;
  siteName = SITE_NAME;
  year = new Date().getFullYear();
}
