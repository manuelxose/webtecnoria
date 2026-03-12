# Tecnoria — Screen Map

> Versión: 1.0 | Fecha: 2026-03-11

---

## Leyenda

- ✅ Existe y funciona
- ⚠️ Existe pero incompleto / necesita rediseño
- 🔴 Pendiente de crear (Fase A — MVP)
- 🟡 Pendiente de crear (Fase B — Operaciones)
- 🟠 Pendiente de crear (Fase C — Integraciones)
- 🔵 Pendiente de crear (Fase D — Portal Cliente)
- ⬜ Futuro / Placeholder

---

## 1. Web Pública (Marketing Site)

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/` | HomePageComponent | ✅ |
| `/servicios` | ServicesPageComponent | ✅ |
| `/servicios/desarrollo-software-medida` | ServiceDetailPageComponent | ✅ |
| `/servicios/automatizacion-procesos` | ServiceDetailPageComponent | ✅ |
| `/servicios/desarrollo-chatbots-empresas` | ServiceDetailPageComponent | ✅ |
| `/servicios/inteligencia-artificial-empresas` | ServiceDetailPageComponent | ✅ |
| `/servicios/plataformas-saas` | ServiceDetailPageComponent | ✅ |
| `/servicios/consultoria-tecnologica` | ServiceDetailPageComponent | ✅ |
| `/casos-de-exito` | CaseStudiesPageComponent | ✅ |
| `/soluciones` | SolutionsPageComponent | ✅ |
| `/empresa` | AboutPageComponent | ✅ |
| `/metodologia` | ProcessPageComponent | ✅ |
| `/blog` | BlogPageComponent | ✅ |
| `/blog/:slug` | ArticlePageComponent | ✅ |
| `/faq` | FaqPageComponent | ✅ |
| `/contacto` | ContactPageComponent | ✅ |
| `/politica-de-privacidad` | PrivacyPageComponent | ✅ |
| `/mapa-web` | SitemapPageComponent | ✅ |
| `**` | NotFoundPageComponent | ✅ |

---

## 2. Autenticación

| Ruta | Componente | Estado | Notas |
|------|-----------|--------|-------|
| `/auth-login` | AuthLoginComponent | ✅ | Email+password + Google OAuth |
| `/auth-re-password` | AuthRePasswordComponent | ✅ | |
| `/auth-signup` | AuthSignupComponent | ✅ | Solo admin puede crear users |
| `/acceso-restringido` | AccessRestrictedComponent | ✅ | Redirect si no autorizado |
| `/auth-login?returnUrl=...` | AuthLoginComponent | ✅ | Redirect post-login |

---

## 3. Admin Panel — Shell y Navegación

| Elemento | Componente | Estado |
|---------|-----------|--------|
| Admin layout shell | AdminLayoutComponent | 🔴 (reemplaza AdminPanelComponent) |
| Sidebar principal | AdminSidebarComponent | 🔴 |
| Topbar | AdminTopbarComponent | 🔴 |
| Command palette (Cmd+K) | CommandPaletteComponent | ⬜ |
| Notification drawer | NotificationDrawerComponent | ⬜ |

---

## 4. Admin Panel — Dashboard

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/dashboard` | DashboardPageComponent | 🔴 (rediseño total) |
| `/dashboard` → KPI cards | DashboardKpiRowComponent | 🔴 |
| `/dashboard` → Lead pipeline mini | DashboardPipelineMiniComponent | 🔴 |
| `/dashboard` → Projects health | DashboardProjectsHealthComponent | 🔴 |
| `/dashboard` → Revenue chart | DashboardRevenueChartComponent | 🔴 |
| `/dashboard` → Activity feed | DashboardActivityFeedComponent | 🔴 |
| `/dashboard` → Open tickets | DashboardTicketsWidgetComponent | 🔴 |
| `/dashboard` → Products snapshot | DashboardProductsSnapshotComponent | 🔴 |

---

