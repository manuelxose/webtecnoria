# 🚀 PROMPT MAESTRO: MIGRACIÓN ANGULAR 15 → 19 STANDALONE + SSR

## 📋 CONTEXTO DEL PROYECTO

**Proyecto:** Tecnoria SL - Web Empresa (Angular SPA con SSR)
**Estado Actual:**
- Angular: 15.2.1
- Arquitectura: NgModules tradicionales (AppModule, SharedModule)
- SSR: Angular Universal (@nguniversal 15.2.0)
- Firebase: @angular/fire 7.6.1 (compat API)
- TypeScript: 4.8.4
- Node: 20.x
- ~50+ componentes en módulos tradicionales
- Múltiples librerías UI: ng-bootstrap, swiper, lightbox, ckeditor, etc.

**Objetivo Final:**
- Angular: 19.x (última versión estable)
- Arquitectura: 100% Standalone Components
- SSR: Nuevo sistema de SSR de Angular 19
- Firebase: @angular/fire 18.x (API modular)
- TypeScript: 5.6.x
- Optimización de bundle
- Sin módulos (eliminar todos los NgModule)

---

## 🎯 ESTRATEGIA DE MIGRACIÓN

### Opción 1: MIGRACIÓN INCREMENTAL (RECOMENDADO)
Actualizar versión por versión y luego convertir a standalone:
1. Angular 15 → 16
2. Angular 16 → 17 (standalone opcional)
3. Angular 17 → 18 (standalone recomendado)
4. Angular 18 → 19 (standalone por defecto)
5. Conversión final a 100% standalone
6. Actualizar SSR al nuevo sistema

**Tiempo estimado: 40-50 horas**
**Riesgo: BAJO** ✅
**Testing incremental:** Después de cada versión

### Opción 2: MIGRACIÓN DIRECTA (EXPERIMENTAL)
Saltar directamente a Angular 19 + standalone:
- Actualizar todas las dependencias de golpe
- Convertir a standalone simultáneamente
- Resolver todos los breaking changes juntos

**Tiempo estimado: 60-80 horas**
**Riesgo: ALTO** ⚠️
**No recomendado para producción**

---

## 📊 ANÁLISIS DE BREAKING CHANGES POR VERSIÓN

### Angular 16 (Mayo 2023)
- Signals introducidos (opcional)
- Standalone habilitado por defecto en CLI
- TypedForms mejorado
- Required inputs
- DestroyRef service
- Actualizar a TypeScript 4.9.3+

### Angular 17 (Noviembre 2023)
- Nuevo sistema de control flow (@if, @for, @switch)
- Nuevo sistema de deferrable views (@defer)
- Standalone por defecto en nuevos proyectos
- Vite como dev server (opcional)
- Actualizar a TypeScript 5.2+
- Deprecación de módulos en CLI

### Angular 18 (Mayo 2024)
- Zoneless applications (experimental)
- Material 3
- Signals estables
- Actualizar a TypeScript 5.4+
- SSR mejorado con nuevo sistema

### Angular 19 (Noviembre 2024)
- Standalone por defecto (módulos deprecados)
- Incremental hydration
- SSR completamente rediseñado
- Event replay
- Actualizar a TypeScript 5.6+
- Hot Module Replacement mejorado

---

## 🔧 PLAN DE MIGRACIÓN DETALLADO

## FASE 0: PREPARACIÓN (2-3 horas)

### 0.1 Backup y Análisis
```bash
# Crear backup completo
git checkout -b backup-angular-15
git push origin backup-angular-15

# Crear rama de migración
git checkout -b feature/angular-19-migration

# Backup local de archivos críticos
mkdir -p backups/angular-15
cp -r src/ backups/angular-15/
cp package.json backups/angular-15/
cp angular.json backups/angular-15/
cp tsconfig.json backups/angular-15/

# Analizar el proyecto actual
npm run build
npm run build:ssr
npm test # Si tienes tests
```

### 0.2 Documentar Estado Actual
```bash
# Guardar versiones actuales
npm list --depth=0 > backups/angular-15/dependencies-before.txt

# Guardar bundle size actual
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/browser/stats.json --mode static -O backups/angular-15/bundle-analysis-before.html
```

