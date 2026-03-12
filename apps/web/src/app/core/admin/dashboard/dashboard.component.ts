import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import {
  ANALYTICS_REPOSITORY,
  AnalyticsRepository,
  DashboardData,
} from "src/app/domain/repositories/analytics.repository";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="a-page">
  <!-- Page header -->
  <div class="page-header">
    <div class="page-header-left">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Vista general del negocio</p>
    </div>
    <div class="page-actions">
      <a routerLink="/dashboard/leads/new" class="a-btn a-btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo lead
      </a>
    </div>
  </div>

  <!-- Loading state -->
  @if (loading()) {
    <div class="kpi-grid">
      @for (i of [1,2,3,4,5]; track i) {
        <div class="kpi-card">
          <div class="a-skeleton" style="height:12px;width:80px;margin-bottom:12px"></div>
          <div class="a-skeleton" style="height:32px;width:56px"></div>
        </div>
      }
    </div>
  }

  @if (error()) {
    <div style="padding:24px;background:var(--a-danger-muted);border:1px solid var(--a-danger);border-radius:var(--a-r-md);color:var(--a-danger);font-size:13px;margin-bottom:24px">
      Error cargando el dashboard. Verifica que las migraciones de DB estén aplicadas.
    </div>
  }

  @if (data() && !loading()) {
    <!-- KPIs -->
    <div class="kpi-grid">
      <!-- Leads este mes -->
      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-card-label">Leads este mes</span>
          <svg class="kpi-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>
        <div class="kpi-card-value">{{ data()!.kpis.leadsThisMonth }}</div>
        <div class="kpi-card-footer">
          @if (data()!.kpis.leadsThisMonthDelta !== null) {
            <span class="kpi-delta" [class.positive]="data()!.kpis.leadsThisMonthDelta! > 0" [class.negative]="data()!.kpis.leadsThisMonthDelta! < 0" [class.neutral]="data()!.kpis.leadsThisMonthDelta === 0">
              {{ data()!.kpis.leadsThisMonthDelta! > 0 ? '+' : '' }}{{ data()!.kpis.leadsThisMonthDelta }}%
            </span>
            <span>vs mes anterior</span>
          } @else {
            <span>{{ data()!.kpis.leadsTotal }} en total</span>
          }
          <a routerLink="/dashboard/leads" style="margin-left:auto;color:var(--a-brand);font-size:11px">Ver →</a>
        </div>
      </div>

      <!-- Clientes activos -->
      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-card-label">Clientes activos</span>
          <svg class="kpi-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="kpi-card-value">{{ data()!.kpis.activeClients }}</div>
        <div class="kpi-card-footer">
          <span>clientes con status activo</span>
          <a routerLink="/dashboard/clients" style="margin-left:auto;color:var(--a-brand);font-size:11px">Ver →</a>
        </div>
      </div>

      <!-- Proyectos activos -->
      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-card-label">Proyectos activos</span>
          <svg class="kpi-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="kpi-card-value">{{ data()!.kpis.activeProjects }}</div>
        <div class="kpi-card-footer">
          <span>en curso</span>
          <a routerLink="/dashboard/projects" style="margin-left:auto;color:var(--a-brand);font-size:11px">Ver →</a>
        </div>
      </div>

      <!-- Revenue este mes -->
      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-card-label">Ingresos del mes</span>
          <svg class="kpi-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="kpi-card-value">{{ formatCurrency(data()!.kpis.revenueThisMonth) }}</div>
        <div class="kpi-card-footer">
          @if (data()!.kpis.revenueThisMonthDelta !== null) {
            <span class="kpi-delta" [class.positive]="data()!.kpis.revenueThisMonthDelta! > 0" [class.negative]="data()!.kpis.revenueThisMonthDelta! < 0">
              {{ data()!.kpis.revenueThisMonthDelta! > 0 ? '+' : '' }}{{ data()!.kpis.revenueThisMonthDelta }}%
            </span>
            <span>vs mes anterior</span>
          } @else {
            <span>cobrado este mes</span>
          }
          <a routerLink="/dashboard/finance" style="margin-left:auto;color:var(--a-brand);font-size:11px">Ver →</a>
        </div>
      </div>

      <!-- Pendiente de cobro -->
      <div class="kpi-card" [style.borderColor]="data()!.kpis.overdueInvoicesCount > 0 ? 'var(--a-danger)' : ''">
        <div class="kpi-card-header">
          <span class="kpi-card-label">{{ data()!.kpis.overdueInvoicesCount > 0 ? 'Facturas vencidas' : 'Por cobrar' }}</span>
          <svg class="kpi-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               [style.color]="data()!.kpis.overdueInvoicesCount > 0 ? 'var(--a-danger)' : ''">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="kpi-card-value"
             [style.color]="data()!.kpis.overdueInvoicesCount > 0 ? 'var(--a-danger)' : ''">
          {{ formatCurrency(data()!.kpis.overdueInvoicesCount > 0 ? data()!.kpis.overdueInvoicesAmount : data()!.kpis.pendingInvoicesAmount) }}
        </div>
        <div class="kpi-card-footer">
          @if (data()!.kpis.overdueInvoicesCount > 0) {
            <span style="color:var(--a-danger)">{{ data()!.kpis.overdueInvoicesCount }} vencidas</span>
          } @else {
            <span>{{ data()!.kpis.pendingInvoicesCount }} facturas enviadas</span>
          }
          <a routerLink="/dashboard/finance/invoices" style="margin-left:auto;color:var(--a-brand);font-size:11px">Ver →</a>
        </div>
      </div>
    </div>

    <!-- Content grid -->
    <div class="a-grid-2" style="align-items:start">

      <!-- Lead pipeline mini -->
      <div class="a-card">
        <div class="a-card-header">
          <span class="a-card-title">Pipeline de leads</span>
          <a routerLink="/dashboard/leads" class="a-btn a-btn-ghost a-btn-sm">Ver todo</a>
        </div>
        @if (data()!.leadsByStatus.length === 0) {
          <div class="a-empty" style="padding:32px 16px">
            <div class="a-empty-desc">Aún no hay leads. <a routerLink="/dashboard/leads" style="color:var(--a-brand)">Crear el primero →</a></div>
          </div>
        } @else {
          <div style="display:flex;flex-direction:column;gap:8px">
            @for (s of leadStatusOrder; track s.key) {
              @if (getLeadCount(s.key) > 0 || s.alwaysShow) {
                <div style="display:flex;align-items:center;gap:10px">
                  <span [class]="'a-badge ' + s.badge" style="min-width:90px;justify-content:center">{{ s.label }}</span>
                  <div style="flex:1;background:var(--a-border);border-radius:9999px;height:6px;overflow:hidden">
                    <div [style.width.%]="getLeadPct(s.key)"
                         [style.background]="s.color"
                         style="height:100%;border-radius:9999px;transition:width 0.4s ease"></div>
                  </div>
                  <span style="font-size:13px;font-weight:600;color:var(--a-text);min-width:20px;text-align:right">{{ getLeadCount(s.key) }}</span>
                </div>
              }
            }
          </div>
        }
      </div>

      <!-- Projects health -->
      <div class="a-card">
        <div class="a-card-header">
          <span class="a-card-title">Proyectos recientes</span>
          <a routerLink="/dashboard/projects" class="a-btn a-btn-ghost a-btn-sm">Ver todo</a>
        </div>
        @if (data()!.recentProjects.length === 0) {
          <div class="a-empty" style="padding:32px 16px">
            <div class="a-empty-desc">Sin proyectos aún. <a routerLink="/dashboard/projects/new" style="color:var(--a-brand)">Crear el primero →</a></div>
          </div>
        } @else {
          <div style="display:flex;flex-direction:column;gap:4px">
            @for (p of data()!.recentProjects; track p.id) {
              <a [routerLink]="['/dashboard/projects', p.id]"
                 style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:var(--a-r-sm);text-decoration:none;transition:background var(--a-t-fast)"
                 (mouseenter)="$event.currentTarget.style.background='var(--a-bg-hover)'"
                 (mouseleave)="$event.currentTarget.style.background='transparent'">
                <span class="priority-dot" [class]="p.priority" style="flex-shrink:0"></span>
                <span style="flex:1;font-size:13px;color:var(--a-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ p.name }}</span>
                <span style="font-size:12px;color:var(--a-text-muted);flex-shrink:0">{{ p.client_name }}</span>
                <span [class]="'a-badge ' + healthBadge(p.health)" style="flex-shrink:0">{{ healthLabel(p.health) }}</span>
              </a>
            }
          </div>
        }
      </div>
    </div>

    <!-- Recent leads -->
    @if (data()!.recentLeads.length > 0) {
      <div class="a-card" style="margin-top:16px">
        <div class="a-card-header">
          <span class="a-card-title">Leads recientes</span>
          <a routerLink="/dashboard/leads" class="a-btn a-btn-ghost a-btn-sm">Ver todos</a>
        </div>
        <div class="a-table-wrap" style="border:none;border-radius:0">
          <table class="a-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Empresa</th>
                <th>Fuente</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              @for (lead of data()!.recentLeads; track lead.id) {
                <tr style="cursor:pointer" [routerLink]="['/dashboard/leads', lead.id]">
                  <td>
                    <div style="display:flex;align-items:center;gap:8px">
                      <div class="a-avatar sm">{{ lead.name.slice(0,2).toUpperCase() }}</div>
                      <div>
                        <div style="font-weight:500">{{ lead.name }}</div>
                        <div style="font-size:12px;color:var(--a-text-muted)">{{ lead.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td style="color:var(--a-text-muted)">{{ lead.company_name || '—' }}</td>
                  <td><span class="a-badge a-badge-draft">{{ sourceLabel(lead.source) }}</span></td>
                  <td><span [class]="'a-badge ' + statusBadge(lead.status)">{{ statusLabel(lead.status) }}</span></td>
                  <td style="color:var(--a-text-muted)">{{ formatDate(lead.created_at) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    <!-- Recent invoices -->
    @if (data()!.recentInvoices && data()!.recentInvoices!.length > 0) {
      <div class="a-card" style="margin-top:16px">
        <div class="a-card-header">
          <span class="a-card-title">Facturas recientes</span>
          <a routerLink="/dashboard/finance/invoices" class="a-btn a-btn-ghost a-btn-sm">Ver todas</a>
        </div>
        <div class="a-table-wrap" style="border:none;border-radius:0">
          <table class="a-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Importe</th>
                <th>Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              @for (inv of data()!.recentInvoices!; track inv.id) {
                <tr style="cursor:pointer" [routerLink]="['/dashboard/finance/invoices', inv.id]">
                  <td style="font-weight:500;font-family:monospace">{{ inv.number }}</td>
                  <td style="color:var(--a-text-muted)">{{ inv.client_name }}</td>
                  <td><span [class]="'a-badge ' + invoiceStatusBadge(inv.status)">{{ invoiceStatusLabel(inv.status) }}</span></td>
                  <td style="font-weight:600">{{ formatCurrency(inv.total) }}</td>
                  <td style="color:var(--a-text-muted)">{{ inv.due_date ? formatDate(inv.due_date) : '—' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    <!-- Future features placeholder -->
    <div class="a-grid-3" style="margin-top:16px">
      @for (feat of futureFeatures; track feat.title) {
        <div class="a-card" style="opacity:0.55;border-style:dashed">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span class="a-badge a-badge-accent">Próximamente</span>
          </div>
          <div style="font-size:14px;font-weight:600;color:var(--a-text);margin-bottom:4px">{{ feat.title }}</div>
          <div style="font-size:12.5px;color:var(--a-text-muted)">{{ feat.desc }}</div>
        </div>
      }
    </div>
  }
</div>
  `,
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  error = signal(false);
  data = signal<DashboardData | null>(null);

  readonly leadStatusOrder = [
    { key: "new",         label: "Nuevo",       badge: "a-badge-info",     color: "#3b82f6", alwaysShow: false },
    { key: "contacted",   label: "Contactado",   badge: "a-badge-info",     color: "#60a5fa", alwaysShow: false },
    { key: "qualified",   label: "Cualificado",  badge: "a-badge-pending",  color: "#f59e0b", alwaysShow: false },
    { key: "proposal",    label: "Propuesta",    badge: "a-badge-pending",  color: "#f97316", alwaysShow: false },
    { key: "negotiation", label: "Negociación",  badge: "a-badge-pending",  color: "#8b5cf6", alwaysShow: false },
    { key: "won",         label: "Ganado",       badge: "a-badge-active",   color: "#22c55e", alwaysShow: false },
    { key: "lost",        label: "Perdido",      badge: "a-badge-inactive", color: "#6b7280", alwaysShow: false },
  ];

  readonly futureFeatures = [
    { title: "Lead Scoring IA", desc: "Puntuación automática de leads basada en señales de comportamiento." },
    { title: "Reportes automáticos", desc: "Generación semanal de informes de estado para cada cliente." },
    { title: "Métricas de automatización", desc: "Panel de rendimiento de flujos de automatización activos." },
  ];

  constructor(
    @Inject(ANALYTICS_REPOSITORY) private readonly analytics: AnalyticsRepository
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const d = await this.analytics.dashboard();
      this.data.set(d);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  getLeadCount(status: string): number {
    const found = this.data()?.leadsByStatus.find((s) => s.status === status);
    return found ? Number(found.count) : 0;
  }

  getLeadPct(status: string): number {
    const total = this.data()?.kpis.leadsTotal ?? 0;
    if (!total) return 0;
    return Math.round((this.getLeadCount(status) / total) * 100);
  }

  healthBadge(h: string): string {
    if (h === "on_track") return "a-badge-active";
    if (h === "at_risk")  return "a-badge-pending";
    return "a-badge-danger";
  }

  healthLabel(h: string): string {
    if (h === "on_track")  return "En plazo";
    if (h === "at_risk")   return "En riesgo";
    if (h === "off_track") return "Retrasado";
    return h;
  }

  statusBadge(s: string): string {
    const map: Record<string, string> = {
      new: "a-badge-info", contacted: "a-badge-info",
      qualified: "a-badge-pending", proposal: "a-badge-pending",
      negotiation: "a-badge-pending", won: "a-badge-active", lost: "a-badge-inactive",
    };
    return map[s] ?? "a-badge-draft";
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      new: "Nuevo", contacted: "Contactado", qualified: "Cualificado",
      proposal: "Propuesta", negotiation: "Negociación", won: "Ganado", lost: "Perdido",
    };
    return map[s] ?? s;
  }

  sourceLabel(s: string): string {
    const map: Record<string, string> = {
      web_form: "Web", manual: "Manual", import: "Import",
      referral: "Referral", talkaris: "Talkaris", auctorio: "Auctorio", other: "Otro",
    };
    return map[s] ?? s;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  }

  formatCurrency(amount: number, currency = "EUR"): string {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  }

  invoiceStatusBadge(s: string): string {
    return { draft: "a-badge-draft", sent: "a-badge-info", paid: "a-badge-active", overdue: "a-badge-danger", cancelled: "a-badge-inactive" }[s] ?? "a-badge-draft";
  }

  invoiceStatusLabel(s: string): string {
    return { draft: "Borrador", sent: "Enviada", paid: "Pagada", overdue: "Vencida", cancelled: "Cancelada" }[s] ?? s;
  }
}
