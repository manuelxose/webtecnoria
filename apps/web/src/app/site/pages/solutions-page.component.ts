import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { audienceSegments, solutionNeeds } from "../content/site-content";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-solutions-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-hero section">
      <div class="site-container page-hero__inner">
        <span class="eyebrow">Soluciones por necesidad</span>
        <h1>Atraemos empresas y proyectos emprendedores sin mezclar el discurso.</h1>
        <p class="lead">
          Esta pagina segmenta la demanda por tipo de cliente y por problema,
          para que cada visitante encuentre rapido por que deberia hablar con
          nosotros, tambien cuando la necesidad pasa por chatbots o soporte
          conversacional.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="site-container card-grid">
        <article class="surface-card" *ngFor="let segment of segments">
          <h2>{{ segment.title }}</h2>
          <p>{{ segment.description }}</p>
          <ul class="plain-list">
            <li *ngFor="let item of segment.bullets">{{ item }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container section-head">
        <span class="eyebrow">Necesidades tipicas</span>
        <h2>Palancas comerciales y SEO enfocadas a intencion real.</h2>
      </div>
      <div class="site-container card-grid card-grid--two">
        <article class="surface-card" *ngFor="let need of needs">
          <h3>{{ need.title }}</h3>
          <p>{{ need.description }}</p>
        </article>
      </div>
    </section>

    <section class="section section-dark">
      <div class="site-container final-cta">
        <div>
          <span class="eyebrow">Orientacion</span>
          <h2>Si no sabes todavia si necesitas software, automatizacion, chatbots o consultoria, lo ordenamos contigo.</h2>
        </div>
        <div class="cta-actions">
          <a class="button button-primary" routerLink="/contacto">Pedir orientacion</a>
          <a class="button button-ghost" routerLink="/servicios">Explorar servicios</a>
        </div>
      </div>
    </section>
  `,
})
export class SolutionsPageComponent implements OnInit {
  segments = audienceSegments;
  needs = solutionNeeds;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Soluciones tecnicas para empresas, startups y emprendedores",
      description:
        "Segmentamos soluciones por tipo de cliente y necesidad para captar mejor demanda de software a medida, automatizacion, chatbots, IA y plataformas.",
      path: "/soluciones",
      keywords: [
        "soluciones tecnologicas para empresas",
        "chatbots para empresas",
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
