import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";

export type BlogFetchOptions = {
  includeDrafts?: boolean;
};

export type BlogStatus = "draft" | "publish";

export interface BlogPostRecord {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  content?: string;
  image?: string;
  tags: string[];
  author: string;
  status?: BlogStatus;
  publishedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogSnapshotDoc {
  id: string;
  data: () => BlogPostRecord;
}

export interface BlogSnapshotLike {
  docs: BlogSnapshotDoc[];
}

export interface BlogWriteInput {
  slug: string;
  title: string;
  shortDescription: string;
  content: string;
  image?: string | File;
  tags?: string[];
  author: string;
  status?: BlogStatus;
  publishedAt?: string | null;
  seoTitle?: string;
  seoDescription?: string;
}

export interface BlogRepository {
  list(options?: BlogFetchOptions): Observable<BlogSnapshotLike>;
  detailBySlug(
    slug: string,
    options?: BlogFetchOptions
  ): Promise<BlogPostRecord | null>;
  create(data: BlogWriteInput): Promise<void>;
  update(id: string, data: BlogWriteInput): Promise<void>;
  delete(id: string): Promise<void>;
  uploadImage(file: File, name: string): Promise<string>;
}

export const BLOG_REPOSITORY = new InjectionToken<BlogRepository>("BLOG_REPOSITORY");
