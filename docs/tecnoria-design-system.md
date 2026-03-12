# Tecnoria — Design System

> Versión: 1.0 | Fecha: 2026-03-11
> Aplicable a: Admin Panel + Portal Cliente

---

## 1. Principios del Sistema

El design system del admin panel de Tecnoria es **diferente** al de la web pública. Mientras la web usa tonos cálidos (off-white, arena), el admin usa un tema **oscuro/neutro profesional** para máxima legibilidad y densidad informativa.

**Referentes visuales:**
- Linear: densidad + elegancia + keyboard-first
- Vercel Dashboard: claridad de datos + oscuro limpio
- Stripe: jerarquía de datos + componentes de confianza

---

## 2. Tokens de Color

### 2.1 Admin Panel — Tema Base (Dark)

```css
/* ── BACKGROUNDS ─────────────────────────────────── */
--admin-bg:           #0a0e13;   /* base canvas — casi negro */
--admin-bg-raised:    #111820;   /* surfaces elevadas (cards, sidebar) */
--admin-bg-overlay:   #161e27;   /* modales, dropdowns */
--admin-bg-hover:     rgba(255,255,255,0.04);  /* hover state */
--admin-bg-active:    rgba(255,255,255,0.07);  /* selected/active state */

/* ── BORDERS ─────────────────────────────────────── */
--admin-border:       rgba(255,255,255,0.08);
--admin-border-strong:rgba(255,255,255,0.14);
--admin-border-focus: #2563eb;   /* focus ring */

/* ── TEXT ─────────────────────────────────────────── */
--admin-text:         #e8edf2;   /* primary text */
--admin-text-muted:   #7a8899;   /* secondary/label text */
--admin-text-subtle:  #4a5568;   /* placeholder, disabled */
--admin-text-inverse: #0a0e13;   /* text on light backgrounds */

/* ── BRAND ────────────────────────────────────────── */
--admin-brand:        #1d6fdb;   /* primary interactive — blue */
--admin-brand-hover:  #2563eb;
--admin-brand-muted:  rgba(29,111,219,0.15);

/* ── ACCENT ───────────────────────────────────────── */
--admin-accent:       #0ea5a0;   /* teal — hereda de la marca */
--admin-accent-muted: rgba(14,165,160,0.15);

/* ── SEMANTIC — STATUS ────────────────────────────── */
--admin-success:      #22c55e;
--admin-success-muted:rgba(34,197,94,0.12);
--admin-warning:      #f59e0b;
--admin-warning-muted:rgba(245,158,11,0.12);
--admin-danger:       #ef4444;
--admin-danger-muted: rgba(239,68,68,0.12);
--admin-info:         #3b82f6;
--admin-info-muted:   rgba(59,130,246,0.12);

/* ── SEMANTIC — PRIORITY ─────────────────────────── */
--priority-critical:  #ef4444;
--priority-high:      #f97316;
--priority-medium:    #f59e0b;
--priority-low:       #6b7280;

/* ── SEMANTIC — HEALTH ───────────────────────────── */
--health-on-track:    #22c55e;
--health-at-risk:     #f59e0b;
--health-off-track:   #ef4444;
```

### 2.2 Admin Panel — Tema Claro (alternativa)

```css
--admin-bg:           #f8fafc;
--admin-bg-raised:    #ffffff;
--admin-bg-overlay:   #ffffff;
--admin-bg-hover:     rgba(0,0,0,0.03);
--admin-bg-active:    rgba(0,0,0,0.06);
--admin-border:       rgba(0,0,0,0.08);
--admin-border-strong:rgba(0,0,0,0.14);
--admin-text:         #0f172a;
--admin-text-muted:   #64748b;
--admin-text-subtle:  #94a3b8;
```

### 2.3 Portal Cliente — Tema

El portal cliente usa el tema claro (más friendly, menos técnico):
```css
--client-bg:          #f8fafc;
--client-bg-raised:   #ffffff;
--client-brand:       #103b59;   /* azul corporativo de Tecnoria */
--client-accent:      #0f7a74;   /* teal */
```

---

## 3. Tipografía

### Familias (mismas que web pública, ya cargadas)
```css
--font-heading: "Space Grotesk", "Segoe UI", sans-serif;
--font-body:    "Manrope", "Segoe UI", sans-serif;
--font-mono:    "JetBrains Mono", "Fira Code", "Consolas", monospace;
```