### 0.3 Limpiar Dependencias
```bash
# Limpiar cache
rm -rf node_modules
rm -rf .angular
rm -rf dist
rm package-lock.json

# Verificar que no hay errores
npm install
npm run build
```

---

## FASE 1: ANGULAR 15 → 16 (4-6 horas)

### 1.1 Actualizar Angular CLI y Core
```bash
# Instalar Angular CLI 16 globalmente
npm install -g @angular/cli@16

# Actualizar el proyecto usando ng update
ng update @angular/core@16 @angular/cli@16 --force

# Actualizar Angular Universal
ng update @nguniversal/express-engine@16 --force

# Actualizar otras dependencias de Angular
ng update @angular/material@16 --force # Si usas Material
```

### 1.2 Actualizar TypeScript
```json
// package.json - Actualizar TypeScript a 4.9.x
{
  "devDependencies": {
    "typescript": "~4.9.5"
  }
}
```

```bash
npm install
```

### 1.3 Actualizar Dependencias Relacionadas
```bash
# Actualizar Angular Fire
npm install @angular/fire@7.6.1 --save

# Actualizar RxJS si es necesario
npm install rxjs@^7.8.0 --save

# Actualizar Zone.js
npm install zone.js@~0.13.0 --save
```

### 1.4 Cambios en el Código para Angular 16

**Actualizar tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"],
    "useDefineForClassFields": false,
    "enableI18nLegacyMessageIdFormat": false
  }
}
```

**Resolver Deprecations:**
- `ComponentFactoryResolver` → Usar `ViewContainerRef.createComponent()`
- `ReflectiveInjector` → Usar `Injector.create()`

### 1.5 Testing Angular 16
```bash
# Build y verificar
npm run build
npm run build:ssr
npm run serve:ssr:local

# Verificar en navegador
# Verificar que no hay errores de console
# Verificar funcionalidad crítica
```

### 1.6 Commit
```bash
git add .
git commit -m "feat: migrate to Angular 16"
git push origin feature/angular-19-migration
```

---

## FASE 2: ANGULAR 16 → 17 (6-8 horas)

### 2.1 Actualizar a Angular 17
```bash
# Actualizar CLI y Core a 17
ng update @angular/core@17 @angular/cli@17 --force

# Actualizar SSR (ahora @angular/ssr)
npm install @angular/ssr@17 --save

# IMPORTANTE: @nguniversal está deprecado en v17
# Migrar a @angular/ssr
```

### 2.2 Migrar de @nguniversal a @angular/ssr

**Eliminar @nguniversal:**
```bash
npm uninstall @nguniversal/express-engine @nguniversal/builders
```

**Instalar @angular/ssr:**
```bash
ng add @angular/ssr
```

**Actualizar server.ts:**
```typescript
// server.ts (Angular 17+)
import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
```

### 2.3 Actualizar angular.json para SSR

```json
{
  "projects": {
    "web-empresa": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "server": "src/main.server.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json"
          }
        },
        "serve-ssr": {
          "builder": "@angular-devkit/build-angular:ssr-dev-server",
          "options": {}
        }
      }
    }
  }
}
```

### 2.4 Actualizar TypeScript a 5.2+
```json
// package.json
{
  "devDependencies": {
    "typescript": "~5.2.2"
  }
}
```

```bash
npm install
```

### 2.5 Nuevo Control Flow (Opcional pero Recomendado)

**Antes (Angular 16):**
```html
<div *ngIf="condition">Content</div>
<div *ngFor="let item of items">{{ item }}</div>
```

**Después (Angular 17+):**
```html
@if (condition) {
  <div>Content</div>
}

@for (item of items; track item.id) {
  <div>{{ item }}</div>
}
```

**Migración automática:**
```bash
ng generate @angular/core:control-flow
```

### 2.6 Testing Angular 17
```bash
npm run build
npm run serve:ssr:local

# Verificar hydration
# Verificar que no hay errores de console
```

### 2.7 Commit
```bash
git add .
git commit -m "feat: migrate to Angular 17 with new SSR system"
```

---

## FASE 3: ANGULAR 17 → 18 (4-6 horas)

### 3.1 Actualizar a Angular 18
```bash
ng update @angular/core@18 @angular/cli@18 --force
ng update @angular/ssr@18 --force
```

### 3.2 Actualizar TypeScript a 5.4+
```json
// package.json
{
  "devDependencies": {
    "typescript": "~5.4.5"
  }
}
```

### 3.3 Actualizar Dependencias
```bash
npm install rxjs@^7.8.1 --save
npm install zone.js@~0.14.0 --save
```

### 3.4 Signals Migration (Preparación)

Angular 18 estabiliza Signals. Preparar para migrar:

```typescript
// Ejemplo: Migrar de propiedades a signals
// ANTES
export class MyComponent {
  count = 0;
  
