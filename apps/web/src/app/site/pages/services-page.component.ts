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

@Component({
  selector: "app-services-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
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

    <section class="section">
      <div class="site-container section-head">
        <span class="eyebrow">Líneas de servicio</span>
        <h2>Seis líneas de servicio que cubren software, operativa, producto e IA sin solapamientos.</h2>
      </div>

      <div class="site-container card-grid card-grid--three">
        <article class="surface-card service-card service-card--full service-card--premium" *ngFor="let service of serviceCards">
          <div class="service-card__header">
            <span class="chip">{{ service.badge }}</span>
            <h3>{{ service.name }}</h3>
            <p>{{ service.summary }}</p>
          </div>
          <div class="service-card__body service-card__body--stacked">
            <div>
              <strong>Encaja cuando</strong>
              <ul class="plain-list">
                <li *ngFor="let item of service.fit.slice(0, 2)">{{ item }}</li>
              </ul>
            </div>
            <div>
              <strong>Desbloquea</strong>
              <ul class="plain-list">
                <li *ngFor="let outcome of service.outcomes.slice(0, 2)">{{ outcome }}</li>
              </ul>
            </div>
            <div>
              <strong>Entregables</strong>
              <ul class="plain-list">
                <li *ngFor="let item of service.deliverables.slice(0, 2)">{{ item }}</li>
              </ul>
            </div>
          </div>
          <div class="service-card__footer">
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
      <div class="site-container section-head section-head--light">
        <span class="eyebrow">Escenarios habituales</span>
        <h2>También puedes entrar por problema y no por categoría técnica.</h2>
        <p>
          Si todavía no tienes claro qué servicio encaja, estas rutas ayudan
          a aterrizar el caso antes de elegir stack o fase.
        </p>
      </div>

      <div class="site-container card-grid card-grid--three">
        <article class="surface-card surface-card--soft-dark solution-card" *ngFor="let item of scenarios">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
          <ul class="plain-list">
            <li *ngFor="let bullet of item.bullets">{{ bullet }}</li>
          </ul>
          <a class="text-link text-link--light" [routerLink]="item.path">{{ item.label }}</a>
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

    <section class="section section-accent">
      <div class="site-container final-cta final-cta--elevated">
        <div>
          <span class="eyebrow">Siguiente paso</span>
          <h2>Si no sabes aún por qué pieza empezar, arrancamos con discovery y definimos el mapa correcto.</h2>
          <p>
            En la primera conversación filtramos encaje, urgencia, dependencias
            entre sistemas y nivel de definición para proponerte la ruta más
            sensata.
          </p>
        </div>
        <div class="cta-actions">
          <a class="button button-primary" routerLink="/contacto">Solicitar diagnóstico</a>
          <a class="button button-secondary" routerLink="/metodologia">Ver método</a>
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
