import { Component } from "@angular/core";

interface ProcessPhase {
  title: string;
  description: string;
  icon: string; // SVG path
  tasks: string[];
  duration: string;
}

@Component({
  selector: "app-development-process",
  templateUrl: "./development-process.component.html",
  styleUrls: ["./development-process.component.css"],
})
export class DevelopmentProcessComponent {
  phases: ProcessPhase[] = [
    {
      title: "Análisis y Consultoría",
      description:
        "Comprendemos tus necesidades empresariales y objetivos estratégicos",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01", // Clipboard icon
      tasks: [
        "Reunión inicial para entender tus procesos de negocio",
        "Análisis de sistemas actuales y puntos de dolor",
        "Definición de requisitos funcionales y técnicos",
        "Propuesta técnica y presupuesto detallado",
      ],
      duration: "1-2 semanas",
    },
    {
      title: "Diseño y Arquitectura",
      description:
        "Planificamos la arquitectura técnica y diseñamos la experiencia de usuario",
      icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z", // Layout icon
      tasks: [
        "Arquitectura de software escalable y modular",
        "Diseño de base de datos optimizada",
        "Wireframes y mockups de interfaz de usuario",
        "Definición de APIs e integraciones necesarias",
      ],
      duration: "2-3 semanas",
    },
    {
      title: "Desarrollo Ágil",
      description:
        "Implementamos el software en sprints iterativos con entregas parciales",
      icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", // Code icon
      tasks: [
        "Desarrollo en sprints de 2 semanas",
        "Demos periódicas del progreso",
        "Testing continuo (unitario, integración)",
        "Ajustes y refinamientos según feedback",
      ],
      duration: "6-16 semanas",
    },
    {
      title: "Testing y QA",
      description:
        "Garantizamos la calidad mediante pruebas exhaustivas en todos los niveles",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", // CheckCircle icon
      tasks: [
        "Pruebas funcionales completas",
        "Pruebas de rendimiento y carga",
        "Testing de seguridad y vulnerabilidades",
        "UAT (User Acceptance Testing) con tu equipo",
      ],
      duration: "2-3 semanas",
    },
    {
      title: "Despliegue y Go-Live",
      description:
        "Lanzamos el software a producción con un plan estructurado y sin interrupciones",
      icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", // Sparkles icon
      tasks: [
        "Migración de datos desde sistemas legacy",
        "Configuración de entorno de producción",
        "Plan de rollout gradual o Big Bang",
        "Formación a usuarios finales",
      ],
      duration: "1-2 semanas",
    },
    {
      title: "Soporte y Evolución",
      description:
        "Acompañamiento post-lanzamiento y mejoras continuas",
      icon: "M13 10V3L4 14h7v7l9-11h-7z", // Lightning icon
      tasks: [
        "Soporte técnico durante estabilización",
        "Monitorización de rendimiento y errores",
        "Corrección de bugs detectados",
        "Planificación de nuevas funcionalidades",
      ],
      duration: "Continuo",
    },
  ];
}
