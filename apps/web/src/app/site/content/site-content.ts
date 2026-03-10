export const SITE_URL = "https://tecnoriasl.com";
export const SITE_NAME = "TecnoRia";
export const SITE_EMAIL = "oficina@tecnoriasl.com";
export const SITE_PHONE = "+34682047802";
export const SITE_PHONE_LABEL = "682 04 78 02";
export const SITE_REGION = "Galicia, Espana";
export const SITE_TAGLINE =
  "Software a medida, automatizacion, chatbots e inteligencia artificial para empresas y productos digitales.";
export const PUBLISH_DATE = "2026-03-06";

export interface SeoEntry {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface ServiceDetailCard {
  title: string;
  description: string;
}

export interface ServiceFeatureSection {
  title: string;
  intro?: string;
  cards: ServiceDetailCard[];
}

export interface ServiceLinkEntry {
  label: string;
  path: string;
  description: string;
}

export interface ServiceEntry {
  key: string;
  slug: string;
  name: string;
  shortName: string;
  summary: string;
  heroTitle: string;
  heroIntro: string;
  seo: SeoEntry;
  badge: string;
  ctaLabel: string;
  ctaContext: string;
  fit: string[];
  pains: string[];
  deliverables: string[];
  outcomes: string[];
  useCases: string[];
  faqs: FaqEntry[];
  detailSections?: ServiceFeatureSection[];
  crossLinks?: ServiceLinkEntry[];
  relatedCaseSlugs?: string[];
}

export interface CaseStudyEntry {
  slug: string;
  title: string;
  sector: string;
  summary: string;
  problem: string;
  solution: string;
  impact: string[];
  ctaLabel: string;
  ctaLink: string;
  serviceKeys: string[];
}

export interface ArticleSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface ArticleEntry {
  slug: string;
  title: string;
  category: string;
  summary: string;
  readingTime: string;
  ctaLabel: string;
  ctaLink: string;
  seo: SeoEntry;
  sections: ArticleSection[];
}

export interface NavEntry {
  label: string;
  path: string;
}

export interface SitemapGroup {
  title: string;
  links: NavEntry[];
}

export interface BacklogEntry {
  title: string;
  intent: string;
}

export const primaryNavigation: NavEntry[] = [
  { label: "Servicios", path: "/servicios" },
  { label: "Casos de exito", path: "/casos-de-exito" },
  { label: "Soluciones", path: "/soluciones" },
  { label: "Metodologia", path: "/metodologia" },
  { label: "Blog", path: "/blog" },
  { label: "Empresa", path: "/empresa" },
  { label: "Contacto", path: "/contacto" },
];

export const heroHighlights = [
  "Software a medida y plataformas para ordenar operativa y producto",
  "Automatizacion de procesos para reducir tiempos, errores y tareas repetitivas",
  "Chatbots, asistentes virtuales e IA aplicada conectados a negocio real",
];

export const trustStatements = [
  "Para pymes, startups y equipos internos que necesitan ejecutar de verdad",
  "Desde el diagnostico inicial hasta la evolucion posterior al lanzamiento",
  "Chatbots, automatizaciones e integraciones pensados para uso real, no para una demo",
];

export const painPoints = [
  "Procesos manuales que hacen perder tiempo y provocan errores.",
  "Consultas de clientes o equipos que siguen dependiendo de respuesta manual.",
  "Herramientas desconectadas que obligan a duplicar trabajo entre ventas, soporte y operaciones.",
  "Ideas de producto o plataforma bloqueadas por falta de ejecucion tecnica fiable.",
];

export const benefitBlocks = [
  {
    title: "Menos friccion operativa",
    description:
      "Centralizamos datos, eliminamos tareas repetitivas y reducimos dependencia de hojas de calculo, correo o flujos manuales.",
  },
  {
    title: "Mas capacidad de respuesta",
    description:
      "Con chatbots, asistentes y reglas de negocio bien definidas, el soporte y la cualificacion comercial dejan de depender solo de tiempo humano.",
  },
  {
    title: "Sistemas listos para crecer",
    description:
      "Arquitecturas mantenibles para evolucionar producto, integraciones y nuevos casos de uso sin rehacer desde cero.",
  },
  {
    title: "Tecnologia alineada con negocio",
    description:
      "La solucion se define por impacto, coste y prioridad, no por imponer una tecnologia de moda.",
  },
];

export const audienceSegments = [
  {
    title: "Empresas que necesitan digitalizar operaciones",
    description:
      "Pymes y equipos en crecimiento que necesitan herramientas internas, automatizacion, integraciones o soporte conversacional para trabajar mejor.",
    bullets: [
      "Operaciones, administracion, ventas y soporte",
      "Backoffices, paneles, flujos internos y reporting",
      "Chatbots para web, WhatsApp o equipos internos",
    ],
  },
  {
    title: "Startups y proyectos SaaS",
    description:
      "Fundadores que necesitan construir un MVP serio o evolucionar una plataforma con criterio de producto, soporte y escalabilidad.",
    bullets: [
      "Definicion tecnica y priorizacion",
      "Plataformas multiusuario y modelos SaaS",
      "Asistentes o chatbots como capa de onboarding y soporte",
    ],
  },
  {
    title: "Profesionales y emprendedores",
    description:
      "Proyectos digitales con vocacion comercial que necesitan una base tecnica fiable para lanzar, validar y vender.",
    bullets: [
      "Plataformas web o herramientas propias",
      "Portales privados, reservas, suscripciones o marketplaces",
      "Automatizacion y experiencias conversacionales para captar mejor",
    ],
  },
];

export const processSteps = [
  {
    title: "1. Diagnostico y contexto",
    description:
      "Aterrizamos objetivos, usuarios, procesos, canales y restricciones para evitar construir por intuicion.",
  },
  {
    title: "2. Solucion y roadmap",
    description:
      "Definimos alcance, fases, arquitectura, integraciones y una hoja de ruta realista para lanzar con criterio.",
  },
  {
    title: "3. Diseno funcional y experiencia",
    description:
      "Ordenamos flujos, pantallas, prompts, reglas y puntos de contacto para que la solucion se use bien y se entienda rapido.",
  },
  {
    title: "4. Desarrollo y validacion",
    description:
      "Construimos por entregas, probamos, ajustamos y mantenemos visibilidad continua de lo que se esta desarrollando.",
  },
  {
    title: "5. Lanzamiento y evolucion",
    description:
      "Medimos adopcion, resolvemos fricciones y priorizamos mejoras para que el sistema siga aportando valor.",
  },
];

export const differentiators = [
  {
    title: "Enfoque de negocio antes que de stack",
    description:
      "La prioridad no es vender tecnologia sino resolver el cuello de botella correcto y justificar cada decision.",
  },
  {
    title: "Producto, operativa y conversacion en un mismo sistema",
    description:
      "Podemos construir herramientas internas, plataformas y experiencias conversacionales sin separar negocio, soporte y tecnologia.",
  },
  {
    title: "Automatizacion e IA con enfoque practico",
    description:
      "Aplicamos IA y chatbots donde reducen carga, mejoran servicio o aceleran procesos. No lo usamos como reclamo vacio.",
  },
  {
    title: "Acompanamiento a medio plazo",
    description:
      "No entregamos y desaparecemos. Dejamos una base mantenible para seguir creciendo con orden.",
  },
];

export const chatbotSpotlight = [
  {
    title: "Chatbots para web",
    description:
      "Resuelven preguntas frecuentes, captan leads y derivan casos complejos sin frenar la experiencia del usuario.",
  },
  {
    title: "WhatsApp y canales conversacionales",
    description:
      "Automatizan respuestas iniciales, recogen datos clave y aceleran la atencion comercial o de soporte.",
  },
  {
    title: "Asistentes internos",
    description:
      "Ayudan a equipos a consultar procedimientos, documentacion y datos operativos sin perder tiempo buscando contexto.",
  },
  {
    title: "Cualificacion comercial",
    description:
      "Filtran necesidades, preparan briefings y entregan leads mejor definidos antes de que entre el equipo humano.",
  },
];

export const services: ServiceEntry[] = [
  {
    key: "software",
    slug: "desarrollo-software-medida",
    name: "Desarrollo de software a medida",
    shortName: "Software a medida",
    summary:
      "Aplicaciones y herramientas creadas alrededor de tu operativa real, no adaptadas a la fuerza a una solucion generica.",
    heroTitle:
      "Software a medida para empresas que necesitan control, eficiencia y una base tecnica propia.",
    heroIntro:
      "Construimos plataformas internas, paneles, backoffices y aplicaciones de negocio que conectan procesos, equipos y datos.",
    seo: {
      title: "Desarrollo de software a medida para empresas",
      description:
        "Creamos software a medida, herramientas internas y plataformas de negocio para empresas que necesitan digitalizar procesos y escalar con orden.",
      path: "/servicios/desarrollo-software-medida",
      keywords: [
        "desarrollo de software a medida",
        "software a medida para empresas",
        "aplicaciones empresariales",
      ],
    },
    badge: "Core service",
    ctaLabel: "Quiero desarrollar software",
    ctaContext:
      "Analizamos el flujo critico, priorizamos alcance y definimos la mejor forma de construirlo sin sobredimensionar.",
    fit: [
      "Empresas con procesos especificos que no encajan en una solucion estandar",
      "Equipos que necesitan paneles, backoffices o herramientas internas",
      "Negocios que quieren una base propia para crecer sin limites artificiales",
    ],
    pains: [
      "Dependencia de hojas de calculo, email y tareas manuales",
      "Flujos dispersos entre varias herramientas sin control central",
      "Falta de trazabilidad en ventas, operaciones o soporte",
    ],
    deliverables: [
      "Discovery funcional y mapa de procesos",
      "Arquitectura, front, back y modelo de datos",
      "Integraciones con herramientas existentes y despliegue",
      "QA, documentacion y plan de evolucion",
    ],
    outcomes: [
      "Menos errores y menos trabajo repetitivo",
      "Mejor visibilidad operativa y control en tiempo real",
      "Herramienta alineada con tu forma de trabajar",
    ],
    useCases: [
      "Backoffices y portales privados",
      "Sistemas de gestion internos",
      "Dashboards y paneles de control",
      "Portales de clientes, reservas o expedientes",
    ],
    faqs: [
      {
        question: "Cuando tiene sentido desarrollar software a medida?",
        answer:
          "Cuando la operativa es demasiado especifica, hay demasiadas herramientas sueltas o el negocio necesita una ventaja propia que una solucion estandar no ofrece.",
      },
      {
        question: "Podeis construir por fases?",
        answer:
          "Si. Normalmente recomendamos empezar por el flujo critico y crecer por iteraciones para reducir riesgo y acelerar aprendizaje.",
      },
    ],
    relatedCaseSlugs: ["operaciones-servicios-b2b", "mvp-saas-comercial"],
    crossLinks: [
      {
        label: "Automatizacion de procesos",
        path: "/servicios/automatizacion-procesos",
        description:
          "Cuando el problema no es construir todo desde cero sino eliminar pasos manuales entre sistemas.",
      },
    ],
  },
  {
    key: "automation",
    slug: "automatizacion-procesos",
    name: "Automatizacion de procesos",
    shortName: "Automatizacion",
    summary:
      "Reducimos tareas manuales, sincronizamos sistemas y convertimos procesos repetitivos en flujos fiables.",
    heroTitle:
      "Automatizacion de procesos para equipos que quieren operar mas rapido y con menos errores.",
    heroIntro:
      "Disenamos automatizaciones e integraciones para eliminar trabajo repetitivo, acelerar operaciones y mejorar la calidad del dato.",
    seo: {
      title: "Automatizacion de procesos empresariales",
      description:
        "Automatizamos tareas, conectamos sistemas y digitalizamos procesos internos para mejorar eficiencia, control y velocidad operativa.",
      path: "/servicios/automatizacion-procesos",
      keywords: [
        "automatizacion de procesos empresariales",
        "digitalizacion de procesos",
        "integracion de sistemas",
      ],
    },
    badge: "Efficiency",
    ctaLabel: "Quiero automatizar un proceso",
    ctaContext:
      "Priorizamos donde mas duele hoy, conectamos sistemas y medimos el ahorro operativo real.",
    fit: [
      "Empresas con tareas repetitivas entre administracion, ventas y operaciones",
      "Equipos que reintroducen datos en varios sistemas",
      "Negocios que necesitan flujos fiables entre CRM, ERP, email, formularios o APIs",
    ],
    pains: [
      "Retrasos por validaciones o pasos manuales",
      "Errores por copiar y pegar informacion entre herramientas",
      "Procesos imposibles de escalar sin contratar mas personas",
    ],
    deliverables: [
      "Auditoria de procesos actuales",
      "Mapa de automatizaciones priorizadas por impacto",
      "Integraciones con APIs y sistemas internos",
      "Alertas, logs y validaciones para asegurar el flujo",
    ],
    outcomes: [
      "Ahorro de tiempo operativo",
      "Reduccion de incidencias y duplicidades",
      "Informacion coherente y disponible en el sistema correcto",
    ],
    useCases: [
      "Sincronizacion entre CRM, ERP y herramientas comerciales",
      "Flujos de onboarding y soporte",
      "Generacion automatica de documentos o tareas",
      "Actualizacion automatica de estados, stock o expedientes",
    ],
    faqs: [
      {
        question: "Automatizar significa cambiar todo el software actual?",
        answer:
          "No. Muchas veces el mayor impacto llega conectando y ordenando lo que ya existe antes de sustituir herramientas.",
      },
      {
        question: "Como priorizais que automatizar primero?",
        answer:
          "Por volumen, coste operativo, tasa de error y efecto sobre el cliente o el equipo. Empezamos por el cuello de botella mas claro.",
      },
    ],
    relatedCaseSlugs: [
      "operaciones-servicios-b2b",
      "automatizacion-conversacional-soporte",
    ],
    crossLinks: [
      {
        label: "Desarrollo de chatbots",
        path: "/servicios/desarrollo-chatbots-empresas",
        description:
          "Cuando la automatizacion tambien debe responder, cualificar o asistir a usuarios a traves de conversacion.",
      },
    ],
  },
  {
    key: "chatbots",
    slug: "desarrollo-chatbots-empresas",
    name: "Desarrollo de chatbots para empresas",
    shortName: "Chatbots",
    summary:
      "Creamos chatbots, asistentes virtuales y automatizacion conversacional conectados a procesos, soporte, ventas y operativa interna.",
    heroTitle:
      "Desarrollo de chatbots y asistentes virtuales para empresas que quieren responder, cualificar y automatizar mejor.",
    heroIntro:
      "Disenamos soluciones conversacionales para web, WhatsApp, soporte interno y procesos conectados a CRM, ERP o documentacion propia.",
    seo: {
      title: "Desarrollo de chatbots para empresas",
      description:
        "Desarrollamos chatbots para empresas, asistentes virtuales y automatizacion conversacional para captar, atender y operar mejor en web, WhatsApp y canales internos.",
      path: "/servicios/desarrollo-chatbots-empresas",
      keywords: [
        "desarrollo de chatbots",
        "chatbots para empresas",
        "chatbots con ia",
        "asistentes virtuales",
        "automatizacion conversacional",
      ],
    },
    badge: "Conversational systems",
    ctaLabel: "Quiero desarrollar un chatbot",
    ctaContext:
      "Definimos canal, objetivo, fuentes, limites y conexiones para que el bot resuelva de verdad y no se quede en una demo.",
    fit: [
      "Empresas que reciben consultas repetitivas y quieren atender mejor sin ampliar carga linealmente",
      "Equipos comerciales que necesitan cualificar oportunidades antes de pasar a humano",
      "Operaciones internas que quieren asistentes conectados a documentacion o sistemas propios",
    ],
    pains: [
      "Consultas frecuentes que consumen demasiado tiempo de soporte o ventas",
      "Canales como web o WhatsApp sin un flujo de respuesta consistente",
      "Informacion interna dificil de consultar con rapidez por parte del equipo",
    ],
    deliverables: [
      "Definicion del caso de uso, tono y objetivos del bot",
      "Arquitectura conversacional, prompts, reglas y fuentes de conocimiento",
      "Integraciones con CRM, ERP, email, APIs o bases documentales",
      "Supervision, trazabilidad y plan de mejora continua",
    ],
    outcomes: [
      "Mas velocidad de respuesta y mejor experiencia inicial",
      "Menos carga manual en soporte, ventas u operaciones",
      "Conversaciones conectadas a negocio, no aisladas del resto del sistema",
    ],
    useCases: [
      "Chatbot FAQ para web corporativa o producto",
      "Bot de captacion y cualificacion comercial",
      "Asistente interno para procedimientos, soporte o operaciones",
      "Bot conectado a CRM, ERP o bandejas de soporte",
    ],
    faqs: [
      {
        question: "Un chatbot es lo mismo que una automatizacion con IA?",
        answer:
          "No. Un chatbot es la interfaz conversacional. Puede llevar IA o reglas. La automatizacion conversacional incluye tambien que pasa despues: integraciones, acciones y seguimiento.",
      },
      {
        question: "Podeis conectarlo con WhatsApp, CRM o sistemas internos?",
        answer:
          "Si. El valor real suele aparecer cuando el bot no solo responde, sino que consulta datos, registra contexto o activa procesos conectados a herramientas existentes.",
      },
      {
        question: "Como evitais respuestas poco fiables?",
        answer:
          "Definimos limites, fuentes, rutas de escalado y supervision desde el inicio. No planteamos un chatbot como caja negra sin control.",
      },
    ],
    detailSections: [
      {
        title: "Canales y contextos donde suele aportar mas valor",
        intro:
          "No todos los chatbots se plantean igual. El canal y el objetivo condicionan el diseno del flujo, la integracion y el nivel de autonomia.",
        cards: [
          {
            title: "Web corporativa o producto",
            description:
              "Resuelve preguntas, capta leads, orienta servicios y deriva casos complejos sin romper la experiencia.",
          },
          {
            title: "WhatsApp y mensajeria",
            description:
              "Permite atender consultas iniciales, recoger datos clave y acelerar seguimiento comercial o de soporte.",
          },
          {
            title: "Soporte interno",
            description:
              "Asiste a equipos para consultar procedimientos, documentacion y respuestas operativas con mas rapidez.",
          },
          {
            title: "Ventas y cualificacion",
            description:
              "Filtra necesidades, prepara briefings y pasa oportunidades mejor definidas al equipo humano.",
          },
        ],
      },
      {
        title: "Tipos de solucion que desarrollamos",
        cards: [
          {
            title: "Chatbot FAQ",
            description:
              "Pensado para reducir preguntas repetitivas y mejorar respuesta inicial en canales publicos.",
          },
          {
            title: "Chatbot de captacion",
            description:
              "Recoge contexto comercial, cualifica demanda y empuja al usuario hacia una accion clara.",
          },
          {
            title: "Asistente interno",
            description:
              "Ayuda a equipos a encontrar respuestas, procedimientos o datos sin depender siempre de otra persona.",
          },
          {
            title: "Bot conectado a sistemas",
            description:
              "No solo responde: consulta, registra, crea tareas o sincroniza informacion con CRM, ERP y APIs.",
          },
        ],
      },
      {
        title: "Que significa cada capa y por que importa",
        cards: [
          {
            title: "Chatbot",
            description:
              "Es la interfaz conversacional que interactua con cliente o equipo a traves de preguntas y respuestas.",
          },
          {
            title: "Asistente IA",
            description:
              "Aporta capacidad de interpretar, resumir, buscar o sugerir respuestas con mas flexibilidad.",
          },
          {
            title: "Automatizacion conversacional",
            description:
              "Convierte esa conversacion en acciones reales: crear tareas, registrar datos, escalar casos o activar flujos.",
          },
        ],
      },
      {
        title: "Gobernanza y mejora continua",
        cards: [
          {
            title: "Fuentes y limites",
            description:
              "Definimos de donde sale la informacion, que puede contestar el bot y cuando debe derivar a una persona.",
          },
          {
            title: "Integraciones y contexto",
            description:
              "Conectamos el flujo con CRM, ERP, bases de conocimiento o sistemas internos para que la respuesta sea util.",
          },
          {
            title: "Supervision y trazabilidad",
            description:
              "Registramos interacciones, puntos de fuga y feedback para entender que esta funcionando y que no.",
          },
          {
            title: "Mejora progresiva",
            description:
              "Ajustamos prompts, reglas, contenidos y rutas de escalado para elevar conversion y calidad sin improvisar.",
          },
        ],
      },
    ],
    relatedCaseSlugs: ["automatizacion-conversacional-soporte"],
    crossLinks: [
      {
        label: "IA aplicada a negocio",
        path: "/servicios/inteligencia-artificial-empresas",
        description:
          "Cuando ademas del canal conversacional necesitas clasificacion, copilotos o procesos inteligentes mas amplios.",
      },
      {
        label: "Automatizacion de procesos",
        path: "/servicios/automatizacion-procesos",
        description:
          "Cuando el bot debe activar tareas, sincronizar datos o integrarse con la operativa diaria.",
      },
    ],
  },
  {
    key: "ai",
    slug: "inteligencia-artificial-empresas",
    name: "Inteligencia artificial para empresas",
    shortName: "IA aplicada",
    summary:
      "Implementamos agentes, copilotos, clasificacion, enriquecimiento y automatizacion con IA donde realmente mejora un flujo o un servicio.",
    heroTitle:
      "IA aplicada a negocio para reducir carga manual, mejorar servicio y tomar decisiones con mas contexto.",
    heroIntro:
      "Integramos agentes, copilotos y automatizaciones con IA en operaciones, soporte, gestion documental y experiencia de cliente.",
    seo: {
      title: "Inteligencia artificial para empresas",
      description:
        "Desarrollamos soluciones de inteligencia artificial para empresas: agentes, copilotos, clasificacion de datos y flujos inteligentes con impacto real.",
      path: "/servicios/inteligencia-artificial-empresas",
      keywords: [
        "inteligencia artificial para empresas",
        "automatizacion con ia",
        "agentes ia",
        "copilotos para empresas",
        "clasificacion de datos con ia",
      ],
    },
    badge: "Applied AI",
    ctaLabel: "Quiero aplicar IA",
    ctaContext:
      "Aterrizamos un caso de uso realista, medimos impacto y decidimos donde la IA aporta valor sin comprometer operativa.",
    fit: [
      "Equipos que gestionan grandes volumenes de informacion o consultas",
      "Empresas con procesos repetitivos de soporte, clasificacion o respuesta",
      "Negocios que quieren introducir IA sin improvisar ni comprometer operativa",
    ],
    pains: [
      "Soporte o gestion documental que consume demasiado tiempo",
      "Informacion dificil de clasificar o explotar",
      "Necesidad de responder rapido sin ampliar coste humano linealmente",
    ],
    deliverables: [
      "Definicion del caso de uso y riesgo operativo",
      "Integracion de modelos y reglas de negocio",
      "Interfaces para usuarios internos o clientes",
      "Mecanismos de supervision, trazabilidad y mejora continua",
    ],
    outcomes: [
      "Menos tiempo en tareas de bajo valor",
      "Mejor velocidad de respuesta y mejor servicio",
      "Uso de IA conectado a procesos reales, no aislado",
    ],
    useCases: [
      "Agentes para soporte interno o externo",
      "Clasificacion y resumen de documentos",
      "Copilotos para equipos comerciales u operativos",
      "Automatizacion de respuestas, validaciones o extraccion de datos",
    ],
    faqs: [
      {
        question: "La IA sustituye el flujo actual o lo complementa?",
        answer:
          "La abordamos como una capa que mejora un proceso concreto. Solo sustituimos partes del flujo cuando tiene sentido operativo y de riesgo.",
      },
      {
        question: "Se puede empezar con un piloto?",
        answer:
          "Si. Recomendamos validar un caso de uso concreto, medir impacto y escalar despues con datos.",
      },
    ],
    relatedCaseSlugs: ["automatizacion-conversacional-soporte"],
    crossLinks: [
      {
        label: "Desarrollo de chatbots",
        path: "/servicios/desarrollo-chatbots-empresas",
        description:
          "Si necesitas una capa conversacional visible para cliente o equipo, esta es la landing especifica y mejor enfocada para ese caso.",
      },
    ],
  },
  {
    key: "saas",
    slug: "plataformas-saas",
    name: "Desarrollo de plataformas y SaaS",
    shortName: "Plataformas y SaaS",
    summary:
      "Creamos productos digitales multiusuario con criterio de negocio, arquitectura limpia y enfoque en lanzamiento serio.",
    heroTitle:
      "Desarrollo de plataformas y SaaS para lanzar, validar y escalar con una base tecnica solida.",
    heroIntro:
      "Aterrizamos la logica del producto, construimos el MVP con cabeza y dejamos preparada la evolucion futura.",
    seo: {
      title: "Desarrollo de plataformas y SaaS",
      description:
        "Creamos plataformas web y productos SaaS escalables para empresas, startups y fundadores que necesitan lanzar con criterio.",
      path: "/servicios/plataformas-saas",
      keywords: [
        "desarrollo saas",
        "crear saas",
        "plataforma web a medida",
      ],
    },
    badge: "Product build",
    ctaLabel: "Necesito una plataforma",
    ctaContext:
      "Definimos el alcance correcto, ordenamos el MVP y dejamos base para crecer sin rehacer el producto.",
    fit: [
      "Startups y fundadores con una propuesta clara pero sin ejecucion tecnica",
      "Empresas que quieren lanzar un nuevo servicio digital",
      "Equipos que necesitan evolucionar un MVP sin rehacerlo entero",
    ],
    pains: [
      "Falta de criterio para bajar la idea a producto real",
      "MVPs construidos sin base para seguir creciendo",
      "Dudas entre velocidad de lanzamiento y calidad minima aceptable",
    ],
    deliverables: [
      "Discovery de producto y alcance del MVP",
      "Diseno funcional, arquitectura y desarrollo",
      "Roles, permisos, billing o multiusuario segun necesidad",
      "Plan de siguientes iteraciones con foco en uso y revenue",
    ],
    outcomes: [
      "Producto lanzable con una base mantenible",
      "Prioridades claras para no sobredesarrollar",
      "Capacidad para iterar con datos y feedback real",
    ],
    useCases: [
      "SaaS B2B multiusuario",
      "Portales de clientes o partners",
      "Marketplaces y productos verticales",
      "MVPs serios para validar mercado",
    ],
    faqs: [
      {
        question: "Podeis ayudar antes de tener especificaciones cerradas?",
        answer:
          "Si. De hecho, suele ser mejor empezar con discovery y definicion de alcance que desarrollar con requisitos vagos.",
      },
      {
        question: "Trabajais despues del MVP?",
        answer:
          "Si. Podemos continuar con roadmap, soporte, mejoras, optimizacion y nuevas funcionalidades.",
      },
    ],
    relatedCaseSlugs: ["mvp-saas-comercial"],
    crossLinks: [
      {
        label: "Consultoria tecnologica",
        path: "/servicios/consultoria-tecnologica",
        description:
          "Si todavia estas definiendo alcance, validacion o prioridades antes de desarrollar.",
      },
    ],
  },
  {
    key: "consulting",
    slug: "consultoria-tecnologica",
    name: "Consultoria tecnologica",
    shortName: "Consultoria",
    summary:
      "Auditamos, priorizamos y definimos la mejor hoja de ruta tecnica para no invertir a ciegas.",
    heroTitle:
      "Consultoria tecnologica para tomar decisiones con criterio antes de desarrollar.",
    heroIntro:
      "Te ayudamos a evaluar sistemas, priorizar inversiones y definir una solucion viable antes de comprometer tiempo y presupuesto.",
    seo: {
      title: "Consultoria tecnologica para empresas",
      description:
        "Analisis, auditoria y planificacion tecnica para empresas que necesitan definir una solucion digital, mejorar software existente o decidir bien.",
      path: "/servicios/consultoria-tecnologica",
      keywords: [
        "consultoria tecnologica",
        "auditoria de software",
        "asesoramiento tecnologico para empresas",
      ],
    },
    badge: "Strategic clarity",
    ctaLabel: "Necesito claridad tecnica",
    ctaContext:
      "Revisamos objetivos, restricciones y sistemas actuales para decidir con criterio antes de comprometer presupuesto.",
    fit: [
      "Empresas que no tienen claro que construir o mejorar",
      "Negocios con software heredado que necesitan una hoja de ruta",
      "Equipos que van a invertir en tecnologia y quieren reducir riesgo",
    ],
    pains: [
      "Incertidumbre tecnica antes de invertir",
      "Arquitecturas viejas o poco mantenibles",
      "Dependencia de decisiones tecnicas tomadas sin criterio de negocio",
    ],
    deliverables: [
      "Auditoria funcional y tecnica",
      "Mapa de oportunidades y riesgos",
      "Propuesta de arquitectura y fases",
      "Recomendaciones de producto, integracion y evolucion",
    ],
    outcomes: [
      "Mas claridad para invertir donde toca",
      "Menos riesgo de rehacer o sobredimensionar",
      "Hoja de ruta alineada con presupuesto, tiempo e impacto",
    ],
    useCases: [
      "Previa a un desarrollo nuevo",
      "Revision de software existente",
      "Definicion de integraciones y procesos",
      "Planificacion de un roadmap digital",
    ],
    faqs: [
      {
        question: "La consultoria puede acabar sin desarrollo posterior?",
        answer:
          "Si. A veces el mayor valor es ordenar el problema, priorizar y decidir la mejor siguiente accion, aunque el desarrollo se haga despues o con otro equipo.",
      },
      {
        question: "Sirve si ya tengo un proveedor tecnico?",
        answer:
          "Si. Podemos ayudar como segunda mirada para definir alcance, revisar arquitectura o validar decisiones antes de ejecutar.",
      },
    ],
    relatedCaseSlugs: ["mvp-saas-comercial", "operaciones-servicios-b2b"],
  },
];
