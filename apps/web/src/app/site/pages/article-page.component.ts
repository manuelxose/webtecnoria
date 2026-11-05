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
  BrandImage,
  brandImages,
  getArticleBySlug,
  getArticleVisualBySlug,
  PUBLISH_DATE,
  ServiceLinkEntry,
} from "../content/site-content";
import { SeoService } from "../services/seo.service";

type BlogCardView = {
  category: string;
  title: string;
  summary: string;
  path: string;
  image: BrandImage;
};

/**
 * GROWTH-04 — guarda de cuerpo editorial.
 *
 * Defecto medido en producción (2026-11-05): la fila de `blog_posts` del artículo
 * de coste tiene `content="sadasda"` (7 caracteres) y GANABA sobre el artículo
 * editorial del repositorio, de modo que
 * https://tecnoriasl.com/blog/cuanto-cuesta-desarrollar-software-medida servía
 * un cuerpo de 7 caracteres con 267-297 impresiones y 0 clics.
 *
 * La guarda falla en cerrado: por debajo del umbral, la fila de la API no se
 * pinta y el artículo estático del repositorio ocupa su lugar. El umbral es
 * deliberadamente enorme comparado con el defecto (7) y pequeño comparado con el
 * contenido real (2.289 caracteres), así que no hay zona gris.
 *
 * No se borra ni se modifica ninguna fila: la guarda es de render.
 */
export const MIN_ARTICLE_BODY_CHARS = 400;

/**
 * Mínimo de subsecciones con contenido propio (GROWTH-04, hallazgo F3 de la
 * revisión independiente). La longitud sola no basta: 400 caracteres del mismo
 * texto repetido, o un aviso de borrador largo, superarían el umbral y se
 * publicarían como artículo. Un artículo editorial real está estructurado.
 */
export const MIN_ARTICLE_BODY_SECTIONS = 3;

/** Longitud del texto plano de un fragmento HTML. */
export function articleBodyTextLength(html: string | null | undefined): number {
  if (typeof html !== "string") {
    return 0;
  }

  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

/**
 * Encabezados que separan contenido: h2 de un artículo del CMS, o cualquier
 * h2/h3 cuando el CMS entrega HTML plano sin `section`.
 */
export function articleSectionCount(html: string | null | undefined): number {
  if (typeof html !== "string") {
    return 0;
  }

  return (html.match(/<h[23]\b/gi) ?? []).length;
}

/**
 * ¿Es este cuerpo contenido editorial publicable?
 *
 * Falla en cerrado por dos criterios independientes: longitud suficiente Y
 * estructura suficiente. Un marcador largo ("BORRADOR - pendiente de revisar...")
 * pasa la longitud pero no la estructura.
 */
export function isRenderableEditorialBody(html: string | null | undefined): boolean {
  return (
    articleBodyTextLength(html) >= MIN_ARTICLE_BODY_CHARS &&
    articleSectionCount(html) >= MIN_ARTICLE_BODY_SECTIONS
  );
}

/**
 * Garantiza que cada <h2> tenga un id estable y único, para que el índice del
 * artículo (`Recorrido del artículo`) nunca produzca un ancla rota: el HTML que
 * llega del CMS no trae ids.
 *
 * `startIndex` desplaza la numeración: el componente numera los encabezados
 * sobre el HTML COMPLETO del cuerpo, mientras que el tamaño del texto del cuerpo
 * se mide con otra función. Mantener la numeración aquí y en la medición sobre la
 * misma base evita que un índice empiece en "2-" por un desfase de cuenta.
 */
export function ensureHeadingIds(
  html: string,
  startIndex = 0
): {
  html: string;
  entries: Array<{ id: string; title: string }>;
} {
  const entries: Array<{ id: string; title: string }> = [];
  let index = startIndex;

  const slugify = (value: string): string =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const out = html.replace(
    /<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi,
    (match, attrs: string, inner: string) => {
      const current = index++;
      const existing = /\bid\s*=\s*["']([^"']+)["']/i.exec(attrs);
      const title = String(inner).replace(/<[^>]+>/g, "").trim();
      const id = existing ? existing[1] : `${current + 1}-${slugify(title)}`;

      // Un id repetido no se añade dos veces al índice (ancla ambigua).
      if (entries.some((entry) => entry.id === id)) {
        return match;
      }

      entries.push({ id, title });
      return existing ? match : `<h2${attrs} id="${id}">${inner}</h2>`;
    }
  );

  return { html: out, entries };
}

type ApiArticleView = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  publishedAt: string;
  /**
   * GROWTH-03C: CMS-served articles carry no contextual service links, so the
   * article→service link added in GROWTH-03B never rendered for any slug that has
   * a row in blog_posts. When a static counterpart exists for the same slug we reuse
   * its editorial service link, which is the only place that intent is expressed.
   */
  serviceLinks?: ServiceLinkEntry[];
};

