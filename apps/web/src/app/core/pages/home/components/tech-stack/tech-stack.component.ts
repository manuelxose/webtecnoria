import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

interface Technology {
  name: string;
  logo: string; // Emoji o texto corto para el logo
}

interface TechCategory {
  name: string;
  icon: string; // SVG path
  technologies: Technology[];
}

@Component({
  selector: "app-tech-stack",
  templateUrl: "./tech-stack.component.html",
  styleUrls: ["./tech-stack.component.css"],
  standalone: true,
  imports: [
    CommonModule,],
})
export class TechStackComponent {
  techCategories: TechCategory[] = [
    {
      name: "Backend",
      icon: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01", // Server icon
      technologies: [
        { name: ".NET Core", logo: ".NET" },
        { name: "Java Spring", logo: "☕" },
        { name: "Node.js", logo: "🟢" },
        { name: "Python Django", logo: "🐍" },
        { name: "PHP Laravel", logo: "🔶" },
      ],
    },
    {
      name: "Frontend",
      icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", // Monitor icon
      technologies: [
        { name: "Angular", logo: "🅰️" },
        { name: "React", logo: "⚛️" },
        { name: "Vue.js", logo: "💚" },
        { name: "TypeScript", logo: "TS" },
        { name: "Blazor", logo: "⚡" },
      ],
    },
    {
      name: "Bases de Datos",
      icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4", // Database icon
      technologies: [
        { name: "SQL Server", logo: "🗄️" },
        { name: "PostgreSQL", logo: "🐘" },
        { name: "MySQL", logo: "🐬" },
        { name: "MongoDB", logo: "🍃" },
        { name: "Redis", logo: "📦" },
      ],
    },
    {
      name: "Cloud & DevOps",
      icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z", // Cloud icon
      technologies: [
        { name: "Azure", logo: "☁️" },
        { name: "AWS", logo: "🟠" },
        { name: "Docker", logo: "🐳" },
        { name: "Kubernetes", logo: "⎈" },
        { name: "GitHub Actions", logo: "🔄" },
      ],
    },
    {
      name: "ERP/CRM",
      icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", // Briefcase icon
      technologies: [
        { name: "SAP", logo: "SAP" },
        { name: "Dynamics 365", logo: "D365" },
        { name: "Odoo", logo: "🔷" },
        { name: "Salesforce", logo: "☁️" },
        { name: "ERPNext", logo: "📊" },
      ],
    },
    {
      name: "IoT & Industrial",
      icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", // Terminal icon
      technologies: [
        { name: "SCADA", logo: "⚙️" },
        { name: "PLC Integration", logo: "🏭" },
        { name: "MQTT", logo: "📡" },
        { name: "IoT Hub", logo: "🌐" },
        { name: "OPC UA", logo: "🔗" },
      ],
    },
  ];
}
