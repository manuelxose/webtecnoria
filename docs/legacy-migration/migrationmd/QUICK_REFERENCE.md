# ⚡ QUICK REFERENCE - MIGRACIÓN ANGULAR 19

## 🚀 COMANDOS ESENCIALES

### Pre-migración
```bash
# Backup
git checkout -b backup-angular-15
git push origin backup-angular-15

# Nueva rama
git checkout -b feature/angular-19-migration

# Verificación
node pre-migration-check.js
npm run build
npm run build:ssr
```

### Angular 15 → 16
```bash
npm install -g @angular/cli@16
ng update @angular/core@16 @angular/cli@16 --force
npm install typescript@~4.9.5 --save-dev
npm install rxjs@^7.8.0 zone.js@~0.13.0 --save
npm run build
git commit -m "feat: migrate to Angular 16"
```

### Angular 16 → 17
```bash
ng update @angular/core@17 @angular/cli@17 --force
npm install @angular/ssr@17 --save
npm uninstall @nguniversal/express-engine @nguniversal/builders
npm install typescript@~5.2.2 --save-dev
npm run build
git commit -m "feat: migrate to Angular 17 with new SSR"
```

### Angular 17 → 18
```bash
ng update @angular/core@18 @angular/cli@18 --force
ng update @angular/ssr@18 --force
npm install typescript@~5.4.5 --save-dev
npm run build
git commit -m "feat: migrate to Angular 18"
```

### Angular 18 → 19
```bash
npm install -g @angular/cli@19
ng update @angular/core@19 @angular/cli@19 --force
ng update @angular/ssr@19 --force
npm install typescript@~5.6.3 --save-dev
npm install zone.js@~0.15.0 --save
npm run build
git commit -m "feat: migrate to Angular 19"
```

### Standalone Conversion
```bash
# Automático
ng generate @angular/core:standalone

# Manual: Agregar a cada componente
# standalone: true
# imports: [CommonModule, RouterModule, ...]

# Eliminar módulos
rm src/app/app.module.ts
rm src/app/app-routing.module.ts
rm src/app/shared/shared.module.ts

npm run build
git commit -m "feat: convert to standalone components"
```

### Firebase Migration
```bash
npm uninstall @angular/fire
npm install @angular/fire@18 --save

# Actualizar código: compat → modular API
npm run build
git commit -m "feat: migrate to Firebase modular API"
```

---

## 📁 ESTRUCTURA DE ARCHIVOS CLAVE

### Archivos Nuevos (Crear)
```
src/app/
├── app.config.ts           ← Configuración principal
├── app.config.server.ts    ← Configuración SSR
└── app.routes.ts           ← Rutas standalone
```

### Archivos Modificados
```
src/
├── main.ts                 ← Bootstrap standalone
├── main.server.ts          ← Bootstrap SSR standalone
└── app/
    └── app.component.ts    ← Convertir a standalone
```

### Archivos Eliminados (Después de standalone)
```
src/app/
├── app.module.ts           ← ELIMINAR
├── app-routing.module.ts   ← ELIMINAR
├── app.browser.module.ts   ← ELIMINAR
├── app.server.module.ts    ← ELIMINAR
└── shared/
    └── shared.module.ts    ← ELIMINAR
```

---

## 🔧 CONFIGURACIONES CRÍTICAS

### app.config.ts (Standalone)
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
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideAnimations()
  ]
};
```

### main.ts (Angular 19)
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
```

### tsconfig.json (Angular 19)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"],
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  }
}
```

### angular.json (Builder)
```json
{
  "architect": {
    "build": {
      "builder": "@angular-devkit/build-angular:application",
      "options": {
        "outputPath": "dist",
        "browser": "src/main.ts",
        "server": "src/main.server.ts"
      }
    }
  }
}
```

---

## 🐛 SOLUCIONES RÁPIDAS

### Error: "Can't bind to 'ngIf'"
```typescript
// Agregar CommonModule
import { CommonModule } from '@angular/common';
@Component({
  standalone: true,
  imports: [CommonModule]
})
```

### Error: "Can't bind to 'routerLink'"
```typescript
// Agregar RouterModule
import { RouterModule } from '@angular/router';
@Component({
  standalone: true,
  imports: [RouterModule]
})
```

### Error: "Can't bind to 'formGroup'"
```typescript
// Agregar ReactiveFormsModule
import { ReactiveFormsModule } from '@angular/forms';
@Component({
  standalone: true,
  imports: [ReactiveFormsModule]
})
```

### Error: "window is not defined" (SSR)
```typescript
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

