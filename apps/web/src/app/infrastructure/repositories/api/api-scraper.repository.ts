import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { ScraperRepository } from "src/app/domain/repositories/scraper.repository";
import { API_BASE_URL } from "../../http/api-base-url.token";

@Injectable()
export class ApiScraperRepository implements ScraperRepository {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) baseUrl: string
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async createJob(query: string): Promise<any> {
    return firstValueFrom(
      this.http.post(
        `${this.baseUrl}/api/v1/scraper/jobs`,
        { query },
        { withCredentials: true }
      )
    );
  }

  async jobStatus(id: string): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/api/v1/scraper/jobs/${id}`, {
        withCredentials: true,
      })
    );
  }

  async jobResult(id: string): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/api/v1/scraper/jobs/${id}`, {
        withCredentials: true,
      })
    );
  }
}
