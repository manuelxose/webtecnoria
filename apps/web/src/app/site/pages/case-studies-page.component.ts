import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { caseStudies } from "../content/site-content";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-case-studies-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-hero section">
      <div class="site-container page-hero__inner">
        <span class="eyebrow">Casos de exito</span>
        <h1>Casos de exito contados como problema, solucion e impacto.</h1>
        <p class="lead">
          La prueba de valor no es una galeria de pantallas. Es explicar por que
          se hizo, que se construyo y que cambio en la operativa del cliente,
          tambien cuando la solucion pasa por automatizacion conversacional o
          chatbots.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="site-container story-layout" *ngFor="let item of stories">
        <article class="surface-card surface-card--story">
          <div class="story-topline">
            <span class="chip chip-soft">{{ item.sector }}</span>
            <h2>{{ item.title }}</h2>
            <p>{{ item.summary }}</p>
          </div>

          <div class="story-grid">
            <div class="story-block">
              <strong>Contexto y problema</strong>
              <p>{{ item.problem }}</p>
            </div>
            <div class="story-block">
              <strong>Solucion propuesta</strong>
              <p>{{ item.solution }}</p>
            </div>
            <div class="story-block">
              <strong>Impacto</strong>
              <ul class="plain-list">
                <li *ngFor="let impact of item.impact">{{ impact }}</li>
              </ul>
            </div>
          </div>

          <a class="button button-secondary" [routerLink]="item.ctaLink">
            {{ item.ctaLabel }}
          </a>
        </article>
      </div>
    </section>

    <section class="section section-dark">
      <div class="site-container final-cta">
        <div>
          <span class="eyebrow">Siguiente paso</span>
          <h2>Si ves tu situacion reflejada en alguno de estos casos, la siguiente conversacion ya es mucho mas concreta.</h2>
        </div>
        <div class="cta-actions">
          <a class="button button-primary" routerLink="/contacto">Quiero una propuesta</a>
          <a class="button button-ghost" routerLink="/servicios">Ver servicios</a>
        </div>
      </div>
    </section>
  `,
})
export class CaseStudiesPageComponent implements OnInit {
  stories = caseStudies;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Casos de exito de software, automatizacion, chatbots e IA",
      description:
        "Casos de exito con foco en problema, solucion e impacto para reforzar autoridad y conversion en servicios de software, chatbots y automatizacion.",
      path: "/casos-de-exito",
      keywords: [
        "casos de exito software a medida",
        "proyectos de automatizacion",
        "casos de exito chatbots",
      ],
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Casos de exito", path: "/casos-de-exito" },
        ]),
      ],
    });
  }
}
