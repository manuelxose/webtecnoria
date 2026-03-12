import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  INVOICE_REPOSITORY,
  InvoiceRepository,
  CreateInvoiceItem,
} from "src/app/domain/repositories/invoice.repository";
import {
  CLIENT_REPOSITORY,
  ClientRepository,
  Client,
} from "src/app/domain/repositories/client.repository";

type LineItem = { description: string; quantity: number; unit_price: number };

@Component({
  selector: "app-invoice-form",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  <div class="page-header">
    <div class="page-header-left">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <a routerLink="/dashboard/finance/invoices" style="color:var(--a-text-muted);font-size:13px;text-decoration:none">Facturas</a>
        <span style="color:var(--a-text-subtle)">/</span>
        <span style="font-size:13px">Nueva</span>
      </div>
      <h1 class="page-title">Nueva factura</h1>
    </div>
  </div>

  @if (error()) {
    <div style="background:var(--a-danger-muted);border:1px solid var(--a-danger);border-radius:var(--a-r-sm);color:var(--a-danger);padding:10px 14px;font-size:13px;margin-bottom:16px">{{ error() }}</div>
  }

  <div style="display:grid;grid-template-columns:1fr 320px;gap:20px;align-items:start">
    <!-- Left: form -->
    <div style="display:flex;flex-direction:column;gap:16px">
      <!-- Client + dates -->
      <div class="a-card">
        <div class="a-card-header"><span class="a-card-title">Datos de la factura</span></div>
        <div class="a-form-grid-2">
          <div class="a-form-group">
            <label class="a-label">Cliente *</label>
            <select class="a-select" [(ngModel)]="form.client_id" name="client_id" required>
              <option value="">— Seleccionar —</option>
              @for (c of clients(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
          </div>
          <div class="a-form-group">
            <label class="a-label">Estado</label>
            <select class="a-select" [(ngModel)]="form.status" name="status">
              <option value="draft">Borrador</option>
              <option value="sent">Enviada</option>
            </select>
          </div>
        </div>
        <div class="a-form-grid-2">
          <div class="a-form-group">
            <label class="a-label">Fecha emisión</label>
            <input class="a-input" type="date" [(ngModel)]="form.issue_date" name="issue_date">
          </div>
          <div class="a-form-group">
            <label class="a-label">Fecha vencimiento</label>
            <input class="a-input" type="date" [(ngModel)]="form.due_date" name="due_date">
          </div>
        </div>
        <div class="a-form-group">
          <label class="a-label">Notas / observaciones</label>
          <textarea class="a-textarea" [(ngModel)]="form.notes" name="notes" rows="2" placeholder="Condiciones de pago, observaciones..."></textarea>
        </div>
      </div>

      <!-- Line items -->
      <div class="a-card">
        <div class="a-card-header">
          <span class="a-card-title">Líneas de factura</span>
          <button type="button" class="a-btn a-btn-secondary a-btn-sm" (click)="addLine()">+ Añadir línea</button>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px">
          <!-- Header -->
          <div style="display:grid;grid-template-columns:1fr 80px 100px 100px 32px;gap:8px;padding:0 4px">
            <span class="a-label" style="margin:0">Descripción</span>
            <span class="a-label" style="margin:0;text-align:center">Cant.</span>
            <span class="a-label" style="margin:0;text-align:right">Precio unit.</span>
            <span class="a-label" style="margin:0;text-align:right">Total</span>
            <span></span>
          </div>

          @for (line of lines(); track $index; let i = $index) {
            <div style="display:grid;grid-template-columns:1fr 80px 100px 100px 32px;gap:8px;align-items:center">
              <input class="a-input" [(ngModel)]="line.description" [name]="'desc_'+i" placeholder="Descripción del servicio">
              <input class="a-input" type="number" min="0.01" step="0.01" [(ngModel)]="line.quantity" [name]="'qty_'+i" style="text-align:center">
              <input class="a-input" type="number" min="0" step="0.01" [(ngModel)]="line.unit_price" [name]="'price_'+i" style="text-align:right">
              <div style="text-align:right;font-weight:600;font-size:13px;color:var(--a-text);padding:0 4px">
                {{ formatCurrency(line.quantity * line.unit_price) }}
              </div>
              <button type="button" class="a-btn a-btn-ghost a-btn-icon" (click)="removeLine(i)" style="color:var(--a-danger)" [disabled]="lines().length === 1">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Right: summary -->
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="a-card">
        <div class="a-card-header"><span class="a-card-title">Resumen</span></div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;justify-content:space-between;font-size:13px">
            <span style="color:var(--a-text-muted)">Subtotal</span>
            <span style="font-weight:600">{{ formatCurrency(subtotal()) }}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px">
            <div style="display:flex;align-items:center;gap:6px;color:var(--a-text-muted)">
              <span>IVA</span>
              <input class="a-input" type="number" min="0" max="100" step="1"
                [(ngModel)]="form.tax_rate" name="tax_rate"
                style="width:52px;height:26px;padding:2px 6px;font-size:12px;text-align:center">
              <span>%</span>
            </div>
            <span style="font-weight:600">{{ formatCurrency(taxAmount()) }}</span>
          </div>
          <div class="a-divider" style="margin:4px 0"></div>
          <div style="display:flex;justify-content:space-between;font-size:16px">
            <span style="font-weight:700;color:var(--a-text)">Total</span>
            <span style="font-weight:700;color:var(--a-text)">{{ formatCurrency(total()) }}</span>
          </div>
        </div>
        <button class="a-btn a-btn-primary" style="width:100%;margin-top:16px;justify-content:center" (click)="save()" [disabled]="saving()">
          @if (saving()) { <span class="a-spinner" style="width:14px;height:14px"></span> }
          Crear factura
        </button>
        <a routerLink="/dashboard/finance/invoices" class="a-btn a-btn-ghost" style="width:100%;justify-content:center;margin-top:6px">Cancelar</a>
      </div>
    </div>
  </div>
</div>
  `,
})
export class InvoiceFormComponent implements OnInit {
  clients = signal<Client[]>([]);
  saving = signal(false);
  error = signal("");

  form = {
    client_id: "", status: "draft" as "draft" | "sent",
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: "",
    tax_rate: 21,
    notes: "",
  };

  lines = signal<LineItem[]>([{ description: "", quantity: 1, unit_price: 0 }]);

  constructor(
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepo: InvoiceRepository,
    @Inject(CLIENT_REPOSITORY) private readonly clientRepo: ClientRepository,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const res = await this.clientRepo.list({ status: "active", pageSize: 200 });
      this.clients.set(res.items);
    } catch { /* silent */ }
  }

  addLine(): void {
    this.lines.update((l) => [...l, { description: "", quantity: 1, unit_price: 0 }]);
  }

  removeLine(i: number): void {
    this.lines.update((l) => l.filter((_, idx) => idx !== i));
  }

  subtotal(): number {
    return this.lines().reduce((sum, l) => sum + l.quantity * l.unit_price, 0);
  }

  taxAmount(): number {
    return +(this.subtotal() * (this.form.tax_rate / 100)).toFixed(2);
  }

  total(): number {
    return +(this.subtotal() + this.taxAmount()).toFixed(2);
  }

  async save(): Promise<void> {
    if (!this.form.client_id) { this.error.set("Selecciona un cliente."); return; }
    const validLines = this.lines().filter((l) => l.description.trim() && l.unit_price >= 0);
    if (!validLines.length) { this.error.set("Añade al menos una línea con descripción."); return; }

    this.saving.set(true);
    this.error.set("");

    try {
      const items: CreateInvoiceItem[] = validLines.map((l, i) => ({
        description: l.description.trim(),
        quantity: l.quantity,
        unit_price: l.unit_price,
        sort_order: i,
      }));

      const invoice = await this.invoiceRepo.create({
        client_id: this.form.client_id,
        status: this.form.status,
        issue_date: this.form.issue_date,
        due_date: this.form.due_date || null,
        tax_rate: this.form.tax_rate,
        notes: this.form.notes || null,
        items,
      });
      await this.router.navigate(["/dashboard/finance/invoices", invoice.id]);
    } catch {
      this.error.set("No se pudo crear la factura.");
      this.saving.set(false);
    }
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(v);
  }
}
