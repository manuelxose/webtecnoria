import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ModalService } from 'src/app/services/modal.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BlogService } from 'src/app/services/blog.service';
import { ImageResizeService } from 'src/app/services/image-resize.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateX(0)'
      })),
      state('out', style({
        transform: 'translateX(-100%)'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
  ]
})

/**
 * Index Component
 */
export class IndexComponent implements OnInit {



 public form: FormGroup;
 public form2: FormGroup;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: false,
    pullDrag: false,
    autoplay: true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 3
      }
    },
    nav: false
  };

  list = [
    {
    title: "B2C",
    description: "En Tecnoria, nos especializamos en el sector de la salud y el bienestar. Hemos trabajado con muchos clientes en este campo y eso nos ha dado la experiencia y los conocimientos para crear sitios web y paquetes de marca que reflejan los servicios y áreas de experiencia de nuestros clientes. Trabajando de la mano con ellos, podemos brindarles un sitio web que puedan usar como herramienta para ayudar a crecer su negocio y como recurso útil para su personal y clientes.",
    icon: "heart"
    },
    {
    title: "StartUps",
    description: "En Tecnoria entendemos que entrar en un mercado como una start-up puede ser complicado. Nuestro equipo está aquí para ayudar a las nuevas empresas a tener una entrada llamativa. Tenemos una relación especial con las empresas de recién iniciadas y entendemos los pasos necesarios para que una empresa florezca. En Tecnoria buscamos crear una base sólida para las empresas de recién iniciadas y brindar un espacio en el que los líderes de negocios puedan explorar y crear un comienzo tangible para su empresa para significar su entrada en el mercado y para crear algo de lo que estén orgullosos de representar a su empresa.",
    icon: "share-2"
    },
    {
    title: "Servicios profesionales",
    description: "En Tecnoria, con nuestros años de experiencia diseñando y desarrollando branding y websites para empresas, hemos creado nuestra propia estrategia para abordar cada proyecto. Nuestra amplia gama de experiencia en diferentes industrias, como contadores, abogados y servicios profesionales, nos ha dado el conocimiento y la experiencia para proporcionar soluciones de diseño de marca y web que representen a nuestros clientes y sus servicios.",
    icon: "trello"
    },
    {
    title: "B2B",
    description: "En Tecnoria, entendemos la importancia de la presentación en las empresas B2B. Nuestro equipo ha ayudado a muchas empresas de este campo a crear paquetes de marca y sitios web efectivos. La experiencia profunda de Tecnoria con las empresas B2B y su clientela nos ha otorgado el conocimiento experto para ayudar a nuestros clientes a destacar en su mercado e industria.",
    icon: "users"
    },
    {
    title: "Inmobiliaria y construcción",
    description: "En Tecnoria, sabemos lo importante que es la presentación en el campo de bienes raíces. Nuestro equipo ha ayudado a muchas empresas en este campo a crear paquetes de marca efectivos y sitios web. La experiencia profunda de Tecnoria con firmas de bienes raíces y clientes nos ha otorgado el conocimiento experto para ayudar a nuestros clientes a sobresalir en su mercado e industria.",
    icon: "home"
    },
    {
    title: "Sin animo de Lucro",
    description: "En Tecnoria entendemos la importancia de apoyar a las organizaciones sin fines de lucro que hacen un gran trabajo en el mundo. Por eso, ofrecemos descuentos especiales a estas organizaciones para ayudarlas a crear su impacto y llegar a una audiencia más amplia. Nuestro equipo dedicado de gerentes de proyectos, desarrolladores y diseñadores trabajan con nuestros clientes para crear una plataforma que apoye los objetivos e iniciativas de las organizaciones sin fines de lucro y les proporcione un sitio web de lo cual estén orgullosos de representar a sus organizaciones.",
    icon: "pocket"
    },
    {
    title: "Salud y bienestar",
    description: "En Tecnoria, tenemos una experiencia única en el sector de la salud y el bienestar, lo que nos ha proporcionado el conocimiento y habilidades para crear páginas web y paquetes de marca que representan los servicios y áreas de especialización de nuestros clientes. Trabajando con ellos, podemos ofrecerles una página web que puedan utilizar como herramienta para ayudar a crecer su negocio y como recurso útil para su personal y clientes.",
    icon: "droplet"
    },
    {
    title: "Entretenimiento",
    description: "En Tecnoria, entendemos la importancia de tener una presencia en línea sólida en el mundo del entretenimiento y los medios. Nuestro equipo de diseñadores y desarrolladores talentosos tiene la capacidad de crear diseños y animaciones impecables que hacen realidad las visiones creativas de nuestros clientes. Trabajamos con nuestros clientes para brindarles un sitio web que puedan utilizar como herramienta para ayudar a crecer su negocio y como recurso útil para su personal y clientes.",
    icon: "image"
    },
    {
    title: "E-Commerce",
    description: "En Tecnoria entendemos la importancia de una experiencia amigable para el usuario en tu tienda en línea. Podemos ayudarte a brindar una experiencia de compra sin problemas a tus clientes, con un diseño bellamente marcado. Nuestras características de sitio web de comercio electrónico incluyen pagos seguros y seguros, diseño optimizado para dispositivos móviles, varias opciones de pago, sistemas de varios proveedores y un sistema de catálogo de productos. En Tecnoria estamos listos para ayudarte a crear una experiencia de compra en línea memorable para tus clientes.",
    icon: "shopping-cart"
    },
    {
    title: "Restauración",
    description: "En Tecnoria, nuestra amplia experiencia en el sector de la restauración nos permite brindar a nuestros clientes servicios de diseño web y marca únicos para su industria, que son un recurso útil para su personal y clientes.",
    icon: "feather"
    },
    {
    title: "Educación",
    description: "En Tecnoria, entendemos que el éxito de las instituciones educativas está representado por el contenido y la calidad de sus sitios web. Esto incluye la atractividad de su sitio web y la eficacia de la información para los lectores y estudiantes. Como una agencia líder en diseño web en Galicia, hemos trabajado con muchas instituciones educativas para brindar calidad y éxito. Nuestro equipo experimentado está listo para brindar servicios de alta calidad en diseño web y branding para instituciones educativas.",
    icon: "file"
    },
    {
    title: "Moda",
    description: "En Tecnoria entendemos la importancia de tener una presencia en línea en el mundo de la moda. Es por eso que ofrecemos servicios de diseño web y branding para ayudar a impulsar las conversiones en tu tienda de moda. Nuestra amplia experiencia en la industria de la moda nos ha dado el conocimiento y experiencia para brindar soluciones de diseño y branding únicas para representar tu empresa y servicios.",
    icon: "user"
    },
    {
      title: "Hoteles y Turismo",
      description: "En Tecnoria entendemos lo importante que es tener una presencia en línea para el sector turístico y hotelero. Nuestro equipo ha ayudado a muchas empresas en este campo a crear paquetes de marca efectivos y sitios web. Nuestra experiencia en profundidad en la industria turística y clientela nos ha otorgado el conocimiento experto para ayudar a nuestros clientes a sobresalir en su mercado e industria.",
      icon: "sun"
    },
    {
      title: "D2C",
      description: "En la actualidad, cada vez más clientes prefieren explorar y comprar productos en línea. Esto requiere tener un sitio web funcional y adaptable. En Tecnoria, como agencia especializada en diseño web de comercio directo al consumidor (D2C), podemos ayudarte a crear un sitio web que mejore tus conversiones. Nuestra experiencia en el campo de los negocios D2C y nuestra relación con los clientes nos ha otorgado el conocimiento experto para ayudar a nuestros clientes a destacar en su mercado e industria.",
      icon: "upload"
    },
    {
      title: "Tecnologia",
      description: "En Tecnoria, entendemos que la tecnología es una industria compleja y en constante evolución. Como agencia líder en diseño web y branding, sabemos cómo establecer estrategias para el marketing y el branding a través de medios digitales. Nuestra amplia experiencia en la industria de la tecnología nos ha brindado el conocimiento y la experiencia necesarios para proporcionar a nuestros clientes soluciones de branding y diseño web que representen sus empresas y servicios.",
      icon: "terminal"
    },
    {
      title: "Deportes y Fitness",
      description: "En Tecnoria, nos enorgullece trabajar con equipos deportivos, centros deportivos, campamentos de verano, resorts deportivos y compañías de franquicias deportivas. La industria del fitness está expandiéndose rápidamente ya que la gente se está volviendo más consciente de su salud. Nuestra experiencia única en la industria de la salud, bienestar y fitness nos ha proporcionado la experiencia y el conocimiento para crear sitios web y paquetes de marca que son representativos de los servicios y áreas de experiencia de nuestros clientes.",
      icon: "smile"
    },
    {
      title: "Pequeños empresas",
      description: "Es difícil entrar en un mercado como una pequeña empresa. Nuestro equipo está aquí para ayudar a las pequeñas empresas a tener una entrada llamativa. Tecnoria tiene una relación especial con las pequeñas empresas y entiende los pasos necesarios para que una empresa florezca. Tecnoria se esfuerza por crear una sólida base para las pequeñas empresas y busca proporcionar un espacio en el que los líderes empresariales puedan explorar y crear un comienzo tangible para su empresa para significar su presencia en el mercado y para crear algo de lo que estén orgullosos de representar su empresa. Estamos aquí como una agencia líder en diseño web en Galicia y una reconocida agencia de marca para ofrecerle las mejores soluciones para su empresa.",
      icon: "smartphone"
    },
    {
      title: "Abogados",
      description: "En Tecnoria creemos que cada despacho de abogados necesita una página web para poder llegar a clientes que buscan asesoramiento legal y abogados para sus casos. Nuestra amplia experiencia en el sector de los despachos de abogados, y en muchos otros servicios profesionales y empresas, nos ha brindado el conocimiento y la experiencia para proporcionar a nuestros clientes soluciones de diseño web y branding que representen sus empresas y servicios.",
      icon: "file-text"
    },

  ];

  servicesData = [
    // {
    //   icon: "uil uil-edit-alt h1 text-primary",
    //   title: "Diseño Web",
    //   description: "La web de tu empresa es el canal más importante de captación de clientes.Analizamos tu empresa y creamos el diseño que más se adapete a ti."
    // },
    {
      icon: "uil uil-vector-square h1 text-primary",
      title: "Video Marketing",
      description: "Los videos atraen la atención y ayudan a mejorar la comprensión y el recuerdo de tu mensaje, generando confianza y credibilidad en tu marca. Además, pueden aumentar tus tasas de conversión y ventas"
    },
    // {
    //   icon: "uil uil-file-search-alt h1 text-primary",
    //   title: "SEO y SEM",
    //   description: "Mejoramos la presencia de tu negocio en los principales navegadores gracias a nuestras estrategias de posicionamiento."
    // },
    // {
    //   icon: "uil uil-airplay h1 text-primary",
    //   title: "Marketing Digital",
    //   description: "Resultados medibles, aplicamos estrategias de comercialización digital adecuadas para tu potencial cliente."
    // },
    {
      icon: "uil uil-calendar-alt h1 text-primary",
      title: "Redes Sociales",
      description: "Aumenta la presencia web de tu empresa ya sea grande o pequeña, gracias a nuestros planes adaptados a tus necesidades."
    },
    {
      icon: "uil uil-clock h1 text-primary",
      title: "Ecommerce",
      description: "Creamos un sitio WEB donde tus clientes podran comprar tus productos de forma totalemte automatizada."
    }
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

  blogData:any = [];
  Menuoption = 'center';
  Settingicon = true;
  state = 'out';
  
  servicio = ['Diseño Web', 'Marketing Digital', 'Posicionamiento','Publicidad','Desarrollo a Medida'];
  servicio_seleccionado = '';
  sub_servicio = [];
  sub_servicio_selected = '';

  diseño = ['Paginas Web','Tiendas Online','Landing Page','Mantenimientio Web','Otros'];
  marketing = ['Redes Sociales','Email Marketing','Branding','Marketing de Contenidos','Otros'];
  posicionamiento = ['SEO','SEM','Linkbuilding','Auditoria SEO','Otros'];
  publicidad = ['Google Ads','Facebook Ads','Instagram Ads','Linkedin Ads','Otros'];
  desarrollo = ['Aplicaciones Web','Aplicaciones Moviles','Otros'];
  imagePath: string;

  constructor( 
    private screenDetectionService: ImageResizeService,
    private mSvc:ModalService,
    private afs: AngularFirestore,
    private svcBlog: BlogService,
    private titleService: Title,
    private metaTagService: Meta,    
    ) {
  }

  ngOnInit(): void {

    const screenWidth = this.screenDetectionService.getScreenWidth();

    
    if (screenWidth < 768) {
      this.imagePath = 'assets/images/home/mobile/';
    } else if (screenWidth >= 768 && screenWidth < 992) {
      this.imagePath = 'assets/images/home/tablet/';
    } else if (screenWidth >= 992) {
      this.imagePath = 'assets/images/home/desktop/';
    }
    // asigna la ruta de la imagen a una propiedad en el componente
    
     


    this.form = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      empresa: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.required, Validators.pattern('[0-9]{9}')]),
      service1: new FormControl('', [Validators.required]),
      service2: new FormControl('', [Validators.required]),

      message: new FormControl('', [Validators.required, Validators.minLength(3)])
    });

    this.form2 = new FormGroup({

      nameControl: new FormControl('', [Validators.required]),
      phoneControl: new FormControl('', [Validators.required]),
      emailControl: new FormControl('', [Validators.required, Validators.email]),

    });
    

    this.svcBlog.getAllBlogs().subscribe(data => {

      data.docs.forEach((doc) => {
        this.blogData.push({
          id: doc.id,
          ...doc.data()
        });
      })

      this.blogData = this.blogData.sort((a, b) => b.date - a.date);  
      this.blogData = this.blogData.slice(0, 3);

      console.log('Contenido del blog: ',this.blogData);
      
    });

    this.titleService.setTitle('Agencia de Marketing Digital en Galicia - TecnoRia');
    this.metaTagService.updateTag(
      { name: 'description', content: 'Somos una agencia de marketing digital y diseño web en Galicia. Creamos páginas web, tiendas online, posicionamiento SEO, redes sociales, branding y mucho más.' },    );
    this.metaTagService.updateTag(
      { name: 'keywords', content: 'marketing digital, diseño web, posicionamiento seo, redes sociales, branding, tiendas online, páginas web, galicia,marketing digital en Galicia' },    );
  }
  get f() { return this.form.controls; }
  get f2() { return this.form2.controls; }

