import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import {
  audienceSegments,
  brandImages,
  solutionNeeds,
} from "../content/site-content";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-solutions-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-hero section">
      <div class="site-container page-hero__split page-hero__split--visual">
        <div class="page-hero__copy">
          <span class="eyebrow">Soluciones por escenario</span>
          <h1>No todas las empresas entran por una tecnología. Muchas entran por una fricción muy concreta.</h1>
          <p class="lead">
            Esta página ayuda a identificar el escenario dominante para decidir
            si conviene ordenar operaciones, automatizar atención, lanzar una
            plataforma o introducir IA sobre una base ya madura.
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

    <section class="section">
      <div class="site-container section-head">
        <span class="eyebrow">Segmentos con los que trabajamos</span>
        <h2>Mismo rigor técnico, pero con un encuadre distinto según el punto de partida.</h2>
      </div>

      <div class="site-container card-grid card-grid--three">
        <article class="surface-card" *ngFor="let segment of segments">
          <h3>{{ segment.title }}</h3>
          <p>{{ segment.description }}</p>
          <ul class="plain-list">
            <li *ngFor="let item of segment.bullets">{{ item }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container section-head">
        <span class="eyebrow">Escenarios dominantes</span>
        <h2>Tres entradas habituales para aterrizar un proyecto con criterio.</h2>
      </div>

      <div class="site-container card-grid card-grid--three">
        <article class="surface-card solution-card" *ngFor="let need of needs">
          <h3>{{ need.title }}</h3>
          <p>{{ need.description }}</p>
          <ul class="plain-list">
            <li *ngFor="let bullet of need.bullets">{{ bullet }}</li>
          </ul>
          <a class="button button-secondary" [routerLink]="need.path">{{ need.label }}</a>
        </article>
      </div>
    </section>

    <section class="section section-dark">
      <div class="site-container final-cta">
        <div>
          <span class="eyebrow">Orientación</span>
          <h2>Si tu caso mezcla varias capas, lo más útil es ordenar primero la secuencia correcta.</h2>
          <p>
            En muchos proyectos conviven software, automatización y una capa
            conversacional o de IA. La clave está en construirlas en el orden
            correcto y con una arquitectura compatible.
          </p>
        </div>
        <div class="cta-actions">
          <a class="button button-primary" routerLink="/contacto">Pedir orientación</a>
          <a class="button button-ghost" routerLink="/servicios">Explorar servicios</a>
        </div>
      </div>
    </section>
  `,
})
export class SolutionsPageComponent implements OnInit {
  visual = brandImages.method;
  segments = audienceSegments;
  needs = solutionNeeds;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Soluciones para operaciones, automatización, producto e IA aplicada",
      description:
        "Soluciones por escenario y tipo de empresa para orientar mejor la demanda de software a medida, automatización, plataformas, chatbots e IA aplicada.",
      path: "/soluciones",
      imagePath: this.visual.src,
      keywords: [
        "soluciones tecnológicas para empresas",
        "software interno para empresas",
        "automatización de atención al cliente",
        "desarrollo para startups",
      ],
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Soluciones", path: "/soluciones" },
        ]),
      ],
    });
  }
}
