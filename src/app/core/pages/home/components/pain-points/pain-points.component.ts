import { Component, OnInit, OnDestroy } from "@angular/core";

interface PainPoint {
  icon: string;
  title: string;
  problem: string;
  solution: string;
}

@Component({
  selector: "app-pain-points",
  templateUrl: "./pain-points.component.html",
  styleUrls: ["./pain-points.component.css"],
})
export class PainPointsComponent implements OnInit, OnDestroy {
  private observer: IntersectionObserver | null = null;

  painPoints: PainPoint[] = [
    {
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      title: "Procesos manuales ineficientes",
      problem:
        "¿Aún gestionas pedidos, producción o almacén con Excel y papeles?",
      solution:
        "Automatizamos tus procesos con software a medida que reduce errores y ahorra tiempo",
    },
    {
      icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      title: "Sistemas sin integrar",
      problem: "¿Tienes varios programas que no se comunican entre sí?",
      solution:
        "Integramos tus sistemas existentes para que trabajen como uno solo",
    },
    {
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      title: "Falta de control en tiempo real",
      problem:
        "¿No sabes qué está pasando en tu empresa hasta el final del día?",
      solution:
        "Dashboards personalizados con datos en vivo para tomar decisiones informadas",
    },
    {
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
      title: "Software genérico que no se adapta",
      problem:
        "¿Tu ERP/CRM te obliga a cambiar tus procesos en lugar de adaptarse a tu negocio?",
      solution:
        "Desarrollo software personalizado que se ajusta 100% a cómo trabajas",
    },
  ];

  ngOnInit(): void {
    this.initScrollAnimation();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private initScrollAnimation(): void {
    // Intersection Observer nativo para animación al scroll
    const options: IntersectionObserverInit = {
      threshold: 0.15,
      rootMargin: "0px 0px -80px 0px",
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, options);

    // Observar después de que el template se renderice
    setTimeout(() => {
      const cards = document.querySelectorAll(".pain-point-card");
      cards.forEach((card) => this.observer?.observe(card));
    }, 100);
  }
}
