import { InjectionToken } from "@angular/core";

export type ContractStatus = "draft" | "sent" | "signed" | "cancelled";

export type Contract = {
  id: string;
  title: string;
  status: ContractStatus;
  amount: number;
  currency: string;
  start_date?: string | null;
  end_date?: string | null;
  signed_at?: string | null;
  file_url?: string | null;
  notes?: string | null;
  client_id: string;
  client_name?: string;
  project_id?: string | null;
  project_name?: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateContractPayload = Omit<Contract, "id" | "client_name" | "project_name" | "created_at" | "updated_at">;
export type UpdateContractPayload = Partial<Omit<CreateContractPayload, "client_id">>;

export type PaginatedContracts = {
  items: Contract[];
  total: number;
  page: number;
  pageSize: number;
};

export interface ContractRepository {
  list(params?: { status?: string; client_id?: string; page?: number; pageSize?: number }): Promise<PaginatedContracts>;
  get(id: string): Promise<Contract | null>;
  create(data: CreateContractPayload): Promise<Contract>;
  update(id: string, data: UpdateContractPayload): Promise<Contract>;
  delete(id: string): Promise<void>;
}

export const CONTRACT_REPOSITORY = new InjectionToken<ContractRepository>("CONTRACT_REPOSITORY");
