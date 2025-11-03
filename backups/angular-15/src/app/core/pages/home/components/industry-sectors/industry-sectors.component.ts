import { Component } from "@angular/core";

interface Industry {
  name: string;
  icon: string;
  description: string;
  examples: string[];
}

@Component({
  selector: "app-industry-sectors",
  templateUrl: "./industry-sectors.component.html",
  styleUrls: ["./industry-sectors.component.css"],
})
export class IndustrySectorsComponent {
  industries: Industry[] = [
    {
      name: "Industria y Manufactura",
      icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
      description: "Control de producción, trazabilidad, gestión de calidad",
      examples: ["Metalúrgica", "Alimentaria", "Farmacéutica", "Automoción"],
    },
    {
      name: "Logística y Distribución",
      icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
      description: "Gestión de almacenes, rutas, transporte y distribución",
      examples: [
        "Operadores logísticos",
        "Distribuidoras",
        "Transporte",
        "Almacenes",
      ],
    },
    {
      name: "Construcción e Ingeniería",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      description: "Gestión de obras, control de costes, planificación",
      examples: [
        "Constructoras",
        "Ingenierías",
        "Arquitectura",
        "Instalaciones",
      ],
    },
    {
      name: "Servicios B2B",
      icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      description: "Gestión de clientes B2B, facturación, proyectos",
      examples: [
        "Consultoras",
        "Agencias",
        "Servicios profesionales",
        "Outsourcing",
      ],
    },
    {
      name: "Comercio Mayorista",
      icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
      description: "Gestión de catálogos, pedidos B2B, stock multicentrales",
      examples: [
        "Mayoristas",
        "Distribuidores",
        "Cash & Carry",
        "Importadores",
      ],
    },
    {
      name: "Sector Agroalimentario",
      icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
      description: "Trazabilidad, control APPCC, certificaciones",
      examples: ["Alimentación", "Bodegas", "Conserveras", "Ganaderías"],
    },
  ];
}