### Escala Admin (px absolutos, no fluid)

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--admin-text-2xl` | 24px | 600 | Page titles |
| `--admin-text-xl` | 20px | 600 | Section headers |
| `--admin-text-lg` | 16px | 600 | Card titles, labels importantes |
| `--admin-text-md` | 14px | 400 | Body text, table cells |
| `--admin-text-sm` | 13px | 400 | Secondary info, captions |
| `--admin-text-xs` | 12px | 500 | Badges, chips, timestamps |

```css
:root {
  --admin-text-2xl: 1.5rem;    /* 24px */
  --admin-text-xl:  1.25rem;   /* 20px */
  --admin-text-lg:  1rem;      /* 16px */
  --admin-text-md:  0.875rem;  /* 14px */
  --admin-text-sm:  0.8125rem; /* 13px */
  --admin-text-xs:  0.75rem;   /* 12px */
}
```

---

## 4. Espaciado

Sistema de 4px base:

```css
--space-0:   0px;
--space-1:   4px;
--space-2:   8px;
--space-3:   12px;
--space-4:   16px;
--space-5:   20px;
--space-6:   24px;
--space-8:   32px;
--space-10:  40px;
--space-12:  48px;
--space-16:  64px;
--space-20:  80px;
```

### Layout Admin
```css
--admin-sidebar-width:      240px;
--admin-sidebar-collapsed:  64px;
--admin-topbar-height:      56px;
--admin-content-padding:    24px;
--admin-content-max:        1280px;
```

---

## 5. Radios

```css
--admin-radius-none: 0px;
--admin-radius-sm:   4px;    /* inputs, pequeños elementos */
--admin-radius-md:   8px;    /* cards, dropdowns */
--admin-radius-lg:   12px;   /* modales, paneles */
--admin-radius-xl:   16px;   /* cards destacadas */
--admin-radius-full: 9999px; /* badges, avatares, pills */
```

---

## 6. Sombras

```css
--admin-shadow-sm:  0 1px 2px rgba(0,0,0,0.3);
--admin-shadow-md:  0 4px 12px rgba(0,0,0,0.4);
--admin-shadow-lg:  0 8px 24px rgba(0,0,0,0.5);
--admin-shadow-xl:  0 16px 48px rgba(0,0,0,0.6);
/* Para tema claro: */
--admin-shadow-sm-light: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
--admin-shadow-md-light: 0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);
```

---

## 7. Componentes

### 7.1 Sidebar

```
[width: 240px | bg: --admin-bg-raised | border-right: --admin-border]

.sidebar-section-label
  font-size: 11px | font-weight: 600 | letter-spacing: 0.08em
  color: --admin-text-subtle | text-transform: uppercase
  padding: 16px 16px 4px

.sidebar-item
  display: flex | align-items: center | gap: 8px
  padding: 6px 12px | border-radius: 6px
  font-size: 14px | color: --admin-text-muted
  cursor: pointer

.sidebar-item:hover
  background: --admin-bg-hover | color: --admin-text

.sidebar-item.active
  background: --admin-bg-active | color: --admin-text
  font-weight: 500

.sidebar-item-icon
  width: 16px | height: 16px | flex-shrink: 0
  color: inherit

.sidebar-badge
  margin-left: auto | font-size: 11px | font-weight: 600
  background: --admin-danger | color: white
  padding: 1px 6px | border-radius: 9999px
```

### 7.2 Topbar

```
[height: 56px | bg: --admin-bg-raised | border-bottom: --admin-border]

Left: Logo (24px) + Breadcrumb
Center: Search input (Cmd+K)
Right: Notifications bell + Avatar menu
```

### 7.3 Button

```css
/* Base */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 500; font-family: var(--font-body);
  border-radius: var(--admin-radius-sm);
  padding: 6px 12px; cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  border: 1px solid transparent;
}

/* Variants */
.btn-primary {
  background: var(--admin-brand);
  color: white;
}
.btn-primary:hover { background: var(--admin-brand-hover); }

.btn-secondary {
  background: var(--admin-bg-hover);
  color: var(--admin-text);
  border-color: var(--admin-border);
}
.btn-secondary:hover { background: var(--admin-bg-active); }

.btn-ghost {
  background: transparent;
  color: var(--admin-text-muted);
}
.btn-ghost:hover {
  background: var(--admin-bg-hover);
  color: var(--admin-text);
}

