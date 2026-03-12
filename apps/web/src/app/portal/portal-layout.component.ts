import { Component, Inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { PORTAL_REPOSITORY, PortalRepository, PortalClient } from "src/app/domain/repositories/portal.repository";
import {
  AUTH_REPOSITORY,
  AuthRepository,
} from "src/app/domain/repositories/auth.repository";

@Component({
  selector: "app-portal-layout",
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .portal-shell { display:flex;min-height:100vh;background:var(--portal-bg,#f8fafc) }
    .portal-sidebar { width:220px;flex-shrink:0;background:#fff;border-right:1px solid #e2e8f0;display:flex;flex-direction:column;padding:0 0 16px }
    .portal-main { flex:1;overflow:auto }
    .portal-logo { padding:20px 20px 16px;border-bottom:1px solid #e2e8f0;margin-bottom:8px }
    .portal-logo-title { font-size:15px;font-weight:700;color:#0f172a }
    .portal-logo-sub { font-size:12px;color:#64748b;margin-top:2px }
    .portal-nav-item { display:flex;align-items:center;gap:8px;padding:8px 16px;font-size:13px;color:#475569;text-decoration:none;border-radius:6px;margin:1px 8px;transition:background .15s }
    .portal-nav-item:hover { background:#f1f5f9 }
    .portal-nav-item.active { background:#eef2ff;color:#6366f1;font-weight:600 }
    .portal-content { padding:24px }
  `],
  template: `
<div class="portal-shell">
  <nav class="portal-sidebar">
    <div class="portal-logo">
      <div class="portal-logo-title">{{ client()?.name || 'Portal' }}</div>
      <div class="portal-logo-sub">Portal de cliente · Tecnoria</div>
    </div>

    <a routerLink="/portal/dashboard" routerLinkActive="active" class="portal-nav-item">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
      Resumen
    </a>
    <a routerLink="/portal/projects" routerLinkActive="active" class="portal-nav-item">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
      Proyectos
    </a>
    <a routerLink="/portal/invoices" routerLinkActive="active" class="portal-nav-item">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
      Facturas
    </a>
    <a routerLink="/portal/tickets" routerLinkActive="active" class="portal-nav-item">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      Soporte
    </a>

    <div style="flex:1"></div>
    <button (click)="logout()" style="display:flex;align-items:center;gap:8px;padding:8px 16px;font-size:13px;color:#94a3b8;background:none;border:none;cursor:pointer;margin:0 8px;border-radius:6px;width:calc(100%-16px)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      Salir
    </button>
  </nav>

  <main class="portal-main">
    <div class="portal-content">
      <router-outlet></router-outlet>
    </div>
  </main>
</div>
  `,
})
export class PortalLayoutComponent implements OnInit {
  client = signal<PortalClient | null>(null);

  constructor(
    @Inject(PORTAL_REPOSITORY) private readonly portalRepo: PortalRepository,
    @Inject(AUTH_REPOSITORY) private readonly authRepo: AuthRepository,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try { this.client.set(await this.portalRepo.me()); }
    catch { await this.router.navigate(["/portal"]); }
  }

  async logout(): Promise<void> {
    try {
      await this.authRepo.logout();
    } finally {
      await this.router.navigate(["/portal"]);
    }
  }
}
