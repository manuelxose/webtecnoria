import { CommonModule } from "@angular/common";
import { Component, DestroyRef, Inject, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";
import {
  BLOG_REPOSITORY,
  BlogRepository,
} from "src/app/domain/repositories/blog.repository";
import {
  articles,
  ArticleEntry,
  getArticleBySlug,
  PUBLISH_DATE,
} from "../content/site-content";
import { SeoService } from "../services/seo.service";

type BlogCardView = {
  category: string;
  title: string;
  summary: string;
  path: string;
};

type ApiArticleView = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  publishedAt: string;
};

@Component({
  selector: "app-article-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <ng-container *ngIf="article as current">
      <section class="page-hero section">
        <div class="site-container page-hero__inner">
          <span class="eyebrow">{{ current.category }}</span>
          <h1>{{ current.title }}</h1>
          <p class="lead">{{ current.summary }}</p>
          <div class="article-meta">{{ current.readingTime }} | {{ current.publishedLabel }}</div>
        </div>
      </section>

      <section class="section">
        <div class="site-container article-layout">
          <article class="article-content surface-card">
            <ng-container *ngIf="current.kind === 'static'; else apiArticleBlock">
              <section class="article-section" *ngFor="let section of $any(current).sections">
                <h2>{{ section.title }}</h2>
                <p *ngFor="let paragraph of section.paragraphs">{{ paragraph }}</p>
                <ul class="plain-list" *ngIf="section.bullets?.length">
                  <li *ngFor="let bullet of section.bullets">{{ bullet }}</li>
                </ul>
              </section>
            </ng-container>

            <ng-template #apiArticleBlock>
              <div class="article-richtext" [innerHTML]="$any(current).content"></div>
            </ng-template>
          </article>

          <aside class="article-sidebar surface-card">
            <span class="panel-label">Siguiente paso</span>
            <p>
              Si este tema encaja con tu situacion, lo mas util es aterrizarlo
              en una conversacion concreta de negocio.
            </p>
            <a class="button button-primary" [routerLink]="current.ctaLink">
              {{ current.ctaLabel }}
            </a>
            <a class="button button-secondary" routerLink="/blog">Volver al blog</a>
          </aside>
        </div>
      </section>

      <section class="section section-accent">
        <div class="site-container split-head">
          <div>
            <span class="eyebrow">Relacionados</span>
            <h2>Contenido conectado a intencion comercial.</h2>
          </div>
        </div>
        <div class="site-container card-grid card-grid--three">
          <article class="surface-card article-card" *ngFor="let item of related">
            <span class="chip chip-soft">{{ item.category }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.summary }}</p>
            <a class="text-link" [routerLink]="item.path">Leer articulo</a>
          </article>
        </div>
      </section>
    </ng-container>

    <section class="section" *ngIf="notFound">
      <div class="site-container surface-card">
        <span class="eyebrow">Contenido no encontrado</span>
        <h1>Este articulo no existe o ya no esta disponible.</h1>
        <p class="lead">
          Puedes volver al blog o revisar nuestros servicios principales para
          seguir explorando.
        </p>
        <div class="spotlight-actions">
          <a class="button button-primary" routerLink="/blog">Volver al blog</a>
          <a class="button button-secondary" routerLink="/servicios">Ver servicios</a>
        </div>
      </div>
    </section>
  `,
})
export class ArticlePageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  article?:
    | (ArticleEntry & {
        kind: "static";
        publishedLabel: string;
        ctaLabel: string;
        ctaLink: string;
        readingTime: string;
      })
    | (ApiArticleView & {
        kind: "api";
        publishedLabel: string;
        ctaLabel: string;
        ctaLink: string;
        readingTime: string;
      });
  related: BlogCardView[] = [];
  notFound = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly seo: SeoService,
    @Inject(BLOG_REPOSITORY) private readonly blogRepository: BlogRepository
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      void this.loadArticle(params.get("slug") ?? "");
    });
  }

  private async loadArticle(slug: string): Promise<void> {
    this.article = undefined;
    this.notFound = false;

    const staticArticle = getArticleBySlug(slug);
    if (staticArticle) {
      this.article = {
        ...staticArticle,
        kind: "static",
        publishedLabel: "Publicado el 6 de marzo de 2026",
      };
      this.related = articles
        .filter((item) => item.slug !== slug)
        .slice(0, 3)
        .map((item) => ({
          category: item.category,
          title: item.title,
          summary: item.summary,
          path: item.seo.path,
        }));

      this.seo.update({
        title: staticArticle.seo.title,
        description: staticArticle.seo.description,
        path: staticArticle.seo.path,
        keywords: staticArticle.seo.keywords,
        schemas: [
          this.seo.createBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: staticArticle.title, path: staticArticle.seo.path },
          ]),
          this.seo.createArticleSchema(
            staticArticle.title,
            staticArticle.seo.description,
            staticArticle.seo.path,
            PUBLISH_DATE
          ),
        ],
      });
      return;
    }

    try {
      const apiArticle = await this.blogRepository.detailBySlug(slug);
      if (!apiArticle) {
        this.notFound = true;
        return;
      }

      this.article = {
        kind: "api",
        slug,
        title: String(apiArticle.title ?? ""),
        summary: String(apiArticle.shortDescription ?? ""),
        content: String(apiArticle.content ?? ""),
        category:
          Array.isArray(apiArticle.tags) && apiArticle.tags.length
            ? String(apiArticle.tags[0])
            : "Blog",
        publishedAt: String(apiArticle.updatedAt ?? apiArticle.createdAt ?? PUBLISH_DATE),
        publishedLabel: this.formatPublishedLabel(
          String(apiArticle.updatedAt ?? apiArticle.createdAt ?? PUBLISH_DATE)
        ),
        ctaLabel: "Solicitar diagnostico",
        ctaLink: "/contacto",
        readingTime: "Lectura breve",
      };

      const snapshot = await firstValueFrom(this.blogRepository.list());
      const docs = snapshot?.docs ?? [];
      this.related = docs
        .map((doc: any) => {
          const data = typeof doc.data === "function" ? doc.data() : doc;
          return {
            category:
              Array.isArray(data.tags) && data.tags.length ? String(data.tags[0]) : "Blog",
            title: String(data.title ?? ""),
            summary: String(data.shortDescription ?? ""),
            path: `/blog/${data.slug}`,
            slug: String(data.slug ?? ""),
          };
        })
        .filter((item) => item.slug && item.slug !== slug)
        .slice(0, 3)
        .map(({ slug: _slug, ...item }) => item);

      if (!this.related.length) {
        this.related = articles.slice(0, 3).map((item) => ({
          category: item.category,
          title: item.title,
          summary: item.summary,
          path: item.seo.path,
        }));
      }

      this.seo.update({
        title: `${this.article.title} | Blog TecnoRia`,
        description: this.article.summary,
        path: `/blog/${slug}`,
        schemas: [
          this.seo.createBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: this.article.title, path: `/blog/${slug}` },
          ]),
          this.seo.createArticleSchema(
            this.article.title,
            this.article.summary,
            `/blog/${slug}`,
            this.article.publishedAt
          ),
        ],
      });
    } catch {
      this.notFound = true;
    }
  }

  private formatPublishedLabel(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "Publicado recientemente";
    }

    return `Publicado el ${parsed.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;
  }
}
