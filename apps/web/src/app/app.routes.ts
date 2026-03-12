import { Routes } from "@angular/router";
import { SiteLayoutComponent } from "./site/components/site-layout.component";
import { AuthGuard } from "./services/authguard.service";

const legacyRedirects: Routes = [
  {
    path: "nosotros",
    redirectTo: "empresa",
    pathMatch: "full",
  },
  {
    path: "preguntas-frequentes",
    redirectTo: "faq",
    pathMatch: "full",
  },
  {
    path: "desarrollo-de-software",
    redirectTo: "servicios/desarrollo-software-medida",
    pathMatch: "full",
  },
  {
    path: "agencia-de-desarrollo-web",
    redirectTo: "servicios/desarrollo-software-medida",
    pathMatch: "full",
  },
  {
    path: "agencia-de-ecommerce",
    redirectTo: "servicios/plataformas-saas",
    pathMatch: "full",
  },
  {
    path: "agencia-de-funnels",
    redirectTo: "servicios/plataformas-saas",
    pathMatch: "full",
  },
  {
    path: "agencia-disenio-wordpress",
    redirectTo: "servicios/desarrollo-software-medida",
    pathMatch: "full",
  },
  {
    path: "agencia-disenio-web-corporativo",
    redirectTo: "servicios/desarrollo-software-medida",
    pathMatch: "full",
  },
  {
    path: "gestion-redes-sociales",
    redirectTo: "servicios/consultoria-tecnologica",
    pathMatch: "full",
  },
  {
    path: "agencia-marketing-contenidos",
    redirectTo: "servicios/consultoria-tecnologica",
    pathMatch: "full",
  },
  {
    path: "agencia-de-branding",
    redirectTo: "servicios/consultoria-tecnologica",
    pathMatch: "full",
  },
  {
    path: "email-marketing",
    redirectTo: "servicios/consultoria-tecnologica",
    pathMatch: "full",
  },
  {
    path: "agencia-adwords",
    redirectTo: "servicios/consultoria-tecnologica",
    pathMatch: "full",
  },
  {
    path: "facebook-ads",
    redirectTo: "servicios/consultoria-tecnologica",
    pathMatch: "full",
  },
  {
    path: "instagram-ads",
    redirectTo: "servicios/consultoria-tecnologica",
    pathMatch: "full",
  },
  {
    path: "linkeding-ads",
    redirectTo: "servicios/consultoria-tecnologica",
    pathMatch: "full",
  },
  {
    path: "posicionamiento-seo-empresas",
    redirectTo: "blog/software-medida-vs-herramienta-estandar",
    pathMatch: "full",
  },
  {
    path: "agencia-sem",
    redirectTo: "blog/cuando-automatizar-procesos-empresa",
    pathMatch: "full",
  },
  {
    path: "agencia-seo-local",
    redirectTo: "blog/software-medida-vs-herramienta-estandar",
    pathMatch: "full",
  },
  {
    path: "auditoria-seo",
    redirectTo: "servicios/consultoria-tecnologica",
    pathMatch: "full",
  },
  {
    path: "agencia-de-linkbuilding",
    redirectTo: "servicios/consultoria-tecnologica",
    pathMatch: "full",
  },
  {
    path: "agencia-seo-amazon",
    redirectTo: "servicios/consultoria-tecnologica",
    pathMatch: "full",
  },
  {
    path: "pagina-web-kit-digital",
    redirectTo: "servicios/desarrollo-software-medida",
    pathMatch: "full",
  },
  {
    path: "tienda-online-kit-digital",
    redirectTo: "servicios/plataformas-saas",
    pathMatch: "full",
  },
  {
    path: "redes-sociales-kit-digital",
    redirectTo: "contacto",
    pathMatch: "full",
  },
  {
    path: "crm-kit-digital",
    redirectTo: "servicios/automatizacion-procesos",
    pathMatch: "full",
  },
  {
    path: "erp-kit-digital",
    redirectTo: "servicios/automatizacion-procesos",
    pathMatch: "full",
  },
  {
    path: "factura-electronica-kit-digital",
    redirectTo: "servicios/automatizacion-procesos",
    pathMatch: "full",
  },
  {
    path: "bi-analitica-kit-digital",
    redirectTo: "servicios/desarrollo-software-medida",
    pathMatch: "full",
  },
  {
    path: "oficina-virtual-kit-digital",
    redirectTo: "servicios/automatizacion-procesos",
    pathMatch: "full",
  },
  {
    path: "comunicaciones-seguras-kit-digital",
    redirectTo: "contacto",
    pathMatch: "full",
  },
  {
    path: "ciberseguridad-kit-digital",
    redirectTo: "contacto",
    pathMatch: "full",
  },
  {
    path: "presencia-avanzada-kit-digital",
    redirectTo: "contacto",
    pathMatch: "full",
  },
  {
    path: "marketplace-kit-digital",
    redirectTo: "servicios/plataformas-saas",
    pathMatch: "full",
  },
];

