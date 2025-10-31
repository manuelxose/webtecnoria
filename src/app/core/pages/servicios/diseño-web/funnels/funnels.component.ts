import { Component } from '@angular/core';
import { ImageResizeService } from 'src/app/services/image-resize.service';

@Component({
  selector: 'app-funnels',
  templateUrl: './funnels.component.html',
  styleUrls: ['./funnels.component.css']
})


export class FunnelsComponent {

  faqList: any[] = [
    {
      question: '¿Cuáles son las etapas esenciales para la creación de un funnel de alta conversión?',
      answer: 'Las etapas esenciales para la creación de un funnel de alta conversión son: atracción, captación de leads, conversión y fidelización.'
    },
    {
      question: '¿Cómo se atrae tráfico al funnel?',
      answer: 'Para atraer tráfico al funnel, es esencial tener una estrategia de contenido sólida que atraiga a tu audiencia objetivo. Esto puede incluir el uso de SEO, redes sociales y publicidad en línea.'
    },
    {
      question: '¿Qué se debe hacer una vez que se tiene el contacto de los leads?',
      answer: 'Una vez que se tiene el contacto de los leads, es importante asegurarse de que se está llegando a ellos de manera regular. Esto puede incluir el uso de automatización de marketing para enviar correos electrónicos personalizados y relevantes.'
    },
    {
      question: '¿Cómo se logra la conversión de los leads en clientes?',
      answer: 'La conversión de los leads en clientes se puede lograr a través de la creación de una experiencia de compra fluida y sin problemas en el sitio web, además de asegurarse de que el sitio web está optimizado para la conversión mediante el uso de técnicas de diseño y copywriting.'
      },
      {
      question: '¿Por qué es importante la creación de funnels de alta conversión para maximizar los ingresos en línea?',
      answer: 'La creación de funnels de alta conversión es importante porque permite aprovechar al máximo el tráfico que se recibe en el sitio web, lo que a su vez ayuda a maximizar los ingresos en línea.'
      },
      {
        question: '¿Cómo se mantiene la fidelización de los clientes en un funnel?',
        answer: 'Para mantener la fidelización de los clientes en un funnel, es importante ofrecer un excelente servicio al cliente y una experiencia positiva en todas las etapas del funnel, además de continuar ofreciendo contenido valioso y personalizado para cada cliente.'
      },
     
      ];

  testimonialData = [
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

  public imagePath: string;
  
  constructor(private screenDetectionService:ImageResizeService) { }


  ngOnInit() {
    
    const screenWidth = this.screenDetectionService.getScreenWidth();
  
      
      if (screenWidth < 768) {
        this.imagePath = 'assets/images/diseño-web/mobile/';
      } else if (screenWidth >= 768 && screenWidth < 992) {
        this.imagePath = 'assets/images/diseño-web/tablet/';
      } else if (screenWidth >= 992) {
        this.imagePath = 'assets/images/diseño-web/desktop/';
      }
  } 
}
