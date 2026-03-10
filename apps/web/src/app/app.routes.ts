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
    path: "dashboard",
    loadComponent: () =>
      import("./core/admin/admin-panel/admin-panel.component").then(
        (m) => m.AdminPanelComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "auth-login",
    loadComponent: () =>
      import("./auth/auth-login/auth-login.component").then(
        (m) => m.AuthLoginComponent
      ),
  },
  {
    path: "auth-cover-login",
    loadComponent: () =>
      import("./auth/auth-cover-login/auth-cover-login.component").then(
        (m) => m.AuthCoverLoginComponent
      ),
  },
  {
    path: "auth-cover-re-password",
    loadComponent: () =>
      import(
        "./auth/auth-cover-re-password/auth-cover-re-password.component"
      ).then((m) => m.AuthCoverRePasswordComponent),
  },
  {
    path: "auth-cover-signup",
    loadComponent: () =>
      import("./auth/auth-cover-signup/auth-cover-signup.component").then(
        (m) => m.AuthCoverSignupComponent
      ),
  },
  {
    path: "auth-login-three",
    loadComponent: () =>
      import("./auth/auth-login-three/auth-login-three.component").then(
        (m) => m.AuthLoginThreeComponent
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
    path: "auth-re-password-three",
    loadComponent: () =>
      import(
        "./auth/auth-re-password-three/auth-re-password-three.component"
      ).then((m) => m.AuthRePasswordThreeComponent),
  },
  {
    path: "auth-signup",
    loadComponent: () =>
      import("./auth/auth-signup/auth-signup.component").then(
        (m) => m.AuthSignupComponent
      ),
  },
  {
    path: "auth-signup-three",
    loadComponent: () =>
      import("./auth/auth-signup-three/auth-signup-three.component").then(
        (m) => m.AuthSignupThreeComponent
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
