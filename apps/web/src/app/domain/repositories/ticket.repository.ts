import { InjectionToken } from "@angular/core";

export type TicketStatus   = "open" | "in_progress" | "waiting" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketCategory = "general" | "bug" | "feature" | "billing" | "access" | "other";
export type TicketSource   = "manual" | "email" | "portal" | "talkaris" | "other";

export type TicketMessage = {
  id:          string;
  ticket_id:   string;
  author_type: "admin" | "client" | "system";
  author_name: string | null;
  content:     string;
  is_internal: boolean;
  created_at:  string;
};

export type Ticket = {
  id:            string;
  number:        number;
  title:         string;
  description:   string | null;
  status:        TicketStatus;
  priority:      TicketPriority;
  category:      TicketCategory;
  source:        TicketSource;
  client_id:     string;
  client_name?:  string;
  project_id:    string | null;
  project_name?: string | null;
  assigned_to:   string | null;
  assigned_name?: string | null;
  resolved_at:   string | null;
  message_count?: number;
  messages?:     TicketMessage[];
  created_at:    string;
  updated_at:    string;
};

export type TicketStats = {
  open_count:          string;
  new_count:           string;
  urgent_count:        string;
  resolved_count:      string;
  resolved_this_month: string;
};

export type CreateTicketPayload = {
  title:       string;
  description?: string | null;
  status?:     TicketStatus;
  priority?:   TicketPriority;
  category?:   TicketCategory;
  source?:     TicketSource;
  client_id:   string;
  project_id?: string | null;
  assigned_to?: string | null;
};

export type UpdateTicketPayload = Partial<Omit<CreateTicketPayload, "client_id">>;

export type PaginatedTickets = {
  items:    Ticket[];
  total:    number;
  page:     number;
  pageSize: number;
};

export interface TicketRepository {
  stats(): Promise<TicketStats>;
  list(params?: { status?: string; priority?: string; client_id?: string; page?: number; pageSize?: number }): Promise<PaginatedTickets>;
  get(id: string): Promise<Ticket | null>;
  create(data: CreateTicketPayload): Promise<Ticket>;
  update(id: string, data: UpdateTicketPayload): Promise<Ticket>;
  delete(id: string): Promise<void>;
  addMessage(ticketId: string, data: { content: string; author_type?: string; author_name?: string | null; is_internal?: boolean }): Promise<TicketMessage>;
}

export const TICKET_REPOSITORY = new InjectionToken<TicketRepository>("TICKET_REPOSITORY");