//  get formValid () {
//     return this.form2.controls.nameControl.valid && this.form2.controls.phoneControl.valid && this.form2.controls.emailControl.valid;
//   }

//   get formValid2 () {  
//     return this.form.controls.name.valid && this.form.controls.empresa.valid && this.form.controls.email.valid && this.form.controls.phone.valid && this.form.controls.service1.valid && this.form.controls.service2.valid && this.form.controls.message.valid;
//   }


  addMessage(message) {
    this.afs.collection('contacto').add(message);
  }

  public Subscribeopen(content:any){
      this.mSvc.Subscribeopen(content);
     
  }

  public sendEmail(){
    if(this.form2.valid){
      this.addMessage(this.form2.value);
      this.form2.reset();
    }else{
    }
  }

  onSubmit() {
    console.log(this.form.value);
  //  this.addMessage(this.form.value);
  }

  public selectOption(option){
    console.log(option);
    
    this.sub_servicio_selected = '';
    this.servicio_seleccionado = option;
    
    if(option == 'Diseño Web'){
      this.sub_servicio = this.diseño;
    }else if(option == 'Marketing Digital'){
      this.sub_servicio = this.marketing;
    }else if(option == 'Posicionamiento'){
      this.sub_servicio = this.posicionamiento;
    }else if(option == 'Publicidad'){
      this.sub_servicio = this.publicidad;
    }else if(option == 'Desarrollo a Medida'){
      this.sub_servicio = this.desarrollo;
    }

  }
  public selectSubOption(option){
    
    this.form.controls.service1.setValue(this.servicio_seleccionado);
    this.form.controls.service2.setValue(option);

    this.sub_servicio_selected = option;
  }

  public sendEmail2(){
    if(this.form.valid){
      this.addMessage(this.form.value);
      this.form.reset();
    }else{
      console.log('Formulario no valido',this.form);
      
    }

  }

}
