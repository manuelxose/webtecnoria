import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit, computed, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";
import {
  BLOG_REPOSITORY,
  BlogPostRecord,
  BlogRepository,
  BlogStatus,
} from "src/app/domain/repositories/blog.repository";
import { PUBLISH_DATE, articles } from "src/app/site/content/site-content";
import { AuctorioLaunchService } from "../integrations/auctorio-launch";

type PostSource = "api" | "site";
type PostPublicState = "live" | "hidden";

type PostSummary = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  author: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  image?: string;
  source: PostSource;
  status: BlogStatus;
  publicState: PostPublicState;
  hasStaticBase: boolean;
};

@Component({
  selector: "app-lista-blogs",
  templateUrl: "./lista-blogs.component.html",
  styleUrls: ["./lista-blogs.component.css"],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
})
export class ListaBlogsComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal("");
  readonly posts = signal<PostSummary[]>([]);
  readonly search = signal("");
  readonly deletingId = signal("");
  readonly launchingAuctorio = signal(false);
  readonly launchError = signal("");

  readonly uniqueAuthors = computed(
    () => new Set(this.posts().map((post) => post.author).filter(Boolean)).size
  );
  readonly uniqueTags = computed(
    () => new Set(this.posts().flatMap((post) => post.tags)).size
  );
  readonly publishedCount = computed(
    () => this.posts().filter((post) => post.publicState === "live").length
  );
  readonly apiDraftCount = computed(
    () =>
      this.posts().filter(
        (post) => post.source === "api" && post.status === "draft"
      ).length
  );
  readonly delegableCount = computed(
    () =>
      this.posts().filter((post) => post.source === "site" || post.hasStaticBase).length
  );

  readonly filtered = computed(() => {
    const query = this.search().toLowerCase().trim();
    if (!query) {
      return this.posts();
    }

    return this.posts().filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.slug.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  constructor(
    @Inject(BLOG_REPOSITORY) private readonly blog: BlogRepository,
    private readonly auctorioLaunch: AuctorioLaunchService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set("");

    const sitePosts = this.buildSitePosts();

    try {
      const snapshot = await firstValueFrom(
        this.blog.list({ includeDrafts: true })
      );
      const apiPosts = (snapshot?.docs ?? [])
        .map((doc: { id: string; data: () => BlogPostRecord }) =>
          this.normalizeApiPost(doc.id, doc.data())
        )
        .filter((post) => post.slug && post.title);

      this.posts.set(this.mergePosts(sitePosts, apiPosts));
    } catch {
      this.posts.set(sitePosts);
      this.error.set(
        "No se pudo cargar el estado editorial de la API. Mostramos la base pública conectada al sitio."
      );
    } finally {
      this.loading.set(false);
    }
  }

  async deletePost(post: PostSummary): Promise<void> {
    if (post.source !== "api") {
      return;
    }

    if (typeof window !== "undefined") {
      const accepted = window.confirm(`¿Eliminar "${post.title}"?`);
      if (!accepted) {
        return;
      }
    }

    this.deletingId.set(post.id);

    try {
      await this.blog.delete(post.id);
      await this.load();
    } catch {
      this.error.set("No se pudo eliminar el artículo de la API.");
    } finally {
      this.deletingId.set("");
    }
  }

  async openAuctorio(): Promise<void> {
    this.launchError.set("");
    this.launchingAuctorio.set(true);

    try {
      await this.auctorioLaunch.openStudioInNewTab({
        workspace: "tecnoria",
        returnTo: "/studio/editorial/articles",
      });
    } catch (error: any) {
      this.launchError.set(
        String(error?.error?.message || error?.message || "No se pudo abrir Auctorio.")
      );
    } finally {
      this.launchingAuctorio.set(false);
    }
  }

  formatDate(value?: string | null): string {
    if (!value) {
      return "—";
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  getSourceLabel(post: PostSummary): string {
    if (post.source === "site" && post.hasStaticBase) {
      return "Base pública";
    }

    return post.source === "api" ? "Dashboard API" : "Base pública";
  }

  getEditorialLabel(post: PostSummary): string {
    if (post.source === "site") {
      return "Publicado desde código";
    }

    if (post.status === "publish") {
      return post.hasStaticBase ? "Publicado y sincronizado" : "Publicado por API";
    }

    return post.hasStaticBase ? "Borrador sobre pieza pública" : "Borrador API";
  }

  getVisibilityLabel(post: PostSummary): string {
    return post.publicState === "live" ? "Visible en web" : "Solo editor";
  }

  getEditLabel(post: PostSummary): string {
    return post.source === "site" ? "Gestionar" : "Editar";
  }

  getPublicPath(post: PostSummary): string {
    return `/blog/${post.slug}`;
  }

  private buildSitePosts(): PostSummary[] {
    return articles.map((article) => ({
      id: `site:${article.slug}`,
      slug: article.slug,
      title: article.title,
      shortDescription: article.summary,
      author: "TecnoRia",
      tags: article.tags?.length ? article.tags : [article.category],
      createdAt: article.publishedAt ?? PUBLISH_DATE,
      updatedAt: article.publishedAt ?? PUBLISH_DATE,
      publishedAt: article.publishedAt ?? PUBLISH_DATE,
      source: "site",
      status: "publish",
      publicState: "live",
      hasStaticBase: true,
    }));
  }

  private normalizeApiPost(id: string, data: BlogPostRecord): PostSummary {
    const publishedAt =
      data.publishedAt ?? data.updatedAt ?? data.createdAt ?? PUBLISH_DATE;

    return {
      id: data.id ?? id,
      slug: data.slug ?? "",
      title: data.title ?? "(sin título)",
      shortDescription: data.shortDescription ?? "",
      author: data.author ?? "TecnoRia",
      tags: Array.isArray(data.tags) ? data.tags : [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      publishedAt,
      image: typeof data.image === "string" ? data.image : undefined,
      source: "api",
      status: data.status === "publish" ? "publish" : "draft",
      publicState: data.status === "publish" ? "live" : "hidden",
      hasStaticBase: false,
    };
  }

  private mergePosts(sitePosts: PostSummary[], apiPosts: PostSummary[]): PostSummary[] {
    const bySlug = new Map<string, PostSummary>();

    for (const sitePost of sitePosts) {
      bySlug.set(sitePost.slug, sitePost);
    }

    for (const apiPost of apiPosts) {
      const sitePost = bySlug.get(apiPost.slug);
      bySlug.set(apiPost.slug, {
        ...apiPost,
        hasStaticBase: Boolean(sitePost),
        publicState:
          apiPost.status === "publish" || Boolean(sitePost) ? "live" : "hidden",
      });
    }

    return [...bySlug.values()].sort(
      (left, right) =>
        this.toTimestamp(right.publishedAt ?? right.updatedAt ?? right.createdAt) -
        this.toTimestamp(left.publishedAt ?? left.updatedAt ?? left.createdAt)
    );
  }

  private toTimestamp(value?: string | null): number {
    if (!value) {
      return 0;
    }

    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
}
