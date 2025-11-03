import { Component } from "@angular/core";

@Component({
  selector: "app-posicionamiento-seo-amazon",
  templateUrl: "./posicionamiento-seo.component.html",
  styleUrls: ["./posicionamiento-seo.component.css"],
  standalone: true,
  imports: [],
})
export class PosicionamientoSeoComponent {
  public testimonialData = [
    {
      profile: "assets/images/client/02.jpg",
      name: "Ana",
      designation: "Directora de Marketing",
      message: `"Nuestra experiencia con Tecnoria ha sido excelente, desde el primer momento supieron entender nuestra visión y trabajar de la mano con nosotros para conseguir el mejor resultado. Recomendamos totalmente sus servicios de diseño web y marketing digital."`,
    },
    {
      profile: "assets/images/client/01.jpg",
      name: "Juan",
      designation: "Propietario de Tienda Online",
      message: `" Tecnoria se encargó de la creación de nuestra tienda online y estamos muy satisfechos con el resultado final. El equipo es muy profesional y siempre dispuesto a ayudar en todo lo necesario. "`,
    },
    {
      profile: "assets/images/client/03.jpg",
      name: "María",
      designation: "Director de Marketing",
      message: `" Tecnoria nos ayudó a crear una página web que reflejaba exactamente lo que queríamos y necesitábamos. El equipo fue muy atento y amable en todo momento, siempre dispuesto a escuchar nuestras necesidades y ayudarnos a conseguir el mejor resultado. Recomendamos sus servicios sin duda alguna. "`,
    },
    {
      profile: "assets/images/client/04.jpg",
      name: "Antonio",
      designation: "Gerente de Recursos Humanos",
      message: `" Tecnoria nos ayudó a dar un gran cambio en la imagen de nuestra empresa, gracias a su experiencia en branding y diseño web. Recomendamos sus servicios sin duda alguna. "`,
    },
    {
      profile: "assets/images/client/05.jpg",
      name: "Lucía",
      designation: "Director de Ventas",
      message: `" Trabajar con Tecnoria ha sido una gran experiencia, el equipo es muy creativo y siempre busca superar las expectativas del cliente. Recomendamos sus servicios de marketing digital. "`,
    },
    {
      profile: "assets/images/client/06.jpg",
      name: "Pedro",
      designation: "Gerente de Marketing",
      message: `" Tecnoria es un equipo muy profesional y con un gran conocimiento en diseño web y marketing digital. Estamos muy satisfechos con el trabajo realizado y recomendamos sus servicios sin duda alguna. "`,
    },
  ];

  public location = "Galicia";
}
