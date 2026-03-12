import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import {
  ContractRepository, Contract,
  CreateContractPayload, UpdateContractPayload, PaginatedContracts,
} from "src/app/domain/repositories/contract.repository";
import { API_BASE_URL } from "../../http/api-base-url.token";

@Injectable()
export class ApiContractRepository implements ContractRepository {
  private readonly base: string;

  constructor(private readonly http: HttpClient, @Inject(API_BASE_URL) base: string) {
    this.base = base.replace(/\/$/, "");
  }

  async list(params: { status?: string; client_id?: string; page?: number; pageSize?: number } = {}): Promise<PaginatedContracts> {
    const qp = new URLSearchParams();
    if (params.status)    qp.set("status", params.status);
    if (params.client_id) qp.set("client_id", params.client_id);
    if (params.page)      qp.set("page", String(params.page));
    if (params.pageSize)  qp.set("pageSize", String(params.pageSize));
    const qs = qp.toString() ? `?${qp.toString()}` : "";
    return firstValueFrom(this.http.get<PaginatedContracts>(`${this.base}/api/v1/contracts${qs}`, { withCredentials: true }));
  }

  async get(id: string): Promise<Contract | null> {
    try {
      return await firstValueFrom(this.http.get<Contract>(`${this.base}/api/v1/contracts/${id}`, { withCredentials: true }));
    } catch { return null; }
  }

  async create(data: CreateContractPayload): Promise<Contract> {
    return firstValueFrom(this.http.post<Contract>(`${this.base}/api/v1/contracts`, data, { withCredentials: true }));
  }

  async update(id: string, data: UpdateContractPayload): Promise<Contract> {
    return firstValueFrom(this.http.put<Contract>(`${this.base}/api/v1/contracts/${id}`, data, { withCredentials: true }));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/api/v1/contracts/${id}`, { withCredentials: true }));
  }
}
