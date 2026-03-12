import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  CONTRACT_REPOSITORY,
  ContractRepository,
  ContractStatus,
} from "src/app/domain/repositories/contract.repository";
import {
  CLIENT_REPOSITORY,
  ClientRepository,
  Client,
} from "src/app/domain/repositories/client.repository";

@Component({
  selector: "app-contract-form",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  <div class="page-header">
    <div class="page-header-left">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <a routerLink="/dashboard/finance/contracts" style="color:var(--a-text-muted);font-size:13px;text-decoration:none">Contratos</a>
        <span style="color:var(--a-text-subtle)">/</span>
        <span style="font-size:13px">Nuevo</span>
      </div>
      <h1 class="page-title">Nuevo contrato</h1>
    </div>
  </div>

  @if (error()) {
    <div style="background:var(--a-danger-muted);border:1px solid var(--a-danger);border-radius:var(--a-r-sm);color:var(--a-danger);padding:10px 14px;font-size:13px;margin-bottom:16px">{{ error() }}</div>
  }

  <div class="a-card" style="max-width:640px">
    <form (ngSubmit)="save()">
      <div class="a-form-group">
        <label class="a-label">Título *</label>
        <input class="a-input" [(ngModel)]="form.title" name="title" required placeholder="Ej. Contrato de desarrollo web — Empresa X">
      </div>
      <div class="a-form-grid-2">
        <div class="a-form-group">
          <label class="a-label">Cliente *</label>
          <select class="a-select" [(ngModel)]="form.client_id" name="client_id" required>
            <option value="">— Seleccionar cliente —</option>
            @for (c of clients(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
        </div>
        <div class="a-form-group">
          <label class="a-label">Estado</label>
          <select class="a-select" [(ngModel)]="form.status" name="status">
            <option value="draft">Borrador</option>
            <option value="sent">Enviado</option>
            <option value="signed">Firmado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>
      <div class="a-form-grid-2">
        <div class="a-form-group">
          <label class="a-label">Importe (€)</label>
          <input class="a-input" type="number" min="0" step="0.01" [(ngModel)]="form.amount" name="amount">
        </div>
        <div class="a-form-group">
          <label class="a-label">Moneda</label>
          <select class="a-select" [(ngModel)]="form.currency" name="currency">
            <option value="EUR">EUR — Euro</option>
            <option value="USD">USD — Dólar</option>
            <option value="GBP">GBP — Libra</option>
          </select>
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
      <div style="display:flex;gap:8px">
        <button type="submit" class="a-btn a-btn-primary" [disabled]="saving()">
          @if (saving()) { <span class="a-spinner" style="width:14px;height:14px"></span> }
          Crear contrato
        </button>
        <a routerLink="/dashboard/finance/contracts" class="a-btn a-btn-ghost">Cancelar</a>
      </div>
    </form>
  </div>
</div>
  `,
})
export class ContractFormComponent implements OnInit {
  clients = signal<Client[]>([]);
  saving = signal(false);
  error = signal("");

  form = {
    title: "", client_id: "", status: "draft" as ContractStatus,
    amount: 0, currency: "EUR", start_date: "", end_date: "",
    file_url: "", notes: "",
  };

  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contractRepo: ContractRepository,
    @Inject(CLIENT_REPOSITORY) private readonly clientRepo: ClientRepository,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const res = await this.clientRepo.list({ status: "active", pageSize: 200 });
      this.clients.set(res.items);
    } catch { /* silent */ }
  }

  async save(): Promise<void> {
    if (!this.form.title.trim() || !this.form.client_id) {
      this.error.set("Título y cliente son obligatorios.");
      return;
    }
    this.saving.set(true);
    this.error.set("");
    try {
      const contract = await this.contractRepo.create({
        title: this.form.title.trim(),
        client_id: this.form.client_id,
        status: this.form.status,
        amount: this.form.amount,
        currency: this.form.currency,
        start_date: this.form.start_date || null,
        end_date: this.form.end_date || null,
        file_url: this.form.file_url || null,
        notes: this.form.notes || null,
      });
      await this.router.navigate(["/dashboard/finance/contracts", contract.id]);
    } catch {
      this.error.set("No se pudo crear el contrato.");
      this.saving.set(false);
    }
  }
}
