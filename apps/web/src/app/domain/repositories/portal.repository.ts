import { InjectionToken } from "@angular/core";

export type PortalClient = {
  id: string;
  name: string;
  type: string;
  tier: string;
  status: string;
  billing_email: string | null;
  website: string | null;
  city: string | null;
  country: string;
};

export type PortalDashboard = {
  kpis: {
    active_projects: string;
    pending_invoices: string;
    pending_amount: string;
    open_tickets: string;
  };
  activeProjects:  { id: string; name: string; status: string; health: string; deadline?: string; priority: string; type: string }[];
  pendingInvoices: { id: string; number: string; status: string; total: number; due_date?: string; issue_date: string }[];
  openTickets:     { id: string; number: number; title: string; status: string; priority: string; created_at: string }[];
};

export type PortalInvoice = {
  id: string; number: string; status: string; total: number; subtotal: number;
  tax_rate: number; tax_amount: number; due_date?: string; issue_date: string;
  currency: string; notes?: string; paid_at?: string; file_url?: string;
};

export type PortalProject = {
  id: string; name: string; status: string; health: string; deadline?: string;
  priority: string; type: string; start_date?: string; end_date?: string; description?: string;
};

export type PortalTicket = {
  id: string; number: number; title: string; description?: string;
  status: string; priority: string; category: string; created_at: string;
  resolved_at?: string; message_count: number;
};

export type CreatePortalTicketPayload = {
  title: string;
  description?: string | null;
  category?: string;
};

export interface PortalRepository {
  me(): Promise<PortalClient>;
  dashboard(): Promise<PortalDashboard>;
  projects(): Promise<PortalProject[]>;
  invoices(): Promise<PortalInvoice[]>;
  tickets(): Promise<PortalTicket[]>;
  createTicket(data: CreatePortalTicketPayload): Promise<PortalTicket>;
}

export const PORTAL_REPOSITORY = new InjectionToken<PortalRepository>("PORTAL_REPOSITORY");
