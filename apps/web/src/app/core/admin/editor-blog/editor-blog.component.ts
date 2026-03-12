import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute, RouterModule } from "@angular/router";
import {
  BLOG_REPOSITORY,
  BlogRepository,
} from "src/app/domain/repositories/blog.repository";

type PostDraft = {
  id?: string;
  slug: string;
  title: string;
  shortDescription: string;
  content: string;
  author: string;
  tagsText: string;
  imageUrl: string;
};

@Component({
  selector: "app-editor-blog",
  templateUrl: "./editor-blog.component.html",
  styleUrls: ["./editor-blog.component.css"],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class EditorBlogComponent implements OnInit {
  loading = signal(false);
  saving = signal(false);
  error = signal("");
  success = signal("");
  isEdit = signal(false);
  selectedFile = signal<File | null>(null);

  draft = signal<PostDraft>({
    slug: "",
    title: "",
    shortDescription: "",
    content: "",
    author: "TecnoRia",
    tagsText: "",
    imageUrl: "",
  });

  constructor(
    @Inject(BLOG_REPOSITORY) private readonly blog: BlogRepository,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get("id");
    if (id && id !== "new") {
      this.isEdit.set(true);
      await this.loadPost(id);
    }
  }

  async loadPost(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set("");
    try {
      const post = await this.blog.detailBySlug(id);
      if (!post) {
        this.error.set("Artículo no encontrado.");
        return;
      }
      this.draft.set({
        id: post.id ?? id,
        slug: post.slug ?? "",
        title: post.title ?? "",
        shortDescription: post.shortDescription ?? "",
        content: post.content ?? "",
        author: post.author ?? "TecnoRia",
        tagsText: Array.isArray(post.tags) ? post.tags.join(", ") : "",
        imageUrl: typeof post.image === "string" ? post.image : "",
      });
    } catch {
      this.error.set("No se pudo cargar el artículo.");
    } finally {
      this.loading.set(false);
    }
  }

  onTitleBlur(): void {
    const d = this.draft();
    if (!d.slug.trim()) {
      this.draft.update((v) => ({ ...v, slug: this.slugify(d.title) }));
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.selectedFile.set(input?.files?.[0] ?? null);
  }

  clearFile(): void {
    this.selectedFile.set(null);
  }

  async save(): Promise<void> {
    this.error.set("");
    this.success.set("");

    const d = this.draft();
    const title = d.title.trim();
    const slug = (d.slug.trim() || this.slugify(title)).trim();
    const shortDescription = d.shortDescription.trim();
    const content = d.content.trim();

    if (!title || !slug || !shortDescription || !content) {
      this.error.set("Título, slug, descripción corta y contenido son obligatorios.");
      return;
    }

    this.saving.set(true);
    const tags = d.tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      slug,
      title,
      shortDescription,
      content,
      author: (d.author || "TecnoRia").trim(),
      tags,
      image: this.selectedFile() ?? (d.imageUrl || undefined),
    };

    try {
      if (d.id) {
        await this.blog.update(d.id, payload);
        this.success.set("Artículo actualizado correctamente.");
      } else {
        await this.blog.create(payload);
        this.success.set("Artículo creado correctamente.");
        this.router.navigate(["/dashboard/blog"]);
      }
    } catch {
      this.error.set("No se pudo guardar el artículo.");
    } finally {
      this.saving.set(false);
    }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
}
