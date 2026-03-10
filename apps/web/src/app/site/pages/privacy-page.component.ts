import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SITE_EMAIL } from "../content/site-content";
import { SeoService } from "../services/seo.service";

@Component({
  selector: "app-privacy-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-hero section">
      <div class="site-container page-hero__inner">
        <span class="eyebrow">Privacidad</span>
        <h1>Politica de privacidad</h1>
        <p class="lead">
          Esta pagina resume el uso de los datos enviados desde la web y deja
          claro el canal para ejercer derechos o resolver dudas.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="site-container article-layout">
        <article class="article-content surface-card">
          <section class="article-section">
            <h2>Responsable del tratamiento</h2>
            <p>TecnoRia gestiona los datos enviados desde los formularios de contacto de esta web.</p>
          </section>
          <section class="article-section">
            <h2>Finalidad</h2>
            <p>Usamos los datos para responder solicitudes comerciales, analizar el encaje del proyecto y mantener una conversacion relacionada con el servicio solicitado.</p>
          </section>
          <section class="article-section">
            <h2>Conservacion</h2>
            <p>Los datos se conservan durante el tiempo necesario para gestionar la solicitud o para cumplir obligaciones legales aplicables.</p>
          </section>
          <section class="article-section">
            <h2>Derechos</h2>
            <p>Puedes solicitar acceso, rectificacion, supresion o limitacion escribiendo a <a [href]="'mailto:' + email">{{ email }}</a>.</p>
          </section>
        </article>
      </div>
    </section>
  `,
})
export class PrivacyPageComponent implements OnInit {
  email = SITE_EMAIL;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Politica de privacidad",
      description:
        "Informacion basica sobre tratamiento de datos, uso del formulario de contacto y derechos de las personas usuarias.",
      path: "/politica-de-privacidad",
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Politica de privacidad", path: "/politica-de-privacidad" },
        ]),
      ],
    });
  }
}
