import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatBotService {

  public hideChatBot: boolean = false;
  public messages: any[] = [];
  public predefinedMessages: any[] = [
    {
      text: `¡Bienvenido! Mi nombre es RIA,<br> el Asistente de Digitalización Empresarial de TecnoRia.<br>

      Voy a ayudarte a resolver cualquier duda que tengas.<br> Para ello simplemente debes contestar las siguientes preguntas.<br>

      Puedes saludarme para comenzar.`,
      type: 'bot'
    },
    {
      text: '¡Hola! ¿Cuál es tu nombre para dirigirme a ti?',
      type: 'bot'
    },
    {
      text: 'Encantado conocerte {username}, ¿Cuál es el nombre de tu empresa?',
      type: 'bot'
    },
    {
      text: '¿Cuál es tu correo electrónico?',
      type: 'bot'
    },
    {
      text: 'Por favor, indica un correo electrónico válido.',
      type: 'bot'
    },
  ];
  
  constructor() { }

//servicio para gestionar el chatbot

      
}