.btn-danger {
  background: var(--admin-danger-muted);
  color: var(--admin-danger);
  border-color: var(--admin-danger);
}
.btn-danger:hover { background: var(--admin-danger); color: white; }

/* Sizes */
.btn-sm { padding: 4px 8px; font-size: 12px; }
.btn-lg { padding: 8px 16px; font-size: 14px; }
.btn-icon { padding: 6px; width: 32px; height: 32px; justify-content: center; }
```

### 7.4 Card

```css
.admin-card {
  background: var(--admin-bg-raised);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-md);
  padding: 16px;
}

.admin-card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--admin-border);
  margin-bottom: 16px;
}

.admin-card-title {
  font-size: 14px; font-weight: 600;
  color: var(--admin-text);
}
```

### 7.5 KPI Card

```
┌─────────────────────────────────────────────┐
│  [Icon]  Label                        +12% ↑ │
│                                              │
│  42                                          │
│                                              │
│  vs 37 last month          [View all →]      │
└─────────────────────────────────────────────┘
```

```css
.kpi-card {
  background: var(--admin-bg-raised);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-md);
  padding: 20px;
}
.kpi-value { font-size: 28px; font-weight: 700; color: var(--admin-text); }
.kpi-delta.positive { color: var(--admin-success); }
.kpi-delta.negative { color: var(--admin-danger); }
```

### 7.6 Table

```css
.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.admin-table thead th {
  padding: 8px 12px;
  text-align: left;
  font-weight: 500;
  font-size: 12px;
  color: var(--admin-text-muted);
  border-bottom: 1px solid var(--admin-border);
  background: transparent;
  white-space: nowrap;
}

.admin-table tbody td {
  padding: 10px 12px;
  color: var(--admin-text);
  border-bottom: 1px solid var(--admin-border);
  vertical-align: middle;
}

.admin-table tbody tr:hover {
  background: var(--admin-bg-hover);
}

/* Row actions — visible on hover */
.admin-table tbody tr .row-actions {
  opacity: 0;
  transition: opacity 0.15s;
}
.admin-table tbody tr:hover .row-actions { opacity: 1; }
```

### 7.7 Badge / Status

```css
.badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
}

/* Status variants */
.badge-active    { background: var(--admin-success-muted); color: var(--admin-success); }
.badge-inactive  { background: var(--admin-bg-hover); color: var(--admin-text-muted); }
.badge-pending   { background: var(--admin-warning-muted); color: var(--admin-warning); }
.badge-danger    { background: var(--admin-danger-muted); color: var(--admin-danger); }
.badge-info      { background: var(--admin-info-muted); color: var(--admin-info); }
.badge-draft     { background: var(--admin-bg-hover); color: var(--admin-text-subtle); }

/* Priority dot */
.priority-dot {
  width: 8px; height: 8px; border-radius: 50%;
}
.priority-dot.critical { background: var(--priority-critical); }
.priority-dot.high     { background: var(--priority-high); }
.priority-dot.medium   { background: var(--priority-medium); }
.priority-dot.low      { background: var(--priority-low); }
```

### 7.8 Form / Input

```css
.admin-input {
  width: 100%;
  padding: 7px 11px;
  font-size: 14px; font-family: var(--font-body);
  background: var(--admin-bg);
  border: 1px solid var(--admin-border-strong);
  border-radius: var(--admin-radius-sm);
  color: var(--admin-text);
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
}
.admin-input::placeholder { color: var(--admin-text-subtle); }
.admin-input:focus {
  border-color: var(--admin-border-focus);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.admin-label {
  display: block;
  font-size: 13px; font-weight: 500;
  color: var(--admin-text-muted);
  margin-bottom: 6px;
}

.admin-form-group { margin-bottom: 16px; }
```

### 7.9 Modal / Dialog

```css
.admin-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
}

.admin-modal {
  background: var(--admin-bg-overlay);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-lg);
  padding: 24px;
  width: 100%; max-width: 480px;
  box-shadow: var(--admin-shadow-xl);
}

.admin-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.admin-modal-title { font-size: 16px; font-weight: 600; }

/* Sizes */
.admin-modal.sm { max-width: 360px; }
.admin-modal.lg { max-width: 640px; }
.admin-modal.xl { max-width: 800px; }
```

### 7.10 Tabs

```css
.admin-tabs {
  display: flex; gap: 0;
  border-bottom: 1px solid var(--admin-border);
  margin-bottom: 24px;
}

