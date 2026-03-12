import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { brandImages, processSteps, proofMoments } from "../content/site-content";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-process-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-hero section">
      <div class="site-container page-hero__split page-hero__split--visual">
        <div class="page-hero__copy">
          <span class="eyebrow">Método</span>
          <h1>Un método claro reduce incertidumbre, mejora la toma de decisiones y protege la ejecución.</h1>
          <p class="lead">
            Explicar bien el proceso no es un adorno. Es la forma de demostrar
            que el proyecto no se improvisa y que cada fase tiene entregables,
            criterio y una función clara dentro del negocio.
          </p>
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
        <article class="surface-card trust-card trust-card--compact" *ngFor="let point of principles">
          <span class="chip chip-soft">Principio</span>
          <h2>{{ point.title }}</h2>
          <p>{{ point.description }}</p>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container timeline-grid timeline-grid--light">
        <article class="timeline-step timeline-step--light" *ngFor="let step of steps">
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
          <small>{{ step.deliverable }}</small>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container section-head">
        <span class="eyebrow">Qué protege este método</span>
        <h2>El proceso existe para decidir mejor, ejecutar con menos ruido y evolucionar con más control.</h2>
      </div>

      <div class="site-container process-summary-grid">
        <article class="process-summary-card">
          <strong>Menos ambigüedad</strong>
          <p>Todo el equipo entiende qué se hace primero, qué se pospone y qué riesgos existen.</p>
        </article>
        <article class="process-summary-card">
          <strong>Mejor comparación de opciones</strong>
          <p>Un proyecto bien definido mejora presupuestos, decisiones de stack y conversaciones internas.</p>
        </article>
        <article class="process-summary-card">
          <strong>Más capacidad de evolución</strong>
          <p>La solución no se piensa como entrega aislada, sino como base para siguientes fases y adopción.</p>
        </article>
      </div>
    </section>

    <section class="section section-dark">
      <div class="site-container card-grid card-grid--two">
        <article class="surface-card surface-card--soft-dark">
          <h2>Qué gana el cliente con este método</h2>
          <ul class="plain-list">
            <li>Menos ambigüedad sobre alcance, riesgos y prioridades.</li>
            <li>Más visibilidad sobre lo que se decide y por qué.</li>
            <li>Mejor protección frente a rehacer, sobredimensionar o improvisar.</li>
          </ul>
        </article>
        <article class="surface-card surface-card--soft-dark">
          <h2>Qué evitamos</h2>
          <ul class="plain-list">
            <li>Promesas vagas que no se traducen en entregables concretos.</li>
            <li>Proyectos que empiezan en build sin un mapa funcional y técnico mínimo.</li>
            <li>Uso de IA o automatización sin una base operativa suficientemente clara.</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container final-cta final-cta--elevated">
        <div>
          <span class="eyebrow">Empezar bien</span>
          <h2>En la mayoría de proyectos, el siguiente mejor paso es una fase corta de discovery con foco ejecutivo.</h2>
          <p>
            Sirve para bajar el problema, ordenar dependencias y decidir si lo
            correcto es construir una nueva capa, integrar sistemas o rehacer
            una parte del stack actual.
          </p>
        </div>
        <div class="cta-actions">
          <a class="button button-primary" routerLink="/contacto">Solicitar diagnóstico</a>
          <a class="button button-secondary" routerLink="/servicios">Ver servicios</a>
        </div>
      </div>
    </section>
  `,
})
export class ProcessPageComponent implements OnInit {
  visual = brandImages.method;
  principles = proofMoments;
  steps = processSteps;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Método de trabajo para proyectos de software, automatización e IA",
      description:
        "Método de TecnoRia para discovery, blueprint, desarrollo, lanzamiento y evolución de proyectos de software, automatización e IA aplicada.",
      path: "/metodologia",
      imagePath: this.visual.src,
      keywords: [
        "metodología desarrollo software",
        "discovery tecnológico",
        "proceso de trabajo consultora tecnológica",
      ],
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Método", path: "/metodologia" },
        ]),
      ],
    });
  }
}
