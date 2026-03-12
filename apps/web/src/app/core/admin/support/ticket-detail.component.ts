import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  TICKET_REPOSITORY,
  TicketRepository,
  Ticket,
  TicketMessage,
  TicketStatus,
  TicketPriority,
} from "src/app/domain/repositories/ticket.repository";

@Component({
  selector: "app-ticket-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  @if (loading()) {
    <div style="display:flex;align-items:center;gap:10px;color:var(--a-text-muted);padding:40px 0"><span class="a-spinner"></span></div>
  }
  @if (!loading() && !ticket()) {
    <div class="a-empty">
      <div class="a-empty-title">Ticket no encontrado</div>
      <a routerLink="/dashboard/support" class="a-btn a-btn-secondary" style="margin-top:8px">← Volver</a>
    </div>
  }
  @if (ticket()) {
    <div class="page-header">
      <div class="page-header-left">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <a routerLink="/dashboard/support" style="color:var(--a-text-muted);font-size:13px;text-decoration:none">Soporte</a>
          <span style="color:var(--a-text-subtle)">/</span>
          <span style="font-size:13px;font-family:monospace">#{{ ticket()!.number }}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <h1 class="page-title">{{ ticket()!.title }}</h1>
          <span [class]="'a-badge ' + priorityBadge(ticket()!.priority)">{{ priorityLabel(ticket()!.priority) }}</span>
          <span [class]="'a-badge ' + statusBadge(ticket()!.status)">{{ statusLabel(ticket()!.status) }}</span>
        </div>
      </div>
      <div class="page-actions">
        <button class="a-btn a-btn-danger a-btn-icon" (click)="deleteTicket()" title="Eliminar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>

    @if (success()) {
      <div style="background:var(--a-success-muted);border:1px solid var(--a-success);border-radius:var(--a-r-sm);color:var(--a-success);padding:10px 14px;font-size:13px;margin-bottom:16px">{{ success() }}</div>
    }
    @if (error()) {
      <div style="background:var(--a-danger-muted);border:1px solid var(--a-danger);border-radius:var(--a-r-sm);color:var(--a-danger);padding:10px 14px;font-size:13px;margin-bottom:16px">{{ error() }}</div>
    }

    <div class="a-grid-2" style="align-items:start">
      <!-- Thread -->
      <div style="display:flex;flex-direction:column;gap:12px">
        <!-- Description -->
        @if (ticket()!.description) {
          <div class="a-card">
            <div class="a-card-header"><span class="a-card-title">Descripción</span></div>
            <p style="font-size:14px;color:var(--a-text);white-space:pre-wrap;margin:0">{{ ticket()!.description }}</p>
          </div>
        }

        <!-- Messages -->
        <div class="a-card">
          <div class="a-card-header"><span class="a-card-title">Conversación</span></div>
          @if (!ticket()!.messages || ticket()!.messages!.length === 0) {
            <p style="font-size:13px;color:var(--a-text-muted)">Sin mensajes aún.</p>
          } @else {
            <div style="display:flex;flex-direction:column;gap:12px">
              @for (msg of ticket()!.messages!; track msg.id) {
                <div [style]="'padding:10px 12px;border-radius:var(--a-r-sm);font-size:13px;' + (msg.is_internal ? 'background:var(--a-warning-muted);border:1px solid var(--a-warning-subtle)' : msg.author_type === 'admin' ? 'background:var(--a-brand-muted);border:1px solid var(--a-brand-subtle)' : 'background:var(--a-bg-subtle);border:1px solid var(--a-border)')">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                    <span style="font-weight:600;font-size:12px">
                      {{ msg.author_name || (msg.author_type === 'admin' ? 'Equipo Tecnoria' : msg.author_type === 'client' ? 'Cliente' : 'Sistema') }}
                      @if (msg.is_internal) { <span style="color:var(--a-warning);font-size:11px;margin-left:6px">• Nota interna</span> }
                    </span>
                    <span style="color:var(--a-text-muted);font-size:11px">{{ formatDateTime(msg.created_at) }}</span>
                  </div>
                  <p style="margin:0;white-space:pre-wrap;color:var(--a-text)">{{ msg.content }}</p>
                </div>
              }
            </div>
          }

          <!-- Reply form -->
          <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--a-border)">
            <div class="a-form-group">
              <label class="a-label">Respuesta</label>
              <textarea class="a-textarea" [(ngModel)]="replyText" rows="3" placeholder="Escribe una respuesta…"></textarea>
            </div>
            <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
              <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
                <input type="checkbox" [(ngModel)]="replyInternal"> Nota interna
              </label>
              <button class="a-btn a-btn-primary a-btn-sm" [disabled]="sendingReply() || !replyText.trim()" (click)="sendReply()">
                @if (sendingReply()) { <span class="a-spinner" style="width:12px;height:12px"></span> }
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div style="display:flex;flex-direction:column;gap:12px">
        <!-- Quick status actions -->
        <div class="a-card">
          <div class="a-card-header"><span class="a-card-title">Estado del ticket</span></div>
          <div style="display:flex;flex-direction:column;gap:8px">
            @for (opt of statusOptions; track opt.value) {
              <button
                [class]="'a-btn a-btn-sm ' + (ticket()!.status === opt.value ? 'a-btn-primary' : 'a-btn-ghost')"
                style="justify-content:flex-start"
                [disabled]="ticket()!.status === opt.value || updatingStatus()"
                (click)="setStatus(opt.value)">
                {{ opt.label }}
              </button>
            }
          </div>
        </div>

        <!-- Edit fields -->
        <div class="a-card">
          <div class="a-card-header"><span class="a-card-title">Detalles</span></div>
          <div style="display:flex;flex-direction:column;gap:12px">
            <div>
              <div class="a-label" style="margin-bottom:4px">Prioridad</div>
              <select class="a-select" [(ngModel)]="editPriority" (ngModelChange)="updatePriority($event)">
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
            <div>
              <div class="a-label" style="margin-bottom:4px">Cliente</div>
              <a [routerLink]="['/dashboard/clients', ticket()!.client_id]" style="color:var(--a-brand);font-size:13px">{{ ticket()!.client_name }}</a>
            </div>
            @if (ticket()!.project_name) {
              <div>
                <div class="a-label" style="margin-bottom:4px">Proyecto</div>
                <a [routerLink]="['/dashboard/projects', ticket()!.project_id]" style="color:var(--a-brand);font-size:13px">{{ ticket()!.project_name }}</a>
              </div>
            }
            <div>
              <div class="a-label" style="margin-bottom:4px">Creado</div>
              <span style="font-size:13px;color:var(--a-text-muted)">{{ formatDate(ticket()!.created_at) }}</span>
            </div>
            @if (ticket()!.resolved_at) {
              <div>
                <div class="a-label" style="margin-bottom:4px">Resuelto</div>
                <span style="font-size:13px;color:var(--a-success)">{{ formatDate(ticket()!.resolved_at!) }}</span>
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
export class TicketDetailComponent implements OnInit {
  ticket         = signal<Ticket | null>(null);
  loading        = signal(true);
  updatingStatus = signal(false);
  sendingReply   = signal(false);
  success        = signal("");
  error          = signal("");

  replyText     = "";
  replyInternal = false;
  editPriority: TicketPriority = "medium";

  readonly statusOptions = [
    { value: "open",        label: "Abierto" },
    { value: "in_progress", label: "En curso" },
    { value: "waiting",     label: "En espera" },
    { value: "resolved",    label: "Resuelto" },
    { value: "closed",      label: "Cerrado" },
  ];

  constructor(
    @Inject(TICKET_REPOSITORY) private readonly ticketRepo: TicketRepository,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) { this.loading.set(false); return; }
    try {
      const t = await this.ticketRepo.get(id);
      this.ticket.set(t);
      if (t) this.editPriority = t.priority;
    } catch { /* silent */ }
    finally { this.loading.set(false); }
  }

  async setStatus(status: string): Promise<void> {
    const id = this.ticket()?.id;
    if (!id) return;
    this.updatingStatus.set(true);
    this.success.set(""); this.error.set("");
    try {
      const updated = await this.ticketRepo.update(id, { status: status as TicketStatus });
      this.ticket.update((t) => ({ ...t!, ...updated }));
      this.success.set("Estado actualizado.");
    } catch { this.error.set("No se pudo actualizar el estado."); }
    finally { this.updatingStatus.set(false); }
  }

  async updatePriority(priority: TicketPriority): Promise<void> {
    const id = this.ticket()?.id;
    if (!id) return;
    try {
      const updated = await this.ticketRepo.update(id, { priority });
      this.ticket.update((t) => ({ ...t!, ...updated }));
    } catch { this.error.set("No se pudo actualizar la prioridad."); }
  }

  async sendReply(): Promise<void> {
    const id = this.ticket()?.id;
    if (!id || !this.replyText.trim()) return;
    this.sendingReply.set(true);
    this.error.set("");
    try {
      const msg = await this.ticketRepo.addMessage(id, {
        content:     this.replyText.trim(),
        author_type: "admin",
        is_internal: this.replyInternal,
      });
      this.ticket.update((t) => ({
        ...t!,
        messages: [...(t!.messages ?? []), msg],
      }));
      this.replyText = "";
      this.replyInternal = false;
    } catch { this.error.set("No se pudo enviar el mensaje."); }
    finally { this.sendingReply.set(false); }
  }

  async deleteTicket(): Promise<void> {
    const t = this.ticket();
    if (!t || !confirm(`¿Eliminar el ticket "#${t.number} ${t.title}"?`)) return;
    try {
      await this.ticketRepo.delete(t.id);
      await this.router.navigate(["/dashboard/support"]);
    } catch { this.error.set("No se pudo eliminar el ticket."); }
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
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  }
  formatDateTime(d: string): string {
    return new Date(d).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }
}
