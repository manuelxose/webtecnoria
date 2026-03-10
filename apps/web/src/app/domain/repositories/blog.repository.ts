import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";

export interface BlogRepository {
  list(): Observable<any>;
  detailBySlug(slug: string): Promise<any>;
  create(data: any): Promise<void>;
  update(id: string, data: any): Promise<void>;
  delete(id: string): Promise<void>;
  uploadImage(file: File, name: string): Promise<any>;
}

export const BLOG_REPOSITORY = new InjectionToken<BlogRepository>("BLOG_REPOSITORY");
