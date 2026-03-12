import { InjectionToken } from "@angular/core";

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
export type LeadSource = "web_form" | "manual" | "import" | "referral" | "talkaris" | "auctorio" | "other";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company_name?: string | null;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  notes?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  assigned_to?: string | null;
  assigned_name?: string | null;
  converted_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateLeadPayload = Omit<Lead, "id" | "assigned_name" | "converted_at" | "created_at" | "updated_at">;
export type UpdateLeadPayload = Partial<CreateLeadPayload>;

export type LeadStats = {
  byStatus: { status: LeadStatus; count: string }[];
  bySource: { source: LeadSource; count: string }[];
};

export type PaginatedLeads = {
  items: Lead[];
  total: number;
  page: number;
  pageSize: number;
};

export interface LeadRepository {
  list(params?: { status?: string; source?: string; page?: number; pageSize?: number }): Promise<PaginatedLeads>;
  stats(): Promise<LeadStats>;
  get(id: string): Promise<Lead | null>;
  create(data: CreateLeadPayload): Promise<Lead>;
  update(id: string, data: UpdateLeadPayload): Promise<Lead>;
  convert(id: string): Promise<{ id: string }>;
  delete(id: string): Promise<void>;
}

export const LEAD_REPOSITORY = new InjectionToken<LeadRepository>("LEAD_REPOSITORY");
