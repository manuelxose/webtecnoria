import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-talkaris-page",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="a-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Talkaris</h1>
          <p class="page-subtitle">Plataforma de chatbots inteligentes</p>
        </div>
      </div>

      <!-- Status banner -->
      <div class="a-card" style="margin-bottom:1.5rem;background:var(--a-success-light,#f0fdf4);border:1px solid var(--a-success,#22c55e)">
        <div style="display:flex;align-items:center;gap:1rem;padding:0.25rem 0">
          <span class="a-badge" style="background:#22c55e;color:#fff;font-size:0.85rem;padding:0.3rem 0.75rem">Servicio activo</span>
          <span style="color:var(--a-text-muted)">Uptime:</span>
          <strong style="color:#16a34a">99.9%</strong>
          <span style="color:var(--a-text-muted);margin-left:auto;font-size:0.875rem">Todos los sistemas operativos</span>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="a-grid-4" style="margin-bottom:2rem">
        <div class="kpi-card">
          <div class="kpi-card-label">Chatbots activos</div>
          <div class="kpi-card-value">3</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Conversaciones hoy</div>
          <div class="kpi-card-value">142</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Mensajes totales</div>
          <div class="kpi-card-value">8,420</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Tasa de resolución</div>
          <div class="kpi-card-value">87%</div>
        </div>
      </div>

      <!-- Chatbots table -->
      <div class="a-card" style="margin-bottom:2rem">
        <div class="a-card-header">
          <h2 class="a-card-title">Chatbots</h2>
        </div>
        <div style="overflow-x:auto">
          <table class="a-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Mensajes/día</th>
                <th>Última actividad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Bot Soporte TechCo</strong></td>
                <td>TechCo SL</td>
                <td><span class="a-badge" style="background:#22c55e;color:#fff">Activo</span></td>
                <td>48</td>
                <td style="color:var(--a-text-muted)">Hace 2 min</td>
              </tr>
              <tr>
                <td><strong>Asistente Ventas</strong></td>
                <td>InnovaGroup</td>
                <td><span class="a-badge" style="background:#22c55e;color:#fff">Activo</span></td>
                <td>35</td>
                <td style="color:var(--a-text-muted)">Hace 15 min</td>
              </tr>
              <tr>
                <td><strong>FAQ Automático</strong></td>
                <td>StartupXYZ</td>
                <td><span class="a-badge" style="background:#f59e0b;color:#fff">Pausado</span></td>
                <td>0</td>
                <td style="color:var(--a-text-muted)">Hace 2 días</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Integraciones -->
      <div class="a-card" style="margin-bottom:2rem">
        <div class="a-card-header">
          <h2 class="a-card-title">Integraciones</h2>
        </div>
        <div class="a-grid-3">
          <div class="a-card" style="border:1px solid var(--a-border)">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem">
              <div style="width:40px;height:40px;background:#4A154B;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.85rem">SL</div>
              <strong>Slack</strong>
            </div>
            <span class="a-badge" style="background:#22c55e;color:#fff">Conectado</span>
            <p style="margin-top:0.5rem;font-size:0.8rem;color:var(--a-text-muted)">Workspace: tecnoria.slack.com</p>
          </div>
          <div class="a-card" style="border:1px solid var(--a-border)">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem">
              <div style="width:40px;height:40px;background:#25D366;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.85rem">WA</div>
              <strong>WhatsApp</strong>
            </div>
            <span class="a-badge" style="background:#22c55e;color:#fff">Conectado</span>
            <p style="margin-top:0.5rem;font-size:0.8rem;color:var(--a-text-muted)">+34 900 123 456</p>
          </div>
          <div class="a-card" style="border:1px solid var(--a-border)">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem">
              <div style="width:40px;height:40px;background:#6366f1;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.85rem">WW</div>
              <strong>Web Widget</strong>
            </div>
            <span class="a-badge" style="background:#e5e7eb;color:#6b7280">No conectado</span>
            <p style="margin-top:0.5rem;font-size:0.8rem;color:var(--a-text-muted)">Pendiente de configurar</p>
          </div>
        </div>
      </div>

      <!-- Bottom banner -->
      <div class="a-card" style="background:linear-gradient(135deg,#1e293b,#334155);color:#fff;border:none">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem">
          <div>
            <h3 style="margin:0 0 0.25rem;color:#fff">Gestión avanzada de chatbots</h3>
            <p style="margin:0;color:#94a3b8;font-size:0.9rem">Para gestionar los chatbots en detalle, accede a la plataforma Talkaris →</p>
          </div>
          <button class="a-btn" disabled style="opacity:0.5;cursor:not-allowed;background:#fff;color:#1e293b">
            Abrir Talkaris
          </button>
        </div>
      </div>
    </div>
  `,
})
export class TalkarisPageComponent {}
