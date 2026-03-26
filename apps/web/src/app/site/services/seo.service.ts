import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import {
  brandImages,
  brandLogos,
  SITE_EMAIL,
  SITE_NAME,
  SITE_PHONE,
  SITE_REGION,
  SITE_TAGLINE,
  SITE_URL,
} from "../content/site-content";

export interface SeoConfig {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
  imagePath?: string;
  imageAlt?: string;
  type?: "website" | "article";
  schemas?: Record<string, unknown>[];
}

@Injectable({ providedIn: "root" })
export class SeoService {
  private jsonLdNodes: HTMLScriptElement[] = [];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  update(config: SeoConfig): void {
    const pageTitle = `${config.title} | ${SITE_NAME}`;
    const canonicalUrl = `${SITE_URL}${config.path === "/" ? "" : config.path}`;
    const keywords = config.keywords?.join(", ");
    const imagePath = config.imagePath ?? brandImages.social.src;
    const matchedImage = Object.values(brandImages).find(
      (image) => image.src === imagePath
    );
    const imageAlt = config.imageAlt ?? matchedImage?.alt ?? brandImages.social.alt;
    const absoluteImageUrl = imagePath.startsWith("http")
      ? imagePath
      : `${SITE_URL}${imagePath}`;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: "description", content: config.description });
    this.meta.updateTag({
      name: "robots",
      content: config.noIndex ? "noindex, nofollow" : "index, follow",
    });
    this.meta.updateTag({ name: "author", content: SITE_NAME });
    this.meta.updateTag({ name: "theme-color", content: "#102034" });
    this.meta.updateTag({ name: "application-name", content: SITE_NAME });
    this.meta.updateTag({ property: "og:title", content: pageTitle });
    this.meta.updateTag({
      property: "og:description",
      content: config.description,
    });
    this.meta.updateTag({
      property: "og:type",
      content: config.type ?? "website",
    });
    this.meta.updateTag({ property: "og:url", content: canonicalUrl });
    this.meta.updateTag({ property: "og:site_name", content: SITE_NAME });
    this.meta.updateTag({ property: "og:locale", content: "es_ES" });
    this.meta.updateTag({ property: "og:image", content: absoluteImageUrl });
    this.meta.updateTag({
      property: "og:image:alt",
      content: imageAlt,
    });
    this.meta.updateTag({
      name: "twitter:card",
      content: "summary_large_image",
    });
    this.meta.updateTag({ name: "twitter:title", content: pageTitle });
    this.meta.updateTag({
      name: "twitter:description",
      content: config.description,
    });
    this.meta.updateTag({ name: "twitter:image", content: absoluteImageUrl });
    this.meta.updateTag({ name: "twitter:image:alt", content: imageAlt });

    if (keywords) {
      this.meta.updateTag({ name: "keywords", content: keywords });
    }

    this.ensureCanonical(canonicalUrl);

    const schemas = [
      this.createOrganizationSchema(),
      this.createWebsiteSchema(),
      this.createWebPageSchema(pageTitle, config.description, canonicalUrl),
      ...(config.schemas ?? []),
    ];
    this.updateSchemas(schemas);
  }

  createBreadcrumbSchema(
    items: Array<{ name: string; path: string }>
  ): Record<string, unknown> {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
      })),
    };
  }

  createFaqSchema(
    faqs: Array<{ question: string; answer: string }>
  ): Record<string, unknown> {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
  }

  createServiceSchema(
    name: string,
    description: string,
    path: string
  ): Record<string, unknown> {
    return {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: name,
      name,
      description,
      areaServed: {
        "@type": "Country",
        name: "España",
      },
      provider: {
        "@type": "ProfessionalService",
        name: SITE_NAME,
        url: SITE_URL,
      },
      url: `${SITE_URL}${path === "/" ? "" : path}`,
    };
  }

  createLocalBusinessSchema(): Record<string, unknown> {
    return {
      "@context": "https://schema.org",
      "@type": ["ProfessionalService", "LocalBusiness"],
      name: SITE_NAME,
      description: SITE_TAGLINE,
      url: SITE_URL,
      telephone: SITE_PHONE,
      email: SITE_EMAIL,
      logo: `${SITE_URL}${brandLogos.mark.dark.src}`,
      image: `${SITE_URL}${brandImages.social.src}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Galicia",
        addressCountry: "ES",
      },
      areaServed: [
        { "@type": "Country", name: "España" },
        { "@type": "State", name: "Galicia" },
      ],
      knowsAbout: [
        "Software a medida",
        "Automatización de procesos",
        "Inteligencia Artificial aplicada",
        "Chatbots empresariales",
        "Plataformas SaaS",
        "Consultoría tecnológica",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios de ingeniería de software e IA",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Software a medida" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Automatización de procesos" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Inteligencia Artificial aplicada" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Chatbots empresariales" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Plataformas SaaS" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Consultoría tecnológica" } },
        ],
      },
    };
  }

  createProductSchema(data: {
    name: string;
    description: string;
    url: string;
    image?: string;
    category?: string;
  }): Record<string, unknown> {
    const imageUrl = data.image
      ? data.image.startsWith("http") ? data.image : `${SITE_URL}${data.image}`
      : `${SITE_URL}${brandImages.social.src}`;

    return {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: data.name,
      description: data.description,
      url: data.url,
      applicationCategory: data.category ?? "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "es",
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
      author: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
      image: imageUrl,
    };
  }

  createArticleSchema(
    headline: string,
    description: string,
    path: string,
    datePublished: string,
    imagePath = brandImages.social.src
  ): Record<string, unknown> {
    const absoluteImageUrl = imagePath.startsWith("http")
      ? imagePath
      : `${SITE_URL}${imagePath}`;

    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline,
      description,
      datePublished,
      dateModified: datePublished,
      image: absoluteImageUrl,
      author: {
        "@type": "Organization",
        name: SITE_NAME,
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}${brandLogos.mark.dark.src}`,
        },
      },
      mainEntityOfPage: `${SITE_URL}${path === "/" ? "" : path}`,
    };
  }

  private createOrganizationSchema(): Record<string, unknown> {
    return {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: SITE_NAME,
      description: SITE_TAGLINE,
      url: SITE_URL,
      email: SITE_EMAIL,
      telephone: SITE_PHONE,
      areaServed: SITE_REGION,
      image: `${SITE_URL}${brandImages.social.src}`,
      logo: `${SITE_URL}${brandLogos.mark.dark.src}`,
    };
  }

  private createWebsiteSchema(): Record<string, unknown> {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "es",
    };
  }

  private createWebPageSchema(
    title: string,
    description: string,
    canonicalUrl: string
  ): Record<string, unknown> {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url: canonicalUrl,
      inLanguage: "es",
    };
  }

  private ensureCanonical(url: string): void {
    let canonical = this.document.querySelector(
      "link[rel='canonical']"
    ) as HTMLLinkElement | null;

    if (!canonical) {
      canonical = this.document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      this.document.head.appendChild(canonical);
    }

    canonical.setAttribute("href", url);
  }

  private updateSchemas(schemas: Record<string, unknown>[]): void {
    this.jsonLdNodes.forEach((node) => node.remove());
    this.jsonLdNodes = schemas.map((schema) => {
      const node = this.document.createElement("script");
      node.type = "application/ld+json";
      node.text = JSON.stringify(schema);
      this.document.head.appendChild(node);
      return node;
    });
  }
}
