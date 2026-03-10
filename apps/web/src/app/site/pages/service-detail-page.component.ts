import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { ContactFormComponent } from "../../core/pages/home/components/contact-form/contact-form.component";
import { caseStudies, getServiceByKey, ServiceEntry } from "../content/site-content";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-service-detail-page",
  standalone: true,
  imports: [CommonModule, RouterModule, ContactFormComponent],
  template: `
    <ng-container *ngIf="service as current">
      <section class="page-hero section">
        <div class="site-container page-hero__inner page-hero__split">
          <div>
            <span class="eyebrow">{{ current.badge }}</span>
            <h1>{{ current.heroTitle }}</h1>
            <p class="lead">{{ current.heroIntro }}</p>
            <div class="hero-actions">
              <a class="button button-primary" routerLink="/contacto">
                Pedir propuesta
              </a>
              <a class="button button-secondary" routerLink="/casos-de-exito">
                Ver casos de exito
              </a>
            </div>
          </div>
          <aside class="surface-card">
            <span class="panel-label">Ideal para</span>
            <ul class="plain-list">
              <li *ngFor="let item of current.fit">{{ item }}</li>
            </ul>
          </aside>
        </div>
      </section>

      <section class="section">
        <div class="site-container card-grid card-grid--two">
          <article class="surface-card">
            <h2>Que problema resuelve</h2>
            <ul class="plain-list">
              <li *ngFor="let item of current.pains">{{ item }}</li>
            </ul>
          </article>
          <article class="surface-card">
            <h2>Que gana tu negocio</h2>
            <ul class="plain-list">
              <li *ngFor="let item of current.outcomes">{{ item }}</li>
            </ul>
          </article>
        </div>
      </section>

      <section class="section section-accent">
        <div class="site-container card-grid card-grid--two">
          <article class="surface-card">
            <h2>Que incluye</h2>
            <ul class="plain-list">
              <li *ngFor="let item of current.deliverables">{{ item }}</li>
            </ul>
          </article>
          <article class="surface-card">
            <h2>Casos de uso habituales</h2>
            <ul class="plain-list">
              <li *ngFor="let item of current.useCases">{{ item }}</li>
            </ul>
          </article>
        </div>
      </section>

      <section class="section">
        <div class="site-container split-head">
          <div>
            <span class="eyebrow">Casos relacionados</span>
            <h2>Pruebas de aplicacion real orientadas a conversion.</h2>
          </div>
        </div>

        <div class="site-container card-grid card-grid--three">
          <article class="surface-card surface-card--story" *ngFor="let item of relatedCases">
            <span class="chip chip-soft">{{ item.sector }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.summary }}</p>
            <ul class="plain-list">
              <li *ngFor="let impact of item.impact">{{ impact }}</li>
            </ul>
            <a class="text-link" [routerLink]="item.ctaLink">{{ item.ctaLabel }}</a>
          </article>
        </div>
      </section>

      <section class="section">
        <div class="site-container section-head">
          <span class="eyebrow">Preguntas frecuentes</span>
          <h2>Objeciones comunes antes del contacto.</h2>
        </div>
        <div class="site-container faq-list">
          <details class="faq-item" *ngFor="let faq of current.faqs">
            <summary>{{ faq.question }}</summary>
            <p>{{ faq.answer }}</p>
          </details>
        </div>
      </section>

      <section class="section section-dark">
        <div class="site-container final-cta">
          <div>
            <span class="eyebrow">CTA final</span>
            <h2>Si este servicio encaja con tu problema, te ayudamos a convertirlo en un plan ejecutable.</h2>
          </div>
          <div class="cta-actions">
            <a class="button button-primary" routerLink="/contacto">Solicitar presupuesto</a>
            <a class="button button-ghost" routerLink="/servicios">Ver todos los servicios</a>
          </div>
        </div>
      </section>

      <app-contact-form></app-contact-form>
    </ng-container>
  `,
})
export class ServiceDetailPageComponent implements OnInit {
  service?: ServiceEntry;
  relatedCases = caseStudies;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly seo: SeoService
  ) {}

  ngOnInit(): void {
    const serviceKey = this.route.snapshot.data["serviceKey"] as string;
    this.service = getServiceByKey(serviceKey);

    if (!this.service) {
      return;
    }

    this.seo.update({
      title: this.service.seo.title,
      description: this.service.seo.description,
      path: this.service.seo.path,
      keywords: this.service.seo.keywords,
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Servicios", path: "/servicios" },
          { name: this.service.name, path: this.service.seo.path },
        ]),
        this.seo.createServiceSchema(
          this.service.name,
          this.service.seo.description,
          this.service.seo.path
        ),
        this.seo.createFaqSchema(this.service.faqs),
      ],
    });
  }
}
