import { Component, ElementRef, HostListener } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import { ChatBotService } from 'src/app/services/chat-bot.service';
import { FirestoreService } from 'src/app/services/firebase.service';



@Component({
  selector: 'app-chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css']
})


export class ChatBotComponent {

  public currentMessage: string = '';
  public messages: any[] = [];
  public email_format:any;
  prev_value: string = '';
  response = '';
  userName: string;
  email: string;
  public index: number = 0;
  public hora:string;
  public correo_valido:boolean = false;
  public bnt: string = '';

  public hideChatBot: boolean = false;

  constructor( 
    private chatService:ChatBotService,
    private elementRef: ElementRef,
    private svcFire: FirestoreService
    ) { 
      this.email_format = {
        name: '',
        email: '',
        empresa: '',
        phone: '',
        service1: '',
        service2: '',
        message: '',
      }


    }
  
    ngOnInit() {
      //mostrar la hora y minutos
      this.hora = new Date().toLocaleTimeString().slice(0, 5);


      this.messages.push( this.chatService.predefinedMessages[this.index]);
      console.log(this.messages);
      
    }

  

    public hideChatBotWindow() {
      this.hideChatBot = true;
    }

    public btnResponse(response: any) {
      console.log(response);
      
      this.response = response.text;
      this.bnt = response.info;


      this.sendResponse();
    }

   

  public sendResponse() {
  
  this.prev_value = this.response;
  console.log(this.response);
    
  let emailvalid = false;

  this.userName = this.response;
  this.messages.push({ text: this.response, type: 'user' });

  if (this.index === 3) {
    this.validarCorreo();
  } else {

    emailvalid = true;
    this.index++;
  }

  if(this.response.includes('Otro')) this.index = 6
  if(this.response.includes('3. Otro')) this.index = 9

  

  this.response = '';

  switch (this.index) {

    case 1:
      this.hora = new Date().toLocaleTimeString().slice(0, 5);
      this.messages.push({ text: '¡Hola! <br>Encantado do de hablar contigo<br> ¿Puedes indicarme tu nombre?', type: 'bot' });
      break;

    case 2:
      this.hora = new Date().toLocaleTimeString().slice(0, 5);
      this.messages.push({ text: `Encantado conocerte <b>${this.userName}</b>, <br>¿Cuál es el nombre de tu empresa?`, type: 'bot' });
      this.email_format.name = this.prev_value;
      break;

    case 3:
    console.log(this.messages)    
    this.email_format.empresa = this.prev_value;

      if(emailvalid){
        this.hora = new Date().toLocaleTimeString().slice(0, 5);
        if(!this.correo_valido)this.messages.push({ text: `<b>${this.email_format.name}</b>, ¿puedes indicarme un correo para continuar?`, type: 'bot' });
        this.correo_valido = true;
      }
      break;

    case 4:
      this.hora = new Date().toLocaleTimeString().slice(0, 5);
    ///añadir un listado con botones para seleccionar cada servicio
    this.email_format.email = this.prev_value;
      this.messages.push({ 
        
        text: `¡Perfecto! <b>${this.email_format.name}</b>,espero poder ayudar a ${this.email_format.empresa} con su crecimiento ¿Qué servicio estás buscando?  <br>(Puedes hacer clik o escribir el número del servicio que necesitas)`, 
        buttons: [
          { text: '1. Diseño Web', value:'diseñoweb', type: 'bot', number: 1, info:'s1'}, 
          { text: '2. Marketing Digital',value:'marketing', type: 'bot', number: 2 , info:'s1'}, 
          { text: '3. Posicionamiento Web',value:'posicionamiento', type: 'bot', number: 3, info:'s1' }, 
          { text: '4. Publicidad Online', type: 'bot',value:'publicidad', number: 4, info:'s1' },
          { text: '5. Desarrollo a Medida', type: 'bot',value:'desarrollo', number: 5, info:'s1'},
          { text: '6. Otro', type: 'bot', value:'otro', number: 6, info:'s1'}
        ],
        type: 'bot' });

        this.send_firstEmail();

      break;

      case 5:        
        this.revisarBoton(this.prev_value);
        if(!this.response.includes('Otro')) this.index = 6
        break;

      case 6:
        this.response ='';
        this.hora = new Date().toLocaleTimeString().slice(0, 5);
        this.messages.push({ text: `<b>${this.email_format.name}</b> Indicanos que servicio estas buscando en concreto`, type: 'bot' });
        break;


      case 7:
        this.email_format.service1 = this.prev_value;
        this.hora = new Date().toLocaleTimeString().slice(0, 5);
        this.messages.push({ text: `¡Excelente! <b>${this.email_format.name}</b>,<br> ¿Que tipo de tipo de información estas buscando?`, 
        buttons: [
          { text: '1. Precios', value:'presupuesto', type: 'bot', number: 1, info:'s3'},
          { text: '2. Información', value:'informacion', type: 'bot', number: 2, info:'s3'},
          { text: '3. Otro', value:'otro', type: 'bot', number: 3, info:'s3'}
        ],
        type: 'bot' });
        break;


      case 8:
        
        if(this.bnt =='s2')this.email_format.service2 = this.prev_value;
        if(this.bnt =='s3')this.email_format.service3 = this.prev_value;

        this.hora = new Date().toLocaleTimeString().slice(0, 5);
        this.messages.push({ text: `
        
        Muchas gracias ${this.email_format.name} , en breves recibiras un correo con toda la información solicitada.<br><br>Gracias, por usar nuestro bot, si lo deseas puedes llamar o ponerte en 
        contacto atraves de los siguientes meidos:
        <br><br>
        <span class="text-dark"><b>Telefono:</b> 
        <a href="tel:+34682047802">682 04 78 02</a>
        </span>
        <br>
        <span class="text-dark" ><b>Correo:</b> 
        <a href="mailto:oficina@tecnoriasl.com" target="_blank">oficina@tecnoriasl.com</a>
        </span>
       
        <br>
        `, type: 'bot' });
        this.index = 404;

        this.send_finalEmail();

        break;

      case 9:
        this.response ='';
        this.hora = new Date().toLocaleTimeString().slice(0, 5);
        this.messages.push({ text: 'Indicanos que tipo de consulta estas buscando en concreto', type: 'bot' });
        this.index = 7; 
        break;
      
      default:
        this.hora = new Date().toLocaleTimeString().slice(0, 5);
        this.messages.push({ text: `Gracias, por usar nuestro bot, si lo deseas puedes llamar o ponerte en 
        contacto atraves de los siguientes meidos:<br>
        <span class="text-dark">Telefono: 
        <a href="tel:+34682047802">682 04 78 02</a>
        </span>
        <br>
        <span class="text-dark" >Correo: 
        <a href="mailto:oficina@tecnoriasl.com" target="_blank">oficina@tecnoriasl.com</a>
        </span>
       
        <br>
        `, type: 'bot' });
 
      break;
  }

}

private validarCorreo(): void {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  console.log(this.response);
  console.log(emailRegex.test(this.response));

  
  if (emailRegex.test(this.response)) {
    this.index++;
    this.correo_valido = true;
  } else {
    this.correo_valido = false;
    this.hora = new Date().toLocaleTimeString().slice(0, 5);
    this.messages.push({ text: `Disculpa <b>${this.email_format.name}</b>, revisa que el correo sea correcto.`, type: 'bot' });
    //tiene que volver a comprobar
  }
  
}

private send_firstEmail(): void {

//RELLENAMOS LOS CAMPOS QUE FALTAN E INDICAMOS QUE EL TIPO SE RAJO

  this.email_format.type = 'contacto';
  this.email_format.date = new Date().toLocaleDateString();
  this.email_format.message = 'El usuario ha solicitado información sobre el servicio pero no ha completado el registro'



  this.svcFire.setCollection('contacto').createDoc(this.email_format).then(() => {
    console.log('Correo enviado');
  }).catch((error) => {
    console.log(error);
  });

}


private send_finalEmail(): void {
  this.email_format.type = 'contacto';
  this.email_format.date = new Date().toLocaleDateString();
  this.email_format.message = 'El usuario ha solicitado información sobre el servicio y ha completado el registro'
  this.svcFire.setCollection('contacto').createDoc(this.email_format).then(() => {
    console.log('Correo enviado');
  }).catch((error) => {
    console.log(error);
  });
}

