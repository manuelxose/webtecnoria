import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import {
  chatbotSpotlight,
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
      <div class="site-container page-hero__inner">
        <span class="eyebrow">Servicios</span>
        <h1>Servicios orientados a captar demanda con intencion y convertirla en proyectos viables.</h1>
        <p class="lead">
          Ordenamos software, automatizacion, chatbots, IA, plataformas y
          consultoria para que el usuario entienda rapido que encaja con su
          necesidad y por que deberia hablar con nosotros.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="site-container card-grid card-grid--three">
        <article class="surface-card service-card service-card--full" *ngFor="let service of serviceCards">
          <div class="service-card__header">
            <span class="chip">{{ service.badge }}</span>
            <h2>{{ service.name }}</h2>
            <p>{{ service.summary }}</p>
          </div>
          <div class="service-card__body">
            <div>
              <strong>Para quien encaja</strong>
              <ul class="plain-list">
                <li *ngFor="let item of service.fit.slice(0, 2)">{{ item }}</li>
              </ul>
            </div>
            <div>
              <strong>Que suele desbloquear</strong>
              <ul class="plain-list">
                <li *ngFor="let outcome of service.outcomes.slice(0, 2)">{{ outcome }}</li>
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

    <section class="section section-dark">
      <div class="site-container section-head section-head--light">
        <span class="eyebrow">Chatbots como servicio pilar</span>
        <h2>La automatizacion conversacional ya tiene una landing propia dentro de la oferta.</h2>
        <p>
          Esto evita diluir chatbots dentro de IA y permite explicar mejor
          canales, integraciones, soporte, captacion y casos de uso reales.
        </p>
      </div>
      <div class="site-container card-grid card-grid--four">
        <article class="surface-card surface-card--soft-dark" *ngFor="let item of chatbotCases">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </article>
      </div>
      <div class="site-container spotlight-actions">
        <a class="button button-primary" routerLink="/servicios/desarrollo-chatbots-empresas">
          Explorar servicio de chatbots
        </a>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container section-head">
        <span class="eyebrow">Soluciones por necesidad</span>
        <h2>Arquitectura de contenidos pensada para intencion comercial, no para canibalizar.</h2>
      </div>
      <div class="site-container card-grid card-grid--two">
        <article class="surface-card" *ngFor="let need of needs">
          <h3>{{ need.title }}</h3>
          <p>{{ need.description }}</p>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container section-head">
        <span class="eyebrow">Proceso</span>
        <h2>Asi reducimos riesgo y damos claridad al cliente antes de desarrollar.</h2>
      </div>
      <div class="site-container timeline-grid timeline-grid--light">
        <article class="timeline-step timeline-step--light" *ngFor="let step of steps">
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
        </article>
      </div>
    </section>

    <section class="section section-dark">
      <div class="site-container final-cta">
        <div>
          <span class="eyebrow">Siguiente paso</span>
          <h2>Si no sabes aun que servicio encaja, empezamos por un diagnostico y definimos el mapa correcto.</h2>
        </div>
        <div class="cta-actions">
          <a class="button button-primary" routerLink="/contacto">Solicitar diagnostico</a>
          <a class="button button-ghost" routerLink="/metodologia">Ver metodologia</a>
        </div>
      </div>
    </section>
  `,
})
export class ServicesPageComponent implements OnInit {
  serviceCards = services;
  chatbotCases = chatbotSpotlight;
  steps = processSteps;
  needs = solutionNeeds;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Servicios de software, automatizacion, chatbots e IA",
      description:
        "Pagina de servicios orientada a captacion: software a medida, automatizacion de procesos, chatbots para empresas, IA aplicada, plataformas SaaS y consultoria tecnologica.",
      path: "/servicios",
      keywords: [
        "servicios de software a medida",
        "chatbots para empresas",
        "automatizacion empresarial",
        "consultoria tecnologica",
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
