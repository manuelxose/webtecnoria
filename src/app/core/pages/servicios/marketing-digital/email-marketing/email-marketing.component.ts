import { Component } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-email-marketing',
  templateUrl: './email-marketing.component.html',
  styleUrls: ['./email-marketing.component.css']
})
export class EmailMarketingComponent {
  public testimonialData = [
    {
      profile: "assets/images/client/02.jpg",
      name: "Ana",
      designation: "Directora de Marketing",
      message: `"Nuestra experiencia con Tecnoria ha sido excelente, desde el primer momento supieron entender nuestra visión y trabajar de la mano con nosotros para conseguir el mejor resultado. Recomendamos totalmente sus servicios de diseño web y marketing digital."`
    },
    {
      profile: "assets/images/client/01.jpg",
      name: "Juan",
      designation: "Propietario de Tienda Online",
      message: `" Tecnoria se encargó de la creación de nuestra tienda online y estamos muy satisfechos con el resultado final. El equipo es muy profesional y siempre dispuesto a ayudar en todo lo necesario. "`
    },
    {
      profile: "assets/images/client/03.jpg",
      name: "María",
      designation: "Director de Marketing",
      message: `" Tecnoria nos ayudó a crear una página web que reflejaba exactamente lo que queríamos y necesitábamos. El equipo fue muy atento y amable en todo momento, siempre dispuesto a escuchar nuestras necesidades y ayudarnos a conseguir el mejor resultado. Recomendamos sus servicios sin duda alguna. "`
    },
    {
      profile: "assets/images/client/04.jpg",
      name: "Antonio",
      designation: "Gerente de Recursos Humanos",
      message: `" Tecnoria nos ayudó a dar un gran cambio en la imagen de nuestra empresa, gracias a su experiencia en branding y diseño web. Recomendamos sus servicios sin duda alguna. "`
    },
    {
      profile: "assets/images/client/05.jpg",
      name: "Lucía",
      designation: "Director de Ventas",
      message: `" Trabajar con Tecnoria ha sido una gran experiencia, el equipo es muy creativo y siempre busca superar las expectativas del cliente. Recomendamos sus servicios de marketing digital. "`
    },
    {
      profile: "assets/images/client/06.jpg",
      name: "Pedro",
      designation: "Gerente de Marketing",
      message: `" Tecnoria es un equipo muy profesional y con un gran conocimiento en diseño web y marketing digital. Estamos muy satisfechos con el trabajo realizado y recomendamos sus servicios sin duda alguna. "`
    }
  ];
  public customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: false,
    pullDrag: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      600: {
        items: 1
      },
      900: {
        items: 1
      }
    },
    nav: false,
  };

  public redesSociales = [
    {
      icon: "fab fa-facebook-f",
      title: "Facebook",
      description: "¿Quieres darle un empujón a tu negocio en Facebook? Nuestra agencia de redes sociales tiene un equipo de expertos especializados en esta red social, que permite hacer maravillas gracias a sus diferentes campañas. ¡A qué estás esperando para darle ese empujón a tu negocio!",
      link: "https://www.facebook.com/tecnoria.es"  
    },
    {
      icon: "fab fa-instagram",
      title: "Instagram",
      description: "¿Quieres destacar en Instagram? Los influencers más grandes están aquí y gracias a nuestra agencia de redes sociales, tú también puedes aparecer en las stories y post patrocinados de tus seguidores.",
      link: "https://www.instagram.com/tecnoria.es/"
    },
    {
      icon: "fab fa-linkedin-in",
      title: "Linkedin",
      description: "¿Quieres llegar al mundo empresarial y profesional en LinkedIn? Nuestra agencia de redes sociales te ayuda a llenar tus clases, seminarios web o lo que sea que te propongas. ¡Estamos contigo!",
      link: "https://www.linkedin.com/company/tecnoria/"
    },
    {
      icon: "fab fa-twitter",
      title: "Twitter",
      description: "¿Quieres destacar en Twitter? Nuestra agencia de redes sociales te ayudará a crear y publicar contenido atractivo y relevante, a interactuar con tus seguidores y a lanzar campañas publicitarias para llegar a un público cada vez mayor.",
      link: "https://twitter.com/tecnoria_es"
    },
    {
      icon: "fab fa-youtube",
      title: "Youtube",
      description: "¿Quieres triunfar en YouTube? Es una plataforma donde tienes que estar sí o sí. Con nuestra agencia de redes sociales podrás crear y publicar contenido atractivo y optimizarlo para mejorar su posicionamiento.",
      link: "https://www.youtube.com/channel/UC4Z5Z5Y4Z5Z5Y4Z5Z5Y4Z5Z5"
    },
    {
      icon: "fab fa-google",
      title: "TikTok",
      description: "¿Quieres destacar en TikTok? Aunque no sea tan nuevo como hace unos años, sigue siendo una de las redes sociales más jóvenes. Con nuestra agencia de redes sociales podrás crear y publicar contenido atractivo y llegar a ese público que pasa horas haciendo scroll.",
      link: "https://www.tiktok.com/"
    }
  ];
}
