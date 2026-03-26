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
  BrandImage,
  brandImages,
  editorialBacklog,
  getArticleVisualBySlug,
  PUBLISH_DATE,
} from "../content/site-content";
import { SeoService } from "../services/seo.service";

type BlogClusterKey = "software" | "automation" | "ai" | "strategy";

type BlogCardView = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  readingTime: string;
  path: string;
  publishedAt: string;
  image: BrandImage;
  clusterKey: BlogClusterKey;
  tags: string[];
};

type BlogClusterDefinition = {
  key: BlogClusterKey;
  label: string;
  title: string;
  description: string;
  kicker: string;
};

type BlogClusterView = BlogClusterDefinition & {
  articles: BlogCardView[];
  categories: string[];
  topCategories: string[];
  latestPublishedAt: string;
};

type BacklogCardView = {
  title: string;
  intent: string;
  clusterKey: BlogClusterKey;
  clusterLabel: string;
  clusterTitle: string;
};

const BLOG_CLUSTER_DEFINITIONS: BlogClusterDefinition[] = [
  {
    key: "software",
    label: "Build",
    title: "Software, arquitectura y producto",
    description:
      "Roadmaps, bases técnicas, decisiones de build y evolución de producto sin ruido innecesario.",
    kicker: "MVP, arquitectura, legacy, roadmap y base de producto.",
  },
  {
    key: "automation",
    label: "Ops",
    title: "Operación, automatización y reporting",
    description:
      "Procesos, integraciones, backoffices, reporting y conectividad para reducir fricción operativa.",
    kicker: "Automatización, integración, reporting y flujos internos.",
  },
  {
    key: "ai",
    label: "AI",
    title: "IA aplicada, asistentes y conversación",
    description:
      "Asistentes, chatbots, capas de conocimiento e IA aplicada a casos de uso con gobierno real.",
    kicker: "Chatbots, copilotos internos, conocimiento y capa conversacional.",
  },
  {
    key: "strategy",
    label: "Strategy",
    title: "Discovery, gobierno y decisión de negocio",
    description:
      "Contenido para priorizar, acotar, comparar y tomar mejores decisiones antes de invertir en build.",
    kicker: "Discovery, comparativas, alcance y criterios de decisión.",
  },
];

const BLOG_CLUSTER_MAP = new Map(
  BLOG_CLUSTER_DEFINITIONS.map((cluster) => [cluster.key, cluster])
);

