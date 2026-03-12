import { Component, Inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  CLIENT_REPOSITORY,
  ClientRepository,
} from "src/app/domain/repositories/client.repository";

@Component({
  selector: "app-client-form",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  <div class="page-header">
    <div class="page-header-left">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <a routerLink="/dashboard/clients" style="color:var(--a-text-muted);font-size:13px;text-decoration:none">Clientes</a>
        <span style="color:var(--a-text-subtle)">/</span>
        <span style="font-size:13px">Nuevo cliente</span>
      </div>
      <h1 class="page-title">Nuevo cliente</h1>
    </div>
  </div>

  @if (error()) {
    <div style="background:var(--a-danger-muted);border:1px solid var(--a-danger);border-radius:var(--a-r-sm);color:var(--a-danger);padding:10px 14px;font-size:13px;margin-bottom:16px">
      {{ error() }}
    </div>
  }

  <div class="a-card" style="max-width:640px">
    <form (ngSubmit)="save()">
      <div class="a-form-group">
        <label class="a-label">Nombre / Razón comercial *</label>
        <input class="a-input" [(ngModel)]="form.name" name="name" required placeholder="Empresa o persona">
      </div>
      <div class="a-form-grid-2">
        <div class="a-form-group">
          <label class="a-label">Tipo</label>
          <select class="a-select" [(ngModel)]="form.type" name="type">
            <option value="company">Empresa</option>
            <option value="individual">Individual</option>
          </select>
        </div>
        <div class="a-form-group">
          <label class="a-label">Tier</label>
          <select class="a-select" [(ngModel)]="form.tier" name="tier">
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>
      <div class="a-form-group">
        <label class="a-label">Email de facturación</label>
        <input class="a-input" type="email" [(ngModel)]="form.billing_email" name="billing_email">
      </div>
      <div class="a-form-grid-2">
        <div class="a-form-group">
          <label class="a-label">Ciudad</label>
          <input class="a-input" [(ngModel)]="form.city" name="city">
        </div>
        <div class="a-form-group">
          <label class="a-label">País</label>
          <input class="a-input" [(ngModel)]="form.country" name="country">
        </div>
      </div>
      <div class="a-form-group">
        <label class="a-label">Notas</label>
        <textarea class="a-textarea" [(ngModel)]="form.notes" name="notes"></textarea>
      </div>
      <div style="display:flex;gap:8px">
        <button type="submit" class="a-btn a-btn-primary" [disabled]="saving()">
          @if (saving()) { <span class="a-spinner" style="width:14px;height:14px"></span> }
          Crear cliente
        </button>
        <a routerLink="/dashboard/clients" class="a-btn a-btn-ghost">Cancelar</a>
      </div>
    </form>
  </div>
</div>
  `,
})
export class ClientFormComponent {
  saving = signal(false);
  error = signal("");

  form = {
    name: "", type: "company" as "company" | "individual",
    tier: "starter" as "starter" | "professional" | "enterprise",
    billing_email: "", city: "", country: "ES", notes: "",
  };

  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepo: ClientRepository,
    private readonly router: Router
  ) {}

  async save(): Promise<void> {
    if (!this.form.name.trim()) { this.error.set("El nombre es obligatorio."); return; }

    this.saving.set(true);
    this.error.set("");

    try {
      const created = await this.clientRepo.create({
        name: this.form.name.trim(),
        type: this.form.type,
        status: "active",
        tier: this.form.tier,
        billing_email: this.form.billing_email || null,
        city: this.form.city || null,
        country: this.form.country,
        notes: this.form.notes || null,
        tags: [],
      });
      await this.router.navigate(["/dashboard/clients", created.id]);
    } catch {
      this.error.set("No se pudo crear el cliente.");
      this.saving.set(false);
    }
  }
}
