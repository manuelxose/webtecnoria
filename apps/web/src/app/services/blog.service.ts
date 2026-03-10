import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { Observable } from "rxjs";
import {
  BLOG_REPOSITORY,
  BlogRepository,
} from "src/app/domain/repositories/blog.repository";
import { BlogI } from "../models/blog";

@Injectable({ providedIn: "root" })
export class BlogService {
  public blog: BlogI = {
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
  };

  constructor(
    @Inject(BLOG_REPOSITORY) private readonly blogRepository: BlogRepository,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Devuelve Observable<QuerySnapshot> (se tipa como `any` aquí)
   * Los componentes actuales esperan un objeto con `.docs`.
   */
  public getAllBlogs(): Observable<any> {
    return this.blogRepository.list();
  }

  public setBlog(blog: BlogI) {
    this.blog = blog;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem("blog", JSON.stringify(this.blog));
    }
  }

  public getBlog() {
    if (isPlatformBrowser(this.platformId)) {
      this.blog = JSON.parse(localStorage.getItem("blog") || "{}");
    }
    return this.blog;
  }

  public async getBlogBySlug(slug: string): Promise<BlogI | null> {
    const found = await this.blogRepository.detailBySlug(slug);
    if (!found) return null;

    this.blog = found as BlogI;
    return this.blog;
  }

  public updateViews() {
    this.blog.views += 1;
    if (this.blog.id) {
      this.blogRepository.update(this.blog.id, this.blog);
    }
  }

  public updateLikes() {
    this.blog.likes += 1;
    if (this.blog.id) {
      this.blogRepository.update(this.blog.id, this.blog);
    }
  }

  public updateComments() {
    this.blog.comments += 1;
    if (this.blog.id) {
      this.blogRepository.update(this.blog.id, this.blog);
    }
  }

  public uploadImageBlog(file: File, name: string) {
    return this.blogRepository.uploadImage(file, name);
  }

  public deleteBlog(blogId: any) {
    const id = typeof blogId === "string" ? blogId : blogId?.id;
    if (!id) return Promise.resolve();
    return this.blogRepository.delete(id);
  }

  public uploadBlog(blog: any) {
    return this.blogRepository
      .create(blog)
      .then(() => this.indexBlogPost(blog.title));
  }

  public updateBlog(blog: any) {
    const id = blog?.id ?? this.blog.id;
    if (!id) return Promise.resolve();
    return this.blogRepository.update(id, blog);
  }

  public async indexBlogPost(_url: string): Promise<any> {
    // Indexing is now handled by backend jobs during API cutover.
    return null;
  }
}
