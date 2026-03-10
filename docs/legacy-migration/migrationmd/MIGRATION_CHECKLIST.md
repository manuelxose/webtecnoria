# ✅ CHECKLIST DE MIGRACIÓN A STANDALONE

**Proyecto:** Tecnoria - Web Empresa  
**Angular Version:** 15.2.1  
**Fecha de inicio:** ___________  
**Fecha estimada de finalización:** ___________

---

## 📋 FASE 1: PREPARACIÓN

### Setup Inicial
- [ ] Crear rama de feature: `git checkout -b feature/standalone-migration`
- [ ] Crear backup de archivos críticos
- [ ] Ejecutar `migration-helper.js` para análisis
- [ ] Revisar plan de migración generado
- [ ] Instalar dependencias actualizadas: `npm install`
- [ ] Verificar que el proyecto compile sin errores: `npm run build`

### Documentación
- [ ] Leer guía completa: `MIGRATION_PLAN.md`
- [ ] Revisar ejemplos: `COMPONENT_EXAMPLES.ts`
- [ ] Crear documento para tracking de issues encontrados

---

## 📋 FASE 2: ARCHIVOS DE CONFIGURACIÓN

### Crear Archivos Nuevos
- [ ] Crear `src/app/app.config.ts`
- [ ] Crear `src/app/app.firebase.config.ts`
- [ ] Crear `src/app/app.config.server.ts`
- [ ] Crear `src/app/app.routes.ts`

### Actualizar Archivos Existentes
- [ ] Actualizar `src/main.ts` para bootstrap standalone
- [ ] Actualizar `src/main.server.ts` para SSR standalone
- [ ] Verificar `angular.json` (no necesita cambios mayores)
- [ ] Verificar `tsconfig.json` settings

### Testing Configuración
- [ ] `npm run build` sin errores
- [ ] `npm run build:ssr` sin errores
- [ ] Verificar que SSR sigue funcionando

---

## 📋 FASE 3: COMPONENTES NIVEL 1 (FÁCILES)

### Componentes Simples (sin dependencias externas)
- [ ] **PreloaderComponent** → `standalone: true`
  - Imports: `CommonModule`
  - Testing: ✅ / ❌
  - Notas: ___________

- [ ] **ArribaFlechaComponent** → `standalone: true`
  - Imports: `CommonModule`
  - Testing: ✅ / ❌
  - Notas: ___________

- [ ] **MapaWebComponent** → `standalone: true`
  - Imports: `CommonModule`, `RouterModule`
  - Testing: ✅ / ❌
  - Notas: ___________

- [ ] **FaqComponent** → `standalone: true`
  - Imports: `CommonModule`, `NgbModule`
  - Testing: ✅ / ❌
  - Notas: ___________

- [ ] **PoliticaprivacidadComponent** → `standalone: true`
  - Imports: `CommonModule`
  - Testing: ✅ / ❌
  - Notas: ___________

- [ ] **AboutUsComponent** → `standalone: true`
  - Imports: `CommonModule`, `RouterModule`
  - Testing: ✅ / ❌
  - Notas: ___________

### Directivas
- [ ] **ScrollspyDirective** → `standalone: true`
  - Testing: ✅ / ❌
  - Notas: ___________

### Guards
- [ ] **AuthGuard** → convertir a functional guard
  - Crear `auth.guard.ts` funcional
  - Actualizar en `app.routes.ts`
  - Testing: ✅ / ❌
  - Notas: ___________

---

## 📋 FASE 4: COMPONENTES NIVEL 2 (COMPONENTES COMPARTIDOS)

### Componentes Shared/UI
- [ ] **TestimonialComponent** → `standalone: true`
  - Imports: `CommonModule`, `SwiperModule`
  - Testing: ✅ / ❌

- [ ] **ClientsLogoComponent** → `standalone: true`
  - Imports: `CommonModule`
  - Testing: ✅ / ❌

- [ ] **ServicesComponent** → `standalone: true`
  - Imports: `CommonModule`, `FeatherModule`
  - Testing: ✅ / ❌