## 5. Admin Panel — Leads

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/dashboard/leads` | LeadsPageComponent | 🔴 |
| `/dashboard/leads` → Pipeline | LeadsPipelineViewComponent | 🔴 |
| `/dashboard/leads/list` | LeadsTableComponent | 🔴 |
| `/dashboard/leads/sources` | LeadSourcesPageComponent | 🔴 |
| `/dashboard/leads/:id` | LeadDetailPageComponent | 🔴 |
| `/dashboard/leads/new` | LeadFormComponent | 🔴 |
| `/dashboard/leads/:id/edit` | LeadFormComponent | 🔴 |

---

## 6. Admin Panel — Clients

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/dashboard/clients` | ClientsPageComponent | 🔴 |
| `/dashboard/clients/list` | ClientsTableComponent | 🔴 |
| `/dashboard/clients/new` | ClientFormComponent | 🔴 |
| `/dashboard/clients/:id` | ClientDetailPageComponent | 🔴 |
| `/dashboard/clients/:id/edit` | ClientFormComponent | 🔴 |
| `/dashboard/clients/:id/projects` | ClientProjectsTabComponent | 🔴 |
| `/dashboard/clients/:id/finance` | ClientFinanceTabComponent | 🔴 |
| `/dashboard/clients/:id/products` | ClientProductsTabComponent | 🔴 |
| `/dashboard/clients/:id/support` | ClientSupportTabComponent | 🔴 |
| `/dashboard/clients/:id/documents` | ClientDocumentsTabComponent | 🔴 |
| `/dashboard/companies` | CompaniesPageComponent | 🔴 |
| `/dashboard/companies/:id` | CompanyDetailPageComponent | 🔴 |
| `/dashboard/contacts` | ContactsPageComponent | 🔴 |
| `/dashboard/contacts/:id` | ContactDetailPageComponent | 🔴 |

---

## 7. Admin Panel — Projects

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/dashboard/projects` | ProjectsPageComponent | 🔴 |
| `/dashboard/projects` → Kanban | ProjectsKanbanViewComponent | 🔴 |
| `/dashboard/projects/list` | ProjectsTableComponent | 🔴 |
| `/dashboard/projects/new` | ProjectFormComponent | 🔴 |
| `/dashboard/projects/:id` | ProjectDetailPageComponent | 🔴 |
| `/dashboard/projects/:id/roadmap` | ProjectRoadmapTabComponent | 🔴 |
| `/dashboard/projects/:id/tasks` | ProjectTasksTabComponent | 🔴 |
| `/dashboard/projects/:id/finance` | ProjectFinanceTabComponent | 🔴 |
| `/dashboard/projects/:id/documents` | ProjectDocumentsTabComponent | 🔴 |
| `/dashboard/tasks` | TasksPageComponent | 🔴 |

---

## 8. Admin Panel — Products

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/dashboard/products` | ProductsOverviewComponent | 🟠 |
| `/dashboard/products/talkaris` | TalkarisOverviewComponent | 🟠 |
| `/dashboard/products/talkaris/:id` | TalkarisDeploymentDetailComponent | 🟠 |
| `/dashboard/products/auctorio` | AuctorioOverviewComponent | 🟠 |
| `/dashboard/products/auctorio/:id` | AuctorioDeploymentDetailComponent | 🟠 |
| `/dashboard/products/custom` | CustomPlatformsPageComponent | 🟠 |

---

## 9. Admin Panel — Support

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/dashboard/support` | SupportPageComponent | 🟡 |
| `/dashboard/support/tickets` | TicketsListComponent | 🟡 |
| `/dashboard/support/tickets/new` | TicketFormComponent | 🟡 |
| `/dashboard/support/tickets/:id` | TicketDetailPageComponent | 🟡 |
| `/dashboard/support/requests` | AccessRequestsPageComponent | ⚠️ (existe en DB, sin UI) |

---

## 10. Admin Panel — Finance

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/dashboard/finance` | FinanceDashboardComponent | 🟡 |
| `/dashboard/finance/invoices` | InvoicesListComponent | 🟡 |
| `/dashboard/finance/invoices/new` | InvoiceFormComponent | 🟡 |
| `/dashboard/finance/invoices/:id` | InvoiceDetailPageComponent | 🟡 |
| `/dashboard/finance/payments` | PaymentsListComponent | 🟡 |
| `/dashboard/finance/contracts` | ContractsListComponent | 🟡 |
| `/dashboard/finance/contracts/new` | ContractFormComponent | 🟡 |
| `/dashboard/finance/contracts/:id` | ContractDetailPageComponent | 🟡 |

---

