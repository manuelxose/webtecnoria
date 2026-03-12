import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  CONTRACT_REPOSITORY,
  ContractRepository,
  Contract,
} from "src/app/domain/repositories/contract.repository";

@Component({
  selector: "app-contracts-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  <div class="page-header">
    <div class="page-header-left">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <a routerLink="/dashboard/finance" style="color:var(--a-text-muted);font-size:13px;text-decoration:none">Finanzas</a>
        <span style="color:var(--a-text-subtle)">/</span>
        <span style="font-size:13px">Contratos</span>
      </div>
      <h1 class="page-title">Contratos</h1>
    </div>
    <div class="page-actions">
      <a routerLink="/dashboard/finance/contracts/new" class="a-btn a-btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo contrato
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
    @if (contracts().length === 0) {
      <div class="a-empty">
        <svg class="a-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <div class="a-empty-title">Sin contratos</div>
        <div class="a-empty-desc">Crea el primer contrato para un cliente.</div>
        <a routerLink="/dashboard/finance/contracts/new" class="a-btn a-btn-primary" style="margin-top:8px">Nuevo contrato</a>
      </div>
    } @else {
      <div class="a-table-wrap">
        <table class="a-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Cliente</th>
              <th>Proyecto</th>
              <th>Importe</th>
              <th>Estado</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (c of contracts(); track c.id) {
              <tr>
                <td style="font-weight:500">{{ c.title }}</td>
                <td style="color:var(--a-text-muted)">{{ c.client_name }}</td>
                <td style="color:var(--a-text-muted)">{{ c.project_name || '—' }}</td>
                <td style="font-weight:600">{{ formatCurrency(c.amount, c.currency) }}</td>
                <td><span [class]="'a-badge ' + statusBadge(c.status)">{{ statusLabel(c.status) }}</span></td>
                <td style="color:var(--a-text-muted)">{{ c.start_date ? formatDate(c.start_date) : '—' }}</td>
                <td style="color:var(--a-text-muted)">{{ c.end_date ? formatDate(c.end_date) : '—' }}</td>
                <td>
                  <div class="row-actions">
                    <a [routerLink]="['/dashboard/finance/contracts', c.id]" class="a-btn a-btn-ghost a-btn-sm">Ver</a>
                    <button class="a-btn a-btn-ghost a-btn-sm a-btn-icon" (click)="deleteContract(c)" style="color:var(--a-danger)">
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
    }
  }
</div>
  `,
})
export class ContractsListComponent implements OnInit {
  contracts = signal<Contract[]>([]);
  loading = signal(true);
  filterStatus = signal("all");

  readonly statusFilters = [
    { value: "all",       label: "Todos" },
    { value: "draft",     label: "Borrador" },
    { value: "sent",      label: "Enviado" },
    { value: "signed",    label: "Firmado" },
    { value: "cancelled", label: "Cancelado" },
  ];

  constructor(@Inject(CONTRACT_REPOSITORY) private readonly contractRepo: ContractRepository) {}

  async ngOnInit(): Promise<void> { await this.load(); }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.contractRepo.list({
        status: this.filterStatus() !== "all" ? this.filterStatus() : undefined,
        pageSize: 100,
      });
      this.contracts.set(result.items);
    } catch { /* silent */ }
    finally { this.loading.set(false); }
  }

  async setFilter(v: string): Promise<void> {
    this.filterStatus.set(v);
    await this.load();
  }

  async deleteContract(c: Contract): Promise<void> {
    if (!confirm(`¿Eliminar el contrato "${c.title}"?`)) return;
    try { await this.contractRepo.delete(c.id); await this.load(); } catch { /* silent */ }
  }

  statusBadge(s: string): string {
    const map: Record<string, string> = {
      draft: "a-badge-draft", sent: "a-badge-info", signed: "a-badge-active", cancelled: "a-badge-inactive",
    };
    return map[s] ?? "a-badge-draft";
  }

  statusLabel(s: string): string {
    return { draft: "Borrador", sent: "Enviado", signed: "Firmado", cancelled: "Cancelado" }[s] ?? s;
  }

  formatCurrency(amount: number, currency = "EUR"): string {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  }
}
