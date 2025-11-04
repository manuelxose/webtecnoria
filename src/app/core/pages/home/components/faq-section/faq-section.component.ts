import { Component } from "@angular/core";

interface FAQ {
  question: string;
  answer: string;
}

@Component({
  selector: "app-faq-section",
  templateUrl: "./faq-section.component.html",
  styleUrls: ["./faq-section.component.css"],
  standalone: true,
  imports: [],
})
export class FaqSectionComponent {
  openIndex: number | null = null;

  faqs: FAQ[] = [
    {
      question: "¿Cuánto cuesta desarrollar software a medida para mi empresa?",
      answer:
        "El coste depende de la complejidad y alcance del proyecto. Un desarrollo básico puede partir de 10.000€, mientras que sistemas empresariales complejos pueden superar los 100.000€. Ofrecemos presupuestos personalizados sin compromiso tras analizar tus necesidades.",
    },
    {
      question:
        "¿Cuánto tiempo lleva implementar un ERP o desarrollar una aplicación empresarial?",
      answer:
        "Los plazos varían según el proyecto: una aplicación sencilla puede estar lista en 1-2 meses, mientras que un ERP completo puede requerir 4-8 meses. Trabajamos con metodología ágil, entregando funcionalidades progresivamente para que empieces a ver resultados cuanto antes.",
    },
    {
      question:
        "¿Podéis integrar vuestro software con nuestros sistemas actuales?",
      answer:
        "Sí, desarrollamos integraciones con prácticamente cualquier sistema: ERPs (SAP, Odoo, Navision...), CRMs (Salesforce, Zoho...), eCommerce (PrestaShop, WooCommerce...), aplicaciones propietarias, bases de datos legacy, etc. mediante APIs, conectores personalizados o ETL.",
    },
    {
      question:
        "¿Ofrecéis soporte y mantenimiento tras la entrega del software?",
      answer:
        "Absolutamente. Ofrecemos contratos de mantenimiento con diferentes niveles de SLA: desde soporte básico (corrección de errores) hasta soporte premium (disponibilidad 24/7, mejoras continuas, consultoría). También formamos a tu equipo para que sean autónomos.",
    },
    {
      question: "¿Trabajáis solo en Galicia o también fuera?",
      answer:
        "Aunque estamos en Galicia y preferimos trabajar con empresas cercanas para facilitar reuniones presenciales, también atendemos proyectos en toda España y Portugal. Combinamos trabajo presencial y remoto según las necesidades del proyecto.",
    },
    {
      question:
        "¿Qué diferencia hay entre personalizar un ERP existente y desarrollar software desde cero?",
      answer:
        "Personalizar un ERP es más rápido y económico si el 70% de tus necesidades están cubiertas. Desarrollar desde cero es mejor cuando necesitas algo muy específico, tienes procesos únicos o el ERP estándar no se adapta. Te asesoramos sobre la mejor opción para tu caso.",
    },
    {
      question:
        "¿Cómo garantizáis la seguridad de nuestros datos empresariales?",
      answer:
        "Aplicamos las mejores prácticas de seguridad: cifrado de datos, autenticación robusta, copias de seguridad automáticas, auditorías de código, cumplimiento RGPD, hosting en servidores seguros (AWS, Azure...). Firmamos acuerdos de confidencialidad (NDA) antes de empezar.",
    },
    {
      question: "¿Puedo escalar el software conforme crece mi empresa?",
      answer:
        "Por supuesto. Diseñamos todas nuestras soluciones pensando en escalabilidad: arquitecturas modulares, bases de datos optimizadas, código mantenible, infraestructura cloud elástica. Podrás añadir usuarios, funcionalidades o integraciones sin problemas.",
    },
  ];

  toggle(index: number): void {
    this.openIndex = this.openIndex === index ? null : index;
  }
}
