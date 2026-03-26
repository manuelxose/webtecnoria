import { CommonModule, DOCUMENT, isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  computed,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";
import {
  BLOG_REPOSITORY,
  BlogPostRecord,
  BlogRepository,
  BlogStatus,
  BlogWriteInput,
} from "src/app/domain/repositories/blog.repository";
import {
  ArticleEntry,
  PUBLISH_DATE,
  getArticleBySlug,
  getArticleVisualBySlug,
} from "src/app/site/content/site-content";
import { AuctorioLaunchService } from "../integrations/auctorio-launch";

type EditorMode = "new" | "edit" | "seed";

type PostDraft = {
  id?: string;
  slug: string;
  title: string;
  shortDescription: string;
  content: string;
  author: string;
  tagsText: string;
  imageUrl: string;
  status: BlogStatus;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
};

@Component({
  selector: "app-editor-blog",
  templateUrl: "./editor-blog.component.html",
  styleUrls: ["./editor-blog.component.css"],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class EditorBlogComponent implements OnInit, AfterViewInit {
  @ViewChild("richEditor")
  private richEditor?: ElementRef<HTMLDivElement>;

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal("");
  readonly success = signal("");
  readonly launchError = signal("");
  readonly launchingAuctorio = signal(false);
  readonly editorMode = signal<EditorMode>("new");
  readonly editorView = signal<"rich" | "html">("rich");
  readonly selectedFile = signal<File | null>(null);
  readonly sourceSummary = signal("");
  readonly currentIdentifier = signal("new");

  readonly draft = signal<PostDraft>(this.createEmptyDraft());
  private readonly isBrowser: boolean;

  readonly publicPath = computed(() => {
    const slug = this.draft().slug.trim();
    return slug ? `/blog/${slug}` : "/blog";
  });

  constructor(
    @Inject(BLOG_REPOSITORY) private readonly blog: BlogRepository,
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) platformId: object,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly auctorioLaunch: AuctorioLaunchService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    this.scheduleRichEditorSync();
  }

  async ngOnInit(): Promise<void> {
    const identifier = this.route.snapshot.paramMap.get("id");
    this.currentIdentifier.set(identifier ?? "new");

    if (identifier && identifier !== "new") {
      await this.loadPost(identifier);
      return;
    }

    this.editorMode.set("new");
    this.sourceSummary.set(
      "Artículo nuevo. Se guardará en la API editorial y podrá publicarse desde este panel o desde Auctorio."
    );
  }

  get isEdit(): boolean {
    return this.editorMode() === "edit";
  }

  get isSeed(): boolean {
    return this.editorMode() === "seed";
  }

  get titleText(): string {
    if (this.editorMode() === "edit") {
      return "Editar artículo";
    }

    if (this.editorMode() === "seed") {
      return "Gestionar artículo base";
    }

    return "Nuevo artículo";
  }

  get subtitleText(): string {
    if (this.editorMode() === "edit") {
      return "Modifica la versión editorial conectada con la API y controla visibilidad, SEO y publicación.";
    }

    if (this.editorMode() === "seed") {
      return "Esta pieza ya existe en la web pública desde código. Al guardar crearás su versión gestionada por API sin perder el slug.";
    }

    return "Redacta una pieza nueva, guárdala como borrador o publícala cuando esté lista.";
  }

  get primaryActionLabel(): string {
    if (this.saving()) {
      return "Guardando…";
    }

    if (this.isEdit) {
      return "Guardar cambios";
    }

    if (this.isSeed) {
      return "Crear versión gestionada";
    }

    return this.draft().status === "publish" ? "Publicar artículo" : "Guardar borrador";
  }

  async loadPost(identifier: string): Promise<void> {
    this.loading.set(true);
    this.error.set("");
    this.success.set("");

    try {
      const directPost = await this.blog.detailBySlug(identifier, {
        includeDrafts: true,
      });

      if (directPost) {
        this.applyApiPost(directPost);
        this.currentIdentifier.set(directPost.slug);
        return;
      }

      const snapshot = await firstValueFrom(
        this.blog.list({ includeDrafts: true })
      );
      const matchedById = (snapshot?.docs ?? []).find((doc) => {
        const data = doc.data();
        return (data.id ?? doc.id) === identifier;
      });

      if (matchedById) {
        const canonicalSlug = matchedById.data().slug;
        const post = await this.blog.detailBySlug(canonicalSlug, {
          includeDrafts: true,
        });

        if (post) {
          this.applyApiPost(post);
          this.currentIdentifier.set(post.slug);
          if (identifier !== post.slug) {
            await this.router.navigate(["/dashboard/blog", post.slug], {
              replaceUrl: true,
            });
          }
          return;
        }
      }

      const staticArticle = getArticleBySlug(identifier);
      if (staticArticle) {
        this.applyStaticArticle(staticArticle);
        this.currentIdentifier.set(staticArticle.slug);
        return;
      }

      this.error.set("Artículo no encontrado.");
    } catch {
      this.error.set("No se pudo cargar el artículo.");
    } finally {
      this.loading.set(false);
    }
  }

  onTitleBlur(): void {
    const current = this.draft();
    if (!current.slug.trim()) {
      this.draft.update((value) => ({
        ...value,
        slug: this.slugify(current.title),
      }));
    }
  }

  updateTextField(
    field:
      | "title"
      | "slug"
      | "shortDescription"
      | "content"
      | "author"
      | "tagsText"
      | "imageUrl"
      | "seoTitle"
      | "seoDescription",
    event: Event
  ): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
    const value = target?.value ?? "";
    this.draft.update((current) => ({
      ...current,
      [field]: value,
    }));
  }

  updateStatus(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    const value = target?.value === "publish" ? "publish" : "draft";
    this.draft.update((current) => ({
      ...current,
      status: value,
    }));
  }

  updatePublishedAt(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.draft.update((current) => ({
      ...current,
      publishedAt: target?.value ?? "",
    }));
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

  setEditorView(view: "rich" | "html"): void {
    if (view === this.editorView()) {
      return;
    }

    if (view === "html") {
      this.syncDraftFromRichEditor();
    }

    this.editorView.set(view);

    if (view === "rich") {
      this.scheduleRichEditorSync();
    }
  }

  applyEditorCommand(
    command:
      | "bold"
      | "italic"
      | "underline"
      | "insertUnorderedList"
      | "insertOrderedList"
      | "blockquote"
      | "removeFormat"
      | "undo"
      | "redo"
      | "paragraph"
      | "heading2"
      | "heading3",
    value?: string
  ): void {
    if (!this.isBrowser || !this.richEditor?.nativeElement) {
      return;
    }

    const editor = this.richEditor.nativeElement;
    editor.focus();

    switch (command) {
      case "paragraph":
        this.document.execCommand("formatBlock", false, "p");
        break;
      case "heading2":
        this.document.execCommand("formatBlock", false, "h2");
        break;
      case "heading3":
        this.document.execCommand("formatBlock", false, "h3");
        break;
      case "blockquote":
        this.document.execCommand("formatBlock", false, "blockquote");
        break;
      default:
        this.document.execCommand(command, false, value);
        break;
    }

    this.onRichEditorInput();
  }

  insertLink(): void {
    if (!this.isBrowser || !this.richEditor?.nativeElement) {
      return;
    }

    const url = this.document.defaultView?.prompt("URL del enlace");
    if (!url) {
      return;
    }

    this.richEditor.nativeElement.focus();
    this.document.execCommand("createLink", false, url.trim());
    this.onRichEditorInput();
  }

  onRichEditorInput(): void {
    if (!this.richEditor?.nativeElement) {
      return;
    }

    const html = this.normalizeEditorHtml(this.richEditor.nativeElement.innerHTML);
    this.draft.update((current) => ({
      ...current,
      content: html,
    }));
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

    const current = this.draft();
    const title = current.title.trim();
    const slug = (current.slug.trim() || this.slugify(title)).trim();
    const shortDescription = current.shortDescription.trim();
    const content = current.content.trim();
    const publishedAtIso = this.normalizePublishedAt(current.publishedAt);

    if (!title || !slug || !shortDescription || !content) {
      this.error.set(
        "Título, slug, descripción corta y contenido son obligatorios."
      );
      return;
    }

    this.saving.set(true);

    const payload: BlogWriteInput = {
      slug,
      title,
      shortDescription,
      content,
      author: (current.author || "TecnoRia").trim(),
      tags: current.tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      image: this.selectedFile() ?? (current.imageUrl || undefined),
      status: current.status,
      publishedAt: current.status === "publish" ? publishedAtIso : null,
      seoTitle: current.seoTitle.trim() || title,
      seoDescription: current.seoDescription.trim() || shortDescription,
    };

    try {
      if (current.id) {
        await this.blog.update(current.id, payload);
        this.success.set("Artículo actualizado correctamente.");
        await this.loadPost(slug);
        if (this.currentIdentifier() !== slug) {
          await this.router.navigate(["/dashboard/blog", slug], {
            replaceUrl: true,
          });
          this.currentIdentifier.set(slug);
        }
      } else {
        await this.blog.create(payload);
        await this.router.navigate(["/dashboard/blog", slug]);
        return;
      }
    } catch {
      this.error.set("No se pudo guardar el artículo.");
    } finally {
      this.saving.set(false);
    }
  }

  private applyApiPost(post: BlogPostRecord): void {
    this.editorMode.set("edit");
    this.sourceSummary.set(
      "Versión gestionada por API. Lo que guardes aquí es exactamente lo que consumen el dashboard editorial y Auctorio."
    );
    this.selectedFile.set(null);
    this.draft.set({
      id: post.id,
      slug: post.slug ?? "",
      title: post.title ?? "",
      shortDescription: post.shortDescription ?? "",
      content: post.content ?? "",
      author: post.author ?? "TecnoRia",
      tagsText: Array.isArray(post.tags) ? post.tags.join(", ") : "",
      imageUrl: typeof post.image === "string" ? post.image : "",
      status: post.status === "publish" ? "publish" : "draft",
      publishedAt: this.toDatetimeLocal(
        post.publishedAt ?? post.updatedAt ?? post.createdAt ?? PUBLISH_DATE
      ),
      seoTitle: post.seoTitle ?? post.title ?? "",
      seoDescription: post.seoDescription ?? post.shortDescription ?? "",
    });
    this.scheduleRichEditorSync();
  }

  private applyStaticArticle(article: ArticleEntry): void {
    this.editorMode.set("seed");
    this.sourceSummary.set(
      "Pieza base del sitio. Al guardarla se crea una versión editable en API con el mismo slug público, delegable también a Auctorio."
    );
    this.selectedFile.set(null);
    this.draft.set({
      slug: article.slug,
      title: article.title,
      shortDescription: article.summary,
      content: this.renderStaticArticleHtml(article),
      author: "TecnoRia",
      tagsText: article.tags?.length ? article.tags.join(", ") : article.category,
      imageUrl: getArticleVisualBySlug(article.slug).src,
      status: "publish",
      publishedAt: this.toDatetimeLocal(article.publishedAt ?? PUBLISH_DATE),
      seoTitle: article.seo.title,
      seoDescription: article.seo.description,
    });
    this.scheduleRichEditorSync();
  }

  private createEmptyDraft(): PostDraft {
    return {
      slug: "",
      title: "",
      shortDescription: "",
      content: "",
      author: "TecnoRia",
      tagsText: "",
      imageUrl: "",
      status: "draft",
      publishedAt: this.toDatetimeLocal(new Date().toISOString()),
      seoTitle: "",
      seoDescription: "",
    };
  }

  private normalizePublishedAt(value: string): string | null {
    if (!value.trim()) {
      return null;
    }

    const normalized = value.includes("T") ? value : `${value}T09:00`;
    const parsed = new Date(normalized);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toISOString();
  }

  private toDatetimeLocal(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return `${PUBLISH_DATE}T09:00`;
    }

    const year = parsed.getFullYear();
    const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
    const day = `${parsed.getDate()}`.padStart(2, "0");
    const hours = `${parsed.getHours()}`.padStart(2, "0");
    const minutes = `${parsed.getMinutes()}`.padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private renderStaticArticleHtml(article: ArticleEntry): string {
    return article.sections
      .map((section) => {
        const paragraphs = section.paragraphs
          .map((paragraph) => `<p>${this.escapeHtml(paragraph)}</p>`)
          .join("\n");
        const bullets = section.bullets?.length
          ? `<ul>\n${section.bullets
              .map((bullet) => `  <li>${this.escapeHtml(bullet)}</li>`)
              .join("\n")}\n</ul>`
          : "";

        return [
          `<section>`,
          `<h2>${this.escapeHtml(section.title)}</h2>`,
          paragraphs,
          bullets,
          `</section>`,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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

  private scheduleRichEditorSync(): void {
    if (!this.isBrowser) {
      return;
    }

    queueMicrotask(() => this.syncRichEditorContent());
  }

  private syncRichEditorContent(): void {
    if (!this.richEditor?.nativeElement) {
      return;
    }

    const editor = this.richEditor.nativeElement;
    const content = this.normalizeEditorHtml(this.draft().content);
    if (editor.innerHTML !== content) {
      editor.innerHTML = content || "<p></p>";
    }
  }

  private syncDraftFromRichEditor(): void {
    if (!this.richEditor?.nativeElement) {
      return;
    }

    const html = this.normalizeEditorHtml(this.richEditor.nativeElement.innerHTML);
    this.draft.update((current) => ({
      ...current,
      content: html,
    }));
  }

  private normalizeEditorHtml(value: string): string {
    const normalized = value
      .replace(/<div><br><\/div>/gi, "")
      .replace(/<p><br><\/p>/gi, "")
      .trim();

    return normalized || "<p></p>";
  }
}
