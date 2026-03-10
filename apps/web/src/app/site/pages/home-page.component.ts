import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ContactFormComponent } from "../components/contact-form.component";
import {
  audienceSegments,
  benefitBlocks,
  caseStudies,
  chatbotSpotlight,
  differentiators,
  generalFaqs,
  heroHighlights,
  painPoints,
  processSteps,
  services,
  trustStatements,
} from "../content/site-content";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-home-page",
  standalone: true,
  imports: [CommonModule, RouterModule, ContactFormComponent],
  template: `
    <section class="hero-section section">
      <div class="site-container hero-grid">
        <div class="hero-copy">
          <span class="eyebrow">Software, automatizacion, IA y chatbots</span>
          <h1>
            Desarrollamos software, automatizacion, IA y chatbots para empresas
            que necesitan operar mejor y crecer con una base solida.
          </h1>
          <p class="lead">
            Creamos herramientas internas, plataformas y sistemas
            conversacionales para eliminar trabajo manual, conectar procesos y
            convertir tecnologia en una ventaja operativa y comercial.
          </p>

          <div class="hero-actions">
            <a class="button button-primary" routerLink="/contacto">
              Solicitar diagnostico
            </a>
            <a class="button button-secondary" routerLink="/servicios">
              Ver servicios
            </a>
          </div>

          <div class="bullet-list">
            <div class="bullet-list__item" *ngFor="let item of highlights">
              <span class="bullet-dot"></span>
              <span>{{ item }}</span>
            </div>
          </div>
        </div>

        <aside class="hero-panel surface-card surface-card--contrast">
          <span class="panel-label">Diagnostico inicial</span>
          <h2>Menos caos operativo. Mas control. Mejor capacidad de respuesta.</h2>
          <p>
            Analizamos que frena hoy al negocio y proponemos la siguiente mejor
            decision: software, automatizacion, chatbot, IA o una combinacion
            razonable entre ellas.
          </p>

          <div class="panel-stack">
            <div class="mini-metric" *ngFor="let statement of trust">
              {{ statement }}
            </div>
          </div>
        </aside>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container card-grid card-grid--three">
        <article class="surface-card trust-card">
          <span class="chip chip-soft">Metodo</span>
          <h3>Discovery antes de construir</h3>
          <p>Empezamos por contexto, prioridades y riesgos para no vender una solucion incorrecta.</p>
        </article>
        <article class="surface-card trust-card">
          <span class="chip chip-soft">Encaje</span>
          <h3>Empresas y proyectos con necesidad real</h3>
          <p>La web esta pensada para captar demanda cualificada, no visitas curiosas sin encaje.</p>
        </article>
        <article class="surface-card trust-card">
          <span class="chip chip-soft">Respuesta</span>
          <h3>Contacto claro y sin humo</h3>
          <p>Respondemos rapido, decimos si encaja y proponemos un siguiente paso realista.</p>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container split-head split-head--compact">
        <div>
          <span class="eyebrow">Problemas habituales</span>
          <h2>Cuando la tecnologia no acompana, el negocio lo paga en tiempo, errores y friccion.</h2>
        </div>
      </div>
      <div class="site-container card-grid card-grid--two">
        <article class="surface-card" *ngFor="let pain of pains">
          <h3>{{ pain }}</h3>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container section-head">
        <span class="eyebrow">Servicios principales</span>
        <h2>Seis lineas de servicio pensadas para captar necesidad real y llevarla a una propuesta viable.</h2>
        <p>
          Chatbots entra como servicio pilar dentro de la oferta, con su propia
          landing, su propio mensaje y una relacion clara con automatizacion e IA.
        </p>
      </div>

      <div class="site-container card-grid card-grid--three">
        <article class="service-card surface-card service-card--stacked" *ngFor="let service of serviceCards">
          <span class="chip">{{ service.badge }}</span>
          <h3>{{ service.name }}</h3>
          <p>{{ service.summary }}</p>
          <ul class="plain-list">
            <li *ngFor="let useCase of service.useCases.slice(0, 3)">{{ useCase }}</li>
          </ul>
          <div class="service-card__footer">
            <a class="text-link" [routerLink]="service.seo.path">Explorar servicio</a>
          </div>
        </article>
      </div>
    </section>

    <section class="section section-dark">
      <div class="site-container section-head section-head--light">
        <span class="eyebrow">Automatizacion conversacional</span>
        <h2>Chatbots y asistentes virtuales para captar, responder y activar procesos.</h2>
        <p>
          No se plantean como un extra decorativo. Se disenan como una capa
          operativa conectada a negocio, soporte y conversion.
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
          Ver landing de chatbots
        </a>
        <a class="button button-ghost" routerLink="/servicios/inteligencia-artificial-empresas">
          Ver IA aplicada
        </a>
      </div>
    </section>

    <section class="section">
      <div class="site-container section-head">
        <span class="eyebrow">Beneficios</span>
        <h2>Que gana el cliente cuando la solucion esta bien planteada.</h2>
      </div>

      <div class="site-container card-grid card-grid--four">
        <article class="surface-card" *ngFor="let benefit of benefits">
          <h3>{{ benefit.title }}</h3>
          <p>{{ benefit.description }}</p>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container split-head">
        <div>
          <span class="eyebrow">Casos de exito</span>
          <h2>Historias de resultado orientadas a negocio.</h2>
        </div>
        <a class="button button-secondary" routerLink="/casos-de-exito">
          Ver todos los casos
        </a>
      </div>

      <div class="site-container card-grid card-grid--three">
        <article class="surface-card surface-card--story" *ngFor="let item of cases">
          <span class="chip chip-soft">{{ item.sector }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.summary }}</p>
          <div class="story-block">
            <strong>Problema</strong>
            <p>{{ item.problem }}</p>
          </div>
          <div class="story-block">
            <strong>Resultado</strong>
            <ul class="plain-list">
              <li *ngFor="let impact of item.impact">{{ impact }}</li>
            </ul>
          </div>
          <a class="text-link" [routerLink]="item.ctaLink">{{ item.ctaLabel }}</a>
        </article>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container section-head">
        <span class="eyebrow">Para quien trabajamos</span>
        <h2>Captamos empresas, startups y proyectos emprendedores sin mezclar mensajes.</h2>
      </div>

      <div class="site-container card-grid card-grid--three">
        <article class="surface-card" *ngFor="let segment of segments">
          <h3>{{ segment.title }}</h3>
          <p>{{ segment.description }}</p>
          <ul class="plain-list">
            <li *ngFor="let bullet of segment.bullets">{{ bullet }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container section-head">
        <span class="eyebrow">Metodologia</span>
        <h2>Un proceso claro reduce miedo, ordena prioridades y mejora la conversion.</h2>
      </div>

      <div class="site-container timeline-grid timeline-grid--light">
        <article class="timeline-step timeline-step--light" *ngFor="let step of steps">
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container section-head">
        <span class="eyebrow">Por que TecnoRia</span>
        <h2>Diferenciadores pensados para aumentar confianza antes del contacto.</h2>
      </div>

      <div class="site-container card-grid card-grid--four">
        <article class="surface-card" *ngFor="let item of differentiatorBlocks">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container split-head">
        <div>
          <span class="eyebrow">FAQ comercial</span>
          <h2>Resolvemos objeciones antes de pedir una reunion.</h2>
        </div>
        <a class="button button-secondary" routerLink="/faq">Ver FAQ completa</a>
      </div>

      <div class="site-container faq-list">
        <details class="faq-item" *ngFor="let faq of homeFaqs">
          <summary>{{ faq.question }}</summary>
          <p>{{ faq.answer }}</p>
        </details>
      </div>
    </section>

    <section class="section section-dark">
      <div class="site-container final-cta">
        <div>
          <span class="eyebrow">Diagnostico inicial</span>
          <h2>Si tienes un proceso que no escala, un chatbot que debe integrarse o una idea que necesita ejecutarse bien, hablemos.</h2>
          <p>
            Revisamos contexto, prioridad y siguiente mejor paso para mover el
            proyecto sin humo y sin comprometer mas de lo necesario.
          </p>
        </div>
        <div class="cta-actions">
          <a class="button button-primary" routerLink="/contacto">Solicitar reunion</a>
          <a class="button button-ghost" routerLink="/servicios/desarrollo-chatbots-empresas">
            Ver servicio de chatbots
          </a>
        </div>
      </div>
    </section>

    <app-contact-form></app-contact-form>
  `,
})
export class HomePageComponent implements OnInit {
  highlights = heroHighlights;
  trust = trustStatements;
  pains = painPoints;
  serviceCards = services;
  chatbotCases = chatbotSpotlight;
  benefits = benefitBlocks;
  cases = caseStudies;
  segments = audienceSegments;
  steps = processSteps;
  differentiatorBlocks = differentiators;
  homeFaqs = generalFaqs.slice(0, 5);

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Software a medida, automatizacion, IA y chatbots para empresas",
      description:
        "Creamos software a medida, plataformas, automatizaciones, chatbots e integraciones de IA para empresas, startups y proyectos digitales con foco en eficiencia y conversion.",
      path: "/",
      keywords: [
        "software a medida para empresas",
        "automatizacion de procesos",
        "chatbots para empresas",
        "inteligencia artificial para empresas",
      ],
      schemas: [this.seo.createFaqSchema(this.homeFaqs)],
    });
  }
}
