import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { brandImages, generalFaqs } from "../content/site-content";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-faq-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-hero section">
      <div class="site-container page-hero__inner">
        <span class="eyebrow">FAQ</span>
        <h1>Preguntas frecuentes que resuelven dudas reales antes de dar el siguiente paso.</h1>
        <p class="lead">
          Esta FAQ está pensada para resolver dudas sobre encaje, tiempos,
          mantenimiento, IA, automatización, software existente y forma de
          trabajo antes de solicitar un diagnóstico.
        </p>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container card-grid card-grid--three">
        <article class="surface-card contact-card">
          <span class="chip chip-soft">Encaje</span>
          <p>Si el proyecto tiene una necesidad clara y un impacto potencial real, nos interesa revisarlo contigo.</p>
        </article>
        <article class="surface-card contact-card">
          <span class="chip chip-soft">Método</span>
          <p>No saltamos a build sin un mínimo de discovery cuando el problema aún está mal definido.</p>
        </article>
        <article class="surface-card contact-card">
          <span class="chip chip-soft">Evolución</span>
          <p>Diseñamos para que el sistema pueda seguir creciendo después del lanzamiento inicial.</p>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container faq-list">
        <details class="faq-item" *ngFor="let faq of faqs">
          <summary>{{ faq.question }}</summary>
          <p>{{ faq.answer }}</p>
        </details>
      </div>
    </section>

    <section class="section section-dark">
      <div class="site-container final-cta">
        <div>
          <span class="eyebrow">¿Aún con dudas?</span>
          <h2>Lo más rápido es revisar tu contexto y decirte si tiene sentido avanzar, redefinir o esperar.</h2>
        </div>
        <div class="cta-actions">
          <a class="button button-primary" routerLink="/contacto">Hablar con nosotros</a>
          <a class="button button-ghost" routerLink="/servicios">Ver servicios</a>
        </div>
      </div>
    </section>
  `,
})
export class FaqPageComponent implements OnInit {
  faqs = generalFaqs;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Preguntas frecuentes sobre software, automatización e IA aplicada",
      description:
        "FAQ de TecnoRia para resolver dudas sobre proyectos, encaje, tiempos, mantenimiento, chatbots, IA aplicada y evolución de software existente.",
      path: "/faq",
      imagePath: brandImages.method.src,
      keywords: [
        "faq software a medida",
        "preguntas frecuentes automatización",
        "faq chatbots para empresas",
      ],
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ]),
        this.seo.createFaqSchema(this.faqs),
      ],
    });
  }
}
