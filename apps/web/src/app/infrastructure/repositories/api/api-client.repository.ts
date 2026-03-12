import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import {
  ClientRepository, Client, CreateClientPayload, UpdateClientPayload,
  Contact, CreateContactPayload, PaginatedClients,
} from "src/app/domain/repositories/client.repository";
import { API_BASE_URL } from "../../http/api-base-url.token";

@Injectable()
export class ApiClientRepository implements ClientRepository {
  private readonly base: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) base: string
  ) {
    this.base = base.replace(/\/$/, "");
  }

  async list(params: { status?: string; tier?: string; q?: string; page?: number; pageSize?: number } = {}): Promise<PaginatedClients> {
    const qp = new URLSearchParams();
    if (params.status)   qp.set("status", params.status);
    if (params.tier)     qp.set("tier", params.tier);
    if (params.q)        qp.set("q", params.q);
    if (params.page)     qp.set("page", String(params.page));
    if (params.pageSize) qp.set("pageSize", String(params.pageSize));

    const qs = qp.toString() ? `?${qp.toString()}` : "";
    return firstValueFrom(
      this.http.get<PaginatedClients>(`${this.base}/api/v1/clients${qs}`, { withCredentials: true })
    );
  }

  async get(id: string): Promise<Client | null> {
    try {
      return await firstValueFrom(
        this.http.get<Client>(`${this.base}/api/v1/clients/${id}`, { withCredentials: true })
      );
    } catch { return null; }
  }

  async create(data: CreateClientPayload): Promise<Client> {
    return firstValueFrom(
      this.http.post<Client>(`${this.base}/api/v1/clients`, data, { withCredentials: true })
    );
  }

  async update(id: string, data: UpdateClientPayload): Promise<Client> {
    return firstValueFrom(
      this.http.put<Client>(`${this.base}/api/v1/clients/${id}`, data, { withCredentials: true })
    );
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.base}/api/v1/clients/${id}`, { withCredentials: true })
    );
  }

  async getContacts(clientId: string): Promise<Contact[]> {
    return firstValueFrom(
      this.http.get<Contact[]>(`${this.base}/api/v1/clients/${clientId}/contacts`, { withCredentials: true })
    );
  }

  async createContact(clientId: string, data: CreateContactPayload): Promise<Contact> {
    return firstValueFrom(
      this.http.post<Contact>(`${this.base}/api/v1/clients/${clientId}/contacts`, data, { withCredentials: true })
    );
  }
}
