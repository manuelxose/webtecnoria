import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ContactFormComponent } from "../components/contact-form.component";
import {
  brandImages,
  SITE_EMAIL,
  SITE_PHONE,
  SITE_PHONE_LABEL,
  SITE_REGION,
} from "../content/site-content";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-contact-page",
  standalone: true,
  imports: [CommonModule, ContactFormComponent],
  template: `
    <section class="page-hero section">
      <div class="site-container page-hero__split page-hero__split--visual">
        <div class="page-hero__copy">
          <span class="eyebrow">Contacto</span>
          <h1>Cuanto antes aterricemos el contexto, antes sabrás qué decisión tiene sentido tomar.</h1>
          <p class="lead">
            Puedes venir con una idea definida, con un proceso que no escala o
            simplemente con la sensación de que tu stack ya no aguanta bien la
            siguiente etapa. Filtramos encaje y te devolvemos una orientación clara.
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
        <article class="surface-card contact-card">
          <span class="chip chip-soft">Respuesta</span>
          <h2>Primer filtro en menos de 24 horas laborables</h2>
          <p>Te diremos rápido si hay encaje, qué capa parece prioritaria y cuál debería ser el siguiente paso.</p>
        </article>
        <article class="surface-card contact-card">
          <span class="chip chip-soft">Canales directos</span>
          <ul class="plain-list">
            <li><a [href]="'tel:' + phone">{{ phoneLabel }}</a></li>
            <li><a [href]="'mailto:' + email">{{ email }}</a></li>
            <li>{{ region }}</li>
          </ul>
        </article>
        <article class="surface-card contact-card">
          <span class="chip chip-soft">Encaje</span>
          <p>
            Software a medida, automatización, asistentes, IA aplicada,
            plataformas y revisiones de arquitectura o roadmap.
          </p>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container split-stage">
        <div class="section-copy">
          <span class="eyebrow">Qué nos ayuda a responder mejor</span>
          <h2>Cuanto más claro venga el contexto, más útil será nuestra primera respuesta.</h2>
          <ul class="contact-checklist">
            <li>Qué problema operativo, comercial o de producto quieres resolver</li>
            <li>Qué sistema usáis ahora y dónde está la mayor fricción</li>
            <li>Qué urgencia tiene la decisión y qué impacto esperas</li>
            <li>Si ya has hablado con proveedores o existe una idea previa de alcance</li>
          </ul>
        </div>

        <div class="contact-next-grid">
          <article class="contact-step-card">
            <strong>1. Revisamos el encaje</strong>
            <p>Filtramos si el caso pide discovery, una fase de build o una redefinición previa.</p>
          </article>
          <article class="contact-step-card">
            <strong>2. Devolvemos criterio</strong>
            <p>No respondemos con frases vagas. Te diremos qué capa parece prioritaria y por qué.</p>
          </article>
          <article class="contact-step-card">
            <strong>3. Proponemos siguiente paso</strong>
            <p>La salida puede ser discovery, auditoría, roadmap, implementación o incluso esperar.</p>
          </article>
        </div>
      </div>
    </section>

    <app-contact-form></app-contact-form>
  `,
})
export class ContactPageComponent implements OnInit {
  visual = brandImages.method;
  email = SITE_EMAIL;
  phone = SITE_PHONE;
  phoneLabel = SITE_PHONE_LABEL;
  region = SITE_REGION;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Contacto para software, automatización, plataformas e IA aplicada",
      description:
        "Contacta con TecnoRia para software a medida, automatización, plataformas e IA aplicada. Diagnóstico inicial en menos de 24 horas laborables.",
      path: "/contacto",
      imagePath: this.visual.src,
      keywords: [
        "contacto empresa desarrollo software",
        "pedir presupuesto software a medida",
        "contacto automatización procesos",
      ],
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contacto", path: "/contacto" },
        ]),
      ],
    });
  }
}