- [ ] **PricingComponent** → `standalone: true`
  - Imports: `CommonModule`, `RouterModule`
  - Testing: ✅ / ❌

- [ ] **FeaturesComponent** → `standalone: true`
  - Imports: `CommonModule`
  - Testing: ✅ / ❌

- [ ] **CustomerTestmonialComponent** → `standalone: true`
  - Imports: `CommonModule`
  - Testing: ✅ / ❌

- [ ] **ReviewTestmonialComponent** → `standalone: true`
  - Imports: `CommonModule`
  - Testing: ✅ / ❌

- [ ] **SimplePricingComponent** → `standalone: true`
  - Imports: `CommonModule`
  - Testing: ✅ / ❌

- [ ] **MemberComponent** → `standalone: true`
  - Imports: `CommonModule`
  - Testing: ✅ / ❌

- [ ] **BlogComponent** → `standalone: true`
  - Imports: `CommonModule`, `RouterModule`
  - Testing: ✅ / ❌

- [ ] **FormBottomComponent** → `standalone: true`
  - Imports: `CommonModule`, `ReactiveFormsModule`
  - Testing: ✅ / ❌

- [ ] **LocationsComponent** → `standalone: true`
  - Imports: `CommonModule`
  - Testing: ✅ / ❌

- [ ] **ChatBotComponent** → `standalone: true`
  - Imports: `CommonModule`
  - Testing: ✅ / ❌

---

## 📋 FASE 5: COMPONENTES NIVEL 3 (PÁGINAS)

### Kit Digital (12 componentes)
- [ ] **PaginaWebComponent** → `standalone: true`
- [ ] **TiendaOnlineComponent** → `standalone: true`
- [ ] **RedesSocialesComponent** → `standalone: true`
- [ ] **CrmComponent** → `standalone: true`
- [ ] **ErpComponent** → `standalone: true`
- [ ] **FacturaDigitalComponent** → `standalone: true`
- [ ] **BiAnaliticaComponent** → `standalone: true`
- [ ] **OficinaVirtualComponent** → `standalone: true`
- [ ] **ComunicacionesSegurasComponent** → `standalone: true`
- [ ] **CiberseguridadComponent** → `standalone: true`
- [ ] **PresenciaAvanzadaComponent** → `standalone: true`
- [ ] **MarketplaceComponent** → `standalone: true`

### Servicios - Diseño Web (5 componentes)
- [ ] **DisenioWebComponent** → `standalone: true`
- [ ] **EcoommerceComponent** → `standalone: true`
- [ ] **FunnelsComponent** → `standalone: true`
- [ ] **DisenioWordpressComponent** → `standalone: true`
- [ ] **DisenioWebCorporativoComponent** → `standalone: true`

### Servicios - Marketing Digital (4 componentes)
- [ ] **GestionRedesSocialesComponent** → `standalone: true`
- [ ] **AgenciaMarketingContenidosComponent** → `standalone: true`
- [ ] **AgenciaDeBrandingComponent** → `standalone: true`
- [ ] **EmailMarketingComponent** → `standalone: true`

### Servicios - Publicidad (4 componentes)
- [ ] **AgenciaAdwordsComponent** → `standalone: true`
- [ ] **AgenciaFacebookAdsComponent** → `standalone: true`
- [ ] **AgenciaInstagramAdsComponent** → `standalone: true`
- [ ] **AgenciaLinkedingAdsComponent** → `standalone: true`

### Servicios - Posicionamiento (6 componentes)
- [ ] **PosicionamientoSeoComponent** → `standalone: true`
- [ ] **PosicionamientoSemComponent** → `standalone: true`
- [ ] **PosicionamientoSeoLocalComponent** → `standalone: true`
- [ ] **AuditoriaSeoComponent** → `standalone: true`
- [ ] **PosicionamientoSeoAmazonComponent** → `standalone: true`
- [ ] **AgenciaLinkbuildingComponent** → `standalone: true`

### Servicios - Desarrollo (2 componentes)
- [ ] **SoftwareMedidaComponent** → `standalone: true`
- [ ] **AppWebComponent** → `standalone: true`

