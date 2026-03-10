import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";
import {
  BLOG_REPOSITORY,
  BlogRepository,
} from "src/app/domain/repositories/blog.repository";
import { articles, editorialBacklog, PUBLISH_DATE } from "../content/site-content";
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
        <span class="eyebrow">Blog</span>
        <h1>Contenido orientado a decision de compra, no a llenar espacio.</h1>
        <p class="lead">
          El blog responde dudas previas a la contratacion, demuestra criterio y
          empuja al usuario hacia los servicios y el contacto.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="site-container" *ngIf="loadError">
        <div class="alert alert-error">
          {{ loadError }}
        </div>
      </div>

      <div class="site-container card-grid card-grid--three">
        <article class="surface-card article-card" *ngFor="let article of articleList">
          <span class="chip chip-soft">{{ article.category }}</span>
          <h2>{{ article.title }}</h2>
          <p>{{ article.summary }}</p>
          <div class="article-meta">
            {{ article.readingTime }} | {{ formatDate(article.publishedAt) }}
          </div>
          <a class="text-link" [routerLink]="article.path">Leer articulo</a>
        </article>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container card-grid card-grid--two">
        <article class="surface-card">
          <h2>Objetivo SEO</h2>
          <p>
            Captar demanda de consideracion comercial con articulos que conecten
            directamente con software a medida, automatizacion, chatbots,
            plataformas e IA.
          </p>
        </article>
        <article class="surface-card">
          <h2>Objetivo CRO</h2>
          <p>
            Cada contenido incorpora un siguiente paso claro: explorar un
            servicio, pedir diagnostico o comparar alternativas con criterio.
          </p>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container section-head">
        <span class="eyebrow">Siguiente cluster editorial</span>
        <h2>Backlog inicial definido para reforzar el pilar de chatbots sin abrir aun nuevas URLs.</h2>
      </div>
      <div class="site-container card-grid card-grid--three">
        <article class="surface-card" *ngFor="let item of backlog">
          <span class="chip chip-soft">{{ item.intent }}</span>
          <h3>{{ item.title }}</h3>
          <p>Contenido preparado para una siguiente iteracion editorial y semantica.</p>
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

  async ngOnInit(): Promise<void> {
    this.seo.update({
      title: "Blog sobre software a medida, automatizacion e IA aplicada",
      description:
        "Blog de intencion comercial con articulos sobre software a medida, automatizacion, chatbots, plataformas SaaS y decision tecnologica para empresas.",
      path: "/blog",
      keywords: [
        "blog software a medida",
        "automatizacion para empresas",
        "chatbots para empresas",
        "crear saas",
      ],
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
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
      this.loadError = "No se pudo cargar el contenido dinamico del blog. Mostramos el contenido editorial principal.";
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
