import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { USER_REPOSITORY, UserRepository } from "src/app/domain/repositories/user.repository";
import { AUTH_REPOSITORY, AuthRepository, AuthUser } from "src/app/domain/repositories/auth.repository";

@Component({
  selector: "app-settings-page",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="a-page">
      <div class="page-header">
        <h1 class="page-title">Ajustes</h1>
      </div>

      <!-- Perfil -->
      <section style="margin-bottom:2rem">
        <h2 style="font-size:1rem;font-weight:600;margin:0 0 1rem">Perfil</h2>
        <div class="a-card" style="padding:1.5rem">
          @if (profileLoading()) {
            <div style="display:flex;justify-content:center;padding:2rem">
              <span class="a-spinner"></span>
            </div>
          } @else {
            <div class="a-grid-2" style="gap:1rem;margin-bottom:1rem">
              <div class="a-form-group">
                <label class="a-label">Nombre completo</label>
                <input class="a-input" type="text" [(ngModel)]="profileFullName" placeholder="Tu nombre" />
              </div>
              <div class="a-form-group">
                <label class="a-label">URL del avatar</label>
                <input class="a-input" type="url" [(ngModel)]="profileAvatarUrl" placeholder="https://…" />
              </div>
            </div>
            <div style="display:flex;gap:.75rem;align-items:center">
              <button class="a-btn a-btn-primary" (click)="saveProfile()" [disabled]="savingProfile()">
                {{ savingProfile() ? "Guardando…" : "Guardar cambios" }}
              </button>
              @if (profileSuccess()) {
                <span style="color:var(--a-success,#10b981);font-size:.875rem">Guardado correctamente.</span>
              }
              @if (profileError()) {
                <span style="color:var(--a-danger);font-size:.875rem">{{ profileError() }}</span>
              }
            </div>
          }
        </div>
      </section>

      <!-- Cambiar contraseña -->
      <section style="margin-bottom:2rem">
        <h2 style="font-size:1rem;font-weight:600;margin:0 0 1rem">Cambiar contraseña</h2>
        <div class="a-card" style="padding:1.5rem">
          <div class="a-grid-2" style="gap:1rem;margin-bottom:1rem">
            <div class="a-form-group">
              <label class="a-label">Contraseña actual</label>
              <input class="a-input" type="password" placeholder="••••••••" disabled />
            </div>
            <div class="a-form-group">
              <label class="a-label">Nueva contraseña</label>
              <input class="a-input" type="password" placeholder="••••••••" disabled />
            </div>
          </div>
          <button class="a-btn" disabled style="opacity:.6;cursor:not-allowed">
            Próximamente
          </button>
        </div>
      </section>

      <!-- Apariencia -->
      <section style="margin-bottom:2rem">
        <h2 style="font-size:1rem;font-weight:600;margin:0 0 1rem">Apariencia</h2>
        <div class="a-grid-2" style="gap:1rem">
          <div class="a-card" style="padding:1.5rem;cursor:pointer;border:2px solid transparent"
               [style.borderColor]="currentTheme() === 'light' ? 'var(--a-primary,#6366f1)' : 'transparent'"
               (click)="setTheme('light')">
            <div style="display:flex;align-items:center;gap:.75rem">
              <div style="width:2.5rem;height:2.5rem;border-radius:.5rem;background:#f8fafc;border:1px solid #e2e8f0;display:flex;align-items:center;justify-content:center;font-size:1.25rem">
                ☀️
              </div>
              <div>
                <div style="font-weight:600">Modo claro</div>
                <div style="font-size:.8rem;color:var(--a-muted)">Interfaz en fondo blanco</div>
              </div>
              @if (currentTheme() === 'light') {
                <span class="a-badge a-badge-info" style="margin-left:auto">Activo</span>
              }
            </div>
          </div>
          <div class="a-card" style="padding:1.5rem;cursor:pointer;border:2px solid transparent"
               [style.borderColor]="currentTheme() === 'dark' ? 'var(--a-primary,#6366f1)' : 'transparent'"
               (click)="setTheme('dark')">
            <div style="display:flex;align-items:center;gap:.75rem">
              <div style="width:2.5rem;height:2.5rem;border-radius:.5rem;background:#1e293b;border:1px solid #334155;display:flex;align-items:center;justify-content:center;font-size:1.25rem">
                🌙
              </div>
              <div>
                <div style="font-weight:600">Modo oscuro</div>
                <div style="font-size:.8rem;color:var(--a-muted)">Interfaz en fondo oscuro</div>
              </div>
              @if (currentTheme() === 'dark') {
                <span class="a-badge a-badge-info" style="margin-left:auto">Activo</span>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Datos del workspace -->
      <section>
        <h2 style="font-size:1rem;font-weight:600;margin:0 0 1rem">Datos del workspace</h2>
        <div class="a-card" style="padding:1.5rem">
          <div class="a-grid-3" style="gap:1.5rem">
            <div>
              <div style="font-size:.75rem;color:var(--a-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.25rem">Workspace</div>
              <div style="font-weight:600">Tecnoria</div>
            </div>
            <div>
              <div style="font-size:.75rem;color:var(--a-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.25rem">Plan</div>
              <div style="font-weight:600">
                <span class="a-badge a-badge-info">Enterprise</span>
              </div>
            </div>
            <div>
              <div style="font-size:.75rem;color:var(--a-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.25rem">Región</div>
              <div style="font-weight:600">EU-West</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class SettingsPageComponent implements OnInit {
  currentUser = signal<AuthUser | null>(null);
  profileLoading = signal(true);
  savingProfile = signal(false);
  profileSuccess = signal(false);
  profileError = signal<string | null>(null);
  currentTheme = signal<"light" | "dark">("light");

  profileFullName = "";
  profileAvatarUrl = "";

  constructor(
    @Inject(USER_REPOSITORY) private userRepo: UserRepository,
    @Inject(AUTH_REPOSITORY) private authRepo: AuthRepository,
  ) {}

  async ngOnInit() {
    // Load saved theme
    const saved = localStorage.getItem("tecnoria-theme") as "light" | "dark" | null;
    if (saved) {
      this.currentTheme.set(saved);
    } else {
      const isDark = document.documentElement.classList.contains("dark");
      this.currentTheme.set(isDark ? "dark" : "light");
    }

    try {
      const me = await this.authRepo.me();
      this.currentUser.set(me);
      if (me) {
        const user = await this.userRepo.get(me.id);
        if (user) {
          this.profileFullName = user.full_name ?? "";
          this.profileAvatarUrl = user.avatar_url ?? "";
        }
      }
    } catch {}
    finally {
      this.profileLoading.set(false);
    }
  }

  async saveProfile() {
    const me = this.currentUser();
    if (!me) return;
    this.savingProfile.set(true);
    this.profileSuccess.set(false);
    this.profileError.set(null);
    try {
      await this.userRepo.update(me.id, {
        full_name: this.profileFullName.trim() || null,
        avatar_url: this.profileAvatarUrl.trim() || null,
      });
      this.profileSuccess.set(true);
      setTimeout(() => this.profileSuccess.set(false), 3000);
    } catch {
      this.profileError.set("No se pudo guardar el perfil.");
    } finally {
      this.savingProfile.set(false);
    }
  }

  setTheme(theme: "light" | "dark") {
    this.currentTheme.set(theme);
    localStorage.setItem("tecnoria-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
}
