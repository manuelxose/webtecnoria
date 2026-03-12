import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import {
  TicketRepository, Ticket, TicketStats, TicketMessage,
  CreateTicketPayload, UpdateTicketPayload, PaginatedTickets,
} from "src/app/domain/repositories/ticket.repository";
import { API_BASE_URL } from "../../http/api-base-url.token";

@Injectable()
export class ApiTicketRepository implements TicketRepository {
  private readonly base: string;

  constructor(private readonly http: HttpClient, @Inject(API_BASE_URL) base: string) {
    this.base = base.replace(/\/$/, "");
  }

  async stats(): Promise<TicketStats> {
    return firstValueFrom(this.http.get<TicketStats>(`${this.base}/api/v1/tickets/stats`));
  }

  async list(params: { status?: string; priority?: string; client_id?: string; page?: number; pageSize?: number } = {}): Promise<PaginatedTickets> {
    const qp = new URLSearchParams();
    if (params.status)    qp.set("status", params.status);
    if (params.priority)  qp.set("priority", params.priority);
    if (params.client_id) qp.set("client_id", params.client_id);
    if (params.page)      qp.set("page", String(params.page));
    if (params.pageSize)  qp.set("pageSize", String(params.pageSize));
    const qs = qp.toString();
    return firstValueFrom(this.http.get<PaginatedTickets>(`${this.base}/api/v1/tickets${qs ? "?" + qs : ""}`));
  }

  async get(id: string): Promise<Ticket | null> {
    return firstValueFrom(this.http.get<Ticket>(`${this.base}/api/v1/tickets/${id}`));
  }

  async create(data: CreateTicketPayload): Promise<Ticket> {
    return firstValueFrom(this.http.post<Ticket>(`${this.base}/api/v1/tickets`, data));
  }

  async update(id: string, data: UpdateTicketPayload): Promise<Ticket> {
    return firstValueFrom(this.http.put<Ticket>(`${this.base}/api/v1/tickets/${id}`, data));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/api/v1/tickets/${id}`));
  }

  async addMessage(ticketId: string, data: { content: string; author_type?: string; author_name?: string | null; is_internal?: boolean }): Promise<TicketMessage> {
    return firstValueFrom(this.http.post<TicketMessage>(`${this.base}/api/v1/tickets/${ticketId}/messages`, data));
  }
}