### Blog (2 componentes)
- [ ] **MainBlogComponent** → `standalone: true`
  - Imports: `CommonModule`, `RouterModule`, `NgxPaginationModule`
  - Testing: ✅ / ❌
  
- [ ] **BlogDetailComponent** → `standalone: true`
  - Imports: `CommonModule`, `RouterModule`
  - Testing: ✅ / ❌

### Auth (9 componentes)
- [ ] **LoginComponent** → `standalone: true`
- [ ] **RegistrationComponent** → `standalone: true`
- [ ] **AuthCoverLoginComponent** → `standalone: true`
- [ ] **AuthCoverRePasswordComponent** → `standalone: true`
- [ ] **AuthCoverSignupComponent** → `standalone: true`
- [ ] **AuthLoginComponent** → `standalone: true`
- [ ] **AuthLoginThreeComponent** → `standalone: true`
- [ ] **AuthRePasswordComponent** → `standalone: true`
- [ ] **AuthRePasswordThreeComponent** → `standalone: true`
- [ ] **AuthSignupComponent** → `standalone: true`
- [ ] **AuthSignupThreeComponent** → `standalone: true`

### Email (4 componentes)
- [ ] **EmailAlertComponent** → `standalone: true`
- [ ] **EmailConfirmationComponent** → `standalone: true`
- [ ] **EmailInvoiceComponent** → `standalone: true`
- [ ] **EmailPasswordResetComponent** → `standalone: true`

### Admin
- [ ] **AdminPanelComponent** → `standalone: true`
  - Imports: `CommonModule`, `RouterModule`, `ReactiveFormsModule`, `CKEditorModule`, `NgxEditorModule`
  - Testing: ✅ / ❌

### Otros
- [ ] **ContactoComponent** → `standalone: true`
  - Imports: `CommonModule`, `ReactiveFormsModule`, `NgxScrollToModule`
  - Testing: ✅ / ❌

---

## 📋 FASE 6: COMPONENTES NIVEL 4 (LAYOUT Y ROOT)

### Layout Components
- [ ] **HeaderComponent** → `standalone: true`
  - Imports: `CommonModule`, `RouterModule`, `NgbDropdownModule`, `NgbNavModule`, `ScrollToModule`
  - Testing: ✅ / ❌
  - Notas: ___________

- [ ] **FooterComponent** → `standalone: true`
  - Imports: `CommonModule`, `RouterModule`
  - Testing: ✅ / ❌
  - Notas: ___________

- [ ] **SwitcherComponent** → `standalone: true`
  - Imports: `CommonModule`
  - Testing: ✅ / ❌
  - Notas: ___________

- [ ] **MasterPageComponent** → `standalone: true`
  - Imports: `RouterOutlet`, todos los componentes de layout
  - Testing: ✅ / ❌
  - Notas: ___________

### Root Component
- [ ] **AppComponent** → `standalone: true`
  - Imports: `CommonModule`, `RouterOutlet`
  - Actualizar para usar nuevo bootstrap
  - Testing: ✅ / ❌
  - Notas: ___________

---

## 📋 FASE 7: LIMPIEZA Y ELIMINACIÓN DE MÓDULOS

### Eliminar Archivos de Módulos
- [ ] **BACKUP REALIZADO** antes de eliminar
- [ ] Eliminar `src/app/app.module.ts`
- [ ] Eliminar `src/app/app.browser.module.ts`
- [ ] Eliminar `src/app/app.server.module.ts`
- [ ] Eliminar `src/app/shared/shared.module.ts`
- [ ] Eliminar `src/app/app-routing.module.ts`

### Verificar y Limpiar Imports
- [ ] Buscar referencias a módulos eliminados en todo el proyecto
- [ ] Actualizar imports obsoletos
- [ ] Eliminar imports no utilizados

---

## 📋 FASE 8: TESTING COMPLETO

### Build Tests
- [ ] `npm run build` → Sin errores
- [ ] `npm run build --configuration=production` → Sin errores
- [ ] `npm run build:ssr` → Sin errores
- [ ] Verificar bundle size (debe ser menor)

