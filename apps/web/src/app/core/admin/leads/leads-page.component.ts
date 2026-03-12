import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  LEAD_REPOSITORY,
  LeadRepository,
  Lead,
  LeadStatus,
  LeadStats,
} from "src/app/domain/repositories/lead.repository";

type PipelineColumn = {
  status: LeadStatus;
  label: string;
  badge: string;
  leads: Lead[];
};

@Component({
  selector: "app-leads-page",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  <!-- Header -->
  <div class="page-header">
    <div class="page-header-left">
      <h1 class="page-title">Leads</h1>
      <p class="page-subtitle">{{ totalLeads() }} leads en total</p>
    </div>
    <div class="page-actions">
      <button class="a-btn a-btn-secondary" (click)="view.set(view() === 'pipeline' ? 'table' : 'pipeline')">
        @if (view() === 'pipeline') {
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          Lista
        } @else {
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="5" height="18"/><rect x="10" y="8" width="5" height="13"/><rect x="17" y="5" width="5" height="16"/></svg>
          Pipeline
        }
      </button>
      <a routerLink="/dashboard/leads/new" class="a-btn a-btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo lead
      </a>
    </div>
  </div>

  <!-- Filters -->
  <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">
    @for (s of statusFilters; track s.value) {
      <button
        class="a-btn"
        [class.a-btn-secondary]="filterStatus() !== s.value"
        [class.a-btn-primary]="filterStatus() === s.value"
        style="height:28px;font-size:12px"
        (click)="setFilter(s.value)">
        {{ s.label }}
        @if (s.value !== 'all') {
          <span style="margin-left:2px">({{ getStatusCount(s.value) }})</span>
        }
      </button>
    }
  </div>

  @if (loading()) {
    <div style="display:flex;align-items:center;gap:10px;color:var(--a-text-muted);padding:40px 0">
      <span class="a-spinner"></span> Cargando leads...
    </div>
  }

  @if (!loading()) {
    <!-- PIPELINE VIEW -->
    @if (view() === 'pipeline') {
      <div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:16px">
        @for (col of pipeline(); track col.status) {
          <div style="flex-shrink:0;width:260px;background:var(--a-bg-raised);border:1px solid var(--a-border);border-radius:var(--a-r-md);display:flex;flex-direction:column;max-height:calc(100dvh - 220px)">
            <!-- Column header -->
            <div style="padding:12px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--a-border)">
              <div style="display:flex;align-items:center;gap:8px">
                <span [class]="'a-badge ' + col.badge">{{ col.label }}</span>
              </div>
              <span style="font-size:13px;font-weight:600;color:var(--a-text-muted)">{{ col.leads.length }}</span>
            </div>
            <!-- Cards -->
            <div style="flex:1;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:6px">
              @for (lead of col.leads; track lead.id) {
                <a [routerLink]="['/dashboard/leads', lead.id]"
                   style="display:block;background:var(--a-bg);border:1px solid var(--a-border);border-radius:var(--a-r-sm);padding:10px 12px;text-decoration:none;transition:border-color var(--a-t-fast),transform var(--a-t-fast)"
                   (mouseenter)="$event.currentTarget.style.borderColor='var(--a-border-strong)'"
                   (mouseleave)="$event.currentTarget.style.borderColor='var(--a-border)'">
                  <div style="font-size:13px;font-weight:500;color:var(--a-text);margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ lead.name }}</div>
                  @if (lead.company_name) {
                    <div style="font-size:12px;color:var(--a-text-muted);margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ lead.company_name }}</div>
                  }
                  <div style="display:flex;align-items:center;justify-content:space-between">
                    <span class="a-badge a-badge-draft" style="font-size:10px">{{ sourceLabel(lead.source) }}</span>
                    <span style="font-size:11px;color:var(--a-text-subtle)">{{ formatDate(lead.created_at) }}</span>
                  </div>
                </a>
              }
              @if (col.leads.length === 0) {
                <div style="padding:20px 8px;text-align:center;color:var(--a-text-subtle);font-size:12px">Sin leads</div>
              }
            </div>
          </div>
        }
      </div>
    }

    <!-- TABLE VIEW -->
    @if (view() === 'table') {
      @if (leads().length === 0) {
        <div class="a-empty">
          <svg class="a-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
          <div class="a-empty-title">Sin leads</div>
          <div class="a-empty-desc">Crea el primer lead o importa desde un formulario.</div>
          <a routerLink="/dashboard/leads/new" class="a-btn a-btn-primary" style="margin-top:8px">Crear lead</a>
        </div>
      } @else {
        <div class="a-table-wrap">
          <table class="a-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Empresa</th>
                <th>Email</th>
                <th>Fuente</th>
                <th>Estado</th>
                <th>Puntuación</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (lead of leads(); track lead.id) {
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px">
                      <div class="a-avatar sm">{{ lead.name.slice(0,2).toUpperCase() }}</div>
                      <span style="font-weight:500">{{ lead.name }}</span>
                    </div>
                  </td>
                  <td style="color:var(--a-text-muted)">{{ lead.company_name || '—' }}</td>
                  <td style="color:var(--a-text-muted)">{{ lead.email }}</td>
                  <td><span class="a-badge a-badge-draft">{{ sourceLabel(lead.source) }}</span></td>
                  <td><span [class]="'a-badge ' + statusBadge(lead.status)">{{ statusLabel(lead.status) }}</span></td>
                  <td>
                    <div style="display:flex;align-items:center;gap:6px">
                      <div style="flex:1;background:var(--a-border);border-radius:9999px;height:4px;width:48px">
                        <div [style.width.%]="lead.score" style="height:100%;background:var(--a-brand);border-radius:9999px"></div>
                      </div>
                      <span style="font-size:12px;color:var(--a-text-muted)">{{ lead.score }}</span>
                    </div>
                  </td>
                  <td style="color:var(--a-text-muted);white-space:nowrap">{{ formatDate(lead.created_at) }}</td>
                  <td>
                    <div class="row-actions">
                      <a [routerLink]="['/dashboard/leads', lead.id]" class="a-btn a-btn-ghost a-btn-sm a-btn-icon" title="Ver detalle">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </a>
                      <button class="a-btn a-btn-ghost a-btn-sm a-btn-icon" (click)="deleteLead(lead)" title="Eliminar" style="color:var(--a-danger)">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
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
  }
</div>
  `,
})
export class LeadsPageComponent implements OnInit {
  leads = signal<Lead[]>([]);
  stats = signal<LeadStats | null>(null);
  totalLeads = signal(0);
  loading = signal(true);
  view = signal<"pipeline" | "table">("pipeline");
  filterStatus = signal("all");

  readonly statusFilters = [
    { value: "all",         label: "Todos" },
    { value: "new",         label: "Nuevo" },
    { value: "contacted",   label: "Contactado" },
    { value: "qualified",   label: "Cualificado" },
    { value: "proposal",    label: "Propuesta" },
    { value: "negotiation", label: "Negociación" },
    { value: "won",         label: "Ganado" },
    { value: "lost",        label: "Perdido" },
  ];

  readonly pipelineStatuses: { status: LeadStatus; label: string; badge: string }[] = [
    { status: "new",         label: "Nuevo",       badge: "a-badge-info" },
    { status: "contacted",   label: "Contactado",   badge: "a-badge-info" },
    { status: "qualified",   label: "Cualificado",  badge: "a-badge-pending" },
    { status: "proposal",    label: "Propuesta",    badge: "a-badge-pending" },
    { status: "negotiation", label: "Negociación",  badge: "a-badge-pending" },
    { status: "won",         label: "Ganado",       badge: "a-badge-active" },
  ];

  pipeline = signal<PipelineColumn[]>([]);

  constructor(
    @Inject(LEAD_REPOSITORY) private readonly leadRepo: LeadRepository
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [result, statsResult] = await Promise.all([
        this.leadRepo.list({ status: this.filterStatus() !== "all" ? this.filterStatus() : undefined, pageSize: 200 }),
        this.leadRepo.stats(),
      ]);

      this.leads.set(result.items);
      this.totalLeads.set(result.total);
      this.stats.set(statsResult);
      this.buildPipeline(result.items);
    } catch { /* silent */ }
    finally { this.loading.set(false); }
  }

  buildPipeline(leads: Lead[]): void {
    this.pipeline.set(
      this.pipelineStatuses.map((s) => ({
        ...s,
        leads: leads.filter((l) => l.status === s.status),
      }))
    );
  }

  async setFilter(status: string): Promise<void> {
    this.filterStatus.set(status);
    await this.load();
  }

  getStatusCount(status: string): number {
    const found = this.stats()?.byStatus.find((s) => s.status === status);
    return found ? Number(found.count) : 0;
  }

  async deleteLead(lead: Lead): Promise<void> {
    if (!confirm(`Eliminar lead "${lead.name}"?`)) return;
    try {
      await this.leadRepo.delete(lead.id);
      await this.load();
    } catch { /* silent */ }
  }

  statusBadge(s: string): string {
    const map: Record<string, string> = {
      new: "a-badge-info", contacted: "a-badge-info",
      qualified: "a-badge-pending", proposal: "a-badge-pending",
      negotiation: "a-badge-pending", won: "a-badge-active", lost: "a-badge-inactive",
    };
    return map[s] ?? "a-badge-draft";
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      new: "Nuevo", contacted: "Contactado", qualified: "Cualificado",
      proposal: "Propuesta", negotiation: "Negociación", won: "Ganado", lost: "Perdido",
    };
    return map[s] ?? s;
  }

  sourceLabel(s: string): string {
    const map: Record<string, string> = {
      web_form: "Web", manual: "Manual", import: "Import",
      referral: "Referral", talkaris: "Talkaris", auctorio: "Auctorio", other: "Otro",
    };
    return map[s] ?? s;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "2-digit" });
  }
}