.admin-tab {
  padding: 8px 16px;
  font-size: 13px; font-weight: 500;
  color: var(--admin-text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.15s;
}

.admin-tab:hover { color: var(--admin-text); }
.admin-tab.active {
  color: var(--admin-text);
  border-bottom-color: var(--admin-brand);
}
```

### 7.11 Avatar

```css
.avatar {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%;
  font-weight: 600; font-size: 12px;
  background: var(--admin-brand-muted);
  color: var(--admin-brand);
  flex-shrink: 0;
  overflow: hidden;
}
.avatar.sm { width: 24px; height: 24px; font-size: 10px; }
.avatar.md { width: 32px; height: 32px; font-size: 12px; }
.avatar.lg { width: 40px; height: 40px; font-size: 14px; }
.avatar.xl { width: 56px; height: 56px; font-size: 18px; }
```

### 7.12 Empty State

```
┌─────────────────────────────────────────────┐
│                                             │
│              [Icon — grande]                │
│                                             │
│         No leads yet                        │
│   Start by creating your first lead         │
│   or importing from a CSV file.             │
│                                             │
│      [Create Lead]  [Import CSV]            │
│                                             │
└─────────────────────────────────────────────┘
```

### 7.13 Skeleton Loader

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--admin-bg-hover) 0%,
    var(--admin-bg-active) 50%,
    var(--admin-bg-hover) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: var(--admin-radius-sm);
}

@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 7.14 Alert / Toast

```css
.admin-alert {
  display: flex; gap: 12px; align-items: flex-start;
  padding: 12px 16px;
  border-radius: var(--admin-radius-sm);
  font-size: 13px;
  border: 1px solid;
}
.admin-alert.success {
  background: var(--admin-success-muted);
  border-color: var(--admin-success);
  color: var(--admin-success);
}
.admin-alert.warning {
  background: var(--admin-warning-muted);
  border-color: var(--admin-warning);
  color: var(--admin-warning);
}
.admin-alert.danger {
  background: var(--admin-danger-muted);
  border-color: var(--admin-danger);
  color: var(--admin-danger);
}

/* Toast — bottom-right */
.admin-toast-container {
  position: fixed; bottom: 24px; right: 24px;
  display: flex; flex-direction: column; gap: 8px;
  z-index: 9999;
  max-width: 320px;
}
```

### 7.15 Dropdown Menu

```css
.admin-dropdown {
  position: absolute;
  background: var(--admin-bg-overlay);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-md);
  box-shadow: var(--admin-shadow-lg);
  padding: 4px;
  min-width: 160px;
  z-index: 100;
}

.admin-dropdown-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 8px;
  border-radius: var(--admin-radius-sm);
  font-size: 13px;
  color: var(--admin-text);
  cursor: pointer;
  transition: background 0.1s;
}
.admin-dropdown-item:hover { background: var(--admin-bg-hover); }
.admin-dropdown-item.danger { color: var(--admin-danger); }
.admin-dropdown-item.danger:hover { background: var(--admin-danger-muted); }

.admin-dropdown-separator {
  height: 1px;
  background: var(--admin-border);
  margin: 4px 0;
}
```

---

## 8. Kanban Board

```css
.kanban-board {
  display: flex; gap: 16px;
  overflow-x: auto; padding-bottom: 16px;
  height: calc(100vh - var(--admin-topbar-height) - 80px);
}

.kanban-column {
  flex-shrink: 0; width: 280px;
  display: flex; flex-direction: column;
  background: var(--admin-bg-raised);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-md);
  overflow: hidden;
}

.kanban-column-header {
  padding: 12px 16px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--admin-border);
  font-size: 13px; font-weight: 600;
}

