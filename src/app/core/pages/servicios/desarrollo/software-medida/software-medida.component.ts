import { Component } from "@angular/core";
import { BlogService } from "src/app/services/blog.service";
import { ImageResizeService } from "src/app/services/image-resize.service";

@Component({
    selector: "app-software-medida",
    templateUrl: "./software-medida.component.html",
    styleUrls: ["./software-medida.component.css"],
    imports: []
})
export class SoftwareMedidaComponent {
  blogData = [];
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
  imagePath: string;

  constructor(
    private screenDetectionService: ImageResizeService,
    private svcBlog: BlogService
  ) {}

  ngOnInit() {
    const screenWidth = this.screenDetectionService.getScreenWidth();

    if (screenWidth < 768) {
      this.imagePath = "assets/images/desarrollo/mobile/";
    } else if (screenWidth >= 768 && screenWidth < 992) {
      this.imagePath = "assets/images/desarrollo/tablet/";
    } else if (screenWidth >= 992) {
      this.imagePath = "assets/images/desarrollo/desktop/";
    }
    // asigna la ruta de la imagen a una propiedad en el componente
    this.svcBlog.getAllBlogs().subscribe((data) => {
      data.docs.forEach((doc) => {
        this.blogData.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      this.blogData.sort((a, b) => b.date - a.date);
      this.blogData = this.blogData.slice(0, 3);

      console.log("Contenido del blog: ", this.blogData);
    });
  }
}
