import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PORTAL_REPOSITORY, PortalRepository, PortalTicket } from "src/app/domain/repositories/portal.repository";

@Component({
  selector: "app-portal-tickets",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
    <div>
      <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 4px">Soporte</h1>
      <p style="font-size:14px;color:#64748b;margin:0">Tus solicitudes de soporte</p>
    </div>
    <button (click)="showForm.set(!showForm())"
      style="padding:8px 16px;background:#6366f1;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">
      + Nueva solicitud
    </button>
  </div>

  @if (showForm()) {
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:20px">
      <div style="font-size:15px;font-weight:600;color:#0f172a;margin-bottom:16px">Nueva solicitud</div>
      @if (formError()) {
        <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;color:#dc2626;padding:10px 14px;font-size:13px;margin-bottom:12px">{{ formError() }}</div>
      }
      @if (formSuccess()) {
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;color:#16a34a;padding:10px 14px;font-size:13px;margin-bottom:12px">{{ formSuccess() }}</div>
      }
      <div style="margin-bottom:12px">
        <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px">Asunto *</label>
        <input style="width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;box-sizing:border-box"
          [(ngModel)]="form.title" placeholder="Describe brevemente el problema">
      </div>
      <div style="margin-bottom:12px">
        <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px">Categoría</label>
        <select style="padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px" [(ngModel)]="form.category">
          <option value="general">General</option>
          <option value="bug">Bug / Error</option>
          <option value="feature">Solicitud de funcionalidad</option>
          <option value="billing">Facturación</option>
          <option value="access">Acceso</option>
          <option value="other">Otro</option>
        </select>
      </div>
      <div style="margin-bottom:16px">
        <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px">Descripción</label>
        <textarea style="width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;box-sizing:border-box;resize:vertical"
          [(ngModel)]="form.description" rows="3" placeholder="Detalles, contexto…"></textarea>
      </div>
      <div style="display:flex;gap:8px">
        <button (click)="submit()"
          style="padding:8px 16px;background:#6366f1;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer"
          [disabled]="submitting()">
          {{ submitting() ? 'Enviando…' : 'Enviar solicitud' }}
        </button>
        <button (click)="showForm.set(false)"
          style="padding:8px 16px;background:transparent;color:#64748b;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;cursor:pointer">
          Cancelar
        </button>
      </div>
    </div>
  }

  @if (loading()) {
    <div style="color:#94a3b8;font-size:13px">Cargando…</div>
  } @else if (tickets().length === 0) {
    <div style="text-align:center;padding:48px;color:#94a3b8">
      <div style="font-size:15px;font-weight:500">Sin solicitudes</div>
      <div style="font-size:13px;margin-top:4px">Abre una nueva solicitud si necesitas ayuda.</div>
    </div>
  } @else {
    <div style="display:flex;flex-direction:column;gap:8px">
      @for (t of tickets(); track t.id) {
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px;display:flex;align-items:center;justify-content:space-between;gap:12px">
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:12px;color:#94a3b8;font-family:monospace">#{{ t.number }}</span>
              <span style="font-size:14px;font-weight:500;color:#0f172a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ t.title }}</span>
            </div>
            <div style="font-size:12px;color:#94a3b8;margin-top:4px">{{ categoryLabel(t.category) }} · {{ formatDate(t.created_at) }} · {{ t.message_count }} mensajes</div>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0">
            <span [style]="'font-size:11px;padding:3px 10px;border-radius:20px;font-weight:500;' + priorityStyle(t.priority)">{{ priorityLabel(t.priority) }}</span>
            <span [style]="'font-size:11px;padding:3px 10px;border-radius:20px;font-weight:500;' + statusStyle(t.status)">{{ statusLabel(t.status) }}</span>
          </div>
        </div>
      }
    </div>
  }
</div>
  `,
})
export class PortalTicketsComponent implements OnInit {
  loading    = signal(true);
  tickets    = signal<PortalTicket[]>([]);
  showForm   = signal(false);
  submitting = signal(false);
  formError  = signal("");
  formSuccess = signal("");

  form = { title: "", description: "", category: "general" };

  constructor(@Inject(PORTAL_REPOSITORY) private readonly portalRepo: PortalRepository) {}

  async ngOnInit(): Promise<void> {
    try { this.tickets.set(await this.portalRepo.tickets()); }
    catch { /* silent */ }
    finally { this.loading.set(false); }
  }

  async submit(): Promise<void> {
    if (!this.form.title.trim()) { this.formError.set("El asunto es obligatorio."); return; }
    this.submitting.set(true); this.formError.set(""); this.formSuccess.set("");
    try {
      const t = await this.portalRepo.createTicket({ title: this.form.title, description: this.form.description || null, category: this.form.category });
      this.tickets.update((ts) => [t as unknown as PortalTicket, ...ts]);
      this.form = { title: "", description: "", category: "general" };
      this.formSuccess.set("Solicitud creada. Te responderemos en breve.");
      this.showForm.set(false);
    } catch { this.formError.set("No se pudo crear la solicitud."); }
    finally { this.submitting.set(false); }
  }

  categoryLabel(c: string): string {
    return { general: "General", bug: "Bug", feature: "Funcionalidad", billing: "Facturación", access: "Acceso", other: "Otro" }[c] ?? c;
  }
  priorityStyle(p: string): string {
    if (p === "critical") return "background:#fee2e2;color:#dc2626";
    if (p === "high")     return "background:#fef9c3;color:#ca8a04";
    return "background:#f1f5f9;color:#475569";
  }
  priorityLabel(p: string): string {
    return { low: "Baja", medium: "Media", high: "Alta", critical: "Crítica" }[p] ?? p;
  }
  statusStyle(s: string): string {
    if (s === "resolved" || s === "closed") return "background:#dcfce7;color:#16a34a";
    if (s === "in_progress") return "background:#e0e7ff;color:#6366f1";
    if (s === "waiting") return "background:#fef9c3;color:#ca8a04";
    return "background:#dbeafe;color:#2563eb";
  }
  statusLabel(s: string): string {
    return { open: "Abierto", in_progress: "En curso", waiting: "En espera", resolved: "Resuelto", closed: "Cerrado" }[s] ?? s;
  }
  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  }
}
