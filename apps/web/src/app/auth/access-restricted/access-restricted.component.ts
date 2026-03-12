import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import {
  AUTH_REPOSITORY,
  AuthRepository,
  type AuthUser,
} from "src/app/domain/repositories/auth.repository";
import { brandLogos } from "src/app/site/content/site-content";
import { PrivateNavigationService } from "../private-navigation.service";

@Component({
  selector: "app-access-restricted",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="auth-shell">
      <div class="site-container auth-grid auth-grid--single">
        <article class="auth-panel auth-panel--form surface-card">
          <div class="auth-topbar">
            <a class="brand-logo" routerLink="/" aria-label="Volver a TecnoRia">
              <img
                class="brand-logo__asset"
                [src]="logos.lockup.dark.src"
                [alt]="logos.lockup.dark.alt"
                [attr.width]="logos.lockup.dark.width"
                [attr.height]="logos.lockup.dark.height"
              >
            </a>
            <button class="back-nav" type="button" (click)="goBack()">
              Volver
            </button>
          </div>

          <div class="auth-card-head">
            <span class="panel-label">Acceso restringido</span>
            <h1>{{ heading() }}</h1>
            <p>{{ description() }}</p>
          </div>

          <div class="plain-list auth-checklist">
            @for (item of checklist(); track item) {
              <li>{{ item }}</li>
            }
          </div>

          <div class="auth-footer">
            <a class="button button-primary" [routerLink]="primaryActionLink()">{{ primaryActionLabel() }}</a>
            <a class="button button-secondary" routerLink="/">Volver a la web</a>
          </div>
        </article>
      </div>
    </section>
  `,
})
export class AccessRestrictedComponent implements OnInit {
  logos = brandLogos;
  user = signal<AuthUser | null>(null);
  private readonly routeReason: AuthUser["role"] | null;

  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    private readonly route: ActivatedRoute,
    private readonly privateNavigation: PrivateNavigationService
  ) {
    const reason = this.route.snapshot.queryParamMap.get("reason");
    this.routeReason =
      reason === "admin" || reason === "editor" || reason === "viewer" || reason === "client"
        ? reason
        : null;
  }

  async ngOnInit(): Promise<void> {
    this.user.set(await this.authRepository.me());
  }

  async goBack(): Promise<void> {
    await this.privateNavigation.goBack(this.route, "/");
  }

  heading(): string {
    if (this.currentRole() === "client") {
      return "Esta cuenta solo puede entrar al portal de cliente.";
    }

    if (this.currentRole() === "viewer") {
      return "Tu usuario usa un rol legado que ya no abre paneles privados.";
    }

    return "Tu sesion no tiene permisos para este panel.";
  }

  description(): string {
    if (this.currentRole() === "client") {
      return "El panel editorial es solo para administracion y edicion. Tu cuenta esta vinculada al portal privado de cliente.";
    }

    if (this.currentRole() === "viewer") {
      return "El rol viewer ha quedado fuera del flujo normal. Si necesitas acceso interno, hay que migrar tu usuario a editor o admin. Si eres cliente, necesitas una cuenta client vinculada a tu empresa.";
    }

    return "El area privada editorial solo esta disponible para usuarios con rol de administracion o edicion.";
  }

  checklist(): string[] {
    if (this.currentRole() === "client") {
      return [
        "Puedes continuar en tu portal de cliente con la misma sesion activa.",
        "Si necesitas acceso editorial adicional, solicita revision al equipo de administracion.",
      ];
    }

    if (this.currentRole() === "viewer") {
      return [
        "Solicita migracion de acceso si tu usuario debe operar panel interno o portal cliente.",
        "Mientras tanto puedes volver al site publico o cerrar sesion e iniciar con otra cuenta.",
      ];
    }

    return [
      "Si necesitas permisos adicionales, solicita revision de acceso.",
      "Puedes volver al site publico o cerrar sesion e iniciar con otra cuenta.",
    ];
  }

  primaryActionLabel(): string {
    return this.currentRole() === "client" ? "Ir al portal cliente" : "Solicitar revision";
  }

  primaryActionLink(): string {
    return this.currentRole() === "client" ? "/portal/dashboard" : "/auth-signup";
  }

  private currentRole(): AuthUser["role"] | null {
    return this.user()?.role ?? this.routeReason;
  }
}