private platformId = inject(PLATFORM_ID);

if (isPlatformBrowser(this.platformId)) {
  // código de navegador
}
```

### Error: "No provider for X"
```typescript
// Agregar providedIn: 'root'
@Injectable({
  providedIn: 'root'
})
export class MyService { }
```

### Build Memory Error
```bash
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build
```

---

## 📊 CHECKLIST ULTRA-RÁPIDO

### Antes de Empezar
- [ ] Backup (git branch)
- [ ] Node 18+
- [ ] Build actual OK
- [ ] 2GB espacio libre

### Por Cada Versión (15→16→17→18→19)
- [ ] ng update
- [ ] npm install
- [ ] npm run build
- [ ] npm run build:ssr
- [ ] git commit

### Standalone
- [ ] ng generate @angular/core:standalone
- [ ] Convertir componentes
- [ ] Eliminar módulos
- [ ] Build OK

### Firebase
- [ ] Actualizar @angular/fire@18
- [ ] Migrar compat → modular
- [ ] Verificar funcionamiento

### Final
- [ ] Tests OK
- [ ] SSR OK
- [ ] Performance OK
- [ ] Deploy

---

## 🎯 VERSIONES OBJETIVO

| Package | Versión Objetivo |
|---------|------------------|
| @angular/core | 19.x |
| @angular/cli | 19.x |
| @angular/ssr | 19.x |
| @angular/fire | 18.x |
| typescript | 5.6.x |
| zone.js | 0.15.x |
| rxjs | 7.8.x |

---

## 📞 AYUDA RÁPIDA

```bash
# Ver versiones
ng version

# Limpiar todo
rm -rf node_modules .angular dist package-lock.json
npm install

# Cache
ng cache clean
npm cache clean --force

# Ver qué actualizar
ng update

# Análisis de bundle
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/browser/stats.json
```

---

## 💾 BACKUP & ROLLBACK

```bash
# Backup inicial
git tag angular-15-backup
git push origin angular-15-backup

# Rollback si falla
git reset --hard angular-15-backup
git clean -fd
npm install
```

---

## 🚨 CUANDO TODO FALLA

1. **Rollback a última versión funcional**
   ```bash
   git reset --hard <último-commit-bueno>
   ```

2. **Resetear completamente**
   ```bash
   rm -rf node_modules package-lock.json .angular
   npm install
   ```

3. **Actualizar CLI globalmente**
   ```bash
   npm uninstall -g @angular/cli
   npm install -g @angular/cli@19
   ```

4. **Leer CHANGELOG y BREAKING_CHANGES.md**

5. **Buscar en GitHub Issues**
   https://github.com/angular/angular/issues

---

## ⏱️ TIEMPO ESTIMADO

- **Angular 15→16:** 4-6h
- **Angular 16→17:** 6-8h
- **Angular 17→18:** 4-6h
- **Angular 18→19:** 6-8h
- **Standalone:** 10-15h
- **Firebase:** 8-10h
- **Testing:** 6-8h
- **Total:** 48-65h (2 semanas)

---

## 🎓 RECURSOS

- [Angular Update Guide](https://update.angular.io/)
- [Standalone Guide](https://angular.io/guide/standalone-components)
- [SSR Guide](https://angular.io/guide/ssr)
- [Angular Blog](https://blog.angular.io/)
- [GitHub Angular](https://github.com/angular/angular)

---

**⚡ MANTÉN ESTA REFERENCIA A MANO DURANTE LA MIGRACIÓN**
