import { Component } from "@angular/core";
import { OwlOptions } from "ngx-owl-carousel-o";
import { ImageResizeService } from "src/app/services/image-resize.service";

@Component({
  selector: "disenio-web",
  templateUrl: "./disenio-web.component.html",
  styleUrls: ["./disenio-web.component.css"],
  standalone: true,
  imports: [],
})
export class DisenioWebComponent {
  imagePath: string;

  constructor(private screenDetectionService: ImageResizeService) {}

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    autoplay: true,
    navSpeed: 700,
    navText: ["", ""],
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 2,
      },
      900: {
        items: 3,
      },
    },
    nav: false,
  };

  seoAgency = [
    {
      images: "assets/images/seo/6.png",
    },
    {
      images: "assets/images/seo/4.png",
    },
    {
      images: "assets/images/seo/7.png",
    },
    {
      images: "assets/images/seo/5.png",
    },
    {
      images: "assets/images/seo/3.png",
    },
    {
      images: "assets/images/seo/1.png",
    },
    {
      images: "assets/images/seo/2.png",
    },
  ];

  blogData = [
    {
      image: "assets/images/blog/01.jpg",
      title: "Design your apps in your own way",
      like: "33",
      message: "08",
      name: "Calvin Carlo",
      date: "13th August, 2019",
    },
    {
      image: "assets/images/blog/02.jpg",
      title: "How apps is changing the IT world",
      like: "33",
      message: "08",
      name: "Calvin Carlo",
      date: "13th August, 2019",
    },
    {
      image: "assets/images/blog/03.jpg",
      title: "Smartest Applications for Business",
      like: "33",
      message: "08",
      name: "Calvin Carlo",
      date: "13th August, 2019",
    },
  ];

  /**
   * Services Data
   */
  servicesData = [
    {
      icon: "uil uil-chart-line h1 text-primary",
      title: "Grow your traffic",
      description:
        "Nisi aenean vulputate eleifend tellus vitae eleifend enim a eleifend Aliquamaenean elementum semper.",
    },
    {
      icon: "uil uil-adjust-circle h1 text-primary",
      title: "Get quality leads",
      description:
        "Allegedly, a Latin scholar established the origin of the established text by compiling unusual word.",
    },
    {
      icon: "uil uil-award h1 text-primary",
      title: "Drive more sell",
      description:
        "It seems that only fragments of the original text remain in only fragments the Lorem Ipsum texts used today.",
    },
  ];

  /**
   * Client Testimonial Data
   */
  testimonialData = [
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

  faqList: any[] = [
    {
      question: "¿Qué es el diseño web?",
      answer:
        "El diseño web es el proceso de planificar, crear y mantener sitios web. Incluye la elección de colores, tipografías, imágenes y layout para mejorar la experiencia del usuario y lograr los objetivos del sitio web.",
    },
    {
      question: "¿Qué es el maquetado en el diseño web?",
      answer:
        "El maquetado es el proceso de crear una estructura básica en HTML y CSS para un sitio web. Se encarga de darle forma y estilo al contenido para que sea legible y presentable para los usuarios.",
    },
    {
      question: "¿Qué es el diseño responsive?",
      answer:
        "El diseño responsive es un enfoque de diseño web que permite que un sitio se adapte automáticamente al tamaño de pantalla de los dispositivos que lo visitan. Esto garantiza una experiencia de usuario consistente en dispositivos móviles, tablets y escritorio.",
    },
    {
      question:
        "¿Qué es el diseño gráfico y cómo se relaciona con el diseño web?",
      answer:
        "El diseño gráfico es el proceso de crear diseños visuales y elementos estéticos para una variedad de medios, incluyendo sitios web. El diseño gráfico es una parte importante del diseño web, ya que se encarga de crear los elementos visuales y estéticos de un sitio web, como el logotipo, iconos, imágenes y diseño de página.",
    },
    {
      question: "¿Qué son las guías de estilo en el diseño web?",
      answer:
        "Las guías de estilo son documentos que establecen las normas y pautas para el diseño y la presentación de contenido en un sitio web. Estas guías incluyen elementos como tipografía, colores, imágenes, iconos, etc. y ayudan a mantener una consistencia en el diseño y la experiencia de usuario.",
    },
    {
      question: "¿Trabajamos con cualquier plataforma?",
      answer:
        "Sí, nuestro equipo de diseñadores web está especializado en trabajar con diferentes plataformas como WordPress, Wix, Shopify, entre otras, además ofrecemos soluciones de diseño a medida.",
    },
    {
      question: "¿Trabajamos con cualquier plataforma?",
      answer:
        "Sí, nuestro equipo de diseñadores web está especializado en trabajar con diferentes plataformas como WordPress, Wix, Shopify, entre otras, además ofrecemos soluciones de diseño a medida.",
    },
    {
      question: "¿Trabajamos con cualquier plataforma?",
      answer:
        "Sí, nuestro equipo de diseñadores web está especializado en trabajar con diferentes plataformas como WordPress, Wix, Shopify, entre otras, además ofrecemos soluciones de diseño a medida.",
    },
  ];

  isActive: string = "month";

  /**
   * Tab change value
   * @param value
   */
  changeTab(value: string) {
    this.isActive = value;
  }

  ngOnInit() {
    const screenWidth = this.screenDetectionService.getScreenWidth();

    if (screenWidth < 768) {
      this.imagePath = "assets/images/diseño-web/mobile/";
    } else if (screenWidth >= 768 && screenWidth < 992) {
      this.imagePath = "assets/images/diseño-web/tablet/";
    } else if (screenWidth >= 992) {
      this.imagePath = "assets/images/diseño-web/desktop/";
    }
    // asig
  }
}
