import { CommonModule } from "@angular/common";
import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterModule } from "@angular/router";
import {
  articles,
  ArticleEntry,
  getArticleBySlug,
  PUBLISH_DATE,
} from "../content/site-content";
import { SeoService } from "../services/seo.service";

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
          <div class="article-meta">{{ current.readingTime }} | Publicado el 6 de marzo de 2026</div>
        </div>
      </section>

      <section class="section">
        <div class="site-container article-layout">
          <article class="article-content surface-card">
            <section class="article-section" *ngFor="let section of current.sections">
              <h2>{{ section.title }}</h2>
              <p *ngFor="let paragraph of section.paragraphs">{{ paragraph }}</p>
              <ul class="plain-list" *ngIf="section.bullets?.length">
                <li *ngFor="let bullet of section.bullets">{{ bullet }}</li>
              </ul>
            </section>
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
            <a class="text-link" [routerLink]="item.seo.path">Leer articulo</a>
          </article>
        </div>
      </section>
    </ng-container>
  `,
})
export class ArticlePageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  article?: ArticleEntry;
  related: ArticleEntry[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly seo: SeoService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const slug = params.get("slug") ?? "";
      const article = getArticleBySlug(slug);
      this.article = article;
      this.related = articles.filter((item) => item.slug !== slug).slice(0, 3);

      if (!article) {
        return;
      }

      this.seo.update({
        title: article.seo.title,
        description: article.seo.description,
        path: article.seo.path,
        keywords: article.seo.keywords,
        schemas: [
          this.seo.createBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: article.title, path: article.seo.path },
          ]),
          this.seo.createArticleSchema(
            article.title,
            article.seo.description,
            article.seo.path,
            PUBLISH_DATE
          ),
        ],
      });
    });
  }
}
