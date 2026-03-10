import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Meta } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { BlogI } from "src/app/models/blog";
import { BrowserDomAdapter } from "src/app/core/platform/browser-dom-adapter.service";
import { BlogService } from "src/app/services/blog.service";
import { ScrollToDirective as ngxScrollTo } from "src/app/shared/scroll-to.directive";
import { FormBottomComponent } from "src/app/shared/form-bottom/form-bottom.component";

@Component({
  selector: "app-blog-detail",
  templateUrl: "./blog-detail.component.html",
  styleUrls: ["./blog-detail.component.css"],
  standalone: true,
  imports: [
    CommonModule,ngxScrollTo, FormBottomComponent],
})
export class BlogDetailComponent {
  Menuoption = "center";
  Settingicon = true;
  alt: string;

  blog: BlogI = {
    id: "",
    title: "",
    description: "",
    image: "",
    date: "",
    shortDescription: "",
    comments: 0,
    likes: 0,
    views: 0,
    tags: "",
    author: "",
    content: [],
    faqs: [],
    keywords: [],
  };

  headers: any;
  html: any;

  constructor(
    private svcBlog: BlogService,
    private meta: Meta,
    private route: ActivatedRoute,
    private readonly dom: BrowserDomAdapter
  ) {
    this.meta.addTags([
      { name: "description", content: this.blog.shortDescription },
      { name: "keywords", content: this.blog.keywords.join(",") },
    ]);
  }

  async ngOnInit(): Promise<void> {
    const slug = this.route.snapshot.paramMap.get("slug");
    if (slug) {
      const fromRepository = await this.svcBlog.getBlogBySlug(slug);
      this.blog = fromRepository ?? this.svcBlog.getBlog();
    } else {
      this.blog = this.svcBlog.getBlog();
    }

    this.alt = (this.blog.title || "").replace(/\s/g, "-");

    if (!this.dom.isBrowser) return;

    const parser = new DOMParser();
    this.html = parser.parseFromString(String(this.blog.content || ""), "text/html");
    this.headers = this.html.querySelectorAll("h1, h2");

    this.headers.forEach((header: Element, index: number) => {
      header.setAttribute("id", "header-" + (index + 1));
      header.setAttribute("class", "header");
      header.setAttribute(
        "style",
        "font-size: 2.2rem; font-weight: 500; line-height: 1.2; margin-bottom: 1.66666em;"
      );
    });
  }

  ngAfterViewInit() {
    if (!this.dom.isBrowser) return;

    const contenido = this.dom.getElementById("blog-content");
    if (!contenido) return;

    const titulos = contenido.querySelectorAll("h1, h2");
    const spanh3 = contenido.querySelectorAll("h1>strong>span>span,h2>strong>span>span");
    spanh3.forEach((span) => {
      span.setAttribute("class", "title text-dark title-dark  h3");
      span.setAttribute(
        "style",
        "font-size: 2.2rem; font-weight: 500; line-height: 1.2; margin-bottom: 1.66666em!important;"
      );
    });

    const p = contenido.querySelectorAll("p");
    p.forEach((paragraph) => {
      paragraph.setAttribute("class", "text-muted");
      paragraph.setAttribute(
        "style",
        "font-size: 1.25rem; font-weight: 400; line-height: 1.5; margin-bottom: 1.66666666em;"
      );
    });

    contenido.querySelectorAll("h3>strong>span>span").forEach((span) => {
      span.setAttribute("class", "title text-dark title-dark h5");
      span.setAttribute(
        "style",
        "font-size: 1.25rem; font-weight: 500; line-height: 1.2; margin-bottom: 1.666666em;"
      );
    });

    contenido.querySelectorAll("ol").forEach((ol) => {
      ol.setAttribute("class", "title text-dark title-dark h5");
      ol.setAttribute(
        "style",
        "font-size: 1.25rem; font-weight: 500; line-height: 1.2; margin-bottom: 1.666666em;"
      );
    });

    contenido.querySelectorAll("ol>li>p>span>span").forEach((li) => {
      li.setAttribute("class", "title text-dark title-dark mb-0 h5");
      li.setAttribute(
        "style",
        "font-size: 1.25rem; font-weight: 500; line-height: 1.5; margin-bottom: 1.66666666em;"
      );
    });

    titulos.forEach((titulo, index) => {
      titulo.setAttribute("id", `header-${index + 1}`);
      titulo.setAttribute("class", "header");
      titulo.setAttribute(
        "style",
        "font-size: 2.2rem; font-weight: 500; line-height: 1.2; margin-bottom: 1.66666em;"
      );
    });
  }
}
