import { InjectionToken } from "@angular/core";

export type DashboardData = {
  kpis: {
    leadsThisMonth: number;
    leadsThisMonthDelta: number | null;
    leadsTotal: number;
    activeClients: number;
    activeProjects: number;
    revenueThisMonth: number;
    revenueThisMonthDelta: number | null;
    pendingInvoicesCount: number;
    pendingInvoicesAmount: number;
    overdueInvoicesCount: number;
    overdueInvoicesAmount: number;
  };
  projectsByStatus: { status: string; count: string }[];
  leadsByStatus: { status: string; count: string }[];
  recentLeads: {
    id: string; name: string; email: string;
    company_name?: string; status: string; source: string; created_at: string;
  }[];
  recentProjects: {
    id: string; name: string; status: string; health: string;
    deadline?: string; priority: string; client_name: string;
  }[];
  recentInvoices?: {
    id: string; number: string; status: string; total: number;
    due_date?: string; issue_date: string; client_name: string;
  }[];
};

export type AdvancedAnalytics = {
  monthlyRevenue: { month: string; revenue: number }[];
  leadsFunnel: { status: string; count: number }[];
  projectsByType: { type: string; count: number }[];
  topClients: { id: string; name: string; totalRevenue: number; projectCount: number; ticketCount: number }[];
  ticketStats: { open: number; in_progress: number; resolved_this_month: number; avg_resolution_days: number | null };
  invoicesByStatus: { status: string; count: number; total: number }[];
};

export interface AnalyticsRepository {
  dashboard(): Promise<DashboardData>;
  advanced(): Promise<AdvancedAnalytics>;
}

export const ANALYTICS_REPOSITORY = new InjectionToken<AnalyticsRepository>("ANALYTICS_REPOSITORY");
