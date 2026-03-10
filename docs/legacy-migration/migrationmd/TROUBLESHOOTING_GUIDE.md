# 🔧 TROUBLESHOOTING GUIDE - MIGRACIÓN ANGULAR 19

## 📚 Índice de Problemas Comunes

1. [Errores de TypeScript](#1-errores-de-typescript)
2. [Problemas con ng update](#2-problemas-con-ng-update)
3. [Errores de Compilación](#3-errores-de-compilación)
4. [Problemas con SSR](#4-problemas-con-ssr)
5. [Errores de Dependencias](#5-errores-de-dependencias)
6. [Problemas con Standalone](#6-problemas-con-standalone)
7. [Errores de Firebase](#7-errores-de-firebase)
8. [Problemas de Build](#8-problemas-de-build)
9. [Errores de Runtime](#9-errores-de-runtime)
10. [Problemas de Performance](#10-problemas-de-performance)

---

## 1. ERRORES DE TYPESCRIPT

### Error: "TS2345: Argument of type X is not assignable to parameter of type Y"

**Causa:** Cambios en tipos estrictos en Angular/TypeScript nuevos

**Solución:**
```typescript
// Opción 1: Actualizar tipos
const data: NewType = oldData as NewType;

// Opción 2: Ajustar tsconfig temporalmente
// tsconfig.json
{
  "compilerOptions": {
    "strict": false, // Solo temporal
    "strictNullChecks": false
  }
}

// Opción 3: Fix el tipo real
interface MyData {
  prop: string | undefined; // Hacer nullable si es necesario
}
```

### Error: "TS2304: Cannot find name 'require'"

**Causa:** Falta @types/node

**Solución:**
```bash
npm install --save-dev @types/node
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

### Error: "TS2339: Property 'X' does not exist on type 'Y'"

**Causa:** Cambios en APIs de Angular

**Solución:**
```typescript
// ANTES (Angular 15)
this.router.events.subscribe(event => {
  if (event instanceof NavigationEnd) {
    // ...
  }
});

// DESPUÉS (Angular 19)
import { filter } from 'rxjs/operators';
this.router.events.pipe(
  filter((event): event is NavigationEnd => event instanceof NavigationEnd)
).subscribe(event => {
  // event es tipo NavigationEnd aquí
});
```

---

## 2. PROBLEMAS CON NG UPDATE

### Error: "Repository is not clean. Please commit or stash any changes"

**Solución:**
```bash
# Opción 1: Commit cambios
git add .
git commit -m "WIP: before ng update"

# Opción 2: Stash cambios
git stash

# Opción 3: Forzar update (no recomendado)
ng update --allow-dirty
```

### Error: "Package X has an incompatible peer dependency"

**Solución:**
```bash
# Ver dependencias problemáticas
npm ls

# Actualizar con force
ng update @angular/core@19 @angular/cli@19 --force

# O actualizar peer dependencies manualmente
npm install paquete-problematico@version-compatible --save
```

### Error: "ng update" no hace nada

**Causa:** CLI desactualizado globalmente

**Solución:**
```bash
# Desinstalar CLI global viejo
npm uninstall -g @angular/cli

# Limpiar cache
npm cache clean --force

# Instalar CLI nuevo
npm install -g @angular/cli@19

# Verificar versión
ng version
```

---

## 3. ERRORES DE COMPILACIÓN

### Error: "Module not found: Error: Can't resolve '@angular/platform-browser-dynamic'"

**Causa:** Falta instalar dependencia

**Solución:**
```bash
npm install @angular/platform-browser-dynamic@19 --save
```

### Error: "ERROR in ./src/main.ts - Module build failed"

**Causa:** Sintaxis incompatible o imports incorrectos

**Solución:**
```typescript
// Verificar imports en main.ts
// ANGULAR 19 - Debe ser así:
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
```

### Error: "ERROR in src/app/app.module.ts is part of the declarations of NgModule"

**Causa:** Intentando usar componentes standalone en NgModule

**Solución:**
```typescript
// Opción 1: Quitar standalone del componente
@Component({
  selector: 'app-example',
  // standalone: true, // Comentar esto
  templateUrl: './example.component.html'
})

// Opción 2: Importar como módulo standalone
@NgModule({
  imports: [
    ExampleComponent, // En lugar de declarations
  ]
})
```

---

## 4. PROBLEMAS CON SSR

### Error: "ReferenceError: window is not defined"

**Causa:** Código de navegador ejecutándose en servidor

**Solución:**
```typescript
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

export class MyComponent {
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Código que usa window, document, localStorage, etc.
      const width = window.innerWidth;
    }
  }
}
```

### Error: "document is not defined"

**Solución:**
```typescript
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

export class MyComponent {
  private document = inject(DOCUMENT);

  doSomething() {
    const element = this.document.querySelector('.my-class');
  }
}
```

### Error: "Hydration mismatch" en Angular 19

**Causa:** Contenido diferente entre servidor y cliente

**Solución:**
```typescript
// app.config.ts
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(
      withEventReplay() // Habilitar event replay
    )
  ]
};
```

**O deshabilitar hydration temporalmente:**
```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    // Comentar provideClientHydration()
  ]
};
```

### Error: "CommonEngine is not a constructor"

**Causa:** Uso incorrecto del nuevo sistema SSR

**Solución:**
```typescript
// server.ts - Verificar import correcto
import { CommonEngine } from '@angular/ssr';

// Crear instancia correctamente
const commonEngine = new CommonEngine();

// Render
commonEngine.render({
  bootstrap,
  documentFilePath: indexHtml,
  url: req.url,
  publicPath: browserDistFolder,
  providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }]
});
```

---

## 5. ERRORES DE DEPENDENCIAS

### Error: "Cannot find module 'ngx-swiper-wrapper'"

**Causa:** Librería no compatible con Angular 19

**Solución:**
```bash
# Opción 1: Actualizar a versión compatible
npm install ngx-swiper-wrapper@latest --save

# Opción 2: Usar alternativa
npm uninstall ngx-swiper-wrapper
npm install swiper@latest --save

# Opción 3: Instalar con --legacy-peer-deps
npm install ngx-swiper-wrapper --legacy-peer-deps
```

### Error: "Peer dependencies not met"

**Solución:**
```bash
# Ver conflictos
npm ls

# Instalar con legacy peer deps
npm install --legacy-peer-deps

# O actualizar package.json y forzar
npm install --force
```

### Error: "@ng-bootstrap/ng-bootstrap requires @angular/core ^15.0.0"

**Solución:**
```bash
# Actualizar ng-bootstrap a versión compatible con Angular 19
npm install @ng-bootstrap/ng-bootstrap@17 --save
```

---

## 6. PROBLEMAS CON STANDALONE

### Error: "Component X is not standalone but is used in imports"

**Causa:** Intentando importar componente no-standalone

**Solución:**
```typescript
// Opción 1: Hacer el componente standalone
@Component({
  selector: 'app-example',
  standalone: true, // ⭐ Agregar esto
  imports: [CommonModule],
  templateUrl: './example.component.html'
})
export class ExampleComponent { }

// Opción 2: Importar su módulo en lugar del componente
@Component({
  standalone: true,
  imports: [
    ExampleModule // Importar el módulo que declara ExampleComponent
  ]
})
```

### Error: "Can't bind to 'ngIf' since it isn't a known property"

**Causa:** Falta CommonModule en imports

**Solución:**
```typescript
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule], // ⭐ Agregar esto
  template: `<div *ngIf="show">Content</div>`
})
export class MyComponent {
  show = true;
}
```

### Error: "Can't bind to 'routerLink' since it isn't a known property"

**Causa:** Falta RouterModule

**Solución:**
```typescript
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule], // ⭐ Agregar esto
  template: `<a routerLink="/home">Home</a>`
})
```

### Error: "Can't bind to 'formGroup' since it isn't a known property"

**Causa:** Falta ReactiveFormsModule

**Solución:**
```typescript
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule], // ⭐ Agregar esto
  template: `<form [formGroup]="form">...</form>`
})
```

---

## 7. ERRORES DE FIREBASE

### Error: "AngularFireModule is not defined"

**Causa:** Usando compat API en lugar de modular

**Solución:**
```typescript
// ANTES (compat - Angular Fire 7)
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

