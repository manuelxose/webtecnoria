import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import {
  brandImages,
  featuredInsightSlugs,
  getArticlesBySlugs,
  proofMoments,
  processSteps,
  services,
  solutionNeeds,
} from "../content/site-content";
import { SeoService } from "../services/seo.service";

const SERVICE_ICON_PATHS: Record<string, string> = {
  software:
    "M4.5 6.25A2.25 2.25 0 0 1 6.75 4h10.5a2.25 2.25 0 0 1 2.25 2.25v7.5A2.25 2.25 0 0 1 17.25 16H14l-2 2.5-2-2.5H6.75A2.25 2.25 0 0 1 4.5 13.75v-7.5Z M8 8.75h8 M8 11.75h5.5",
  automation:
    "M12 3.75v2.5 M12 17.75v2.5 M20.25 12h-2.5 M6.25 12h-2.5 M17.84 6.16l-1.77 1.77 M7.93 16.07l-1.77 1.77 M17.84 17.84l-1.77-1.77 M7.93 7.93 6.16 6.16 M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z",
  chatbots:
    "M7 8.25h10 M7 11.75h6.5 M6.75 4.5h10.5a2.25 2.25 0 0 1 2.25 2.25v5.5A2.25 2.25 0 0 1 17.25 14.5H12l-3.5 3v-3H6.75A2.25 2.25 0 0 1 4.5 12.25v-5.5A2.25 2.25 0 0 1 6.75 4.5Z",
  ai:
    "M12 3.75 14.15 8.35 19.25 9.1 15.5 12.7 16.4 17.9 12 15.45 7.6 17.9 8.5 12.7 4.75 9.1 9.85 8.35 12 3.75Z",
  saas:
    "M5.5 7.25A1.75 1.75 0 0 1 7.25 5.5h9.5A1.75 1.75 0 0 1 18.5 7.25v2.5A1.75 1.75 0 0 1 16.75 11.5h-9.5A1.75 1.75 0 0 1 5.5 9.75v-2.5Z M5.5 14.25a1.75 1.75 0 0 1 1.75-1.75h9.5a1.75 1.75 0 0 1 1.75 1.75v2.5A1.75 1.75 0 0 1 16.75 18.5h-9.5A1.75 1.75 0 0 1 5.5 16.75v-2.5Z M8 8.5h.01 M8 15.5h.01",
  consulting:
    "M6.75 15.75 4.5 19.5l3.75-2.25a7.5 7.5 0 1 0-1.5-1.5Z M9 10.5h6 M9 13.5h3.5",
};

const DETAIL_ICON_PATHS = {
  fit: "M5.25 12.75 9 16.5 18.75 6.75",
  outcomes:
    "M6.75 15.25 10.25 11.75 13 14.5 17.25 8.75 M17.25 8.75v4.25 M17.25 8.75H13",
  deliverables:
    "M8.25 6.75h7.5 M8.25 10.5h7.5 M8.25 14.25h4.5 M6.75 4.5h10.5A2.25 2.25 0 0 1 19.5 6.75v10.5A2.25 2.25 0 0 1 17.25 19H6.75A2.25 2.25 0 0 1 4.5 16.75V6.75A2.25 2.25 0 0 1 6.75 4.5Z",
};

const SCENARIO_ICON_PATHS = [
  "M7.5 18.25h9 M7.5 5.75h9 M9 12h6 M5.75 4.5h12.5A1.25 1.25 0 0 1 19.5 5.75v12.5a1.25 1.25 0 0 1-1.25 1.25H5.75A1.25 1.25 0 0 1 4.5 18.25V5.75A1.25 1.25 0 0 1 5.75 4.5Z",
  "M12 4.5v15 M4.5 12h15 M6.75 7.5h2.25 M15 14.25h2.25 M14.25 6.75l1.5 1.5 M7.5 14.25l1.5 1.5",
  "M6.75 16.5 9.75 13.5 12 15.75 17.25 10.5 M14.25 10.5h3v3",
];