  increment() {
    this.count++;
  }
}

// DESPUÉS (Angular 18+)
import { signal, computed } from '@angular/core';

export class MyComponent {
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);
  
  increment() {
    this.count.update(v => v + 1);
  }
}
```

### 3.5 Testing Angular 18
```bash
npm run build
npm run serve:ssr:local
```

### 3.6 Commit
```bash
git add .
git commit -m "feat: migrate to Angular 18"
```

---

## FASE 4: ANGULAR 18 → 19 (6-8 horas)

### 4.1 Actualizar a Angular 19
```bash
# Actualizar CLI globalmente
npm install -g @angular/cli@19

# Actualizar proyecto
ng update @angular/core@19 @angular/cli@19 --force
ng update @angular/ssr@19 --force
```

### 4.2 Actualizar TypeScript a 5.6+
```json
// package.json
{
  "devDependencies": {
    "typescript": "~5.6.3"
  }
}
```

### 4.3 Actualizar Todas las Dependencias

```bash
# Angular packages
npm install @angular/animations@19 --save
npm install @angular/common@19 --save
npm install @angular/compiler@19 --save
npm install @angular/core@19 --save
npm install @angular/forms@19 --save
npm install @angular/platform-browser@19 --save
npm install @angular/platform-browser-dynamic@19 --save
npm install @angular/router@19 --save
npm install @angular/ssr@19 --save

# Zone.js
npm install zone.js@~0.15.0 --save

# RxJS
npm install rxjs@^7.8.1 --save
```

### 4.4 Actualizar angular.json para Angular 19

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "web-empresa": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "css",
          "standalone": true
        }
      },
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "server": "src/main.server.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["src/styles.css"],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": {
              "buildTarget": "web-empresa:build:production"
            },
            "development": {
              "buildTarget": "web-empresa:build:development"
            }
          },
          "defaultConfiguration": "development"
        }
      }
    }
  }
}
```

### 4.5 Actualizar tsconfig.json para Angular 19

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"],
    "useDefineForClassFields": false
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

### 4.6 Nuevo Sistema de SSR con Hydration

**main.ts actualizado para Angular 19:**
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```

**app.config.ts con Hydration:**
```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()), // ⭐ Nuevo en Angular 19
    provideHttpClient(withFetch()),
    provideAnimations()
  ]
};
```

**app.config.server.ts:**
```typescript
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering()
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
```

### 4.7 Testing Angular 19
```bash
npm run build
ng serve # Dev server con HMR
ng serve --ssr # Dev server con SSR
```

### 4.8 Commit
```bash
git add .
git commit -m "feat: migrate to Angular 19"
```

---

## FASE 5: CONVERSIÓN A STANDALONE (10-15 horas)

### 5.1 Estrategia de Conversión

**Orden recomendado:**
1. Componentes hoja (sin hijos)
2. Componentes con hijos standalone
3. Componentes de layout
4. AppComponent
5. Eliminar módulos

### 5.2 Usar Schematic de Migración Automática

```bash
# Convertir todo el proyecto a standalone
ng generate @angular/core:standalone

# Seguir las instrucciones interactivas
# Seleccionar: 
# - Convert all components, directives and pipes to standalone
# - Remove unnecessary NgModules
# - Bootstrap application using standalone APIs
```

### 5.3 Conversión Manual (Si el Schematic Falla)

**Ejemplo: Convertir un componente:**

ANTES:
```typescript
// index.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent {
  title = 'Home';
}
```

DESPUÉS:
```typescript
// index.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent {
  title = 'Home';
}
```

### 5.4 Convertir Rutas a Standalone

**app.routes.ts:**
```typescript
import { Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';

export const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
    title: 'Home - Tecnoria'
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
    title: 'About - Tecnoria'
  }
];
```

### 5.5 Eliminar Módulos

```bash
# Después de que todos los componentes sean standalone
rm src/app/app.module.ts
rm src/app/app-routing.module.ts
rm src/app/shared/shared.module.ts
```

### 5.6 Testing Standalone
```bash
npm run build
ng serve --ssr
```

---

## FASE 6: ACTUALIZAR DEPENDENCIAS DE TERCEROS (8-10 horas)

### 6.1 Firebase (Angular Fire)

**Actualizar a @angular/fire 18:**
```bash
npm uninstall @angular/fire
npm install @angular/fire@18 --save
```

**Migrar de compat a modular API:**

ANTES (compat):
```typescript
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
```

DESPUÉS (modular):
```typescript
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';

