import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  INVOICE_REPOSITORY,
  InvoiceRepository,
  Invoice,
} from "src/app/domain/repositories/invoice.repository";

@Component({
  selector: "app-invoices-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  <div class="page-header">
    <div class="page-header-left">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <a routerLink="/dashboard/finance" style="color:var(--a-text-muted);font-size:13px;text-decoration:none">Finanzas</a>
        <span style="color:var(--a-text-subtle)">/</span>
        <span style="font-size:13px">Facturas</span>
      </div>
      <h1 class="page-title">Facturas</h1>
      <p class="page-subtitle">{{ total() }} facturas en total</p>
    </div>
    <div class="page-actions">
      <a routerLink="/dashboard/finance/invoices/new" class="a-btn a-btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nueva factura
      </a>
    </div>
  </div>

  <!-- Filters -->
  <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">
    @for (f of statusFilters; track f.value) {
      <button class="a-btn" style="height:28px;font-size:12px"
        [class.a-btn-secondary]="filterStatus() !== f.value"
        [class.a-btn-primary]="filterStatus() === f.value"
        (click)="setFilter(f.value)">
        {{ f.label }}
      </button>
    }
  </div>

  @if (loading()) {
    <div style="display:flex;align-items:center;gap:10px;color:var(--a-text-muted);padding:40px 0">
      <span class="a-spinner"></span>
    </div>
  }

  @if (!loading()) {
    @if (invoices().length === 0) {
      <div class="a-empty">
        <svg class="a-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/>
          <line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/>
        </svg>
        <div class="a-empty-title">Sin facturas</div>
        <div class="a-empty-desc">Crea la primera factura para un cliente.</div>
        <a routerLink="/dashboard/finance/invoices/new" class="a-btn a-btn-primary" style="margin-top:8px">Nueva factura</a>
      </div>
    } @else {
      <div class="a-table-wrap">
        <table class="a-table">
          <thead>
            <tr>
              <th>Nº Factura</th>
              <th>Cliente</th>
              <th>Fecha emisión</th>
              <th>Vencimiento</th>
              <th>Importe</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (inv of invoices(); track inv.id) {
              <tr [class.overdue-row]="isOverdue(inv)">
                <td>
                  <a [routerLink]="['/dashboard/finance/invoices', inv.id]" style="color:var(--a-brand);font-weight:600;text-decoration:none;font-family:var(--a-font-mono);font-size:13px">
                    {{ inv.number }}
                  </a>
                </td>
                <td style="color:var(--a-text-muted)">{{ inv.client_name }}</td>
                <td style="color:var(--a-text-muted)">{{ formatDate(inv.issue_date) }}</td>
                <td [style.color]="isOverdue(inv) ? 'var(--a-danger)' : 'var(--a-text-muted)'">
                  {{ inv.due_date ? formatDate(inv.due_date) : '—' }}
                  @if (isOverdue(inv)) { <span style="font-size:10px"> ⚠</span> }
                </td>
                <td style="font-weight:700;font-size:14px">{{ formatCurrency(inv.total, inv.currency) }}</td>
                <td><span [class]="'a-badge ' + statusBadge(inv.status)">{{ statusLabel(inv.status) }}</span></td>
                <td>
                  <div class="row-actions">
                    <a [routerLink]="['/dashboard/finance/invoices', inv.id]" class="a-btn a-btn-ghost a-btn-sm">Ver</a>
                    @if (inv.status !== 'paid' && inv.status !== 'cancelled') {
                      <button class="a-btn a-btn-primary a-btn-sm" (click)="quickMarkPaid(inv)" title="Marcar pagada">✓ Cobrada</button>
                    }
                    <button class="a-btn a-btn-ghost a-btn-sm a-btn-icon" (click)="deleteInvoice(inv)" style="color:var(--a-danger)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Total row -->
      <div style="display:flex;justify-content:flex-end;padding:12px 14px;font-size:13px;color:var(--a-text-muted)">
        Total mostrado:
        <strong style="color:var(--a-text);margin-left:8px">{{ formatCurrency(totalAmount()) }}</strong>
      </div>
    }
  }
</div>
  `,
  styles: [`
    .overdue-row td { background: rgba(239,68,68,0.04); }
  `],
})
export class InvoicesListComponent implements OnInit {
  invoices = signal<Invoice[]>([]);
  total = signal(0);
  loading = signal(true);
  filterStatus = signal("all");

  readonly statusFilters = [
    { value: "all",       label: "Todas" },
    { value: "draft",     label: "Borrador" },
    { value: "sent",      label: "Enviadas" },
    { value: "viewed",    label: "Vistas" },
    { value: "paid",      label: "Pagadas" },
    { value: "overdue",   label: "Vencidas" },
    { value: "cancelled", label: "Canceladas" },
  ];

  constructor(@Inject(INVOICE_REPOSITORY) private readonly invoiceRepo: InvoiceRepository) {}

  async ngOnInit(): Promise<void> { await this.load(); }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.invoiceRepo.list({
        status: this.filterStatus() !== "all" ? this.filterStatus() : undefined,
        pageSize: 100,
      });
      this.invoices.set(result.items);
      this.total.set(result.total);
    } catch { /* silent */ }
    finally { this.loading.set(false); }
  }

  async setFilter(v: string): Promise<void> {
    this.filterStatus.set(v);
    await this.load();
  }

  async quickMarkPaid(inv: Invoice): Promise<void> {
    if (!confirm(`¿Marcar la factura ${inv.number} como cobrada?`)) return;
    try {
      await this.invoiceRepo.markPaid(inv.id);
      await this.load();
    } catch { /* silent */ }
  }

  async deleteInvoice(inv: Invoice): Promise<void> {
    if (!confirm(`¿Eliminar la factura ${inv.number}?`)) return;
    try { await this.invoiceRepo.delete(inv.id); await this.load(); } catch { /* silent */ }
  }

  isOverdue(inv: Invoice): boolean {
    return !!(inv.due_date && inv.status !== "paid" && inv.status !== "cancelled"
      && new Date(inv.due_date) < new Date());
  }

  totalAmount(): number {
    return this.invoices().reduce((sum, i) => sum + Number(i.total), 0);
  }

  statusBadge(s: string): string {
    const map: Record<string, string> = {
      draft: "a-badge-draft", sent: "a-badge-info", viewed: "a-badge-info",
      paid: "a-badge-active", overdue: "a-badge-danger", cancelled: "a-badge-inactive",
    };
    return map[s] ?? "a-badge-draft";
  }

  statusLabel(s: string): string {
    return { draft: "Borrador", sent: "Enviada", viewed: "Vista", paid: "Pagada", overdue: "Vencida", cancelled: "Cancelada" }[s] ?? s;
  }

  formatCurrency(v: number, currency = "EUR"): string {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency, maximumFractionDigits: 0 }).format(v);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  }
}
