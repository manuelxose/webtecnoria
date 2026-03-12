import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";
import {
  BLOG_REPOSITORY,
  BlogRepository,
} from "src/app/domain/repositories/blog.repository";
import {
  articles,
  brandImages,
  editorialBacklog,
  PUBLISH_DATE,
} from "../content/site-content";
import { SeoService } from "../services/seo.service";

type BlogCardView = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  readingTime: string;
  path: string;
  publishedAt: string;
};

@Component({
  selector: "app-blog-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-hero section">
      <div class="site-container page-hero__inner">
        <span class="eyebrow">Recursos</span>
        <h1>Contenido creado para ayudar a decidir mejor, no para rellenar el blog.</h1>
        <p class="lead">
          Cubrimos coste, arquitectura, automatización, producto, IA aplicada y
          capas conversacionales con una intención clara: educar demanda
          cualificada y facilitar decisiones más informadas.
        </p>
      </div>
    </section>

    <section class="section" *ngIf="featuredArticle">
      <div class="site-container">
        <article class="surface-card featured-article">
          <div class="featured-article__copy">
            <span class="chip chip-soft">{{ featuredArticle.category }}</span>
            <h2>{{ featuredArticle.title }}</h2>
            <p>{{ featuredArticle.summary }}</p>
            <div class="article-meta">
              {{ featuredArticle.readingTime }} | {{ formatDate(featuredArticle.publishedAt) }}
            </div>
            <a class="button button-primary" [routerLink]="featuredArticle.path">
              Leer artículo destacado
            </a>
          </div>
          <div class="featured-article__cluster">
            <span class="panel-label">Clusters trabajados</span>
            <ul class="plain-list">
              <li>Software a medida y arquitectura</li>
              <li>Automatización operativa y sistemas</li>
              <li>Chatbots, asistentes e IA aplicada</li>
            </ul>
          </div>
        </article>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container profile-grid">
        <article class="profile-card">
          <span class="chip chip-soft">Cluster 01</span>
          <h3>Software, arquitectura y decisiones de build</h3>
          <p>
            Contenido para equipos que comparan construir, integrar, modernizar
            o priorizar un roadmap con más criterio.
          </p>
        </article>
        <article class="profile-card">
          <span class="chip chip-soft">Cluster 02</span>
          <h3>Automatización, eficiencia operativa y conectividad</h3>
          <p>
            Piezas orientadas a detectar fricción manual, elegir el primer caso
            de uso y evitar automatizaciones mal planteadas.
          </p>
        </article>
        <article class="profile-card">
          <span class="chip chip-soft">Cluster 03</span>
          <h3>Chatbots, asistentes e IA aplicada</h3>
          <p>
            Artículos pensados para separar hype de uso real y aterrizar capas
            conversacionales o de IA con gobierno serio.
          </p>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container" *ngIf="loadError">
        <div class="alert alert-error" role="status">
          {{ loadError }}
        </div>
      </div>

      <div class="site-container editorial-grid">
        <article class="editorial-card" *ngFor="let article of secondaryArticles">
          <span class="chip chip-soft">{{ article.category }}</span>
          <h3>{{ article.title }}</h3>
          <p>{{ article.summary }}</p>
          <div class="article-meta">
            {{ article.readingTime }} | {{ formatDate(article.publishedAt) }}
          </div>
          <div class="editorial-card__footer">
            <a class="text-link" [routerLink]="article.path">Leer artículo</a>
          </div>
        </article>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container card-grid card-grid--two">
        <article class="surface-card">
          <h2>Objetivo SEO</h2>
          <p>
            Ganar cobertura semántica sobre software a medida, automatización,
            plataformas, IA aplicada y chatbots sin caer en contenido artificial
            ni canibalizar las landings comerciales.
          </p>
        </article>
        <article class="surface-card">
          <h2>Objetivo comercial</h2>
          <p>
            Cada pieza debe acercar al lector a una decisión mejor: explorar un
            servicio, solicitar un diagnóstico o replantear el problema con criterio.
          </p>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container section-head">
        <span class="eyebrow">Siguiente cluster editorial</span>
        <h2>Temas preparados para reforzar topical authority en la siguiente fase.</h2>
      </div>
      <div class="site-container card-grid card-grid--three">
        <article class="surface-card" *ngFor="let item of backlog">
          <span class="chip chip-soft">{{ item.intent }}</span>
          <h3>{{ item.title }}</h3>
          <p>Contenido preparado para seguir ampliando autoridad orgánica sin perder foco comercial.</p>
        </article>
      </div>
    </section>
  `,
})
export class BlogPageComponent implements OnInit {
  articleList: BlogCardView[] = articles.map((article) => ({
    slug: article.slug,
    category: article.category,
    title: article.title,
    summary: article.summary,
    readingTime: article.readingTime,
    path: article.seo.path,
    publishedAt: PUBLISH_DATE,
  }));
  backlog = editorialBacklog;
  loadError = "";

  constructor(
    private readonly seo: SeoService,
    @Inject(BLOG_REPOSITORY) private readonly blogRepository: BlogRepository
  ) {}

  get featuredArticle(): BlogCardView | undefined {
    return this.articleList[0];
  }

  get secondaryArticles(): BlogCardView[] {
    return this.articleList.slice(1);
  }

  async ngOnInit(): Promise<void> {
    this.seo.update({
      title: "Recursos sobre software a medida, automatización e IA aplicada",
      description:
        "Blog de TecnoRia con contenido evergreen sobre software a medida, automatización de procesos, plataformas, chatbots e inteligencia artificial aplicada a negocio.",
      path: "/blog",
      imagePath: brandImages.systems.src,
      keywords: [
        "blog software a medida",
        "automatizacion para empresas",
        "chatbots para empresas",
        "ia aplicada para empresas",
      ],
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Recursos", path: "/blog" },
        ]),
      ],
    });

    try {
      const snapshot = await firstValueFrom(this.blogRepository.list());
      const docs = snapshot?.docs ?? [];
      const apiArticles = docs
        .map((doc: any) => {
          const data = typeof doc.data === "function" ? doc.data() : doc;
          return {
            slug: String(data.slug ?? ""),
            category: Array.isArray(data.tags) && data.tags.length ? data.tags[0] : "Blog",
            title: String(data.title ?? ""),
            summary: String(data.shortDescription ?? ""),
            readingTime: "Lectura breve",
            path: `/blog/${data.slug}`,
            publishedAt: String(data.updatedAt ?? data.createdAt ?? PUBLISH_DATE),
          } satisfies BlogCardView;
        })
        .filter((item) => item.slug && !articles.some((article) => article.slug === item.slug));

      this.articleList = [...apiArticles, ...this.articleList].sort((left, right) =>
        right.publishedAt.localeCompare(left.publishedAt)
      );
    } catch {
      this.loadError =
        "No se pudo cargar el contenido dinamico del blog. Mostramos el contenido editorial principal.";
    }
  }

  formatDate(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "Publicado recientemente";
    }

    return parsed.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
}
