import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import {
  PortalRepository, PortalClient, PortalDashboard, PortalInvoice,
  PortalProject, PortalTicket, PortalToken, CreatePortalTicketPayload,
} from "src/app/domain/repositories/portal.repository";
import { API_BASE_URL } from "../../http/api-base-url.token";

const PORTAL_TOKEN_KEY = "tecnoria_portal_token";

@Injectable()
export class ApiPortalRepository implements PortalRepository {
  private readonly base: string;

  constructor(private readonly http: HttpClient, @Inject(API_BASE_URL) base: string) {
    this.base = base.replace(/\/$/, "");
  }

  private get token(): string {
    return (typeof window !== "undefined" ? localStorage.getItem(PORTAL_TOKEN_KEY) : "") ?? "";
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.token}` });
  }

  static saveToken(token: string): void {
    if (typeof window !== "undefined") localStorage.setItem(PORTAL_TOKEN_KEY, token);
  }

  static clearToken(): void {
    if (typeof window !== "undefined") localStorage.removeItem(PORTAL_TOKEN_KEY);
  }

  static hasToken(): boolean {
    return typeof window !== "undefined" && !!localStorage.getItem(PORTAL_TOKEN_KEY);
  }

  async me(): Promise<PortalClient> {
    return firstValueFrom(this.http.get<PortalClient>(`${this.base}/api/v1/portal/me`, { headers: this.headers() }));
  }

  async dashboard(): Promise<PortalDashboard> {
    return firstValueFrom(this.http.get<PortalDashboard>(`${this.base}/api/v1/portal/dashboard`, { headers: this.headers() }));
  }

  async projects(): Promise<PortalProject[]> {
    return firstValueFrom(this.http.get<PortalProject[]>(`${this.base}/api/v1/portal/projects`, { headers: this.headers() }));
  }

  async invoices(): Promise<PortalInvoice[]> {
    return firstValueFrom(this.http.get<PortalInvoice[]>(`${this.base}/api/v1/portal/invoices`, { headers: this.headers() }));
  }

  async tickets(): Promise<PortalTicket[]> {
    return firstValueFrom(this.http.get<PortalTicket[]>(`${this.base}/api/v1/portal/tickets`, { headers: this.headers() }));
  }

  async createTicket(data: CreatePortalTicketPayload): Promise<PortalTicket> {
    return firstValueFrom(this.http.post<PortalTicket>(`${this.base}/api/v1/portal/tickets`, data, { headers: this.headers() }));
  }

  async listTokens(clientId: string): Promise<PortalToken[]> {
    return firstValueFrom(this.http.get<PortalToken[]>(`${this.base}/api/v1/portal/admin/tokens/${clientId}`));
  }

  async createToken(clientId: string, data: { label: string; expires_at?: string | null }): Promise<PortalToken> {
    return firstValueFrom(this.http.post<PortalToken>(`${this.base}/api/v1/portal/admin/tokens/${clientId}`, data));
  }

  async revokeToken(tokenId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/api/v1/portal/admin/tokens/${tokenId}`));
  }
}
