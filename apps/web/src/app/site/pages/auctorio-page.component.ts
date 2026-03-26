import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { buildAuctorioPublicLoginUrl } from "src/app/services/auctorio-links";
import { ContactFormComponent } from "../components/contact-form.component";
import { getOwnProductBySlug } from "../content/site-content";
import { RevealDirective } from "../directives/reveal.directive";
import { SeoService } from "../services/seo.service";

const WORKFLOW_STEPS = [
  { num: "01", title: "Brief", desc: "Define el tema, objetivo y tono. El sistema estructura la petición." },
  { num: "02", title: "Generación IA", desc: "DeepSeek redacta el contenido completo respetando la voz de marca configurada." },
  { num: "03", title: "Revisión", desc: "QA automático + revisión humana opcional antes de aprobar." },
  { num: "04", title: "Imagen", desc: "FLUX.2-pro genera la imagen destacada sincronizada con el contenido." },
  { num: "05", title: "Publicación", desc: "El publisher envía el artículo a uno o varios sitios simultáneamente." },
];

@Component({
  selector: "app-auctorio-page",
  standalone: true,
  imports: [CommonModule, RouterModule, ContactFormComponent, RevealDirective],
  styleUrls: ["./auctorio-page.component.css"],
  template: `
    <ng-container *ngIf="product as p">
      <div class="product-page product-page--auctorio auctorio-page">
        <section class="page-hero section product-hero auctorio-hero">
          <div class="product-hero__orb auctorio-hero__orb auctorio-hero__orb--primary"></div>
          <div class="product-hero__orb auctorio-hero__orb auctorio-hero__orb--secondary"></div>

          <div class="site-container page-hero__split page-hero__split--visual product-hero__shell">
            <div class="page-hero__copy">
              <span class="product-card__badge product-hero__badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>
                {{ p.badge }}
              </span>
              <h1 class="product-hero__title">{{ p.heroHeadline }}</h1>
              <p class="lead product-hero__lead">{{ p.heroCopy }}</p>

              <div class="product-stat-grid">
                <div *ngFor="let stat of p.stats" class="stat-highlight auctorio-stat">
                  <span class="stat-highlight__value">{{ stat.value }}</span>
                  <span class="stat-highlight__label">{{ stat.label }}</span>
                </div>
              </div>

              <div class="hero-actions">
                <a class="button button-primary auctorio-button" [routerLink]="p.ctaPath">
                  {{ p.ctaLabel }}
                </a>
                <a
                  class="button button-secondary"
                  [href]="studioLoginUrl"
                  target="_blank"
                  rel="noreferrer"
                >
                  Entrar al Studio
                </a>
              </div>
            </div>

            <div class="page-hero__aside">
              <div class="product-console auctorio-console">
                <div class="product-console__head">
                  <span class="product-console__label">Auctorio · Pipeline editorial</span>
                  <span class="status-dot status-dot--copper auctorio-console__dot"></span>
                </div>

                <div class="product-console__stack">
                  <div *ngFor="let step of workflowSteps" class="auctorio-console__step">
                    <span class="auctorio-console__step-num">{{ step.num }}</span>
                    <span class="auctorio-console__step-title">{{ step.title }}</span>
                  </div>
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

        <section class="section section-accent auctorio-section">
          <div class="site-container">
            <div class="section-head reveal" appReveal>
              <span class="eyebrow auctorio-eyebrow">El proceso</span>
              <h2>Del brief al artículo publicado en minutos.</h2>
              <p class="auctorio-copy">
                Auctorio elimina los cuellos de botella editoriales sin perder
                control de calidad.
              </p>
            </div>

            <div class="workflow-steps reveal auctorio-workflow" appReveal>
              <div class="workflow-step" *ngFor="let step of workflowSteps">
                <div class="workflow-step__num auctorio-workflow__num">{{ step.num }}</div>
                <div class="workflow-step__title">{{ step.title }}</div>
                <div class="workflow-step__desc">{{ step.desc }}</div>
              </div>
            </div>
          </div>
        </section>

        <section class="section auctorio-section">
          <div class="site-container">
            <div class="section-head reveal" appReveal>
              <span class="eyebrow">Funcionalidades</span>
              <h2>Una plataforma editorial completa, impulsada por IA.</h2>
            </div>

            <div class="feature-grid auctorio-feature-grid">
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

        <section class="section section-alt auctorio-section">
          <div class="site-container">
            <div class="section-head reveal" appReveal>
              <span class="eyebrow auctorio-eyebrow">Para quién es Auctorio</span>
              <h2>Diseñado para equipos que producen contenido a escala.</h2>
            </div>

            <div class="bento-grid bento-grid--2 auctorio-usecases">
              <article
                class="bento-card auctorio-usecase reveal"
                appReveal
                [class]="'bento-card auctorio-usecase reveal reveal-delay-' + (i + 1)"
                *ngFor="let uc of p.useCases; let i = index"
              >
                <span class="chip chip-soft product-chip">{{ uc.badge }}</span>
                <h3>{{ uc.title }}</h3>
                <p>{{ uc.description }}</p>
              </article>
            </div>
          </div>
        </section>

        <section class="section auctorio-section">
          <div class="site-container product-stack reveal" appReveal>
            <span class="eyebrow auctorio-eyebrow">Stack tecnológico</span>
            <h2>Construido sobre modelos frontier y arquitectura probada.</h2>
            <div class="product-tech">
              <span class="tech-tag auctorio-tech-tag" *ngFor="let tech of p.techStack">{{ tech }}</span>
            </div>
          </div>
        </section>

        <section class="section section-dark">
          <div class="site-container final-cta final-cta--elevated reveal" appReveal>
            <div>
              <span class="eyebrow auctorio-cta__eyebrow">Ver en acción</span>
              <h2>¿Quieres ver Auctorio trabajando con tu flujo editorial?</h2>
              <p>
                Preparamos una demo con un brief real tuyo. Ves el proceso
                completo de generación, QA y publicación en menos de 30 minutos.
              </p>
            </div>
            <div class="cta-actions">
              <a class="button button-primary auctorio-button" [routerLink]="p.ctaPath">
                {{ p.ctaLabel }}
              </a>
              <a class="button button-secondary" routerLink="/contacto">
                Hablar con el equipo
              </a>
            </div>
          </div>
        </section>

        <app-contact-form></app-contact-form>
      </div>
    </ng-container>
  `,
})
export class AuctorioPageComponent implements OnInit {
  product = getOwnProductBySlug("auctorio");
  workflowSteps = WORKFLOW_STEPS;
  readonly studioLoginUrl = buildAuctorioPublicLoginUrl();

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
          category: "BusinessApplication",
        }),
        this.seo.createBreadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Productos", path: "/productos/auctorio" },
          { name: p.name, path: p.seo.path },
        ]),
      ],
    });
  }
}
