import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  TICKET_REPOSITORY,
  TicketRepository,
  Ticket,
  TicketStats,
} from "src/app/domain/repositories/ticket.repository";

@Component({
  selector: "app-tickets-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  <div class="page-header">
    <div class="page-header-left">
      <h1 class="page-title">Soporte</h1>
      <p class="page-subtitle">Gestión de tickets y solicitudes de clientes</p>
    </div>
    <div class="page-actions">
      <a routerLink="/dashboard/support/new" class="a-btn a-btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo ticket
      </a>
    </div>
  </div>

  <!-- KPIs -->
  @if (stats()) {
    <div class="a-grid-4" style="margin-bottom:20px">
      <div class="kpi-card">
        <div class="kpi-card-label">Abiertos</div>
        <div class="kpi-card-value">{{ stats()!.open_count }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-label">Urgentes</div>
        <div class="kpi-card-value" [style.color]="Number(stats()!.urgent_count) > 0 ? 'var(--a-danger)' : 'var(--a-text)'">{{ stats()!.urgent_count }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-label">Resueltos</div>
        <div class="kpi-card-value">{{ stats()!.resolved_count }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-label">Resueltos este mes</div>
        <div class="kpi-card-value">{{ stats()!.resolved_this_month }}</div>
      </div>
    </div>
  }

  <!-- Filters -->
  <div class="a-filters">
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      @for (s of statusOptions; track s.value) {
        <button
          [class]="'a-btn a-btn-sm ' + (filterStatus() === s.value ? 'a-btn-primary' : 'a-btn-ghost')"
          (click)="setStatus(s.value)">
          {{ s.label }}
        </button>
      }
    </div>
    <div style="display:flex;gap:8px;align-items:center;margin-left:auto">
      <select class="a-select" style="width:140px" [(ngModel)]="filterPriority" (ngModelChange)="load()">
        <option value="">Toda prioridad</option>
        <option value="critical">Crítica</option>
        <option value="high">Alta</option>
        <option value="medium">Media</option>
        <option value="low">Baja</option>
      </select>
    </div>
  </div>

  @if (loading()) {
    <div style="display:flex;align-items:center;gap:10px;color:var(--a-text-muted);padding:40px 0"><span class="a-spinner"></span> Cargando tickets…</div>
  } @else if (tickets().length === 0) {
    <div class="a-empty">
      <div class="a-empty-title">Sin tickets</div>
      <div class="a-empty-desc">No hay tickets con los filtros seleccionados.</div>
      <a routerLink="/dashboard/support/new" class="a-btn a-btn-primary" style="margin-top:12px">Crear ticket</a>
    </div>
  } @else {
    <div class="a-table-wrap">
      <table class="a-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Título</th>
            <th>Cliente</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Mensajes</th>
            <th>Creado</th>
          </tr>
        </thead>
        <tbody>
          @for (t of tickets(); track t.id) {
            <tr style="cursor:pointer" [routerLink]="['/dashboard/support', t.id]">
              <td style="font-family:monospace;color:var(--a-text-muted);font-size:12px">#{{ t.number }}</td>
              <td>
                <div style="font-weight:500;max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ t.title }}</div>
                @if (t.project_name) {
                  <div style="font-size:12px;color:var(--a-text-muted)">{{ t.project_name }}</div>
                }
              </td>
              <td style="color:var(--a-text-muted)">{{ t.client_name }}</td>
              <td><span [class]="'a-badge ' + priorityBadge(t.priority)">{{ priorityLabel(t.priority) }}</span></td>
              <td><span [class]="'a-badge ' + statusBadge(t.status)">{{ statusLabel(t.status) }}</span></td>
              <td style="color:var(--a-text-muted);font-size:13px">{{ t.message_count || 0 }}</td>
              <td style="color:var(--a-text-muted);font-size:13px">{{ formatDate(t.created_at) }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (total() > pageSize) {
      <div style="display:flex;align-items:center;gap:8px;margin-top:12px;justify-content:flex-end">
        <button class="a-btn a-btn-ghost a-btn-sm" [disabled]="page() === 1" (click)="goPage(page()-1)">← Anterior</button>
        <span style="font-size:13px;color:var(--a-text-muted)">Página {{ page() }} de {{ totalPages() }}</span>
        <button class="a-btn a-btn-ghost a-btn-sm" [disabled]="page() >= totalPages()" (click)="goPage(page()+1)">Siguiente →</button>
      </div>
    }
  }
</div>
  `,
})
export class TicketsListComponent implements OnInit {
  tickets = signal<Ticket[]>([]);
  stats   = signal<TicketStats | null>(null);
  loading = signal(true);
  total   = signal(0);
  page    = signal(1);
  readonly pageSize = 20;

  filterStatus   = signal("");
  filterPriority = "";

  readonly Number = Number;

  readonly statusOptions = [
    { value: "",           label: "Todos" },
    { value: "open",       label: "Abierto" },
    { value: "in_progress",label: "En curso" },
    { value: "waiting",    label: "En espera" },
    { value: "resolved",   label: "Resuelto" },
    { value: "closed",     label: "Cerrado" },
  ];

  constructor(
    @Inject(TICKET_REPOSITORY) private readonly ticketRepo: TicketRepository
  ) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([this.load(), this.loadStats()]);
  }

  async loadStats(): Promise<void> {
    try { this.stats.set(await this.ticketRepo.stats()); } catch { /* silent */ }
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await this.ticketRepo.list({
        status:   this.filterStatus() || undefined,
        priority: this.filterPriority || undefined,
        page:     this.page(),
        pageSize: this.pageSize,
      });
      this.tickets.set(res.items);
      this.total.set(res.total);
    } catch { /* silent */ }
    finally { this.loading.set(false); }
  }

  setStatus(v: string): void {
    this.filterStatus.set(v);
    this.page.set(1);
    this.load();
  }

  goPage(p: number): void {
    this.page.set(p);
    this.load();
  }

  totalPages(): number {
    return Math.ceil(this.total() / this.pageSize);
  }

  priorityBadge(p: string): string {
    return { low: "a-badge-draft", medium: "a-badge-info", high: "a-badge-pending", critical: "a-badge-danger" }[p] ?? "a-badge-draft";
  }
  priorityLabel(p: string): string {
    return { low: "Baja", medium: "Media", high: "Alta", critical: "Crítica" }[p] ?? p;
  }
  statusBadge(s: string): string {
    return { open: "a-badge-info", in_progress: "a-badge-accent", waiting: "a-badge-pending", resolved: "a-badge-active", closed: "a-badge-inactive" }[s] ?? "a-badge-draft";
  }
  statusLabel(s: string): string {
    return { open: "Abierto", in_progress: "En curso", waiting: "En espera", resolved: "Resuelto", closed: "Cerrado" }[s] ?? s;
  }
  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  }
}