@Component({
  selector: "app-services-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ["./services-page.component.css"],
  template: `
    <section class="page-hero section">
      <div class="site-container page-hero__split page-hero__split--visual">
        <div class="page-hero__copy">
          <span class="eyebrow">Servicios</span>
          <h1>Servicios diseñados para convertir necesidades reales en soluciones tecnológicas viables.</h1>
          <p class="lead">
            Software a medida, automatización, asistentes, IA aplicada,
            producto y consultoría. Cada servicio tiene un propósito claro
            y una ruta de ejecución definida.
          </p>
          <div class="hero-actions">
            <a class="button button-primary" routerLink="/contacto">
              Solicitar diagnóstico
            </a>
            <a class="button button-secondary" routerLink="/soluciones">
              Ver soluciones por escenario
            </a>
          </div>
        </div>

        <figure class="surface-card visual-card visual-card--page">
          <img
            class="page-hero__visual"
            [src]="visual.src"
            [alt]="visual.alt"
            [attr.width]="visual.width"
            [attr.height]="visual.height"
            loading="eager"
          />
        </figure>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container card-grid card-grid--three">
        <article class="surface-card trust-card trust-card--compact" *ngFor="let point of approach">
          <span class="chip chip-soft">Como trabajamos</span>
          <h2>{{ point.title }}</h2>
          <p>{{ point.description }}</p>
        </article>
      </div>
    </section>

    <section class="section services-lines">
      <div class="site-container section-head services-section-head">
        <span class="eyebrow">Líneas de servicio</span>
        <h2>Seis líneas de servicio que cubren software, operativa, producto e IA sin solapamientos.</h2>
      </div>

      <div class="site-container card-grid card-grid--three services-card-grid">
        <article class="surface-card service-card service-card--full service-card--premium services-service-card" *ngFor="let service of serviceCards">
          <div class="service-card__header services-service-card__header">
            <div class="services-service-card__topline">
              <span class="services-service-card__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                  <path [attr.d]="serviceIconPaths[service.key] ?? serviceIconPaths['software']"></path>
                </svg>
              </span>
              <span class="chip services-service-card__badge">{{ service.badge }}</span>
            </div>

            <div class="services-service-card__copy">
              <h3>{{ service.name }}</h3>
              <p>{{ service.summary }}</p>
            </div>

            <div class="services-service-card__tags">
              <span class="services-service-card__tag" *ngFor="let useCase of service.useCases.slice(0, 3)">
                {{ useCase }}
              </span>
            </div>
          </div>

          <div class="service-card__body service-card__body--stacked services-service-card__clusters">
            <section class="services-service-card__cluster">
              <div class="services-service-card__cluster-head">
                <span class="services-service-card__cluster-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path [attr.d]="detailIconPaths.fit"></path>
                  </svg>
                </span>
                <strong>Encaja cuando</strong>
              </div>
              <ul class="plain-list plain-list--service">
                <li *ngFor="let item of service.fit.slice(0, 2)">{{ item }}</li>
              </ul>
            </section>

            <section class="services-service-card__cluster">
              <div class="services-service-card__cluster-head">
                <span class="services-service-card__cluster-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path [attr.d]="detailIconPaths.outcomes"></path>
                  </svg>
                </span>
                <strong>Desbloquea</strong>
              </div>
              <ul class="plain-list plain-list--service">
                <li *ngFor="let outcome of service.outcomes.slice(0, 2)">{{ outcome }}</li>
              </ul>
            </section>

            <section class="services-service-card__cluster services-service-card__cluster--deliverables">
              <div class="services-service-card__cluster-head">
                <span class="services-service-card__cluster-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path [attr.d]="detailIconPaths.deliverables"></path>
                  </svg>
                </span>
                <strong>Entregables</strong>
              </div>
              <ul class="plain-list plain-list--service">
                <li *ngFor="let item of service.deliverables.slice(0, 2)">{{ item }}</li>
              </ul>
            </section>
          </div>

          <div class="service-card__footer services-service-card__footer">
            <span class="services-service-card__context">{{ service.ctaLabel }}</span>
            <a class="button button-primary" [routerLink]="service.seo.path">
              Ver detalle del servicio
            </a>
          </div>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container split-head">
        <div>
          <span class="eyebrow">Contenido que acompaña la decisión</span>
          <h2>Recursos pensados para comparar opciones, aclarar alcance y tomar mejores decisiones.</h2>
        </div>
        <a class="button button-secondary" routerLink="/blog">Ir al hub editorial</a>
      </div>

      <div class="site-container editorial-grid">
        <article class="editorial-card" *ngFor="let article of featuredInsights">
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

    <section class="section section-dark">
      <div class="site-container section-head section-head--light services-scenario-head">
        <span class="eyebrow services-scenario-head__eyebrow">Escenarios habituales</span>
        <h2>También puedes entrar por problema y no por categoría técnica.</h2>
        <p>
          Si todavía no tienes claro qué servicio encaja, estas rutas ayudan
          a aterrizar el caso antes de elegir stack o fase.
        </p>
      </div>

      <div class="site-container card-grid card-grid--three services-scenario-grid">
        <article class="surface-card surface-card--soft-dark solution-card services-scenario-card" *ngFor="let item of scenarios; let i = index">
          <div class="services-scenario-card__topline">
            <span class="services-scenario-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path [attr.d]="scenarioIconPaths[i % scenarioIconPaths.length]"></path>
              </svg>
            </span>
            <span class="services-scenario-card__label">Ruta {{ i + 1 }}</span>
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
          <ul class="plain-list services-scenario-card__list">
            <li *ngFor="let bullet of item.bullets">{{ bullet }}</li>
          </ul>
          <a class="text-link text-link--light services-scenario-card__link" [routerLink]="item.path">{{ item.label }}</a>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container section-head">
        <span class="eyebrow">Método de entrega</span>
        <h2>La forma de trabajar importa tanto como la tecnología elegida.</h2>
      </div>

      <div class="site-container timeline-grid timeline-grid--light">
        <article class="timeline-step timeline-step--light" *ngFor="let step of steps">
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
          <small>{{ step.deliverable }}</small>
        </article>
      </div>
    </section>

    <section class="section section-accent services-banner-section">
      <div class="site-container final-cta final-cta--elevated services-final-cta">
        <div class="services-final-cta__copy">
          <span class="eyebrow">Siguiente paso</span>
          <h2>Si no sabes aún por qué pieza empezar, arrancamos con discovery y definimos el mapa correcto.</h2>
          <p>
            En la primera conversación filtramos encaje, urgencia, dependencias
            entre sistemas y nivel de definición para proponerte la ruta más
            sensata.
          </p>
        </div>

        <div class="services-final-cta__panel">
          <span class="panel-label">Lo que validamos</span>
          <ul class="plain-list services-final-cta__list">
            <li>Qué flujo es prioritario y dónde está el verdadero cuello de botella.</li>
            <li>Qué dependencias técnicas y operativas condicionan la primera fase.</li>
            <li>Qué pieza conviene lanzar primero para mover negocio sin sobreconstruir.</li>
          </ul>

          <div class="cta-actions services-final-cta__actions">
            <a class="button button-primary" routerLink="/contacto">Solicitar diagnóstico</a>
            <a class="button button-secondary" routerLink="/metodologia">Ver método</a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ServicesPageComponent implements OnInit {
  visual = brandImages.systems;
  serviceCards = services;
  approach = proofMoments;
  scenarios = solutionNeeds;
  steps = processSteps;
  featuredInsights = getArticlesBySlugs(featuredInsightSlugs);
  readonly serviceIconPaths = SERVICE_ICON_PATHS;
  readonly detailIconPaths = DETAIL_ICON_PATHS;
  readonly scenarioIconPaths = SCENARIO_ICON_PATHS;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Servicios de software, automatización, asistentes e IA aplicada",
      description:
        "Servicios de TecnoRia: software a medida, automatización de procesos, chatbots, inteligencia artificial aplicada, plataformas SaaS y consultoría tecnológica.",
      path: "/servicios",
      imagePath: this.visual.src,
      keywords: [
        "servicios de software a medida",
        "automatización de procesos",
        "chatbots para empresas",
        "consultoría tecnológica",
      ],
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Servicios", path: "/servicios" },
        ]),
      ],
    });
  }
}
