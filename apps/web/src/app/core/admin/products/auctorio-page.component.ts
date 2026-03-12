import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-auctorio-page",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="a-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Auctorio</h1>
          <p class="page-subtitle">Cockpit editorial con IA</p>
        </div>
      </div>

      <!-- Status banner -->
      <div class="a-card" style="margin-bottom:1.5rem;background:var(--a-success-light,#f0fdf4);border:1px solid var(--a-success,#22c55e)">
        <div style="display:flex;align-items:center;gap:1rem;padding:0.25rem 0">
          <span class="a-badge" style="background:#22c55e;color:#fff;font-size:0.85rem;padding:0.3rem 0.75rem">Servicio activo</span>
          <span style="color:var(--a-text-muted)">Motor IA:</span>
          <strong style="color:#16a34a">Online</strong>
          <span style="color:var(--a-text-muted);margin-left:auto;font-size:0.875rem">Todos los modelos disponibles</span>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="a-grid-4" style="margin-bottom:2rem">
        <div class="kpi-card">
          <div class="kpi-card-label">Artículos generados</div>
          <div class="kpi-card-value">24</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Artículos publicados</div>
          <div class="kpi-card-value">18</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">En revisión</div>
          <div class="kpi-card-value">6</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Créditos IA restantes</div>
          <div class="kpi-card-value">1,240</div>
        </div>
      </div>

      <!-- Actividad reciente -->
      <div class="a-card" style="margin-bottom:2rem">
        <div class="a-card-header">
          <h2 class="a-card-title">Actividad reciente</h2>
        </div>
        <div style="overflow-x:auto">
          <table class="a-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Estado</th>
                <th>Autor IA</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>5 tendencias en automatización 2025</strong></td>
                <td><span class="a-badge" style="background:#22c55e;color:#fff">Publicado</span></td>
                <td><span style="font-family:monospace;font-size:0.8rem;background:#f1f5f9;padding:2px 6px;border-radius:4px">GPT-4o</span></td>
                <td style="color:var(--a-text-muted)">10 mar</td>
              </tr>
              <tr>
                <td><strong>Cómo la IA transforma el servicio al cliente</strong></td>
                <td><span class="a-badge" style="background:#f59e0b;color:#fff">En revisión</span></td>
                <td><span style="font-family:monospace;font-size:0.8rem;background:#f1f5f9;padding:2px 6px;border-radius:4px">Claude 3</span></td>
                <td style="color:var(--a-text-muted)">11 mar</td>
              </tr>
              <tr>
                <td><strong>Guía completa de chatbots para empresas</strong></td>
                <td><span class="a-badge" style="background:#6b7280;color:#fff">Borrador</span></td>
                <td><span style="font-family:monospace;font-size:0.8rem;background:#f1f5f9;padding:2px 6px;border-radius:4px">GPT-4o</span></td>
                <td style="color:var(--a-text-muted)">12 mar</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Rendimiento SEO -->
      <div class="a-card" style="margin-bottom:2rem">
        <div class="a-card-header">
          <h2 class="a-card-title">Rendimiento SEO</h2>
        </div>
        <div class="a-grid-3">
          <div class="a-card" style="border:1px solid var(--a-border);text-align:center">
            <div style="font-size:2rem;font-weight:700;color:var(--a-brand)">12.4</div>
            <div style="font-size:0.85rem;color:var(--a-text-muted);margin-top:0.25rem">Posición media</div>
            <div style="font-size:0.75rem;color:#22c55e;margin-top:0.5rem">↑ Mejorando</div>
          </div>
          <div class="a-card" style="border:1px solid var(--a-border);text-align:center">
            <div style="font-size:2rem;font-weight:700;color:var(--a-brand)">45,230</div>
            <div style="font-size:0.85rem;color:var(--a-text-muted);margin-top:0.25rem">Impresiones totales</div>
            <div style="font-size:0.75rem;color:#22c55e;margin-top:0.5rem">↑ +12% este mes</div>
          </div>
          <div class="a-card" style="border:1px solid var(--a-border);text-align:center">
            <div style="font-size:2rem;font-weight:700;color:var(--a-brand)">3.8%</div>
            <div style="font-size:0.85rem;color:var(--a-text-muted);margin-top:0.25rem">CTR medio</div>
            <div style="font-size:0.75rem;color:#f59e0b;margin-top:0.5rem">→ Estable</div>
          </div>
        </div>
      </div>

      <!-- Bottom banner -->
      <div class="a-card" style="background:linear-gradient(135deg,#1e1b4b,#3730a3);color:#fff;border:none">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem">
          <div>
            <h3 style="margin:0 0 0.25rem;color:#fff">Cockpit editorial completo</h3>
            <p style="margin:0;color:#a5b4fc;font-size:0.9rem">Para gestionar los artículos y configurar los modelos IA, accede a la plataforma Auctorio →</p>
          </div>
          <button class="a-btn" disabled style="opacity:0.5;cursor:not-allowed;background:#fff;color:#1e1b4b">
            Abrir Auctorio
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AuctorioPageComponent {}
