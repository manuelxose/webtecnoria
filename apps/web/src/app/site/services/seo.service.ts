import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import {
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

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: "description", content: config.description });
    this.meta.updateTag({
      name: "robots",
      content: config.noIndex ? "noindex, nofollow" : "index, follow",
    });
    this.meta.updateTag({ name: "author", content: SITE_NAME });
    this.meta.updateTag({ name: "theme-color", content: "#0b1020" });
    this.meta.updateTag({ name: "application-name", content: SITE_NAME });
    this.meta.updateTag({ property: "og:title", content: pageTitle });
    this.meta.updateTag({
      property: "og:description",
      content: config.description,
    });
    this.meta.updateTag({ property: "og:type", content: "website" });
    this.meta.updateTag({ property: "og:url", content: canonicalUrl });
    this.meta.updateTag({ property: "og:site_name", content: SITE_NAME });
    this.meta.updateTag({ property: "og:locale", content: "es_ES" });
    this.meta.updateTag({
      name: "twitter:card",
      content: "summary_large_image",
    });
    this.meta.updateTag({ name: "twitter:title", content: pageTitle });
    this.meta.updateTag({
      name: "twitter:description",
      content: config.description,
    });

    if (keywords) {
      this.meta.updateTag({ name: "keywords", content: keywords });
    }

    this.ensureCanonical(canonicalUrl);

    const schemas = [
      this.createOrganizationSchema(),
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
        name: "Espana",
      },
      provider: {
        "@type": "ProfessionalService",
        name: SITE_NAME,
        url: SITE_URL,
      },
      url: `${SITE_URL}${path === "/" ? "" : path}`,
    };
  }

  createArticleSchema(
    headline: string,
    description: string,
    path: string,
    datePublished: string
  ): Record<string, unknown> {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline,
      description,
      datePublished,
      dateModified: datePublished,
      author: {
        "@type": "Organization",
        name: SITE_NAME,
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
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
