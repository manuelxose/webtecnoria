import { Component } from "@angular/core";
import { BlogI } from "src/app/models/blog";
import { BlogService } from "src/app/services/blog.service";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormBottomComponent } from "src/app/shared/form-bottom/form-bottom.component";
import { FeatherModule } from "angular-feather";
import { NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxPaginationModule } from "ngx-pagination";
import { ScrollToDirective as ngxScrollTo } from "src/app/shared/scroll-to.directive";

@Component({
  selector: "app-mainblog",
  templateUrl: "./blog.component.html",
  styleUrls: ["./blog.component.css"],
  standalone: true,
  imports: [
    CommonModule,
    FormBottomComponent,
    FeatherModule,
    NgbPaginationModule,
    NgxPaginationModule,
    ngxScrollTo,
  ],
})
export class MainBlogComponent {
  Menuoption = "center";
  Settingicon = true;
  /**
   * Nav Light Class Add
   */
  filterredImages;
  galleryFilter = "all";

  public allContent: BlogI[] = [
    {
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
    },
  ];

  constructor(private svcBlog: BlogService, private router: Router) {}

  ngOnInit(): void {
    this.svcBlog.getAllBlogs().subscribe((data) => {
      this.allContent = data.docs.map((e) => {
        return {
          id: e.id,
          title: e.data().title,
          description: e.data().description,
          image: e.data().image,
          date: e.data().date,
          shortDescription: e.data().shortDescription,
          comments: e.data().comments,
          likes: e.data().likes,
          views: e.data().views,
          tags: e.data().tags,
          author: e.data().author,
          content: e.data().content,
          faqs: e.data().faqs,
          keywords: e.data().keywords,
        } as BlogI;
      });

      this.filterredImages = this.allContent;

      console.log(this.allContent);
    });
  }

  /**
   * Filtering All Record Get
   */
  public setBlog(blog: BlogI) {
    this.svcBlog.setBlog(blog);
    blog.title = blog.title.replace(/\s/g, "-");
    blog.title = blog.title.toLowerCase();
    //los elementos que tengan tilde se reemplazan por su equivalente sin tilde
    blog.title = blog.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    //elimina los caracteres especiales menos los guiones
    blog.title = blog.title.replace(/[^a-zA-Z0-9-]/g, "");
    this.router.navigate(["/blog", blog.title.replace(/\s/g, "-")]);
  }

  activeCategory(category) {
    console.log(category);

    this.galleryFilter = category;

    if (this.galleryFilter === "all") {
      this.filterredImages = this.allContent;
    } else {
      this.filterredImages = this.allContent.filter(
        (x) => x.tags.toLowerCase() === category.toLowerCase()
      );
    }
  }

  //paginacion

  page = 1;
  pageSize = 6;

  get allContentPaginate(): BlogI[] {
    return this.filterredImages
      .map((allContent, i) => ({ id: i + 1, ...allContent }))
      .slice(
        (this.page - 1) * this.pageSize,
        (this.page - 1) * this.pageSize + this.pageSize
      );
  }
}
