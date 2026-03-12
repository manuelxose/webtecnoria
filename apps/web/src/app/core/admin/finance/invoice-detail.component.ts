import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  INVOICE_REPOSITORY,
  InvoiceRepository,
  Invoice,
  InvoiceStatus,
} from "src/app/domain/repositories/invoice.repository";

@Component({
  selector: "app-invoice-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  @if (loading()) {
    <div style="display:flex;align-items:center;gap:10px;color:var(--a-text-muted);padding:40px 0"><span class="a-spinner"></span></div>
  }
  @if (!loading() && !invoice()) {
    <div class="a-empty">
      <div class="a-empty-title">Factura no encontrada</div>
      <a routerLink="/dashboard/finance/invoices" class="a-btn a-btn-secondary" style="margin-top:8px">← Volver</a>
    </div>
  }

  @if (invoice()) {
    <div class="page-header">
      <div class="page-header-left">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <a routerLink="/dashboard/finance/invoices" style="color:var(--a-text-muted);font-size:13px;text-decoration:none">Facturas</a>
          <span style="color:var(--a-text-subtle)">/</span>
          <span style="font-size:13px;font-family:var(--a-font-mono)">{{ invoice()!.number }}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <h1 class="page-title" style="font-family:var(--a-font-mono)">{{ invoice()!.number }}</h1>
          <span [class]="'a-badge ' + statusBadge(invoice()!.status)">{{ statusLabel(invoice()!.status) }}</span>
          @if (isOverdue()) { <span class="a-badge a-badge-danger">Vencida</span> }
        </div>
      </div>
      <div class="page-actions">
        @if (invoice()!.status !== 'paid' && invoice()!.status !== 'cancelled') {
          <button class="a-btn a-btn-primary" (click)="showMarkPaidModal.set(true)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Marcar cobrada
          </button>
        }
        @if (invoice()!.status === 'draft') {
          <button class="a-btn a-btn-secondary" (click)="updateStatus('sent')" [disabled]="updating()">Marcar enviada</button>
        }
        <button class="a-btn a-btn-danger a-btn-icon" (click)="deleteInvoice()" title="Eliminar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    </div>

    @if (success()) {
      <div style="background:var(--a-success-muted);border:1px solid var(--a-success);border-radius:var(--a-r-sm);color:var(--a-success);padding:10px 14px;font-size:13px;margin-bottom:16px">{{ success() }}</div>
    }
    @if (error()) {
      <div style="background:var(--a-danger-muted);border:1px solid var(--a-danger);border-radius:var(--a-r-sm);color:var(--a-danger);padding:10px 14px;font-size:13px;margin-bottom:16px">{{ error() }}</div>
    }

    <!-- Mark paid modal -->
    @if (showMarkPaidModal()) {
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:100;display:flex;align-items:center;justify-content:center" (click)="showMarkPaidModal.set(false)">
        <div class="a-card" style="width:400px;max-width:90vw" (click)="$event.stopPropagation()">
          <div class="a-card-header">
            <span class="a-card-title">Registrar cobro</span>
            <button class="a-btn a-btn-ghost a-btn-icon" (click)="showMarkPaidModal.set(false)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="a-form-group">
            <label class="a-label">Importe cobrado</label>
            <input class="a-input" type="number" [(ngModel)]="paidForm.amount" name="paid_amount" step="0.01">
          </div>
          <div class="a-form-group">
            <label class="a-label">Método de pago</label>
            <select class="a-select" [(ngModel)]="paidForm.method" name="paid_method">
              <option value="bank_transfer">Transferencia bancaria</option>
              <option value="card">Tarjeta</option>
              <option value="cash">Efectivo</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div class="a-form-group">
            <label class="a-label">Referencia (opcional)</label>
            <input class="a-input" [(ngModel)]="paidForm.reference" name="paid_ref" placeholder="Nº de transferencia, etc.">
          </div>
          <div class="a-form-group">
            <label class="a-label">Fecha de cobro</label>
            <input class="a-input" type="date" [(ngModel)]="paidForm.paid_at" name="paid_at">
          </div>
          <div style="display:flex;gap:8px;margin-top:4px">
            <button class="a-btn a-btn-primary" style="flex:1;justify-content:center" (click)="confirmMarkPaid()" [disabled]="marking()">
              @if (marking()) { <span class="a-spinner" style="width:14px;height:14px"></span> }
              Confirmar cobro
            </button>
            <button class="a-btn a-btn-ghost" (click)="showMarkPaidModal.set(false)">Cancelar</button>
          </div>
        </div>
      </div>
    }

    <!-- Invoice preview -->
    <div style="display:grid;grid-template-columns:1fr 280px;gap:20px;align-items:start">

      <!-- Document preview -->
      <div class="a-card" style="padding:32px">
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px">
          <div>
            <div style="font-family:var(--a-font-heading);font-size:22px;font-weight:700;color:var(--a-text)">FACTURA</div>
            <div style="font-family:var(--a-font-mono);font-size:14px;color:var(--a-brand);margin-top:2px">{{ invoice()!.number }}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:12px;color:var(--a-text-subtle)">Tecnoria</div>
          </div>
        </div>

        <!-- Dates + client -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px">
          <div>
            <div style="font-size:11px;color:var(--a-text-subtle);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Cliente</div>
            <div style="font-weight:600;color:var(--a-text)">{{ invoice()!.client_name }}</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--a-text-subtle);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Fechas</div>
            <div style="font-size:13px;color:var(--a-text-muted)">Emisión: <strong style="color:var(--a-text)">{{ formatDate(invoice()!.issue_date) }}</strong></div>
            @if (invoice()!.due_date) {
              <div style="font-size:13px;color:var(--a-text-muted)">Vencimiento: <strong [style.color]="isOverdue() ? 'var(--a-danger)' : 'var(--a-text)'">{{ formatDate(invoice()!.due_date!) }}</strong></div>
            }
          </div>
        </div>

        <!-- Line items table -->
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px">
          <thead>
            <tr style="border-bottom:2px solid var(--a-border)">
              <th style="text-align:left;padding:6px 8px 10px 0;color:var(--a-text-muted);font-weight:500">Descripción</th>
              <th style="text-align:center;padding:6px 8px 10px;color:var(--a-text-muted);font-weight:500;width:60px">Cant.</th>
              <th style="text-align:right;padding:6px 0 10px 8px;color:var(--a-text-muted);font-weight:500;width:90px">Precio</th>
              <th style="text-align:right;padding:6px 0 10px 8px;color:var(--a-text-muted);font-weight:500;width:90px">Total</th>
            </tr>
          </thead>
          <tbody>
            @for (item of invoice()!.items ?? []; track item.id) {
              <tr style="border-bottom:1px solid var(--a-border)">
                <td style="padding:9px 8px 9px 0;color:var(--a-text)">{{ item.description }}</td>
                <td style="padding:9px 8px;text-align:center;color:var(--a-text-muted)">{{ item.quantity }}</td>
                <td style="padding:9px 0 9px 8px;text-align:right;color:var(--a-text-muted)">{{ formatCurrency(item.unit_price, invoice()!.currency) }}</td>
                <td style="padding:9px 0 9px 8px;text-align:right;font-weight:600;color:var(--a-text)">{{ formatCurrency(item.total, invoice()!.currency) }}</td>
              </tr>
            }
          </tbody>
        </table>

        <!-- Totals -->
        <div style="display:flex;justify-content:flex-end">
          <div style="width:220px;display:flex;flex-direction:column;gap:6px">
            <div style="display:flex;justify-content:space-between;font-size:13px">
              <span style="color:var(--a-text-muted)">Subtotal</span>
              <span>{{ formatCurrency(invoice()!.subtotal, invoice()!.currency) }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px">
              <span style="color:var(--a-text-muted)">IVA ({{ invoice()!.tax_rate }}%)</span>
              <span>{{ formatCurrency(invoice()!.tax_amount, invoice()!.currency) }}</span>
            </div>
            <div style="height:1px;background:var(--a-border);margin:4px 0"></div>
            <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700">
              <span>TOTAL</span>
              <span style="color:var(--a-brand)">{{ formatCurrency(invoice()!.total, invoice()!.currency) }}</span>
            </div>
          </div>
        </div>

        @if (invoice()!.notes) {
          <div style="margin-top:24px;padding-top:16px;border-top:1px solid var(--a-border)">
            <div style="font-size:11px;color:var(--a-text-subtle);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em">Notas</div>
            <div style="font-size:13px;color:var(--a-text-muted)">{{ invoice()!.notes }}</div>
          </div>
        }
      </div>

      <!-- Right panel -->
      <div style="display:flex;flex-direction:column;gap:12px">
        <!-- Status -->
        <div class="a-card">
          <div style="display:flex;flex-direction:column;gap:12px">
            <div>
              <div class="a-label" style="margin-bottom:4px">Estado</div>
              <div style="display:flex;align-items:center;gap:8px">
                <span [class]="'a-badge ' + statusBadge(invoice()!.status)" style="font-size:12px">{{ statusLabel(invoice()!.status) }}</span>
              </div>
            </div>
            <div>
              <div class="a-label" style="margin-bottom:4px">Importe total</div>
              <span style="font-size:22px;font-weight:700;color:var(--a-text)">{{ formatCurrency(invoice()!.total, invoice()!.currency) }}</span>
            </div>
            @if (invoice()!.paid_at) {
              <div>
                <div class="a-label" style="margin-bottom:4px">Cobrada el</div>
                <span style="font-size:13px;color:var(--a-success)">{{ formatDate(invoice()!.paid_at!) }}</span>
              </div>
            }
            <div>
              <div class="a-label" style="margin-bottom:4px">Cliente</div>
              <a [routerLink]="['/dashboard/clients', invoice()!.client_id]" style="color:var(--a-brand);font-size:13px">{{ invoice()!.client_name }}</a>
            </div>
            @if (invoice()!.project_name) {
              <div>
                <div class="a-label" style="margin-bottom:4px">Proyecto</div>
                <a [routerLink]="['/dashboard/projects', invoice()!.project_id]" style="color:var(--a-brand);font-size:13px">{{ invoice()!.project_name }}</a>
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
export class InvoiceDetailComponent implements OnInit {
  invoice = signal<Invoice | null>(null);
  loading = signal(true);
  updating = signal(false);
  marking = signal(false);
  showMarkPaidModal = signal(false);
  success = signal("");
  error = signal("");

  paidForm = {
    amount: 0,
    method: "bank_transfer",
    reference: "",
    paid_at: new Date().toISOString().slice(0, 10),
  };

  constructor(
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepo: InvoiceRepository,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id || id === "new") { this.loading.set(false); return; }
    try {
      const inv = await this.invoiceRepo.get(id);
      this.invoice.set(inv);
      if (inv) this.paidForm.amount = inv.total;
    } catch { /* silent */ }
    finally { this.loading.set(false); }
  }

  isOverdue(): boolean {
    const inv = this.invoice();
    return !!(inv?.due_date && inv.status !== "paid" && inv.status !== "cancelled"
      && new Date(inv.due_date) < new Date());
  }

  async updateStatus(status: InvoiceStatus): Promise<void> {
    const id = this.invoice()?.id;
    if (!id) return;
    this.updating.set(true);
    try {
      const updated = await this.invoiceRepo.update(id, { status });
      this.invoice.update((i) => ({ ...i!, ...updated }));
      this.success.set(`Factura marcada como ${this.statusLabel(status)}.`);
    } catch { this.error.set("No se pudo actualizar el estado."); }
    finally { this.updating.set(false); }
  }

  async confirmMarkPaid(): Promise<void> {
    const id = this.invoice()?.id;
    if (!id) return;
    this.marking.set(true);
    try {
      const updated = await this.invoiceRepo.markPaid(id, {
        amount: this.paidForm.amount,
        method: this.paidForm.method,
        reference: this.paidForm.reference || undefined,
        paid_at: new Date(this.paidForm.paid_at).toISOString(),
      });
      this.invoice.update((i) => ({ ...i!, ...updated }));
      this.showMarkPaidModal.set(false);
      this.success.set("Factura marcada como cobrada correctamente.");
    } catch { this.error.set("No se pudo registrar el cobro."); }
    finally { this.marking.set(false); }
  }

  async deleteInvoice(): Promise<void> {
    const id = this.invoice()?.id;
    if (!id || !confirm(`¿Eliminar la factura ${this.invoice()!.number}?`)) return;
    try { await this.invoiceRepo.delete(id); await this.router.navigate(["/dashboard/finance/invoices"]); }
    catch { this.error.set("No se pudo eliminar la factura."); }
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
    return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(v);
  }
  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  }
}
