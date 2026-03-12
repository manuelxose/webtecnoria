import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { USER_REPOSITORY, UserRepository, AdminUser, UserRole } from "src/app/domain/repositories/user.repository";
import { AUTH_REPOSITORY, AuthRepository, AuthUser } from "src/app/domain/repositories/auth.repository";

@Component({
  selector: "app-users-page",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="a-page">
      <div class="page-header">
        <h1 class="page-title">Equipo</h1>
        <button class="a-btn a-btn-primary" (click)="toggleInviteForm()">
          {{ showInviteForm() ? "Cancelar" : "Invitar usuario" }}
        </button>
      </div>

      <!-- KPI -->
      <div class="a-grid-4" style="margin-bottom:1.5rem">
        <div class="a-card" style="padding:1rem">
          <div style="font-size:.75rem;color:var(--a-muted);text-transform:uppercase;letter-spacing:.05em">Total miembros</div>
          <div style="font-size:2rem;font-weight:700;margin-top:.25rem">{{ users().length }}</div>
        </div>
      </div>

      <!-- Invite form -->
      @if (showInviteForm()) {
        <div class="a-card" style="margin-bottom:1.5rem;padding:1.5rem">
          <h2 style="margin:0 0 1rem;font-size:1rem;font-weight:600">Invitar nuevo usuario</h2>
          <div class="a-grid-3" style="gap:1rem;align-items:end">
            <div class="a-form-group">
              <label class="a-label">Email *</label>
              <input class="a-input" type="email" [(ngModel)]="inviteEmail" placeholder="correo@empresa.com" />
            </div>
            <div class="a-form-group">
              <label class="a-label">Nombre completo</label>
              <input class="a-input" type="text" [(ngModel)]="inviteFullName" placeholder="Nombre Apellido" />
            </div>
            <div class="a-form-group">
              <label class="a-label">Rol</label>
              <select class="a-select" [(ngModel)]="inviteRole">
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div style="margin-top:1rem;display:flex;gap:.75rem;align-items:center">
            <button class="a-btn a-btn-primary" (click)="submitInvite()" [disabled]="inviting()">
              {{ inviting() ? "Invitando…" : "Enviar invitación" }}
            </button>
            @if (inviteError()) {
              <span style="color:var(--a-danger);font-size:.875rem">{{ inviteError() }}</span>
            }
          </div>
          @if (tempPassword()) {
            <div style="margin-top:1rem;padding:1rem;background:var(--a-success-light,#ecfdf5);border:1px solid var(--a-success,#10b981);border-radius:.5rem">
              <p style="margin:0 0 .5rem;font-weight:600;color:var(--a-success,#10b981)">Usuario creado correctamente</p>
              <p style="margin:0;font-size:.875rem">Contraseña temporal: <strong style="font-family:monospace;font-size:1rem">{{ tempPassword() }}</strong></p>
              <p style="margin:.5rem 0 0;font-size:.75rem;color:var(--a-muted)">Comparte esta contraseña con el usuario. Podrá cambiarla en sus ajustes.</p>
            </div>
          }
        </div>
      }

      <!-- Loading / Error -->
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
          <p>No hay miembros del equipo todavía.</p>
        </div>
      } @else {
        <div class="a-card" style="overflow:hidden">
          <table class="a-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
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
                      <select class="a-select" style="padding:.25rem .5rem;font-size:.8rem"
                              [ngModel]="user.role" (ngModelChange)="changeRole(user, $event)">
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
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
  loading = signal(true);
  error = signal<string | null>(null);
  currentUser = signal<AuthUser | null>(null);

  showInviteForm = signal(false);
  inviting = signal(false);
  inviteError = signal<string | null>(null);
  tempPassword = signal<string | null>(null);

  inviteEmail = "";
  inviteFullName = "";
  inviteRole: UserRole = "viewer";

  constructor(
    @Inject(USER_REPOSITORY) private userRepo: UserRepository,
    @Inject(AUTH_REPOSITORY) private authRepo: AuthRepository,
  ) {}

  async ngOnInit() {
    try {
      const me = await this.authRepo.me();
      this.currentUser.set(me);
    } catch {}
    await this.load();
  }

  async load() {
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

  toggleInviteForm() {
    this.showInviteForm.update(v => !v);
    this.tempPassword.set(null);
    this.inviteError.set(null);
  }

  async submitInvite() {
    if (!this.inviteEmail.trim()) {
      this.inviteError.set("El email es obligatorio.");
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
      });
      this.tempPassword.set(result.temp_password);
      this.inviteEmail = "";
      this.inviteFullName = "";
      this.inviteRole = "viewer";
      await this.load();
    } catch (err: any) {
      this.inviteError.set(err?.error?.error || "Error al invitar al usuario.");
    } finally {
      this.inviting.set(false);
    }
  }

  async changeRole(user: AdminUser, newRole: UserRole) {
    try {
      const updated = await this.userRepo.update(user.id, { role: newRole });
      this.users.update(list => list.map(u => u.id === user.id ? updated : u));
    } catch {
      alert("No se pudo cambiar el rol.");
      await this.load();
    }
  }

  async deleteUser(user: AdminUser) {
    if (!confirm(`¿Eliminar a ${user.full_name || user.email}? Esta acción no se puede deshacer.`)) return;
    try {
      await this.userRepo.delete(user.id);
      this.users.update(list => list.filter(u => u.id !== user.id));
    } catch {
      alert("No se pudo eliminar el usuario.");
    }
  }

  isOwnRow(user: AdminUser): boolean {
    return this.currentUser()?.id === user.id;
  }

  roleBadgeClass(role: UserRole): string {
    const map: Record<UserRole, string> = {
      admin: "a-badge-danger",
      editor: "a-badge-info",
      viewer: "a-badge-draft",
    };
    return map[role] ?? "";
  }

  roleLabel(role: UserRole): string {
    const map: Record<UserRole, string> = {
      admin: "Admin",
      editor: "Editor",
      viewer: "Viewer",
    };
    return map[role] ?? role;
  }
}
