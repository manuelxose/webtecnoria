import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  CLIENT_REPOSITORY,
  ClientRepository,
  Client,
} from "src/app/domain/repositories/client.repository";

type TabId = "overview" | "projects" | "contacts";

@Component({
  selector: "app-client-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  @if (loading()) {
    <div style="display:flex;align-items:center;gap:10px;color:var(--a-text-muted);padding:40px 0">
      <span class="a-spinner"></span>
    </div>
  }

  @if (!loading() && !client()) {
    <div class="a-empty">
      <div class="a-empty-title">Cliente no encontrado</div>
      <a routerLink="/dashboard/clients" class="a-btn a-btn-secondary" style="margin-top:8px">← Volver</a>
    </div>
  }

  @if (client()) {
    <!-- Header -->
    <div class="page-header">
      <div class="page-header-left">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <a routerLink="/dashboard/clients" style="color:var(--a-text-muted);font-size:13px;text-decoration:none">Clientes</a>
          <span style="color:var(--a-text-subtle)">/</span>
          <span style="font-size:13px;color:var(--a-text)">{{ client()!.name }}</span>
        </div>
        <div style="display:flex;align-items:center;gap:14px">
          <div class="a-avatar xl" style="background:var(--a-accent-muted);color:var(--a-accent)">
            {{ client()!.name.slice(0,2).toUpperCase() }}
          </div>
          <div>
            <h1 class="page-title" style="margin-bottom:6px">{{ client()!.name }}</h1>
            <div style="display:flex;align-items:center;gap:8px">
              <span [class]="'a-badge ' + statusBadge(client()!.status)">{{ statusLabel(client()!.status) }}</span>
              <span [class]="'a-badge ' + tierBadge(client()!.tier)">{{ tierLabel(client()!.tier) }}</span>
              <span class="a-badge a-badge-draft">{{ client()!.type === 'company' ? 'Empresa' : 'Individual' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="page-actions">
        <a [routerLink]="['/dashboard/projects/new']" [queryParams]="{client_id: client()!.id}" class="a-btn a-btn-secondary">
          Nuevo proyecto
        </a>
        <button class="a-btn a-btn-danger a-btn-icon" (click)="deleteClient()" title="Eliminar cliente">
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

    <!-- Overview tab -->
    @if (activeTab() === 'overview') {
      <div class="a-grid-2" style="align-items:start">
        <!-- Edit info -->
        <div class="a-card">
          <div class="a-card-header">
            <span class="a-card-title">Información</span>
          </div>
          @if (success()) {
            <div style="background:var(--a-success-muted);border:1px solid var(--a-success);border-radius:var(--a-r-sm);color:var(--a-success);padding:8px 12px;font-size:13px;margin-bottom:12px">{{ success() }}</div>
          }
          @if (error()) {
            <div style="background:var(--a-danger-muted);border:1px solid var(--a-danger);border-radius:var(--a-r-sm);color:var(--a-danger);padding:8px 12px;font-size:13px;margin-bottom:12px">{{ error() }}</div>
          }
          <form (ngSubmit)="save()">
            <div class="a-form-group">
              <label class="a-label">Nombre *</label>
              <input class="a-input" [(ngModel)]="form.name" name="name" required>
            </div>
            <div class="a-form-grid-2">
              <div class="a-form-group">
                <label class="a-label">Estado</label>
                <select class="a-select" [(ngModel)]="form.status" name="status">
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="churned">Perdido</option>
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
              <label class="a-label">Sitio web</label>
              <input class="a-input" [(ngModel)]="form.website" name="website" placeholder="https://...">
            </div>
            <div class="a-form-group">
              <label class="a-label">Notas</label>
              <textarea class="a-textarea" [(ngModel)]="form.notes" name="notes" rows="3"></textarea>
            </div>
            <button type="submit" class="a-btn a-btn-primary" [disabled]="saving()">
              @if (saving()) { <span class="a-spinner" style="width:14px;height:14px"></span> }
              Guardar
            </button>
          </form>
        </div>

        <!-- Metadata -->
        <div style="display:flex;flex-direction:column;gap:12px">
          <div class="a-card">
            <div class="a-card-header"><span class="a-card-title">Proyectos</span></div>
            @if (!client()!.projects?.length) {
              <div style="font-size:13px;color:var(--a-text-muted);padding:8px 0">Sin proyectos aún.</div>
            } @else {
              <div style="display:flex;flex-direction:column;gap:6px">
                @for (p of client()!.projects; track p.id) {
                  <a [routerLink]="['/dashboard/projects', p.id]"
                     style="display:flex;align-items:center;gap:8px;padding:6px 0;text-decoration:none;border-bottom:1px solid var(--a-border)">
                    <span class="priority-dot" [class]="p.priority" style="flex-shrink:0"></span>
                    <span style="flex:1;font-size:13px;color:var(--a-text)">{{ p.name }}</span>
                    <span [class]="'a-badge ' + projectStatusBadge(p.status)" style="font-size:10px">{{ projectStatusLabel(p.status) }}</span>
                  </a>
                }
              </div>
            }
          </div>

          <div class="a-card">
            <div style="display:flex;flex-direction:column;gap:10px">
              <div>
                <div style="font-size:11px;color:var(--a-text-subtle);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px">Tax ID</div>
                <span style="font-size:13px;color:var(--a-text-muted)">{{ client()!.tax_id || '—' }}</span>
              </div>
              <div>
                <div style="font-size:11px;color:var(--a-text-subtle);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px">Razón social</div>
                <span style="font-size:13px;color:var(--a-text-muted)">{{ client()!.fiscal_name || '—' }}</span>
              </div>
              <div>
                <div style="font-size:11px;color:var(--a-text-subtle);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px">Cliente desde</div>
                <span style="font-size:13px;color:var(--a-text-muted)">{{ formatDate(client()!.created_at) }}</span>
              </div>
              @if (client()!.tags?.length) {
                <div>
                  <div style="font-size:11px;color:var(--a-text-subtle);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px">Tags</div>
                  <div style="display:flex;flex-wrap:wrap;gap:4px">
                    @for (tag of client()!.tags; track tag) {
                      <span class="a-badge a-badge-draft">{{ tag }}</span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Contacts tab -->
    @if (activeTab() === 'contacts') {
      <div class="a-card">
        <div class="a-card-header">
          <span class="a-card-title">Contactos</span>
          <button class="a-btn a-btn-secondary a-btn-sm" (click)="showContactForm.set(!showContactForm())">
            + Añadir contacto
          </button>
        </div>

        @if (showContactForm()) {
          <div style="background:var(--a-bg);border:1px solid var(--a-border);border-radius:var(--a-r-sm);padding:16px;margin-bottom:16px">
            <div class="a-form-grid-2">
              <div class="a-form-group">
                <label class="a-label">Nombre *</label>
                <input class="a-input" [(ngModel)]="contactForm.first_name" placeholder="Nombre">
              </div>
              <div class="a-form-group">
                <label class="a-label">Apellido</label>
                <input class="a-input" [(ngModel)]="contactForm.last_name" placeholder="Apellido">
              </div>
            </div>
            <div class="a-form-grid-2">
              <div class="a-form-group">
                <label class="a-label">Email</label>
                <input class="a-input" type="email" [(ngModel)]="contactForm.email">
              </div>
              <div class="a-form-group">
                <label class="a-label">Teléfono</label>
                <input class="a-input" [(ngModel)]="contactForm.phone">
              </div>
            </div>
            <div class="a-form-grid-2">
              <div class="a-form-group">
                <label class="a-label">Rol / Cargo</label>
                <input class="a-input" [(ngModel)]="contactForm.role" placeholder="CTO, Project Manager...">
              </div>
              <div class="a-form-group" style="display:flex;align-items:flex-end;padding-bottom:16px">
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:var(--a-text)">
                  <input type="checkbox" [(ngModel)]="contactForm.is_primary">
                  Contacto principal
                </label>
              </div>
            </div>
            <div style="display:flex;gap:8px">
              <button class="a-btn a-btn-primary a-btn-sm" (click)="saveContact()">Guardar</button>
              <button class="a-btn a-btn-ghost a-btn-sm" (click)="showContactForm.set(false)">Cancelar</button>
            </div>
          </div>
        }

        @if (!client()!.contacts?.length) {
          <div class="a-empty" style="padding:32px 0">
            <div class="a-empty-desc">Sin contactos. Añade el primer contacto.</div>
          </div>
        } @else {
          <div class="a-table-wrap" style="border:none;border-radius:0">
            <table class="a-table">
              <thead>
                <tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Rol</th><th>Principal</th></tr>
              </thead>
              <tbody>
                @for (c of client()!.contacts; track c.id) {
                  <tr>
                    <td>
                      <div style="display:flex;align-items:center;gap:8px">
                        <div class="a-avatar sm">{{ c.first_name.slice(0,1).toUpperCase() }}</div>
                        <span style="font-weight:500">{{ c.first_name }} {{ c.last_name }}</span>
                      </div>
                    </td>
                    <td style="color:var(--a-text-muted)">{{ c.email || '—' }}</td>
                    <td style="color:var(--a-text-muted)">{{ c.phone || '—' }}</td>
                    <td style="color:var(--a-text-muted)">{{ c.role || '—' }}</td>
                    <td>
                      @if (c.is_primary) {
                        <span class="a-badge a-badge-active">Principal</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    }

    <!-- Projects tab -->
    @if (activeTab() === 'projects') {
      <div class="a-card">
        <div class="a-card-header">
          <span class="a-card-title">Proyectos</span>
          <a [routerLink]="['/dashboard/projects/new']" [queryParams]="{client_id: client()!.id}" class="a-btn a-btn-secondary a-btn-sm">
            + Nuevo proyecto
          </a>
        </div>
        @if (!client()!.projects?.length) {
          <div class="a-empty" style="padding:32px 0">
            <div class="a-empty-desc">Sin proyectos aún.</div>
          </div>
        } @else {
          <div class="a-table-wrap" style="border:none;border-radius:0">
            <table class="a-table">
              <thead>
                <tr><th>Proyecto</th><th>Estado</th><th>Health</th><th>Prioridad</th><th>Deadline</th></tr>
              </thead>
              <tbody>
                @for (p of client()!.projects; track p.id) {
                  <tr [routerLink]="['/dashboard/projects', p.id]" style="cursor:pointer">
                    <td style="font-weight:500">{{ p.name }}</td>
                    <td><span [class]="'a-badge ' + projectStatusBadge(p.status)">{{ projectStatusLabel(p.status) }}</span></td>
                    <td><span [class]="'a-badge ' + healthBadge(p.health)">{{ healthLabel(p.health) }}</span></td>
                    <td><span class="priority-dot" [class]="p.priority"></span></td>
                    <td style="color:var(--a-text-muted)">{{ p.deadline ? formatDate(p.deadline) : '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    }
  }
</div>
  `,
})
export class ClientDetailComponent implements OnInit {
  client = signal<Client | null>(null);
  loading = signal(true);
  saving = signal(false);
  success = signal("");
  error = signal("");
  activeTab = signal<TabId>("overview");
  showContactForm = signal(false);

  form = {
    name: "", status: "active" as "active" | "inactive" | "churned",
    tier: "starter" as "starter" | "professional" | "enterprise",
    billing_email: "", city: "", country: "ES", website: "", notes: "",
  };

  contactForm = {
    first_name: "", last_name: "", email: "",
    phone: "", role: "", is_primary: false,
  };

  readonly tabs = [
    { id: "overview" as TabId,  label: "Resumen" },
    { id: "projects" as TabId,  label: "Proyectos" },
    { id: "contacts" as TabId,  label: "Contactos" },
  ];

  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepo: ClientRepository,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id || id === "new") { this.loading.set(false); return; }

    try {
      const c = await this.clientRepo.get(id);
      this.client.set(c);
      if (c) {
        this.form = {
          name: c.name, status: c.status, tier: c.tier,
          billing_email: c.billing_email ?? "",
          city: c.city ?? "", country: c.country,
          website: c.website ?? "", notes: c.notes ?? "",
        };
      }
    } catch { /* silent */ }
    finally { this.loading.set(false); }
  }

  async save(): Promise<void> {
    const id = this.client()?.id;
    if (!id) return;

    this.saving.set(true);
    this.success.set(""); this.error.set("");

    try {
      const updated = await this.clientRepo.update(id, {
        name: this.form.name,
        status: this.form.status,
        tier: this.form.tier,
        billing_email: this.form.billing_email || null,
        city: this.form.city || null,
        country: this.form.country,
        website: this.form.website || null,
        notes: this.form.notes || null,
      });
      this.client.update((c) => c ? { ...c, ...updated } : c);
      this.success.set("Cliente actualizado.");
    } catch {
      this.error.set("No se pudo guardar.");
    } finally {
      this.saving.set(false);
    }
  }

  async saveContact(): Promise<void> {
    const id = this.client()?.id;
    if (!id || !this.contactForm.first_name.trim()) return;

    try {
      const contact = await this.clientRepo.createContact(id, {
        first_name: this.contactForm.first_name.trim(),
        last_name: this.contactForm.last_name.trim() || undefined,
        email: this.contactForm.email || null,
        phone: this.contactForm.phone || null,
        role: this.contactForm.role || null,
        is_primary: this.contactForm.is_primary,
      });

      this.client.update((c) => {
        if (!c) return c;
        return { ...c, contacts: [...(c.contacts ?? []), contact] };
      });

      this.contactForm = { first_name: "", last_name: "", email: "", phone: "", role: "", is_primary: false };
      this.showContactForm.set(false);
    } catch { /* silent */ }
  }

  async deleteClient(): Promise<void> {
    const id = this.client()?.id;
    if (!id || !confirm("¿Eliminar este cliente?")) return;
    try {
      await this.clientRepo.delete(id);
      await this.router.navigate(["/dashboard/clients"]);
    } catch {
      this.error.set("No se pudo eliminar el cliente.");
    }
  }

  statusBadge(s: string): string {
    if (s === "active") return "a-badge-active";
    if (s === "churned") return "a-badge-danger";
    return "a-badge-inactive";
  }

  statusLabel(s: string): string {
    return { active: "Activo", inactive: "Inactivo", churned: "Perdido" }[s] ?? s;
  }

  tierBadge(t: string): string {
    if (t === "enterprise")   return "a-badge-accent";
    if (t === "professional") return "a-badge-info";
    return "a-badge-draft";
  }

  tierLabel(t: string): string {
    return { starter: "Starter", professional: "Professional", enterprise: "Enterprise" }[t] ?? t;
  }

  projectStatusBadge(s: string): string {
    const map: Record<string, string> = {
      active: "a-badge-active", completed: "a-badge-active", discovery: "a-badge-info",
      planning: "a-badge-info", paused: "a-badge-pending", review: "a-badge-pending",
      cancelled: "a-badge-inactive",
    };
    return map[s] ?? "a-badge-draft";
  }

  projectStatusLabel(s: string): string {
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

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  }
}
