import { InjectionToken } from "@angular/core";

export type ClientStatus = "active" | "inactive" | "churned";
export type ClientTier = "starter" | "professional" | "enterprise";

export type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  is_primary: boolean;
  notes?: string | null;
  client_id: string;
  company_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  name: string;
  type: "company" | "individual";
  status: ClientStatus;
  tier: ClientTier;
  billing_email?: string | null;
  fiscal_name?: string | null;
  tax_id?: string | null;
  address?: string | null;
  country: string;
  city?: string | null;
  website?: string | null;
  notes?: string | null;
  tags: string[];
  lead_id?: string | null;
  company_id?: string | null;
  active_projects_count?: number;
  contacts?: Contact[];
  projects?: { id: string; name: string; status: string; health: string; deadline?: string; priority: string }[];
  created_at: string;
  updated_at: string;
};

export type CreateClientPayload = Omit<Client, "id" | "lead_id" | "contacts" | "projects" | "active_projects_count" | "created_at" | "updated_at">;
export type UpdateClientPayload = Partial<CreateClientPayload>;

export type CreateContactPayload = {
  first_name: string;
  last_name?: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  is_primary?: boolean;
  notes?: string | null;
  company_id?: string | null;
};

export type PaginatedClients = {
  items: Client[];
  total: number;
  page: number;
  pageSize: number;
};

export interface ClientRepository {
  list(params?: { status?: string; tier?: string; q?: string; page?: number; pageSize?: number }): Promise<PaginatedClients>;
  get(id: string): Promise<Client | null>;
  create(data: CreateClientPayload): Promise<Client>;
  update(id: string, data: UpdateClientPayload): Promise<Client>;
  delete(id: string): Promise<void>;
  getContacts(clientId: string): Promise<Contact[]>;
  createContact(clientId: string, data: CreateContactPayload): Promise<Contact>;
}

export const CLIENT_REPOSITORY = new InjectionToken<ClientRepository>("CLIENT_REPOSITORY");
