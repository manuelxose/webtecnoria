import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { ContactRepository } from "src/app/domain/repositories/contact.repository";
import { environment } from "src/environments/environment";

@Injectable()
export class ApiContactRepository implements ContactRepository {
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, "");

  constructor(private readonly http: HttpClient) {}

  async submitLead(data: Record<string, unknown>): Promise<void> {
    await firstValueFrom(this.http.post(`${this.baseUrl}/api/v1/contact`, data));
  }
}
