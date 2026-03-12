import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  CLIENT_REPOSITORY,
  ClientRepository,
  Client,
} from "src/app/domain/repositories/client.repository";

@Component({
  selector: "app-clients-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="a-page">
  <div class="page-header">
    <div class="page-header-left">
      <h1 class="page-title">Clientes</h1>
      <p class="page-subtitle">{{ total() }} clientes en total</p>
    </div>
    <div class="page-actions">
      <a routerLink="/dashboard/clients/new" class="a-btn a-btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo cliente
      </a>
    </div>
  </div>

  <!-- Filters -->
  <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;align-items:center">
    <input
      class="a-input" [(ngModel)]="searchQ" (ngModelChange)="onSearch()"
      placeholder="Buscar por nombre..."
      style="max-width:240px;height:32px;font-size:13px">

    @for (f of statusFilters; track f.value) {
      <button
        class="a-btn"
        [class.a-btn-secondary]="filterStatus() !== f.value"
        [class.a-btn-primary]="filterStatus() === f.value"
        style="height:28px;font-size:12px"
        (click)="setStatusFilter(f.value)">
        {{ f.label }}
      </button>
    }

    @for (f of tierFilters; track f.value) {
      <button
        class="a-btn"
        [class.a-btn-secondary]="filterTier() !== f.value"
        [class.a-btn-accent]="filterTier() === f.value"
        style="height:28px;font-size:12px"
        (click)="setTierFilter(f.value)">
        {{ f.label }}
      </button>
    }
  </div>

  @if (loading()) {
    <div style="display:flex;align-items:center;gap:10px;color:var(--a-text-muted);padding:40px 0">
      <span class="a-spinner"></span> Cargando clientes...
    </div>
  }

  @if (!loading()) {
    @if (clients().length === 0) {
      <div class="a-empty">
        <svg class="a-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <div class="a-empty-title">Sin clientes</div>
        <div class="a-empty-desc">Crea el primer cliente o conviérte un lead.</div>
        <a routerLink="/dashboard/clients/new" class="a-btn a-btn-primary" style="margin-top:8px">Nuevo cliente</a>
      </div>
    } @else {
      <div class="a-table-wrap">
        <table class="a-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Tier</th>
              <th>Tipo</th>
              <th>Proyectos activos</th>
              <th>Estado</th>
              <th>País</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (client of clients(); track client.id) {
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="a-avatar md">{{ client.name.slice(0,2).toUpperCase() }}</div>
                    <div>
                      <div style="font-weight:500">{{ client.name }}</div>
                      @if (client.billing_email) {
                        <div style="font-size:12px;color:var(--a-text-muted)">{{ client.billing_email }}</div>
                      }
                    </div>
                  </div>
                </td>
                <td><span [class]="'a-badge ' + tierBadge(client.tier)">{{ tierLabel(client.tier) }}</span></td>
                <td style="color:var(--a-text-muted)">{{ client.type === 'company' ? 'Empresa' : 'Individual' }}</td>
                <td>
                  @if (client.active_projects_count) {
                    <span style="font-weight:600;color:var(--a-text)">{{ client.active_projects_count }}</span>
                  } @else {
                    <span style="color:var(--a-text-subtle)">—</span>
                  }
                </td>
                <td><span [class]="'a-badge ' + statusBadge(client.status)">{{ statusLabel(client.status) }}</span></td>
                <td style="color:var(--a-text-muted)">{{ client.country }}</td>
                <td>
                  <div class="row-actions">
                    <a [routerLink]="['/dashboard/clients', client.id]" class="a-btn a-btn-ghost a-btn-sm">Ver</a>
                    <button class="a-btn a-btn-ghost a-btn-sm a-btn-icon" (click)="deleteClient(client)" style="color:var(--a-danger)" title="Eliminar">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  }
</div>
  `,
})
export class ClientsListComponent implements OnInit {
  clients = signal<Client[]>([]);
  total = signal(0);
  loading = signal(true);
  filterStatus = signal("all");
  filterTier = signal("all");
  searchQ = "";
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly statusFilters = [
    { value: "all",      label: "Todos" },
    { value: "active",   label: "Activos" },
    { value: "inactive", label: "Inactivos" },
    { value: "churned",  label: "Perdidos" },
  ];

  readonly tierFilters = [
    { value: "all",          label: "Todos los tiers" },
    { value: "starter",      label: "Starter" },
    { value: "professional", label: "Professional" },
    { value: "enterprise",   label: "Enterprise" },
  ];

  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepo: ClientRepository
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.clientRepo.list({
        status: this.filterStatus() !== "all" ? this.filterStatus() : undefined,
        tier:   this.filterTier() !== "all" ? this.filterTier() : undefined,
        q: this.searchQ.trim() || undefined,
        pageSize: 100,
      });
      this.clients.set(result.items);
      this.total.set(result.total);
    } catch { /* silent */ }
    finally { this.loading.set(false); }
  }

  onSearch(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.load(), 300);
  }

  async setStatusFilter(v: string): Promise<void> {
    this.filterStatus.set(v);
    await this.load();
  }

  async setTierFilter(v: string): Promise<void> {
    this.filterTier.set(v);
    await this.load();
  }

  async deleteClient(client: Client): Promise<void> {
    if (!confirm(`¿Eliminar el cliente "${client.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await this.clientRepo.delete(client.id);
      await this.load();
    } catch { /* silent */ }
  }

  tierBadge(t: string): string {
    if (t === "enterprise")   return "a-badge-accent";
    if (t === "professional") return "a-badge-info";
    return "a-badge-draft";
  }

  tierLabel(t: string): string {
    const map: Record<string, string> = {
      starter: "Starter", professional: "Professional", enterprise: "Enterprise",
    };
    return map[t] ?? t;
  }

  statusBadge(s: string): string {
    if (s === "active")   return "a-badge-active";
    if (s === "churned")  return "a-badge-danger";
    return "a-badge-inactive";
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = { active: "Activo", inactive: "Inactivo", churned: "Perdido" };
    return map[s] ?? s;
  }
}