@Component({
  selector: "app-blog-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ["./blog-page.component.css"],
  template: `
    <section class="page-hero section blog-hero">
      <div class="site-container blog-hero__frame">
        <div class="blog-hero__copy">
          <span class="eyebrow">Recursos</span>
          <h1>Contenido editorial pensado para orientar decisiones técnicas y operativas con criterio.</h1>
          <p class="lead">
            Este hub no depende de una plantilla rígida ni de tres categorías
            fijas. Agrupamos por intención editorial para que el archivo pueda
            crecer con software, automatización, IA o contenido nuevo sin
            romper composición ni jerarquía.
          </p>

          <div class="blog-hero__signals">
            <article class="blog-hero__signal" *ngFor="let signal of articleSignals">
              <strong>{{ signal.value }}</strong>
              <span>{{ signal.label }}</span>
              <p>{{ signal.detail }}</p>
            </article>
          </div>
        </div>

        <aside class="surface-card blog-hero__panel">
          <span class="panel-label">Radar editorial</span>
          <h2>Arquitectura, operación, producto, IA y decisión de negocio en una estructura preparada para escalar.</h2>
          <p>
            Si mañana entran diez artículos nuevos o aparece una categoría
            distinta, el hub los reagrupa por cluster y mantiene lectura,
            contraste y orden visual.
          </p>

          <div class="blog-radar-grid">
            <article class="blog-radar-card" *ngFor="let cluster of clusterViews; trackBy: trackByClusterKey">
              <div class="blog-radar-card__topline">
                <span>{{ cluster.label }}</span>
                <strong>{{ cluster.articles.length }}</strong>
              </div>
              <h3>{{ cluster.title }}</h3>
              <p>{{ cluster.description }}</p>
              <small>
                {{
                  cluster.topCategories.length
                    ? cluster.topCategories.join(" · ")
                    : "Preparado para absorber contenido nuevo"
                }}
              </small>
            </article>
          </div>
        </aside>
      </div>
    </section>

    <section class="section" *ngIf="featuredArticle as featured">
      <div class="site-container">
        <article class="surface-card blog-featured-article">
          <figure class="blog-featured-article__media">
            <img
              [src]="featured.image.src"
              [alt]="featured.image.alt"
              [attr.width]="featured.image.width"
              [attr.height]="featured.image.height"
              loading="eager"
            />
          </figure>

          <div class="blog-featured-article__copy">
            <div class="blog-featured-article__topline">
              <span class="chip chip-soft">{{ featured.category }}</span>
              <span class="blog-featured-article__cluster-badge">
                {{ getClusterDefinition(featured.clusterKey).label }}
              </span>
            </div>

            <h2>{{ featured.title }}</h2>
            <p>{{ featured.summary }}</p>

            <div class="article-meta blog-featured-article__meta">
              <span>{{ featured.readingTime }}</span>
              <span>{{ formatDate(featured.publishedAt) }}</span>
            </div>

            <div class="blog-featured-article__actions">
              <a class="button button-primary" [routerLink]="featured.path">
                Leer artículo destacado
              </a>
              <a class="button button-secondary" routerLink="/contacto">
                Solicitar diagnóstico
              </a>
            </div>

            <div class="blog-featured-article__coverage">
              <article class="blog-featured-article__coverage-card">
                <span class="panel-label">Cluster principal</span>
                <strong>{{ getClusterDefinition(featured.clusterKey).title }}</strong>
                <p>{{ getClusterDefinition(featured.clusterKey).kicker }}</p>
              </article>

              <article class="blog-featured-article__coverage-card">
                <span class="panel-label">Cobertura actual</span>
                <div class="blog-featured-article__pill-list">
                  <span class="blog-featured-article__pill" *ngFor="let cluster of activeClusterViews; trackBy: trackByClusterKey">
                    <strong>{{ cluster.articles.length }}</strong>
                    <span>{{ cluster.label }}</span>
                  </span>
                </div>
              </article>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container split-head blog-overview-head">
        <div>
          <span class="eyebrow">Cobertura por cluster</span>
          <h2>El archivo se organiza por intención editorial, no por una taxonomía frágil.</h2>
        </div>
        <p class="blog-overview-head__copy">
          Cada bloque resume cobertura real, categorías activas y la última
          publicación de ese frente editorial.
        </p>
      </div>

      <div class="site-container blog-cluster-grid">
        <article class="surface-card blog-cluster-card" *ngFor="let cluster of clusterViews; trackBy: trackByClusterKey">
          <div class="blog-cluster-card__topline">
            <span class="chip chip-soft">{{ cluster.label }}</span>
            <strong class="blog-cluster-card__count">{{ cluster.articles.length }}</strong>
          </div>
          <h3>{{ cluster.title }}</h3>
          <p>{{ cluster.description }}</p>
          <div class="blog-cluster-card__categories" *ngIf="cluster.topCategories.length">
            <span class="blog-cluster-card__category" *ngFor="let category of cluster.topCategories">
              {{ category }}
            </span>
          </div>
          <small *ngIf="cluster.latestPublishedAt">
            Última publicación {{ formatDate(cluster.latestPublishedAt) }}
          </small>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="site-container split-head blog-list-head">
        <div>
          <span class="eyebrow">Archivo editorial</span>
          <h2>Un archivo preparado para crecer sin cards estrechas, huecos raros ni composiciones rotas.</h2>
        </div>
        <div class="blog-list-head__meta">
          <span>{{ archiveArticles.length }} artículos en archivo</span>
          <span>{{ uniqueCategoryCount }} categorías activas</span>
        </div>
      </div>

      <div class="site-container" *ngIf="loadError">
        <div class="alert alert-error" role="status">
          {{ loadError }}
        </div>
      </div>

      <div class="site-container blog-archive">
        <section class="blog-cluster-section" *ngFor="let cluster of archiveClusters; trackBy: trackByClusterKey">
          <div class="blog-cluster-section__head">
            <div>
              <div class="blog-cluster-section__topline">
                <span class="chip chip-soft">{{ cluster.label }}</span>
                <div class="blog-cluster-section__meta">
                  <span>{{ cluster.articles.length }} artículos</span>
                  <span>{{ cluster.categories.length }} categorías</span>
                </div>
              </div>
              <h3>{{ cluster.title }}</h3>
              <p class="blog-cluster-section__summary">{{ cluster.description }}</p>
            </div>

            <small *ngIf="cluster.topCategories.length">
              {{ cluster.topCategories.join(" · ") }}
            </small>
          </div>

          <div class="blog-archive-grid">
            <article class="editorial-card blog-editorial-card" *ngFor="let article of cluster.articles; trackBy: trackBySlug">
              <figure class="blog-editorial-card__media">
                <img
                  [src]="article.image.src"
                  [alt]="article.image.alt"
                  [attr.width]="article.image.width"
                  [attr.height]="article.image.height"
                  loading="lazy"
                />
              </figure>

              <div class="blog-editorial-card__body">
                <div class="blog-editorial-card__meta">
                  <span class="chip chip-soft">{{ article.category }}</span>
                  <span class="article-meta">{{ formatDate(article.publishedAt) }}</span>
                </div>
                <h4>{{ article.title }}</h4>
                <p>{{ article.summary }}</p>
                <div class="editorial-card__footer blog-editorial-card__footer">
                  <span class="article-meta">{{ article.readingTime }}</span>
                  <a class="text-link" [routerLink]="article.path">Leer artículo</a>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>

    <section class="section section-accent">
      <div class="site-container section-head">
        <span class="eyebrow">Backlog editorial</span>
        <h2>La siguiente tanda ya está pensada para reforzar topical authority sin perder foco comercial.</h2>
      </div>

      <div class="site-container blog-backlog-grid">
        <article class="surface-card blog-backlog-card" *ngFor="let item of backlogCards">
          <div class="blog-backlog-card__topline">
            <span class="chip chip-soft">{{ item.intent }}</span>
            <span class="blog-backlog-card__cluster">{{ item.clusterLabel }}</span>
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.clusterTitle }}</p>
        </article>
      </div>
    </section>
  `,
})
export class BlogPageComponent implements OnInit {
  articleList: BlogCardView[] = articles.map((article) =>
    this.createBlogCardView({
      slug: article.slug,
      category: article.category,
      title: article.title,
      summary: article.summary,
      readingTime: article.readingTime,
      path: article.seo.path,
      publishedAt: article.publishedAt ?? PUBLISH_DATE,
      image: getArticleVisualBySlug(article.slug),
      tags: article.tags ?? [],
    })
  );
  backlog = editorialBacklog;
  loadError = "";

