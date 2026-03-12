import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  CONTRACT_REPOSITORY,
  ContractRepository,
  Contract,
  ContractStatus,
} from "src/app/domain/repositories/contract.repository";

@Component({
  selector: "app-contract-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  @if (loading()) {
    <div style="display:flex;align-items:center;gap:10px;color:var(--a-text-muted);padding:40px 0"><span class="a-spinner"></span></div>
  }
  @if (!loading() && !contract()) {
    <div class="a-empty">
      <div class="a-empty-title">Contrato no encontrado</div>
      <a routerLink="/dashboard/finance/contracts" class="a-btn a-btn-secondary" style="margin-top:8px">← Volver</a>
    </div>
  }
  @if (contract()) {
    <div class="page-header">
      <div class="page-header-left">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <a routerLink="/dashboard/finance/contracts" style="color:var(--a-text-muted);font-size:13px;text-decoration:none">Contratos</a>
          <span style="color:var(--a-text-subtle)">/</span>
          <span style="font-size:13px">{{ contract()!.title }}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <h1 class="page-title">{{ contract()!.title }}</h1>
          <span [class]="'a-badge ' + statusBadge(contract()!.status)">{{ statusLabel(contract()!.status) }}</span>
        </div>
      </div>
      <div class="page-actions">
        @if (contract()!.status === 'sent') {
          <button class="a-btn a-btn-primary" (click)="markSigned()">Marcar como firmado</button>
        }
        <button class="a-btn a-btn-danger a-btn-icon" (click)="deleteContract()" title="Eliminar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>

    @if (success()) {
      <div style="background:var(--a-success-muted);border:1px solid var(--a-success);border-radius:var(--a-r-sm);color:var(--a-success);padding:10px 14px;font-size:13px;margin-bottom:16px">{{ success() }}</div>
    }
    @if (error()) {
      <div style="background:var(--a-danger-muted);border:1px solid var(--a-danger);border-radius:var(--a-r-sm);color:var(--a-danger);padding:10px 14px;font-size:13px;margin-bottom:16px">{{ error() }}</div>
    }

    <div class="a-grid-2" style="align-items:start">
      <div class="a-card">
        <div class="a-card-header"><span class="a-card-title">Editar contrato</span></div>
        <form (ngSubmit)="save()">
          <div class="a-form-group">
            <label class="a-label">Título *</label>
            <input class="a-input" [(ngModel)]="form.title" name="title" required>
          </div>
          <div class="a-form-grid-2">
            <div class="a-form-group">
              <label class="a-label">Estado</label>
              <select class="a-select" [(ngModel)]="form.status" name="status">
                <option value="draft">Borrador</option>
                <option value="sent">Enviado</option>
                <option value="signed">Firmado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div class="a-form-group">
              <label class="a-label">Importe ({{ contract()!.currency }})</label>
              <input class="a-input" type="number" min="0" step="0.01" [(ngModel)]="form.amount" name="amount">
            </div>
          </div>
          <div class="a-form-grid-2">
            <div class="a-form-group">
              <label class="a-label">Fecha inicio</label>
              <input class="a-input" type="date" [(ngModel)]="form.start_date" name="start_date">
            </div>
            <div class="a-form-group">
              <label class="a-label">Fecha fin</label>
              <input class="a-input" type="date" [(ngModel)]="form.end_date" name="end_date">
            </div>
          </div>
          <div class="a-form-group">
            <label class="a-label">URL del documento</label>
            <input class="a-input" [(ngModel)]="form.file_url" name="file_url" placeholder="https://...">
          </div>
          <div class="a-form-group">
            <label class="a-label">Notas</label>
            <textarea class="a-textarea" [(ngModel)]="form.notes" name="notes" rows="3"></textarea>
          </div>
          <button type="submit" class="a-btn a-btn-primary" [disabled]="saving()">
            @if (saving()) { <span class="a-spinner" style="width:14px;height:14px"></span> }
            Guardar cambios
          </button>
        </form>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="a-card">
          <div style="display:flex;flex-direction:column;gap:12px">
            <div>
              <div class="a-label" style="margin-bottom:4px">Cliente</div>
              <a [routerLink]="['/dashboard/clients', contract()!.client_id]" style="color:var(--a-brand);font-size:13px">{{ contract()!.client_name }}</a>
            </div>
            @if (contract()!.project_name) {
              <div>
                <div class="a-label" style="margin-bottom:4px">Proyecto</div>
                <a [routerLink]="['/dashboard/projects', contract()!.project_id]" style="color:var(--a-brand);font-size:13px">{{ contract()!.project_name }}</a>
              </div>
            }
            <div>
              <div class="a-label" style="margin-bottom:4px">Importe</div>
              <span style="font-size:20px;font-weight:700;color:var(--a-text)">{{ formatCurrency(contract()!.amount, contract()!.currency) }}</span>
            </div>
            @if (contract()!.file_url) {
              <div>
                <div class="a-label" style="margin-bottom:4px">Documento</div>
                <a [href]="contract()!.file_url" target="_blank" class="a-btn a-btn-secondary a-btn-sm">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Ver documento
                </a>
              </div>
            }
            @if (contract()!.signed_at) {
              <div>
                <div class="a-label" style="margin-bottom:4px">Firmado el</div>
                <span style="font-size:13px;color:var(--a-success)">{{ formatDate(contract()!.signed_at!) }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  }
</div>
  `,
})
export class ContractDetailComponent implements OnInit {
  contract = signal<Contract | null>(null);
  loading = signal(true);
  saving = signal(false);
  success = signal("");
  error = signal("");

  form = { title: "", status: "draft" as ContractStatus, amount: 0, start_date: "", end_date: "", file_url: "", notes: "" };

  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contractRepo: ContractRepository,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id || id === "new") { this.loading.set(false); return; }
    try {
      const c = await this.contractRepo.get(id);
      this.contract.set(c);
      if (c) this.form = { title: c.title, status: c.status, amount: c.amount, start_date: c.start_date?.slice(0,10) ?? "", end_date: c.end_date?.slice(0,10) ?? "", file_url: c.file_url ?? "", notes: c.notes ?? "" };
    } catch { /* silent */ }
    finally { this.loading.set(false); }
  }

  async save(): Promise<void> {
    const id = this.contract()?.id;
    if (!id) return;
    this.saving.set(true); this.success.set(""); this.error.set("");
    try {
      const updated = await this.contractRepo.update(id, {
        title: this.form.title, status: this.form.status, amount: this.form.amount,
        start_date: this.form.start_date || null, end_date: this.form.end_date || null,
        file_url: this.form.file_url || null, notes: this.form.notes || null,
      });
      this.contract.update((c) => ({ ...c!, ...updated }));
      this.success.set("Contrato actualizado.");
    } catch { this.error.set("No se pudo guardar."); }
    finally { this.saving.set(false); }
  }

  async markSigned(): Promise<void> {
    const id = this.contract()?.id;
    if (!id) return;
    try {
      const updated = await this.contractRepo.update(id, { status: "signed", signed_at: new Date().toISOString() });
      this.contract.update((c) => ({ ...c!, ...updated }));
      this.form.status = "signed";
      this.success.set("Contrato marcado como firmado.");
    } catch { this.error.set("No se pudo actualizar el estado."); }
  }

  async deleteContract(): Promise<void> {
    const id = this.contract()?.id;
    if (!id || !confirm(`¿Eliminar el contrato "${this.contract()!.title}"?`)) return;
    try { await this.contractRepo.delete(id); await this.router.navigate(["/dashboard/finance/contracts"]); }
    catch { this.error.set("No se pudo eliminar."); }
  }

  statusBadge(s: string): string {
    return { draft: "a-badge-draft", sent: "a-badge-info", signed: "a-badge-active", cancelled: "a-badge-inactive" }[s] ?? "a-badge-draft";
  }
  statusLabel(s: string): string {
    return { draft: "Borrador", sent: "Enviado", signed: "Firmado", cancelled: "Cancelado" }[s] ?? s;
  }
  formatCurrency(amount: number, currency = "EUR"): string {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  }
  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  }
}
