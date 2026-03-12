import { Component, Inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  LEAD_REPOSITORY,
  LeadRepository,
  LeadStatus,
  LeadSource,
} from "src/app/domain/repositories/lead.repository";

@Component({
  selector: "app-lead-form",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  <div class="page-header">
    <div class="page-header-left">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <a routerLink="/dashboard/leads" style="color:var(--a-text-muted);font-size:13px;text-decoration:none">Leads</a>
        <span style="color:var(--a-text-subtle)">/</span>
        <span style="font-size:13px">Nuevo lead</span>
      </div>
      <h1 class="page-title">Nuevo lead</h1>
    </div>
  </div>

  @if (error()) {
    <div style="background:var(--a-danger-muted);border:1px solid var(--a-danger);border-radius:var(--a-r-sm);color:var(--a-danger);padding:10px 14px;font-size:13px;margin-bottom:16px">
      {{ error() }}
    </div>
  }

  <div class="a-card" style="max-width:640px">
    <form (ngSubmit)="save()">
      <div class="a-form-grid-2">
        <div class="a-form-group">
          <label class="a-label">Nombre *</label>
          <input class="a-input" [(ngModel)]="form.name" name="name" required placeholder="Nombre completo">
        </div>
        <div class="a-form-group">
          <label class="a-label">Email *</label>
          <input class="a-input" type="email" [(ngModel)]="form.email" name="email" required placeholder="email@empresa.com">
        </div>
      </div>
      <div class="a-form-grid-2">
        <div class="a-form-group">
          <label class="a-label">Teléfono</label>
          <input class="a-input" [(ngModel)]="form.phone" name="phone" placeholder="+34 600 000 000">
        </div>
        <div class="a-form-group">
          <label class="a-label">Empresa</label>
          <input class="a-input" [(ngModel)]="form.company_name" name="company_name" placeholder="Nombre de la empresa">
        </div>
      </div>
      <div class="a-form-grid-2">
        <div class="a-form-group">
          <label class="a-label">Fuente</label>
          <select class="a-select" [(ngModel)]="form.source" name="source">
            @for (s of sourceOptions; track s.value) {
              <option [value]="s.value">{{ s.label }}</option>
            }
          </select>
        </div>
        <div class="a-form-group">
          <label class="a-label">Estado inicial</label>
          <select class="a-select" [(ngModel)]="form.status" name="status">
            @for (s of statusOptions; track s.value) {
              <option [value]="s.value">{{ s.label }}</option>
            }
          </select>
        </div>
      </div>
      <div class="a-form-group">
        <label class="a-label">Notas</label>
        <textarea class="a-textarea" [(ngModel)]="form.notes" name="notes" placeholder="Información adicional sobre este lead..."></textarea>
      </div>

      <div style="display:flex;gap:8px;margin-top:4px">
        <button type="submit" class="a-btn a-btn-primary" [disabled]="saving()">
          @if (saving()) { <span class="a-spinner" style="width:14px;height:14px"></span> }
          Crear lead
        </button>
        <a routerLink="/dashboard/leads" class="a-btn a-btn-ghost">Cancelar</a>
      </div>
    </form>
  </div>
</div>
  `,
})
export class LeadFormComponent {
  saving = signal(false);
  error = signal("");

  form = {
    name: "", email: "", phone: "", company_name: "",
    status: "new" as LeadStatus, source: "manual" as LeadSource, notes: "",
  };

  readonly statusOptions = [
    { value: "new",         label: "Nuevo" },
    { value: "contacted",   label: "Contactado" },
    { value: "qualified",   label: "Cualificado" },
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
    private readonly router: Router
  ) {}

  async save(): Promise<void> {
    if (!this.form.name.trim() || !this.form.email.trim()) {
      this.error.set("Nombre y email son obligatorios.");
      return;
    }

    this.saving.set(true);
    this.error.set("");

    try {
      const created = await this.leadRepo.create({
        name: this.form.name.trim(),
        email: this.form.email.trim(),
        phone: this.form.phone.trim() || null,
        company_name: this.form.company_name.trim() || null,
        source: this.form.source,
        status: this.form.status,
        score: 0,
        notes: this.form.notes.trim() || null,
      });
      await this.router.navigate(["/dashboard/leads", created.id]);
    } catch {
      this.error.set("No se pudo crear el lead. Verifica los datos.");
      this.saving.set(false);
    }
  }
}
