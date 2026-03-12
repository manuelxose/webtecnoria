import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import {
  LeadRepository, Lead, CreateLeadPayload, UpdateLeadPayload,
  LeadStats, PaginatedLeads,
} from "src/app/domain/repositories/lead.repository";
import { API_BASE_URL } from "../../http/api-base-url.token";

@Injectable()
export class ApiLeadRepository implements LeadRepository {
  private readonly base: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) base: string
  ) {
    this.base = base.replace(/\/$/, "");
  }

  async list(params: { status?: string; source?: string; page?: number; pageSize?: number } = {}): Promise<PaginatedLeads> {
    const qp = new URLSearchParams();
    if (params.status)   qp.set("status", params.status);
    if (params.source)   qp.set("source", params.source);
    if (params.page)     qp.set("page", String(params.page));
    if (params.pageSize) qp.set("pageSize", String(params.pageSize));

    const qs = qp.toString() ? `?${qp.toString()}` : "";
    return firstValueFrom(
      this.http.get<PaginatedLeads>(`${this.base}/api/v1/leads${qs}`, { withCredentials: true })
    );
  }

  async stats(): Promise<LeadStats> {
    return firstValueFrom(
      this.http.get<LeadStats>(`${this.base}/api/v1/leads/stats`, { withCredentials: true })
    );
  }

  async get(id: string): Promise<Lead | null> {
    try {
      return await firstValueFrom(
        this.http.get<Lead>(`${this.base}/api/v1/leads/${id}`, { withCredentials: true })
      );
    } catch { return null; }
  }

  async create(data: CreateLeadPayload): Promise<Lead> {
    return firstValueFrom(
      this.http.post<Lead>(`${this.base}/api/v1/leads`, data, { withCredentials: true })
    );
  }

  async update(id: string, data: UpdateLeadPayload): Promise<Lead> {
    return firstValueFrom(
      this.http.put<Lead>(`${this.base}/api/v1/leads/${id}`, data, { withCredentials: true })
    );
  }

  async convert(id: string): Promise<{ id: string }> {
    return firstValueFrom(
      this.http.post<{ id: string }>(`${this.base}/api/v1/leads/${id}/convert`, {}, { withCredentials: true })
    );
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.base}/api/v1/leads/${id}`, { withCredentials: true })
    );
  }
}
