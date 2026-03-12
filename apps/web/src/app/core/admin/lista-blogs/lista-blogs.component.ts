import { Component, Inject, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import {
  BLOG_REPOSITORY,
  BlogRepository,
} from "src/app/domain/repositories/blog.repository";

type PostSummary = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  author: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  image?: string;
};

@Component({
  selector: "app-lista-blogs",
  templateUrl: "./lista-blogs.component.html",
  styleUrls: ["./lista-blogs.component.css"],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
})
export class ListaBlogsComponent implements OnInit {
  loading = signal(true);
  error = signal("");
  posts = signal<PostSummary[]>([]);
  search = signal("");
  deletingId = signal("");

  uniqueAuthors = computed(() => new Set(this.posts().map((p) => p.author).filter(Boolean)).size);
  uniqueTags = computed(() => new Set(this.posts().flatMap((p) => p.tags)).size);

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.posts();
    return this.posts().filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  constructor(
    @Inject(BLOG_REPOSITORY) private readonly blog: BlogRepository
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set("");
    try {
      const snapshot = await firstValueFrom(this.blog.list());
      const docs = snapshot?.docs ?? [];
      const mapped: PostSummary[] = docs
        .map((doc: any) => {
          const data = typeof doc.data === "function" ? doc.data() : doc;
          return {
            id: doc.id ?? data.id,
            slug: data.slug ?? "",
            title: data.title ?? "(sin título)",
            shortDescription: data.shortDescription ?? "",
            author: data.author ?? "",
            tags: Array.isArray(data.tags) ? data.tags : [],
            createdAt: data.createdAt ?? data.created_at,
            updatedAt: data.updatedAt ?? data.updated_at,
            image: typeof data.image === "string" ? data.image : undefined,
          };
        })
        .sort((a: PostSummary, b: PostSummary) =>
          (b.updatedAt || b.createdAt || "").localeCompare(
            a.updatedAt || a.createdAt || ""
          )
        );
      this.posts.set(mapped);
    } catch {
      this.error.set("No se pudieron cargar los posts desde la API.");
    } finally {
      this.loading.set(false);
    }
  }

  async deletePost(post: PostSummary): Promise<void> {
    if (typeof window !== "undefined") {
      const ok = window.confirm(`¿Eliminar "${post.title}"?`);
      if (!ok) return;
    }
    this.deletingId.set(post.id);
    try {
      await this.blog.delete(post.id);
      this.posts.update((all) => all.filter((p) => p.id !== post.id));
    } catch {
      this.error.set("No se pudo eliminar el post.");
    } finally {
      this.deletingId.set("");
    }
  }

  formatDate(d?: string): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
}