export const routes: Routes = [
  {
    path: "auth-cover-login",
    redirectTo: "auth-login",
    pathMatch: "full",
  },
  {
    path: "auth-cover-re-password",
    redirectTo: "auth-re-password",
    pathMatch: "full",
  },
  {
    path: "auth-cover-signup",
    redirectTo: "auth-signup",
    pathMatch: "full",
  },
  {
    path: "auth-login-three",
    redirectTo: "auth-login",
    pathMatch: "full",
  },
  {
    path: "auth-re-password-three",
    redirectTo: "auth-re-password",
    pathMatch: "full",
  },
  {
    path: "auth-signup-three",
    redirectTo: "auth-signup",
    pathMatch: "full",
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./core/admin/admin-layout/admin-layout.component").then(
        (m) => m.AdminLayoutComponent
      ),
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./core/admin/dashboard/dashboard.component").then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: "leads",
        loadComponent: () =>
          import("./core/admin/leads/leads-page.component").then(
            (m) => m.LeadsPageComponent
          ),
      },
      {
        path: "leads/new",
        loadComponent: () =>
          import("./core/admin/leads/lead-form.component").then(
            (m) => m.LeadFormComponent
          ),
      },
      {
        path: "leads/:id",
        loadComponent: () =>
          import("./core/admin/leads/lead-detail.component").then(
            (m) => m.LeadDetailComponent
          ),
      },
      {
        path: "clients",
        loadComponent: () =>
          import("./core/admin/clients/clients-list.component").then(
            (m) => m.ClientsListComponent
          ),
      },
      {
        path: "clients/new",
        loadComponent: () =>
          import("./core/admin/clients/client-form.component").then(
            (m) => m.ClientFormComponent
          ),
      },
      {
        path: "clients/:id",
        loadComponent: () =>
          import("./core/admin/clients/client-detail.component").then(
            (m) => m.ClientDetailComponent
          ),
      },
      {
        path: "projects",
        loadComponent: () =>
          import("./core/admin/projects/projects-list.component").then(
            (m) => m.ProjectsListComponent
          ),
      },
      {
        path: "projects/new",
        loadComponent: () =>
          import("./core/admin/projects/project-form.component").then(
            (m) => m.ProjectFormComponent
          ),
      },
      {
        path: "projects/:id",
        loadComponent: () =>
          import("./core/admin/projects/project-detail.component").then(
            (m) => m.ProjectDetailComponent
          ),
      },
      {
        path: "blog",
        loadComponent: () =>
          import("./core/admin/lista-blogs/lista-blogs.component").then(
            (m) => m.ListaBlogsComponent
          ),
      },
      {
        path: "blog/new",
        loadComponent: () =>
          import("./core/admin/editor-blog/editor-blog.component").then(
            (m) => m.EditorBlogComponent
          ),
      },
      {
        path: "blog/:id",
        loadComponent: () =>
          import("./core/admin/editor-blog/editor-blog.component").then(
            (m) => m.EditorBlogComponent
          ),
      },
      // ── FINANCE ──────────────────────────────────────────────────────────
      {
        path: "finance",
        loadComponent: () =>
          import("./core/admin/finance/finance-overview.component").then(
            (m) => m.FinanceOverviewComponent
          ),
      },
      {
        path: "finance/contracts",
        loadComponent: () =>
          import("./core/admin/finance/contracts-list.component").then(
            (m) => m.ContractsListComponent
          ),
      },
      {
        path: "finance/contracts/new",
        loadComponent: () =>
          import("./core/admin/finance/contract-form.component").then(
            (m) => m.ContractFormComponent
          ),
      },
      {
        path: "finance/contracts/:id",
        loadComponent: () =>
          import("./core/admin/finance/contract-detail.component").then(
            (m) => m.ContractDetailComponent
          ),
      },
      {
        path: "finance/invoices",
        loadComponent: () =>
          import("./core/admin/finance/invoices-list.component").then(
            (m) => m.InvoicesListComponent
          ),
      },
      {
        path: "finance/invoices/new",
        loadComponent: () =>
          import("./core/admin/finance/invoice-form.component").then(
            (m) => m.InvoiceFormComponent
          ),
      },
      {
        path: "finance/invoices/:id",
        loadComponent: () =>
          import("./core/admin/finance/invoice-detail.component").then(
            (m) => m.InvoiceDetailComponent
          ),
      },
      // ── SUPPORT ──────────────────────────────────────────────────────────
      {
        path: "support",
        loadComponent: () =>
          import("./core/admin/support/tickets-list.component").then(
            (m) => m.TicketsListComponent
          ),
      },
      {
        path: "support/new",
        loadComponent: () =>
          import("./core/admin/support/ticket-form.component").then(
            (m) => m.TicketFormComponent
          ),
      },
      {
        path: "support/:id",
        loadComponent: () =>
          import("./core/admin/support/ticket-detail.component").then(
            (m) => m.TicketDetailComponent
          ),
      },
      // ── ANALYTICS ────────────────────────────────────────────────────────
      {
        path: "analytics",
        loadComponent: () =>
          import("./core/admin/analytics/analytics-page.component").then(
            (m) => m.AnalyticsPageComponent
          ),
      },
      // ── PRODUCTS ─────────────────────────────────────────────────────────
      {
        path: "products/talkaris",
        loadComponent: () =>
          import("./core/admin/products/talkaris-page.component").then(
            (m) => m.TalkarisPageComponent
          ),
      },
      {
        path: "products/auctorio",
        loadComponent: () =>
          import("./core/admin/products/auctorio-page.component").then(
            (m) => m.AuctorioPageComponent
          ),
      },
      // ── SISTEMA ──────────────────────────────────────────────────────────
      { path: "users", loadComponent: () => import("./core/admin/system/users-page.component").then(m => m.UsersPageComponent) },
      { path: "settings", loadComponent: () => import("./core/admin/system/settings-page.component").then(m => m.SettingsPageComponent) },
    ],
  },
  // ── CLIENT PORTAL ────────────────────────────────────────────────────────────
  {
    path: "portal",
    loadComponent: () =>
      import("./portal/portal-access.component").then((m) => m.PortalAccessComponent),
  },
  {
    path: "portal",
    loadComponent: () =>
      import("./portal/portal-layout.component").then((m) => m.PortalLayoutComponent),
    children: [
      {
        path: "dashboard",
        canActivate: [() => import("./portal/portal-guard").then((m) => m.portalGuard)],
        loadComponent: () =>
          import("./portal/portal-dashboard.component").then((m) => m.PortalDashboardComponent),
      },
      {
        path: "projects",
        canActivate: [() => import("./portal/portal-guard").then((m) => m.portalGuard)],
        loadComponent: () =>
          import("./portal/portal-projects.component").then((m) => m.PortalProjectsComponent),
      },
      {
        path: "invoices",
        canActivate: [() => import("./portal/portal-guard").then((m) => m.portalGuard)],
        loadComponent: () =>
          import("./portal/portal-invoices.component").then((m) => m.PortalInvoicesComponent),
      },
      {
        path: "tickets",
        canActivate: [() => import("./portal/portal-guard").then((m) => m.portalGuard)],
        loadComponent: () =>
          import("./portal/portal-tickets.component").then((m) => m.PortalTicketsComponent),
      },
    ],
  },
  {
    path: "acceso-restringido",
    loadComponent: () =>
      import("./auth/access-restricted/access-restricted.component").then(
        (m) => m.AccessRestrictedComponent
      ),
  },
  {
    path: "auth-login",
    loadComponent: () =>
      import("./auth/auth-login/auth-login.component").then(
        (m) => m.AuthLoginComponent
      ),
  },
  {
    path: "auth-re-password",
    loadComponent: () =>
      import("./auth/auth-re-password/auth-re-password.component").then(
        (m) => m.AuthRePasswordComponent
      ),
  },
  {
    path: "auth-signup",
    loadComponent: () =>
      import("./auth/auth-signup/auth-signup.component").then(
        (m) => m.AuthSignupComponent
      ),
  },
  {
    path: "",
    component: SiteLayoutComponent,
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./site/pages/home-page.component").then(
            (m) => m.HomePageComponent
          ),
      },
      {
        path: "servicios",
        loadComponent: () =>
          import("./site/pages/services-page.component").then(
            (m) => m.ServicesPageComponent
          ),
      },
      {
        path: "servicios/desarrollo-software-medida",
        data: { serviceKey: "software" },
        loadComponent: () =>
          import("./site/pages/service-detail-page.component").then(
            (m) => m.ServiceDetailPageComponent
          ),
      },
      {
        path: "servicios/automatizacion-procesos",
        data: { serviceKey: "automation" },
        loadComponent: () =>
          import("./site/pages/service-detail-page.component").then(
            (m) => m.ServiceDetailPageComponent
          ),
      },
      {
        path: "servicios/desarrollo-chatbots-empresas",
        data: { serviceKey: "chatbots" },
        loadComponent: () =>
          import("./site/pages/service-detail-page.component").then(
            (m) => m.ServiceDetailPageComponent
          ),
      },
      {
        path: "servicios/inteligencia-artificial-empresas",
        data: { serviceKey: "ai" },
        loadComponent: () =>
          import("./site/pages/service-detail-page.component").then(
            (m) => m.ServiceDetailPageComponent
          ),
      },
      {
        path: "servicios/plataformas-saas",
        data: { serviceKey: "saas" },
        loadComponent: () =>
          import("./site/pages/service-detail-page.component").then(
            (m) => m.ServiceDetailPageComponent
          ),
      },
      {
        path: "servicios/consultoria-tecnologica",
        data: { serviceKey: "consulting" },
        loadComponent: () =>
          import("./site/pages/service-detail-page.component").then(
            (m) => m.ServiceDetailPageComponent
          ),
      },
      {
        path: "casos-de-exito",
        loadComponent: () =>
          import("./site/pages/case-studies-page.component").then(
            (m) => m.CaseStudiesPageComponent
          ),
      },
      {
        path: "soluciones",
        loadComponent: () =>
          import("./site/pages/solutions-page.component").then(
            (m) => m.SolutionsPageComponent
          ),
      },
      {
        path: "empresa",
        loadComponent: () =>
          import("./site/pages/about-page.component").then(
            (m) => m.AboutPageComponent
          ),
      },
      {
        path: "metodologia",
        loadComponent: () =>
          import("./site/pages/process-page.component").then(
            (m) => m.ProcessPageComponent
          ),
      },
      {
        path: "blog",
        loadComponent: () =>
          import("./site/pages/blog-page.component").then(
            (m) => m.BlogPageComponent
          ),
      },
      {
        path: "blog/:slug",
        loadComponent: () =>
          import("./site/pages/article-page.component").then(
            (m) => m.ArticlePageComponent
          ),
      },
      {
        path: "faq",
        loadComponent: () =>
          import("./site/pages/faq-page.component").then(
            (m) => m.FaqPageComponent
          ),
      },
      {
        path: "contacto",
        loadComponent: () =>
          import("./site/pages/contact-page.component").then(
            (m) => m.ContactPageComponent
          ),
      },
      {
        path: "politica-de-privacidad",
        loadComponent: () =>
          import("./site/pages/privacy-page.component").then(
            (m) => m.PrivacyPageComponent
          ),
      },
      {
        path: "mapa-web",
        loadComponent: () =>
          import("./site/pages/sitemap-page.component").then(
            (m) => m.SitemapPageComponent
          ),
      },
      ...legacyRedirects,
      {
        path: "**",
        loadComponent: () =>
          import("./site/pages/not-found-page.component").then(
            (m) => m.NotFoundPageComponent
          ),
      },
    ],
  },
];
