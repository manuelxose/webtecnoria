import { InjectionToken } from "@angular/core";

export type InvoiceStatus = "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order: number;
  invoice_id: string;
  created_at: string;
};

export type Invoice = {
  id: string;
  number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date?: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  notes?: string | null;
  paid_at?: string | null;
  client_id: string;
  client_name?: string;
  project_id?: string | null;
  project_name?: string | null;
  contract_id?: string | null;
  items?: InvoiceItem[];
  created_at: string;
  updated_at: string;
};

export type CreateInvoiceItem = {
  description: string;
  quantity: number;
  unit_price: number;
  sort_order?: number;
};

export type CreateInvoicePayload = {
  status?: InvoiceStatus;
  issue_date?: string;
  due_date?: string | null;
  tax_rate?: number;
  currency?: string;
  notes?: string | null;
  client_id: string;
  project_id?: string | null;
  contract_id?: string | null;
  items: CreateInvoiceItem[];
};

export type UpdateInvoicePayload = {
  status?: InvoiceStatus;
  issue_date?: string;
  due_date?: string | null;
  tax_rate?: number;
  currency?: string;
  notes?: string | null;
  project_id?: string | null;
  contract_id?: string | null;
};

export type InvoiceStats = {
  byStatus: { status: string; count: string; amount: string }[];
  monthlyRevenue: { month: string; revenue: string }[];
  overdue: { count: string; amount: string };
};

export type PaginatedInvoices = {
  items: Invoice[];
  total: number;
  page: number;
  pageSize: number;
};

export interface InvoiceRepository {
  list(params?: { status?: string; client_id?: string; page?: number; pageSize?: number }): Promise<PaginatedInvoices>;
  stats(): Promise<InvoiceStats>;
  get(id: string): Promise<Invoice | null>;
  create(data: CreateInvoicePayload): Promise<Invoice>;
  update(id: string, data: UpdateInvoicePayload): Promise<Invoice>;
  markPaid(id: string, payload?: { amount?: number; method?: string; reference?: string; paid_at?: string }): Promise<Invoice>;
  delete(id: string): Promise<void>;
}

export const INVOICE_REPOSITORY = new InjectionToken<InvoiceRepository>("INVOICE_REPOSITORY");