## 11. Admin Panel — Documents

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/dashboard/documents` | DocumentsPageComponent | 🟡 |
| `/dashboard/documents/upload` | DocumentUploadComponent | 🟡 |
| `/dashboard/documents/knowledge-base` | KnowledgeBasePageComponent | ⬜ |

---

## 12. Admin Panel — Analytics

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/dashboard/analytics` | AnalyticsPageComponent | 🟡 |
| `/dashboard/analytics/business` | BusinessMetricsComponent | 🟡 |
| `/dashboard/analytics/clients` | ClientMetricsComponent | 🟡 |
| `/dashboard/analytics/leads` | LeadAnalyticsComponent | ⬜ |

---

## 13. Admin Panel — Blog (existente, mejorado)

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/dashboard/blog` | ListaBlogsComponent | ⚠️ (rediseño UI) |
| `/dashboard/blog/new` | EditorBlogComponent | ⚠️ (rediseño UI) |
| `/dashboard/blog/:id` | EditorBlogComponent | ⚠️ (rediseño UI) |

---

## 14. Admin Panel — Users & System

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/dashboard/users` | TeamPageComponent | 🟡 |
| `/dashboard/users/new` | InviteUserFormComponent | 🟡 |
| `/dashboard/users/:id` | UserDetailPageComponent | 🟡 |
| `/dashboard/users/clients` | ClientUsersPageComponent | 🔵 |
| `/dashboard/settings` | SettingsPageComponent | 🔴 |
| `/dashboard/settings/workspace` | WorkspaceSettingsComponent | 🔴 |
| `/dashboard/settings/integrations` | IntegrationsSettingsComponent | 🟠 |
| `/dashboard/settings/api-keys` | ApiKeysSettingsComponent | 🟡 |
| `/dashboard/settings/notifications` | NotificationSettingsComponent | ⬜ |
| `/dashboard/settings/feature-flags` | FeatureFlagsSettingsComponent | ⚠️ (existe lógica, sin UI) |

---

