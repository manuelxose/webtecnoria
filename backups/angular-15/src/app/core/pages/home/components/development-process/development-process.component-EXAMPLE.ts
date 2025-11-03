import { Component } from "@angular/core";

interface ProcessStep {
  number: string;
  title: string;
  description: string;
  duration: string;
  deliverables: string[];
}

@Component({
  selector: "app-development-process",
  templateUrl: "./development-process.component.html",
  styleUrls: ["./development-process.component.css"],
})
export class DevelopmentProcessComponent {
  steps: ProcessStep[] = [
    {
      number: "01",
      title: "Análisis y Consultoría",
      description:
        "Analizamos tu empresa, procesos actuales y necesidades. Identificamos puntos de mejora y definimos objetivos.",
      duration: "1-2 semanas",
      deliverables: [
        "Documento de requisitos",
        "Análisis de viabilidad",
        "Presupuesto detallado",
        "Roadmap del proyecto",
      ],
    },
    {
      number: "02",
      title: "Diseño de Arquitectura",
      description:
        "Diseñamos la arquitectura técnica, flujos de trabajo, base de datos y wireframes de interfaces.",
      duration: "2-3 semanas",
      deliverables: [
        "Diagramas de arquitectura",
        "Modelo de base de datos",
        "Wireframes y mockups",
        "Especificaciones técnicas",
      ],
    },
    {
      number: "03",
      title: "Desarrollo Iterativo",
      description:
        "Desarrollamos el software en sprints ágiles. Te mostramos avances cada 2 semanas para validar.",
      duration: "8-16 semanas",
      deliverables: [
        "Entregas incrementales",
        "Demos funcionales",
        "Código versionado (Git)",
        "Documentación técnica",
      ],
    },
    {
      number: "04",
      title: "Testing y QA",
      description:
        "Pruebas exhaustivas: funcionales, integración, rendimiento, seguridad y aceptación de usuario.",
      duration: "2-3 semanas",
      deliverables: [
        "Plan de pruebas",
        "Corrección de bugs",
        "Informe de testing",
        "Certificado de calidad",
      ],
    },
    {
      number: "05",
      title: "Despliegue y Formación",
      description:
        "Desplegamos el software en producción y formamos a tu equipo para que sean autónomos.",
      duration: "1-2 semanas",
      deliverables: [
        "Puesta en producción",
        "Sesiones de formación",
        "Manuales de usuario",
        "Soporte post-lanzamiento",
      ],
    },
    {
      number: "06",
      title: "Mantenimiento Continuo",
      description:
        "Soporte técnico, corrección de errores, actualizaciones de seguridad y mejoras evolutivas.",
      duration: "Ongoing",
      deliverables: [
        "Actualizaciones mensuales",
        "Soporte técnico",
        "Backups automáticos",
        "Monitorización 24/7",
      ],
    },
  ];
}