// DESPUÉS (modular - Angular Fire 18)
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

// En app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore())
  ]
};
```

### Error: "collection() is not a function"

**Causa:** Usando sintaxis compat en código modular

**Solución:**
```typescript
// ANTES (compat)
import { AngularFirestore } from '@angular/fire/compat/firestore';

constructor(private firestore: AngularFirestore) {
  this.firestore.collection('users').valueChanges();
}

// DESPUÉS (modular)
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { inject } from '@angular/core';

export class MyService {
  private firestore = inject(Firestore);
  
  getUsers() {
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef);
  }
}
```

---

## 8. PROBLEMAS DE BUILD

### Error: "FATAL ERROR: Reached heap limit Allocation failed"

**Causa:** Memoria insuficiente para build

**Solución:**
```bash
# Aumentar límite de memoria Node.js
export NODE_OPTIONS="--max-old-space-size=8192"

# O en package.json
{
  "scripts": {
    "build": "node --max-old-space-size=8192 node_modules/@angular/cli/bin/ng build"
  }
}
```

### Error: "Module build failed: Maximum call stack size exceeded"

**Causa:** Imports circulares

**Solución:**
```bash
# Encontrar imports circulares
npx madge --circular --extensions ts ./src

# Resolver moviendo código compartido a un servicio
# O usando lazy loading para romper el ciclo
```

### Error: "Budget exceeded"

**Causa:** Bundle demasiado grande

**Solución:**
```json
// angular.json
{
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "2mb",
      "maximumError": "5mb" // Aumentar temporalmente
    }
  ]
}

