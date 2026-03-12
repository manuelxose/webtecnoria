import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router, ActivatedRoute } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  PROJECT_REPOSITORY,
  ProjectRepository,
  ProjectType,
} from "src/app/domain/repositories/project.repository";
import {
  CLIENT_REPOSITORY,
  ClientRepository,
  Client,
} from "src/app/domain/repositories/client.repository";

@Component({
  selector: "app-project-form",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  <div class="page-header">
    <div class="page-header-left">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <a routerLink="/dashboard/projects" style="color:var(--a-text-muted);font-size:13px;text-decoration:none">Proyectos</a>
        <span style="color:var(--a-text-subtle)">/</span>
        <span style="font-size:13px">Nuevo proyecto</span>
      </div>
      <h1 class="page-title">Nuevo proyecto</h1>
    </div>
  </div>

  @if (error()) {
    <div style="background:var(--a-danger-muted);border:1px solid var(--a-danger);border-radius:var(--a-r-sm);color:var(--a-danger);padding:10px 14px;font-size:13px;margin-bottom:16px">{{ error() }}</div>
  }

  <div class="a-card" style="max-width:680px">
    <form (ngSubmit)="save()">
      <div class="a-form-group">
        <label class="a-label">Nombre del proyecto *</label>
        <input class="a-input" [(ngModel)]="form.name" name="name" required placeholder="Nombre descriptivo">
      </div>
      <div class="a-form-group">
        <label class="a-label">Cliente *</label>
        <select class="a-select" [(ngModel)]="form.client_id" name="client_id" required>
          <option value="">Seleccionar cliente...</option>
          @for (c of clients(); track c.id) {
            <option [value]="c.id">{{ c.name }}</option>
          }
        </select>
      </div>
      <div class="a-form-grid-2">
        <div class="a-form-group">
          <label class="a-label">Tipo</label>
          <select class="a-select" [(ngModel)]="form.type" name="type">
            @for (t of typeOptions; track t.value) {
              <option [value]="t.value">{{ t.label }}</option>
            }
          </select>
        </div>
        <div class="a-form-group">
          <label class="a-label">Prioridad</label>
          <select class="a-select" [(ngModel)]="form.priority" name="priority">
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </div>
      </div>
      <div class="a-form-grid-2">
        <div class="a-form-group">
          <label class="a-label">Fecha inicio</label>
          <input class="a-input" type="date" [(ngModel)]="form.start_date" name="start_date">
        </div>
        <div class="a-form-group">
          <label class="a-label">Deadline</label>
          <input class="a-input" type="date" [(ngModel)]="form.deadline" name="deadline">
        </div>
      </div>
      <div class="a-form-group">
        <label class="a-label">Presupuesto (€)</label>
        <input class="a-input" type="number" [(ngModel)]="form.budget" name="budget" placeholder="0.00">
      </div>
      <div class="a-form-group">
        <label class="a-label">Descripción</label>
        <textarea class="a-textarea" [(ngModel)]="form.description" name="description" rows="3" placeholder="Descripción breve del proyecto..."></textarea>
      </div>
      <div style="display:flex;gap:8px">
        <button type="submit" class="a-btn a-btn-primary" [disabled]="saving()">
          @if (saving()) { <span class="a-spinner" style="width:14px;height:14px"></span> }
          Crear proyecto
        </button>
        <a routerLink="/dashboard/projects" class="a-btn a-btn-ghost">Cancelar</a>
      </div>
    </form>
  </div>
</div>
  `,
})
export class ProjectFormComponent implements OnInit {
  saving = signal(false);
  error = signal("");
  clients = signal<Client[]>([]);

  form = {
    name: "", client_id: "", type: "custom" as ProjectType,
    priority: "medium" as "low" | "medium" | "high" | "critical",
    start_date: "", deadline: "", budget: null as number | null,
    description: "",
  };

  readonly typeOptions = [
    { value: "web_dev",    label: "Desarrollo web" },
    { value: "automation", label: "Automatización" },
    { value: "ai_system",  label: "Sistema IA" },
    { value: "chatbot",    label: "Chatbot" },
    { value: "saas",       label: "SaaS" },
    { value: "consulting", label: "Consultoría" },
    { value: "custom",     label: "Personalizado" },
  ];

  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepo: ProjectRepository,
    @Inject(CLIENT_REPOSITORY)  private readonly clientRepo: ClientRepository,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const result = await this.clientRepo.list({ pageSize: 200 });
      this.clients.set(result.items);
    } catch { /* silent */ }

    const clientId = this.route.snapshot.queryParamMap.get("client_id");
    if (clientId) this.form.client_id = clientId;
  }

  async save(): Promise<void> {
    if (!this.form.name.trim()) { this.error.set("El nombre es obligatorio."); return; }
    if (!this.form.client_id)   { this.error.set("Selecciona un cliente."); return; }

    this.saving.set(true);
    this.error.set("");

    try {
      const created = await this.projectRepo.create({
        name: this.form.name.trim(),
        client_id: this.form.client_id,
        type: this.form.type,
        priority: this.form.priority,
        start_date: this.form.start_date || null,
        deadline: this.form.deadline || null,
        budget: this.form.budget,
        description: this.form.description || null,
      });
      await this.router.navigate(["/dashboard/projects", created.id]);
    } catch {
      this.error.set("No se pudo crear el proyecto.");
      this.saving.set(false);
    }
  }
}
