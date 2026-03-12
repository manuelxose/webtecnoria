import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { PORTAL_REPOSITORY, PortalRepository, PortalDashboard } from "src/app/domain/repositories/portal.repository";

@Component({
  selector: "app-portal-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div>
  <div style="margin-bottom:24px">
    <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0">Resumen</h1>
    <p style="font-size:14px;color:#64748b;margin:4px 0 0">Estado actual de tus proyectos y solicitudes</p>
  </div>

  @if (loading()) {
    <div style="color:#94a3b8;display:flex;align-items:center;gap:8px"><span style="width:18px;height:18px;border:2px solid #e2e8f0;border-top-color:#6366f1;border-radius:50%;animation:spin .8s linear infinite;display:inline-block"></span> Cargando…</div>
  }
  @if (!loading() && data()) {
    <!-- KPIs -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:24px">
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px">
        <div style="font-size:12px;color:#64748b;margin-bottom:4px">Proyectos activos</div>
        <div style="font-size:26px;font-weight:700;color:#0f172a">{{ data()!.kpis.active_projects }}</div>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px">
        <div style="font-size:12px;color:#64748b;margin-bottom:4px">Facturas pendientes</div>
        <div style="font-size:26px;font-weight:700;color:#0f172a">{{ data()!.kpis.pending_invoices }}</div>
        @if (Number(data()!.kpis.pending_amount) > 0) {
          <div style="font-size:12px;color:#f59e0b;margin-top:2px">{{ formatCurrency(Number(data()!.kpis.pending_amount)) }}</div>
        }
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px">
        <div style="font-size:12px;color:#64748b;margin-bottom:4px">Tickets abiertos</div>
        <div style="font-size:26px;font-weight:700;color:#0f172a">{{ data()!.kpis.open_tickets }}</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <!-- Active Projects -->
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
        <div style="padding:14px 16px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:14px;font-weight:600;color:#0f172a">Proyectos activos</span>
          <a routerLink="/portal/projects" style="font-size:12px;color:#6366f1;text-decoration:none">Ver todos →</a>
        </div>
        @if (data()!.activeProjects.length === 0) {
          <div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px">Sin proyectos activos</div>
        } @else {
          @for (p of data()!.activeProjects; track p.id) {
            <div style="padding:12px 16px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between">
              <div>
                <div style="font-size:13px;font-weight:500;color:#1e293b">{{ p.name }}</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:2px">{{ projectTypeLabel(p.type) }}</div>
              </div>
              <span [style]="'font-size:11px;padding:2px 8px;border-radius:20px;font-weight:500;' + healthStyle(p.health)">{{ healthLabel(p.health) }}</span>
            </div>
          }
        }
      </div>

      <!-- Pending Invoices -->
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
        <div style="padding:14px 16px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:14px;font-weight:600;color:#0f172a">Facturas pendientes</span>
          <a routerLink="/portal/invoices" style="font-size:12px;color:#6366f1;text-decoration:none">Ver todas →</a>
        </div>
        @if (data()!.pendingInvoices.length === 0) {
          <div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px">Sin facturas pendientes</div>
        } @else {
          @for (inv of data()!.pendingInvoices; track inv.id) {
            <div style="padding:12px 16px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between">
              <div>
                <div style="font-size:13px;font-weight:500;color:#1e293b;font-family:monospace">{{ inv.number }}</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:2px">{{ inv.due_date ? 'Vence ' + formatDate(inv.due_date) : 'Sin vencimiento' }}</div>
              </div>
              <span style="font-size:13px;font-weight:600;color:#0f172a">{{ formatCurrency(inv.total) }}</span>
            </div>
          }
        }
      </div>
    </div>

    <!-- Open Tickets -->
    @if (data()!.openTickets.length > 0) {
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-top:16px">
        <div style="padding:14px 16px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:14px;font-weight:600;color:#0f172a">Solicitudes abiertas</span>
          <a routerLink="/portal/tickets" style="font-size:12px;color:#6366f1;text-decoration:none">Ver todas →</a>
        </div>
        @for (t of data()!.openTickets; track t.id) {
          <div style="padding:12px 16px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between">
            <div>
              <span style="font-size:11px;color:#94a3b8;font-family:monospace;margin-right:8px">#{{ t.number }}</span>
              <span style="font-size:13px;color:#1e293b">{{ t.title }}</span>
            </div>
            <span [style]="'font-size:11px;padding:2px 8px;border-radius:20px;font-weight:500;' + priorityStyle(t.priority)">{{ priorityLabel(t.priority) }}</span>
          </div>
        }
      </div>
    }
  }
</div>
  `,
})
export class PortalDashboardComponent implements OnInit {
  loading = signal(true);
  data    = signal<PortalDashboard | null>(null);
  readonly Number = Number;

  constructor(@Inject(PORTAL_REPOSITORY) private readonly portalRepo: PortalRepository) {}

  async ngOnInit(): Promise<void> {
    try { this.data.set(await this.portalRepo.dashboard()); }
    catch { /* silent */ }
    finally { this.loading.set(false); }
  }

  healthStyle(h: string): string {
    if (h === "on_track") return "background:#dcfce7;color:#16a34a";
    if (h === "at_risk")  return "background:#fef9c3;color:#ca8a04";
    return "background:#fee2e2;color:#dc2626";
  }
  healthLabel(h: string): string {
    return { on_track: "En plazo", at_risk: "En riesgo", off_track: "Retrasado" }[h] ?? h;
  }
  priorityStyle(p: string): string {
    if (p === "critical") return "background:#fee2e2;color:#dc2626";
    if (p === "high")     return "background:#fef9c3;color:#ca8a04";
    return "background:#f1f5f9;color:#475569";
  }
  priorityLabel(p: string): string {
    return { low: "Baja", medium: "Media", high: "Alta", critical: "Crítica" }[p] ?? p;
  }
  projectTypeLabel(t: string): string {
    return { web_dev: "Web Dev", automation: "Automatización", ai_system: "Sistema IA", chatbot: "Chatbot", saas: "SaaS", consulting: "Consultoría", custom: "Custom" }[t] ?? t;
  }
  formatCurrency(n: number): string {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  }
  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  }
}
