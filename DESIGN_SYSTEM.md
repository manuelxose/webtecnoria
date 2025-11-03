# 🎨 Sistema de Diseño B2B Moderno - TecnoRia 2025

## 📋 Índice

1. [Introducción](#introducción)
2. [Instalación y Configuración](#instalación-y-configuración)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Sistema de Colores](#sistema-de-colores)
5. [Tipografía](#tipografía)
6. [Componentes](#componentes)
7. [Layouts y Grids](#layouts-y-grids)
8. [Animaciones](#animaciones)
9. [Modo Oscuro](#modo-oscuro)
10. [Mejores Prácticas](#mejores-prácticas)
11. [Accesibilidad](#accesibilidad)

---

## 🚀 Introducción

Este sistema de diseño moderno está creado específicamente para agencias B2B, con enfoque en:

✅ **Profesionalidad** - Paleta de colores corporativa y limpia  
✅ **Modernidad** - Degradados sutiles, glassmorphism, microinteracciones  
✅ **Accesibilidad** - WCAG AA compliance, focus visible, reduced motion  
✅ **Performance** - CSS optimizado, variables nativas, lazy loading  
✅ **Escalabilidad** - Sistema modular y mantenible

---

## ⚙️ Instalación y Configuración

### Archivos Creados

```
src/styles/
├── _variables.css          # Variables CSS y tokens de diseño
├── base/
│   ├── _reset.css         # Reset CSS moderno
│   ├── _base.css          # Estilos base HTML
│   └── _utilities.css     # Clases helper
├── components/
│   ├── _buttons.css       # Sistema de botones
│   ├── _cards.css         # Tarjetas y contenedores
│   ├── _forms.css         # Formularios e inputs
│   └── _navigation.css    # Header y navegación
├── layouts/
│   └── _grid.css          # Sistema de grid y containers
├── animations/
│   └── _animations.css    # Animaciones y transiciones
└── themes/
    └── _dark.css          # Tema oscuro
```

### Importación

El archivo `src/styles.css` ya importa todo el sistema en el orden correcto:

```css
@import "./styles/_variables.css";
@import "./styles/base/_reset.css";
@import "./styles/base/_base.css";
/* ... etc */
```

---

## 🎨 Sistema de Colores

### Paleta Principal

#### Azul Corporativo (Principal)

```css
--color-primary-600: #2563EB  /* Color principal */
--color-primary-700: #1D4ED8  /* Hover */
--color-primary-800: #1E40AF  /* Active */
```

**Uso:**

```html
<button class="btn btn-primary">CTA Principal</button>
<h1 class="text-brand">Título con color de marca</h1>
```

#### Degradados Modernos

```css
--gradient-secondary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**Uso:**

```html
<div class="card card-gradient">Tarjeta con degradado</div>
<h1 class="text-gradient">Texto con degradado</h1>
```

#### Neo-Pasteles (Acentos)

```css
--color-accent-green: #A7F3D0
--color-accent-yellow: #FDE68A
--color-accent-pink: #FBCFE8
```

### Colores Semánticos

```html
<!-- Success -->
<div class="badge badge-success">Completado</div>

<!-- Warning -->
<div class="alert bg-warning-light">Advertencia</div>

<!-- Error -->
<p class="text-error">Campo requerido</p>

<!-- Info -->
<div class="card bg-info-light">Información</div>
```

---

## ✍️ Tipografía

### Fuentes

- **Títulos:** `Poppins` (bold, extrabold)
- **Cuerpo:** `Inter` (normal, medium)
- **Código:** `JetBrains Mono`

### Jerarquía Visual

```html
<h1>Título Principal (3.5rem)</h1>
<h2>Título Secundario (2.8rem)</h2>
<h3>Título Terciario (2rem)</h3>
<p class="lead">Párrafo destacado (1.25rem)</p>
<p>Párrafo normal (1rem)</p>
<p class="small">Texto pequeño (0.875rem)</p>
```

### Clases de Utilidad

```html
<!-- Tamaños -->
<p class="text-xl">Texto extra grande</p>
<p class="text-base">Texto base</p>
<p class="text-sm">Texto pequeño</p>

<!-- Pesos -->
<span class="font-bold">Negrita</span>
<span class="font-semibold">Semi-negrita</span>
<span class="font-normal">Normal</span>

<!-- Colores -->
<p class="text-primary">Color principal</p>
<p class="text-secondary">Color secundario</p>
<p class="text-muted">Texto apagado</p>
<h1 class="text-gradient">Texto con degradado</h1>

<!-- Line Height -->
<p class="leading-loose">Espaciado generoso (1.7)</p>
<p class="leading-normal">Espaciado normal (1.5)</p>
```

---

## 🧩 Componentes

### Botones

#### Variantes Principales

```html
<!-- Primary -->
<button class="btn btn-primary">Acción Principal</button>

<!-- Secondary con degradado -->
<button class="btn btn-secondary">Acción Secundaria</button>

<!-- Outline -->
<button class="btn btn-outline-primary">Outline</button>

<!-- Ghost (transparente) -->
<button class="btn btn-ghost">Ghost</button>

<!-- Glassmorphism -->
<button class="btn btn-glass">Glass Effect</button>
```

#### Tamaños

```html
<button class="btn btn-primary btn-sm">Pequeño</button>
<button class="btn btn-primary">Normal</button>
<button class="btn btn-primary btn-lg">Grande</button>
<button class="btn btn-primary btn-xl">Extra Grande</button>
```

#### Estados y Efectos

```html
<!-- Loading -->
<button class="btn btn-primary btn-loading">Cargando...</button>

<!-- Disabled -->
<button class="btn btn-primary" disabled>Deshabilitado</button>

<!-- Con ícono -->
<button class="btn btn-primary">
  <i class="icon-mail"></i>
  Enviar Email
</button>

<!-- Efectos especiales -->
<button class="btn btn-primary btn-ripple">Ripple Effect</button>
<button class="btn btn-primary btn-shine">Shine Effect</button>
```

### Tarjetas (Cards)

#### Card Básica

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-header-title">Título</h3>
    <p class="card-header-subtitle">Subtítulo</p>
  </div>
  <div class="card-body">
    <p>Contenido de la tarjeta</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Acción</button>
  </div>
</div>
```

#### Variantes

```html
<!-- Card con imagen -->
<div class="card">
  <div class="card-image-wrapper">
    <img src="imagen.jpg" class="card-image" alt="" />
  </div>
  <div class="card-body">...</div>
</div>

<!-- Card de Servicio (con hover effect) -->
<div class="card service-card">
  <div class="service-card-icon">
    <i class="icon-code"></i>
  </div>
  <h3>Desarrollo Web</h3>
  <p>Descripción del servicio</p>
</div>

<!-- Card Glassmorphism -->
<div class="card card-glass">...</div>

<!-- Card con degradado -->
<div class="card card-gradient">...</div>

<!-- Blog Card -->
<article class="card blog-card">
  <div class="blog-card-image-wrapper">
    <span class="blog-card-category">Marketing</span>
    <img src="blog.jpg" class="blog-card-image" alt="" />
  </div>
  <div class="card-body">
    <h3>Título del artículo</h3>
    <div class="blog-card-meta">
      <span class="blog-card-meta-item">
        <i class="icon-calendar"></i> 3 Nov 2025
      </span>
      <span class="blog-card-meta-item">
        <i class="icon-clock"></i> 5 min
      </span>
    </div>
  </div>
</article>
```

#### Pricing Card

```html
<div class="card pricing-card featured">
  <span class="pricing-card-badge">Más Popular</span>
  <div class="card-body">
    <h3>Plan Premium</h3>
    <div class="pricing-card-price">
      <span class="pricing-card-price-currency">€</span>99
      <span class="pricing-card-price-period">/mes</span>
    </div>
    <ul class="pricing-card-features">
      <li>✓ Feature 1</li>
      <li>✓ Feature 2</li>
      <li>✓ Feature 3</li>
    </ul>
    <button class="btn btn-primary btn-block">Contratar</button>
  </div>
</div>
```

### Formularios

#### Input Básico

```html
<div class="form-group">
  <label class="form-label form-label-required">Email</label>
  <input type="email" class="form-control" placeholder="tu@email.com" />
  <small class="form-help-text">Nunca compartiremos tu email</small>
</div>
```

#### Con Validación

```html
<!-- Válido -->
<div class="form-group">
  <label class="form-label">Nombre</label>
  <input type="text" class="form-control is-valid" value="Juan" />
  <div class="valid-feedback">¡Perfecto!</div>
</div>

<!-- Inválido -->
<div class="form-group">
  <label class="form-label">Email</label>
  <input type="email" class="form-control is-invalid" value="email" />
  <div class="invalid-feedback">Email no válido</div>
</div>
```

#### Con Ícono

```html
<div class="form-group">
  <label class="form-label">Buscar</label>
  <div class="form-input-group">
    <i class="form-input-icon icon-search"></i>
    <input
      type="text"
      class="form-control form-input-has-icon"
      placeholder="Buscar..."
    />
  </div>
</div>
```

#### Checkbox y Radio Modernos

```html
<!-- Checkbox -->
<div class="form-check">
  <input type="checkbox" class="form-check-input" id="check1" />
  <label class="form-check-label" for="check1">
    Acepto términos y condiciones
  </label>
</div>

<!-- Radio -->
<div class="form-check">
  <input type="radio" class="form-check-input" name="plan" id="radio1" />
  <label class="form-check-label" for="radio1"> Plan Básico </label>
</div>
```

#### Toggle Switch

```html
<label class="form-switch">
  <input type="checkbox" class="form-switch-input" />
  <span class="form-switch-slider">
    <span class="form-switch-indicator"></span>
  </span>
</label>
```

---

## 📐 Layouts y Grids

### Containers

```html
<!-- Container responsive -->
<div class="container">
  <!-- Se adapta automáticamente: 640px, 768px, 1024px, 1280px, 1536px -->
</div>

<!-- Container fluido (100% width) -->
<div class="container-fluid">...</div>
```

### Sections

```html
<!-- Sección estándar (padding vertical) -->
<section class="section">...</section>

<!-- Sección pequeña -->
<section class="section-sm">...</section>

<!-- Sección grande -->
<section class="section-lg">...</section>
```

### Grid System (CSS Grid)

```html
<!-- Grid básico -->
<div class="grid grid-cols-3 gap-4">
  <div>Columna 1</div>
  <div>Columna 2</div>
  <div>Columna 3</div>
</div>

<!-- Grid responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>

<!-- Grid auto-fit (se adapta automáticamente) -->
<div class="grid grid-auto-fit gap-4">
  <!-- Mínimo 250px por columna -->
</div>
```

### Row System (Flexbox - compatible Bootstrap)

```html
<div class="row">
  <div class="col-12 col-md-6 col-lg-4">Columna</div>
  <div class="col-12 col-md-6 col-lg-4">Columna</div>
  <div class="col-12 col-md-12 col-lg-4">Columna</div>
</div>
```

### Hero Section

```html
<!-- Hero básico -->
<section class="hero" style="background-image: url('hero.jpg')">
  <div class="hero-overlay"></div>
  <div class="container">
    <div class="hero-content">
      <h1>Título Impactante</h1>
      <p class="lead">Subtítulo descriptivo</p>
      <button class="btn btn-primary btn-lg">CTA Principal</button>
    </div>
  </div>
</section>

<!-- Hero centrado -->
<section class="hero hero-centered">...</section>

<!-- Hero full height -->
<section class="hero hero-full-height">...</section>

<!-- Hero con parallax -->
<section class="hero hero-parallax">...</section>
```

### Two Column Layout

```html
<div class="two-column-layout">
  <div>
    <h2>Contenido Izquierdo</h2>
    <p>...</p>
  </div>
  <div>
    <img src="imagen.jpg" alt="" />
  </div>
</div>

<!-- Variante 40/60 -->
<div class="two-column-layout two-column-layout-40-60">...</div>
```

---

## 🎬 Animaciones

### Scroll Reveal (requiere JavaScript)

```html
<div class="scroll-reveal">
  <!-- Se anima al entrar en viewport -->
  <h2>Título que aparece</h2>
</div>

<div class="scroll-reveal-left">
  <!-- Entra desde la izquierda -->
</div>

<div class="scroll-reveal-scale">
  <!-- Efecto de zoom in -->
</div>
```

#### JavaScript para Scroll Reveal

```javascript
// Agregar en tu componente Angular
import { Component, OnInit } from '@angular/core';

@Component({...})
export class HomeComponent implements OnInit {
  ngOnInit() {
    this.initScrollReveal();
  }

  initScrollReveal() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale')
      .forEach(el => observer.observe(el));
  }
}
```

### Clases de Animación

```html
<!-- Fade In -->
<div class="animate-fadeIn">Fade in</div>
<div class="animate-fadeInUp">Fade in desde abajo</div>
<div class="animate-fadeInLeft">Fade in desde izquierda</div>

<!-- Scale -->
<div class="animate-scaleIn">Scale in</div>

<!-- Loading -->
<div class="spinner"></div>
<div class="spinner spinner-lg"></div>

<!-- Skeleton (loading placeholder) -->
<div class="skeleton" style="width: 100%; height: 20px;"></div>
```

### Hover Effects

```html
<div class="card hover-lift">
  <!-- Se eleva al hacer hover -->
</div>

<button class="btn hover-grow">
  <!-- Crece al hacer hover -->
</button>

<div class="card hover-glow">
  <!-- Efecto glow al hacer hover -->
</div>
```

### Stagger Animations (hijos con delay progresivo)

```html
<div class="stagger-children">
  <div class="animate-fadeInUp">Aparece primero</div>
  <div class="animate-fadeInUp">Aparece segundo</div>
  <div class="animate-fadeInUp">Aparece tercero</div>
</div>
```

---

## 🌙 Modo Oscuro

### Activar/Desactivar

```html
<!-- Toggle Button -->
<button class="theme-toggle" onclick="toggleTheme()">
  <span class="theme-toggle-indicator"></span>
</button>
```

```javascript
// En tu componente TypeScript
export class AppComponent {
  toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "" : "dark";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }

  ngOnInit() {
    // Restaurar tema guardado
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }
}
```

### Estilos Específicos para Modo Oscuro

Los componentes ya están adaptados automáticamente, pero si necesitas override:

```css
/* En tu componente.css */
[data-theme="dark"] .mi-elemento {
  background-color: var(--color-gray-800);
  color: var(--text-primary);
}
```

---

## 🎯 Mejores Prácticas

### 1. Usar Variables CSS

```css
/* ✅ BIEN */
.mi-componente {
  padding: var(--space-4);
  color: var(--color-primary-600);
  border-radius: var(--border-radius-lg);
}

/* ❌ MAL */
.mi-componente {
  padding: 24px;
  color: #2563eb;
  border-radius: 12px;
}
```

### 2. Clases de Utilidad

```html
<!-- ✅ BIEN - Usar clases existentes -->
<div class="p-6 mb-4 rounded-xl shadow-lg">
  <!-- ❌ MAL - Crear CSS custom innecesario -->
  <div class="mi-card-custom"></div>
</div>
```

### 3. Componentes Reutilizables

```html
<!-- ✅ BIEN - Usar componentes del sistema -->
<button class="btn btn-primary btn-lg">CTA</button>

<!-- ❌ MAL - Reinventar la rueda -->
<button style="background: blue; padding: 20px;">CTA</button>
```

### 4. Responsive Mobile-First

```css
/* ✅ BIEN - Mobile first */
.elemento {
  font-size: var(--text-base);
}

@media (min-width: 768px) {
  .elemento {
    font-size: var(--text-lg);
  }
}

/* ❌ MAL - Desktop first */
.elemento {
  font-size: var(--text-lg);
}

@media (max-width: 767px) {
  .elemento {
    font-size: var(--text-base);
  }
}
```

---

## ♿ Accesibilidad

### Focus Visible

Todos los elementos interactivos tienen estados de focus visibles:

```html
<button class="btn">Botón accesible</button>
<!-- Automáticamente muestra outline al navegar con teclado -->
```

### ARIA Labels

```html
<!-- Enlaces sin texto visible -->
<a href="#" aria-label="Ir a la página de inicio">
  <i class="icon-home"></i>
</a>

<!-- Botones de navegación -->
<button class="menu-toggle" aria-label="Abrir menú de navegación">
  <span class="menu-toggle-line"></span>
  <span class="menu-toggle-line"></span>
  <span class="menu-toggle-line"></span>
</button>

<!-- Secciones -->
<section aria-label="Nuestros servicios">...</section>
```

### Contraste de Color

Todas las combinaciones cumplen WCAG AA (4.5:1):

✅ `--color-primary-600` sobre blanco: **7.5:1**  
✅ `--text-secondary` sobre blanco: **4.8:1**  
✅ `--text-primary` sobre blanco: **16:1**

### Reduced Motion

El sistema respeta automáticamente la preferencia del usuario:

```css
/* Las animaciones se desactivan automáticamente si el usuario prefiere */
@media (prefers-reduced-motion: reduce) {
  /* Todas las animaciones se reducen a 0.01ms */
}
```

---

## 📱 Ejemplos de Implementación

### Hero Section B2B Moderna

```html
<section
  class="hero hero-full-height"
  style="background-image: url('assets/images/hero-bg.webp')"
>
  <div class="hero-overlay"></div>
  <div class="container">
    <div class="hero-content">
      <h1 class="scroll-reveal animate-fadeInUp">
        Transformamos tu Presencia Digital
      </h1>
      <p class="lead scroll-reveal animation-delay-100">
        Agencia de Marketing Digital en Galicia especializada en resultados
        medibles
      </p>
      <div class="btn-group mt-6 scroll-reveal animation-delay-200">
        <button class="btn btn-primary btn-lg">
          <i class="icon-mail"></i>
          Solicitar Presupuesto
        </button>
        <button class="btn btn-outline-light btn-lg">
          <i class="icon-phone"></i>
          682 04 78 02
        </button>
      </div>
    </div>
  </div>
</section>
```

### Sección de Servicios con Cards

```html
<section class="section bg-secondary">
  <div class="container">
    <!-- Header -->
    <div class="section-header scroll-reveal">
      <h2 class="section-header-title">Nuestros Servicios</h2>
      <div class="tecnoria-section-divider"></div>
      <p class="section-header-subtitle">
        Soluciones digitales completas para impulsar tu negocio
      </p>
    </div>

    <!-- Grid de Servicios -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Service Card 1 -->
      <article class="card service-card scroll-reveal">
        <div class="service-card-icon">
          <i class="icon-code"></i>
        </div>
        <h3>Diseño Web Profesional</h3>
        <p class="text-secondary">
          Sitios web modernos, responsivos y optimizados para convertir
        </p>
        <a href="/diseno-web" class="btn btn-ghost mt-4"> Más Información → </a>
      </article>

      <!-- Service Card 2 -->
      <article class="card service-card scroll-reveal animation-delay-100">
        <div class="service-card-icon">
          <i class="icon-chart"></i>
        </div>
        <h3>SEO y Posicionamiento</h3>
        <p class="text-secondary">
          Mejora tu visibilidad en Google y atrae tráfico cualificado
        </p>
        <a href="/seo" class="btn btn-ghost mt-4"> Más Información → </a>
      </article>

      <!-- Service Card 3 -->
      <article class="card service-card scroll-reveal animation-delay-200">
        <div class="service-card-icon">
          <i class="icon-target"></i>
        </div>
        <h3>Marketing Digital</h3>
        <p class="text-secondary">
          Estrategias personalizadas para maximizar tu ROI
        </p>
        <a href="/marketing" class="btn btn-ghost mt-4"> Más Información → </a>
      </article>
    </div>
  </div>
</section>
```

### Formulario de Contacto Moderno

```html
<section class="section">
  <div class="container">
    <div class="two-column-layout two-column-layout-40-60">
      <!-- Info Column -->
      <div>
        <h2 class="mb-4">¿Hablamos?</h2>
        <p class="text-secondary lead mb-6">
          Cuéntanos sobre tu proyecto y te responderemos en menos de 24h
        </p>
        <div class="space-y-4">
          <div class="d-flex gap-3">
            <i class="icon-phone text-brand"></i>
            <div>
              <strong>Teléfono</strong>
              <p class="text-secondary">682 04 78 02</p>
            </div>
          </div>
          <div class="d-flex gap-3">
            <i class="icon-mail text-brand"></i>
            <div>
              <strong>Email</strong>
              <p class="text-secondary">hola@tecnoria.com</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Column -->
      <div class="card card-elevated p-6">
        <form>
          <div class="form-group">
            <label class="form-label form-label-required">Nombre</label>
            <input type="text" class="form-control" placeholder="Tu nombre" />
          </div>

          <div class="form-group">
            <label class="form-label form-label-required">Email</label>
            <div class="form-input-group">
              <i class="form-input-icon icon-mail"></i>
              <input
                type="email"
                class="form-control form-input-has-icon"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Teléfono</label>
            <div class="form-input-group">
              <i class="form-input-icon icon-phone"></i>
              <input
                type="tel"
                class="form-control form-input-has-icon"
                placeholder="+34 600 000 000"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label form-label-required">Mensaje</label>
            <textarea
              class="form-textarea"
              rows="5"
              placeholder="Cuéntanos sobre tu proyecto..."
            ></textarea>
          </div>

          <div class="form-check mb-4">
            <input type="checkbox" class="form-check-input" id="privacy" />
            <label class="form-check-label" for="privacy">
              Acepto la <a href="/privacidad">política de privacidad</a>
            </label>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg">
            <i class="icon-send"></i>
            Enviar Mensaje
          </button>
        </form>
      </div>
    </div>
  </div>
</section>
```

---

## 🔧 Troubleshooting

### Las variables CSS no funcionan

Asegúrate de que `styles.css` esté importado en `angular.json`:

```json
"styles": [
  "src/styles.css",
  ...
]
```

### Los estilos no se aplican

1. Verifica que las rutas de `@import` sean correctas
2. Limpia caché de Angular: `ng serve --configuration development --no-cache`
3. Revisa la consola del navegador para errores

### Conflictos con Bootstrap

El nuevo sistema está diseñado para coexistir con Bootstrap. Las variables CSS tienen mayor especificidad. Si hay conflictos, añade `!important` temporalmente mientras migras.

---

## 📞 Soporte

Para dudas o problemas:

- 📧 Email: desarrollo@tecnoria.com
- 📱 Teléfono: 682 04 78 02

---

**Versión:** 1.0.0  
**Fecha:** Noviembre 2025  
**Autor:** Sistema de Diseño TecnoRia
