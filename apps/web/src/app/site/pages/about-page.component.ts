import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { differentiators, trustStatements } from "../content/site-content";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-about-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-hero section">
      <div class="site-container page-hero__inner">
        <span class="eyebrow">Empresa</span>
        <h1>Una empresa tecnologica que quiere ser util al negocio, no impresionar con jerga.</h1>
        <p class="lead">
          La pagina "sobre nosotros" refuerza criterio, cercania y capacidad de
          ejecucion. No se centra en biografia, sino en como pensamos y
          trabajamos.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="site-container card-grid card-grid--two">
        <article class="surface-card">
          <h2>Como trabajamos</h2>
          <p>
            Nos interesan proyectos donde la tecnologia tiene una funcion
            concreta: ordenar operativa, crear una ventaja propia o lanzar un
            producto con base seria.
          </p>
          <ul class="plain-list">
            <li *ngFor="let statement of statements">{{ statement }}</li>
          </ul>
        </article>
        <article class="surface-card">
          <h2>Que nos diferencia</h2>
          <div class="stack-list">
            <div *ngFor="let item of differentiatorBlocks">
              <strong>{{ item.title }}</strong>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="section section-dark">
      <div class="site-container final-cta">
        <div>
          <span class="eyebrow">Confianza</span>
          <h2>Buscamos relaciones de trabajo claras, con objetivos compartidos y decisiones defendibles.</h2>
        </div>
        <div class="cta-actions">
          <a class="button button-primary" routerLink="/contacto">Hablar con el equipo</a>
          <a class="button button-ghost" routerLink="/metodologia">Ver metodologia</a>
        </div>
      </div>
    </section>
  `,
})
export class AboutPageComponent implements OnInit {
  statements = trustStatements;
  differentiatorBlocks = differentiators;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Empresa tecnologica con foco en negocio y ejecucion",
      description:
        "Pagina de empresa enfocada a transmitir criterio, confianza y capacidad de convertir problemas de negocio en soluciones tecnicas mantenibles.",
      path: "/empresa",
      keywords: ["empresa de desarrollo de software", "consultora tecnologica"],
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Empresa", path: "/empresa" },
        ]),
      ],
    });
  }
}
