import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { ScraperRepository } from "src/app/domain/repositories/scraper.repository";
import { environment } from "src/environments/environment";

@Injectable()
export class ApiScraperRepository implements ScraperRepository {
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, "");

  constructor(private readonly http: HttpClient) {}

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