@Component({
  selector: "app-article-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ["./article-page.component.css"],
  template: `
    <ng-container *ngIf="article as current">
      <section class="page-hero section article-hero">
        <div class="site-container page-hero__split page-hero__split--visual article-hero__split">
          <div class="page-hero__copy article-hero__copy">
            <span class="eyebrow">{{ current.category }}</span>
            <h1>{{ current.title }}</h1>
            <p class="lead">{{ current.summary }}</p>
            <div class="article-meta article-hero__meta">
              <span>{{ current.readingTime }}</span>
              <span>{{ current.publishedLabel }}</span>
            </div>
          </div>

          <figure class="surface-card visual-card visual-card--page article-hero__visual">
            <img
              [src]="articleVisual.src"
              [alt]="articleVisual.alt"
              [attr.width]="articleVisual.width"
              [attr.height]="articleVisual.height"
              loading="eager"
            />
          </figure>
        </div>
      </section>

      <section class="section">
        <div class="site-container article-layout article-layout--editorial">
          <article class="article-content surface-card article-content--editorial">
            <div class="article-callout article-callout--editorial">
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

          <div class="article-sidebar-shell article-sidebar-shell--editorial">
            <div class="article-toc article-toc--editorial" *ngIf="tableOfContents.length">
              <h3>Recorrido del artículo</h3>
              <ul class="article-toc__list">
                <li *ngFor="let item of tableOfContents">
                  <a [href]="'#' + item.id">{{ item.title }}</a>
                </li>
              </ul>
            </div>

            <aside class="article-sidebar surface-card article-sidebar--editorial">
              <span class="panel-label">Siguiente paso</span>
              <h3>Convierte esta lectura en una decisión útil.</h3>
              <p>
                Si este tema toca una decisión que estás tomando ahora, podemos
                aterrizarlo en un diagnóstico o en la landing más adecuada.
              </p>
              <p
                class="article-sidebar__service-link"
                *ngIf="$any(current).serviceLinks?.length"
              >
                <a class="text-link" [routerLink]="$any(current).serviceLinks[0].path">
                  {{ $any(current).serviceLinks[0].label }}
                </a>
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
        <div class="site-container card-grid card-grid--three article-related-grid">
          <article class="surface-card article-card article-card--related" *ngFor="let item of related">
            <figure class="article-card__media">
              <img
                [src]="item.image.src"
                [alt]="item.image.alt"
                [attr.width]="item.image.width"
                [attr.height]="item.image.height"
                loading="lazy"
              />
            </figure>

            <div class="article-card__body">
              <span class="chip chip-soft">{{ item.category }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.summary }}</p>
              <a class="text-link" [routerLink]="item.path">{{ item.title }}</a>
            </div>
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
  articleVisual: BrandImage = brandImages.systems;

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

    const apiArticle = await this.blogRepository.detailBySlug(slug);
    // Fail closed (GROWTH-04): una fila con cuerpo no editorial NO gana sobre el
    // artículo del repositorio. Se cae al bloque estático de más abajo.
    if (apiArticle && isRenderableEditorialBody(String(apiArticle.content ?? ""))) {
      const publishedAt = String(
        apiArticle.publishedAt ?? apiArticle.updatedAt ?? apiArticle.createdAt ?? PUBLISH_DATE
      );

      const staticCounterpart = getArticleBySlug(slug);

      // El HTML del CMS no trae ids: se añaden aquí y el índice se construye del
      // mismo resultado, así que plantilla e índice no pueden discrepar.
      const body = ensureHeadingIds(String(apiArticle.content ?? ""));

      this.article = {
        kind: "api",
        slug,
        title: String(apiArticle.title ?? ""),
        summary: String(apiArticle.shortDescription ?? ""),
        content: body.html,
        serviceLinks: staticCounterpart?.serviceLinks,
        category:
          Array.isArray(apiArticle.tags) && apiArticle.tags.length
            ? String(apiArticle.tags[0])
            : "Blog",
        publishedAt,
        publishedLabel: this.formatPublishedLabel(publishedAt),
        ctaLabel: "Solicitar diagnóstico",
        ctaLink: "/contacto",
        readingTime: this.estimateReadingTime(
          String(apiArticle.content ?? apiArticle.shortDescription ?? "")
        ),
      };

      this.related = await this.loadRelated(slug);

      // GROWTH-04: el TOC de los artículos servidos por CMS NO se propaga.
      //
      // Verificado sobre el SSR construido (no sobre la fuente): aunque
      // ensureHeadingIds devuelve el HTML con `id` y el índice con esos mismos
      // ids, el HTML servido sale como `<h2>No compras código</h2>`, sin id. El
      // saneador de Angular para [innerHTML] elimina los atributos `id` al
      // serializar en servidor. Propagar el índice en esas condiciones generaría
      // exactamente las anclas rotas que el handoff pide evitar ("verificar
      // antes"), así que se mantiene oculto para la rama CMS y seguirá
      // funcionando para los artículos estáticos, cuyos encabezados se pintan
      // desde plantilla.
      this.tableOfContents = [];

      const articleVisual = getArticleVisualBySlug(slug);
      this.articleVisual = articleVisual;
      this.seo.update({
        title: String(apiArticle.seoTitle ?? `${this.article.title} | Recursos`),
        description: String(
          apiArticle.seoDescription ?? this.article.summary ?? ""
        ),
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
            String(apiArticle.seoDescription ?? this.article.summary ?? ""),
            `/blog/${slug}`,
            this.article.publishedAt,
            this.resolveSeoImage(articleVisual.src)
          ),
        ],
      });
      return;
    }

    const staticArticle = getArticleBySlug(slug);
    if (staticArticle) {
      const articleVisual = getArticleVisualBySlug(staticArticle.slug);
      this.articleVisual = articleVisual;
      this.article = {
        ...staticArticle,
        kind: "static",
        publishedLabel: this.formatPublishedLabel(
          staticArticle.publishedAt ?? PUBLISH_DATE
        ),
      };
      this.related = articles
        .filter((item) => item.slug !== slug)
        .slice(0, 3)
        .map((item) => ({
          category: item.category,
          title: item.title,
          summary: item.summary,
          path: item.seo.path,
          image: getArticleVisualBySlug(item.slug),
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
            staticArticle.publishedAt ?? PUBLISH_DATE,
            this.resolveSeoImage(articleVisual.src)
          ),
        ],
      });
      return;
    }

    this.notFound = true;
    this.seo.update({
      title: "Artículo no encontrado",
      description: "El artículo solicitado no está disponible en TecnoRia.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
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

  private async loadRelated(slug: string): Promise<BlogCardView[]> {
    try {
      const snapshot = await firstValueFrom(this.blogRepository.list());
      const docs = snapshot?.docs ?? [];
      const merged = new Map<
        string,
        BlogCardView & {
          slug: string;
          publishedAt: string;
        }
      >();

      for (const item of articles) {
        merged.set(item.slug, {
          slug: item.slug,
          category: item.category,
          title: item.title,
          summary: item.summary,
          path: item.seo.path,
          image: getArticleVisualBySlug(item.slug),
          publishedAt: item.publishedAt ?? PUBLISH_DATE,
        });
      }

      for (const doc of docs) {
        const data = doc.data();
        const apiSlug = String(data.slug ?? "");
        if (!apiSlug) {
          continue;
        }

        merged.set(apiSlug, {
          slug: apiSlug,
          category:
            Array.isArray(data.tags) && data.tags.length ? String(data.tags[0]) : "Blog",
          title: String(data.title ?? ""),
          summary: String(data.shortDescription ?? ""),
          path: `/blog/${apiSlug}`,
          image: getArticleVisualBySlug(apiSlug),
          publishedAt: String(
            data.publishedAt ?? data.updatedAt ?? data.createdAt ?? PUBLISH_DATE
          ),
        });
      }

      return [...merged.values()]
        .filter((item) => item.slug !== slug && item.title)
        .sort(
          (left, right) =>
            new Date(right.publishedAt).getTime() -
            new Date(left.publishedAt).getTime()
        )
        .slice(0, 3)
        .map(({ slug: _slug, publishedAt: _publishedAt, ...item }) => item);
    } catch {
      return articles
        .filter((item) => item.slug !== slug)
        .slice(0, 3)
        .map((item) => ({
          category: item.category,
          title: item.title,
          summary: item.summary,
          path: item.seo.path,
          image: getArticleVisualBySlug(item.slug),
        }));
    }
  }

  private estimateReadingTime(content: string): string {
    const text = content.replace(/<[^>]+>/g, " ").trim();
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(4, Math.ceil(words / 180));
    return `${minutes} min`;
  }
}
