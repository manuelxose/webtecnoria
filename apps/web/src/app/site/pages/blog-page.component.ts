import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { articles } from "../content/site-content";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-blog-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-hero section">
      <div class="site-container page-hero__inner">
        <span class="eyebrow">Blog</span>
        <h1>Contenido orientado a decision de compra, no a llenar espacio.</h1>
        <p class="lead">
          El blog responde dudas previas a la contratacion, demuestra criterio y
          empuja al usuario hacia los servicios y el contacto.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="site-container card-grid card-grid--three">
        <article class="surface-card article-card" *ngFor="let article of articleList">
          <span class="chip chip-soft">{{ article.category }}</span>
          <h2>{{ article.title }}</h2>
          <p>{{ article.summary }}</p>
          <div class="article-meta">{{ article.readingTime }}</div>
          <a class="text-link" [routerLink]="article.seo.path">Leer articulo</a>
        </article>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container card-grid card-grid--two">
        <article class="surface-card">
          <h2>Objetivo SEO</h2>
          <p>
            Captar demanda de consideracion comercial con articulos que conecten
            directamente con software a medida, automatizacion, plataformas e IA.
          </p>
        </article>
        <article class="surface-card">
          <h2>Objetivo CRO</h2>
          <p>
            Cada contenido incorpora un siguiente paso claro: explorar un
            servicio, pedir diagnostico o comparar alternativas con criterio.
          </p>
        </article>
      </div>
    </section>
  `,
})
export class BlogPageComponent implements OnInit {
  articleList = articles;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Blog sobre software a medida, automatizacion e IA aplicada",
      description:
        "Blog de intencion comercial con articulos sobre software a medida, automatizacion, plataformas SaaS y decision tecnologica para empresas.",
      path: "/blog",
      keywords: ["blog software a medida", "automatizacion para empresas", "crear saas"],
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ]),
      ],
    });
  }
}
