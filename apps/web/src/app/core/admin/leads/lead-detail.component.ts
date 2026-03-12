import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  LEAD_REPOSITORY,
  LeadRepository,
  Lead,
  LeadStatus,
  LeadSource,
} from "src/app/domain/repositories/lead.repository";

@Component({
  selector: "app-lead-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  @if (loading()) {
    <div style="display:flex;align-items:center;gap:10px;color:var(--a-text-muted);padding:40px 0">
      <span class="a-spinner"></span>
    </div>
  }

  @if (!loading() && !lead()) {
    <div class="a-empty">
      <div class="a-empty-title">Lead no encontrado</div>
      <a routerLink="/dashboard/leads" class="a-btn a-btn-secondary" style="margin-top:8px">← Volver</a>
    </div>
  }

  @if (lead()) {
    <!-- Header -->
    <div class="page-header">
      <div class="page-header-left">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <a routerLink="/dashboard/leads" style="color:var(--a-text-muted);font-size:13px;text-decoration:none">Leads</a>
          <span style="color:var(--a-text-subtle)">/</span>
          <span style="font-size:13px;color:var(--a-text)">{{ lead()!.name }}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <div class="a-avatar lg">{{ lead()!.name.slice(0,2).toUpperCase() }}</div>
          <div>
            <h1 class="page-title" style="margin-bottom:4px">{{ lead()!.name }}</h1>
            @if (lead()!.company_name) {
              <p class="page-subtitle">{{ lead()!.company_name }}</p>
            }
          </div>
        </div>
      </div>
      <div class="page-actions">
        @if (lead()!.status !== 'won' && lead()!.status !== 'lost') {
          <button class="a-btn a-btn-primary" (click)="convertToClient()" [disabled]="converting()">
            @if (converting()) { <span class="a-spinner" style="width:14px;height:14px"></span> }
            Convertir a cliente
          </button>
        }
        <button class="a-btn a-btn-danger a-btn-icon" (click)="deleteLead()" title="Eliminar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>

    @if (success()) {
      <div class="a-card" style="background:var(--a-success-muted);border-color:var(--a-success);color:var(--a-success);margin-bottom:16px;padding:12px 16px">{{ success() }}</div>
    }
    @if (error()) {
      <div class="a-card" style="background:var(--a-danger-muted);border-color:var(--a-danger);color:var(--a-danger);margin-bottom:16px;padding:12px 16px">{{ error() }}</div>
    }

    <div class="a-grid-2" style="align-items:start">
      <!-- Left: Edit form -->
      <div class="a-card">
        <div class="a-card-header">
          <span class="a-card-title">Información del lead</span>
        </div>

        <form (ngSubmit)="save()">
          <div class="a-form-grid-2">
            <div class="a-form-group">
              <label class="a-label">Nombre *</label>
              <input class="a-input" [(ngModel)]="form.name" name="name" required>
            </div>
            <div class="a-form-group">
              <label class="a-label">Email *</label>
              <input class="a-input" type="email" [(ngModel)]="form.email" name="email" required>
            </div>
          </div>
          <div class="a-form-grid-2">
            <div class="a-form-group">
              <label class="a-label">Teléfono</label>
              <input class="a-input" [(ngModel)]="form.phone" name="phone">
            </div>
            <div class="a-form-group">
              <label class="a-label">Empresa</label>
              <input class="a-input" [(ngModel)]="form.company_name" name="company_name">
            </div>
          </div>
          <div class="a-form-grid-2">
            <div class="a-form-group">
              <label class="a-label">Estado</label>
              <select class="a-select" [(ngModel)]="form.status" name="status">
                @for (s of statusOptions; track s.value) {
                  <option [value]="s.value">{{ s.label }}</option>
                }
              </select>
            </div>
            <div class="a-form-group">
              <label class="a-label">Fuente</label>
              <select class="a-select" [(ngModel)]="form.source" name="source">
                @for (s of sourceOptions; track s.value) {
                  <option [value]="s.value">{{ s.label }}</option>
                }
              </select>
            </div>
          </div>
          <div class="a-form-group">
            <label class="a-label">Puntuación (0-100)</label>
            <input class="a-input" type="number" min="0" max="100" [(ngModel)]="form.score" name="score">
          </div>
          <div class="a-form-group">
            <label class="a-label">Notas</label>
            <textarea class="a-textarea" [(ngModel)]="form.notes" name="notes" rows="3"></textarea>
          </div>
          <button type="submit" class="a-btn a-btn-primary" [disabled]="saving()">
            @if (saving()) { <span class="a-spinner" style="width:14px;height:14px"></span> }
            Guardar cambios
          </button>
        </form>
      </div>

      <!-- Right: Info panel -->
      <div style="display:flex;flex-direction:column;gap:12px">
        <!-- Status -->
        <div class="a-card">
          <div style="display:flex;flex-direction:column;gap:12px">
            <div>
              <div style="font-size:11px;color:var(--a-text-subtle);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em">Estado actual</div>
              <span [class]="'a-badge ' + statusBadge(lead()!.status)" style="font-size:12px">{{ statusLabel(lead()!.status) }}</span>
            </div>
            <div>
              <div style="font-size:11px;color:var(--a-text-subtle);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em">Fuente</div>
              <span class="a-badge a-badge-draft">{{ sourceLabel(lead()!.source) }}</span>
            </div>
            <div>
              <div style="font-size:11px;color:var(--a-text-subtle);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em">Puntuación</div>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="flex:1;background:var(--a-border);border-radius:9999px;height:6px">
                  <div [style.width.%]="lead()!.score" style="height:100%;background:var(--a-brand);border-radius:9999px"></div>
                </div>
                <span style="font-weight:600">{{ lead()!.score }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Metadata -->
        <div class="a-card">
          <div style="display:flex;flex-direction:column;gap:10px">
            <div>
              <div style="font-size:11px;color:var(--a-text-subtle);margin-bottom:2px;text-transform:uppercase;letter-spacing:0.05em">Email</div>
              <a [href]="'mailto:' + lead()!.email" style="color:var(--a-brand);font-size:13px">{{ lead()!.email }}</a>
            </div>
            @if (lead()!.phone) {
              <div>
                <div style="font-size:11px;color:var(--a-text-subtle);margin-bottom:2px;text-transform:uppercase;letter-spacing:0.05em">Teléfono</div>
                <a [href]="'tel:' + lead()!.phone" style="color:var(--a-brand);font-size:13px">{{ lead()!.phone }}</a>
              </div>
            }
            <div>
              <div style="font-size:11px;color:var(--a-text-subtle);margin-bottom:2px;text-transform:uppercase;letter-spacing:0.05em">Creado</div>
              <span style="font-size:13px;color:var(--a-text-muted)">{{ formatDate(lead()!.created_at) }}</span>
            </div>
            @if (lead()!.utm_source) {
              <div>
                <div style="font-size:11px;color:var(--a-text-subtle);margin-bottom:2px;text-transform:uppercase;letter-spacing:0.05em">UTM</div>
                <span style="font-size:12px;color:var(--a-text-muted)">{{ lead()!.utm_source }} / {{ lead()!.utm_medium }}</span>
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
export class LeadDetailComponent implements OnInit {
  lead = signal<Lead | null>(null);
  loading = signal(true);
  saving = signal(false);
  converting = signal(false);
  success = signal("");
  error = signal("");

  form = {
    name: "", email: "", phone: "", company_name: "",
    status: "new" as LeadStatus, source: "manual" as LeadSource,
    score: 0, notes: "",
  };

  readonly statusOptions = [
    { value: "new",         label: "Nuevo" },
    { value: "contacted",   label: "Contactado" },
    { value: "qualified",   label: "Cualificado" },
    { value: "proposal",    label: "Propuesta" },
    { value: "negotiation", label: "Negociación" },
    { value: "won",         label: "Ganado" },
    { value: "lost",        label: "Perdido" },
  ];

  readonly sourceOptions = [
    { value: "web_form",  label: "Formulario web" },
    { value: "manual",    label: "Manual" },
    { value: "import",    label: "Importación" },
    { value: "referral",  label: "Referido" },
    { value: "talkaris",  label: "Talkaris" },
    { value: "auctorio",  label: "Auctorio" },
    { value: "other",     label: "Otro" },
  ];

  constructor(
    @Inject(LEAD_REPOSITORY) private readonly leadRepo: LeadRepository,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) { this.loading.set(false); return; }

    // handle "new" path (shouldn't happen but guard)
    if (id === "new") { await this.router.navigate(["/dashboard/leads"]); return; }

    try {
      const lead = await this.leadRepo.get(id);
      this.lead.set(lead);
      if (lead) {
        this.form = {
          name: lead.name,
          email: lead.email,
          phone: lead.phone ?? "",
          company_name: lead.company_name ?? "",
          status: lead.status,
          source: lead.source,
          score: lead.score,
          notes: lead.notes ?? "",
        };
      }
    } catch { /* silent */ }
    finally { this.loading.set(false); }
  }

  async save(): Promise<void> {
    const id = this.lead()?.id;
    if (!id) return;

    this.saving.set(true);
    this.success.set(""); this.error.set("");

    try {
      const updated = await this.leadRepo.update(id, {
        name: this.form.name,
        email: this.form.email,
        phone: this.form.phone || null,
        company_name: this.form.company_name || null,
        status: this.form.status,
        source: this.form.source,
        score: this.form.score,
        notes: this.form.notes || null,
      });
      this.lead.set(updated);
      this.success.set("Lead actualizado correctamente.");
    } catch {
      this.error.set("No se pudo guardar el lead.");
    } finally {
      this.saving.set(false);
    }
  }

  async convertToClient(): Promise<void> {
    const id = this.lead()?.id;
    if (!id || !confirm("¿Convertir este lead a cliente? Se creará un cliente con sus datos.")) return;

    this.converting.set(true);
    try {
      const client = await this.leadRepo.convert(id);
      await this.router.navigate(["/dashboard/clients", client.id]);
    } catch {
      this.error.set("No se pudo convertir el lead.");
      this.converting.set(false);
    }
  }

  async deleteLead(): Promise<void> {
    const id = this.lead()?.id;
    if (!id || !confirm("¿Eliminar este lead?")) return;

    try {
      await this.leadRepo.delete(id);
      await this.router.navigate(["/dashboard/leads"]);
    } catch {
      this.error.set("No se pudo eliminar el lead.");
    }
  }

  statusBadge(s: string): string {
    const map: Record<string, string> = {
      new: "a-badge-info", contacted: "a-badge-info", qualified: "a-badge-pending",
      proposal: "a-badge-pending", negotiation: "a-badge-pending",
      won: "a-badge-active", lost: "a-badge-inactive",
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
      web_form: "Formulario web", manual: "Manual", import: "Importación",
      referral: "Referido", talkaris: "Talkaris", auctorio: "Auctorio", other: "Otro",
    };
    return map[s] ?? s;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  }
}
