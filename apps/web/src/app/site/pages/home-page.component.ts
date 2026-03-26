import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ContactFormComponent } from "../components/contact-form.component";
import { ParticleCanvasComponent } from "../components/particle-canvas.component";
import {
  benefitBlocks,
  brandImages,
  caseStudies,
  challengeCards,
  featuredInsightSlugs,
  featuredShowcases,
  generalFaqs,
  getArticlesBySlugs,
  heroMetrics,
  homeProducts,
  processSteps,
  proofMoments,
  services,
  testimonials,
  trustStatements,
} from "../content/site-content";
import { RevealDirective } from "../directives/reveal.directive";
import { SeoService } from "../services/seo.service";

const SERVICE_ICONS: Record<string, string> = {
  software:
    "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  automation:
    "M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15",
  chatbots:
    "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-3 3v-3z",
  ai:
    "M9.75 17 9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1",
  saas:
    "M20 7l-8-4-8 4m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  consulting:
    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
};

const PROCESS_ICONS = [
  "M3 11l9-8 9 8M5 10v10h14V10M9 20v-6h6v6",
  "M4 6h16M4 12h10M4 18h7M17 10l3 2-3 2M14 18h6",
  "M12 3v18M7 8l5-5 5 5M7 16l5 5 5-5",
  "M5 19L19 5M9 5h10v10",
  "M4 12a8 8 0 0 1 13.657-5.657M20 12a8 8 0 0 1-13.657 5.657M17 3v4h-4M7 21v-4h4",
];

