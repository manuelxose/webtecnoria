import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-access-restricted",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="auth-shell">
      <div class="site-container auth-grid auth-grid--single">
        <article class="auth-panel auth-panel--form surface-card">
          <div class="auth-card-head">
            <span class="panel-label">Acceso restringido</span>
            <h1>Tu sesion no tiene permisos para este panel.</h1>
            <p>
              El area privada editorial solo esta disponible para usuarios con
              rol de administracion o edicion.
            </p>
          </div>

          <div class="plain-list auth-checklist">
            <li>Si necesitas permisos adicionales, solicita revision de acceso.</li>
            <li>Puedes volver al site publico o cerrar sesion e iniciar con otra cuenta.</li>
          </div>

          <div class="auth-footer">
            <a class="button button-primary" routerLink="/auth-signup">Solicitar revision</a>
            <a class="button button-secondary" routerLink="/">Volver a la web</a>
          </div>
        </article>
      </div>
    </section>
  `,
})
export class AccessRestrictedComponent {}