// Luego optimizar:
// 1. Lazy loading
// 2. Tree shaking
// 3. Eliminar dependencias no usadas
```

---

## 9. ERRORES DE RUNTIME

### Error: "NullInjectorError: No provider for X"

**Causa:** Servicio no provisto

**Solución:**
```typescript
// Opción 1: providedIn: 'root'
@Injectable({
  providedIn: 'root' // ⭐ Agregar esto
})
export class MyService { }

// Opción 2: Proveer en app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    MyService // ⭐ Agregar aquí
  ]
};

// Opción 3: Proveer en componente standalone
@Component({
  standalone: true,
  providers: [MyService] // ⭐ Scope local
})
```

### Error: "NG0200: Circular dependency in DI detected"

**Solución:**
```typescript
// Evitar inyección circular
// ANTES
@Injectable()
class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

@Injectable()
class ServiceB {
  constructor(private serviceA: ServiceA) {} // ❌ Circular!
}

// DESPUÉS
@Injectable()
class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

@Injectable()
class ServiceB {
  private serviceA!: ServiceA;
  
  setServiceA(service: ServiceA) {
    this.serviceA = service;
  }
}
```

### Error: "NG0301: Export of name 'X' not found!"

**Causa:** Exportación incorrecta en módulo o componente standalone

**Solución:**
```typescript
// Verificar que el componente/directiva esté exportado
@Component({
  standalone: true,
  // ...
})
export class MyComponent { } // ⭐ Debe tener export
```

---

## 10. PROBLEMAS DE PERFORMANCE

### Problema: Build muy lento

**Solución:**
```bash
# Usar Vite (Angular 17+)
# angular.json
{
  "architect": {
    "serve": {
      "builder": "@angular-devkit/build-angular:dev-server",
      "options": {
        "buildTarget": "app:build"
      }
    }
  }
}

# O usar esbuild
ng build --configuration development
```

### Problema: Bundle size muy grande

**Solución:**
```typescript
// 1. Lazy loading
const routes: Routes = [
  {
    path: 'blog',
    loadComponent: () => import('./blog/blog.component').then(m => m.BlogComponent)
  }
];

// 2. Defer views (Angular 17+)
@defer (on viewport) {
  <app-heavy-component />
} @placeholder {
  <p>Loading...</p>
}

// 3. Tree shaking - Importar solo lo necesario
// ❌ MAL
import * as _ from 'lodash';

// ✅ BIEN
import { debounce } from 'lodash-es';
```

---

## 🆘 COMANDOS DE EMERGENCIA

```bash
# Resetear completamente
rm -rf node_modules package-lock.json .angular
npm install

# Limpiar cache de Angular
ng cache clean

# Limpiar cache de npm
npm cache clean --force

# Reinstalar Angular CLI
npm uninstall -g @angular/cli
npm cache clean --force
npm install -g @angular/cli@19

# Verificar integridad
npm audit
npm audit fix

# Build con más información de errores
ng build --verbose

# Ver dependencias
npm ls --depth=0

# Verificar versiones
ng version
```

---

## 📞 RECURSOS DE AYUDA

- [Angular Update Guide](https://update.angular.io/)
- [Angular GitHub Issues](https://github.com/angular/angular/issues)
- [Stack Overflow - Angular](https://stackoverflow.com/questions/tagged/angular)
- [Angular Discord](https://discord.gg/angular)
- [Angular Reddit](https://reddit.com/r/Angular2)

---

## 💡 TIPS GENERALES

1. **Siempre hacer backup antes de cada fase**
2. **Commit después de cada versión exitosa**
3. **Leer CHANGELOG.md de cada versión**
4. **No forzar actualizaciones a menos que sea necesario**
5. **Testear después de cada cambio mayor**
6. **Usar `--legacy-peer-deps` solo como último recurso**
7. **Mantener documentación de problemas encontrados**
8. **Hacer rollback si algo sale muy mal**

---

**🔧 Esta guía se actualiza continuamente. Documenta tus propios problemas y soluciones.**
