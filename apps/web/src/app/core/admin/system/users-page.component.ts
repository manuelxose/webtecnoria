import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  USER_REPOSITORY,
  UserRepository,
  AdminUser,
  UserRole,
} from "src/app/domain/repositories/user.repository";
import {
  AUTH_REPOSITORY,
  AuthRepository,
  AuthUser,
} from "src/app/domain/repositories/auth.repository";
import {
  CLIENT_REPOSITORY,
  ClientRepository,
  Client,
} from "src/app/domain/repositories/client.repository";

@Component({
  selector: "app-users-page",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="a-page">
      <div class="page-header">
        <h1 class="page-title">Accesos privados</h1>
        <button class="a-btn a-btn-primary" (click)="toggleInviteForm()">
          {{ showInviteForm() ? "Cancelar" : "Invitar usuario" }}
        </button>
      </div>

      <div class="a-grid-4" style="margin-bottom:1.5rem">
        <div class="a-card" style="padding:1rem">
          <div style="font-size:.75rem;color:var(--a-muted);text-transform:uppercase;letter-spacing:.05em">Total usuarios</div>
          <div style="font-size:2rem;font-weight:700;margin-top:.25rem">{{ users().length }}</div>
        </div>
        <div class="a-card" style="padding:1rem">
          <div style="font-size:.75rem;color:var(--a-muted);text-transform:uppercase;letter-spacing:.05em">Cuentas cliente</div>
          <div style="font-size:2rem;font-weight:700;margin-top:.25rem">{{ clientUsersCount() }}</div>
        </div>
      </div>

      @if (showInviteForm()) {
        <div class="a-card" style="margin-bottom:1.5rem;padding:1.5rem">
          <h2 style="margin:0 0 1rem;font-size:1rem;font-weight:600">Invitar nuevo usuario</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;align-items:end">
            <div class="a-form-group">
              <label class="a-label">Email *</label>
              <input class="a-input" type="email" [(ngModel)]="inviteEmail" placeholder="correo@empresa.com" />
            </div>
            <div class="a-form-group">
              <label class="a-label">Nombre completo</label>
              <input class="a-input" type="text" [(ngModel)]="inviteFullName" placeholder="Nombre Apellido" />
            </div>
            <div class="a-form-group">
              <label class="a-label">Tipo de acceso</label>
              <select class="a-select" [(ngModel)]="inviteRole">
                <option value="editor">Editor interno</option>
                <option value="admin">Admin interno</option>
                <option value="client">Cliente</option>
              </select>
            </div>
            @if (inviteRole === "client") {
              <div class="a-form-group">
                <label class="a-label">Cliente vinculado</label>
                <select class="a-select" [(ngModel)]="inviteClientId">
                  <option value="">Selecciona un cliente</option>
                  @for (client of clients(); track client.id) {
                    <option [value]="client.id">{{ client.name }}</option>
                  }
                </select>
              </div>
            }
          </div>
          <div style="margin-top:1rem;display:flex;gap:.75rem;align-items:center;flex-wrap:wrap">
            <button class="a-btn a-btn-primary" (click)="submitInvite()" [disabled]="inviting()">
              {{ inviting() ? "Invitando…" : "Crear acceso" }}
            </button>
            @if (inviteError()) {
              <span style="color:var(--a-danger);font-size:.875rem">{{ inviteError() }}</span>
            }
          </div>
          @if (tempPassword()) {
            <div style="margin-top:1rem;padding:1rem;background:var(--a-success-light,#ecfdf5);border:1px solid var(--a-success,#10b981);border-radius:.5rem">
              <p style="margin:0 0 .5rem;font-weight:600;color:var(--a-success,#10b981)">Usuario creado correctamente</p>
              <p style="margin:0;font-size:.875rem">Contraseña temporal: <strong style="font-family:monospace;font-size:1rem">{{ tempPassword() }}</strong></p>
              <p style="margin:.5rem 0 0;font-size:.75rem;color:var(--a-muted)">Comparte esta contraseña por un canal seguro. Si es una cuenta cliente, quedará ligada al cliente seleccionado.</p>
            </div>
          }
        </div>
      }

      @if (loading()) {
        <div style="display:flex;justify-content:center;padding:3rem">
          <span class="a-spinner"></span>
        </div>
      } @else if (error()) {
        <div class="a-card a-empty">
          <p>{{ error() }}</p>
          <button class="a-btn a-btn-primary" (click)="load()">Reintentar</button>
        </div>
      } @else if (users().length === 0) {
        <div class="a-card a-empty">
          <p>No hay usuarios privados todavía.</p>
        </div>
      } @else {
        <div class="a-card" style="overflow:hidden">
          <table class="a-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Ambito</th>
                <th>Miembro desde</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user.id) {
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:.75rem">
                      @if (user.avatar_url) {
                        <img [src]="user.avatar_url" [alt]="user.full_name || user.email"
                             style="width:2rem;height:2rem;border-radius:50%;object-fit:cover" />
                      } @else {
                        <div style="width:2rem;height:2rem;border-radius:50%;background:var(--a-primary,#6366f1);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:600">
                          {{ (user.full_name || user.email).charAt(0).toUpperCase() }}
                        </div>
                      }
                      <span style="font-weight:500">{{ user.full_name || "—" }}</span>
                    </div>
                  </td>
                  <td style="color:var(--a-muted);font-size:.875rem">{{ user.email }}</td>
                  <td>
                    @if (isOwnRow(user)) {
                      <span [class]="'a-badge ' + roleBadgeClass(user.role)">{{ roleLabel(user.role) }}</span>
                    } @else {
                      <select
                        class="a-select"
                        style="padding:.25rem .5rem;font-size:.8rem"
                        [ngModel]="user.role"
                        (ngModelChange)="changeRole(user, $event)"
                      >
                        @for (option of availableRoleOptions(user); track option.value) {
                          <option [value]="option.value">{{ option.label }}</option>
                        }
                      </select>
                    }
                  </td>
                  <td>
                    @if (user.role === "client") {
                      @if (isOwnRow(user)) {
                        <span style="font-size:.875rem">{{ user.client_name || "Sin cliente" }}</span>
                      } @else {
                        <select
                          class="a-select"
                          style="padding:.25rem .5rem;font-size:.8rem;min-width:180px"
                          [ngModel]="user.client_id ?? ''"
                          (ngModelChange)="changeClient(user, $event)"
                        >
                          <option value="">Selecciona un cliente</option>
                          @for (client of clients(); track client.id) {
                            <option [value]="client.id">{{ client.name }}</option>
                          }
                        </select>
                      }
                    } @else if (user.role === "viewer") {
                      <span style="font-size:.8rem;color:var(--a-warning,#d97706)">Viewer legado</span>
                    } @else {
                      <span style="font-size:.8rem;color:var(--a-muted)">Equipo interno</span>
                    }
                  </td>
                  <td style="font-size:.875rem;color:var(--a-muted)">{{ user.created_at | date:'dd MMM yyyy' }}</td>
                  <td>
                    @if (!isOwnRow(user)) {
                      <button class="a-btn" style="color:var(--a-danger);border-color:var(--a-danger);padding:.25rem .75rem;font-size:.8rem"
                              (click)="deleteUser(user)">
                        Eliminar
                      </button>
                    } @else {
                      <span style="font-size:.75rem;color:var(--a-muted)">Tú</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class UsersPageComponent implements OnInit {
  users = signal<AdminUser[]>([]);
  clients = signal<Client[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  currentUser = signal<AuthUser | null>(null);

  showInviteForm = signal(false);
  inviting = signal(false);
  inviteError = signal<string | null>(null);
  tempPassword = signal<string | null>(null);

  inviteEmail = "";
  inviteFullName = "";
  inviteRole: UserRole = "editor";
  inviteClientId = "";

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
    @Inject(AUTH_REPOSITORY) private readonly authRepo: AuthRepository,
    @Inject(CLIENT_REPOSITORY) private readonly clientRepo: ClientRepository,
  ) {}

  async ngOnInit(): Promise<void> {
    const [me, clientsResult] = await Promise.all([
      this.authRepo.me().catch(() => null),
      this.clientRepo.list({ pageSize: 100 }).catch(() => ({ items: [] as Client[] })),
    ]);

    this.currentUser.set(me);
    this.clients.set(clientsResult.items);
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const list = await this.userRepo.list();
      this.users.set(list);
    } catch {
      this.error.set("Error al cargar los usuarios.");
    } finally {
      this.loading.set(false);
    }
  }

  clientUsersCount(): number {
    return this.users().filter((user) => user.role === "client").length;
  }

  toggleInviteForm(): void {
    this.showInviteForm.update((value) => !value);
    this.tempPassword.set(null);
    this.inviteError.set(null);
  }

  async submitInvite(): Promise<void> {
    if (!this.inviteEmail.trim()) {
      this.inviteError.set("El email es obligatorio.");
      return;
    }

    if (this.inviteRole === "client" && !this.inviteClientId) {
      this.inviteError.set("Selecciona el cliente que debe quedar vinculado.");
      return;
    }

    this.inviting.set(true);
    this.inviteError.set(null);
    this.tempPassword.set(null);

    try {
      const result = await this.userRepo.invite({
        email: this.inviteEmail.trim(),
        full_name: this.inviteFullName.trim() || null,
        role: this.inviteRole,
        client_id: this.inviteRole === "client" ? this.inviteClientId : null,
      });
      this.tempPassword.set(result.temp_password);
      this.inviteEmail = "";
      this.inviteFullName = "";
      this.inviteRole = "editor";
      this.inviteClientId = "";
      await this.load();
    } catch (err: any) {
      this.inviteError.set(err?.error?.error || "Error al invitar al usuario.");
    } finally {
      this.inviting.set(false);
    }
  }

  async changeRole(user: AdminUser, newRole: UserRole): Promise<void> {
    if (newRole === "client" && !user.client_id) {
      alert("Asigna primero un cliente a esta cuenta antes de convertirla en acceso cliente.");
      await this.load();
      return;
    }

    try {
      const updated = await this.userRepo.update(user.id, {
        role: newRole,
        client_id: newRole === "client" ? user.client_id : null,
      });
      this.users.update((list) => list.map((item) => (item.id === user.id ? updated : item)));
    } catch {
      alert("No se pudo cambiar el rol.");
      await this.load();
    }
  }

  async changeClient(user: AdminUser, clientId: string): Promise<void> {
    if (!clientId) {
      alert("Selecciona un cliente valido.");
      await this.load();
      return;
    }

    try {
      const updated = await this.userRepo.update(user.id, {
        role: "client",
        client_id: clientId,
      });
      this.users.update((list) => list.map((item) => (item.id === user.id ? updated : item)));
    } catch {
      alert("No se pudo actualizar el cliente vinculado.");
      await this.load();
    }
  }

  async deleteUser(user: AdminUser): Promise<void> {
    if (!confirm(`¿Eliminar a ${user.full_name || user.email}? Esta acción no se puede deshacer.`)) return;
    try {
      await this.userRepo.delete(user.id);
      this.users.update((list) => list.filter((item) => item.id !== user.id));
    } catch {
      alert("No se pudo eliminar el usuario.");
    }
  }

  isOwnRow(user: AdminUser): boolean {
    return this.currentUser()?.id === user.id;
  }

  availableRoleOptions(user: AdminUser): Array<{ value: UserRole; label: string }> {
    const options: Array<{ value: UserRole; label: string }> = [
      { value: "editor", label: "Editor" },
      { value: "admin", label: "Admin" },
    ];

    if (user.role === "client") {
      options.unshift({ value: "client", label: "Cliente" });
    }

    if (user.role === "viewer") {
      options.unshift({ value: "viewer", label: "Viewer legado" });
    }

    return options;
  }

  roleBadgeClass(role: UserRole): string {
    const map: Record<UserRole, string> = {
      admin: "a-badge-danger",
      editor: "a-badge-info",
      client: "a-badge-accent",
      viewer: "a-badge-draft",
    };
    return map[role] ?? "";
  }

  roleLabel(role: UserRole): string {
    const map: Record<UserRole, string> = {
      admin: "Admin",
      editor: "Editor",
      client: "Cliente",
      viewer: "Viewer legado",
    };
    return map[role] ?? role;
  }
}
