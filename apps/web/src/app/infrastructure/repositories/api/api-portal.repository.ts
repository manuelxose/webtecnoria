import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import {
  PortalRepository, PortalClient, PortalDashboard, PortalInvoice,
  PortalProject, PortalTicket, CreatePortalTicketPayload,
} from "src/app/domain/repositories/portal.repository";
import { API_BASE_URL } from "../../http/api-base-url.token";

@Injectable()
export class ApiPortalRepository implements PortalRepository {
  private readonly base: string;

  constructor(private readonly http: HttpClient, @Inject(API_BASE_URL) base: string) {
    this.base = base.replace(/\/$/, "");
  }

  async me(): Promise<PortalClient> {
    return firstValueFrom(
      this.http.get<PortalClient>(`${this.base}/api/v1/portal/me`, { withCredentials: true })
    );
  }

  async dashboard(): Promise<PortalDashboard> {
    return firstValueFrom(
      this.http.get<PortalDashboard>(`${this.base}/api/v1/portal/dashboard`, {
        withCredentials: true,
      })
    );
  }

  async projects(): Promise<PortalProject[]> {
    return firstValueFrom(
      this.http.get<PortalProject[]>(`${this.base}/api/v1/portal/projects`, {
        withCredentials: true,
      })
    );
  }

  async invoices(): Promise<PortalInvoice[]> {
    return firstValueFrom(
      this.http.get<PortalInvoice[]>(`${this.base}/api/v1/portal/invoices`, {
        withCredentials: true,
      })
    );
  }

  async tickets(): Promise<PortalTicket[]> {
    return firstValueFrom(
      this.http.get<PortalTicket[]>(`${this.base}/api/v1/portal/tickets`, {
        withCredentials: true,
      })
    );
  }

  async createTicket(data: CreatePortalTicketPayload): Promise<PortalTicket> {
    return firstValueFrom(
      this.http.post<PortalTicket>(`${this.base}/api/v1/portal/tickets`, data, {
        withCredentials: true,
      })
    );
  }
}
