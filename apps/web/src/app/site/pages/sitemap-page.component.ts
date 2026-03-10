import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { sitemapGroups } from "../content/site-content";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-sitemap-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-hero section">
      <div class="site-container page-hero__inner">
        <span class="eyebrow">Mapa web</span>
        <h1>Arquitectura de contenidos preparada para SEO y escaneo rapido.</h1>
        <p class="lead">
          Este mapa web recoge la estructura principal, las landings de servicio
          y el contenido editorial de apoyo a captacion.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="site-container card-grid card-grid--three">
        <article class="surface-card" *ngFor="let group of groups">
          <h2>{{ group.title }}</h2>
          <ul class="footer-list">
            <li *ngFor="let link of group.links">
              <a [routerLink]="link.path">{{ link.label }}</a>
            </li>
          </ul>
        </article>
      </div>
    </section>
  `,
})
export class SitemapPageComponent implements OnInit {
  groups = sitemapGroups;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Mapa web",
      description:
        "Mapa web con la estructura principal de servicios, soluciones, blog y paginas de conversion de TecnoRia.",
      path: "/mapa-web",
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Mapa web", path: "/mapa-web" },
        ]),
      ],
    });
  }
}