// En app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth())
  ]
};
```

### 6.2 Ng-Bootstrap

```bash
npm install @ng-bootstrap/ng-bootstrap@17 --save
```

Compatible con standalone:
```typescript
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  standalone: true,
  imports: [NgbModule],
  // ...
})
```

### 6.3 Otras Librerías

**Verificar compatibilidad y actualizar:**

```bash
# Swiper
npm install swiper@latest --save
npm install ngx-swiper-wrapper@latest --save

# CKEditor
npm install @ckeditor/ckeditor5-angular@latest --save

# Lightbox
npm install ngx-lightbox@latest --save

# Pagination
npm install ngx-pagination@latest --save

# Toastr
npm install ngx-toastr@latest --save
```

### 6.4 Testing de Dependencias

Verificar que cada librería funciona correctamente después de actualizar.

---

## FASE 7: OPTIMIZACIÓN (4-6 horas)

### 7.1 Lazy Loading Granular

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogComponent),
    children: [
      {
        path: ':id',
        loadComponent: () => import('./pages/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent)
      }
    ]
  }
];
```

### 7.2 Deferrable Views (Angular 17+)

```html
<!-- Lazy load componente pesado -->
@defer (on viewport) {
  <app-heavy-component />
} @placeholder {
  <div>Loading...</div>
} @loading (minimum 1s) {
  <app-skeleton />
} @error {
  <p>Failed to load</p>
}
```

### 7.3 Signals para Reactive State

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <div>
      <p>Count: {{ count() }}</p>
      <p>Double: {{ doubleCount() }}</p>
      <button (click)="increment()">+</button>
    </div>
  `
})
export class CounterComponent {
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);
  
  increment() {
    this.count.update(n => n + 1);
  }
}
```

### 7.4 Bundle Analysis

```bash
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/browser/stats.json
```

Identificar y optimizar bundles grandes.

---

## FASE 8: TESTING FINAL (6-8 horas)

### 8.1 Unit Tests

```bash
# Actualizar configuración de tests
npm install jasmine-core@latest karma@latest --save-dev

# Ejecutar tests
npm test
```

### 8.2 E2E Tests (Si aplica)

```bash
# Instalar Cypress o Playwright
npm install -D @playwright/test

# Ejecutar E2E
npx playwright test
```

### 8.3 Manual Testing Checklist

- [ ] Navegación entre páginas
- [ ] Forms (contacto, auth)
- [ ] Firebase/Firestore
- [ ] Blog CRUD
- [ ] Admin panel
- [ ] SSR (view-source debe mostrar contenido)
- [ ] Hydration (sin flickering)
- [ ] Responsive design
- [ ] Performance (Lighthouse)

### 8.4 Performance Testing

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

Objetivos:
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90

---

## FASE 9: DEPLOY Y MONITOREO (2-4 horas)

### 9.1 Build de Producción

```bash
npm run build
# Verificar carpeta dist/
```

### 9.2 Deploy a Firebase

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy
```

### 9.3 Monitoreo Post-Deploy

- Verificar logs de errores
- Monitorear métricas de performance
- Verificar analytics
- Check SSR functionality

---

## 🔥 BREAKING CHANGES Y SOLUCIONES

### 1. ModuleWithProviders sin tipo genérico

**Error:**
```
ModuleWithProviders must have a generic type
```

**Solución:**
```typescript
// ANTES
static forRoot(): ModuleWithProviders

