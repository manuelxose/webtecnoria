import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ContactFormComponent } from "../components/contact-form.component";
import {
  audienceSegments,
  benefitBlocks,
  brandImages,
  caseStudies,
  challengeCards,
  differentiators,
  featuredInsightSlugs,
  generalFaqs,
  getArticlesBySlugs,
  heroHighlights,
  heroMetrics,
  proofMoments,
  processSteps,
  services,
  solutionNeeds,
  testimonials,
  trustStatements,
} from "../content/site-content";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-home-page",
  standalone: true,
  imports: [CommonModule, RouterModule, ContactFormComponent],
  template: `
    <section class="hero-section section">
      <div class="site-container hero-grid hero-grid--premium">
        <div class="hero-copy hero-copy--flagship">
          <span class="eyebrow">Ingeniería de software · Automatización · IA aplicada</span>
          <h1>
            Software, automatización e IA que transforma cómo opera y escala tu empresa.
          </h1>
          <p class="lead lead--hero">
            Diseñamos y desarrollamos software a medida, automatizaciones,
            asistentes e IA aplicada sobre problemas reales de operativa,
            servicio y producto. Sin humo, sin sobreingeniería y con una hoja
            de ruta defendible desde el primer paso.
          </p>

          <div class="hero-actions">
            <a class="button button-primary" routerLink="/contacto">
              Solicitar diagnóstico ejecutivo
            </a>
            <a class="button button-secondary" routerLink="/servicios">
              Ver servicios y escenarios
            </a>
          </div>

          <div class="bullet-list bullet-list--hero">
            <div class="bullet-list__item" *ngFor="let item of highlights">
              <span class="bullet-dot"></span>
              <span>{{ item }}</span>
            </div>
          </div>

          <div class="hero-status-bar">
            <article class="hero-status-item" *ngFor="let metric of metrics">
              <strong>{{ metric.value }}</strong>
              <span>{{ metric.label }}</span>
              <p>{{ metric.detail }}</p>
            </article>
          </div>
        </div>

        <div class="hero-visual-stack">
          <figure class="surface-card visual-card visual-card--hero">
            <img
              class="hero-visual"
              [src]="heroImage.src"
              [alt]="heroImage.alt"
              [attr.width]="heroImage.width"
              [attr.height]="heroImage.height"
              fetchpriority="high"
            />
          </figure>

          <aside class="surface-card hero-strategy-panel">
            <span class="panel-label">Lo que ordenamos primero</span>
            <ul class="hero-strategy-panel__list">
              <li *ngFor="let statement of trust">{{ statement }}</li>
            </ul>

            <div class="article-callout" *ngIf="featuredInsights[0] as featured">
              <span class="chip chip-soft">{{ featured.category }}</span>
              <h3>{{ featured.title }}</h3>
              <p>{{ featured.summary }}</p>
              <a class="text-link" [routerLink]="featured.seo.path">Leer insight estratégico</a>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="section section-accent section-accent--soft">
      <div class="site-container proof-bar">
        <article class="proof-bar__item" *ngFor="let item of signature">
          <strong>{{ item.title }}</strong>
          <p>{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container split-stage split-stage--feature">
        <div class="split-stage__media">
          <div class="section-copy">
            <span class="eyebrow">Dónde solemos entrar</span>
            <h2>Cuando el negocio se tensiona, la tecnología deja de ser una capa secundaria.</h2>
            <p class="lead">
              La mayoría de proyectos que llegan a TecnoRia comparten el mismo
              patrón: procesos demasiado manuales, soporte saturado, sistemas
              desconectados o un producto que necesita una base más seria para
              la siguiente etapa.
            </p>
          </div>

          <figure class="surface-card visual-card visual-card--feature">
            <img
              [src]="systemsImage.src"
              [alt]="systemsImage.alt"
              [attr.width]="systemsImage.width"
              [attr.height]="systemsImage.height"
              loading="lazy"
            />
          </figure>
        </div>

        <div class="split-stage__cards card-grid card-grid--two">
          <article class="surface-card insight-card" *ngFor="let pain of challenges">
            <h3>{{ pain.title }}</h3>
            <p>{{ pain.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section section-dark">
      <div class="site-container split-stage split-stage--aligned">
        <div class="section-copy">
          <span class="eyebrow">Lo que desbloqueamos</span>
          <h2>Orden operativo, mejor servicio y una base técnica preparada para escalar sin rehacer.</h2>
          <p class="lead">
            No intervenimos para añadir complejidad. Intervenimos para que el
            sistema de trabajo gane claridad, capacidad de respuesta y margen
            real de crecimiento.
          </p>
        </div>

        <div class="card-grid card-grid--two">
          <article class="surface-card surface-card--soft-dark" *ngFor="let benefit of benefits">
            <h3>{{ benefit.title }}</h3>
            <p>{{ benefit.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="site-container section-head">
        <span class="eyebrow">Servicios principales</span>
        <h2>Seis líneas de servicio para cubrir operativa, producto, automatización e IA sin mensajes difusos.</h2>
        <p>
          Cada servicio responde a una intención concreta y conecta la necesidad
          con el siguiente movimiento más sensato: discovery, build, mejora o
          evolución.
        </p>
      </div>

      <div class="site-container card-grid card-grid--three">
        <article class="surface-card service-card service-card--stacked service-card--premium" *ngFor="let service of serviceCards">
          <span class="chip">{{ service.badge }}</span>
          <h3>{{ service.name }}</h3>
          <p>{{ service.summary }}</p>
          <ul class="plain-list">
            <li *ngFor="let useCase of service.useCases.slice(0, 3)">{{ useCase }}</li>
          </ul>
          <div class="service-card__footer">
            <a class="text-link" [routerLink]="service.seo.path">Explorar servicio</a>
          </div>
        </article>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container section-head">
        <span class="eyebrow">Soluciones por escenario</span>
        <h2>También puedes entrar por fricción de negocio y no por categoría técnica.</h2>
      </div>

      <div class="site-container card-grid card-grid--three">
        <article class="surface-card solution-card" *ngFor="let item of scenarios">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
          <ul class="plain-list">
            <li *ngFor="let bullet of item.bullets">{{ bullet }}</li>
          </ul>
          <a class="text-link" [routerLink]="item.path">{{ item.label }}</a>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container split-head">
        <div>
          <span class="eyebrow">Casos de éxito</span>
          <h2>Prueba de aplicación real contada como problema, solución e impacto.</h2>
        </div>
        <a class="button button-secondary" routerLink="/casos-de-exito">
          Ver todos los casos
        </a>
      </div>

      <div class="site-container card-grid card-grid--three">
        <article class="surface-card surface-card--story story-card" *ngFor="let item of cases">
          <span class="chip chip-soft">{{ item.sector }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.summary }}</p>
          <div class="story-block">
            <strong>Problema</strong>
            <p>{{ item.problem }}</p>
          </div>
          <div class="story-block">
            <strong>Impacto</strong>
            <ul class="plain-list">
              <li *ngFor="let impact of item.impact">{{ impact }}</li>
            </ul>
          </div>
          <a class="text-link" [routerLink]="item.ctaLink">{{ item.ctaLabel }}</a>
        </article>
      </div>
    </section>

    <section class="section testimonials-section">
      <div class="site-container section-head">
        <span class="eyebrow">Lo que dicen quienes han trabajado con nosotros</span>
        <h2>Proyectos reales. Resultados medibles. Relaciones que continúan.</h2>
      </div>

      <div class="site-container card-grid card-grid--three">
        <article class="testimonial-card" *ngFor="let item of testimonialItems">
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

    <section class="section section-accent section-accent--grid">
      <div class="site-container section-head">
        <span class="eyebrow">Método</span>
        <h2>Una manera de trabajar que reduce incertidumbre, protege la inversión y ordena la ejecución.</h2>
      </div>

      <div class="site-container split-stage split-stage--feature">
        <figure class="surface-card visual-card visual-card--feature">
          <img
            [src]="processImage.src"
            [alt]="processImage.alt"
            [attr.width]="processImage.width"
            [attr.height]="processImage.height"
            loading="lazy"
          />
        </figure>

        <div class="timeline-grid timeline-grid--light">
          <article class="timeline-step timeline-step--light" *ngFor="let step of steps">
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
            <small>{{ step.deliverable }}</small>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="site-container split-head">
        <div>
          <span class="eyebrow">Insights para comprar mejor</span>
          <h2>Contenido evergreen creado para educar demanda y resolver objeciones reales.</h2>
        </div>
        <a class="button button-secondary" routerLink="/blog">
          Ver todos los recursos
        </a>
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
      <div class="site-container split-head">
        <div>
          <span class="eyebrow">FAQ comercial</span>
          <h2>Preguntas que suelen aparecer antes de pedir una reunión seria.</h2>
        </div>
        <a class="button button-secondary" routerLink="/faq">Ver FAQ completa</a>
      </div>

      <div class="site-container faq-list">
        <details class="faq-item faq-item--dark" *ngFor="let faq of homeFaqs">
          <summary>{{ faq.question }}</summary>
          <p>{{ faq.answer }}</p>
        </details>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container final-cta final-cta--elevated">
        <div>
          <span class="eyebrow">Siguiente paso</span>
          <h2>Si ya sabes que algo se ha quedado pequeño, lo convertimos en una decisión ejecutable.</h2>
          <p>
            Revisamos contexto, urgencia, encaje y siguiente mejor movimiento:
            discovery, blueprint, software, automatización, IA o una combinación
            razonable entre varias capas.
          </p>
        </div>
        <div class="cta-actions">
          <a class="button button-primary" routerLink="/contacto">Solicitar reunión</a>
          <a class="button button-secondary" routerLink="/metodologia">Ver método</a>
        </div>
      </div>
    </section>

    <app-contact-form></app-contact-form>
  `,
})
export class HomePageComponent implements OnInit {
  heroImage = brandImages.hero;
  systemsImage = brandImages.systems;
  processImage = brandImages.method;
  highlights = heroHighlights;
  metrics = heroMetrics;
  signature = proofMoments;
  trust = trustStatements;
  challenges = challengeCards;
  benefits = benefitBlocks;
  serviceCards = services;
  scenarios = solutionNeeds;
  segments = audienceSegments;
  cases = caseStudies.slice(0, 3);
  steps = processSteps;
  featuredInsights = getArticlesBySlugs(featuredInsightSlugs);
  differentiatorBlocks = differentiators;
  homeFaqs = generalFaqs.slice(0, 6);
  testimonialItems = testimonials;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Ingeniería de software, automatización e IA aplicada para empresas",
      description:
        "TecnoRia diseña y desarrolla software a medida, automatización, asistentes e inteligencia artificial aplicada para empresas que necesitan operar mejor, vender mejor y escalar con una base técnica seria.",
      path: "/",
      imagePath: this.heroImage.src,
      keywords: [
        "software a medida para empresas",
        "automatización de procesos",
        "inteligencia artificial para empresas",
        "chatbots para empresas",
      ],
      schemas: [this.seo.createFaqSchema(this.homeFaqs)],
    });
  }
}
