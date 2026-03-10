import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ContactFormComponent } from "../../core/pages/home/components/contact-form/contact-form.component";
import {
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
      <div class="site-container page-hero__inner page-hero__split">
        <div>
          <span class="eyebrow">Contacto</span>
          <h1>La web debe hacer facil el contacto, no esconderlo.</h1>
          <p class="lead">
            Cuentanos tu caso, tu bloqueo o tu idea. Te diremos si encaja, que
            nivel de prioridad tiene y cual puede ser el siguiente paso realista.
          </p>
        </div>
        <aside class="surface-card">
          <span class="panel-label">Canales directos</span>
          <ul class="plain-list">
            <li><a [href]="'tel:' + phone">{{ phoneLabel }}</a></li>
            <li><a [href]="'mailto:' + email">{{ email }}</a></li>
            <li>{{ region }}</li>
            <li>Respuesta inicial en menos de 24 horas laborables.</li>
          </ul>
        </aside>
      </div>
    </section>

    <app-contact-form></app-contact-form>
  `,
})
export class ContactPageComponent implements OnInit {
  email = SITE_EMAIL;
  phone = SITE_PHONE;
  phoneLabel = SITE_PHONE_LABEL;
  region = SITE_REGION;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Contacto para software a medida, automatizacion e IA",
      description:
        "Pagina de contacto optimizada para conversion: formulario claro, canales directos y propuesta de diagnostico inicial sin compromiso.",
      path: "/contacto",
      keywords: ["contacto empresa desarrollo software", "pedir presupuesto software a medida"],
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contacto", path: "/contacto" },
        ]),
      ],
    });
  }
}
