import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import {
  AdvancedAnalytics,
  ANALYTICS_REPOSITORY,
} from "src/app/domain/repositories/analytics.repository";

@Component({
  selector: "app-analytics-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="a-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Analytics</h1>
          <p class="page-subtitle">Métricas avanzadas del negocio</p>
        </div>
      </div>

      @if (loading()) {
        <div style="display:flex;justify-content:center;padding:4rem">
          <div class="a-spinner"></div>
        </div>
      } @else if (error()) {
        <div class="a-card">
          <div class="a-empty">
            <p>Error al cargar las métricas. Inténtalo de nuevo.</p>
          </div>
        </div>
      } @else if (data(); as d) {

        <!-- Revenue bar chart -->
        <div class="a-card" style="margin-bottom:2rem">
          <div class="a-card-header">
            <h2 class="a-card-title">Ingresos últimos 12 meses</h2>
          </div>
          @if (d.monthlyRevenue.length === 0) {
            <div class="a-empty"><p>Sin datos de facturación</p></div>
          } @else {
            <div style="display:flex;align-items:flex-end;gap:4px;height:120px;padding:0 0 24px">
              @for (item of d.monthlyRevenue; track item.month) {
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%">
                  <div
                    [title]="formatCurrency(item.revenue)"
                    [style]="'flex:0;width:100%;background:var(--a-brand);border-radius:3px 3px 0 0;min-height:2px;height:' + barHeight(item.revenue, maxRevenue()) + 'px'"
                  ></div>
                  <span style="font-size:10px;color:var(--a-text-muted);white-space:nowrap">{{ monthLabel(item.month) }}</span>
                </div>
              }
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--a-text-muted);margin-top:0.5rem;padding-top:0.5rem;border-top:1px solid var(--a-border)">
              <span>Total: <strong style="color:var(--a-text)">{{ formatCurrency(totalRevenue()) }}</strong></span>
              <span>Mejor mes: <strong style="color:var(--a-brand)">{{ formatCurrency(maxRevenue()) }}</strong></span>
            </div>
          }
        </div>

        <!-- Middle row: 3 cards -->
        <div class="a-grid-3" style="margin-bottom:2rem">

          <!-- Facturación por estado -->
          <div class="a-card">
            <div class="a-card-header">
              <h2 class="a-card-title" style="font-size:0.95rem">Facturación por estado</h2>
            </div>
            @if (d.invoicesByStatus.length === 0) {
              <div class="a-empty"><p>Sin datos</p></div>
            } @else {
              <div style="display:flex;flex-direction:column;gap:0.75rem">
                @for (item of d.invoicesByStatus; track item.status) {
                  <div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:0.8rem">
                      <span>{{ invoiceStatusLabel(item.status) }}</span>
                      <span style="color:var(--a-text-muted)">{{ item.count }} · {{ formatCurrency(item.total) }}</span>
                    </div>
                    <div style="height:6px;background:var(--a-bg-muted,#f1f5f9);border-radius:3px;overflow:hidden">
                      <div
                        [style]="'height:100%;background:' + invoiceStatusColor(item.status) + ';border-radius:3px;width:' + pct(item.total, maxInvoiceTotal(d.invoicesByStatus)) + '%'"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Pipeline de leads -->
          <div class="a-card">
            <div class="a-card-header">
              <h2 class="a-card-title" style="font-size:0.95rem">Pipeline de leads</h2>
            </div>
            @if (d.leadsFunnel.length === 0) {
              <div class="a-empty"><p>Sin datos</p></div>
            } @else {
              <div style="display:flex;flex-direction:column;gap:0.75rem">
                @for (item of d.leadsFunnel; track item.status) {
                  <div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:0.8rem">
                      <span>{{ leadStatusLabel(item.status) }}</span>
                      <span style="color:var(--a-text-muted)">{{ item.count }}</span>
                    </div>
                    <div style="height:6px;background:var(--a-bg-muted,#f1f5f9);border-radius:3px;overflow:hidden">
                      <div
                        [style]="'height:100%;background:' + leadStatusColor(item.status) + ';border-radius:3px;width:' + pct(item.count, maxLeadCount(d.leadsFunnel)) + '%'"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Tickets -->
          <div class="a-card">
            <div class="a-card-header">
              <h2 class="a-card-title" style="font-size:0.95rem">Tickets de soporte</h2>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div style="text-align:center;padding:0.75rem;background:var(--a-bg-muted,#f8fafc);border-radius:8px">
                <div style="font-size:1.75rem;font-weight:700;color:#ef4444">{{ d.ticketStats.open }}</div>
                <div style="font-size:0.75rem;color:var(--a-text-muted)">Abiertos</div>
              </div>
              <div style="text-align:center;padding:0.75rem;background:var(--a-bg-muted,#f8fafc);border-radius:8px">
                <div style="font-size:1.75rem;font-weight:700;color:#f59e0b">{{ d.ticketStats.in_progress }}</div>
                <div style="font-size:0.75rem;color:var(--a-text-muted)">En curso</div>
              </div>
              <div style="text-align:center;padding:0.75rem;background:var(--a-bg-muted,#f8fafc);border-radius:8px">
                <div style="font-size:1.75rem;font-weight:700;color:#22c55e">{{ d.ticketStats.resolved_this_month }}</div>
                <div style="font-size:0.75rem;color:var(--a-text-muted)">Resueltos este mes</div>
              </div>
              <div style="text-align:center;padding:0.75rem;background:var(--a-bg-muted,#f8fafc);border-radius:8px">
                <div style="font-size:1.75rem;font-weight:700;color:var(--a-brand)">
                  {{ d.ticketStats.avg_resolution_days !== null ? d.ticketStats.avg_resolution_days + 'd' : '—' }}
                </div>
                <div style="font-size:0.75rem;color:var(--a-text-muted)">Tiempo medio</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top 5 clientes -->
        <div class="a-card" style="margin-bottom:2rem">
          <div class="a-card-header">
            <h2 class="a-card-title">Top 5 Clientes</h2>
          </div>
          @if (d.topClients.length === 0) {
            <div class="a-empty"><p>Sin datos de clientes</p></div>
          } @else {
            <div style="overflow-x:auto">
              <table class="a-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Ingresos totales</th>
                    <th>Proyectos</th>
                    <th>Tickets</th>
                  </tr>
                </thead>
                <tbody>
                  @for (client of d.topClients; track client.id; let i = $index) {
                    <tr>
                      <td style="color:var(--a-text-muted);font-weight:600">{{ i + 1 }}</td>
                      <td>
                        <a [routerLink]="['/dashboard/clients', client.id]" style="color:var(--a-brand);text-decoration:none;font-weight:600">
                          {{ client.name }}
                        </a>
                      </td>
                      <td><strong>{{ formatCurrency(client.totalRevenue) }}</strong></td>
                      <td>{{ client.projectCount }}</td>
                      <td>{{ client.ticketCount }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <!-- Proyectos por tipo -->
        <div class="a-card">
          <div class="a-card-header">
            <h2 class="a-card-title">Proyectos por tipo</h2>
          </div>
          @if (d.projectsByType.length === 0) {
            <div class="a-empty"><p>Sin datos de proyectos</p></div>
          } @else {
            <div style="display:flex;flex-direction:column;gap:0.875rem">
              @for (item of d.projectsByType; track item.type) {
                <div style="display:flex;align-items:center;gap:1rem">
                  <div style="width:120px;font-size:0.85rem;flex-shrink:0;text-align:right;color:var(--a-text-muted)">
                    {{ projectTypeLabel(item.type) }}
                  </div>
                  <div style="flex:1;height:10px;background:var(--a-bg-muted,#f1f5f9);border-radius:5px;overflow:hidden">
                    <div
                      [style]="'height:100%;background:var(--a-brand);border-radius:5px;width:' + pct(item.count, maxProjectCount(d.projectsByType)) + '%'"
                    ></div>
                  </div>
                  <div style="width:28px;text-align:right;font-weight:600;font-size:0.9rem">{{ item.count }}</div>
                </div>
              }
            </div>
          }
        </div>

      }
    </div>
  `,
})
export class AnalyticsPageComponent implements OnInit {
  private readonly repo = inject(ANALYTICS_REPOSITORY);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly data = signal<AdvancedAnalytics | null>(null);

  readonly maxRevenue = computed(() => {
    const d = this.data();
    if (!d || d.monthlyRevenue.length === 0) return 1;
    return Math.max(...d.monthlyRevenue.map((r) => r.revenue)) || 1;
  });

  readonly totalRevenue = computed(() => {
    const d = this.data();
    if (!d) return 0;
    return d.monthlyRevenue.reduce((s, r) => s + r.revenue, 0);
  });

  async ngOnInit() {
    try {
      const result = await this.repo.advanced();
      this.data.set(result);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  barHeight(value: number, max: number): number {
    if (max === 0) return 2;
    return Math.max(2, Math.round((value / max) * 96));
  }

  pct(value: number, max: number): number {
    if (max === 0) return 0;
    return Math.round((value / max) * 100);
  }

  maxInvoiceTotal(items: { total: number }[]): number {
    return Math.max(...items.map((i) => i.total)) || 1;
  }

  maxLeadCount(items: { count: number }[]): number {
    return Math.max(...items.map((i) => i.count)) || 1;
  }

  maxProjectCount(items: { count: number }[]): number {
    return Math.max(...items.map((i) => i.count)) || 1;
  }

  formatCurrency(n: number): string {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  }

  monthLabel(m: string): string {
    const [year, month] = m.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString("es-ES", { month: "short" });
  }

  invoiceStatusLabel(status: string): string {
    const map: Record<string, string> = {
      paid: "Pagada",
      sent: "Enviada",
      viewed: "Vista",
      draft: "Borrador",
      cancelled: "Cancelada",
      overdue: "Vencida",
    };
    return map[status] ?? status;
  }

  invoiceStatusColor(status: string): string {
    const map: Record<string, string> = {
      paid: "#22c55e",
      sent: "#3b82f6",
      viewed: "#6366f1",
      draft: "#9ca3af",
      cancelled: "#ef4444",
      overdue: "#f59e0b",
    };
    return map[status] ?? "#6b7280";
  }

  leadStatusLabel(status: string): string {
    const map: Record<string, string> = {
      new: "Nuevo",
      contacted: "Contactado",
      qualified: "Cualificado",
      proposal: "Propuesta",
      negotiation: "Negociación",
      won: "Ganado",
      lost: "Perdido",
    };
    return map[status] ?? status;
  }

  leadStatusColor(status: string): string {
    const map: Record<string, string> = {
      new: "#6366f1",
      contacted: "#3b82f6",
      qualified: "#06b6d4",
      proposal: "#f59e0b",
      negotiation: "#f97316",
      won: "#22c55e",
      lost: "#ef4444",
    };
    return map[status] ?? "#9ca3af";
  }

  projectTypeLabel(type: string): string {
    const map: Record<string, string> = {
      web_dev: "Web Dev",
      automation: "Automatización",
      ai_system: "Sistema IA",
      chatbot: "Chatbot",
      saas: "SaaS",
      consulting: "Consultoría",
      custom: "Custom",
    };
    return map[type] ?? type;
  }
}
