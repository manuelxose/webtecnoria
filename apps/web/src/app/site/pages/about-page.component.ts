import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import {
  brandImages,
  differentiators,
  proofMoments,
  trustStatements,
} from "../content/site-content";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-about-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-hero section">
      <div class="site-container page-hero__split page-hero__split--visual">
        <div class="page-hero__copy">
          <span class="eyebrow">Empresa</span>
          <h1>Una compañía tecnológica orientada a resolver cuellos de botella reales, no a impresionar con jerga.</h1>
          <p class="lead">
            TecnoRia trabaja donde negocio, sistema y ejecución deben alinearse.
            Nos interesan proyectos donde la tecnología tenga una función clara
            y pueda defenderse tanto desde producto como desde operativa.
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
      <div class="site-container card-grid card-grid--two">
        <article class="surface-card">
          <span class="chip chip-soft">Cómo pensamos</span>
          <h2>La tecnología debe servir a una decisión de negocio, a un proceso o a un producto mejor resuelto.</h2>
          <ul class="plain-list">
            <li *ngFor="let statement of statements">{{ statement }}</li>
          </ul>
        </article>
        <article class="surface-card">
          <span class="chip chip-soft">Lo que valoramos</span>

          <div class="stack-list">
            <div *ngFor="let item of principles">
              <strong>{{ item.title }}</strong>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container profile-grid">
        <article class="profile-card">
          <span class="chip chip-soft">Encaje</span>
          <h3>Entramos mejor cuando el problema importa de verdad.</h3>
          <p>
            Procesos tensados, software que ya no acompaña, producto en fase
            de crecimiento o una decisión de IA que necesita gobierno serio.
          </p>
        </article>
        <article class="profile-card">
          <span class="chip chip-soft">Forma de colaborar</span>
          <h3>Preferimos conversaciones honestas a promesas grandilocuentes.</h3>
          <p>
            Si no vemos encaje o creemos que el orden correcto es otro, lo
            diremos. El objetivo es decidir bien, no cerrar una llamada bonita.
          </p>
        </article>
        <article class="profile-card">
          <span class="chip chip-soft">Lo que no hacemos</span>
          <h3>No forzamos IA, automatización o build si la base aún no está lista.</h3>
          <p>
            No nos interesa vender una capa vistosa si va a romper adopción,
            complejidad o mantenibilidad a medio plazo.
          </p>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container section-head">
        <span class="eyebrow">Por qué trabajamos así</span>
        <h2>Un proyecto bien definido necesita criterio tanto técnico como ejecutivo.</h2>
      </div>

      <div class="site-container card-grid card-grid--four">
        <article class="surface-card insight-card" *ngFor="let item of differentiatorBlocks">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section class="section section-dark">
      <div class="site-container final-cta">
        <div>
          <span class="eyebrow">Relaciones de trabajo</span>
          <h2>Buscamos relaciones claras, con objetivos compartidos, decisiones defendibles y una base que pueda seguir creciendo.</h2>
          <p>
            Si necesitas un partner técnico que piense en sistema, arquitectura
            y adopción, no solo en entregar una funcionalidad, probablemente
            encajemos bien.
          </p>
        </div>
        <div class="cta-actions">
          <a class="button button-primary" routerLink="/contacto">Hablar con el equipo</a>
          <a class="button button-ghost" routerLink="/metodologia">Ver método</a>
        </div>
      </div>
    </section>
  `,
})
export class AboutPageComponent implements OnInit {
  visual = brandImages.method;
  statements = trustStatements;
  principles = proofMoments;
  differentiatorBlocks = differentiators;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Empresa tecnológica con foco en criterio, arquitectura y ejecución",
      description:
        "TecnoRia es una empresa tecnológica orientada a software a medida, automatización, IA aplicada y plataformas con un enfoque claro de negocio y sistema.",
      path: "/empresa",
      imagePath: this.visual.src,
      keywords: [
        "empresa de desarrollo de software",
        "consultora tecnológica",
        "ingeniería de software para empresas",
      ],
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Empresa", path: "/empresa" },
        ]),
      ],
    });
  }
}
