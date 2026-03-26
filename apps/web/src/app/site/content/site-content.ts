export const SITE_URL = "https://tecnoriasl.com";
export const SITE_NAME = "TecnoRia";
export const SITE_EMAIL = "oficina@tecnoriasl.com";
export const SITE_PHONE = "+34682047802";
export const SITE_PHONE_LABEL = "682 04 78 02";
export const SITE_REGION = "Galicia, España";
export const SITE_TAGLINE =
  "Ingeniería de software, automatización e IA aplicada para empresas que necesitan operar con precisión, vender mejor y escalar sin fricción.";
export const PUBLISH_DATE = "2026-03-11";

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

export interface BrandImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface BrandLogoAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface HomeMetric {
  label: string;
  value: string;
  detail: string;
}

export interface InsightCard {
  title: string;
  description: string;
}

export interface AudienceSegment {
  title: string;
  description: string;
  bullets: string[];
}

export interface ProcessStep {
  title: string;
  description: string;
  deliverable: string;
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
  heroVisual: BrandImage;
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
  publishedAt?: string;
  tags?: string[];
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

export interface SolutionSpotlight {
  title: string;
  description: string;
  bullets: string[];
  path: string;
  label: string;
}

export const brandImages = {
  hero: {
    src: "/assets/images/brand/hero-precision-engineering.webp",
    alt: "Composición editorial de precisión con superficies de cristal, aluminio cepillado y capas de software sobre una dirección visual blanca, azul y near-black.",
    width: 1024,
    height: 1024,
  },
  heroDark: {
    src: "/assets/images/brand/hero-dark-grid.webp",
    alt: "Grid geométrico de ingeniería de precisión con azul profundo y blancos fríos sobre fondo casi negro.",
    width: 1024,
    height: 1024,
  },
  systems: {
    src: "/assets/images/brand/services-system-architecture.webp",
    alt: "Arquitectura abstracta de bloques modulares de cristal y metal anodizado que representa sistemas, integraciones y automatización con una estética limpia y precisa.",
    width: 1024,
    height: 1024,
  },
  method: {
    src: "/assets/images/brand/method-discovery-studio.webp",
    alt: "Estudio editorial con maquetas, paneles translúcidos y materiales técnicos que evoca discovery, definición y método antes de ejecutar tecnología con criterio.",
    width: 1024,
    height: 1024,
  },
  chatbot: {
    src: "/assets/images/brand/chatbot-conversational-command.svg",
    alt: "Ilustración premium de una capa conversacional conectada a procesos, conocimiento y automatización operativa.",
    width: 1600,
    height: 1066,
  },
  talkaris: {
    src: "/assets/images/brand/talkaris-platform.webp",
    alt: "Dashboard de la plataforma Talkaris — chatbots y asistentes conversacionales enterprise con interfaz near-black y azul profundo.",
    width: 1024,
    height: 1024,
  },
  auctorio: {
    src: "/assets/images/brand/auctorio-platform.webp",
    alt: "Plataforma editorial Auctorio con IA — pipeline de generación, revisión y publicación de contenido multisitio.",
    width: 1024,
    height: 1024,
  },
  social: {
    src: "/assets/images/brand/og-tecnoria-home.webp",
    alt: "Imagen social de TecnoRia con composición near-black, azul profundo y detalles cobre.",
    width: 1200,
    height: 630,
  },
} satisfies Record<string, BrandImage>;

export const brandLogos = {
  lockup: {
    dark: {
      src: "/assets/brand/tecnoria-lockup-dark.svg",
      alt: "TecnoRia",
      width: 336,
      height: 72,
    },
    light: {
      src: "/assets/brand/tecnoria-lockup-light.svg",
      alt: "TecnoRia",
      width: 336,
      height: 72,
    },
  },
  mark: {
    dark: {
      src: "/assets/brand/tecnoria-mark-dark.svg",
      alt: "Isotipo de TecnoRia",
      width: 84,
      height: 84,
    },
    light: {
      src: "/assets/brand/tecnoria-mark-light.svg",
      alt: "Isotipo de TecnoRia",
      width: 84,
      height: 84,
    },
  },
} satisfies Record<string, Record<string, BrandLogoAsset>>;

const articleVisualMap: Record<string, keyof typeof brandImages> = {
  "cuanto-cuesta-desarrollar-software-medida": "systems",
  "cuando-automatizar-procesos-empresa": "systems",
  "software-medida-vs-herramienta-estandar": "systems",
  "que-necesitas-antes-de-crear-un-saas": "hero",
  "chatbots-atencion-cliente-empresa": "chatbot",
  "ia-para-equipos-operativos": "hero",
  "migrar-software-legacy-sin-romper-operativa": "method",
  "discovery-tecnico-que-debe-salir-de-la-primera-fase": "method",
  "crm-erp-o-software-propio-cuando-integrar-y-cuando-construir": "systems",
  "automatizacion-documental-finanzas-y-operaciones": "systems",
  "asistentes-internos-para-onboarding-y-soporte-distribuido": "chatbot",
  "roadmap-producto-b2b-que-entra-en-el-primer-build": "hero",
  "cuadros-de-mando-operativos-cuando-excel-ya-no-da": "method",
};

export const primaryNavigation: NavEntry[] = [
  { label: "Servicios", path: "/servicios" },
  { label: "Soluciones", path: "/soluciones" },
  { label: "Casos", path: "/casos-de-exito" },
  { label: "Método", path: "/metodologia" },
  { label: "Recursos", path: "/blog" },
  { label: "Empresa", path: "/empresa" },
  { label: "Contacto", path: "/contacto" },
];

export const heroHighlights = [
  "Software a medida para operaciones, servicio, producto y equipos internos con dependencia real del dato",
  "Automatización de procesos e integraciones para reducir fricción, errores y trabajo invisible",
  "Asistentes, chatbots e IA aplicada conectados a sistemas, conocimiento y decisiones reales",
];

export const heroMetrics: HomeMetric[] = [
  {
    label: "Respuesta inicial",
    value: "< 24h",
    detail: "Filtrado comercial, encaje y siguiente movimiento sin vueltas innecesarias.",
  },
  {
    label: "Modelo de trabajo",
    value: "Por fases",
    detail: "Discovery, blueprint, build, adopción y evolución con criterio.",
  },
  {
    label: "Enfoque",
    value: "Negocio + sistema",
    detail: "No vendemos stack; resolvemos el cuello de botella que está frenando el negocio.",
  },
];

export const trustStatements = [
  "Discovery ejecutivo para alinear objetivo, restricción, prioridad y ROI potencial antes de construir.",
  "Arquitecturas mantenibles para que el sistema siga creciendo sin rehacer la base cada seis meses.",
  "Automatización, producto e IA conectados a operativa real, no a demos bonitas pero aisladas.",
];

export const challengeCards: InsightCard[] = [
  {
    title: "Operaciones fragmentadas",
    description:
      "Procesos repartidos entre hojas de cálculo, correo, ERP, CRM y herramientas sin un flujo claro.",
  },
  {
    title: "Atención y cualificación manual",
    description:
      "Consultas repetitivas, tiempos de respuesta lentos y demasiado trabajo humano antes de actuar.",
  },
  {
    title: "Producto o software heredado sin base",
    description:
      "MVPs, backoffices o sistemas internos que frenan la siguiente etapa de crecimiento.",
  },
  {
    title: "Decisiones técnicas tomadas con poca claridad",
    description:
      "Inversiones en tecnología sin una hoja de ruta defendible ni un criterio de prioridad compartido.",
  },
];

export const benefitBlocks: InsightCard[] = [
  {
    title: "Menos fricción operativa",
    description:
      "Reducimos pasos manuales, duplicidades y dependencia de tareas invisibles que consumen al equipo.",
  },
  {
    title: "Mejor servicio y mejor conversión",
    description:
      "Ordenamos la experiencia de cliente, el soporte y la cualificación comercial con sistemas conectados.",
  },
  {
    title: "Base técnica preparada para evolucionar",
    description:
      "Cada fase deja un sistema más sólido, no un parche caro que obligue a rehacer después.",
  },
  {
    title: "Decisión técnica con sentido de negocio",
    description:
      "Priorizamos impacto, adopción, riesgo y retorno antes que la tecnología de moda.",
  },
];

export const proofMoments: InsightCard[] = [
  {
    title: "Discovery que convierte ambigüedad en decisiones ejecutables",
    description:
      "Traducimos objetivos, restricciones, dependencias y coste de oportunidad en un mapa ejecutable.",
  },
  {
    title: "Ingeniería con criterio de negocio, producto y operativa",
    description:
      "Combinamos arquitectura, experiencia y operativa para que lo construido se use, convierta y aguante.",
  },
  {
    title: "Iteración orientada a impacto visible",
    description:
      "Lanzamos por fases, medimos adopción y refinamos donde realmente cambia servicio, eficiencia o conversión.",
  },
];

export const audienceSegments: AudienceSegment[] = [
  {
    title: "Empresas con procesos ya tensionados",
    description:
      "Equipos que necesitan dejar atrás la operativa artesanal y ganar visibilidad, orden y capacidad de respuesta.",
    bullets: [
      "Backoffices, operaciones, administración y reporting",
      "Integraciones entre sistemas existentes",
      "Automatización de soporte, ventas y flujo documental",
    ],
  },
  {
    title: "Startups y productos B2B que necesitan una base seria",
    description:
      "Fundadores y equipos de producto que quieren construir sin hipotecar la evolución futura.",
    bullets: [
      "MVPs con foco real en adopción y roadmap",
      "Plataformas multiusuario y SaaS",
      "Capas de IA y automatización en onboarding, soporte o analítica",
    ],
  },
  {
    title: "Compañías que quieren introducir IA con criterio",
    description:
      "Negocios que ya tienen un proceso claro y buscan aplicar automatización o IA sin ruido ni improvisación.",
    bullets: [
      "Asistentes para equipos internos",
      "Clasificación documental y extracción de datos",
      "Experiencias conversacionales conectadas a CRM, ERP o base documental",
    ],
  },
];

export const processSteps: ProcessStep[] = [
  {
    title: "1. Discovery ejecutivo",
    description:
      "Aterrizamos contexto, objetivo, usuarios, datos, restricciones y urgencias para decidir qué conviene construir primero.",
    deliverable: "Mapa de problema, prioridades y siguiente mejor decisión.",
  },
  {
    title: "2. Blueprint de solución",
    description:
      "Definimos arquitectura, alcance, integraciones, riesgos, experiencia y fases de entrega para que el proyecto deje de ser difuso.",
    deliverable: "Plan funcional y técnico con fases, dependencias y criterios de éxito.",
  },
  {
    title: "3. Build por entregas",
    description:
      "Construimos en iteraciones claras, validamos con negocio y evitamos sorpresas de alcance o calidad al final.",
    deliverable: "Versiones utilizables con visibilidad real sobre avance y decisiones.",
  },
  {
    title: "4. Lanzamiento y adopción",
    description:
      "Preparamos despliegue, QA, handoff y primeras mediciones para asegurar que la solución entra bien en operativa.",
    deliverable: "Sistema en marcha con soporte inicial y seguimiento de uso.",
  },
  {
    title: "5. Evolución continua",
    description:
      "Analizamos feedback, puntos de fuga y nuevas oportunidades para seguir afinando conversión, eficiencia y calidad del dato.",
    deliverable: "Roadmap de mejora priorizado por impacto real.",
  },
];

export const differentiators: InsightCard[] = [
  {
    title: "Pensamiento de sistema, no de pieza aislada",
    description:
      "Producto, operaciones, automatización y experiencia conversacional se diseñan como parte del mismo engranaje.",
  },
  {
    title: "Arquitectura defendible desde el día uno",
    description:
      "Cada decisión se toma con criterio de mantenimiento, integración y escalabilidad, no solo para salir del paso.",
  },
  {
    title: "IA aplicada donde aporta, no donde adorna",
    description:
      "Solo la introducimos cuando mejora tiempo de respuesta, carga operativa o calidad del servicio.",
  },
  {
    title: "Cercanía ejecutiva y rigor técnico",
    description:
      "Combinamos lenguaje claro para negocio con profundidad técnica suficiente para ejecutar bien.",
  },
];

export const solutionNeeds: SolutionSpotlight[] = [
  {
    title: "Software interno para ordenar operaciones",
    description:
      "Cuando el problema principal es la falta de control, trazabilidad y continuidad entre equipos, procesos y datos.",
    bullets: [
      "Paneles, backoffices y herramientas internas",
      "Estados, permisos, reglas de negocio y reporting",
      "Integraciones con CRM, ERP, formularios o APIs",
    ],
    path: "/servicios/desarrollo-software-medida",
    label: "Explorar software a medida",
  },
  {
    title: "Automatización y atención conectada",
    description:
      "Cuando soporte, ventas o administración necesitan responder más rápido y activar procesos sin carga manual innecesaria.",
    bullets: [
      "Automatización entre sistemas y canales",
      "Chatbots y asistentes conectados a conocimiento real",
      "Cualificación comercial y soporte inicial automatizado",
    ],
    path: "/servicios/desarrollo-chatbots-empresas",
    label: "Ver automatización conversacional",
  },
  {
    title: "Plataformas y productos con base seria",
    description:
      "Cuando hay que lanzar un MVP, evolucionar un SaaS o reconstruir una base técnica que ya se ha quedado corta.",
    bullets: [
      "Roadmap, roles, onboarding y experiencia principal",
      "Arquitectura mantenible para seguir iterando",
      "Capas de IA, automatización o analítica cuando aportan valor",
    ],
    path: "/servicios/plataformas-saas",
    label: "Ver plataformas y SaaS",
  },
];

export const featuredInsightSlugs = [
  "cuanto-cuesta-desarrollar-software-medida",
  "chatbots-atencion-cliente-empresa",
  "migrar-software-legacy-sin-romper-operativa",
];

export const serviceArticleLinks: Record<string, string[]> = {
  software: [
    "cuanto-cuesta-desarrollar-software-medida",
    "software-medida-vs-herramienta-estandar",
    "migrar-software-legacy-sin-romper-operativa",
  ],
  automation: [
    "cuando-automatizar-procesos-empresa",
    "ia-para-equipos-operativos",
    "migrar-software-legacy-sin-romper-operativa",
  ],
  chatbots: [
    "chatbots-atencion-cliente-empresa",
    "ia-para-equipos-operativos",
    "cuando-automatizar-procesos-empresa",
  ],
  ai: [
    "ia-para-equipos-operativos",
    "chatbots-atencion-cliente-empresa",
    "migrar-software-legacy-sin-romper-operativa",
  ],
  saas: [
    "que-necesitas-antes-de-crear-un-saas",
    "cuanto-cuesta-desarrollar-software-medida",
    "software-medida-vs-herramienta-estandar",
  ],
  consulting: [
    "software-medida-vs-herramienta-estandar",
    "migrar-software-legacy-sin-romper-operativa",
    "cuanto-cuesta-desarrollar-software-medida",
  ],
};

export const services: ServiceEntry[] = [
  {
    key: "software",
    slug: "desarrollo-software-medida",
    name: "Desarrollo de software a medida",
    shortName: "Software a medida",
    summary:
      "Aplicaciones, portales y herramientas internas diseñadas alrededor de tu operativa real, no alrededor de los límites de una solución genérica.",
    heroTitle:
      "Software a medida para equipos que necesitan control operativo, trazabilidad y una base técnica propia.",
    heroIntro:
      "Construimos sistemas internos, plataformas privadas y productos de negocio que conectan procesos, datos y personas sin forzarte a encajar en herramientas que ya se han quedado cortas.",
    seo: {
      title: "Desarrollo de software a medida para empresas",
      description:
        "Creamos software a medida, herramientas internas y plataformas de negocio para empresas que necesitan ordenar operativa, integrar sistemas y escalar con una base técnica seria.",
      path: "/servicios/desarrollo-software-medida",
      keywords: [
        "desarrollo de software a medida",
        "software a medida para empresas",
        "aplicaciones empresariales",
        "software interno para empresas",
      ],
    },
    badge: "Core build",
    ctaLabel: "Quiero ordenar mi sistema",
    ctaContext:
      "Aterrizamos el flujo crítico, priorizamos alcance y definimos una arquitectura que puedas seguir evolucionando sin rehacerlo todo.",
    heroVisual: brandImages.systems,
    fit: [
      "Empresas con procesos específicos que ya no encajan en software estándar",
      "Equipos que necesitan backoffices, paneles o portales privados bien conectados",
      "Negocios que quieren una base propia para crecer sin fricciones estructurales",
    ],
    pains: [
      "Dependencia de hojas de cálculo, correo y tareas manuales para operar",
      "Falta de trazabilidad y visibilidad del estado real de clientes, proyectos o expedientes",
      "Herramientas desconectadas que generan duplicidades, errores y tiempos muertos",
    ],
    deliverables: [
      "Discovery funcional y mapa de procesos críticos",
      "Arquitectura, front, back, modelo de datos e integraciones",
      "Permisos, reporting, automatizaciones y despliegue",
      "QA, documentación y plan de evolución posterior",
    ],
    outcomes: [
      "Menos errores operativos y menos dependencia de trabajo invisible",
      "Sistema alineado con tu forma de trabajar y no al revés",
      "Base técnica mantenible para integrar, automatizar y escalar con orden",
    ],
    useCases: [
      "Backoffices y portales privados",
      "Sistemas de gestión internos",
      "Dashboards operativos y reporting",
      "Portales de clientes, expedientes o reservas",
    ],
    faqs: [
      {
        question: "¿Cuándo tiene sentido construir software a medida?",
        answer:
          "Cuando la operativa es diferencial, el equipo vive atrapado entre herramientas sueltas o el coste de seguir adaptándote a un producto estándar ya es mayor que construir una base propia.",
      },
      {
        question: "¿Se puede empezar con una primera fase reducida?",
        answer:
          "Sí. De hecho suele ser lo recomendable: definimos el flujo con más impacto, lanzamos una primera versión útil y evolucionamos con aprendizaje real.",
      },
      {
        question: "¿Podéis integrar software existente en lugar de sustituirlo todo?",
        answer:
          "Sí. Muchas veces el mejor resultado llega combinando una nueva capa a medida con integraciones sobre sistemas que ya funcionan.",
      },
    ],
    detailSections: [
      {
        title: "Qué solemos construir cuando una empresa necesita una base propia",
        intro:
          "No hablamos solo de pantallas. Hablamos de cómo se organiza el trabajo, dónde vive el dato y qué ocurre cuando un proceso cambia de estado.",
        cards: [
          {
            title: "Backoffices operativos",
            description:
              "Herramientas para operaciones, coordinación, seguimiento, reporting y control diario del negocio.",
          },
          {
            title: "Portales privados",
            description:
              "Espacios para clientes, partners o equipos con roles, permisos y trazabilidad sobre interacciones y documentos.",
          },
          {
            title: "Flujos multidepartamento",
            description:
              "Procesos que conectan administración, ventas, soporte y dirección sin depender de correos o tareas sueltas.",
          },
          {
            title: "Capas de integración",
            description:
              "Conectamos tu software con CRM, ERP, formularios, APIs o herramientas verticales ya existentes.",
          },
        ],
      },
      {
        title: "Criterios de arquitectura que protegen la inversión",
        cards: [
          {
            title: "Modelo de datos pensado para evolucionar",
            description:
              "Definimos entidades, permisos y relaciones para que el sistema pueda crecer sin deuda estructural temprana.",
          },
          {
            title: "Experiencia funcional clara",
            description:
              "La herramienta tiene que usarse bien desde el primer día, no solo cumplir una lista de requisitos.",
          },
          {
            title: "Integración y automatización desde origen",
            description:
              "Dejamos el sistema preparado para conectarse con otras fuentes, reglas y procesos posteriores.",
          },
          {
            title: "Evolución por roadmap",
            description:
              "Priorizamos siguientes iteraciones para que la plataforma siga aportando valor al ritmo del negocio.",
          },
        ],
      },
    ],
    crossLinks: [
      {
        label: "Automatización de procesos",
        path: "/servicios/automatizacion-procesos",
        description:
          "Cuando el cuello de botella principal no es la herramienta en sí, sino los pasos manuales entre sistemas y equipos.",
      },
      {
        label: "Consultoría tecnológica",
        path: "/servicios/consultoria-tecnologica",
        description:
          "Si todavía necesitas aterrizar alcance, riesgos y arquitectura antes de construir.",
      },
    ],
    relatedCaseSlugs: ["operaciones-servicios-b2b", "ecosistema-distribucion-industrial"],
  },
  {
    key: "automation",
    slug: "automatizacion-procesos",
    name: "Automatización de procesos",
    shortName: "Automatización",
    summary:
      "Eliminamos trabajo manual, sincronizamos sistemas y convertimos tareas repetitivas en flujos más fiables, medibles y escalables.",
    heroTitle:
      "Automatización de procesos para equipos que necesitan ganar tiempo, reducir errores y coordinar mejor.",
    heroIntro:
      "Diseñamos automatizaciones, reglas e integraciones entre CRM, ERP, formularios, canales y herramientas internas para que la operativa deje de depender de recordatorios, copias manuales y trabajo duplicado.",
    seo: {
      title: "Automatización de procesos empresariales",
      description:
        "Automatizamos tareas, integramos sistemas y digitalizamos procesos internos para mejorar eficiencia, control y velocidad operativa en empresas y equipos en crecimiento.",
      path: "/servicios/automatizacion-procesos",
      keywords: [
        "automatizacion de procesos empresariales",
        "automatizacion operativa",
        "integracion de sistemas",
        "digitalizacion de procesos",
      ],
    },
    badge: "Ops automation",
    ctaLabel: "Quiero automatizar un proceso",
    ctaContext:
      "Priorizamos donde más duele hoy, conectamos sistemas y medimos la mejora operativa antes de complicar el stack.",
    heroVisual: brandImages.systems,
    fit: [
      "Equipos con volumen creciente de tareas repetitivas entre administración, ventas y operaciones",
      "Empresas que reintroducen información varias veces o dependen demasiado del seguimiento manual",
      "Negocios que necesitan integrar sistemas y asegurar coherencia del dato entre departamentos",
    ],
    pains: [
      "Tiempo perdido en copiar, revisar y volver a introducir datos entre herramientas",
      "Errores y retrasos por procesos manuales que se rompen con facilidad",
      "Procesos imposibles de escalar sin aumentar linealmente la carga del equipo",
    ],
    deliverables: [
      "Auditoría de procesos actuales y puntos de fuga",
      "Mapa de automatizaciones priorizado por impacto y complejidad",
      "Integraciones con APIs, sistemas internos y herramientas de negocio",
      "Alertas, validaciones, logs y supervisión para asegurar fiabilidad",
    ],
    outcomes: [
      "Ahorro de tiempo en tareas de bajo valor",
      "Menos incidencias, menos duplicidades y mejor calidad de dato",
      "Operativa más estable y menos dependiente de memoria humana",
    ],
    useCases: [
      "Sincronización entre CRM, ERP y herramientas comerciales",
      "Flujos de onboarding, soporte y administración",
      "Generación automática de documentos, avisos o tareas",
      "Actualización de estados, inventario o expedientes",
    ],
    faqs: [
      {
        question: "¿Automatizar implica cambiar todo mi software actual?",
        answer:
          "No. A menudo la vía más inteligente es conectar bien lo que ya existe y sustituir solo lo que se ha convertido en un cuello de botella real.",
      },
      {
        question: "¿Cómo decidís qué automatizar primero?",
        answer:
          "Miramos volumen, impacto en cliente, frecuencia de error y dependencia humana. Empezamos por el flujo que más fricción genera y menos incertidumbre tiene.",
      },
      {
        question: "¿Se puede medir si la automatización ha funcionado?",
        answer:
          "Sí. Definimos indicadores de ahorro operativo, tiempo de ciclo, errores evitados o calidad del dato para que la mejora no se quede en percepción.",
      },
    ],
    detailSections: [
      {
        title: "Procesos donde solemos conseguir mejoras visibles",
        cards: [
          {
            title: "Ventas y cualificación",
            description:
              "Captura de leads, enriquecimiento, asignación, seguimiento y paso a equipo humano con más contexto.",
          },
          {
            title: "Administración y operaciones",
            description:
              "Actualización de estados, documentos, notificaciones, validaciones y transferencias entre sistemas.",
          },
          {
            title: "Soporte y postventa",
            description:
              "Clasificación de casos, disparadores, respuestas iniciales y trazabilidad de incidencias.",
          },
          {
            title: "Analítica y reporting",
            description:
              "Consolidación de información, cuadros de control y avisos para actuar antes de que el problema escale.",
          },
        ],
      },
      {
        title: "Cómo evitamos automatizaciones frágiles",
        cards: [
          {
            title: "Reglas de negocio claras",
            description:
              "No automatizamos caos; primero definimos excepciones, fuentes de verdad y condiciones operativas reales.",
          },
          {
            title: "Integración con trazabilidad",
            description:
              "Cada paso deja logs y validaciones para saber qué ha ocurrido y por qué.",
          },
          {
            title: "Escalado humano cuando toca",
            description:
              "La automatización no sustituye criterio donde no debe; diseñamos desbordes y controles para casos complejos.",
          },
          {
            title: "Iteración segura",
            description:
              "Mejoramos por capas para que la automatización se mantenga útil cuando cambian las operaciones.",
          },
        ],
      },
    ],
    crossLinks: [
      {
        label: "Desarrollo de chatbots",
        path: "/servicios/desarrollo-chatbots-empresas",
        description:
          "Cuando la automatización necesita una capa conversacional para captar, responder o asistir en tiempo real.",
      },
      {
        label: "IA aplicada a negocio",
        path: "/servicios/inteligencia-artificial-empresas",
        description:
          "Si además del flujo automático necesitas clasificar, resumir o interpretar información con modelos de IA.",
      },
    ],
    relatedCaseSlugs: [
      "operaciones-servicios-b2b",
      "automatizacion-conversacional-soporte",
      "ecosistema-distribucion-industrial",
    ],
  },
  {
    key: "chatbots",
    slug: "desarrollo-chatbots-empresas",
    name: "Desarrollo de chatbots para empresas",
    shortName: "Chatbots",
    summary:
      "Diseñamos chatbots y asistentes conectados a conocimiento, procesos y sistemas para que atención, soporte y cualificación ganen velocidad y contexto.",
    heroTitle:
      "Chatbots y asistentes virtuales para empresas que necesitan responder mejor, filtrar mejor y activar procesos sin humo.",
    heroIntro:
      "Creamos experiencias conversacionales para web, WhatsApp y equipos internos conectadas a CRM, ERP, base documental y operativa real, con límites claros y supervisión desde el inicio.",
    seo: {
      title: "Desarrollo de chatbots para empresas",
      description:
        "Desarrollamos chatbots para empresas, asistentes virtuales y automatización conversacional para captar, atender y operar mejor en web, WhatsApp y canales internos.",
      path: "/servicios/desarrollo-chatbots-empresas",
      keywords: [
        "desarrollo de chatbots",
        "chatbots para empresas",
        "automatización conversacional",
        "chatbots para atención al cliente",
      ],
    },
    badge: "Conversational layer",
    ctaLabel: "Quiero un asistente bien planteado",
    ctaContext:
      "Definimos objetivo, fuentes, rutas de escalado y conexiones para que el asistente resuelva de verdad y no se quede en una demo vistosa.",
    heroVisual: brandImages.chatbot,
    fit: [
      "Empresas que reciben consultas repetitivas y quieren mejorar la primera respuesta",
      "Equipos comerciales que necesitan filtrar y cualificar antes de pasar a humano",
      "Operaciones internas que quieren asistentes conectados a documentación, procedimientos o datos propios",
    ],
    pains: [
      "Consultas frecuentes que consumen demasiado tiempo de soporte o ventas",
      "Canales como web o WhatsApp sin un flujo consistente ni trazabilidad suficiente",
      "Información interna difícil de consultar con rapidez por parte del equipo",
    ],
    deliverables: [
      "Definición del caso de uso, tono y objetivos del asistente",
      "Arquitectura conversacional, reglas, prompts y fuentes de conocimiento",
      "Integraciones con CRM, ERP, email, APIs o bases documentales",
      "Gobernanza, supervisión, trazabilidad y plan de mejora continua",
    ],
    outcomes: [
      "Más velocidad de respuesta y mejor experiencia inicial",
      "Menos carga manual en soporte, ventas u operaciones",
      "Conversaciones conectadas a negocio, no aisladas del resto del sistema",
    ],
    useCases: [
      "Chatbot FAQ para web corporativa o producto",
      "Bot de captación y cualificación comercial",
      "Asistente interno para procedimientos, soporte o operaciones",
      "Capa conversacional conectada a CRM, ERP o mesa de soporte",
    ],
    faqs: [
      {
        question: "¿Un chatbot es lo mismo que una automatización con IA?",
        answer:
          "No. El chatbot es la interfaz conversacional. La automatización conversacional incluye también qué ocurre después: integraciones, acciones, reglas y seguimiento.",
      },
      {
        question: "¿Podéis conectarlo con WhatsApp, CRM o sistemas internos?",
        answer:
          "Sí. De hecho el mayor valor aparece cuando el asistente no solo responde, sino que consulta datos, registra contexto y activa procesos conectados a tus herramientas.",
      },
      {
        question: "¿Cómo evitáis respuestas poco fiables?",
        answer:
          "Definimos límites, fuentes, rutas de escalado y supervisión desde el inicio. Nunca planteamos un asistente como una caja negra sin control.",
      },
    ],
    detailSections: [
      {
        title: "Escenarios donde suele aportar más valor",
        intro:
          "No todos los asistentes se diseñan igual. El canal, el usuario y la acción posterior determinan su nivel de autonomía y su arquitectura.",
        cards: [
          {
            title: "Web corporativa o producto",
            description:
              "Resuelve preguntas, capta leads, orienta servicios y deriva casos complejos sin romper la experiencia.",
          },
          {
            title: "WhatsApp y canales conversacionales",
            description:
              "Acelera la atención inicial, recoge datos clave y ordena el paso a comercial o soporte humano.",
          },
          {
            title: "Asistente interno",
            description:
              "Permite consultar procedimientos, documentación y respuestas operativas sin depender siempre de otra persona.",
          },
          {
            title: "Ventas y cualificación",
            description:
              "Filtra necesidades, prepara briefings y entrega oportunidades mejor definidas al equipo.",
          },
        ],
      },
      {
        title: "Capas que convierten un chatbot en una herramienta seria",
        cards: [
          {
            title: "Conocimiento curado",
            description:
              "Definimos de dónde sale la información, qué prioridad tiene y cómo se actualiza para no improvisar respuestas.",
          },
          {
            title: "Reglas y límites",
            description:
              "El asistente sabe qué puede hacer, qué no y cuándo debe escalar a una persona.",
          },
          {
            title: "Integración operativa",
            description:
              "Conectamos el flujo con CRM, ERP, tickets, formularios o bases internas para que la conversación produzca acción.",
          },
          {
            title: "Medición y mejora continua",
            description:
              "Revisamos conversaciones, puntos de fuga y calidad de respuesta para elevar conversión y utilidad con el tiempo.",
          },
        ],
      },
    ],
    crossLinks: [
      {
        label: "IA aplicada a negocio",
        path: "/servicios/inteligencia-artificial-empresas",
        description:
          "Cuando además del canal conversacional necesitas clasificación, resumen, copilotos o agentes más amplios.",
      },
      {
        label: "Automatización de procesos",
        path: "/servicios/automatizacion-procesos",
        description:
          "Cuando el asistente debe activar tareas, sincronizar datos y conectarse con la operativa diaria.",
      },
    ],
    relatedCaseSlugs: ["automatizacion-conversacional-soporte"],
  },
  {
    key: "ai",
    slug: "inteligencia-artificial-empresas",
    name: "Inteligencia artificial para empresas",
    shortName: "IA aplicada",
    summary:
      "Introducimos IA donde realmente reduce carga, mejora servicio o acelera decisiones, siempre conectada a procesos y gobierno claro.",
    heroTitle:
      "IA aplicada a negocio para empresas que quieren ganar contexto, velocidad y calidad sin introducir caos.",
    heroIntro:
      "Integramos agentes, copilotos, clasificación documental y flujos inteligentes en operaciones, soporte y experiencia de cliente con un enfoque pragmático y mantenible.",
    seo: {
      title: "Inteligencia artificial para empresas",
      description:
        "Desarrollamos soluciones de inteligencia artificial para empresas: agentes, copilotos, clasificación de datos y automatización inteligente conectada a procesos reales.",
      path: "/servicios/inteligencia-artificial-empresas",
      keywords: [
        "inteligencia artificial para empresas",
        "automatizacion con IA",
        "agentes IA",
        "copilotos para empresas",
      ],
    },
    badge: "Applied AI",
    ctaLabel: "Quiero aterrizar un caso de IA",
    ctaContext:
      "Definimos un caso realista, medimos riesgo y valor, y decidimos dónde la IA aporta de verdad antes de desplegarla por moda.",
    heroVisual: brandImages.hero,
    fit: [
      "Equipos que gestionan grandes volúmenes de información, consultas o documentos",
      "Empresas que quieren acelerar soporte, análisis o procesos de conocimiento interno",
      "Negocios que necesitan aplicar IA sin comprometer fiabilidad, trazabilidad ni adopción",
    ],
    pains: [
      "Demasiado tiempo humano en clasificar, resumir o extraer datos",
      "Información dispersa y difícil de explotar para atender mejor o decidir mejor",
      "Miedo a introducir IA sin control suficiente sobre calidad y riesgo",
    ],
    deliverables: [
      "Definición del caso de uso y del riesgo operativo aceptable",
      "Integración de modelos, reglas y fuentes de verdad",
      "Interfaces para equipo interno, cliente o ambos",
      "Mecanismos de supervisión, logs y mejora continua",
    ],
    outcomes: [
      "Menos tiempo en tareas de bajo valor repetitivas",
      "Mejor contexto para atender, decidir o ejecutar",
      "Uso de IA conectado a procesos reales, no aislado",
    ],
    useCases: [
      "Clasificación y resumen de documentos",
      "Copilotos para equipos comerciales u operativos",
      "Agentes para soporte interno o externo",
      "Extracción de datos, validación y respuestas asistidas",
    ],
    faqs: [
      {
        question: "¿La IA sustituye el flujo actual o lo complementa?",
        answer:
          "Normalmente la planteamos como una capa que mejora un proceso concreto. Solo sustituimos partes del flujo cuando tiene sentido operativo y de riesgo.",
      },
      {
        question: "¿Se puede empezar con un piloto pequeño?",
        answer:
          "Sí. Recomendamos validar un caso de uso concreto, medir impacto y calidad, y escalar después con datos y aprendizaje.",
      },
      {
        question: "¿Cómo controláis errores o respuestas inconsistentes?",
        answer:
          "Definimos reglas, umbrales, validaciones, supervisiones y escalados para que la IA no quede sola donde aún no debe estarlo.",
      },
    ],
    detailSections: [
      {
        title: "Casos de uso donde la IA suele tener retorno rápido",
        cards: [
          {
            title: "Documentación y conocimiento interno",
            description:
              "Búsqueda asistida, resumen, respuesta contextual y acceso más rápido a procedimientos y normativa interna.",
          },
          {
            title: "Soporte y servicio",
            description:
              "Clasificación de tickets, propuestas de respuesta y priorización de incidencias antes del paso a humano.",
          },
          {
            title: "Operaciones y backoffice",
            description:
              "Extracción de datos, validación documental y tareas de bajo valor repetitivas con alto volumen.",
          },
          {
            title: "Venta consultiva",
            description:
              "Copilotos para preparar reuniones, resumir histórico y ordenar contexto comercial más rápido.",
          },
        ],
      },
      {
        title: "Condiciones para que la IA sea útil y no un problema",
        cards: [
          {
            title: "Fuentes fiables",
            description:
              "Sin conocimiento bien delimitado y actualizado, la IA solo escala la incertidumbre.",
          },
          {
            title: "Experiencia bien resuelta",
            description:
              "La interfaz importa: el equipo debe entender cuándo confiar, revisar o escalar.",
          },
          {
            title: "Gobierno y trazabilidad",
            description:
              "Cada recomendación o automatización necesita registros, contexto y controles para ser mantenible.",
          },
          {
            title: "Impacto medible",
            description:
              "Aterrizamos indicadores de tiempo, calidad o conversión para saber si la capa de IA está aportando valor real.",
          },
        ],
      },
    ],
    crossLinks: [
      {
        label: "Desarrollo de chatbots",
        path: "/servicios/desarrollo-chatbots-empresas",
        description:
          "Si necesitas una interfaz conversacional visible para cliente o equipo, esta landing aterriza mejor ese escenario.",
      },
      {
        label: "Consultoría tecnológica",
        path: "/servicios/consultoria-tecnologica",
        description:
          "Si todavía estás evaluando viabilidad, riesgo y prioridad antes de desplegar IA en operativa.",
      },
    ],
    relatedCaseSlugs: ["automatizacion-conversacional-soporte", "copiloto-documental-operaciones"],
  },
  {
    key: "saas",
    slug: "plataformas-saas",
    name: "Desarrollo de plataformas y SaaS",
    shortName: "Plataformas y SaaS",
    summary:
      "Construimos productos digitales multiusuario con criterio de negocio, arquitectura limpia y una hoja de ruta pensada para iterar sin rehacer.",
    heroTitle:
      "Plataformas y SaaS para lanzar con cabeza, validar con usuarios y escalar sobre una base seria.",
    heroIntro:
      "Aterrizamos la lógica del producto, priorizamos el MVP correcto y dejamos la arquitectura preparada para evolucionar con roadmap, soporte y nuevos módulos.",
    seo: {
      title: "Desarrollo de plataformas y SaaS",
      description:
        "Creamos plataformas web y productos SaaS escalables para empresas, startups y fundadores que necesitan lanzar con criterio y una arquitectura mantenible.",
      path: "/servicios/plataformas-saas",
      keywords: [
        "desarrollo saas",
        "crear saas",
        "plataforma web a medida",
        "mvp saas",
      ],
    },
    badge: "Product systems",
    ctaLabel: "Quiero construir una plataforma",
    ctaContext:
      "Definimos el alcance correcto, evitamos sobredesarrollar y dejamos el producto listo para seguir creciendo con datos y tracción real.",
    heroVisual: brandImages.hero,
    fit: [
      "Startups y fundadores con una propuesta clara pero sin ejecución técnica fiable",
      "Empresas que quieren lanzar un nuevo servicio digital o canal propio",
      "Equipos que necesitan rehacer un MVP para convertirlo en una base mantenible",
    ],
    pains: [
      "Ideas de producto sin un alcance bien priorizado",
      "MVPs improvisados que ya se han quedado pequeños demasiado pronto",
      "Dudas entre salir rápido y no comprometer la siguiente etapa del producto",
    ],
    deliverables: [
      "Discovery de producto y definición del MVP serio",
      "Arquitectura, experiencia, desarrollo y despliegue",
      "Roles, onboarding, billing o multiusuario según necesidad",
      "Roadmap de siguientes iteraciones con foco en adopción y revenue",
    ],
    outcomes: [
      "Producto lanzable con una base mantenible",
      "Prioridades claras para no quemar presupuesto en lo secundario",
      "Capacidad real para iterar con feedback y negocio",
    ],
    useCases: [
      "SaaS B2B multiusuario",
      "Portales de clientes o partners",
      "Marketplaces y productos verticales",
      "MVPs serios para validar mercado",
    ],
    faqs: [
      {
        question: "¿Podéis ayudar antes de tener especificaciones cerradas?",
        answer:
          "Sí. De hecho suele ser mejor empezar por discovery y blueprint de producto que desarrollar con requisitos vagos o contradicciones no resueltas.",
      },
      {
        question: "¿Trabajáis después del MVP?",
        answer:
          "Sí. Podemos seguir con roadmap, soporte, optimización, growth loops, nuevas funcionalidades e integraciones posteriores.",
      },
      {
        question: "¿Cómo evitáis construir demasiado al inicio?",
        answer:
          "Definimos el flujo mínimo que realmente permite validar uso, adopción y capacidad de venta. Todo lo demás se ordena después por impacto.",
      },
    ],
    detailSections: [
      {
        title: "Qué debe resolver un MVP serio desde la primera fase",
        cards: [
          {
            title: "Flujo principal completo",
            description:
              "Alta, uso, administración mínima y soporte suficiente para validar con usuarios reales.",
          },
          {
            title: "Modelo de roles y permisos",
            description:
              "La multiusuario y la gestión interna suelen romper MVPs mal planteados si no se piensan desde el inicio.",
          },
          {
            title: "Instrumentación básica",
            description:
              "Medimos uso, embudos y puntos de fuga para decidir el roadmap con datos.",
          },
          {
            title: "Soporte a operaciones",
            description:
              "Paneles, estados, soporte y control operativo para que el producto pueda sostener su crecimiento.",
          },
        ],
      },
      {
        title: "Lo que diferencia una plataforma lista para escalar",
        cards: [
          {
            title: "Arquitectura modulable",
            description:
              "Permite sumar nuevas líneas de negocio, roles, integraciones o verticales sin reescribir la base.",
          },
          {
            title: "Experiencia alineada con el negocio",
            description:
              "No solo construimos funcionalidad; ordenamos onboarding, adopción, claridad y retención.",
          },
          {
            title: "Backoffice pensado para operar",
            description:
              "Soporte, control y visibilidad para que el equipo pueda gestionar el producto con criterio.",
          },
          {
            title: "Preparación para automatización e IA",
            description:
              "Dejamos la plataforma lista para sumar capas de automatización, analítica o IA cuando tenga sentido.",
          },
        ],
      },
    ],
    crossLinks: [
      {
        label: "Consultoría tecnológica",
        path: "/servicios/consultoria-tecnologica",
        description:
          "Si necesitas bajar alcance, priorizar y decidir arquitectura antes de empezar el build.",
      },
      {
        label: "Desarrollo de software a medida",
        path: "/servicios/desarrollo-software-medida",
        description:
          "Cuando la necesidad principal es una herramienta interna o una capa operativa en lugar de un producto SaaS.",
      },
    ],
    relatedCaseSlugs: ["mvp-saas-comercial"],
  },
  {
    key: "consulting",
    slug: "consultoria-tecnologica",
    name: "Consultoría tecnológica",
    shortName: "Consultoría",
    summary:
      "Auditamos, priorizamos y definimos la hoja de ruta técnica adecuada para que no inviertas a ciegas ni construyas la solución equivocada.",
    heroTitle:
      "Consultoría tecnológica para decidir con criterio antes de comprometer tiempo, stack y presupuesto.",
    heroIntro:
      "Te ayudamos a evaluar sistemas, detectar cuellos de botella, revisar arquitectura y definir una hoja de ruta defendible antes de lanzar un proyecto o rehacer un producto.",
    seo: {
      title: "Consultoría tecnológica para empresas",
      description:
        "Análisis, auditoría y planificación técnica para empresas que necesitan definir una solución digital, revisar software existente o priorizar una hoja de ruta realista.",
      path: "/servicios/consultoria-tecnologica",
      keywords: [
        "consultoria tecnologica",
        "auditoria de software",
        "asesoramiento tecnologico para empresas",
      ],
    },
    badge: "Strategic clarity",
    ctaLabel: "Quiero claridad técnica",
    ctaContext:
      "Revisamos objetivo, restricciones, sistemas y riesgos para tomar decisiones con menos incertidumbre y más criterio.",
    heroVisual: brandImages.method,
    fit: [
      "Empresas que no tienen claro qué construir, mejorar o sustituir",
      "Negocios con software heredado que necesitan una hoja de ruta creíble",
      "Equipos que van a invertir en tecnología y quieren reducir riesgo estratégico",
    ],
    pains: [
      "Incertidumbre técnica antes de invertir en un proyecto relevante",
      "Arquitecturas viejas o poco mantenibles que nadie quiere tocar",
      "Decisiones de stack y alcance tomadas sin una visión clara de negocio",
    ],
    deliverables: [
      "Auditoría funcional y técnica del punto de partida",
      "Mapa de oportunidades, riesgos y dependencias",
      "Propuesta de arquitectura, fases y prioridades",
      "Recomendaciones de producto, integración y evolución",
    ],
    outcomes: [
      "Más claridad para invertir donde toca y cuando toca",
      "Menos riesgo de rehacer, sobredimensionar o escoger mal la solución",
      "Hoja de ruta alineada con impacto, presupuesto y equipo disponible",
    ],
    useCases: [
      "Previa a un desarrollo nuevo",
      "Revisión de software existente",
      "Definición de integraciones y procesos",
      "Roadmap de digitalización o IA aplicada",
    ],
    faqs: [
      {
        question: "¿La consultoría puede acabar sin desarrollo posterior?",
        answer:
          "Sí. A veces el mayor valor es ordenar bien el problema, definir una hoja de ruta clara y dejar la decisión mejor preparada, aunque la ejecución llegue después.",
      },
      {
        question: "¿Sirve si ya tengo proveedor técnico?",
        answer:
          "Sí. Podemos actuar como segunda mirada para revisar alcance, arquitectura, deuda técnica y prioridades antes de seguir invirtiendo.",
      },
      {
        question: "¿Qué os solemos pedir en una consultoría?",
        answer:
          "Desde revisar un MVP, un stack heredado o un plan de IA, hasta ordenar un roadmap completo de operativa, producto o integraciones.",
      },
    ],
    detailSections: [
      {
        title: "Momentos en los que una consultoría ahorra más dinero que un desarrollo precipitado",
        cards: [
          {
            title: "Antes de construir desde cero",
            description:
              "Para decidir alcance, arquitectura, riesgos y fases con criterio en lugar de adivinar.",
          },
          {
            title: "Cuando un sistema ya no da más",
            description:
              "Auditamos deuda, dependencias y opciones reales de evolución o sustitución progresiva.",
          },
          {
            title: "Al introducir IA o automatización",
            description:
              "Aterrizamos casos de uso viables, datos disponibles y condición operativa antes de desplegar tecnología.",
          },
          {
            title: "Cuando varios equipos discrepan",
            description:
              "Ordenamos decisión de negocio, experiencia y tecnología para recuperar una dirección común.",
          },
        ],
      },
      {
        title: "Qué te llevas después de una buena fase de definición",
        cards: [
          {
            title: "Prioridades compartidas",
            description:
              "Todo el mundo entiende qué se hace primero, por qué y con qué criterio se deja fuera el resto.",
          },
          {
            title: "Mapa de riesgos",
            description:
              "Identificamos deuda, dependencias, integraciones delicadas y decisiones que no conviene improvisar.",
          },
          {
            title: "Ruta ejecutable",
            description:
              "El proyecto deja de ser una idea difusa y se convierte en fases, entregables y preguntas concretas.",
          },
          {
            title: "Mejor capacidad de negociación",
            description:
              "Llegas a desarrollo con más claridad para comparar propuestas, costes y enfoques técnicos.",
          },
        ],
      },
    ],
    relatedCaseSlugs: ["mvp-saas-comercial", "copiloto-documental-operaciones"],
  },
];

export const caseStudies: CaseStudyEntry[] = [
  {
    slug: "auctorio-plataforma-editorial-ia",
    title:
      "Auctorio — Plataforma editorial con IA para publicación multisitio",
    sector: "Producto propio / SaaS",
    summary:
      "Diseñamos y construimos un cockpit editorial completo con generación de contenido por IA, QA automatizado y publicación coordinada en múltiples sitios desde un único panel.",
    problem:
      "Gestionar contenido editorial para varias webs implicaba procesos manuales, formatos inconsistentes y cero trazabilidad entre redacción, revisión y publicación.",
    solution:
      "Construimos Auctorio: una plataforma multi-tenant con pipeline editorial completo — desde brief hasta publicación — con generación de textos e imágenes por IA (DeepSeek + FLUX), QA automático, derivados para redes sociales y publishers conectados a cada sitio destino con modo dry-run de seguridad.",
    impact: [
      "Pipeline editorial end-to-end con IA integrada para texto e imagen",
      "Publicación multisitio coordinada con trazabilidad por versión",
      "QA automático que valida longitud, SEO, encabezados e imágenes antes de publicar",
      "Reducción del tiempo de producción editorial de días a horas",
    ],
    ctaLabel: "Ver desarrollo de plataformas",
    ctaLink: "/servicios/plataformas-saas",
    serviceKeys: ["saas", "ai", "software", "automation"],
  },
  {
    slug: "talkaris-plataforma-conversacional-ia",
    title:
      "Talkaris — Plataforma conversacional con IA embebible y multi-tenant",
    sector: "Producto propio / SaaS",
    summary:
      "Creamos una plataforma SaaS de IA conversacional que permite a empresas desplegar asistentes inteligentes en sus webs mediante un widget embebible, con ingestión de conocimiento y gestión multi-tenant.",
    problem:
      "Las soluciones conversacionales del mercado obligaban a elegir entre control limitado, costes crecientes o integraciones frágiles sin posibilidad real de personalizar el comportamiento del asistente.",
    solution:
      "Desarrollamos Talkaris: una plataforma decoupled con widget embebible (iframe + async loader), ingestión automática de conocimiento desde sitemaps, HTML, PDF y markdown, consola de administración multi-tenant, rate limiting, SSR con SEO bilingüe y despliegue con Docker y Cloudflare.",
    impact: [
      "Widget conversacional desplegable en cualquier web en minutos",
      "Ingestión de conocimiento automática desde múltiples fuentes",
      "Arquitectura multi-tenant con aislamiento por workspace",
      "Portal público con SSR y SEO bilingüe (ES/EN) optimizado",
    ],
    ctaLabel: "Ver desarrollo de chatbots",
    ctaLink: "/servicios/desarrollo-chatbots-empresas",
    serviceKeys: ["chatbots", "ai", "saas", "software"],
  },
  {
    slug: "guia-programacion-tv-desarrollo-cliente",
    title:
      "Guía de Programación TV — Plataforma de contenido televisivo en tiempo real",
    sector: "Desarrollo a cliente / Media",
    summary:
      "Desarrollamos para un cliente una plataforma completa de programación televisiva con EPG en tiempo real, sistema social, contenido editorial integrado y arquitectura preparada para escalar.",
    problem:
      "El cliente necesitaba una guía de programación TV moderna que fuera más allá de un simple listado de canales: quería descubrimiento de contenido, interacción social y capacidad editorial, todo con rendimiento SEO para captar tráfico orgánico.",
    solution:
      "Construimos guiaprogramaciontv.com como un monorepo con Angular SSR y API Node.js/Express sobre MongoDB: EPG sincronizado con fuentes reales, sistema de usuarios con bookmarks, ratings y chat, integración editorial con Auctorio para publicar artículos temáticos, y sitemaps dinámicos con indexación en Google Search Console.",
    impact: [
      "Guía de programación en tiempo real con actualizaciones vía WebSocket",
      "Sistema social completo: bookmarks, valoraciones, conversaciones y bloqueo",
      "Contenido editorial integrado con pipeline de publicación automatizado",
      "SEO técnico con SSR, sitemaps dinámicos y rendimiento optimizado",
    ],
    ctaLabel: "Ver desarrollo de software",
    ctaLink: "/servicios/desarrollo-software-medida",
    serviceKeys: ["software", "ai", "consulting"],
  },
  {
    slug: "operaciones-servicios-b2b",
    title: "Plataforma interna para centralizar operaciones y seguimiento multiequipo",
    sector: "Servicios B2B",
    summary:
      "Unificamos operativa, estados y reporting en un sistema propio que sustituyó seguimiento disperso y decisiones sin visibilidad.",
    problem:
      "La operativa se repartía entre correo, hojas de cálculo y varias herramientas sin una fuente de verdad única. Cada equipo tenía una foto parcial del estado real.",
    solution:
      "Diseñamos un backoffice a medida con roles, estados, alertas, paneles y automatizaciones entre sistemas para coordinar operaciones, dirección y seguimiento.",
    impact: [
      "Menos dependencias manuales para tareas de seguimiento y cierre",
      "Información centralizada para operaciones y dirección",
      "Mayor control de tiempos, bloqueos y volumen de trabajo",
    ],
    ctaLabel: "Ver servicio relacionado",
    ctaLink: "/servicios/desarrollo-software-medida",
    serviceKeys: ["software", "automation", "consulting"],
  },
  {
    slug: "mvp-saas-comercial",
    title: "MVP SaaS listo para validar mercado sin hipotecar la evolución técnica",
    sector: "Startup / SaaS",
    summary:
      "Convertimos una idea ambiciosa en un MVP serio con la arquitectura mínima necesaria para vender, aprender y seguir construyendo.",
    problem:
      "El equipo fundador necesitaba salir rápido a mercado, pero no quería repetir el patrón de un MVP improvisado que obliga a rehacer el producto cuando empieza a traccionar.",
    solution:
      "Definimos alcance real, experiencia principal, roles, onboarding y panel de administración con una arquitectura pensada para iterar y crecer por roadmap.",
    impact: [
      "Salida al mercado con una versión válida para vender y aprender",
      "Base técnica mantenible para nuevas iteraciones",
      "Claridad sobre el siguiente roadmap de producto y negocio",
    ],
    ctaLabel: "Explorar desarrollo SaaS",
    ctaLink: "/servicios/plataformas-saas",
    serviceKeys: ["saas", "consulting"],
  },
  {
    slug: "automatizacion-conversacional-soporte",
    title: "Automatización conversacional para soporte y cualificación comercial",
    sector: "Soporte y ventas",
    summary:
      "Combinamos chatbots, reglas e IA aplicada para mejorar la primera respuesta, ordenar solicitudes y reducir trabajo manual repetitivo.",
    problem:
      "Las consultas llegaban por varios canales, se clasificaban manualmente y el equipo perdía demasiado tiempo en triage antes de atender casos de más valor.",
    solution:
      "Creamos un flujo conversacional conectado a formularios, base de conocimiento y CRM para responder preguntas, recoger contexto y activar tareas automáticamente.",
    impact: [
      "Menos tiempo en triage y tareas de bajo valor",
      "Mejor experiencia de respuesta inicial en web y canales conversacionales",
      "Leads y solicitudes mejor definidos antes de pasar a una persona",
    ],
    ctaLabel: "Ver desarrollo de chatbots",
    ctaLink: "/servicios/desarrollo-chatbots-empresas",
    serviceKeys: ["chatbots", "ai", "automation"],
  },
  {
    slug: "ecosistema-distribucion-industrial",
    title: "Ecosistema operativo para distribución industrial con datos sincronizados",
    sector: "Industria / distribución",
    summary:
      "Ordenamos inventario, pedidos y seguimiento interno conectando sistemas y automatizaciones sobre un flujo operativo único.",
    problem:
      "La información crítica de pedidos, stock y seguimiento se repartía entre varios sistemas, provocando errores, tiempos muertos y demasiadas validaciones manuales.",
    solution:
      "Definimos un flujo operativo único, integramos fuentes de datos y construimos una capa propia para coordinar estados, avisos y reporting entre equipos.",
    impact: [
      "Menos duplicidades y menos incertidumbre en el estado del pedido",
      "Mejor coordinación entre comercial, operaciones y dirección",
      "Base preparada para nuevas automatizaciones y más visibilidad analítica",
    ],
    ctaLabel: "Ver automatización de procesos",
    ctaLink: "/servicios/automatizacion-procesos",
    serviceKeys: ["software", "automation"],
  },
  {
    slug: "copiloto-documental-operaciones",
    title: "Copiloto documental para consultas internas y respuesta operativa más rápida",
    sector: "Operaciones / conocimiento",
    summary:
      "Aplicamos IA y gobierno documental para que el equipo encontrara procedimientos, respuestas y contexto sin depender siempre de expertos internos.",
    problem:
      "La documentación existía, pero estaba dispersa, desactualizada o demasiado difícil de localizar en momentos de urgencia operativa.",
    solution:
      "Estructuramos las fuentes, definimos límites y desplegamos un asistente interno con supervisión para consultas de procedimiento y contexto operativo.",
    impact: [
      "Acceso más rápido a conocimiento operativo validado",
      "Menos interrupciones a perfiles expertos por preguntas recurrentes",
      "Mejor consistencia en respuestas internas y soporte a nuevos miembros",
    ],
    ctaLabel: "Explorar IA aplicada",
    ctaLink: "/servicios/inteligencia-artificial-empresas",
    serviceKeys: ["ai", "consulting"],
  },
];

export const articles: ArticleEntry[] = [
  {
    slug: "cuanto-cuesta-desarrollar-software-medida",
    title: "Cuánto cuesta desarrollar software a medida y de qué depende realmente",
    category: "Decisión",
    summary:
      "Un marco realista para entender coste, alcance, arquitectura y prioridad antes de pedir presupuesto.",
    readingTime: "7 min",
    ctaLabel: "Solicitar diagnóstico",
    ctaLink: "/contacto",
    seo: {
      title: "Cuánto cuesta desarrollar software a medida",
      description:
        "Analizamos qué influye en el coste de un software a medida, cómo priorizar alcance y cuándo compensa construir una solución propia.",
      path: "/blog/cuanto-cuesta-desarrollar-software-medida",
      keywords: [
        "cuanto cuesta desarrollar software a medida",
        "precio software a medida",
      ],
    },
    sections: [
      {
        title: "No compras código: compras una solución a un problema operativo o de producto",
        paragraphs: [
          "El coste depende del problema que quieres resolver, del número de procesos implicados y del nivel de complejidad técnica necesario.",
          "No cuesta lo mismo un backoffice para un flujo interno que una plataforma multiusuario con integraciones, permisos, automatizaciones y soporte continuo.",
          "Por eso dos presupuestos pueden parecer comparables sobre el papel y, sin embargo, estar resolviendo cosas muy distintas en calidad, riesgo y mantenibilidad.",
        ],
      },
      {
        title: "Variables que suelen mover el presupuesto",
        paragraphs: [
          "Las variables clave suelen ser el alcance funcional, las integraciones, la calidad esperada, la urgencia, la seguridad y la necesidad de evolución posterior.",
          "También influye mucho si el proyecto llega con discovery previo o si todavía hay que ordenar objetivos, flujos, dependencias y criterios de éxito.",
        ],
        bullets: [
          "Número de flujos y pantallas críticas",
          "Usuarios, roles y permisos",
          "Integraciones con terceros o sistemas propios",
          "Automatizaciones, IA o reporting avanzado",
        ],
      },
      {
        title: "La mejor forma de reducir riesgo es construir por fases",
        paragraphs: [
          "Empezar por discovery y una primera fase priorizada suele ser la mejor vía para controlar coste, aprender rápido y evitar sobredimensionar.",
          "Definir un MVP serio no significa recortar valor: significa concentrar la inversión en lo que realmente desbloquea negocio primero.",
        ],
      },
      {
        title: "Qué deberías pedir antes de aceptar un presupuesto",
        paragraphs: [
          "Más allá del número final, te interesa entender qué se incluye, qué se queda fuera, qué dependencias existen y cómo se ha pensado la evolución posterior.",
          "Un buen presupuesto explica lógica de fases, entregables, supuestos de partida y riesgos. Si solo ves una cifra con una lista vaga de funcionalidades, falta base.",
        ],
        bullets: [
          "Alcance priorizado y excluido de forma explícita",
          "Dependencias con terceros, datos o integraciones delicadas",
          "Criterios de QA, despliegue y soporte inicial",
          "Propuesta de evolución después de la primera entrega",
        ],
      },
      {
        title: "El coste correcto no es el más bajo: es el que protege mejor la decisión",
        paragraphs: [
          "El coste de una mala decisión técnica aparece después: retrasos, rehacer, adopción pobre, deuda y necesidad de volver a empezar cuando el negocio ya dependía del sistema.",
          "Por eso conviene comparar coste total, tiempo hasta primer valor y capacidad de evolución, no solo el precio de arranque.",
        ],
      },
    ],
  },
  {
    slug: "cuando-automatizar-procesos-empresa",
    title: "Cuándo conviene automatizar procesos en una empresa",
    category: "Operación",
    summary:
      "Señales claras para detectar que un proceso ya no debería seguir siendo manual y cómo priorizar el primer movimiento.",
    readingTime: "6 min",
    ctaLabel: "Ver automatización",
    ctaLink: "/servicios/automatizacion-procesos",
    seo: {
      title: "Cuándo conviene automatizar procesos en una empresa",
      description:
        "Identifica cuándo un proceso manual ya está frenando a tu equipo y cómo priorizar automatizaciones con impacto real.",
      path: "/blog/cuando-automatizar-procesos-empresa",
      keywords: [
        "cuando automatizar procesos",
        "automatizacion de procesos empresariales",
      ],
    },
    sections: [
      {
        title: "La primera señal es que el equipo repite lo mismo cada semana",
        paragraphs: [
          "Si una tarea se repite, requiere copiar datos entre sistemas o depende de recordatorios manuales, probablemente ya sea automatizable.",
          "Lo importante no es solo el tiempo que consume, sino el coste acumulado de errores, retrasos y saturación del equipo.",
          "Muchas empresas no ven la gravedad hasta que la carga crece, cambian dos personas clave o el proceso empieza a tocar experiencia de cliente.",
        ],
      },
      {
        title: "No todo se automatiza a la vez",
        paragraphs: [
          "La prioridad debe salir de una combinación entre volumen, coste del error, impacto en cliente y facilidad de integración con el stack actual.",
          "El mejor primer caso de uso suele ser visible, repetitivo y con pocas excepciones. Así el equipo percibe valor rápido y la siguiente automatización se defiende mejor.",
        ],
        bullets: [
          "Empieza por el flujo con más carga y menos excepciones",
          "Mide tiempo ahorrado y errores evitados",
          "Conecta primero sistemas críticos antes de añadir capas complejas",
        ],
      },
      {
        title: "Automatizar no es complicar",
        paragraphs: [
          "Una buena automatización simplifica la operativa y deja trazabilidad. Si crea más opacidad o más dependencia técnica que la que resuelve, está mal planteada.",
        ],
      },
      {
        title: "Qué procesos suelen dar mejor retorno al principio",
        paragraphs: [
          "Onboarding, cualificación comercial, actualización de estados, sincronización entre CRM y ERP, documentación repetitiva o clasificación inicial de solicitudes suelen ser buenos puntos de partida.",
          "No porque sean los únicos, sino porque permiten medir tiempo ahorrado, errores evitados y mejora de respuesta de forma bastante clara.",
        ],
      },
      {
        title: "Automatización sin gobierno acaba creando otro problema",
        paragraphs: [
          "Si nadie entiende qué regla existe, quién la mantiene o cuándo intervenir a mano, la automatización se convierte en una caja opaca y frágil.",
          "La clave es dejar reglas visibles, trazabilidad, alertas y una lógica sencilla de evolución para que el equipo pueda convivir con el flujo sin miedo.",
        ],
      },
    ],
  },
  {
    slug: "software-medida-vs-herramienta-estandar",
    title: "Software a medida vs herramienta estándar: cómo decidir sin improvisar",
    category: "Comparativa",
    summary:
      "La decisión no va de construir siempre, sino de saber cuándo una herramienta genérica deja de encajar de verdad.",
    readingTime: "8 min",
    ctaLabel: "Hablar con un consultor",
    ctaLink: "/servicios/consultoria-tecnologica",
    seo: {
      title: "Software a medida vs herramienta estándar",
      description:
        "Comparativa para decidir cuándo conviene usar una herramienta estándar y cuándo tiene sentido desarrollar una solución propia.",
      path: "/blog/software-medida-vs-herramienta-estandar",
      keywords: [
        "software a medida vs herramienta estandar",
        "cuando desarrollar software propio",
      ],
    },
    sections: [
      {
        title: "Una herramienta estándar funciona bien cuando el proceso también lo es",
        paragraphs: [
          "Si tu necesidad encaja bien en un producto probado y no necesitas diferenciarte por operativa, suele ser la vía más rápida y eficiente.",
          "También suele ser una buena opción cuando el equipo necesita resolver una necesidad común y no quiere asumir responsabilidad de producto o stack propio.",
        ],
      },
      {
        title: "El software a medida compensa cuando la operativa es una ventaja competitiva",
        paragraphs: [
          "Si tu flujo es crítico, específico o genera demasiada fricción al adaptarlo a una herramienta genérica, el coste real deja de estar en la licencia y pasa a estar en la rigidez.",
          "A partir de cierto punto, el problema no es la herramienta en sí, sino todas las capas manuales, workarounds y pérdida de visibilidad que introduces para hacerla encajar.",
        ],
        bullets: [
          "Procesos internos muy particulares",
          "Necesidad de integrar varias fuentes de datos",
          "Restricciones de experiencia o negocio que el software actual no cubre",
        ],
      },
      {
        title: "La mejor decisión muchas veces es híbrida",
        paragraphs: [
          "Muchas empresas combinan herramientas estándar con capas a medida para lo realmente diferencial. Esa suele ser la vía más inteligente y sostenible.",
        ],
      },
      {
        title: "Cómo detectar que una herramienta ya no está encajando",
        paragraphs: [
          "La señal no suele ser técnica. Suele aparecer en forma de equipos que trabajan fuera del sistema, informes paralelos, procesos que dependen de personas concretas y decisiones sin datos confiables.",
          "Cuando adaptar el proceso a la herramienta ya cuesta más que repensar la capa correcta, conviene revisar si sigue teniendo sentido forzar la solución estándar.",
        ],
      },
      {
        title: "La comparativa correcta incluye evolución, no solo arranque",
        paragraphs: [
          "Una herramienta puede ser barata al principio y carísima al crecer si bloquea integraciones, reporting, trazabilidad o experiencia de cliente.",
          "Del mismo modo, una capa a medida puede ser una mala idea si el problema aún no está bien definido. La clave está en el momento y en el alcance adecuado.",
        ],
      },
    ],
  },
  {
    slug: "que-necesitas-antes-de-crear-un-saas",
    title: "Qué necesitas tener claro antes de crear un SaaS",
    category: "Producto",
    summary:
      "Checklist para fundadores y equipos que quieren lanzar un producto digital sin empezar por el lado equivocado.",
    readingTime: "7 min",
    ctaLabel: "Explorar plataformas SaaS",
    ctaLink: "/servicios/plataformas-saas",
    seo: {
      title: "Qué necesitas antes de crear un SaaS",
      description:
        "Checklist de negocio, producto y tecnología para lanzar un SaaS con alcance realista y base sólida desde el inicio.",
      path: "/blog/que-necesitas-antes-de-crear-un-saas",
      keywords: ["crear saas", "que necesito antes de crear un saas"],
    },
    sections: [
      {
        title: "Primero define el problema, el usuario y la forma de capturar valor",
        paragraphs: [
          "Antes de hablar de funcionalidades, necesitas claridad sobre quién paga, qué dolor resuelves y qué cambio concreto produce el producto en el trabajo del usuario.",
          "Sin esa base, lo normal es que el backlog se llene de ideas razonables pero desconectadas de lo que realmente valida mercado.",
        ],
      },
      {
        title: "Después define el MVP real",
        paragraphs: [
          "Un MVP serio no es una demo. Debe resolver el flujo mínimo para que alguien lo use, lo entienda y pueda pagar o validar con criterio.",
          "Eso suele obligar a elegir muy bien el caso de uso inicial y a renunciar a funcionalidades que parecen importantes pero todavía no son nucleares.",
        ],
        bullets: [
          "Flujo principal de alta y uso",
          "Modelo mínimo de roles o permisos",
          "Panel de administración o soporte",
          "Medición de uso desde el inicio",
        ],
      },
      {
        title: "La tecnología debe permitir aprender rápido",
        paragraphs: [
          "El objetivo inicial es lanzar con criterio, observar comportamiento real y evolucionar con orden. La tecnología tiene que servir a ese aprendizaje.",
        ],
      },
      {
        title: "Qué debería salir de una primera fase de discovery",
        paragraphs: [
          "Antes de construir, conviene dejar claro alcance inicial, supuestos de negocio, riesgos técnicos, experiencia principal, dependencias y qué no entra todavía en el MVP.",
          "Una buena fase de discovery no retrasa. Evita meses de ruido, sobredesarrollo y discusiones improductivas una vez arrancado el build.",
        ],
      },
      {
        title: "El error habitual es intentar parecer una plataforma madura demasiado pronto",
        paragraphs: [
          "Querer lanzar con demasiadas capas de permisos, automatizaciones, billing complejo o integraciones secundarias suele ralentizar la salida sin mejorar la validación inicial.",
          "El primer objetivo es poner el producto delante del usuario correcto con una experiencia suficientemente sólida como para aprender algo útil.",
        ],
      },
    ],
  },
  {
    slug: "chatbots-atencion-cliente-empresa",
    title: "Cuándo un chatbot para atención al cliente tiene sentido de verdad",
    category: "Conversacional",
    summary:
      "No todos los negocios necesitan un chatbot, pero hay señales claras de cuándo la capa conversacional ya puede aportar valor real.",
    readingTime: "6 min",
    ctaLabel: "Ver desarrollo de chatbots",
    ctaLink: "/servicios/desarrollo-chatbots-empresas",
    seo: {
      title: "Chatbots para atención al cliente en empresas",
      description:
        "Descubre cuándo un chatbot para atención al cliente puede mejorar tiempos de respuesta, cualificación y soporte sin convertirse en un estorbo.",
      path: "/blog/chatbots-atencion-cliente-empresa",
      keywords: [
        "chatbots para atención al cliente",
        "chatbots para empresas",
        "cuándo implementar un chatbot",
      ],
    },
    sections: [
      {
        title: "La señal más clara es la repetición",
        paragraphs: [
          "Si las mismas preguntas vuelven una y otra vez y obligan a dedicar tiempo humano a tareas de bajo valor, la capa conversacional ya puede aliviar carga.",
          "La pregunta clave no es si un chatbot queda moderno, sino si reduce tiempo de respuesta, clasifica mejor y libera trabajo repetitivo sin degradar experiencia.",
        ],
      },
      {
        title: "El chatbot debe estar conectado a una acción real",
        paragraphs: [
          "Responder por responder sirve de poco. El valor aparece cuando el chatbot puede orientar, registrar contexto, escalar o activar procesos posteriores.",
          "Por eso los mejores proyectos conversacionales no empiezan en la interfaz, sino en el flujo de negocio que va a ocurrir después de la conversación.",
        ],
        bullets: [
          "Recoger datos comerciales clave",
          "Resolver FAQ con conocimiento curado",
          "Escalar al equipo con contexto suficiente",
          "Activar tareas o tickets cuando toca",
        ],
      },
      {
        title: "La mala experiencia suele venir de una mala gobernanza",
        paragraphs: [
          "Un chatbot falla cuando no tiene límites, ni conocimiento bien definido, ni rutas de salida. La tecnología no corrige por sí sola un flujo mal planteado.",
        ],
      },
      {
        title: "Dónde suele aportar más en una primera fase",
        paragraphs: [
          "Web corporativa, soporte de primer nivel, cualificación comercial, preguntas frecuentes de producto o asistentes internos para procedimientos son escenarios donde el valor se percibe rápido.",
          "Son espacios donde la repetición es alta, el margen de error puede controlarse y la escalada a humano está bastante clara.",
        ],
      },
      {
        title: "Lo que distingue un chatbot serio de una demo con IA",
        paragraphs: [
          "Un chatbot serio tiene conocimiento curado, tono definido, límites, trazabilidad, medición y una forma clara de mejorar con conversaciones reales.",
          "Si no existe esa capa de gobierno, lo que parece una mejora inicial acaba generando más desconfianza, más soporte manual y peor experiencia.",
        ],
      },
    ],
  },
  {
    slug: "ia-para-equipos-operativos",
    title: "IA para equipos operativos: dónde aporta más y dónde no deberías empezar",
    category: "IA aplicada",
    summary:
      "Casos de uso de IA interna para operaciones, soporte y conocimiento, con foco en utilidad real y riesgo controlado.",
    readingTime: "7 min",
    ctaLabel: "Explorar IA aplicada",
    ctaLink: "/servicios/inteligencia-artificial-empresas",
    seo: {
      title: "IA para equipos operativos",
      description:
        "Analizamos dónde la IA puede ayudar a equipos operativos, de soporte y conocimiento interno, y dónde no conviene empezar.",
      path: "/blog/ia-para-equipos-operativos",
      keywords: [
        "ia para equipos operativos",
        "copilotos para empresas",
        "ia aplicada a operaciones",
      ],
    },
    sections: [
      {
        title: "Empieza por información, no por magia",
        paragraphs: [
          "La IA suele aportar antes en tareas de búsqueda, resumen, clasificación y preparación de contexto que en decisiones críticas totalmente autónomas.",
          "Cuanto más fácil sea validar calidad y más acotado esté el flujo, mejor encaja una primera capa de IA en un entorno operativo.",
        ],
      },
      {
        title: "Los mejores primeros casos de uso son repetitivos y medibles",
        paragraphs: [
          "Cuando hay volumen, criterios claros y una forma razonable de validar calidad, la capa de IA puede aportar mucho sin poner en riesgo el sistema entero.",
          "Eso permite medir ahorro, velocidad, consistencia y adopción antes de pasar a casos más complejos o sensibles.",
        ],
        bullets: [
          "Clasificación de documentos o tickets",
          "Respuestas asistidas para soporte",
          "Búsqueda contextual de procedimientos",
          "Preparación de contexto para comercial u operaciones",
        ],
      },
      {
        title: "La adopción interna importa tanto como el modelo",
        paragraphs: [
          "Si el equipo no entiende qué hace la IA, cuándo confiar o cómo corregirla, la adopción cae y la herramienta se convierte en ruido en lugar de ayuda.",
        ],
      },
      {
        title: "Qué deberías dejar claro antes de desplegar una capa de IA",
        paragraphs: [
          "Fuente de datos, calidad esperada, forma de supervisar, límites de autonomía, responsables y escenarios donde la salida debe revisarse siempre.",
          "Cuando eso no está definido, la IA se percibe como una caja negra y el proyecto pierde credibilidad dentro del equipo.",
        ],
      },
      {
        title: "IA aplicada no significa sustituir criterio humano",
        paragraphs: [
          "En muchos contextos la IA acelera preparación, clasificación o respuesta inicial, pero la decisión final sigue necesitando supervisión o validación de negocio.",
          "Plantearla así mejora confianza, reduce rechazo interno y permite evolucionar la autonomía solo cuando el sistema ya ha demostrado control.",
        ],
      },
    ],
  },
  {
    slug: "migrar-software-legacy-sin-romper-operativa",
    title: "Cómo migrar software legacy sin romper la operativa",
    category: "Arquitectura",
    summary:
      "Una ruta pragmática para revisar deuda técnica, priorizar riesgo y sustituir piezas sin paralizar el negocio.",
    readingTime: "8 min",
    ctaLabel: "Pedir consultoría",
    ctaLink: "/servicios/consultoria-tecnologica",
    seo: {
      title: "Migrar software legacy sin romper la operativa",
      description:
        "Guía para revisar software legacy, priorizar riesgo y modernizar sistemas sin detener la operativa diaria.",
      path: "/blog/migrar-software-legacy-sin-romper-operativa",
      keywords: [
        "migrar software legacy",
        "modernizar software empresarial",
        "auditoria de software heredado",
      ],
    },
    sections: [
      {
        title: "La migración no empieza en el código: empieza en el mapa de dependencias",
        paragraphs: [
          "Antes de tocar una línea, necesitas saber qué procesos se apoyan en el sistema, qué integraciones existen y dónde están los puntos de mayor riesgo.",
          "Ese mapa sirve para evitar dos errores caros: romper un flujo crítico sin verlo venir o intentar reescribir demasiado sin una secuencia realista.",
        ],
      },
      {
        title: "No siempre conviene reescribir todo",
        paragraphs: [
          "En muchos casos la mejor vía es aislar módulos, crear una nueva capa operativa o sustituir primero los puntos de mayor fricción.",
          "La prioridad suele estar en proteger continuidad operativa mientras ganas control sobre las zonas donde hoy hay más deuda o más bloqueo.",
        ],
        bullets: [
          "Separar capas más críticas",
          "Crear interfaces nuevas sobre procesos existentes",
          "Sustituir integraciones frágiles",
          "Planificar una transición por fases",
        ],
      },
      {
        title: "Modernizar sin romper exige gobierno y seguimiento",
        paragraphs: [
          "La migración técnica debe acompasarse con la operativa y con el equipo. Sin roadmap, QA y handoff claros, el riesgo se multiplica.",
        ],
      },
      {
        title: "Cómo priorizar la primera fase de modernización",
        paragraphs: [
          "La primera fase debería atacar el punto donde coinciden riesgo alto, fricción diaria y posibilidad razonable de aislar una mejora sin bloquear el resto.",
          "No siempre es el módulo más antiguo. Muchas veces es el que peor trazabilidad ofrece o el que más trabajo manual genera alrededor.",
        ],
      },
      {
        title: "El objetivo real es recuperar capacidad de evolución",
        paragraphs: [
          "Modernizar software legacy no va solo de limpiar tecnología. Va de devolver al negocio la posibilidad de cambiar, integrar, medir y lanzar mejoras sin miedo constante a romper algo crítico.",
          "Cuando se plantea así, la conversación deja de ser una reescritura abstracta y pasa a ser una decisión operativa y financiera mucho más clara.",
        ],
      },
    ],
  },
  {
    slug: "discovery-tecnico-que-debe-salir-de-la-primera-fase",
    title: "Discovery técnico: qué debería salir de una primera fase bien hecha",
    category: "Discovery",
    summary:
      "Los entregables, decisiones y límites que deberías exigir antes de pasar a presupuesto o build.",
    readingTime: "6 min",
    ctaLabel: "Explorar consultoría",
    ctaLink: "/servicios/consultoria-tecnologica",
    publishedAt: "2026-03-10",
    tags: ["discovery", "alcance", "priorización"],
    seo: {
      title: "Discovery técnico: qué debería salir de una primera fase",
      description:
        "Guía práctica para entender qué entregables y decisiones deberían salir de una primera fase de discovery técnico bien planteada.",
      path: "/blog/discovery-tecnico-que-debe-salir-de-la-primera-fase",
      keywords: [
        "discovery tecnico",
        "primera fase discovery",
        "alcance tecnico proyecto",
      ],
    },
    sections: [
      {
        title: "Discovery no es una reunión elegante: es una fase para decidir mejor",
        paragraphs: [
          "Una primera fase bien hecha sirve para reducir ambigüedad, bajar alcance y dejar claro qué problema merece inversión ahora y cuál no.",
          "Si al terminar discovery sigues sin saber por dónde empezar, qué dependencias existen o qué riesgo asumes, la fase no ha cumplido su función.",
        ],
      },
      {
        title: "Qué entregables deberían salir sí o sí",
        paragraphs: [
          "No necesitas documentos decorativos. Necesitas piezas que permitan discutir presupuesto, secuencia y arquitectura con una base común.",
        ],
        bullets: [
          "Mapa del problema, objetivos y restricciones reales",
          "Alcance priorizado con exclusiones explícitas",
          "Arquitectura o enfoque técnico inicial defendible",
          "Riesgos, dependencias y siguiente fase recomendada",
        ],
      },
      {
        title: "La señal buena es que el presupuesto siguiente se vuelve más comparable",
        paragraphs: [
          "Cuando discovery está bien hecho, el siguiente presupuesto ya no depende de supuestos difusos, sino de una conversación mucho más concreta sobre entregables y fases.",
          "Eso protege tanto al equipo que compra como al equipo que ejecuta, porque reduce malentendidos y expectativas imposibles.",
        ],
      },
      {
        title: "Cómo detectar un discovery pobre",
        paragraphs: [
          "Si todo acaba en una lista genérica de ideas, sin priorización, sin mapa de riesgo y sin siguiente paso claro, se ha confundido exploración con definición.",
          "La utilidad real de discovery está en que deja mejores decisiones, no solo mejor documentación.",
        ],
      },
    ],
  },
  {
    slug: "crm-erp-o-software-propio-cuando-integrar-y-cuando-construir",
    title: "CRM, ERP o software propio: cuándo integrar y cuándo construir",
    category: "Integración",
    summary:
      "Cómo decidir si conviene conectar mejor el stack actual o abrir una capa propia para no seguir forzando la operativa.",
    readingTime: "8 min",
    ctaLabel: "Ver automatización",
    ctaLink: "/servicios/automatizacion-procesos",
    publishedAt: "2026-03-09",
    tags: ["crm", "erp", "integraciones", "backoffice"],
    seo: {
      title: "CRM, ERP o software propio: integrar o construir",
      description:
        "Criterios para decidir cuándo conviene integrar CRM y ERP existentes y cuándo tiene sentido construir software propio sobre la operativa.",
      path: "/blog/crm-erp-o-software-propio-cuando-integrar-y-cuando-construir",
      keywords: [
        "crm erp o software propio",
        "integrar crm y erp",
        "cuando construir backoffice propio",
      ],
    },
    sections: [
      {
        title: "El problema rara vez es una sola herramienta",
        paragraphs: [
          "Lo habitual es que CRM, ERP, formularios, email y hojas paralelas funcionen razonablemente por separado pero mal como sistema conjunto.",
          "La decisión correcta no suele ser sustituir todo, sino entender dónde está la fricción principal entre herramientas y equipos.",
        ],
      },
      {
        title: "Cuándo conviene integrar antes que construir",
        paragraphs: [
          "Si la lógica principal ya existe en herramientas sólidas y el mayor dolor está en sincronización, trazabilidad o doble trabajo, integrar suele ser el primer paso más rentable.",
        ],
        bullets: [
          "Datos duplicados entre áreas",
          "Estados inconsistentes entre sistemas",
          "Dependencia excesiva de tareas manuales de coordinación",
          "Falta de visibilidad compartida sobre el flujo",
        ],
      },
      {
        title: "Cuándo una capa propia empieza a tener más sentido",
        paragraphs: [
          "Cuando la operativa real ya no encaja en el modelo de ninguna herramienta y el equipo vive rodeado de workarounds, formularios auxiliares y decisiones fuera del sistema.",
          "Ahí la capa propia no compite con el CRM o el ERP: ordena lo que el negocio necesita y conecta mejor lo que ya existe.",
        ],
      },
      {
        title: "La mejor respuesta muchas veces es híbrida",
        paragraphs: [
          "Integrar bien y construir solo la capa diferencial suele ser más sensato que elegir entre licencia o desarrollo como si fueran vías incompatibles.",
          "La clave es decidir qué parte debe seguir siendo commodity y cuál se ha convertido en una ventaja operativa o comercial demasiado importante para seguir encajándola a la fuerza.",
        ],
      },
    ],
  },
  {
    slug: "automatizacion-documental-finanzas-y-operaciones",
    title: "Automatización documental para finanzas y operaciones: dónde empieza a compensar",
    category: "Operación",
    summary:
      "Facturas, albaranes, justificantes y expedientes: cuándo automatizar documento y dato deja de ser una mejora opcional.",
    readingTime: "7 min",
    ctaLabel: "Automatizar un flujo",
    ctaLink: "/servicios/automatizacion-procesos",
    publishedAt: "2026-03-08",
    tags: ["documentos", "operaciones", "finanzas"],
    seo: {
      title: "Automatización documental para finanzas y operaciones",
      description:
        "Señales para saber cuándo conviene automatizar flujos documentales en equipos financieros y operativos sin añadir más opacidad al proceso.",
      path: "/blog/automatizacion-documental-finanzas-y-operaciones",
      keywords: [
        "automatizacion documental",
        "digitalizacion operaciones",
        "automatizacion finanzas empresa",
      ],
    },
    sections: [
      {
        title: "La primera señal es que el documento se procesa varias veces",
        paragraphs: [
          "Cuando un mismo archivo se descarga, revisa, renombra, reenvía y vuelve a introducirse en varios sistemas, ya no tienes un flujo documental: tienes una fuga operativa.",
          "El coste aparece en retrasos, errores y en la cantidad de tiempo experto que se gasta en tareas que no aportan criterio real.",
        ],
      },
      {
        title: "Automatizar documento no es solo OCR",
        paragraphs: [
          "El valor no está en leer un PDF, sino en validar, clasificar, enrutar y dejar el dato listo para el siguiente movimiento sin perder trazabilidad.",
        ],
        bullets: [
          "Captura y clasificación inicial",
          "Validación contra reglas o datos maestros",
          "Alta o actualización en sistemas internos",
          "Alertas cuando algo no encaja o requiere revisión",
        ],
      },
      {
        title: "Dónde suele haber retorno más rápido",
        paragraphs: [
          "Facturación, validación de documentación, gestión de expedientes, conciliación operativa o preparación de reporting son frentes donde la mejora suele percibirse rápido.",
          "Son procesos repetitivos, medibles y con demasiados pasos manuales cuando crecen el volumen o la complejidad.",
        ],
      },
      {
        title: "La automatización solo compensa si el equipo mantiene control",
        paragraphs: [
          "Si nadie sabe qué regla se ha ejecutado o cómo corregir una excepción, el documento deja de circular mejor y pasa a atascarse en un sitio más opaco.",
          "La capa buena es la que ahorra trabajo y además deja al equipo más capacidad de supervisión, no menos.",
        ],
      },
    ],
  },
  {
    slug: "asistentes-internos-para-onboarding-y-soporte-distribuido",
    title: "Asistentes internos para onboarding y soporte distribuido: cuándo sí aportan valor",
    category: "Asistentes",
    summary:
      "Qué casos de uso internos justifican un asistente conectado a conocimiento y cuándo solo estarías añadiendo otra capa de ruido.",
    readingTime: "7 min",
    ctaLabel: "Explorar IA aplicada",
    ctaLink: "/servicios/inteligencia-artificial-empresas",
    publishedAt: "2026-03-07",
    tags: ["asistentes", "onboarding", "soporte interno"],
    seo: {
      title: "Asistentes internos para onboarding y soporte distribuido",
      description:
        "Casos donde un asistente interno conectado a conocimiento y procesos mejora onboarding y soporte distribuido sin generar dependencia ciega.",
      path: "/blog/asistentes-internos-para-onboarding-y-soporte-distribuido",
      keywords: [
        "asistentes internos empresa",
        "onboarding con ia",
        "soporte interno con asistente",
      ],
    },
    sections: [
      {
        title: "El valor aparece cuando la información está dispersa y el equipo necesita responder rápido",
        paragraphs: [
          "Manual de procesos, políticas, FAQs internas, herramientas y tickets suelen vivir en sitios distintos. Ahí un asistente bien conectado puede reducir tiempo de búsqueda y errores de contexto.",
          "No sustituye criterio ni managers. Reduce fricción en tareas repetitivas de orientación y soporte inicial.",
        ],
      },
      {
        title: "Los mejores casos de uso son acotados",
        paragraphs: [
          "Onboarding, soporte interno de primer nivel, búsqueda de procedimientos o preparación de contexto para personas expertas son escenarios más sanos que intentar crear un oráculo corporativo.",
        ],
        bullets: [
          "Procedimientos repetitivos de alta frecuencia",
          "Preguntas internas con respuesta verificable",
          "Rutas claras de escalado humano",
          "Conocimiento curado y versionado",
        ],
      },
      {
        title: "Lo que rompe el proyecto suele ser la gobernanza",
        paragraphs: [
          "Sin fuentes claras, responsables, límites y criterios de revisión, el asistente puede ganar visibilidad muy rápido y perder confianza todavía más rápido.",
          "La adopción interna depende tanto de esa gobernanza como del modelo o la interfaz.",
        ],
      },
      {
        title: "La pregunta correcta no es si parece inteligente",
        paragraphs: [
          "La pregunta correcta es si ahorra tiempo real, reduce dependencia de personas concretas y deja mejor contexto para la siguiente acción.",
          "Si no ocurre eso, probablemente todavía no necesitas un asistente. Necesitas ordenar antes conocimiento y procesos.",
        ],
      },
    ],
  },
  {
    slug: "roadmap-producto-b2b-que-entra-en-el-primer-build",
    title: "Roadmap de producto B2B: qué debería entrar en el primer build y qué no",
    category: "Producto",
    summary:
      "Cómo decidir el alcance de una primera entrega sin convertir el roadmap en una lista infinita de ideas razonables.",
    readingTime: "8 min",
    ctaLabel: "Explorar plataformas SaaS",
    ctaLink: "/servicios/plataformas-saas",
    publishedAt: "2026-03-06",
    tags: ["producto", "roadmap", "mvp"],
    seo: {
      title: "Roadmap de producto B2B: qué entra en el primer build",
      description:
        "Criterios para definir el primer build de un producto B2B sin inflar el alcance ni hipotecar la evolución del roadmap.",
      path: "/blog/roadmap-producto-b2b-que-entra-en-el-primer-build",
      keywords: [
        "roadmap producto b2b",
        "primer build saas",
        "alcance mvp b2b",
      ],
    },
    sections: [
      {
        title: "El primer build no debe intentar demostrar que el producto ya es maduro",
        paragraphs: [
          "La primera entrega tiene que validar el flujo principal y dejar una base técnica defendible. No demostrar que puedes imaginar veinte módulos futuros.",
          "Muchos roadmaps se deforman porque intentan resolver de una vez soporte, reporting, billing, permisos complejos y automatización avanzada sin haber validado aún el núcleo del producto.",
        ],
      },
      {
        title: "Qué sí debería entrar",
        paragraphs: [
          "Debe entrar todo lo imprescindible para que el usuario correcto reciba valor, el equipo aprenda de uso real y el negocio pueda medir si la siguiente fase merece inversión.",
        ],
        bullets: [
          "Flujo principal de alta, configuración y uso",
          "Panel mínimo de administración o soporte",
          "Eventos o métricas para aprender del comportamiento",
          "Base técnica lista para crecer sin rehacer la capa crítica",
        ],
      },
      {
        title: "Qué conviene dejar fuera aunque suene importante",
        paragraphs: [
          "Automatizaciones secundarias, permisos demasiado finos, configuradores enormes o integraciones poco usadas suelen entrar demasiado pronto por ansiedad comercial o comparativa.",
          "Posponerlos no es recortar valor. Es proteger la velocidad de aprendizaje y la salud del roadmap.",
        ],
      },
      {
        title: "El roadmap útil es el que te deja decidir la siguiente fase con evidencia",
        paragraphs: [
          "Si la primera entrega no deja datos, feedback y criterio suficiente para priorizar la fase dos, el roadmap sigue siendo una opinión ordenada pero no una herramienta de decisión.",
          "La prioridad correcta siempre sale mejor cuando producto, negocio y base técnica se piensan a la vez.",
        ],
      },
    ],
  },
  {
    slug: "cuadros-de-mando-operativos-cuando-excel-ya-no-da",
    title: "Cuadros de mando operativos: cuándo Excel ya no da para más",
    category: "Reporting",
    summary:
      "Qué señales indican que un reporting artesanal ya está frenando decisión, seguimiento y coordinación entre equipos.",
    readingTime: "6 min",
    ctaLabel: "Mejorar reporting",
    ctaLink: "/servicios/automatizacion-procesos",
    publishedAt: "2026-03-05",
    tags: ["reporting", "operaciones", "dashboard"],
    seo: {
      title: "Cuadros de mando operativos: cuándo Excel ya no da",
      description:
        "Señales para detectar cuándo un reporting manual basado en Excel ya no ofrece la trazabilidad y velocidad que necesita la operación.",
      path: "/blog/cuadros-de-mando-operativos-cuando-excel-ya-no-da",
      keywords: [
        "cuadros de mando operativos",
        "dashboard operaciones empresa",
        "reporting manual excel",
      ],
    },
    sections: [
      {
        title: "La primera alarma es que el dato llega tarde",
        paragraphs: [
          "Si el cuadro se actualiza cuando el problema ya explotó o depende de que alguien encuentre tiempo para consolidar datos, no estás midiendo la operación: la estás reconstruyendo a posteriori.",
          "Eso reduce velocidad de decisión y hace que las reuniones giren alrededor de discutir cifras en lugar de actuar sobre ellas.",
        ],
      },
      {
        title: "El síntoma no es Excel, sino la forma de alimentar el reporting",
        paragraphs: [
          "Excel puede seguir siendo útil en determinados contextos. El problema aparece cuando se convierte en la única capa que conecta sistemas que nunca se pensaron para operar juntos.",
        ],
        bullets: [
          "Múltiples versiones del mismo informe",
          "Consolidación manual recurrente",
          "KPIs sin una fuente de verdad clara",
          "Dependencia de una persona para interpretar el panel",
        ],
      },
      {
        title: "Qué deberías pedir a un cuadro de mando operativo serio",
        paragraphs: [
          "Actualización razonablemente automática, métricas trazables, alertas útiles y una lectura orientada a acción, no solo a decoración ejecutiva.",
          "El objetivo es que el panel ayude a decidir mejor y antes, no que impresione en una captura bonita.",
        ],
      },
      {
        title: "El salto correcto suele combinar integración y criterio de negocio",
        paragraphs: [
          "No basta con montar gráficas. Primero hay que decidir qué métricas importan, cómo se calculan y qué movimiento deberían activar cuando cambian.",
          "Sin esa definición, cualquier dashboard nuevo hereda el mismo ruido que ya existía en el Excel de partida.",
        ],
      },
    ],
  },
];

export const editorialBacklog: BacklogEntry[] = [
  {
    title: "Gobierno de prompts y fuentes cuando un asistente ya entra en operativa",
    intent: "Gobierno",
  },
  {
    title: "Cómo decidir el primer módulo de una reescritura legacy sin parar el negocio",
    intent: "Arquitectura",
  },
  {
    title: "Adopción interna: por qué un sistema bueno fracasa sin handoff ni métricas",
    intent: "Adopción",
  },
  {
    title: "Reporting operativo en crecimiento: qué indicadores deberían salir del Excel semanal",
    intent: "Escalado operativo",
  },
];

export const generalFaqs: FaqEntry[] = [
  {
    question: "¿Qué tipo de proyectos encajan mejor con TecnoRia?",
    answer:
      "Encajan mejor proyectos donde la tecnología tiene una función clara: ordenar operativa, mejorar servicio, lanzar un producto serio o aplicar IA con criterio real.",
  },
  {
    question: "¿Trabajáis con pymes o solo con compañías grandes?",
    answer:
      "Trabajamos con empresas de varios tamaños. Muchas veces el mayor impacto aparece precisamente en pymes con procesos tensados, herramientas dispersas o necesidades de automatización ya urgentes.",
  },
  {
    question: "¿También trabajáis con startups y fundadores?",
    answer:
      "Sí. Especialmente cuando hay una necesidad clara de producto, roadmap y ejecución técnica seria para no hipotecar la evolución futura.",
  },
  {
    question: "¿Hacéis solo desarrollo o también definición y estrategia?",
    answer:
      "Cubrimos discovery, blueprint, desarrollo y evolución. En muchos proyectos la primera fase importante es precisamente ordenar bien el problema antes de construir.",
  },
  {
    question: "¿Podéis mejorar software existente sin rehacerlo entero?",
    answer:
      "Sí. Auditamos el punto de partida y decidimos si conviene integrar, modularizar, sustituir piezas concretas o construir una nueva capa.",
  },
  {
    question: "¿Cómo planteáis chatbots e IA para que no se conviertan en ruido?",
    answer:
      "Siempre partimos de un caso de uso real, una fuente de conocimiento definida, límites claros y supervisión. Si no hay condiciones para eso, preferimos no forzar la solución.",
  },
  {
    question: "¿Cuánto tarda normalmente un proyecto?",
    answer:
      "Depende del alcance. Un discovery puede resolverse en pocas semanas; un MVP, una plataforma o una capa operativa suelen plantearse por fases para acelerar el primer valor.",
  },
  {
    question: "¿Ofrecéis mantenimiento y evolución después del lanzamiento?",
    answer:
      "Sí. La mayoría de soluciones digitales necesitan ajuste, nuevas integraciones, refinado funcional y evolución continua para seguir aportando valor.",
  },
  {
    question: "¿Qué necesitáis para empezar?",
    answer:
      "Necesitamos contexto de negocio, procesos actuales, restricciones, sistemas implicados, urgencia y cualquier referencia que ayude a priorizar bien el problema.",
  },
];

export const footerLinks: NavEntry[] = [
  { label: "Inicio", path: "/" },
  { label: "Servicios", path: "/servicios" },
  { label: "Soluciones", path: "/soluciones" },
  { label: "Casos de éxito", path: "/casos-de-exito" },
  { label: "Recursos", path: "/blog" },
  { label: "FAQ", path: "/faq" },
  { label: "Contacto", path: "/contacto" },
];

export const sitemapGroups: SitemapGroup[] = [
  {
    title: "Páginas principales",
    links: [
      { label: "Home", path: "/" },
      { label: "Servicios", path: "/servicios" },
      { label: "Soluciones", path: "/soluciones" },
      { label: "Casos de éxito", path: "/casos-de-exito" },
      { label: "Método", path: "/metodologia" },
      { label: "Empresa", path: "/empresa" },
      { label: "Recursos", path: "/blog" },
      { label: "FAQ", path: "/faq" },
      { label: "Contacto", path: "/contacto" },
    ],
  },
  {
    title: "Landings de servicio",
    links: services.map((service) => ({
      label: service.name,
      path: service.seo.path,
    })),
  },
  {
    title: "Contenido evergreen",
    links: articles.map((article) => ({
      label: article.title,
      path: article.seo.path,
    })),
  },
];

export interface TestimonialEntry {
  quote: string;
  author: string;
  role: string;
  company: string;
}

export const testimonials: TestimonialEntry[] = [
  {
    quote: "Empezamos con un diagnóstico ejecutivo para ordenar un proceso que llevaba años funcionando con parches. El resultado fue una hoja de ruta clara que cambió cómo abordamos la tecnología en la empresa.",
    author: "Director de Operaciones",
    role: "Director de Operaciones",
    company: "Empresa de servicios B2B",
  },
  {
    quote: "Necesitábamos salir al mercado con un SaaS sin comprometer la arquitectura. TecnoRia definió el MVP correcto y dejó la base lista para seguir iterando. No rehacemos nada.",
    author: "Fundador",
    role: "CEO & Fundador",
    company: "Startup SaaS",
  },
  {
    quote: "El chatbot que implantamos redujo en un 60% las consultas repetitivas al equipo. Lo que más valoramos fue que lo plantearon conectado a nuestros sistemas desde el primer día.",
    author: "Responsable de Soporte",
    role: "Head of Customer Success",
    company: "Empresa de distribución",
  },
];

export function getServiceByKey(key: string): ServiceEntry | undefined {
  return services.find((service) => service.key === key);
}

export function getArticleBySlug(slug: string): ArticleEntry | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getArticleVisualBySlug(slug: string): BrandImage {
  const visualKey = articleVisualMap[slug];
  return visualKey ? brandImages[visualKey] : brandImages.systems;
}

export function getArticlesBySlugs(slugs: string[]): ArticleEntry[] {
  return slugs
    .map((slug) => getArticleBySlug(slug))
    .filter((article): article is ArticleEntry => Boolean(article));
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCTOS PROPIOS — TALKARIS & AUCTORIO
   ═══════════════════════════════════════════════════════════════ */

export interface ProductFeature {
  icon: string; // SVG inline path data
  title: string;
  description: string;
}

export interface ProductUseCase {
  title: string;
  description: string;
  badge: string;
}

export interface OwnProduct {
  key: string;
  slug: string;
  name: string;
  tagline: string;
  heroHeadline: string;
  heroCopy: string;
  badge: string;
  image: BrandImage;
  features: ProductFeature[];
  useCases: ProductUseCase[];
  techStack: string[];
  stats: Array<{ value: string; label: string }>;
  ctaLabel: string;
  ctaPath: string;
  seo: SeoEntry;
}

export const ownProducts: OwnProduct[] = [
  {
    key: "talkaris",
    slug: "talkaris",
    name: "Talkaris",
    tagline: "Plataforma conversacional de chatbots enterprise",
    heroHeadline: "Atención automatizada que parece humana.",
    heroCopy:
      "Talkaris permite a empresas desplegar asistentes conversacionales conectados a su conocimiento, procesos y sistemas internos — sin código, con control total. Desde soporte 24/7 hasta cualificación comercial automatizada.",
    badge: "Producto propio",
    image: brandImages.talkaris,
    features: [
      {
        icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-3 3v-3z",
        title: "Multi-canal nativo",
        description:
          "Web widget, WhatsApp Business, Slack y Telegram. Un único bot, varios canales, coherencia total.",
      },
      {
        icon: "M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4",
        title: "Multi-tenant SaaS",
        description:
          "Arquitectura multi-inquilino con aislamiento completo de datos, dominios y configuración por cliente.",
      },
      {
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z",
        title: "Ingestión automática de conocimiento",
        description:
          "Importa PDFs, URLs, Notion, Confluence o texto plano. El bot aprende y se actualiza sin intervención manual.",
      },
      {
        icon: "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10m6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v14",
        title: "Analíticas de conversación",
        description:
          "Dashboard en tiempo real: tasa de resolución, intenciones detectadas, escalaciones y satisfacción.",
      },
      {
        icon: "M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 1 0-5.656-5.656l-1.1 1.1",
        title: "Integraciones CRM y ERP",
        description:
          "Conectores nativos para HubSpot, Salesforce, Pipedrive y cualquier API REST vía configuración.",
      },
      {
        icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
        title: "Configuración sin código",
        description:
          "Panel de administración visual para flujos, respuestas, escalaciones y personalización de tono sin tocar código.",
      },
    ],
    useCases: [
      {
        title: "Soporte al cliente 24/7",
        description:
          "Resuelve consultas frecuentes, gestiona incidencias y escala a agente humano solo cuando es necesario. Reduce el volumen de tickets hasta un 60%.",
        badge: "Soporte",
      },
      {
        title: "Cualificación comercial automatizada",
        description:
          "Captura leads, filtra intención de compra y agenda reuniones con el equipo comercial de forma autónoma en cualquier canal.",
        badge: "Ventas",
      },
      {
        title: "Asistente interno de empresa",
        description:
          "Accede a políticas, procedimientos, documentación y FAQs internas. Reduce el tiempo invertido en búsquedas internas por los equipos.",
        badge: "Operaciones",
      },
    ],
    techStack: [
      "RAG pipeline",
      "Cloudflare Workers",
      "Angular web widget",
      "WebSocket",
      "PostgreSQL",
      "Multi-tenant",
    ],
    stats: [
      { value: "99.9%", label: "Uptime" },
      { value: "<200ms", label: "Latencia media" },
      { value: "60%", label: "Reducción de tickets" },
      { value: "24/7", label: "Disponibilidad" },
    ],
    ctaLabel: "Solicitar demo de Talkaris",
    ctaPath: "/contacto?producto=talkaris",
    seo: {
      title: "Talkaris — Plataforma de chatbots y asistentes conversacionales para empresas",
      description:
        "Talkaris es la plataforma SaaS de TecnoRia para desplegar chatbots enterprise multi-canal. Soporte 24/7, cualificación comercial y asistentes internos conectados a tu conocimiento y sistemas.",
      path: "/productos/talkaris",
      keywords: [
        "plataforma chatbots empresas",
        "chatbot enterprise multi-canal",
        "asistente conversacional IA",
        "chatbot saas whatsapp slack",
        "automatización atención cliente ia",
      ],
    },
  },
  {
    key: "auctorio",
    slug: "auctorio",
    name: "Auctorio",
    tagline: "Plataforma editorial con IA para equipos de contenido",
    heroHeadline: "Del brief al artículo publicado, con IA.",
    heroCopy:
      "Auctorio es el sistema que convierte un brief en contenido revisado, con imagen generada y publicado en múltiples sitios simultáneamente. Sin cuellos de botella editoriales, sin pérdida de control de marca.",
    badge: "Producto propio",
    image: brandImages.auctorio,
    features: [
      {
        icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 1 1 3.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
        title: "Generación de contenido con IA",
        description:
          "Integración con DeepSeek para redacción de artículos, posts y resúmenes a partir de briefs estructurados con control de tono de marca.",
      },
      {
        icon: "M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
        title: "Imágenes generadas por IA",
        description:
          "Generación automática de imágenes con FLUX.2-pro sincronizada con el contenido. Sin royalties, sin banco de imágenes.",
      },
      {
        icon: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
        title: "QA automático de contenido",
        description:
          "Validación automática de legibilidad, SEO on-page, coherencia de tono y cumplimiento de reglas editoriales antes de publicar.",
      },
      {
        icon: "M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9",
        title: "Publicación multisitio",
        description:
          "Publica simultáneamente en múltiples sitios web con adaptación de formato. Conectores para WordPress, API REST y sistemas propios.",
      },
      {
        icon: "M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
        title: "Roles y flujos de aprobación",
        description:
          "Sistema de roles (redactor, editor, publisher) con flujo de aprobación configurable. Control editorial sin fricción en equipo.",
      },
      {
        icon: "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10m6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v14",
        title: "Analíticas editoriales",
        description:
          "Métricas de producción: artículos generados, tiempos de ciclo, tasas de aprobación y rendimiento por sitio y autor.",
      },
    ],
    useCases: [
      {
        title: "Agencias de contenido y marketing",
        description:
          "Multiplica la producción sin aumentar el equipo. Gestiona múltiples clientes y sitios desde un único panel con control de marca por proyecto.",
        badge: "Agencias",
      },
      {
        title: "Medios de comunicación y editores digitales",
        description:
          "Produce y publica contenido informativo con rapidez y consistencia. El QA automático mantiene el estándar editorial sin revisiones manuales lentas.",
        badge: "Medios",
      },
      {
        title: "Equipos de marketing B2B",
        description:
          "Genera blog posts, newsletters y contenido de redes desde un brief semanal. Mantén la cadencia editorial sin depender de freelancers.",
        badge: "Marketing",
      },
    ],
    techStack: [
      "DeepSeek LLM",
      "FLUX.2-pro",
      "Node.js",
      "PostgreSQL",
      "Multi-tenant",
      "API REST",
    ],
    stats: [
      { value: "10×", label: "Velocidad editorial" },
      { value: "0€", label: "Banco de imágenes" },
      { value: "100%", label: "Control de marca" },
      { value: "N sitios", label: "Publicación simultánea" },
    ],
    ctaLabel: "Ver Auctorio en acción",
    ctaPath: "/contacto?producto=auctorio",
    seo: {
      title: "Auctorio — Plataforma editorial con IA para generar y publicar contenido",
      description:
        "Auctorio convierte briefs en artículos completos con texto generado por IA, imágenes automáticas y publicación multisitio. La plataforma editorial de TecnoRia para equipos que escalan contenido sin perder calidad.",
      path: "/productos/auctorio",
      keywords: [
        "plataforma editorial ia",
        "generación contenido ia empresas",
        "cms ia publicación automatizada",
        "herramienta content marketing ia",
        "generar artículos ia seo",
      ],
    },
  },
];

export function getOwnProductBySlug(slug: string): OwnProduct | undefined {
  return ownProducts.find((p) => p.slug === slug);
}

/** Datos para la sección de productos en home — versión resumida */
export const homeProducts = ownProducts.map((p) => ({
  key: p.key,
  name: p.name,
  tagline: p.tagline,
  badge: p.badge,
  heroCopy: p.heroCopy,
  image: p.image,
  features: p.features.slice(0, 3).map((f) => f.title),
  ctaLabel: p.ctaLabel,
  ctaPath: p.ctaPath,
  slug: p.slug,
}));

export interface FeaturedShowcase {
  slug: string;
  title: string;
  sector: string;
  summary: string;
  impact: string[];
  ctaLabel: string;
  ctaLink: string;
  accentColor: string;
}

export const featuredShowcases: FeaturedShowcase[] = [
  {
    slug: "guia-programacion-tv-desarrollo-cliente",
    title: "Guía de Programación TV",
    sector: "Media · Producto cliente",
    summary: "Plataforma completa de contenido televisivo: EPG en tiempo real, sistema social, editorial integrada con Auctorio y SEO técnico con SSR y sitemaps dinámicos.",
    impact: [
      "EPG sincronizado en tiempo real vía WebSocket",
      "Sistema social: bookmarks, ratings y chat",
      "Pipeline editorial automatizado con Auctorio",
      "SSR + sitemaps dinámicos indexados en Google Search Console",
    ],
    ctaLabel: "Ver caso completo",
    ctaLink: "/casos-de-exito",
    accentColor: "#1d4ed8",
  },
  {
    slug: "auctorio-plataforma-editorial-ia",
    title: "Auctorio — Plataforma editorial IA",
    sector: "Producto propio · SaaS",
    summary: "Cockpit editorial con generación de textos e imágenes por IA, QA automatizado y publicación coordinada en múltiples sitios desde un único panel.",
    impact: [
      "Pipeline editorial end-to-end: brief → publicación",
      "Generación IA (DeepSeek + FLUX) con control de voz de marca",
      "Publicación multisitio con trazabilidad por versión",
      "Roles, permisos y modo dry-run de seguridad",
    ],
    ctaLabel: "Ver Auctorio",
    ctaLink: "/productos/auctorio",
    accentColor: "#be9058",
  },
  {
    slug: "talkaris-plataforma-conversacional",
    title: "Talkaris — Plataforma conversacional",
    sector: "Producto propio · SaaS",
    summary: "Motor de chatbots empresariales multi-canal con RAG pipeline, multi-tenant y widget embebible. Soporta web, WhatsApp y Slack con analíticas de conversación.",
    impact: [
      "Multi-canal: web widget embebible, WhatsApp, Slack",
      "RAG pipeline con ingestión automática de conocimiento",
      "Arquitectura multi-tenant con aislamiento por workspace",
      "Analíticas de conversación y resolución automática",
    ],
    ctaLabel: "Ver Talkaris",
    ctaLink: "/productos/talkaris",
    accentColor: "#1d4ed8",
  },
];
