import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { generalFaqs } from "../content/site-content";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-faq-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-hero section">
      <div class="site-container page-hero__inner">
        <span class="eyebrow">FAQ</span>
        <h1>Preguntas frecuentes que reducen dudas y mejoran conversion.</h1>
        <p class="lead">
          Esta pagina ayuda a resolver objeciones habituales sobre encaje,
          presupuesto, tiempos, mantenimiento, chatbots y forma de trabajo.
        </p>
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
          <span class="eyebrow">Aun con dudas</span>
          <h2>Lo mas rapido es contarnos el contexto y decirte si tiene sentido avanzar.</h2>
        </div>
        <div class="cta-actions">
          <a class="button button-primary" routerLink="/contacto">Hablar con nosotros</a>
          <a class="button button-ghost" routerLink="/servicios/desarrollo-chatbots-empresas">
            Ver chatbots
          </a>
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
      title: "Preguntas frecuentes sobre software, automatizacion, chatbots e IA",
      description:
        "FAQ comercial para resolver dudas sobre proyectos, tiempos, presupuesto, mantenimiento, chatbots y encaje de servicios tecnologicos.",
      path: "/faq",
      keywords: [
        "faq software a medida",
        "preguntas frecuentes automatizacion",
        "chatbots para empresas faq",
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
