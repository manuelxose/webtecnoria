import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";
import {
  AUTH_REPOSITORY,
  AuthRepository,
  AuthUser,
} from "src/app/domain/repositories/auth.repository";
import {
  BLOG_REPOSITORY,
  BlogRepository,
} from "src/app/domain/repositories/blog.repository";
import {
  SCRAPER_REPOSITORY,
  ScraperRepository,
} from "src/app/domain/repositories/scraper.repository";

type AdminPostSummary = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  author: string;
  image?: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
};

type AdminPostDraft = {
  id?: string;
  slug: string;
  title: string;
  shortDescription: string;
  content: string;
  author: string;
  tagsText: string;
  imageUrl: string;
};

type ScraperJobItem = {
  id: string;
  query: string;
  status: string;
  resultUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

@Component({
  selector: "app-admin-panel",
  templateUrl: "./admin-panel.component.html",
  styleUrls: ["./admin-panel.component.css"],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class AdminPanelComponent implements OnInit {
  user: AuthUser | null = null;
  posts: AdminPostSummary[] = [];
  jobs: ScraperJobItem[] = [];

  postDraft: AdminPostDraft = this.createEmptyPost();
  selectedImageFile: File | null = null;
  scraperQuery = "";

  loadingPosts = true;
  savingPost = false;
  scraperLoading = false;
  deletingPostId = "";
  refreshingJobId = "";

  postsError = "";
  postError = "";
  postSuccess = "";
  scraperError = "";
  scraperSuccess = "";

  constructor(
    @Inject(BLOG_REPOSITORY) private readonly blogRepository: BlogRepository,
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    @Inject(SCRAPER_REPOSITORY)
    private readonly scraperRepository: ScraperRepository,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.user = await this.authRepository.me();
    this.resetEditor();
    await this.loadPosts();
  }

  get activePostsCount(): number {
    return this.posts.length;
  }

  get runningJobsCount(): number {
    return this.jobs.filter((job) => ["queued", "running"].includes(job.status)).length;
  }

  resetEditor(): void {
    this.selectedImageFile = null;
    this.postError = "";
    this.postSuccess = "";
    this.postDraft = this.createEmptyPost();
  }

  async loadPosts(): Promise<void> {
    this.loadingPosts = true;
    this.postsError = "";

    try {
      const snapshot = await firstValueFrom(this.blogRepository.list());
      const docs = snapshot?.docs ?? [];

      this.posts = docs
        .map((doc: any) => {
          const data = typeof doc.data === "function" ? doc.data() : doc;
          return this.normalizePostSummary({
            id: doc.id ?? data.id,
            ...data,
          });
        })
        .sort((left, right) =>
          (right.updatedAt || right.createdAt || "").localeCompare(
            left.updatedAt || left.createdAt || ""
          )
        );
    } catch {
      this.postsError = "No se pudieron cargar los posts desde la API.";
    } finally {
      this.loadingPosts = false;
    }
  }

  async editPost(post: AdminPostSummary): Promise<void> {
    this.postError = "";
    this.postSuccess = "";

    try {
      const detail = await this.blogRepository.detailBySlug(post.slug);

      if (!detail) {
        this.postError = "No se pudo cargar el detalle del post.";
        return;
      }

      this.selectedImageFile = null;
      this.postDraft = {
        id: detail.id,
        slug: detail.slug || post.slug,
        title: detail.title || post.title,
        shortDescription: detail.shortDescription || post.shortDescription,
        content: detail.content || "",
        author: detail.author || post.author || this.defaultAuthor(),
        tagsText: this.normalizeTags(detail.tags).join(", "),
        imageUrl: typeof detail.image === "string" ? detail.image : "",
      };
    } catch {
      this.postError = "No se pudo preparar el post para edicion.";
    }
  }

  async savePost(): Promise<void> {
    this.postError = "";
    this.postSuccess = "";

    const title = this.postDraft.title.trim();
    const slug = (this.postDraft.slug.trim() || this.slugify(title)).trim();
    const shortDescription = this.postDraft.shortDescription.trim();
    const content = this.postDraft.content.trim();

    if (!title || !slug || !shortDescription || !content) {
      this.postError =
        "Slug, titulo, descripcion corta y contenido son obligatorios.";
      return;
    }

    this.savingPost = true;

    try {
      const successMessage = this.postDraft.id
        ? "Post actualizado correctamente."
        : "Post creado correctamente.";
      const payload = {
        slug,
        title,
        shortDescription,
        content,
        author: (this.postDraft.author || this.defaultAuthor()).trim(),
        tags: this.parseTags(this.postDraft.tagsText),
        image:
          this.selectedImageFile ??
          (this.postDraft.imageUrl ? this.postDraft.imageUrl : undefined),
      };

      if (this.postDraft.id) {
        await this.blogRepository.update(this.postDraft.id, payload);
      } else {
        await this.blogRepository.create(payload);
      }

      await this.loadPosts();
      this.resetEditor();
      this.postSuccess = successMessage;
    } catch {
      this.postError = "No se pudo guardar el post en la API.";
    } finally {
      this.savingPost = false;
    }
  }

  async deletePost(post: AdminPostSummary): Promise<void> {
    if (typeof window !== "undefined") {
      const accepted = window.confirm(`Eliminar "${post.title}"?`);
      if (!accepted) {
        return;
      }
    }

    this.deletingPostId = post.id;
    this.postsError = "";

    try {
      await this.blogRepository.delete(post.id);

      if (this.postDraft.id === post.id) {
        this.resetEditor();
      }

      await this.loadPosts();
    } catch {
      this.postsError = "No se pudo eliminar el post.";
    } finally {
      this.deletingPostId = "";
    }
  }

  handleTitleBlur(): void {
    if (!this.postDraft.slug.trim()) {
      this.postDraft.slug = this.slugify(this.postDraft.title);
    }
  }

  handleImageSelection(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    this.selectedImageFile = file;
  }

  clearSelectedImage(): void {
    this.selectedImageFile = null;
  }

  async createScraperJob(): Promise<void> {
    this.scraperError = "";
    this.scraperSuccess = "";

    const query = this.scraperQuery.trim();
    if (!query) {
      this.scraperError = "Introduce una busqueda antes de lanzar el job.";
      return;
    }

    this.scraperLoading = true;

    try {
      const created = await this.scraperRepository.createJob(query);
      const normalized = this.normalizeJob(created);
      this.jobs = [normalized, ...this.jobs.filter((job) => job.id !== normalized.id)];
      this.scraperQuery = "";
      this.scraperSuccess = "Job creado correctamente.";
    } catch {
      this.scraperError = "No se pudo crear el job de scraping.";
    } finally {
      this.scraperLoading = false;
    }
  }

  async refreshJob(job: ScraperJobItem): Promise<void> {
    this.refreshingJobId = job.id;
    this.scraperError = "";

    try {
      const fresh = this.normalizeJob(await this.scraperRepository.jobStatus(job.id));
      this.jobs = this.jobs.map((item) => (item.id === job.id ? fresh : item));
    } catch {
      this.scraperError = "No se pudo actualizar el estado del job.";
    } finally {
      this.refreshingJobId = "";
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authRepository.logout();
    } finally {
      await this.router.navigate(["/auth-login"]);
    }
  }

  formatDate(value?: string): string {
    if (!value) {
      return "Sin fecha";
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  private createEmptyPost(): AdminPostDraft {
    return {
      slug: "",
      title: "",
      shortDescription: "",
      content: "",
      author: this.defaultAuthor(),
      tagsText: "",
      imageUrl: "",
    };
  }

  private defaultAuthor(): string {
    return this.user?.email || "TecnoRia";
  }

  private parseTags(value: string): string[] {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private normalizeTags(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === "string") {
      return this.parseTags(value);
    }

    return [];
  }

  private normalizePostSummary(post: any): AdminPostSummary {
    return {
      id: String(post.id ?? ""),
      slug: String(post.slug ?? ""),
      title: String(post.title ?? ""),
      shortDescription: String(post.shortDescription ?? ""),
      author: String(post.author ?? this.defaultAuthor()),
      image: typeof post.image === "string" ? post.image : undefined,
      tags: this.normalizeTags(post.tags),
      createdAt: post.createdAt || post.date,
      updatedAt: post.updatedAt || post.date,
    };
  }

  private normalizeJob(job: any): ScraperJobItem {
    return {
      id: String(job?.id ?? ""),
      query: String(job?.query ?? this.scraperQuery),
      status: String(job?.status ?? "queued"),
      resultUrl: typeof job?.resultUrl === "string" ? job.resultUrl : undefined,
      createdAt: job?.createdAt,
      updatedAt: job?.updatedAt,
    };
  }

  private slugify(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
}
