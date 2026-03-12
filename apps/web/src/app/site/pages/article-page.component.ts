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
  brandImages,
  getArticleBySlug,
  getArticleVisualBySlug,
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
            <div class="article-callout">
              <strong>Lo importante no es leer más tecnología. Lo importante es decidir mejor.</strong>
              <p>
                Si este contenido coincide con una decisión que estás tomando
                ahora, la siguiente conversación debería ayudarte a bajar
                prioridad, riesgo y siguiente fase.
              </p>
            </div>

            <ng-container *ngIf="current.kind === 'static'; else apiArticleBlock">
              <section
                class="article-section"
                *ngFor="let section of $any(current).sections; let index = index"
                [attr.id]="buildSectionId(section.title, index)"
              >
                <h2>{{ section.title }}</h2>
                <p *ngFor="let paragraph of section.paragraphs">{{ paragraph }}</p>
                <ul class="plain-list plain-list--article" *ngIf="section.bullets?.length">
                  <li *ngFor="let bullet of section.bullets">{{ bullet }}</li>
                </ul>
              </section>
            </ng-container>

            <ng-template #apiArticleBlock>
              <div class="article-richtext" [innerHTML]="$any(current).content"></div>
            </ng-template>
          </article>

          <div class="article-sidebar-shell">
            <div class="article-toc" *ngIf="tableOfContents.length">
              <h3>Recorrido del artículo</h3>
              <ul class="article-toc__list">
                <li *ngFor="let item of tableOfContents">
                  <a [href]="'#' + item.id">{{ item.title }}</a>
                </li>
              </ul>
            </div>

            <aside class="article-sidebar surface-card">
              <span class="panel-label">Siguiente paso</span>
              <p>
                Si este tema toca una decisión que estás tomando ahora, podemos
                aterrizarlo en un diagnóstico o en la landing más adecuada.
              </p>
              <a class="button button-primary" [routerLink]="current.ctaLink">
                {{ current.ctaLabel }}
              </a>
              <a class="button button-secondary" routerLink="/blog">Volver a recursos</a>
            </aside>
          </div>
        </div>
      </section>

      <section class="section section-accent">
        <div class="site-container split-head">
          <div>
            <span class="eyebrow">Relacionados</span>
            <h2>Más contenido conectado a la misma intención de búsqueda o decisión.</h2>
          </div>
        </div>
        <div class="site-container card-grid card-grid--three">
          <article class="surface-card article-card" *ngFor="let item of related">
            <span class="chip chip-soft">{{ item.category }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.summary }}</p>
            <a class="text-link" [routerLink]="item.path">Leer artículo</a>
          </article>
        </div>
      </section>
    </ng-container>

    <section class="section" *ngIf="notFound">
      <div class="site-container surface-card">
        <span class="eyebrow">Contenido no encontrado</span>
        <h1>Este artículo no existe o ya no está disponible.</h1>
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
  tableOfContents: Array<{ id: string; title: string }> = [];

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
    this.tableOfContents = [];

    const staticArticle = getArticleBySlug(slug);
    if (staticArticle) {
      const articleVisual = getArticleVisualBySlug(staticArticle.slug);
      this.article = {
        ...staticArticle,
        kind: "static",
        publishedLabel: "Publicado el 11 de marzo de 2026",
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
      this.tableOfContents = staticArticle.sections.map((section, index) => ({
        id: this.buildSectionId(section.title, index),
        title: section.title,
      }));

      this.seo.update({
        title: staticArticle.seo.title,
        description: staticArticle.seo.description,
        path: staticArticle.seo.path,
        type: "article",
        imagePath: this.resolveSeoImage(articleVisual.src),
        keywords: staticArticle.seo.keywords,
        schemas: [
          this.seo.createBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Recursos", path: "/blog" },
            { name: staticArticle.title, path: staticArticle.seo.path },
          ]),
          this.seo.createArticleSchema(
            staticArticle.title,
            staticArticle.seo.description,
            staticArticle.seo.path,
            PUBLISH_DATE,
            this.resolveSeoImage(articleVisual.src)
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
        ctaLabel: "Solicitar diagnóstico",
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

      const articleVisual = getArticleVisualBySlug(slug);
      this.seo.update({
        title: `${this.article.title} | Recursos`,
        description: this.article.summary,
        path: `/blog/${slug}`,
        type: "article",
        imagePath: this.resolveSeoImage(articleVisual.src),
        schemas: [
          this.seo.createBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Recursos", path: "/blog" },
            { name: this.article.title, path: `/blog/${slug}` },
          ]),
          this.seo.createArticleSchema(
            this.article.title,
            this.article.summary,
            `/blog/${slug}`,
            this.article.publishedAt,
            this.resolveSeoImage(articleVisual.src)
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

  buildSectionId(title: string, index: number): string {
    return `${index + 1}-${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}`;
  }

  private resolveSeoImage(imagePath: string): string {
    return imagePath.endsWith(".svg") ? brandImages.hero.src : imagePath;
  }
}
