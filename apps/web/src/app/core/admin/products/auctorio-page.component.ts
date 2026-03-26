import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { buildAuctorioPublicLoginUrl } from "../../../services/auctorio-links";
import { AuctorioLaunchService } from "../integrations/auctorio-launch";

@Component({
  selector: "app-auctorio-page",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="a-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Auctorio</h1>
          <p class="page-subtitle">Producto editorial independiente con Studio propio</p>
        </div>
        <button class="a-btn a-btn-primary" type="button" [disabled]="launching" (click)="openStudio()">
          @if (launching) {
            <span class="a-spinner" style="width:13px;height:13px"></span>
          }
          Abrir Studio real
        </button>
      </div>

      @if (launchError) {
        <div class="a-card" style="margin-bottom:1rem;border-color:#fca5a5;background:#fff1f2;color:#991b1b">
          {{ launchError }}
        </div>
      }

      <div class="a-card" style="margin-bottom:1.5rem;background:#eff6ff;border:1px solid #93c5fd">
        <div style="display:flex;align-items:center;gap:1rem;padding:.25rem 0;flex-wrap:wrap">
          <span class="a-badge" style="background:#2563eb;color:#fff;font-size:.85rem;padding:.3rem .75rem">Producto separado</span>
          <span style="color:var(--a-text-muted)">Entrada operativa:</span>
          <strong style="color:#1d4ed8">{{ studioLoginUrl }}</strong>
          <span style="color:var(--a-text-muted);margin-left:auto;font-size:.875rem">SSO por workspace o lanzamiento delegado seguro</span>
        </div>
      </div>

      <div class="a-grid-3" style="margin-bottom:2rem">
        <div class="a-card">
          <div class="a-card-title" style="margin-bottom:.5rem">Acceso</div>
          <p style="margin:0;color:var(--a-text-muted)">
            El login se resuelve en el Studio real de Auctorio. TecnoRia solo enlaza y contextualiza el producto.
          </p>
        </div>
        <div class="a-card">
          <div class="a-card-title" style="margin-bottom:.5rem">Workspaces</div>
          <p style="margin:0;color:var(--a-text-muted)">
            Cada tenant opera aislado. Tecnoria, GuíaTV y Talkaris usan workspaces independientes dentro del mismo control plane.
          </p>
        </div>
        <div class="a-card">
          <div class="a-card-title" style="margin-bottom:.5rem">Modo actual</div>
          <p style="margin:0;color:var(--a-text-muted)">
            Si el workspace no tiene OIDC configurado, el acceso operativo debe venir por lanzamiento delegado seguro o por la ruta de emergencia del Studio.
          </p>
        </div>
      </div>

      <div class="a-card" style="margin-bottom:2rem">
        <div class="a-card-header">
          <h2 class="a-card-title">Qué ocurre desde aquí</h2>
        </div>
        <div style="display:grid;gap:1rem">
          <div style="padding:1rem;border:1px solid var(--a-border);border-radius:.75rem">
            <strong style="display:block;margin-bottom:.25rem">1. Seleccionas workspace</strong>
            <span style="color:var(--a-text-muted);font-size:.9rem">El login verifica si el tenant tiene SSO activo o si debe entrar por lanzamiento delegado seguro.</span>
          </div>
          <div style="padding:1rem;border:1px solid var(--a-border);border-radius:.75rem">
            <strong style="display:block;margin-bottom:.25rem">2. Autenticas en Auctorio Studio</strong>
            <span style="color:var(--a-text-muted);font-size:.9rem">La sesion vive en el Studio y no en el dashboard interno de TecnoRia.</span>
          </div>
          <div style="padding:1rem;border:1px solid var(--a-border);border-radius:.75rem">
            <strong style="display:block;margin-bottom:.25rem">3. Operas contenido y publishing</strong>
            <span style="color:var(--a-text-muted);font-size:.9rem">Roles, prompts, revisiones y publicaciones se gestionan dentro de Auctorio.</span>
          </div>
        </div>
      </div>

      <div class="a-card" style="background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff;border:none">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem">
          <div>
            <h3 style="margin:0 0 .25rem;color:#fff">Ir al producto real</h3>
            <p style="margin:0;color:#cbd5e1;font-size:.9rem">Usa el Studio operativo de Auctorio. Este panel ya no intenta simular sus métricas internas.</p>
          </div>
          <button class="a-btn" type="button" [disabled]="launching" (click)="openStudio()" style="background:#fff;color:#0f172a">
            Abrir Auctorio
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AuctorioPageComponent {
  readonly studioLoginUrl = buildAuctorioPublicLoginUrl();

  launching = false;
  launchError = "";

  constructor(private readonly auctorioLaunch: AuctorioLaunchService) {}

  async openStudio(): Promise<void> {
    this.launchError = "";
    this.launching = true;

    try {
      await this.auctorioLaunch.openStudioInNewTab({
        workspace: "tecnoria",
        returnTo: "/studio/dashboard",
      });
    } catch (error: any) {
      this.launchError = String(
        error?.error?.message || error?.message || "No se pudo abrir Auctorio."
      );
    } finally {
      this.launching = false;
    }
  }
}
