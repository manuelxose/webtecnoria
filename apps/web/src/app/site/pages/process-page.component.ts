import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { processSteps } from "../content/site-content";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-process-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-hero section">
      <div class="site-container page-hero__inner">
        <span class="eyebrow">Metodologia</span>
        <h1>Un proceso claro para reducir incertidumbre y facilitar la conversion.</h1>
        <p class="lead">
          Explicar bien el proceso mejora la confianza porque el cliente entiende
          que va a pasar, que se espera de cada fase y como se controla el
          proyecto.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="site-container timeline-grid timeline-grid--light">
        <article class="timeline-step timeline-step--light" *ngFor="let step of steps">
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
        </article>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container card-grid card-grid--two">
        <article class="surface-card">
          <h2>Que obtiene el cliente</h2>
          <ul class="plain-list">
            <li>Orden y visibilidad desde el inicio.</li>
            <li>Prioridades claras y decisiones justificadas.</li>
            <li>Menos miedo a presupuesto abierto o a desarrollos opacos.</li>
          </ul>
        </article>
        <article class="surface-card">
          <h2>Como mejora la conversion</h2>
          <ul class="plain-list">
            <li>Reduce objeciones sobre seriedad y metodo.</li>
            <li>Explica que el proyecto no se improvisa.</li>
            <li>Ayuda a pedir contacto incluso sin tenerlo todo definido.</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="section section-dark">
      <div class="site-container final-cta">
        <div>
          <span class="eyebrow">Empezar</span>
          <h2>El mejor siguiente paso suele ser un discovery corto y bien guiado.</h2>
        </div>
        <div class="cta-actions">
          <a class="button button-primary" routerLink="/contacto">Quiero mi diagnostico</a>
          <a class="button button-ghost" routerLink="/servicios">Ver servicios</a>
        </div>
      </div>
    </section>
  `,
})
export class ProcessPageComponent implements OnInit {
  steps = processSteps;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Metodologia de trabajo para proyectos de software e IA",
      description:
        "Explicamos nuestro proceso de discovery, definicion, desarrollo, validacion y evolucion para generar confianza antes del contacto.",
      path: "/metodologia",
      keywords: ["metodologia desarrollo software", "proceso de trabajo consultora tecnologica"],
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Metodologia", path: "/metodologia" },
        ]),
      ],
    });
  }
}
