import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import {
  InvoiceRepository, Invoice, CreateInvoicePayload, UpdateInvoicePayload,
  InvoiceStats, PaginatedInvoices,
} from "src/app/domain/repositories/invoice.repository";
import { API_BASE_URL } from "../../http/api-base-url.token";

@Injectable()
export class ApiInvoiceRepository implements InvoiceRepository {
  private readonly base: string;

  constructor(private readonly http: HttpClient, @Inject(API_BASE_URL) base: string) {
    this.base = base.replace(/\/$/, "");
  }

  async list(params: { status?: string; client_id?: string; page?: number; pageSize?: number } = {}): Promise<PaginatedInvoices> {
    const qp = new URLSearchParams();
    if (params.status)    qp.set("status", params.status);
    if (params.client_id) qp.set("client_id", params.client_id);
    if (params.page)      qp.set("page", String(params.page));
    if (params.pageSize)  qp.set("pageSize", String(params.pageSize));
    const qs = qp.toString() ? `?${qp.toString()}` : "";
    return firstValueFrom(this.http.get<PaginatedInvoices>(`${this.base}/api/v1/invoices${qs}`, { withCredentials: true }));
  }

  async stats(): Promise<InvoiceStats> {
    return firstValueFrom(this.http.get<InvoiceStats>(`${this.base}/api/v1/invoices/stats`, { withCredentials: true }));
  }

  async get(id: string): Promise<Invoice | null> {
    try {
      return await firstValueFrom(this.http.get<Invoice>(`${this.base}/api/v1/invoices/${id}`, { withCredentials: true }));
    } catch { return null; }
  }

  async create(data: CreateInvoicePayload): Promise<Invoice> {
    return firstValueFrom(this.http.post<Invoice>(`${this.base}/api/v1/invoices`, data, { withCredentials: true }));
  }

  async update(id: string, data: UpdateInvoicePayload): Promise<Invoice> {
    return firstValueFrom(this.http.put<Invoice>(`${this.base}/api/v1/invoices/${id}`, data, { withCredentials: true }));
  }

  async markPaid(id: string, payload: { amount?: number; method?: string; reference?: string; paid_at?: string } = {}): Promise<Invoice> {
    return firstValueFrom(this.http.post<Invoice>(`${this.base}/api/v1/invoices/${id}/mark-paid`, payload, { withCredentials: true }));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/api/v1/invoices/${id}`, { withCredentials: true }));
  }
}
