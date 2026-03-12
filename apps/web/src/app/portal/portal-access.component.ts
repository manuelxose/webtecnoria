import { Component, Inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { PORTAL_REPOSITORY, PortalRepository } from "src/app/domain/repositories/portal.repository";
import { ApiPortalRepository } from "src/app/infrastructure/repositories/api/api-portal.repository";

@Component({
  selector: "app-portal-access",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--a-bg-subtle,#f8fafc);padding:24px">
  <div style="width:100%;max-width:400px">
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:28px;font-weight:800;letter-spacing:-0.5px;color:var(--a-text,#0f172a)">Portal de cliente</div>
      <div style="font-size:14px;color:var(--a-text-muted,#64748b);margin-top:8px">Introduce tu token de acceso</div>
    </div>

    <div style="background:#fff;border:1px solid var(--a-border,#e2e8f0);border-radius:12px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,.06)">
      @if (error()) {
        <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;color:#dc2626;padding:10px 14px;font-size:13px;margin-bottom:16px">{{ error() }}</div>
      }
      <form (ngSubmit)="enter()">
        <div style="margin-bottom:16px">
          <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px">Token de acceso</label>
          <input
            style="width:100%;padding:8px 12px;border:1px solid var(--a-border,#e2e8f0);border-radius:8px;font-size:14px;font-family:monospace;box-sizing:border-box;outline:none"
            [(ngModel)]="token" name="token" required
            placeholder="Introduce tu token...">
        </div>
        <button
          type="submit"
          style="width:100%;padding:10px;background:var(--a-brand,#6366f1);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer"
          [disabled]="loading()">
          @if (loading()) { Verificando… } @else { Acceder al portal }
        </button>
      </form>
    </div>

    <div style="text-align:center;margin-top:16px;font-size:12px;color:var(--a-text-muted,#64748b)">
      ¿No tienes token? Contacta con tu gestor de cuenta.
    </div>
  </div>
</div>
  `,
})
export class PortalAccessComponent {
  token   = "";
  loading = signal(false);
  error   = signal("");

  constructor(
    @Inject(PORTAL_REPOSITORY) private readonly portalRepo: PortalRepository,
    private readonly router: Router
  ) {}

  async enter(): Promise<void> {
    if (!this.token.trim()) return;
    this.loading.set(true);
    this.error.set("");
    ApiPortalRepository.saveToken(this.token.trim());
    try {
      await this.portalRepo.me(); // validate token
      await this.router.navigate(["/portal/dashboard"]);
    } catch {
      ApiPortalRepository.clearToken();
      this.error.set("Token inválido o expirado. Verifica con tu gestor de cuenta.");
      this.loading.set(false);
    }
  }
}
