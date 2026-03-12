import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  PROJECT_REPOSITORY,
  ProjectRepository,
  Project,
  ProjectStatus,
} from "src/app/domain/repositories/project.repository";

@Component({
  selector: "app-projects-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  <div class="page-header">
    <div class="page-header-left">
      <h1 class="page-title">Proyectos</h1>
      <p class="page-subtitle">{{ total() }} proyectos en total</p>
    </div>
    <div class="page-actions">
      <button class="a-btn a-btn-secondary" (click)="view.set(view() === 'kanban' ? 'table' : 'kanban')">
        @if (view() === 'kanban') {
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>
          Lista
        } @else {
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="5" height="18"/><rect x="10" y="8" width="5" height="13"/><rect x="17" y="5" width="5" height="16"/></svg>
          Kanban
        }
      </button>
      <a routerLink="/dashboard/projects/new" class="a-btn a-btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo proyecto
      </a>
    </div>
  </div>

  <!-- Filters -->
  <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">
    @for (f of statusFilters; track f.value) {
      <button
        class="a-btn"
        [class.a-btn-secondary]="filterStatus() !== f.value"
        [class.a-btn-primary]="filterStatus() === f.value"
        style="height:28px;font-size:12px"
        (click)="setFilter(f.value)">
        {{ f.label }}
      </button>
    }
  </div>

  @if (loading()) {
    <div style="display:flex;align-items:center;gap:10px;color:var(--a-text-muted);padding:40px 0">
      <span class="a-spinner"></span> Cargando proyectos...
    </div>
  }

  @if (!loading()) {
    <!-- KANBAN VIEW -->
    @if (view() === 'kanban') {
      <div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:16px">
        @for (col of kanbanCols; track col.status) {
          <div style="flex-shrink:0;width:250px;background:var(--a-bg-raised);border:1px solid var(--a-border);border-radius:var(--a-r-md);display:flex;flex-direction:column;max-height:calc(100dvh - 220px)">
            <div style="padding:10px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--a-border)">
              <span [class]="'a-badge ' + col.badge">{{ col.label }}</span>
              <span style="font-size:13px;font-weight:600;color:var(--a-text-muted)">{{ getProjectsByStatus(col.status).length }}</span>
            </div>
            <div style="flex:1;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:6px">
              @for (p of getProjectsByStatus(col.status); track p.id) {
                <a [routerLink]="['/dashboard/projects', p.id]"
                   style="display:block;background:var(--a-bg);border:1px solid var(--a-border);border-radius:var(--a-r-sm);padding:10px 12px;text-decoration:none;transition:border-color var(--a-t-fast)"
                   (mouseenter)="$event.currentTarget.style.borderColor='var(--a-border-strong)'"
                   (mouseleave)="$event.currentTarget.style.borderColor='var(--a-border)'">
                  <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                    <span class="priority-dot" [class]="p.priority" style="flex-shrink:0"></span>
                    <span style="font-size:13px;font-weight:500;color:var(--a-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ p.name }}</span>
                  </div>
                  <div style="font-size:12px;color:var(--a-text-muted);margin-bottom:6px">{{ p.client_name }}</div>
                  <div style="display:flex;align-items:center;justify-content:space-between">
                    <span [class]="'a-badge ' + healthBadge(p.health)" style="font-size:10px">{{ healthLabel(p.health) }}</span>
                    @if (p.deadline) {
                      <span style="font-size:11px;color:var(--a-text-subtle)">{{ formatDate(p.deadline) }}</span>
                    }
                  </div>
                </a>
              }
              @if (getProjectsByStatus(col.status).length === 0) {
                <div style="padding:20px 8px;text-align:center;color:var(--a-text-subtle);font-size:12px">Sin proyectos</div>
              }
            </div>
          </div>
        }
      </div>
    }

    <!-- TABLE VIEW -->
    @if (view() === 'table') {
      @if (projects().length === 0) {
        <div class="a-empty">
          <svg class="a-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <div class="a-empty-title">Sin proyectos</div>
          <div class="a-empty-desc">Crea el primer proyecto para empezar a hacer seguimiento.</div>
          <a routerLink="/dashboard/projects/new" class="a-btn a-btn-primary" style="margin-top:8px">Nuevo proyecto</a>
        </div>
      } @else {
        <div class="a-table-wrap">
          <table class="a-table">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Health</th>
                <th>Prioridad</th>
                <th>Deadline</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (p of projects(); track p.id) {
                <tr>
                  <td style="font-weight:500">{{ p.name }}</td>
                  <td style="color:var(--a-text-muted)">{{ p.client_name }}</td>
                  <td><span class="a-badge a-badge-draft">{{ typeLabel(p.type) }}</span></td>
                  <td><span [class]="'a-badge ' + statusBadge(p.status)">{{ statusLabel(p.status) }}</span></td>
                  <td><span [class]="'a-badge ' + healthBadge(p.health)">{{ healthLabel(p.health) }}</span></td>
                  <td><span class="priority-dot" [class]="p.priority"></span></td>
                  <td style="color:var(--a-text-muted);white-space:nowrap">{{ p.deadline ? formatDate(p.deadline) : '—' }}</td>
                  <td>
                    <div class="row-actions">
                      <a [routerLink]="['/dashboard/projects', p.id]" class="a-btn a-btn-ghost a-btn-sm">Ver</a>
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
export class ProjectsListComponent implements OnInit {
  projects = signal<Project[]>([]);
  total = signal(0);
  loading = signal(true);
  view = signal<"kanban" | "table">("kanban");
  filterStatus = signal("all");

  readonly statusFilters = [
    { value: "all",       label: "Todos" },
    { value: "active",    label: "Activos" },
    { value: "discovery", label: "Discovery" },
    { value: "planning",  label: "Planificación" },
    { value: "paused",    label: "Pausados" },
    { value: "review",    label: "Revisión" },
    { value: "completed", label: "Completados" },
  ];

  readonly kanbanCols = [
    { status: "discovery" as ProjectStatus, label: "Discovery",      badge: "a-badge-info" },
    { status: "planning"  as ProjectStatus, label: "Planificación",  badge: "a-badge-info" },
    { status: "active"    as ProjectStatus, label: "Activo",         badge: "a-badge-active" },
    { status: "review"    as ProjectStatus, label: "Revisión",       badge: "a-badge-pending" },
    { status: "completed" as ProjectStatus, label: "Completado",     badge: "a-badge-accent" },
  ];

  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepo: ProjectRepository
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.projectRepo.list({
        status: this.filterStatus() !== "all" ? this.filterStatus() : undefined,
        pageSize: 200,
      });
      this.projects.set(result.items);
      this.total.set(result.total);
    } catch { /* silent */ }
    finally { this.loading.set(false); }
  }

  async setFilter(status: string): Promise<void> {
    this.filterStatus.set(status);
    await this.load();
  }

  getProjectsByStatus(status: ProjectStatus): Project[] {
    return this.projects().filter((p) => p.status === status);
  }

  statusBadge(s: string): string {
    const map: Record<string, string> = {
      active: "a-badge-active", completed: "a-badge-accent",
      discovery: "a-badge-info", planning: "a-badge-info",
      paused: "a-badge-pending", review: "a-badge-pending",
      cancelled: "a-badge-inactive",
    };
    return map[s] ?? "a-badge-draft";
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      discovery: "Discovery", planning: "Planificación", active: "Activo",
      paused: "Pausado", review: "Revisión", completed: "Completado", cancelled: "Cancelado",
    };
    return map[s] ?? s;
  }

  healthBadge(h: string): string {
    if (h === "on_track") return "a-badge-active";
    if (h === "at_risk")  return "a-badge-pending";
    return "a-badge-danger";
  }

  healthLabel(h: string): string {
    return { on_track: "En plazo", at_risk: "En riesgo", off_track: "Retrasado" }[h] ?? h;
  }

  typeLabel(t: string): string {
    const map: Record<string, string> = {
      web_dev: "Web Dev", automation: "Automatización", ai_system: "AI",
      chatbot: "Chatbot", saas: "SaaS", consulting: "Consultoría", custom: "Custom",
    };
    return map[t] ?? t;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "2-digit" });
  }
}
