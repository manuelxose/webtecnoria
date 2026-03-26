import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ContactFormComponent } from "../components/contact-form.component";
import { getOwnProductBySlug } from "../content/site-content";
import { RevealDirective } from "../directives/reveal.directive";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-talkaris-page",
  standalone: true,
  imports: [CommonModule, RouterModule, ContactFormComponent, RevealDirective],
  styleUrls: ["./talkaris-page.component.css"],
  template: `
    <ng-container *ngIf="product as p">
      <div class="product-page product-page--talkaris talkaris-page">
        <section class="page-hero section product-hero talkaris-hero">
          <div class="product-hero__orb talkaris-hero__orb talkaris-hero__orb--primary"></div>
          <div class="product-hero__orb talkaris-hero__orb talkaris-hero__orb--secondary"></div>

          <div class="site-container page-hero__split page-hero__split--visual product-hero__shell">
            <div class="page-hero__copy">
              <span class="product-card__badge product-hero__badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>
                {{ p.badge }}
              </span>
              <h1 class="product-hero__title">{{ p.heroHeadline }}</h1>
              <p class="lead product-hero__lead">{{ p.heroCopy }}</p>

              <div class="product-stat-grid">
                <div *ngFor="let stat of p.stats" class="stat-highlight talkaris-stat">
                  <span class="stat-highlight__value">{{ stat.value }}</span>
                  <span class="stat-highlight__label">{{ stat.label }}</span>
                </div>
              </div>

              <div class="hero-actions">
                <a class="button button-primary" [routerLink]="p.ctaPath">{{ p.ctaLabel }}</a>
                <a class="button button-secondary" routerLink="/servicios/desarrollo-chatbots-empresas">
                  Ver servicio de chatbots
                </a>
              </div>
            </div>

            <div class="page-hero__aside">
              <div class="product-console talkaris-console">
                <div class="product-console__head product-console__head--start">
                  <span class="status-dot status-dot--accent talkaris-console__dot"></span>
                  <span class="product-console__label">Talkaris · Chat en vivo</span>
                </div>

                <div class="product-console__stream">
                  <div class="product-console__bubble product-console__bubble--brand">¿En qué puedo ayudarte hoy?</div>
                  <div class="product-console__bubble product-console__bubble--neutral">Necesito información sobre el plan Enterprise.</div>
                  <div class="product-console__bubble product-console__bubble--brand">Puedo explicarte planes, integraciones y tiempos de despliegue.</div>
                </div>

                <div class="product-console__metrics">
                  <div *ngFor="let stat of p.stats.slice(0, 4)" class="product-console__metric">
                    <div class="product-console__metric-value">{{ stat.value }}</div>
                    <div class="product-console__metric-label">{{ stat.label }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="section talkaris-section">
          <div class="site-container">
            <div class="section-head reveal" appReveal>
              <span class="eyebrow">Capacidades</span>
              <h2>Todo lo que necesitas para desplegar chatbots enterprise.</h2>
              <p class="talkaris-copy">
                Talkaris está diseñado para integrarse en la operativa real de
                la empresa, no como un widget de FAQ genérico sino como una capa
                conversacional conectada a sistemas, datos y procesos.
              </p>
            </div>

            <div class="feature-grid talkaris-feature-grid">
              <div
                class="feature-item reveal"
                appReveal
                [class]="'feature-item reveal reveal-delay-' + (i + 1)"
                *ngFor="let feat of p.features; let i = index"
              >
                <div class="feature-item__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path [attr.d]="feat.icon"/>
                  </svg>
                </div>
                <div class="feature-item__title">{{ feat.title }}</div>
                <div class="feature-item__desc">{{ feat.description }}</div>
              </div>
            </div>
          </div>
        </section>

        <section class="section section-alt talkaris-section">
          <div class="site-container">
            <div class="section-head reveal" appReveal>
              <span class="eyebrow">Casos de uso</span>
              <h2>Talkaris en la práctica: cómo lo usan las empresas.</h2>
            </div>

            <div class="product-usecases talkaris-usecases">
              <article class="surface-card glass-card talkaris-usecase talkaris-usecase--featured reveal" appReveal>
                <span class="chip chip-soft product-chip">{{ p.useCases[0].badge }}</span>
                <h3>{{ p.useCases[0].title }}</h3>
                <p>{{ p.useCases[0].description }}</p>
              </article>

              <div class="product-usecases__stack">
                <article
                  class="bento-card talkaris-usecase reveal"
                  appReveal
                  [class]="'bento-card talkaris-usecase reveal reveal-delay-' + (i + 2)"
                  *ngFor="let uc of p.useCases.slice(1); let i = index"
                >
                  <span class="chip chip-soft product-chip">{{ uc.badge }}</span>
                  <h3>{{ uc.title }}</h3>
                  <p>{{ uc.description }}</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section class="section talkaris-section">
          <div class="site-container product-stack">
            <div class="reveal" appReveal>
              <span class="eyebrow">Stack tecnológico</span>
              <h2>Construido con tecnología de producción real.</h2>
            </div>

            <div class="product-tech reveal" appReveal>
              <span class="tech-tag talkaris-tech-tag" *ngFor="let tech of p.techStack">{{ tech }}</span>
            </div>
          </div>
        </section>

        <section class="section section-dark">
          <div class="site-container final-cta final-cta--elevated reveal" appReveal>
            <div>
              <span class="eyebrow talkaris-cta__eyebrow">Solicitar demo</span>
              <h2>¿Quieres ver Talkaris en acción con tu caso de uso?</h2>
              <p>
                Agenda una sesión de 30 minutos. Configuramos un bot de prueba
                con tu base de conocimiento real y lo probamos juntos.
              </p>
            </div>
            <div class="cta-actions">
              <a class="button button-primary" [routerLink]="p.ctaPath">{{ p.ctaLabel }}</a>
              <a class="button button-secondary" routerLink="/productos/auctorio">
                Ver Auctorio
              </a>
            </div>
          </div>
        </section>

        <app-contact-form></app-contact-form>
      </div>
    </ng-container>
  `,
})
export class TalkarisPageComponent implements OnInit {
  product = getOwnProductBySlug("talkaris");

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    const p = this.product;
    if (!p) return;

    this.seo.update({
      title: p.seo.title,
      description: p.seo.description,
      path: p.seo.path,
      imagePath: p.image.src,
      imageAlt: p.image.alt,
      keywords: p.seo.keywords,
      schemas: [
        this.seo.createProductSchema({
          name: p.name,
          description: p.seo.description,
          url: `https://tecnoriasl.com${p.seo.path}`,
          image: p.image.src,
          category: "CommunicationApplication",
        }),
        this.seo.createBreadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Productos", path: "/productos/talkaris" },
          { name: p.name, path: p.seo.path },
        ]),
      ],
    });
  }
}
