import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import {
  INVOICE_REPOSITORY,
  InvoiceRepository,
  InvoiceStats,
} from "src/app/domain/repositories/invoice.repository";

@Component({
  selector: "app-finance-overview",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="a-page">
  <div class="page-header">
    <div class="page-header-left">
      <h1 class="page-title">Finanzas</h1>
      <p class="page-subtitle">Contratos, facturas y pagos</p>
    </div>
    <div class="page-actions">
      <a routerLink="/dashboard/finance/invoices/new" class="a-btn a-btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nueva factura
      </a>
      <a routerLink="/dashboard/finance/contracts/new" class="a-btn a-btn-secondary">Nuevo contrato</a>
    </div>
  </div>

  @if (loading()) {
    <div style="display:flex;align-items:center;gap:10px;color:var(--a-text-muted);padding:40px 0">
      <span class="a-spinner"></span>
    </div>
  }

  @if (!loading() && stats()) {
    <!-- KPI grid -->
    <div class="kpi-grid" style="margin-bottom:28px">

      <!-- Revenue total cobrado -->
      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-card-label">Total cobrado</span>
          <svg class="kpi-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="kpi-card-value">{{ formatCurrency(paidTotal()) }}</div>
        <div class="kpi-card-footer">
          <span>{{ paidCount() }} facturas pagadas</span>
        </div>
      </div>

      <!-- Pendiente de cobro -->
      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-card-label">Pendiente de cobro</span>
          <svg class="kpi-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="kpi-card-value">{{ formatCurrency(pendingTotal()) }}</div>
        <div class="kpi-card-footer">
          <span>{{ pendingCount() }} facturas enviadas</span>
        </div>
      </div>

      <!-- Vencidas -->
      <div class="kpi-card" [style.borderColor]="overdueTotal() > 0 ? 'var(--a-danger)' : ''">
        <div class="kpi-card-header">
          <span class="kpi-card-label">Vencidas</span>
          <svg class="kpi-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [style.color]="overdueTotal() > 0 ? 'var(--a-danger)' : ''">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="kpi-card-value" [style.color]="overdueTotal() > 0 ? 'var(--a-danger)' : ''">
          {{ formatCurrency(overdueTotal()) }}
        </div>
        <div class="kpi-card-footer">
          <span [style.color]="overdueTotal() > 0 ? 'var(--a-danger)' : ''">{{ overdueCount() }} facturas vencidas</span>
        </div>
      </div>

      <!-- Borradores -->
      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-card-label">En borrador</span>
          <svg class="kpi-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="kpi-card-value">{{ draftCount() }}</div>
        <div class="kpi-card-footer">
          <span>sin enviar</span>
          <a routerLink="/dashboard/finance/invoices" [queryParams]="{status:'draft'}" style="margin-left:auto;color:var(--a-brand);font-size:11px">Ver →</a>
        </div>
      </div>
    </div>

    <!-- Revenue por mes -->
    @if (stats()!.monthlyRevenue.length > 0) {
      <div class="a-card" style="margin-bottom:16px">
        <div class="a-card-header">
          <span class="a-card-title">Ingresos últimos 6 meses</span>
        </div>
        <div style="display:flex;align-items:flex-end;gap:8px;height:80px;padding:4px 0">
          @for (m of stats()!.monthlyRevenue; track m.month) {
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
              <div style="font-size:10px;color:var(--a-text-muted)">{{ formatCurrency(+m.revenue, true) }}</div>
              <div
                [style.height.%]="barPct(+m.revenue)"
                style="width:100%;background:var(--a-brand);border-radius:3px 3px 0 0;min-height:4px;transition:height 0.4s ease">
              </div>
              <div style="font-size:10px;color:var(--a-text-subtle)">{{ monthLabel(m.month) }}</div>
            </div>
          }
        </div>
      </div>
    }

    <!-- Quick links -->
    <div class="a-grid-2">
      <div class="a-card">
        <div class="a-card-header">
          <span class="a-card-title">Contratos</span>
          <a routerLink="/dashboard/finance/contracts" class="a-btn a-btn-ghost a-btn-sm">Ver todos</a>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          @for (s of contractStatusItems; track s.label) {
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span [class]="'a-badge ' + s.badge">{{ s.label }}</span>
              <a [routerLink]="['/dashboard/finance/contracts']"
                 style="font-size:13px;font-weight:600;color:var(--a-text);text-decoration:none">—</a>
            </div>
          }
        </div>
      </div>
      <div class="a-card">
        <div class="a-card-header">
          <span class="a-card-title">Estado de facturas</span>
          <a routerLink="/dashboard/finance/invoices" class="a-btn a-btn-ghost a-btn-sm">Ver todas</a>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          @for (row of stats()!.byStatus; track row.status) {
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span [class]="'a-badge ' + invoiceStatusBadge(row.status)">{{ invoiceStatusLabel(row.status) }}</span>
              <div style="display:flex;align-items:center;gap:12px">
                <span style="font-size:12px;color:var(--a-text-muted)">{{ row.count }}</span>
                <span style="font-size:13px;font-weight:600;color:var(--a-text)">{{ formatCurrency(+row.amount) }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  }
</div>
  `,
})
export class FinanceOverviewComponent implements OnInit {
  loading = signal(true);
  stats = signal<InvoiceStats | null>(null);

  readonly contractStatusItems = [
    { label: "Borrador",  badge: "a-badge-draft" },
    { label: "Enviado",   badge: "a-badge-info" },
    { label: "Firmado",   badge: "a-badge-active" },
    { label: "Cancelado", badge: "a-badge-inactive" },
  ];

  constructor(
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepo: InvoiceRepository
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.stats.set(await this.invoiceRepo.stats());
    } catch { /* silent — tables may not exist yet */ }
    finally { this.loading.set(false); }
  }

  paidTotal():    number { return this.amountForStatus("paid"); }
  paidCount():    number { return this.countForStatus("paid"); }
  pendingTotal(): number { return this.amountForStatus("sent") + this.amountForStatus("viewed"); }
  pendingCount(): number { return this.countForStatus("sent") + this.countForStatus("viewed"); }
  overdueTotal(): number { return Number(this.stats()?.overdue?.amount ?? 0); }
  overdueCount(): number { return Number(this.stats()?.overdue?.count ?? 0); }
  draftCount():   number { return this.countForStatus("draft"); }

  maxRevenue(): number {
    const vals = (this.stats()?.monthlyRevenue ?? []).map((m) => +m.revenue);
    return Math.max(...vals, 1);
  }

  barPct(v: number): number { return Math.round((v / this.maxRevenue()) * 100); }

  monthLabel(iso: string): string {
    return new Date(iso).toLocaleDateString("es-ES", { month: "short" });
  }

  formatCurrency(v: number, compact = false): string {
    if (compact && v >= 1000) return `${(v / 1000).toFixed(1)}k€`;
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
  }

  invoiceStatusBadge(s: string): string {
    const map: Record<string, string> = {
      draft: "a-badge-draft", sent: "a-badge-info", viewed: "a-badge-info",
      paid: "a-badge-active", overdue: "a-badge-danger", cancelled: "a-badge-inactive",
    };
    return map[s] ?? "a-badge-draft";
  }

  invoiceStatusLabel(s: string): string {
    const map: Record<string, string> = {
      draft: "Borrador", sent: "Enviada", viewed: "Vista",
      paid: "Pagada", overdue: "Vencida", cancelled: "Cancelada",
    };
    return map[s] ?? s;
  }

  private amountForStatus(status: string): number {
    const row = this.stats()?.byStatus.find((r) => r.status === status);
    return row ? +row.amount : 0;
  }

  private countForStatus(status: string): number {
    const row = this.stats()?.byStatus.find((r) => r.status === status);
    return row ? +row.count : 0;
  }
}
