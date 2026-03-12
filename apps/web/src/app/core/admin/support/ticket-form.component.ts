import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  TICKET_REPOSITORY,
  TicketRepository,
} from "src/app/domain/repositories/ticket.repository";
import {
  CLIENT_REPOSITORY,
  ClientRepository,
  Client,
} from "src/app/domain/repositories/client.repository";

@Component({
  selector: "app-ticket-form",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  <div class="page-header">
    <div class="page-header-left">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <a routerLink="/dashboard/support" style="color:var(--a-text-muted);font-size:13px;text-decoration:none">Soporte</a>
        <span style="color:var(--a-text-subtle)">/</span>
        <span style="font-size:13px">Nuevo ticket</span>
      </div>
      <h1 class="page-title">Nuevo ticket</h1>
    </div>
  </div>

  @if (error()) {
    <div style="background:var(--a-danger-muted);border:1px solid var(--a-danger);border-radius:var(--a-r-sm);color:var(--a-danger);padding:10px 14px;font-size:13px;margin-bottom:16px">{{ error() }}</div>
  }

  <div class="a-card" style="max-width:680px">
    <div class="a-card-header"><span class="a-card-title">Datos del ticket</span></div>
    <form (ngSubmit)="submit()">
      <div class="a-form-group">
        <label class="a-label">Título *</label>
        <input class="a-input" [(ngModel)]="form.title" name="title" required placeholder="Describe el problema brevemente">
      </div>
      <div class="a-form-group">
        <label class="a-label">Descripción</label>
        <textarea class="a-textarea" [(ngModel)]="form.description" name="description" rows="4" placeholder="Detalles, pasos para reproducir, contexto…"></textarea>
      </div>
      <div class="a-form-group">
        <label class="a-label">Cliente *</label>
        @if (loadingClients()) {
          <div style="color:var(--a-text-muted);font-size:13px">Cargando clientes…</div>
        } @else {
          <select class="a-select" [(ngModel)]="form.client_id" name="client_id" required>
            <option value="">— Seleccionar cliente —</option>
            @for (c of clients(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
        }
      </div>
      <div class="a-form-grid-2">
        <div class="a-form-group">
          <label class="a-label">Prioridad</label>
          <select class="a-select" [(ngModel)]="form.priority" name="priority">
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </div>
        <div class="a-form-group">
          <label class="a-label">Categoría</label>
          <select class="a-select" [(ngModel)]="form.category" name="category">
            <option value="general">General</option>
            <option value="bug">Bug / Error</option>
            <option value="feature">Solicitud de funcionalidad</option>
            <option value="billing">Facturación</option>
            <option value="access">Acceso / Permisos</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div class="a-form-group">
          <label class="a-label">Fuente</label>
          <select class="a-select" [(ngModel)]="form.source" name="source">
            <option value="manual">Manual (backoffice)</option>
            <option value="email">Email</option>
            <option value="portal">Portal de cliente</option>
            <option value="talkaris">Talkaris</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div class="a-form-group">
          <label class="a-label">Estado inicial</label>
          <select class="a-select" [(ngModel)]="form.status" name="status">
            <option value="open">Abierto</option>
            <option value="in_progress">En curso</option>
            <option value="waiting">En espera</option>
          </select>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button type="submit" class="a-btn a-btn-primary" [disabled]="saving()">
          @if (saving()) { <span class="a-spinner" style="width:14px;height:14px"></span> }
          Crear ticket
        </button>
        <a routerLink="/dashboard/support" class="a-btn a-btn-secondary">Cancelar</a>
      </div>
    </form>
  </div>
</div>
  `,
})
export class TicketFormComponent implements OnInit {
  saving        = signal(false);
  error         = signal("");
  loadingClients = signal(true);
  clients       = signal<Client[]>([]);

  form = {
    title:       "",
    description: "",
    client_id:   "",
    priority:    "medium" as "low" | "medium" | "high" | "critical",
    category:    "general" as "general" | "bug" | "feature" | "billing" | "access" | "other",
    source:      "manual" as "manual" | "email" | "portal" | "talkaris" | "other",
    status:      "open" as "open" | "in_progress" | "waiting",
  };

  constructor(
    @Inject(TICKET_REPOSITORY) private readonly ticketRepo: TicketRepository,
    @Inject(CLIENT_REPOSITORY) private readonly clientRepo: ClientRepository,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const res = await this.clientRepo.list({ pageSize: 200 });
      this.clients.set(res.items);
    } catch { /* silent */ }
    finally { this.loadingClients.set(false); }
  }

  async submit(): Promise<void> {
    if (!this.form.title.trim() || !this.form.client_id) {
      this.error.set("El título y el cliente son obligatorios.");
      return;
    }
    this.saving.set(true);
    this.error.set("");
    try {
      const ticket = await this.ticketRepo.create({
        title:       this.form.title.trim(),
        description: this.form.description || null,
        client_id:   this.form.client_id,
        priority:    this.form.priority,
        category:    this.form.category,
        source:      this.form.source,
        status:      this.form.status,
      });
      await this.router.navigate(["/dashboard/support", ticket.id]);
    } catch {
      this.error.set("No se pudo crear el ticket. Inténtalo de nuevo.");
      this.saving.set(false);
    }
  }
}
