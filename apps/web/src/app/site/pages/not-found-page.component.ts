import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-not-found-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-hero section">
      <div class="site-container page-hero__inner">
        <span class="eyebrow">404</span>
        <h1>La pagina que buscas ya no forma parte del recorrido principal.</h1>
        <p class="lead">
          Hemos reorganizado la web para concentrarla en software a medida,
          automatizacion, IA y conversion comercial.
        </p>
        <div class="hero-actions">
          <a class="button button-primary" routerLink="/">Volver a la home</a>
          <a class="button button-secondary" routerLink="/mapa-web">Ver mapa web</a>
        </div>
      </div>
    </section>
  `,
})
export class NotFoundPageComponent implements OnInit {
  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Pagina no encontrada",
      description:
        "La URL solicitada no coincide con la nueva arquitectura de la web.",
      path: "/404",
      noIndex: true,
    });
  }
}
