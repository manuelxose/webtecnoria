import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import {
  brandImages,
  caseStudies,
  getServiceByKey,
} from "../content/site-content";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-case-studies-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-hero section">
      <div class="site-container page-hero__split page-hero__split--visual">
        <div class="page-hero__copy">
          <span class="eyebrow">Casos de éxito</span>
          <h1>Prueba de valor explicada como problema, decisión y cambio operativo.</h1>
          <p class="lead">
            Aquí no mostramos pantallas sueltas. Mostramos qué estaba frenando
            al negocio, qué capa se construyó y qué impacto generó en el trabajo
            diario o en la salida al mercado.
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
      <div class="site-container story-layout" *ngFor="let item of stories">
        <article class="surface-card surface-card--story story-card story-card--full">
          <div class="story-topline">
            <span class="chip chip-soft">{{ item.sector }}</span>
            <h2>{{ item.title }}</h2>
            <p>{{ item.summary }}</p>
            <div class="service-link-cluster">
              <a
                class="service-link-chip"
                *ngFor="let serviceKey of item.serviceKeys"
                [routerLink]="getServicePath(serviceKey)"
              >
                {{ getServiceLabel(serviceKey) }}
              </a>
            </div>
          </div>

          <div class="story-grid story-grid--dense">
            <div class="story-block">
              <strong>Problema de partida</strong>
              <p>{{ item.problem }}</p>
            </div>
            <div class="story-block">
              <strong>Solución aplicada</strong>
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
          <h2>Si reconoces tu situación en alguno de estos casos, la siguiente conversación ya parte de un contexto mucho más útil.</h2>
          <p>
            Podemos revisar tu punto de partida y decidir si conviene una capa
            de software, automatización, IA o una combinación por fases.
          </p>
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
  visual = brandImages.systems;
  stories = caseStudies;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Casos de éxito de software, automatización, producto e IA aplicada",
      description:
        "Casos de éxito de TecnoRia con foco en problema, solución e impacto en software, automatización, plataformas, chatbots e IA aplicada.",
      path: "/casos-de-exito",
      imagePath: this.visual.src,
      keywords: [
        "casos de éxito software a medida",
        "casos de automatización empresarial",
        "proyectos de chatbots para empresas",
      ],
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Casos de éxito", path: "/casos-de-exito" },
        ]),
      ],
    });
  }

  getServiceLabel(serviceKey: string): string {
    return getServiceByKey(serviceKey)?.shortName ?? serviceKey;
  }

  getServicePath(serviceKey: string): string {
    return getServiceByKey(serviceKey)?.seo.path ?? "/servicios";
  }
}
