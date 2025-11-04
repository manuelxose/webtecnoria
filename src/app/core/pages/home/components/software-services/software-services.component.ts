import { Component } from "@angular/core";
import { ServiceData } from "../service-card/service-card.component";

@Component({
  selector: "app-software-services",
  templateUrl: "./software-services.component.html",
  styleUrls: ["./software-services.component.css"],
  standalone: true,
})
export class SoftwareServicesComponent {
  services: ServiceData[] = [
    {
      icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
      title: "Desarrollo Software a Medida",
      description:
        "Creamos aplicaciones empresariales personalizadas que se adaptan 100% a tus procesos de negocio.",
      features: [
        "Aplicaciones web y de escritorio",
        "Sistemas de gestión empresarial",
        "Portales B2B y extranets",
        "Automatización de procesos",
      ],
      cta: {
        text: "Ver proyectos realizados",
        link: "/proyectos",
      },
    },
    {
      icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
      title: "Implementación ERP/CRM/WMS",
      description:
        "Configuramos y personalizamos sistemas de gestión empresarial adaptándolos a tu industria.",
      features: [
        "Odoo, SAP, Microsoft Dynamics",
        "Personalización y desarrollo",
        "Integración con sistemas existentes",
        "Migración de datos",
      ],
      cta: {
        text: "Consultar implementación",
        link: "/erp-crm",
      },
    },
    {
      icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      title: "Integración de Sistemas",
      description:
        "Conectamos tus aplicaciones existentes para que trabajen como un ecosistema unificado.",
      features: [
        "APIs RESTful y microservicios",
        "Integración ERP-CRM-eCommerce",
        "Sincronización de datos en tiempo real",
        "Conectores personalizados",
      ],
      cta: {
        text: "Solicitar análisis de integración",
        link: "/integracion-sistemas",
      },
    },
    {
      icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z",
      title: "Automatización de Procesos (RPA)",
      description:
        "Eliminamos tareas repetitivas mediante robots software que trabajan 24/7.",
      features: [
        "Automatización de procesos manuales",
        "Extracción y procesamiento de datos",
        "Integraciones sin API",
        "Reducción de errores humanos",
      ],
      cta: {
        text: "Ver casos de automatización",
        link: "/automatizacion",
      },
    },
    {
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      title: "Business Intelligence y Dashboards",
      description:
        "Visualiza tus datos en tiempo real y toma decisiones basadas en información precisa.",
      features: [
        "Dashboards interactivos personalizados",
        "Informes automatizados",
        "Análisis predictivo",
        "Integración con múltiples fuentes",
      ],
      cta: {
        text: "Ver ejemplos de dashboards",
        link: "/business-intelligence",
      },
    },
    {
      icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
      title: "Software Industrial (IoT/SCADA)",
      description:
        "Soluciones para control de producción, maquinaria y procesos industriales.",
      features: [
        "Control de producción en tiempo real",
        "Integración con PLCs y sensores",
        "Monitorización remota",
        "Mantenimiento predictivo",
      ],
      cta: {
        text: "Consultar soluciones industriales",
        link: "/software-industrial",
      },
    },
  ];
}
