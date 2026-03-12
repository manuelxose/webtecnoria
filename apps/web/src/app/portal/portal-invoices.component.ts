import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PORTAL_REPOSITORY, PortalRepository, PortalInvoice } from "src/app/domain/repositories/portal.repository";

@Component({
  selector: "app-portal-invoices",
  standalone: true,
  imports: [CommonModule],
  template: `
<div>
  <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 4px">Facturas</h1>
  <p style="font-size:14px;color:#64748b;margin:0 0 24px">Historial de facturación</p>

  @if (loading()) {
    <div style="color:#94a3b8;font-size:13px">Cargando…</div>
  } @else if (invoices().length === 0) {
    <div style="text-align:center;padding:48px;color:#94a3b8">
      <div style="font-size:15px;font-weight:500">Sin facturas</div>
    </div>
  } @else {
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f8fafc">
            <th style="text-align:left;padding:10px 16px;font-size:12px;color:#64748b;font-weight:500;border-bottom:1px solid #e2e8f0">Número</th>
            <th style="text-align:left;padding:10px 16px;font-size:12px;color:#64748b;font-weight:500;border-bottom:1px solid #e2e8f0">Fecha</th>
            <th style="text-align:left;padding:10px 16px;font-size:12px;color:#64748b;font-weight:500;border-bottom:1px solid #e2e8f0">Vencimiento</th>
            <th style="text-align:left;padding:10px 16px;font-size:12px;color:#64748b;font-weight:500;border-bottom:1px solid #e2e8f0">Estado</th>
            <th style="text-align:right;padding:10px 16px;font-size:12px;color:#64748b;font-weight:500;border-bottom:1px solid #e2e8f0">Importe</th>
            <th style="text-align:left;padding:10px 16px;font-size:12px;color:#64748b;font-weight:500;border-bottom:1px solid #e2e8f0"></th>
          </tr>
        </thead>
        <tbody>
          @for (inv of invoices(); track inv.id) {
            <tr [style]="'border-bottom:1px solid #f1f5f9;' + (isOverdue(inv) ? 'background:#fffbeb' : '')">
              <td style="padding:12px 16px;font-size:13px;font-family:monospace;color:#0f172a">{{ inv.number }}</td>
              <td style="padding:12px 16px;font-size:13px;color:#475569">{{ formatDate(inv.issue_date) }}</td>
              <td style="padding:12px 16px;font-size:13px" [style.color]="isOverdue(inv) ? '#dc2626' : '#475569'">
                {{ inv.due_date ? formatDate(inv.due_date) : '—' }}
              </td>
              <td style="padding:12px 16px">
                <span [style]="'font-size:11px;padding:3px 10px;border-radius:20px;font-weight:500;' + statusStyle(inv.status)">{{ statusLabel(inv.status) }}</span>
              </td>
              <td style="padding:12px 16px;font-size:14px;font-weight:600;color:#0f172a;text-align:right">{{ formatCurrency(inv.total, inv.currency) }}</td>
              <td style="padding:12px 16px">
                @if (inv.file_url) {
                  <a [href]="inv.file_url" target="_blank" style="font-size:12px;color:#6366f1;text-decoration:none">Descargar</a>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }
</div>
  `,
})
export class PortalInvoicesComponent implements OnInit {
  loading  = signal(true);
  invoices = signal<PortalInvoice[]>([]);

  constructor(@Inject(PORTAL_REPOSITORY) private readonly portalRepo: PortalRepository) {}

  async ngOnInit(): Promise<void> {
    try { this.invoices.set(await this.portalRepo.invoices()); }
    catch { /* silent */ }
    finally { this.loading.set(false); }
  }

  isOverdue(inv: PortalInvoice): boolean {
    return !!inv.due_date && new Date(inv.due_date) < new Date() && !["paid","cancelled"].includes(inv.status);
  }
  statusStyle(s: string): string {
    if (s === "paid")     return "background:#dcfce7;color:#16a34a";
    if (s === "overdue")  return "background:#fee2e2;color:#dc2626";
    if (s === "sent")     return "background:#dbeafe;color:#2563eb";
    return "background:#f1f5f9;color:#475569";
  }
  statusLabel(s: string): string {
    return { draft: "Borrador", sent: "Enviada", viewed: "Vista", paid: "Pagada", overdue: "Vencida", cancelled: "Cancelada" }[s] ?? s;
  }
  formatCurrency(n: number, currency = "EUR"): string {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  }
  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  }
}
