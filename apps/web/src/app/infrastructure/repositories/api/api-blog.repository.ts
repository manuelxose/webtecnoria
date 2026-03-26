import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { firstValueFrom } from "rxjs";
import {
  BlogFetchOptions,
  BlogPostRecord,
  BlogRepository,
  BlogSnapshotLike,
  BlogWriteInput,
} from "src/app/domain/repositories/blog.repository";
import { API_BASE_URL } from "../../http/api-base-url.token";

type ApiBlogPost = Partial<BlogPostRecord> & {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  content: string;
  image?: string | File;
  tags?: string[];
  author?: string;
  date?: string;
  status?: string;
  publishedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

@Injectable()
export class ApiBlogRepository implements BlogRepository {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) baseUrl: string
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  list(options?: BlogFetchOptions): Observable<BlogSnapshotLike> {
    const includeDrafts = Boolean(options?.includeDrafts);
    const statusQuery = includeDrafts ? "all" : "publish";

    return this.http
      .get<{ items: ApiBlogPost[] }>(
        `${this.baseUrl}/api/v1/blog?status=${statusQuery}`,
        {
          withCredentials: includeDrafts,
        }
      )
      .pipe(
        map((response) => ({
          docs: (response.items ?? []).map((item) => ({
            id: item.id,
            data: () => this.normalizePost(item),
          })),
        }))
      );
  }

  async detailBySlug(
    slug: string,
    options?: BlogFetchOptions
  ): Promise<BlogPostRecord | null> {
    const includeDrafts = Boolean(options?.includeDrafts);
    const statusQuery = includeDrafts ? "" : "?status=publish";

    try {
      const post = await firstValueFrom(
        this.http.get<ApiBlogPost>(
          `${this.baseUrl}/api/v1/blog/${slug}${statusQuery}`,
          {
            withCredentials: includeDrafts,
          }
        )
      );
      return this.normalizePost(post);
    } catch {
      return null;
    }
  }

  async create(data: BlogWriteInput): Promise<void> {
    const payload = { ...data };

    if (this.isFile(payload.image)) {
      payload.image = await this.uploadImage(payload.image, payload.title);
    }

    await firstValueFrom(
      this.http.post(`${this.baseUrl}/api/v1/blog`, payload, {
        withCredentials: true,
      })
    );
  }

  async update(id: string, data: BlogWriteInput): Promise<void> {
    const payload = { ...data };

    if (this.isFile(payload.image)) {
      payload.image = await this.uploadImage(payload.image, payload.title);
    }

    await firstValueFrom(
      this.http.put(`${this.baseUrl}/api/v1/blog/${id}`, payload, {
        withCredentials: true,
      })
    );
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/api/v1/blog/${id}`, {
        withCredentials: true,
      })
    );
  }

  async uploadImage(file: File, _name: string): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    const uploaded = await firstValueFrom(
      this.http.post<{ url: string }>(
        `${this.baseUrl}/api/v1/blog/upload-image`,
        formData,
        { withCredentials: true }
      )
    );

    const imageUrl = uploaded.url ?? "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    return `${this.baseUrl}${imageUrl}`;
  }

  private isFile(value: unknown): value is File {
    return typeof File !== "undefined" && value instanceof File;
  }

  private normalizePost(post: ApiBlogPost): BlogPostRecord {
    const dateFallback =
      post.publishedAt ?? post.date ?? post.createdAt ?? new Date().toISOString();

    return {
      ...post,
      shortDescription: post.shortDescription ?? "",
      tags: Array.isArray(post.tags) ? post.tags : [],
      author: post.author ?? "TecnoRia",
      status: post.status === "publish" ? "publish" : "draft",
      publishedAt: post.publishedAt ?? dateFallback,
      seoTitle: post.seoTitle ?? null,
      seoDescription: post.seoDescription ?? null,
      createdAt: post.createdAt ?? dateFallback,
      updatedAt: post.updatedAt ?? dateFallback,
    };
  }
}
