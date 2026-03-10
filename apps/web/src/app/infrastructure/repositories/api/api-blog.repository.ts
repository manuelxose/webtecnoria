import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { firstValueFrom } from "rxjs";
import { BlogRepository } from "src/app/domain/repositories/blog.repository";
import { environment } from "src/environments/environment";

type ApiBlogPost = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  content: string;
  image?: string | File;
  tags?: string[];
  author?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
};

type BlogSnapshotDoc = {
  id: string;
  data: () => ApiBlogPost;
};

type BlogSnapshotLike = {
  docs: BlogSnapshotDoc[];
};

@Injectable()
export class ApiBlogRepository implements BlogRepository {
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, "");

  constructor(private readonly http: HttpClient) {}

  list(): Observable<BlogSnapshotLike> {
    return this.http
      .get<{ items: ApiBlogPost[] }>(`${this.baseUrl}/api/v1/blog`)
      .pipe(
        map((response) => ({
          docs: (response.items ?? []).map((item) => ({
            id: item.id,
            data: () => this.normalizePost(item),
          })),
        }))
      );
  }

  async detailBySlug(slug: string): Promise<ApiBlogPost | null> {
    try {
      const post = await firstValueFrom(
        this.http.get<ApiBlogPost>(`${this.baseUrl}/api/v1/blog/${slug}`)
      );
      return this.normalizePost(post);
    } catch {
      return null;
    }
  }

  async create(data: ApiBlogPost): Promise<void> {
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

  async update(id: string, data: ApiBlogPost): Promise<void> {
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

  private normalizePost(post: ApiBlogPost): ApiBlogPost {
    const dateFallback = post.date ?? post.createdAt ?? new Date().toISOString();
    return {
      ...post,
      date: dateFallback,
      tags: Array.isArray(post.tags) ? post.tags : [],
      author: post.author ?? "TecnoRia",
    };
  }
}