@Component({
  selector: "app-home-page",
  standalone: true,
  imports: [CommonModule, RouterModule, ContactFormComponent, RevealDirective, ParticleCanvasComponent],
  styleUrls: ["./home-page.component.css"],
  template: `
    <div class="home-page">
      <section class="hero-section hero-section--antigravity home-hero">
        <div class="hero-mesh-orb hero-mesh-orb--1 hero-mesh-orb--home-1"></div>
        <div class="hero-mesh-orb hero-mesh-orb--2 hero-mesh-orb--home-2"></div>
        <div class="hero-mesh-orb hero-mesh-orb--3 hero-mesh-orb--home-3"></div>

        <app-particle-canvas></app-particle-canvas>

        <div class="site-container hero-grid hero-grid--premium">
          <div class="hero-copy hero-copy--flagship home-hero__copy">
            <span class="eyebrow home-hero__eyebrow">Software · Automatización · IA</span>

            <h1>
              Operación precisa.<br>
              <span class="kinetic-word home-hero__accent">Software</span> que escala contigo.
            </h1>

            <p class="lead lead--hero home-hero__lead">
              Construimos el sistema técnico que tu empresa necesita para crecer
              con menos fricción: aplicaciones a medida, automatizaciones e IA
              aplicada conectadas sobre una arquitectura coherente.
            </p>

            <div class="hero-actions">
              <a class="button button-primary" routerLink="/contacto">
                Solicitar diagnóstico ejecutivo
              </a>
              <a class="button button-secondary" routerLink="/servicios">
                Ver servicios
              </a>
            </div>

            <div class="hero-status-bar">
              <article class="hero-status-item hero-status-item--dark home-hero__status" *ngFor="let metric of metrics">
                <strong>{{ metric.value }}</strong>
                <span>{{ metric.label }}</span>
              </article>
            </div>
          </div>

          <div class="hero-visual-stack">
            <div class="glass-card glass-card--dark hero-stats-panel hero-stats-panel--dark home-hero__panel">
              <div class="hero-stats-panel__header">
                <span class="status-dot status-dot--accent home-status-dot home-status-dot--sm"></span>
                <span class="hero-stats-panel__label">TecnoRia · Estado del sistema</span>
              </div>
              <div class="hero-stats-panel__metrics">
                <div class="hero-stat-item" *ngFor="let metric of metrics">
                  <span class="hero-stat-item__value">{{ metric.value }}</span>
                  <span class="hero-stat-item__label">{{ metric.label }}</span>
                  <span class="hero-stat-item__detail">{{ metric.detail }}</span>
                </div>
              </div>
              <div class="hero-stats-panel__body">
                <span class="hero-stats-panel__title">Lo que ordenamos primero</span>
                <ul class="hero-stats-panel__checklist">
                  <li *ngFor="let statement of trust">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    {{ statement }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section section-alt section-accent--soft home-signature">
        <div class="site-container proof-bar">
          <article class="proof-bar__item home-proof-card" *ngFor="let item of signature">
            <strong>{{ item.title }}</strong>
            <p>{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section class="section home-stage">
        <div class="site-container split-stage split-stage--feature">
          <div class="split-stage__media">
            <div class="section-copy reveal" appReveal>
              <span class="eyebrow">Dónde solemos entrar</span>
              <h2>Cuando el negocio se tensiona, la tecnología deja de ser secundaria.</h2>
              <p class="lead home-copy-muted">
                Procesos demasiado manuales, soporte saturado, sistemas
                desconectados o un producto que necesita una base mucho más seria.
                Ahí es donde entramos.
              </p>
              <a class="button button-secondary" routerLink="/soluciones">Ver soluciones por escenario</a>
            </div>

            <figure class="surface-card visual-card visual-card--feature home-visual-card">
              <img
                [src]="systemsImage.src"
                [alt]="systemsImage.alt"
                [attr.width]="systemsImage.width"
                [attr.height]="systemsImage.height"
                loading="lazy"
              />
            </figure>
          </div>

          <div class="split-stage__cards card-grid card-grid--two stagger-children" appReveal>
            <article class="surface-card insight-card home-insight-card" *ngFor="let pain of challenges">
              <h3>{{ pain.title }}</h3>
              <p>{{ pain.description }}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section section-alt home-services-stage">
        <div class="site-container">
          <div class="section-head reveal" appReveal>
            <span class="eyebrow">Servicios principales</span>
            <h2>Seis líneas de servicio. Un único criterio de ejecución.</h2>
            <p class="home-copy-muted">
              Cada servicio responde a una intención concreta. Desde discovery
              hasta build, automatización e IA aplicada sin mensajes difusos.
            </p>
          </div>

          <div class="bento-grid bento-grid--services home-service-grid">
            <div class="bento-card bento-card--gradient reveal home-service-card home-service-card--lead" appReveal>
              <div class="home-service-card__header">
                <div class="home-service-card__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path [attr.d]="serviceIcon(serviceCards[0].key)"/>
                  </svg>
                </div>
                <div>
                  <span class="home-service-card__badge">{{ serviceCards[0].badge }}</span>
                  <h3 class="home-service-card__title">{{ serviceCards[0].name }}</h3>
                </div>
              </div>
              <p class="home-service-card__summary">{{ serviceCards[0].summary }}</p>
              <div class="home-service-card__chips">
                <span class="tech-tag home-service-card__tag" *ngFor="let uc of serviceCards[0].useCases.slice(0, 4)">
                  {{ uc }}
                </span>
              </div>
              <a class="text-link home-service-card__link" [routerLink]="serviceCards[0].seo.path">Explorar servicio</a>
            </div>

            <ng-container *ngFor="let service of serviceCards.slice(1); let i = index">
              <div
                class="bento-card bento-card--gradient reveal home-service-card home-service-card--compact"
                appReveal
                [class]="'bento-card bento-card--gradient reveal home-service-card home-service-card--compact reveal-delay-' + (i + 1)"
              >
                <div class="home-service-card__icon home-service-card__icon--compact">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path [attr.d]="serviceIcon(service.key)"/>
                  </svg>
                </div>
                <span class="home-service-card__badge home-service-card__badge--compact">{{ service.badge }}</span>
                <h3 class="home-service-card__title home-service-card__title--compact">{{ service.name }}</h3>
                <p class="home-service-card__summary home-service-card__summary--compact">{{ service.summary }}</p>
                <a class="text-link home-service-card__link" [routerLink]="service.seo.path">Explorar</a>
              </div>
            </ng-container>
          </div>
        </div>
      </section>

      <section class="section home-showcase-stage">
        <div class="site-container">
          <div class="section-head reveal" appReveal>
            <span class="eyebrow">Plataformas que construimos</span>
            <h2>Software real, en producción, resolviendo problemas reales.</h2>
            <p class="home-copy-muted">
              Desde productos propios SaaS hasta plataformas construidas para
              clientes. Cada uno con su arquitectura, su reto y su resultado.
            </p>
          </div>

          <div class="showcase-grid home-showcase-grid stagger-children reveal" appReveal>
            <div class="showcase-card home-showcase-card" *ngFor="let sc of showcases">
              <span class="showcase-card__sector" [style.background]="sc.accentColor + '14'" [style.color]="sc.accentColor">
                {{ sc.sector }}
              </span>
              <div class="showcase-card__title">{{ sc.title }}</div>
              <p class="showcase-card__summary">{{ sc.summary }}</p>
              <ul class="showcase-card__impact">
                <li *ngFor="let impact of sc.impact">{{ impact }}</li>
              </ul>
              <a class="showcase-card__cta" [routerLink]="sc.ctaLink">
                {{ sc.ctaLabel }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section class="section section-dark product-stage home-products-stage">
        <div class="site-container">
          <div class="section-head section-head--light reveal" appReveal>
            <span class="eyebrow home-products-stage__eyebrow">Nuestros productos SaaS</span>
            <h2>Software que construimos para nosotros y desplegamos para equipos que operan de verdad.</h2>
            <p>
              Además de proyectos a medida, TecnoRia diseña y opera sus propias
              plataformas. Productos pensados para casos reales y disponibles
              para empresas que necesitan una base técnica seria.
            </p>
          </div>

          <article class="home-product-card home-product-card--talkaris reveal" appReveal>
            <div class="home-product-card__copy">
              <span class="product-card__badge home-product-card__badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>
                Producto propio
              </span>
              <h3 class="product-card__title">Talkaris</h3>
              <p class="product-card__desc">{{ products[0].heroCopy }}</p>
              <div class="product-card__features">
                <span class="product-card__feature-tag home-product-card__feature-tag" *ngFor="let f of products[0].features">
                  {{ f }}
                </span>
              </div>
              <div class="home-product-card__actions">
                <a class="button button-primary" [routerLink]="products[0].ctaPath">
                  {{ products[0].ctaLabel }}
                </a>
                <a class="text-link home-product-card__link" [routerLink]="'/productos/' + products[0].slug">Ver plataforma</a>
              </div>
            </div>

            <div class="home-product-card__visual">
              <div class="product-console home-product-card__console">
                <div class="product-console__head product-console__head--start">
                  <span class="status-dot status-dot--accent home-status-dot"></span>
                  <span class="product-console__label">Talkaris chat · enterprise live</span>
                </div>
                <div class="product-console__stream">
                  <div class="product-console__bubble product-console__bubble--brand">¿Cómo puedo ayudarte hoy?</div>
                  <div class="product-console__bubble product-console__bubble--neutral">Necesito información sobre vuestros precios enterprise.</div>
                  <div class="product-console__bubble product-console__bubble--brand">Puedo enseñarte planes, integraciones y tiempos de despliegue.</div>
                </div>
              </div>
            </div>
          </article>

          <article class="home-product-card home-product-card--auctorio reveal" appReveal>
            <div class="home-product-card__visual">
              <div class="product-console home-product-card__console home-product-card__console--copper">
                <div class="product-console__head">
                  <span class="product-console__label">Auctorio · pipeline editorial</span>
                  <span class="status-dot status-dot--copper home-status-dot home-status-dot--sm"></span>
                </div>
                <div class="home-product-card__workflow">
                  <div class="home-product-card__workflow-step" *ngFor="let step of ['Brief recibido', 'IA generando', 'Revisión QA', 'Publicado']">
                    <span class="home-product-card__workflow-dot"></span>
                    <span>{{ step }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="home-product-card__copy">
              <span class="product-card__badge home-product-card__badge home-product-card__badge--copper">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>
                Producto propio
              </span>
              <h3 class="product-card__title">Auctorio</h3>
              <p class="product-card__desc">{{ products[1].heroCopy }}</p>
              <div class="product-card__features">
                <span class="product-card__feature-tag home-product-card__feature-tag home-product-card__feature-tag--copper" *ngFor="let f of products[1].features">
                  {{ f }}
                </span>
              </div>
              <div class="home-product-card__actions">
                <a class="button button-primary home-product-card__button--copper" [routerLink]="products[1].ctaPath">
                  {{ products[1].ctaLabel }}
                </a>
                <a class="text-link home-product-card__link home-product-card__link--copper" [routerLink]="'/productos/' + products[1].slug">Ver plataforma</a>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="section testimonials-section home-testimonials">
        <div class="site-container section-head reveal" appReveal>
          <span class="eyebrow">Lo que dicen quienes han trabajado con nosotros</span>
          <h2>Proyectos reales, resultados medibles y relaciones que continúan.</h2>
        </div>

        <div class="site-container card-grid card-grid--three stagger-children" appReveal>
          <article class="testimonial-card glass-card home-testimonial-card" *ngFor="let item of testimonialItems">
            <blockquote>
              <p>{{ item.quote }}</p>
            </blockquote>
            <footer class="testimonial-card__footer">
              <span class="testimonial-card__role">{{ item.role }}</span>
              <span class="testimonial-card__company">{{ item.company }}</span>
            </footer>
          </article>
        </div>
      </section>

      <section class="section section-alt home-method-stage">
        <div class="site-container section-head reveal" appReveal>
          <span class="eyebrow">Método</span>
          <h2>Una forma de trabajar que reduce incertidumbre y protege la inversión.</h2>
        </div>

        <div class="site-container split-stage split-stage--feature">
          <figure class="surface-card visual-card visual-card--feature home-visual-card">
            <img
              [src]="processImage.src"
              [alt]="processImage.alt"
              [attr.width]="processImage.width"
              [attr.height]="processImage.height"
              loading="lazy"
            />
          </figure>

          <div class="timeline-grid timeline-grid--light">
            <article class="timeline-step timeline-step--light reveal home-method-card" appReveal *ngFor="let step of steps; let i = index">
              <span class="home-method-card__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                  <path [attr.d]="processIcon(i)"/>
                </svg>
              </span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
              <small>{{ step.deliverable }}</small>
            </article>
          </div>
        </div>
      </section>

      <section class="section home-insights-stage">
        <div class="site-container split-head reveal" appReveal>
          <div>
            <span class="eyebrow">Insights para comprar mejor</span>
            <h2>Contenido evergreen para resolver objeciones reales.</h2>
          </div>
          <a class="button button-secondary" routerLink="/blog">Ver todos los recursos</a>
        </div>

        <div class="site-container editorial-grid stagger-children" appReveal>
          <article class="editorial-card home-editorial-card" *ngFor="let article of featuredInsights">
            <span class="chip chip-soft">{{ article.category }}</span>
            <h3>{{ article.title }}</h3>
            <p>{{ article.summary }}</p>
            <div class="article-meta">{{ article.readingTime }}</div>
            <div class="editorial-card__footer">
              <a class="text-link" [routerLink]="article.seo.path">Leer artículo</a>
            </div>
          </article>
        </div>
      </section>

      <section class="section section-alt home-faq-stage">
        <div class="site-container split-head reveal" appReveal>
          <div>
            <span class="eyebrow">FAQ comercial</span>
            <h2>Preguntas frecuentes antes de pedir reunión.</h2>
          </div>
          <a class="button button-secondary" routerLink="/faq">Ver FAQ completa</a>
        </div>

        <div class="site-container faq-list">
          <details class="faq-item home-faq-item" *ngFor="let faq of homeFaqs">
            <summary>{{ faq.question }}</summary>
            <p>{{ faq.answer }}</p>
          </details>
        </div>
      </section>

      <section class="section section-dark home-final-stage">
        <div class="site-container final-cta final-cta--elevated reveal" appReveal>
          <div>
            <span class="eyebrow">Siguiente paso</span>
            <h2>Si ya sabes que algo se ha quedado pequeño, lo convertimos en una decisión ejecutable.</h2>
            <p>
              Revisamos contexto, urgencia, encaje y siguiente mejor movimiento:
              discovery, software, automatización, IA o una combinación razonable.
            </p>
          </div>
          <div class="cta-actions">
            <a class="button button-primary" routerLink="/contacto">Solicitar reunión</a>
            <a class="button button-secondary" routerLink="/metodologia">Ver método</a>
          </div>
        </div>
      </section>

      <app-contact-form></app-contact-form>
    </div>
  `,
})
export class HomePageComponent implements OnInit {
  heroImage = brandImages.hero;
  systemsImage = brandImages.systems;
  processImage = brandImages.method;
  metrics = heroMetrics;
  signature = proofMoments;
  trust = trustStatements;
  challenges = challengeCards;
  benefits = benefitBlocks;
  serviceCards = services;
  showcases = featuredShowcases;
  steps = processSteps;
  featuredInsights = getArticlesBySlugs(featuredInsightSlugs);
  homeFaqs = generalFaqs.slice(0, 4);
  testimonialItems = testimonials;
  products = homeProducts;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Ingeniería de software, automatización e IA aplicada para empresas",
      description:
        "TecnoRia diseña y desarrolla software a medida, automatización e inteligencia artificial aplicada para empresas que necesitan operar mejor y escalar con una base técnica seria. Software · Automatización · IA en Galicia, España.",
      path: "/",
      imagePath: brandImages.social.src,
      keywords: [
        "software a medida galicia",
        "automatización procesos pymes galicia",
        "inteligencia artificial para empresas",
        "chatbot empresas español",
        "plataforma saas b2b desarrollo",
      ],
      schemas: [
        this.seo.createFaqSchema(this.homeFaqs),
        this.seo.createLocalBusinessSchema(),
      ],
    });
  }

  serviceIcon(key: string): string {
    return SERVICE_ICONS[key] ?? "M13 10V3L4 14h7v7l9-11h-7z";
  }

  processIcon(index: number): string {
    return PROCESS_ICONS[index] ?? PROCESS_ICONS[0];
  }
}
