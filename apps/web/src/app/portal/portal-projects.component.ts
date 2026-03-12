import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PORTAL_REPOSITORY, PortalRepository, PortalProject } from "src/app/domain/repositories/portal.repository";

@Component({
  selector: "app-portal-projects",
  standalone: true,
  imports: [CommonModule],
  template: `
<div>
  <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 4px">Proyectos</h1>
  <p style="font-size:14px;color:#64748b;margin:0 0 24px">Estado de tus proyectos en curso</p>

  @if (loading()) {
    <div style="color:#94a3b8;font-size:13px">Cargando…</div>
  } @else if (projects().length === 0) {
    <div style="text-align:center;padding:48px;color:#94a3b8">
      <div style="font-size:15px;font-weight:500">Sin proyectos</div>
      <div style="font-size:13px;margin-top:4px">Aquí aparecerán tus proyectos cuando se activen.</div>
    </div>
  } @else {
    <div style="display:flex;flex-direction:column;gap:12px">
      @for (p of projects(); track p.id) {
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:20px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px">
            <div>
              <div style="font-size:15px;font-weight:600;color:#0f172a">{{ p.name }}</div>
              <div style="font-size:12px;color:#94a3b8;margin-top:2px">{{ projectTypeLabel(p.type) }}</div>
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0">
              <span [style]="'font-size:11px;padding:3px 10px;border-radius:20px;font-weight:500;' + statusStyle(p.status)">{{ statusLabel(p.status) }}</span>
              <span [style]="'font-size:11px;padding:3px 10px;border-radius:20px;font-weight:500;' + healthStyle(p.health)">{{ healthLabel(p.health) }}</span>
            </div>
          </div>
          @if (p.description) {
            <p style="font-size:13px;color:#475569;margin:0 0 10px">{{ p.description }}</p>
          }
          <div style="display:flex;gap:16px;font-size:12px;color:#94a3b8">
            @if (p.start_date) { <span>Inicio: {{ formatDate(p.start_date) }}</span> }
            @if (p.deadline)   { <span>Entrega: {{ formatDate(p.deadline) }}</span> }
          </div>
        </div>
      }
    </div>
  }
</div>
  `,
})
export class PortalProjectsComponent implements OnInit {
  loading  = signal(true);
  projects = signal<PortalProject[]>([]);

  constructor(@Inject(PORTAL_REPOSITORY) private readonly portalRepo: PortalRepository) {}

  async ngOnInit(): Promise<void> {
    try { this.projects.set(await this.portalRepo.projects()); }
    catch { /* silent */ }
    finally { this.loading.set(false); }
  }

  projectTypeLabel(t: string): string {
    return { web_dev: "Web Dev", automation: "Automatización", ai_system: "Sistema IA", chatbot: "Chatbot", saas: "SaaS", consulting: "Consultoría", custom: "Custom" }[t] ?? t;
  }
  statusStyle(s: string): string {
    if (s === "active")    return "background:#dcfce7;color:#16a34a";
    if (s === "paused")    return "background:#fef9c3;color:#ca8a04";
    if (s === "completed") return "background:#e0e7ff;color:#6366f1";
    return "background:#f1f5f9;color:#475569";
  }
  statusLabel(s: string): string {
    return { discovery: "Descubrimiento", planning: "Planificación", active: "Activo", paused: "Pausado", review: "Revisión", completed: "Completado", cancelled: "Cancelado" }[s] ?? s;
  }
  healthStyle(h: string): string {
    if (h === "on_track") return "background:#dcfce7;color:#16a34a";
    if (h === "at_risk")  return "background:#fef9c3;color:#ca8a04";
    return "background:#fee2e2;color:#dc2626";
  }
  healthLabel(h: string): string {
    return { on_track: "En plazo", at_risk: "En riesgo", off_track: "Retrasado" }[h] ?? h;
  }
  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  }
}