### Funcionalidad
- [ ] Navegación entre páginas funciona
- [ ] Forms funcionan correctamente
- [ ] Autenticación funciona
- [ ] Blog carga y muestra posts
- [ ] Admin panel funciona (si aplica)
- [ ] Firebase/Firestore conecta correctamente

### SSR Tests
- [ ] `npm run serve:ssr:local` → Sin errores
- [ ] Verificar que no hay errores de hidratación
- [ ] Verificar que el contenido se renderiza en el servidor
- [ ] Verificar meta tags dinámicos

### Performance
- [ ] Lighthouse performance score
- [ ] First Contentful Paint (FCP)
- [ ] Largest Contentful Paint (LCP)
- [ ] Time to Interactive (TTI)
- [ ] Bundle size comparison (antes vs después)

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile (Chrome/Safari)

---

## 📋 FASE 9: OPTIMIZACIÓN

### Code Splitting
- [ ] Identificar oportunidades de lazy loading
- [ ] Implementar lazy loading en rutas pesadas
- [ ] Verificar que chunks se cargan correctamente

### Bundle Analysis
- [ ] Ejecutar webpack bundle analyzer
- [ ] Identificar dependencias grandes
- [ ] Optimizar imports (usar tree-shakable imports)
- [ ] Documentar mejoras en bundle size

### SEO
- [ ] Verificar meta tags
- [ ] Verificar títulos de página
- [ ] Verificar sitemap.xml
- [ ] Verificar robots.txt
- [ ] Verificar structured data

---

## 📋 FASE 10: DOCUMENTACIÓN Y DEPLOY

### Documentación
- [ ] Actualizar README.md con nueva arquitectura
- [ ] Documentar comandos de build/deploy actualizados
- [ ] Documentar breaking changes (si hay)
- [ ] Crear guía de migración para el equipo

### Deploy
- [ ] Deploy a staging/development
- [ ] Verificar funcionamiento en staging
- [ ] Smoke testing en staging
- [ ] Deploy a producción
- [ ] Verificar funcionamiento en producción
- [ ] Monitorear errores en las primeras 24 horas

### Rollback Plan
- [ ] Plan de rollback documentado
- [ ] Backup de código anterior taggeado
- [ ] Procedimiento de rollback probado

---

## 📊 MÉTRICAS DE ÉXITO

### Performance Improvements
| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Bundle size (main) | ___ KB | ___ KB | ___% |
| Initial load time | ___ ms | ___ ms | ___% |
| Time to Interactive | ___ ms | ___ ms | ___% |
| Lighthouse score | ___ | ___ | ___pts |

### Code Quality
- **Total de componentes migrados:** _____ / ~50+
- **Reducción de código:** _____ líneas eliminadas
- **Build time:** _____ segundos
- **Bundle count:** _____ chunks

---

## 🐛 ISSUES ENCONTRADOS

### Issue #1
- **Descripción:** ___________
- **Componente:** ___________
- **Solución:** ___________
- **Estado:** ⏳ / ✅

### Issue #2
- **Descripción:** ___________
- **Componente:** ___________
- **Solución:** ___________
- **Estado:** ⏳ / ✅

### Issue #3
- **Descripción:** ___________
- **Componente:** ___________
- **Solución:** ___________
- **Estado:** ⏳ / ✅

---

## 📝 NOTAS ADICIONALES

### Lecciones Aprendidas
- ___________
- ___________
- ___________

### Mejoras Futuras
- ___________
- ___________
- ___________

### Recomendaciones
- ___________
- ___________
- ___________

---

## ✅ SIGN-OFF

- [ ] Migración completada
- [ ] Testing aprobado
- [ ] Documentación actualizada
- [ ] Deploy exitoso
- [ ] Equipo notificado

**Completado por:** ___________  
**Fecha de finalización:** ___________  
**Tiempo total invertido:** _____ horas

---

**🎉 ¡Migración a Standalone Components Completada! 🎉**