// DESPUÉS
static forRoot(): ModuleWithProviders<MyModule>
```

### 2. Nuevo Control Flow

**Migración automática:**
```bash
ng generate @angular/core:control-flow
```

### 3. provideRouter en lugar de RouterModule.forRoot

**ANTES:**
```typescript
RouterModule.forRoot(routes)
```

**DESPUÉS:**
```typescript
provideRouter(routes)
```

### 4. Nuevo builder: application

**angular.json cambió de:**
```json
"builder": "@angular-devkit/build-angular:browser"
```

**A:**
```json
"builder": "@angular-devkit/build-angular:application"
```

### 5. SSR: @nguniversal → @angular/ssr

Completamente nuevo sistema de SSR (ver FASE 2).

### 6. Firebase compat → modular

Ver FASE 6.1 para migración completa.

---

## 📊 CHECKLIST FINAL

### Pre-migración
- [ ] Backup completo del código
- [ ] Documentar estado actual
- [ ] Bundle size baseline
- [ ] Performance metrics baseline

### Durante Migración
- [ ] ✅ Angular 16
- [ ] ✅ Angular 17
- [ ] ✅ Angular 18
- [ ] ✅ Angular 19
- [ ] ✅ Standalone conversion
- [ ] ✅ Firebase modular API
- [ ] ✅ Nuevo SSR system
- [ ] ✅ Actualizar dependencias

### Post-migración
- [ ] Build exitoso
- [ ] Tests pasando
- [ ] SSR funcionando
- [ ] Performance OK
- [ ] Deploy exitoso
- [ ] Monitoreo activo

---

## 💡 COMANDOS ÚTILES

```bash
# Análisis de migración
ng update

# Ver qué se puede actualizar
ng update --all

# Actualizar a versión específica
ng update @angular/core@19 @angular/cli@19

# Migración standalone automática
ng generate @angular/core:standalone

# Nuevo control flow
ng generate @angular/core:control-flow

# Build
npm run build
ng build

# Serve con SSR
ng serve --ssr

# Bundle analysis
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/browser/stats.json

# Tests
npm test
npm run e2e

# Deploy
firebase deploy
```

---

## 📚 RECURSOS

- [Angular Update Guide](https://update.angular.io/)
- [Angular 19 Changelog](https://github.com/angular/angular/blob/main/CHANGELOG.md)
- [Standalone Migration Guide](https://angular.io/guide/standalone-migration)
- [New SSR Documentation](https://angular.io/guide/ssr)
- [Angular Fire v8 Migration](https://github.com/angular/angularfire/blob/master/docs/version-7-upgrade.md)

---

## ⚠️ NOTAS IMPORTANTES

1. **Testing Incremental:** Hacer testing después de CADA versión
2. **Commits Frecuentes:** Commit después de cada fase exitosa
3. **Backup:** Mantener backup de Angular 15 en rama separada
4. **No Saltar Versiones:** Ir 15→16→17→18→19 (no 15→19 directamente)
5. **SSR:** Verificar que SSR funciona después de cada actualización
6. **Dependencies:** Actualizar dependencias de terceros gradualmente
7. **Bundle Size:** Monitorear bundle size en cada paso
8. **Performance:** Verificar que performance no se degrada

---

## 🎯 TIEMPO ESTIMADO TOTAL

- Preparación: 2-3 horas
- Angular 15→16: 4-6 horas
- Angular 16→17: 6-8 horas
- Angular 17→18: 4-6 horas
- Angular 18→19: 6-8 horas
- Standalone conversion: 10-15 horas
- Actualizar dependencias: 8-10 horas
- Optimización: 4-6 horas
- Testing: 6-8 horas
- Deploy: 2-4 horas

**TOTAL: 52-78 horas (~2 semanas de trabajo full-time)**

---

## ✅ CRITERIOS DE ÉXITO

1. ✅ Aplicación ejecutando en Angular 19
2. ✅ 100% componentes standalone
3. ✅ SSR funcionando con nuevo sistema
4. ✅ Firebase usando API modular
5. ✅ Bundle size reducido 20-30%
6. ✅ Lighthouse score >90
7. ✅ Sin errores de console
8. ✅ Tests pasando
9. ✅ Deploy exitoso
10. ✅ Documentación actualizada

---

**🚀 ¡LISTO PARA COMENZAR LA MIGRACIÓN!**

Este prompt maestro debe ser usado como guía completa para cualquier asistente IA o desarrollador que ejecute la migración. Seguir el orden de fases garantiza una migración exitosa y controlada.
