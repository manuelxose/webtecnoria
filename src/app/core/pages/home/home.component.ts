import { Component, OnInit, PLATFORM_ID, Inject } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { isPlatformBrowser } from "@angular/common";

/**
 * ═══════════════════════════════════════════════════════════════════
 * INDEX COMPONENT - TECNORIA B2B SOFTWARE 2025
 * ═══════════════════════════════════════════════════════════════════
 * Componente orquestador principal de la página de inicio
 * Enfoque B2B: Software Empresarial, ERP/CRM, Integración Sistemas
 *
 * RESPONSABILIDADES:
 * - SEO: Meta tags, Schema.org structured data
 * - Orquestación de subcomponentes modulares
 * - Scroll reveal animations (Intersection Observer nativo)
 * - NO contiene lógica de negocio (delegada a subcomponentes)
 * ═══════════════════════════════════════════════════════════════════
 */

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html", // Temporal: cambiar a index.component.html cuando se migre
    styleUrls: ["./home.component.css"],
    standalone: false
})
export class HomeComponent implements OnInit {
  private isBrowser: boolean;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.setSEOTags();
    this.addStructuredData();

    if (this.isBrowser) {
      this.initScrollReveal();
    }
  }

  /**
   * SEO Meta Tags - Optimizados para búsqueda "Software Empresarial Galicia"
   */
  private setSEOTags(): void {
    // Title (60 caracteres óptimos para Google)
    this.titleService.setTitle(
      "Desarrollo Software Empresarial a Medida en Galicia | Implementación ERP/CRM | TecnoRia"
    );

    // Meta Description (155 caracteres óptimos)
    this.metaService.updateTag({
      name: "description",
      content:
        "Desarrollo software empresarial, implementación ERP/CRM e integración sistemas en Galicia. Automatiza procesos, digitaliza tu empresa. +200 proyectos B2B.",
    });

    // Keywords (opcional, pero útil para otros buscadores)
    this.metaService.updateTag({
      name: "keywords",
      content:
        "desarrollo software empresarial, software a medida galicia, implementación ERP, CRM empresarial, integración sistemas, automatización procesos, software industrial, aplicaciones empresariales, desarrollo B2B, digitalización empresas galicia",
    });

    // Canonical URL
    this.metaService.updateTag({
      rel: "canonical",
      href: "https://www.tecnoria.com",
    });

    // Open Graph (Facebook, LinkedIn)
    this.metaService.updateTag({
      property: "og:title",
      content: "TecnoRia - Desarrollo Software Empresarial en Galicia",
    });
    this.metaService.updateTag({
      property: "og:description",
      content:
        "Software empresarial personalizado, implementación ERP/CRM e integración de sistemas. Automatiza procesos y digitaliza tu empresa B2B.",
    });
    this.metaService.updateTag({ property: "og:type", content: "website" });
    this.metaService.updateTag({
      property: "og:url",
      content: "https://www.tecnoria.com",
    });
    this.metaService.updateTag({
      property: "og:image",
      content:
        "https://www.tecnoria.com/assets/images/og-software-empresarial.jpg",
    });
    this.metaService.updateTag({ property: "og:locale", content: "es_ES" });

    // Twitter Cards
    this.metaService.updateTag({
      name: "twitter:card",
      content: "summary_large_image",
    });
    this.metaService.updateTag({
      name: "twitter:title",
      content: "TecnoRia - Desarrollo Software Empresarial B2B",
    });
    this.metaService.updateTag({
      name: "twitter:description",
      content:
        "Automatiza procesos y digitaliza tu empresa con software empresarial a medida en Galicia.",
    });
    this.metaService.updateTag({
      name: "twitter:image",
      content:
        "https://www.tecnoria.com/assets/images/twitter-software-b2b.jpg",
    });

    // Additional SEO tags
    this.metaService.updateTag({ name: "robots", content: "index, follow" });
    this.metaService.updateTag({ name: "author", content: "TecnoRia" });
    this.metaService.updateTag({ name: "geo.region", content: "ES-GA" });
    this.metaService.updateTag({ name: "geo.placename", content: "Galicia" });
    this.metaService.updateTag({ name: "language", content: "Spanish" });
  }

  /**
   * Schema.org Structured Data para SEO avanzado
   */
  private addStructuredData(): void {
    if (!this.isBrowser) return;

    // 1. Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "TecnoRia",
      description:
        "Desarrollo de software empresarial a medida, implementación ERP/CRM e integración de sistemas en Galicia",
      url: "https://www.tecnoria.com",
      logo: "https://www.tecnoria.com/assets/images/logo-tecnoria.png",
      telephone: "+34682047802",
      email: "info@tecnoria.com",
      address: {
        "@type": "PostalAddress",
        addressRegion: "Galicia",
        addressCountry: "ES",
      },
      sameAs: [
        "https://www.linkedin.com/company/tecnoria",
        "https://twitter.com/tecnoria",
        "https://github.com/tecnoria",
      ],
      areaServed: {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: "42.8782",
          longitude: "-8.5448",
        },
        geoRadius: "200000",
      },
      foundingDate: "2010",
      numberOfEmployees: {
        "@type": "QuantitativeValue",
        value: 12,
      },
    };

    // 2. SoftwareApplication Schema (producto principal)
    const softwareSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Software Empresarial Personalizado TecnoRia",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, Windows, Linux, Cloud",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
        description:
          "Presupuesto personalizado según proyecto. Desde 10.000€ para proyectos básicos.",
      },
      provider: {
        "@type": "Organization",
        name: "TecnoRia",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "47",
      },
    };

    // 3. Service Schema (catálogo de servicios)
    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "Desarrollo Software Empresarial",
      provider: {
        "@type": "Organization",
        name: "TecnoRia",
      },
      areaServed: {
        "@type": "Country",
        name: "España",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios de Software Empresarial",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Desarrollo Software a Medida",
              description:
                "Aplicaciones empresariales personalizadas 100% a tus procesos de negocio",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Implementación ERP/CRM/WMS",
              description:
                "Configuración y personalización de sistemas de gestión empresarial",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Integración de Sistemas",
              description:
                "Conectamos tus aplicaciones existentes mediante APIs y conectores personalizados",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Automatización de Procesos (RPA)",
              description:
                "Robots software que eliminan tareas repetitivas y reducen errores",
            },
          },
        ],
      },
    };

    // 4. LocalBusiness Schema
    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://www.tecnoria.com",
      name: "TecnoRia - Desarrollo Software Empresarial",
      image: "https://www.tecnoria.com/assets/images/tecnoria-oficina.jpg",
      url: "https://www.tecnoria.com",
      telephone: "+34682047802",
      priceRange: "€€€",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Vigo",
        addressRegion: "Galicia",
        addressCountry: "ES",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 42.2328,
        longitude: -8.7226,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    };

    // Insertar schemas en el DOM
    this.insertSchema(organizationSchema);
    this.insertSchema(softwareSchema);
    this.insertSchema(serviceSchema);
    this.insertSchema(localBusinessSchema);
  }

  /**
   * Inserta un schema JSON-LD en el DOM
   */
  private insertSchema(schema: any): void {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  /**
   * Intersection Observer para animaciones al scroll (CSS puro, sin librerías)
   */
  private initScrollReveal(): void {
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: "0px 0px -80px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
        }
      });
    }, observerOptions);

    // Observar elementos con clase .scroll-reveal
    setTimeout(() => {
      const elements = document.querySelectorAll(".scroll-reveal");
      elements.forEach((el) => observer.observe(el));
    }, 100);
  }
}