  constructor(
    private readonly seo: SeoService,
    @Inject(BLOG_REPOSITORY) private readonly blogRepository: BlogRepository
  ) {}

  get featuredArticle(): BlogCardView | undefined {
    return this.articleList[0];
  }

  get archiveArticles(): BlogCardView[] {
    return this.articleList.slice(1);
  }

  get clusterViews(): BlogClusterView[] {
    return this.buildClusterViews(this.articleList);
  }

  get activeClusterViews(): BlogClusterView[] {
    return this.clusterViews.filter((cluster) => cluster.articles.length > 0);
  }

  get archiveClusters(): BlogClusterView[] {
    return this.buildClusterViews(this.archiveArticles).filter(
      (cluster) => cluster.articles.length > 0
    );
  }

  get backlogCards(): BacklogCardView[] {
    return this.backlog.map((item) => {
      const cluster = this.getClusterDefinition(
        this.resolveClusterKey(item.intent, item.title, item.title)
      );

      return {
        title: item.title,
        intent: item.intent,
        clusterKey: cluster.key,
        clusterLabel: cluster.label,
        clusterTitle: cluster.title,
      };
    });
  }

  get uniqueCategoryCount(): number {
    return new Set(this.articleList.map((article) => article.category)).size;
  }

  get articleSignals(): Array<{ value: string; label: string; detail: string }> {
    return [
      {
        value: String(this.articleList.length),
        label: "Piezas activas",
        detail: "Archivo preparado para crecer sin depender de un layout frágil.",
      },
      {
        value: String(this.activeClusterViews.length),
        label: "Clusters vivos",
        detail: "Cobertura repartida entre build, ops, IA y decisión de negocio.",
      },
      {
        value: String(this.uniqueCategoryCount),
        label: "Categorías reales",
        detail: "El hub absorbe categorías nuevas sin romper la estructura editorial.",
      },
      {
        value: String(this.backlog.length),
        label: "Siguientes temas",
        detail: "Backlog listo para ampliar topical authority con continuidad comercial.",
      },
    ];
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
          const slug = String(data.slug ?? "");
          const tags = Array.isArray(data.tags)
            ? data.tags.map((tag: unknown) => String(tag))
            : [];

          return this.createBlogCardView({
            slug,
            category: tags[0] || "Blog",
            title: String(data.title ?? ""),
            summary: String(data.shortDescription ?? ""),
            readingTime: this.estimateReadingTime(
              String(data.content ?? data.shortDescription ?? "")
            ),
            path: `/blog/${slug}`,
            publishedAt: this.normalizePublishedAt(
              data.publishedAt ?? data.updatedAt ?? data.createdAt ?? PUBLISH_DATE
            ),
            image: getArticleVisualBySlug(slug),
            tags,
          });
        })
        .filter((item) => item.slug && item.title);

      const mergedBySlug = new Map<string, BlogCardView>();

      for (const article of this.articleList) {
        mergedBySlug.set(article.slug, article);
      }

      for (const article of apiArticles) {
        mergedBySlug.set(article.slug, article);
      }

      this.articleList = [...mergedBySlug.values()].sort(
        (left, right) =>
          this.getPublishedTimestamp(right.publishedAt) -
          this.getPublishedTimestamp(left.publishedAt)
      );
    } catch {
      this.loadError =
        "No se pudo cargar el contenido dinámico del blog. Mostramos el archivo editorial principal.";
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

  trackBySlug(_index: number, article: BlogCardView): string {
    return article.slug;
  }

  trackByClusterKey(_index: number, cluster: BlogClusterView): BlogClusterKey {
    return cluster.key;
  }

  getClusterDefinition(key: BlogClusterKey): BlogClusterDefinition {
    return BLOG_CLUSTER_MAP.get(key) ?? BLOG_CLUSTER_DEFINITIONS[0];
  }

  private buildClusterViews(articleList: BlogCardView[]): BlogClusterView[] {
    return BLOG_CLUSTER_DEFINITIONS.map((cluster) => {
      const clusterArticles = articleList.filter(
        (article) => article.clusterKey === cluster.key
      );
      const categories = [...new Set(clusterArticles.map((article) => article.category))];

      return {
        ...cluster,
        articles: clusterArticles,
        categories,
        topCategories: categories.slice(0, 3),
        latestPublishedAt: clusterArticles[0]?.publishedAt ?? "",
      };
    });
  }

  private createBlogCardView(input: {
    slug: string;
    category: string;
    title: string;
    summary: string;
    readingTime: string;
    path: string;
    publishedAt: string;
    image: BrandImage;
    tags?: string[];
  }): BlogCardView {
    return {
      slug: input.slug,
      category: input.category,
      title: input.title,
      summary: input.summary,
      readingTime: input.readingTime,
      path: input.path,
      publishedAt: input.publishedAt,
      image: input.image,
      clusterKey: this.resolveClusterKey(
        input.category,
        input.title,
        input.summary,
        input.tags ?? []
      ),
      tags: input.tags ?? [],
    };
  }

  private resolveClusterKey(
    category: string,
    title: string,
    summary: string,
    tags: string[] = []
  ): BlogClusterKey {
    const normalizedCategory = this.normalizeText(category);
    const haystack = this.normalizeText([title, summary, ...tags].join(" "));

    if (
      ["decision", "comparativa", "discovery", "gobierno", "adopcion"].includes(
        normalizedCategory
      )
    ) {
      return "strategy";
    }

    if (
      ["conversacional", "ia aplicada", "asistentes"].includes(
        normalizedCategory
      ) ||
      [
        "chatbot",
        "chatbots",
        "conversacional",
        "asistente",
        "asistentes",
        "copilot",
        "copiloto",
        "inteligencia artificial",
        "ia aplicada",
        "llm",
        "knowledge",
      ].some((token) => haystack.includes(token))
    ) {
      return "ai";
    }

    if (
      ["operacion", "integracion", "reporting"].includes(normalizedCategory) ||
      [
        "automatizacion",
        "operacion",
        "integracion",
        "erp",
        "crm",
        "documental",
        "backoffice",
        "reporting",
        "flujo",
        "proceso",
        "conectividad",
        "sincroniz",
        "ticket",
        "soporte",
      ].some((token) => haystack.includes(token))
    ) {
      return "automation";
    }

    if (
      ["producto", "arquitectura"].includes(normalizedCategory) ||
      [
        "software",
        "arquitectura",
        "legacy",
        "saas",
        "mvp",
        "producto",
        "build",
        "roadmap",
        "plataforma",
        "modulo",
        "modulos",
      ].some((token) => haystack.includes(token))
    ) {
      return "software";
    }

    return "strategy";
  }

  private normalizePublishedAt(value: unknown): string {
    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (
      value &&
      typeof value === "object" &&
      "toDate" in (value as Record<string, unknown>) &&
      typeof (value as { toDate: () => Date }).toDate === "function"
    ) {
      return (value as { toDate: () => Date }).toDate().toISOString();
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return PUBLISH_DATE;
  }

  private getPublishedTimestamp(value: string): number {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  private estimateReadingTime(content: string): string {
    const text = content.replace(/<[^>]+>/g, " ").trim();
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(4, Math.ceil(words / 180));
    return `${minutes} min`;
  }
}
