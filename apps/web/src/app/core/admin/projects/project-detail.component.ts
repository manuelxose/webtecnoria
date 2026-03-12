import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  PROJECT_REPOSITORY,
  ProjectRepository,
  Project,
  Task,
} from "src/app/domain/repositories/project.repository";

type TabId = "overview" | "tasks" | "roadmap";

@Component({
  selector: "app-project-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  @if (loading()) {
    <div style="display:flex;align-items:center;gap:10px;color:var(--a-text-muted);padding:40px 0">
      <span class="a-spinner"></span>
    </div>
  }

  @if (!loading() && !project()) {
    <div class="a-empty">
      <div class="a-empty-title">Proyecto no encontrado</div>
      <a routerLink="/dashboard/projects" class="a-btn a-btn-secondary" style="margin-top:8px">← Volver</a>
    </div>
  }

  @if (project()) {
    <!-- Header -->
    <div class="page-header">
      <div class="page-header-left">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <a routerLink="/dashboard/projects" style="color:var(--a-text-muted);font-size:13px;text-decoration:none">Proyectos</a>
          <span style="color:var(--a-text-subtle)">/</span>
          <span style="font-size:13px;color:var(--a-text)">{{ project()!.name }}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <h1 class="page-title">{{ project()!.name }}</h1>
          <div style="display:flex;gap:6px;align-items:center">
            <span [class]="'a-badge ' + statusBadge(project()!.status)">{{ statusLabel(project()!.status) }}</span>
            <span [class]="'a-badge ' + healthBadge(project()!.health)">{{ healthLabel(project()!.health) }}</span>
            <span class="a-badge a-badge-draft">{{ typeLabel(project()!.type) }}</span>
          </div>
        </div>
        @if (project()!.client_name) {
          <p class="page-subtitle" style="margin-top:4px">
            Cliente:
            <a [routerLink]="['/dashboard/clients', project()!.client_id]" style="color:var(--a-brand)">{{ project()!.client_name }}</a>
          </p>
        }
      </div>
      <div class="page-actions">
        <button class="a-btn a-btn-danger a-btn-icon" (click)="deleteProject()" title="Eliminar proyecto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="a-tabs">
      @for (tab of tabs; track tab.id) {
        <div class="a-tab" [class.active]="activeTab() === tab.id" (click)="activeTab.set(tab.id)">
          {{ tab.label }}
        </div>
      }
    </div>

    <!-- OVERVIEW -->
    @if (activeTab() === 'overview') {
      <div class="a-grid-2" style="align-items:start">
        <div class="a-card">
          <div class="a-card-header"><span class="a-card-title">Información</span></div>
          @if (success()) {
            <div style="background:var(--a-success-muted);border:1px solid var(--a-success);border-radius:var(--a-r-sm);color:var(--a-success);padding:8px 12px;font-size:13px;margin-bottom:12px">{{ success() }}</div>
          }
          <form (ngSubmit)="save()">
            <div class="a-form-group">
              <label class="a-label">Nombre</label>
              <input class="a-input" [(ngModel)]="form.name" name="name">
            </div>
            <div class="a-form-grid-2">
              <div class="a-form-group">
                <label class="a-label">Estado</label>
                <select class="a-select" [(ngModel)]="form.status" name="status">
                  <option value="discovery">Discovery</option>
                  <option value="planning">Planificación</option>
                  <option value="active">Activo</option>
                  <option value="paused">Pausado</option>
                  <option value="review">Revisión</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div class="a-form-group">
                <label class="a-label">Health</label>
                <select class="a-select" [(ngModel)]="form.health" name="health">
                  <option value="on_track">En plazo</option>
                  <option value="at_risk">En riesgo</option>
                  <option value="off_track">Retrasado</option>
                </select>
              </div>
            </div>
            <div class="a-form-grid-2">
              <div class="a-form-group">
                <label class="a-label">Inicio</label>
                <input class="a-input" type="date" [(ngModel)]="form.start_date" name="start_date">
              </div>
              <div class="a-form-group">
                <label class="a-label">Deadline</label>
                <input class="a-input" type="date" [(ngModel)]="form.deadline" name="deadline">
              </div>
            </div>
            <div class="a-form-group">
              <label class="a-label">Presupuesto (€)</label>
              <input class="a-input" type="number" [(ngModel)]="form.budget" name="budget">
            </div>
            <div class="a-form-group">
              <label class="a-label">Descripción</label>
              <textarea class="a-textarea" [(ngModel)]="form.description" name="description" rows="3"></textarea>
            </div>
            <button type="submit" class="a-btn a-btn-primary" [disabled]="saving()">
              @if (saving()) { <span class="a-spinner" style="width:14px;height:14px"></span> }
              Guardar
            </button>
          </form>
        </div>

        <div class="a-card">
          <div style="display:flex;flex-direction:column;gap:12px">
            <div>
              <div style="font-size:11px;color:var(--a-text-subtle);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px">Prioridad</div>
              <div style="display:flex;align-items:center;gap:6px">
                <span class="priority-dot" [class]="project()!.priority"></span>
                <span style="font-size:13px;color:var(--a-text)">{{ priorityLabel(project()!.priority) }}</span>
              </div>
            </div>
            @if (project()!.budget) {
              <div>
                <div style="font-size:11px;color:var(--a-text-subtle);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px">Presupuesto</div>
                <span style="font-size:20px;font-weight:700;color:var(--a-text)">{{ formatCurrency(project()!.budget!) }}</span>
              </div>
            }
            <div>
              <div style="font-size:11px;color:var(--a-text-subtle);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px">Tareas</div>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="flex:1;background:var(--a-border);border-radius:9999px;height:6px">
                  <div [style.width.%]="taskProgress()" style="height:100%;background:var(--a-success);border-radius:9999px;transition:width 0.4s"></div>
                </div>
                <span style="font-size:13px;color:var(--a-text-muted)">{{ doneTasks() }}/{{ totalTasks() }}</span>
              </div>
            </div>
            <div>
              <div style="font-size:11px;color:var(--a-text-subtle);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px">Creado</div>
              <span style="font-size:13px;color:var(--a-text-muted)">{{ formatDate(project()!.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- TASKS KANBAN -->
    @if (activeTab() === 'tasks') {
      <div style="margin-bottom:16px;display:flex;justify-content:flex-end">
        <button class="a-btn a-btn-secondary a-btn-sm" (click)="showTaskForm.set(!showTaskForm())">
          + Nueva tarea
        </button>
      </div>

      @if (showTaskForm()) {
        <div class="a-card" style="margin-bottom:16px;max-width:480px">
          <div class="a-form-group">
            <label class="a-label">Título *</label>
            <input class="a-input" [(ngModel)]="taskForm.title" placeholder="Título de la tarea">
          </div>
          <div class="a-form-grid-2">
            <div class="a-form-group">
              <label class="a-label">Estado</label>
              <select class="a-select" [(ngModel)]="taskForm.status">
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">En progreso</option>
              </select>
            </div>
            <div class="a-form-group">
              <label class="a-label">Prioridad</label>
              <select class="a-select" [(ngModel)]="taskForm.priority">
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="a-btn a-btn-primary a-btn-sm" (click)="saveTask()">Crear tarea</button>
            <button class="a-btn a-btn-ghost a-btn-sm" (click)="showTaskForm.set(false)">Cancelar</button>
          </div>
        </div>
      }

      <div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:16px">
        @for (col of taskCols; track col.status) {
          <div style="flex-shrink:0;width:240px;background:var(--a-bg-raised);border:1px solid var(--a-border);border-radius:var(--a-r-md);display:flex;flex-direction:column;max-height:calc(100dvh - 280px)">
            <div style="padding:10px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--a-border)">
              <span style="font-size:12px;font-weight:600;color:var(--a-text-muted)">{{ col.label }}</span>
              <span style="font-size:12px;font-weight:600;color:var(--a-text-muted)">{{ getTasksByStatus(col.status).length }}</span>
            </div>
            <div style="flex:1;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:6px">
              @for (task of getTasksByStatus(col.status); track task.id) {
                <div style="background:var(--a-bg);border:1px solid var(--a-border);border-radius:var(--a-r-sm);padding:10px 12px">
                  <div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:4px">
                    <span class="priority-dot" [class]="task.priority" style="margin-top:4px;flex-shrink:0"></span>
                    <span style="font-size:13px;color:var(--a-text);line-height:1.4">{{ task.title }}</span>
                  </div>
                  @if (task.due_date) {
                    <div style="font-size:11px;color:var(--a-text-subtle)">{{ formatDate(task.due_date) }}</div>
                  }
                </div>
              }
              @if (getTasksByStatus(col.status).length === 0) {
                <div style="padding:16px 8px;text-align:center;color:var(--a-text-subtle);font-size:12px">Vacío</div>
              }
            </div>
          </div>
        }
      </div>
    }

    <!-- ROADMAP -->
    @if (activeTab() === 'roadmap') {
      <div class="a-card">
        <div class="a-card-header">
          <span class="a-card-title">Milestones</span>
          <button class="a-btn a-btn-secondary a-btn-sm" (click)="showMilestoneForm.set(!showMilestoneForm())">
            + Añadir milestone
          </button>
        </div>

        @if (showMilestoneForm()) {
          <div style="background:var(--a-bg);border:1px solid var(--a-border);border-radius:var(--a-r-sm);padding:14px;margin-bottom:16px">
            <div class="a-form-grid-2">
              <div class="a-form-group">
                <label class="a-label">Nombre *</label>
                <input class="a-input" [(ngModel)]="milestoneForm.name">
              </div>
              <div class="a-form-group">
                <label class="a-label">Fecha límite</label>
                <input class="a-input" type="date" [(ngModel)]="milestoneForm.due_date">
              </div>
            </div>
            <div style="display:flex;gap:8px">
              <button class="a-btn a-btn-primary a-btn-sm" (click)="saveMilestone()">Guardar</button>
              <button class="a-btn a-btn-ghost a-btn-sm" (click)="showMilestoneForm.set(false)">Cancelar</button>
            </div>
          </div>
        }

        @if (!project()!.milestones?.length) {
          <div class="a-empty" style="padding:32px 0">
            <div class="a-empty-desc">Sin milestones. Añade los hitos del proyecto.</div>
          </div>
        } @else {
          <div style="display:flex;flex-direction:column;gap:8px">
            @for (m of project()!.milestones; track m.id) {
              <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--a-border)">
                <div style="width:10px;height:10px;border-radius:50%;flex-shrink:0"
                     [style.background]="m.status === 'completed' ? 'var(--a-success)' : 'var(--a-border-strong)'"></div>
                <div style="flex:1">
                  <div style="font-size:13px;font-weight:500;color:var(--a-text)">{{ m.name }}</div>
                  @if (m.due_date) {
                    <div style="font-size:12px;color:var(--a-text-muted)">{{ formatDate(m.due_date) }}</div>
                  }
                </div>
                <span [class]="'a-badge ' + milestoneStatusBadge(m.status)">{{ milestoneStatusLabel(m.status) }}</span>
              </div>
            }
          </div>
        }
      </div>
    }
  }
</div>
  `,
})
export class ProjectDetailComponent implements OnInit {
  project = signal<Project | null>(null);
  loading = signal(true);
  saving = signal(false);
  success = signal("");
  activeTab = signal<TabId>("overview");
  showTaskForm = signal(false);
  showMilestoneForm = signal(false);

  form = {
    name: "", status: "discovery" as any, health: "on_track" as any,
    start_date: "", deadline: "", budget: null as number | null, description: "",
  };

  taskForm = {
    title: "", status: "todo" as any, priority: "medium" as any,
  };

  milestoneForm = { name: "", due_date: "" };

  readonly tabs = [
    { id: "overview" as TabId, label: "Resumen" },
    { id: "tasks"    as TabId, label: "Tareas" },
    { id: "roadmap"  as TabId, label: "Roadmap" },
  ];

  readonly taskCols = [
    { status: "backlog",     label: "Backlog" },
    { status: "todo",        label: "To Do" },
    { status: "in_progress", label: "En progreso" },
    { status: "review",      label: "Revisión" },
    { status: "done",        label: "Hecho" },
  ];

  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepo: ProjectRepository,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id || id === "new") { this.loading.set(false); return; }

    try {
      const p = await this.projectRepo.get(id);
      this.project.set(p);
      if (p) {
        this.form = {
          name: p.name, status: p.status, health: p.health,
          start_date: p.start_date?.slice(0, 10) ?? "",
          deadline: p.deadline?.slice(0, 10) ?? "",
          budget: p.budget ?? null, description: p.description ?? "",
        };
      }
    } catch { /* silent */ }
    finally { this.loading.set(false); }
  }

  async save(): Promise<void> {
    const id = this.project()?.id;
    if (!id) return;

    this.saving.set(true);
    this.success.set("");

    try {
      const updated = await this.projectRepo.update(id, {
        name: this.form.name, status: this.form.status, health: this.form.health,
        start_date: this.form.start_date || null,
        deadline: this.form.deadline || null,
        budget: this.form.budget,
        description: this.form.description || null,
      });
      this.project.update((p) => p ? { ...p, ...updated } : p);
      this.success.set("Proyecto actualizado.");
    } catch { /* silent */ }
    finally { this.saving.set(false); }
  }

  async saveTask(): Promise<void> {
    const id = this.project()?.id;
    if (!id || !this.taskForm.title.trim()) return;

    try {
      const task = await this.projectRepo.createTask(id, {
        title: this.taskForm.title.trim(),
        status: this.taskForm.status,
        priority: this.taskForm.priority,
      });
      this.project.update((p) => {
        if (!p) return p;
        return { ...p, tasks: [...(p.tasks ?? []), task] };
      });
      this.taskForm = { title: "", status: "todo", priority: "medium" };
      this.showTaskForm.set(false);
    } catch { /* silent */ }
  }

  async saveMilestone(): Promise<void> {
    const id = this.project()?.id;
    if (!id || !this.milestoneForm.name.trim()) return;

    try {
      const m = await this.projectRepo.createMilestone(id, {
        name: this.milestoneForm.name.trim(),
        due_date: this.milestoneForm.due_date || null,
      });
      this.project.update((p) => {
        if (!p) return p;
        return { ...p, milestones: [...(p.milestones ?? []), m] };
      });
      this.milestoneForm = { name: "", due_date: "" };
      this.showMilestoneForm.set(false);
    } catch { /* silent */ }
  }

  async deleteProject(): Promise<void> {
    const id = this.project()?.id;
    if (!id || !confirm("¿Eliminar este proyecto y todas sus tareas?")) return;
    try {
      await this.projectRepo.delete(id);
      await this.router.navigate(["/dashboard/projects"]);
    } catch { /* silent */ }
  }

  getTasksByStatus(status: string): Task[] {
    return (this.project()?.tasks ?? []).filter((t) => t.status === status);
  }

  totalTasks(): number { return this.project()?.tasks?.length ?? 0; }
  doneTasks(): number  { return this.project()?.tasks?.filter((t) => t.status === "done").length ?? 0; }
  taskProgress(): number {
    const total = this.totalTasks();
    return total ? Math.round((this.doneTasks() / total) * 100) : 0;
  }

  statusBadge(s: string): string {
    const m: Record<string, string> = {
      active: "a-badge-active", completed: "a-badge-accent", discovery: "a-badge-info",
      planning: "a-badge-info", paused: "a-badge-pending", review: "a-badge-pending", cancelled: "a-badge-inactive",
    };
    return m[s] ?? "a-badge-draft";
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      discovery: "Discovery", planning: "Planificación", active: "Activo",
      paused: "Pausado", review: "Revisión", completed: "Completado", cancelled: "Cancelado",
    };
    return m[s] ?? s;
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
    const m: Record<string, string> = {
      web_dev: "Web Dev", automation: "Automatización", ai_system: "AI",
      chatbot: "Chatbot", saas: "SaaS", consulting: "Consultoría", custom: "Custom",
    };
    return m[t] ?? t;
  }

  priorityLabel(p: string): string {
    return { low: "Baja", medium: "Media", high: "Alta", critical: "Crítica" }[p] ?? p;
  }

  milestoneStatusBadge(s: string): string {
    if (s === "completed")  return "a-badge-active";
    if (s === "in_progress") return "a-badge-info";
    if (s === "cancelled")  return "a-badge-inactive";
    return "a-badge-draft";
  }

  milestoneStatusLabel(s: string): string {
    return { pending: "Pendiente", in_progress: "En curso", completed: "Completado", cancelled: "Cancelado" }[s] ?? s;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "2-digit" });
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(v);
  }
}