.kanban-card {
  margin: 8px;
  padding: 12px;
  background: var(--admin-bg);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-sm);
  cursor: grab;
  transition: box-shadow 0.15s, transform 0.15s;
}
.kanban-card:hover {
  box-shadow: var(--admin-shadow-md);
  transform: translateY(-1px);
}
.kanban-card.dragging {
  box-shadow: var(--admin-shadow-xl);
  transform: rotate(2deg);
}
```

---

## 9. Iconografía

**Librería base:** Lucide Icons (tree-shakeable, SVG, ya compatible con Angular)

```bash
npm install lucide-angular
```

**Iconos por módulo:**

| Módulo | Icono |
|--------|-------|
| Dashboard | `layout-dashboard` |
| Leads | `user-plus` |
| Clients | `users` |
| Companies | `building-2` |
| Contacts | `contact` |
| Projects | `folder-kanban` |
| Tasks | `check-square` |
| Talkaris | `message-square-bot` |
| Auctorio | `pen-tool` |
| Support | `life-buoy` |
| Finance | `receipt` |
| Invoices | `file-text` |
| Payments | `credit-card` |
| Contracts | `file-signature` |
| Documents | `paperclip` |
| Analytics | `bar-chart-2` |
| Blog | `rss` |
| Users | `user-cog` |
| Settings | `settings` |
| Notifications | `bell` |
| Search | `search` |

---

## 10. Motion / Animaciones

```css
/* Transiciones estándar */
--admin-transition-fast:   0.1s ease;
--admin-transition-base:   0.15s ease;
--admin-transition-slow:   0.25s ease;

/* Sidebar collapse */
.sidebar-collapse {
  transition: width var(--admin-transition-slow);
}

/* Fade in de páginas */
@keyframes admin-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.admin-page-enter {
  animation: admin-fade-in var(--admin-transition-slow) ease;
}

/* Modal enter */
@keyframes admin-modal-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
```

---

## 11. Responsive / Breakpoints Admin

```css
--admin-bp-sm:  640px;   /* mobile — sidebar como drawer */
--admin-bp-md:  768px;   /* tablet — sidebar colapsada (64px) */
--admin-bp-lg:  1024px;  /* desktop compacto — sidebar expandida */
--admin-bp-xl:  1280px;  /* desktop — layout completo */
--admin-bp-2xl: 1536px;  /* wide — espacio para panels secundarios */
```

**Comportamiento responsive:**
- `< 1024px`: sidebar se convierte en drawer con overlay
- `1024-1280px`: sidebar colapsada (solo iconos)
- `>= 1280px`: sidebar completa

---

## 12. Aplicación CSS Global Admin

El archivo de estilos admin se carga **solo en rutas `/dashboard` y `/client`**, separado de `styles.css` (web pública).

Crear: `apps/web/src/styles-admin.css`

```css
/* Import design system tokens */
@import './styles-admin-tokens.css';

/* Import component styles */
@import './styles-admin-components.css';

/* Base reset for admin */
.admin-root * { box-sizing: border-box; }
.admin-root body { margin: 0; background: var(--admin-bg); color: var(--admin-text); }
```

---

## 13. Nomenclatura de Clases

Prefijo `admin-` para todo lo del panel admin:
- `admin-card`, `admin-table`, `admin-btn`, `admin-input`, etc.

Prefijo `client-` para el portal cliente:
- `client-card`, `client-section`, etc.

**BEM simplificado:**
- Block: `admin-card`
- Element: `admin-card__title`
- Modifier: `admin-card--featured`

---

## 14. Tokens de Estado

```
Lead Status:
  new          → badge-info     "Nuevo"
  contacted    → badge-info     "Contactado"
  qualified    → badge-pending  "Cualificado"
  proposal     → badge-pending  "Propuesta"
  negotiation  → badge-warning  "Negociación"
  won          → badge-active   "Ganado"
  lost         → badge-inactive "Perdido"

Project Status:
  discovery    → badge-info     "Discovery"
  planning     → badge-info     "Planificación"
  active       → badge-active   "Activo"
  paused       → badge-warning  "Pausado"
  review       → badge-pending  "Revisión"
  completed    → badge-active   "Completado"  (color diferente)
  cancelled    → badge-inactive "Cancelado"

Project Health:
  on_track     → health-on-track   "En plazo"
  at_risk      → health-at-risk    "En riesgo"
  off_track    → health-off-track  "Retrasado"

Ticket Status:
  open         → badge-danger   "Abierto"
  in_progress  → badge-info     "En progreso"
  waiting_client → badge-warning "Esperando cliente"
  resolved     → badge-active   "Resuelto"
  closed       → badge-inactive "Cerrado"

Invoice Status:
  draft        → badge-draft    "Borrador"
  sent         → badge-info     "Enviada"
  viewed       → badge-pending  "Vista"
  paid         → badge-active   "Pagada"
  overdue      → badge-danger   "Vencida"
  cancelled    → badge-inactive "Cancelada"

Deployment Status:
  active       → badge-active   "Activo"
  inactive     → badge-inactive "Inactivo"
  maintenance  → badge-warning  "Mantenimiento"
  deploying    → badge-info     "Desplegando"
```