## 15. Portal Cliente

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/client` | ClientPortalShellComponent | 🔵 |
| `/client/dashboard` | ClientDashboardComponent | 🔵 |
| `/client/projects` | ClientProjectsListComponent | 🔵 |
| `/client/projects/:id` | ClientProjectDetailComponent | 🔵 |
| `/client/projects/:id/roadmap` | ClientProjectRoadmapComponent | 🔵 |
| `/client/products` | ClientProductsComponent | 🔵 |
| `/client/products/talkaris` | ClientTalkarisComponent | 🔵 |
| `/client/products/auctorio` | ClientAuctorioComponent | 🔵 |
| `/client/support` | ClientSupportComponent | 🔵 |
| `/client/support/tickets` | ClientTicketsListComponent | 🔵 |
| `/client/support/tickets/new` | ClientNewTicketComponent | 🔵 |
| `/client/support/tickets/:id` | ClientTicketDetailComponent | 🔵 |
| `/client/documents` | ClientDocumentsComponent | 🔵 |
| `/client/billing` | ClientBillingComponent | 🔵 |
| `/client/billing/invoices/:id` | ClientInvoiceDetailComponent | 🔵 |
| `/client/profile` | ClientProfileComponent | 🔵 |

---

## 16. Resumen de Pantallas

| Categoría | Existen ✅⚠️ | Por crear |
|-----------|-------------|-----------|
| Web pública | 19 | 0 |
| Autenticación | 5 | 0 |
| Admin layout/shell | 0 | 4 (🔴) |
| Dashboard | 1 (rediseño) | 8 widgets (🔴) |
| Leads | 0 | 7 (🔴) |
| Clients | 0 | 14 (🔴) |
| Projects | 0 | 10 (🔴) |
| Products | 0 | 6 (🟠) |
| Support | 0 | 5 (🟡) |
| Finance | 0 | 8 (🟡) |
| Documents | 0 | 3 (🟡) |
| Analytics | 0 | 4 (🟡) |
| Blog | 2 (mejora) | 0 |
| Users/Settings | 0 | 10 (🔴🟡) |
| Portal cliente | 0 | 16 (🔵) |
| **TOTAL** | **27** | **~95** |

---

## 17. Árbol de Rutas Angular (Objetivo)

```
AppRoutes
│
├── '' → SiteLayoutComponent (shell)
│   ├── '' → HomePageComponent
│   ├── 'servicios' → ServicesPageComponent
│   ├── 'servicios/:key' → ServiceDetailPageComponent
│   ├── 'casos-de-exito' → CaseStudiesPageComponent
│   ├── 'soluciones' → SolutionsPageComponent
│   ├── 'empresa' → AboutPageComponent
│   ├── 'metodologia' → ProcessPageComponent
│   ├── 'blog' → BlogPageComponent
│   ├── 'blog/:slug' → ArticlePageComponent
│   ├── 'faq' → FaqPageComponent
│   ├── 'contacto' → ContactPageComponent
│   ├── 'politica-de-privacidad' → PrivacyPageComponent
│   ├── 'mapa-web' → SitemapPageComponent
│   └── '**' → NotFoundPageComponent
│
├── 'auth-login' → AuthLoginComponent
├── 'auth-signup' → AuthSignupComponent
├── 'auth-re-password' → AuthRePasswordComponent
├── 'acceso-restringido' → AccessRestrictedComponent
│
├── 'dashboard' [AdminAuthGuard] → AdminLayoutComponent (NEW SHELL)
│   ├── '' → DashboardPageComponent
│   ├── 'leads' → LeadsPageComponent
│   │   ├── '' → LeadsPipelineViewComponent (default)
│   │   ├── 'list' → LeadsTableComponent
│   │   ├── 'sources' → LeadSourcesPageComponent
│   │   ├── 'new' → LeadFormComponent
│   │   └── ':id' → LeadDetailPageComponent
│   ├── 'clients' → ClientsPageComponent
│   │   ├── '' → ClientsTableComponent
│   │   ├── 'new' → ClientFormComponent
│   │   └── ':id' → ClientDetailPageComponent
│   ├── 'companies' → CompaniesPageComponent
│   ├── 'contacts' → ContactsPageComponent
│   ├── 'projects' → ProjectsPageComponent
│   │   ├── '' → ProjectsKanbanViewComponent
│   │   ├── 'list' → ProjectsTableComponent
│   │   ├── 'new' → ProjectFormComponent
│   │   └── ':id' → ProjectDetailPageComponent
│   ├── 'tasks' → TasksPageComponent
│   ├── 'products' → ProductsOverviewComponent
│   │   ├── 'talkaris' → TalkarisOverviewComponent
│   │   ├── 'talkaris/:id' → TalkarisDeploymentDetailComponent
│   │   ├── 'auctorio' → AuctorioOverviewComponent
│   │   └── 'custom' → CustomPlatformsPageComponent
│   ├── 'support' → SupportPageComponent
│   │   ├── 'tickets' → TicketsListComponent
│   │   └── 'tickets/:id' → TicketDetailPageComponent
│   ├── 'finance' → FinanceDashboardComponent
│   │   ├── 'invoices' → InvoicesListComponent
│   │   ├── 'invoices/:id' → InvoiceDetailPageComponent
│   │   ├── 'payments' → PaymentsListComponent
│   │   └── 'contracts' → ContractsListComponent
│   ├── 'documents' → DocumentsPageComponent
│   ├── 'analytics' → AnalyticsPageComponent
│   ├── 'blog' → ListaBlogsComponent
│   │   ├── 'new' → EditorBlogComponent
│   │   └── ':id' → EditorBlogComponent
│   ├── 'users' → TeamPageComponent
│   └── 'settings' → SettingsPageComponent
│       ├── 'workspace' → WorkspaceSettingsComponent
│       ├── 'integrations' → IntegrationsSettingsComponent
│       ├── 'api-keys' → ApiKeysSettingsComponent
│       └── 'feature-flags' → FeatureFlagsSettingsComponent
│
└── 'client' [ClientAuthGuard] → ClientPortalShellComponent (NEW SHELL)
    ├── '' → ClientDashboardComponent
    ├── 'projects' → ClientProjectsListComponent
    │   └── ':id' → ClientProjectDetailComponent
    ├── 'products' → ClientProductsComponent
    │   ├── 'talkaris' → ClientTalkarisComponent
    │   └── 'auctorio' → ClientAuctorioComponent
    ├── 'support' → ClientSupportComponent
    │   └── 'tickets/:id' → ClientTicketDetailComponent
    ├── 'documents' → ClientDocumentsComponent
    ├── 'billing' → ClientBillingComponent
    │   └── 'invoices/:id' → ClientInvoiceDetailComponent
    └── 'profile' → ClientProfileComponent
```
