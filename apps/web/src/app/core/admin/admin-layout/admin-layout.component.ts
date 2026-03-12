import { Component, HostListener, Inject, OnInit, signal } from "@angular/core";
import { Router, RouterModule, NavigationEnd } from "@angular/router";
import { CommonModule } from "@angular/common";
import { filter } from "rxjs/operators";
import {
  AUTH_REPOSITORY,
  AuthRepository,
  AuthUser,
} from "src/app/domain/repositories/auth.repository";

type NavItem = {
  label: string;
  path: string;
  icon: string;
  badge?: number;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

@Component({
  selector: "app-admin-layout",
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ["./admin-layout.component.css"],
  template: `
<div class="admin-root">
  <!-- Sidebar overlay (mobile) -->
  <div
    class="sidebar-overlay"
    [class.visible]="sidebarOpen()"
    (click)="closeSidebar()"
  ></div>

  <div class="admin-shell">
    <!-- ── SIDEBAR ────────────────────────────────────── -->
    <nav class="admin-sidebar" [class.open]="sidebarOpen()">
      <!-- Logo -->
      <div class="sidebar-logo">
        <img src="/assets/brand/tecnoria-mark-light.svg" alt="Tecnoria" />
        <span class="sidebar-logo-label">Tecnoria</span>
      </div>

      <!-- Navigation -->
      <div class="sidebar-nav">
        <!-- Dashboard link -->
        <div class="sidebar-section">
          <a
            routerLink="/dashboard"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="sidebar-item"
            (click)="closeSidebar()"
          >
            <svg class="sidebar-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </a>
        </div>

        <!-- Sections -->
        @for (section of navSections; track section.label) {
          <div class="sidebar-section">
            <div class="sidebar-section-label">{{ section.label }}</div>
            @for (item of section.items; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="active"
                class="sidebar-item"
                (click)="closeSidebar()"
              >
                <span class="sidebar-item-icon" [innerHTML]="item.icon"></span>
                {{ item.label }}
                @if (item.badge) {
                  <span class="sidebar-item-badge">{{ item.badge }}</span>
                }
              </a>
            }
          </div>
        }
      </div>

      <!-- User footer -->
      <div class="sidebar-user" (click)="logout()">
        <div class="a-avatar sm">
          {{ userInitials() }}
        </div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">{{ user()?.displayName || user()?.email }}</div>
          <div class="sidebar-user-role">{{ user()?.role }}</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--a-text-subtle);flex-shrink:0">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </div>
    </nav>

    <!-- ── MAIN ──────────────────────────────────────── -->
    <div class="admin-main">
      <!-- Topbar -->
      <header class="admin-topbar">
        <!-- Mobile menu toggle -->
        <button class="topbar-icon-btn" (click)="toggleSidebar()" style="display:none" id="sidebar-toggle">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <div class="topbar-breadcrumb">
          <span>Tecnoria</span>
          <span class="topbar-breadcrumb-sep">/</span>
          <span class="topbar-breadcrumb-current">{{ currentSection() }}</span>
        </div>

        <div class="topbar-actions">
          <button class="topbar-icon-btn" title="Notificaciones">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <a routerLink="/" class="topbar-icon-btn" title="Ver sitio">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </a>
        </div>
      </header>

      <!-- Content -->
      <main class="admin-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  </div>
</div>
  `,
})
export class AdminLayoutComponent implements OnInit {
  user = signal<AuthUser | null>(null);
  sidebarOpen = signal(false);
  currentSection = signal("Dashboard");

  readonly navSections: NavSection[] = [
    {
      label: "Pipeline",
      items: [
        { label: "Leads", path: "/dashboard/leads", icon: this.icon("user-plus") },
        { label: "Clientes", path: "/dashboard/clients", icon: this.icon("users") },
        { label: "Empresas", path: "/dashboard/companies", icon: this.icon("building") },
      ],
    },
    {
      label: "Delivery",
      items: [
        { label: "Proyectos", path: "/dashboard/projects", icon: this.icon("folder") },
        { label: "Tareas", path: "/dashboard/tasks", icon: this.icon("check-square") },
      ],
    },
    {
      label: "Productos",
      items: [
        { label: "Talkaris", path: "/dashboard/products/talkaris", icon: this.icon("message-square") },
        { label: "Auctorio", path: "/dashboard/products/auctorio", icon: this.icon("pen-tool") },
      ],
    },
    {
      label: "Finanzas",
      items: [
        { label: "Resumen", path: "/dashboard/finance", icon: this.icon("trending-up") },
        { label: "Contratos", path: "/dashboard/finance/contracts", icon: this.icon("file-text") },
        { label: "Facturas", path: "/dashboard/finance/invoices", icon: this.icon("receipt") },
      ],
    },
    {
      label: "Operaciones",
      items: [
        { label: "Soporte", path: "/dashboard/support", icon: this.icon("life-buoy") },
        { label: "Documentos", path: "/dashboard/documents", icon: this.icon("paperclip") },
      ],
    },
    {
      label: "Insights",
      items: [
        { label: "Analytics", path: "/dashboard/analytics", icon: this.icon("bar-chart") },
        { label: "Blog", path: "/dashboard/blog", icon: this.icon("rss") },
      ],
    },
    {
      label: "Sistema",
      items: [
        { label: "Equipo", path: "/dashboard/users", icon: this.icon("user-cog") },
        { label: "Ajustes", path: "/dashboard/settings", icon: this.icon("settings") },
      ],
    },
  ];

  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepo: AuthRepository,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.user.set(await this.authRepo.me());
    this.updateSection(this.router.url);

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.updateSection(e.urlAfterRedirects ?? e.url);
        this.closeSidebar();
      });
  }

  userInitials(): string {
    const u = this.user();
    if (!u) return "?";
    const name = u.displayName || u.email || "";
    return name.slice(0, 2).toUpperCase();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  async logout(): Promise<void> {
    try { await this.authRepo.logout(); } finally {
      await this.router.navigate(["/auth-login"]);
    }
  }

  @HostListener("window:resize")
  onResize(): void {
    if (window.innerWidth >= 1024) this.closeSidebar();
  }

  private updateSection(url: string): void {
    const map: Record<string, string> = {
      "/dashboard/leads": "Leads",
      "/dashboard/clients": "Clientes",
      "/dashboard/companies": "Empresas",
      "/dashboard/projects": "Proyectos",
      "/dashboard/tasks": "Tareas",
      "/dashboard/products": "Productos",
      "/dashboard/support": "Soporte",
      "/dashboard/finance/contracts": "Contratos",
      "/dashboard/finance/invoices": "Facturas",
      "/dashboard/finance": "Finanzas",
      "/dashboard/documents": "Documentos",
      "/dashboard/analytics": "Analytics",
      "/dashboard/blog": "Blog",
      "/dashboard/users": "Equipo",
      "/dashboard/settings": "Ajustes",
    };

    for (const [path, label] of Object.entries(map)) {
      if (url.startsWith(path)) { this.currentSection.set(label); return; }
    }

    this.currentSection.set("Dashboard");
  }

  private icon(name: string): string {
    const icons: Record<string, string> = {
      "user-plus": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
      "users":     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      "building":  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="19"/><path d="M8 21V10m8 11V10M2 7h20"/></svg>`,
      "folder":    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
      "check-square":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
      "message-square":`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      "pen-tool":  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
      "life-buoy": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>`,
      "receipt":   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>`,
      "paperclip": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,
      "bar-chart": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,
      "rss":       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1" fill="currentColor"/></svg>`,
      "user-cog":  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      "settings":    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
      "trending-up": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
      "file-text":   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    };

    return icons[name] ?? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
  }
}
