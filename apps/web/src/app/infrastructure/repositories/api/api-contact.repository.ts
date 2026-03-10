import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { ContactRepository } from "src/app/domain/repositories/contact.repository";
import { API_BASE_URL } from "../../http/api-base-url.token";

@Injectable()
export class ApiContactRepository implements ContactRepository {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) baseUrl: string
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async submitLead(data: Record<string, unknown>): Promise<void> {
    await firstValueFrom(this.http.post(`${this.baseUrl}/api/v1/contact`, data));
  }
}
