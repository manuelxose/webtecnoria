import { Component } from "@angular/core";

@Component({
    selector: "app-faq",
    templateUrl: "./faq.component.html",
    styleUrls: ["./faq.component.css"],
    imports: []
})
export class FaqComponent {
  public faqContent: any = [
    {
      title: "",
      description: "",
    },
  ];

  constructor() {}

  ngOnInit(): void {
    this.faqContent = [
      {
        title: "¿Cuáles son los servicios ofrecidos por Tecnoria?",
        desciption:
          "Los servicios ofrecidos por Tecnoria incluyen diseño web, desarrollo de sitios web, optimización de motores de búsqueda (SEO), marketing digital y soporte técnico.",
      },
      {
        title: "¿Qué tipo de diseño web ofrece Tecnoria?",
        desciption:
          "Tecnoria ofrece diseño web personalizado y de calidad para pequeñas empresas. Nuestro equipo de diseñadores web experimentados y creativos se asegura de que su sitio web sea único y atractivo.",
      },
      {
        title: "¿Cómo se asegura Tecnoria de la satisfacción del cliente?",
        desciption:
          "Tecnoria se asegura de que su cliente esté satisfecho con el proyecto de diseño web. Nuestro equipo de diseñadores web experimentados y creativos se asegura de que su sitio web sea único y atractivo.",
      },
      {
        title:
          "¿Qué diferencia a Tecnoria de otras agencias de diseño web en Vigo?",
        desciption:
          "Tecnoria se diferencia de otras agencias de diseño web en Vigo porque ofrece un servicio personalizado y de calidad a un precio asequible. Nuestro equipo de diseñadores web experimentados y creativos se asegura de que su sitio web sea único y atractivo.",
      },
      {
        title: "¿Cuánto cuesta trabajar con Tecnoria?",
        desciption:
          "Tecnoria ofrece un servicio personalizado y de calidad a un precio asequible. Nuestro equipo de diseñadores web experimentados y creativos se asegura de que su sitio web sea único y atractivo.",
      },
      {
        title:
          "¿Qué tipo de tecnologías utiliza Tecnoria en sus proyectos de diseño web?",
        desciption:
          "Tecnoria utiliza tecnologías de vanguardia en sus proyectos de diseño web. Nuestro equipo de diseñadores web experimentados y creativos se asegura de que su sitio web sea único y atractivo.",
      },
      {
        title:
          "¿Cómo se involucra Tecnoria con su cliente durante el proceso de diseño?",
        desciption:
          "Tecnoria se involucra con su cliente durante el proceso de diseño. Nuestro equipo de diseñadores web experimentados y creativos se asegura de que su sitio web sea único y atractivo.",
      },
      {
        title:
          "¿Cuánto tiempo toma completar un proyecto de diseño web con Tecnoria?",
        desciption:
          "Tecnoria toma aproximadamente 4 semanas para completar un proyecto de diseño web. Nuestro equipo de diseñadores web experimentados y creativos se asegura de que su sitio web sea único y atractivo.",
      },
      {
        title:
          "¿Tecnoria ofrece soporte técnico después del lanzamiento del sitio web?",
        desciption:
          "Tecnoria ofrece soporte técnico después del lanzamiento del sitio web. Nuestro equipo de diseñadores web experimentados y creativos se asegura de que su sitio web sea único y atractivo.",
      },
      {
        title:
          "¿Qué tipo de garantía ofrece Tecnoria en sus proyectos de diseño web?",
        desciption:
          "Tecnoria ofrece una garantía de 6 meses en sus proyectos de diseño web. Nuestro equipo de diseñadores web experimentados y creativos se asegura de que su sitio web sea único y atractivo.",
      },
      {
        title:
          "¿Cómo se asegura Tecnoria de la seguridad y privacidad de los datos del cliente?",
        desciption:
          "Tecnoria se asegura de la seguridad y privacidad de los datos del cliente. Nuestro equipo de diseñadores web experimentados y creativos se asegura de que su sitio web sea único y atractivo.",
      },
      {
        title:
          "¿Tecnoria ofrece opciones de optimización de motores de búsqueda (SEO)?",
        desciption:
          "Tecnoria ofrece opciones de optimización de motores de búsqueda (SEO). Nuestro equipo de diseñadores web experimentados y creativos se asegura de que su sitio web sea único y atractivo.",
      },
      {
        title:
          "¿Tecnoria ofrece integraciones con otras plataformas o herramientas empresariales?",
        desciption:
          "Tecnoria ofrece integraciones con otras plataformas o herramientas empresariales. Nuestro equipo de diseñadores web experimentados y creativos se asegura de que su sitio web sea único y atractivo.",
      },
      {
        title:
          "¿Qué tipo de metodología utiliza Tecnoria en sus proyectos de diseño web?",
        desciption:
          "Tecnoria utiliza una metodología de diseño web ágil. Nuestro equipo de diseñadores web experimentados y creativos se asegura de que su sitio web sea único y atractivo.",
      },
    ];
  }
}