  @HostListener('document:click', ['$event.target'])

  public onPageClick(targetElement) {
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      if (this.hideChatBot) {
        this.hideChatBot = false;
      }      
    }    
  }



  private revisarBoton(value: string): void {
    
    
    //obterner un int de el primer valor del string
    this.response = value.charAt(0);

    switch (this.response) {
      case '1':
        this.email_format.service1 = 'Diseño Web';
        this.hora = new Date().toLocaleTimeString().slice(0, 5);
        this.messages.push({ 

        text: `¡Perfecto! ${this.email_format.name}, ¿Qué servicio estás buscando?  (Puedes hacer clik o escribir el número del servicio que necesitas)`, 
        buttons: [
          { text: '1. Pagina Web', value:'diseñoweb', type: 'bot', number: 1, info:'s2' }, 
          { text: '2. Tienda Online',value:'marketing', type: 'bot', number: 2, info:'s2' },
          { text: '3. Enbudos de venta',value:'posicionamiento', type: 'bot', number: 3, info:'s2' },
          { text: '4. Página en Wordpress', type: 'bot',value:'publicidad', number: 4, info:'s2' },
          { text: '5. Web Corporativa', type: 'bot', value:'otro', number: 5 , info:'s2'},
          { text: '6. Otro', type: 'bot', value:'otro', number: 6 , info:'s2'}
        ],
        type: 'bot' });
        
        

        break;
      case '2':
        this.email_format.service1 = 'Marketing Digital';
        this.hora = new Date().toLocaleTimeString().slice(0, 5);
        this.messages.push({
        text: `¡Perfecto! ${this.email_format.name}, ¿Qué servicio estás buscando?  (Puedes hacer clik o escribir el número del servicio que necesitas)`, 
        buttons: [
          //redes sociales, branding, marketing de contenidos, email marketing
          { text: '1. Redes Sociales', value:'diseñoweb', type: 'bot', number: 1, info:'s2'},
          { text: '2. Branding',value:'marketing', type: 'bot', number: 2, info:'s2' },
          { text: '3. Marketing de Contenidos',value:'posicionamiento', type: 'bot', number: 3, info:'s2' },
          { text: '4. Email Marketing', type: 'bot',value:'publicidad', number: 4, info:'s2' },
          { text: '5. Otro', type: 'bot', value:'otro', number: 5, info:'s2'}
        ],
        type: 'bot' });

        break;
      case '3':
        this.email_format.service1 = 'Posicionamiento Web';
        this.hora = new Date().toLocaleTimeString().slice(0, 5);
        this.messages.push({ 
        text: `¡Perfecto! ${this.email_format.name}, ¿Qué servicio estás buscando?  (Puedes hacer clik o escribir el número del servicio que necesitas)`,
        buttons: [
          //seo,sem,linkbuilding,auditoria seo,seo local,seo para ecommerce
          { text: '1. SEO', value:'diseñoweb', type: 'bot', number: 1, info:'s2'},
          { text: '2. SEM',value:'marketing', type: 'bot', number: 2, info:'s2' },
          { text: '3. Linkbuilding',value:'posicionamiento', type: 'bot', number: 3, info:'s2' },
          { text: '4. Auditoria SEO', type: 'bot',value:'publicidad', number: 4, info:'s2' },
          { text: '5. SEO Local', type: 'bot', value:'otro', number: 5, info:'s2'},
          { text: '6. SEO para Ecommerce', type: 'bot', value:'otro', number: 6, info:'s2'},
          { text: '7. Otro', type: 'bot', value:'otro', number: 7, info:'s2'}
        ],
        type: 'bot' });
        break;
      case '4':
        this.email_format.service1 = 'Publicidad Online';
        this.hora = new Date().toLocaleTimeString().slice(0, 5);
        this.messages.push({
        text: `¡Perfecto! ${this.email_format.name}, ¿Qué servicio estás buscando?  (Puedes hacer clik o escribir el número del servicio que necesitas)`,
        buttons: [
          //google ads,facebook ads,instagram ads,linkedin ads,ads en youtube,ads en twitter
          { text: '1. Google Ads', value:'diseñoweb', type: 'bot', number: 1, info:'s2'},
          { text: '2. Facebook Ads',value:'marketing', type: 'bot', number: 2 , info:'s2'},
          { text: '3. Instagram Ads',value:'posicionamiento', type: 'bot', number: 3, info:'s2' },
          { text: '4. Linkedin Ads', type: 'bot',value:'publicidad', number: 4 , info:'s2'},
          { text: '5. Ads en Youtube', type: 'bot', value:'otro', number: 5, info:'s2'},
          { text: '6. Ads en Twitter', type: 'bot', value:'otro', number: 6, info:'s2'},
          { text: '7. Otro', type: 'bot', value:'otro', number: 7, info:'s2'}
        ],
        type: 'bot' });
        break;
      case '5':
        this.email_format.service1 = 'Desarrollo a Medida';
        this.hora = new Date().toLocaleTimeString().slice(0, 5);
        this.messages.push({
        text: `¡Perfecto! ${this.email_format.name}, ¿Qué servicio estás buscando?  (Puedes hacer clik o escribir el número del servicio que necesitas)`,
        buttons: [
          //desarrollo web,desarrollo de aplicaciones,desarrollo de software,desarrollo de videojuegos
          { text: '1. Desarrollo Web', value:'diseñoweb', type: 'bot', number: 1, info:'s2'},
          { text: '2. Desarrollo de Aplicaciones',value:'marketing', type: 'bot', number: 2 , info:'s2'},
          { text: '3. Desarrollo de Software',value:'posicionamiento', type: 'bot', number: 3 , info:'s2'},
          { text: '4. Desarrollo de Videojuegos', type: 'bot',value:'publicidad', number: 4 , info:'s2'},
          { text: '5. Otro', type: 'bot', value:'otro', number: 5, info:'s2'}
        ],
        type: 'bot' });
        break;
      case '6':
        this.response ='';
        this.hora = new Date().toLocaleTimeString().slice(0, 5);
        this.messages.push({ text: 'Indicanos que servicio estas buscando en concreto', type: 'bot' });
       
        break;


      default:
        this.hora = new Date().toLocaleTimeString().slice(0, 5);
        this.messages.push({ text: 'Escribe un numero del 1 al 7.', type: 'bot' });
        break;
    }

  }
}
