import { Routes } from "@angular/router";

import { MasterPageComponent } from "./core/pages/master-page/master-page.component";
import { AuthGuard } from "./services/authguard.service";

export const routes: Routes = [
  {
    path: "",
    component: MasterPageComponent,
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./core/pages/home/home.component").then(
            (m) => m.HomeComponent
          ),
      },

      {
        path: "pagina-web-kit-digital",
        loadComponent: () =>
          import(
            "./core/pages/kit-digital/pagina-web/pagina-web.component"
          ).then((m) => m.PaginaWebComponent),
      },
      {
        path: "comunicaciones-seguras-kit-digital",
        loadComponent: () =>
          import(
            "./core/pages/kit-digital/comunicaciones-seguras/comunicaciones-seguras.component"
          ).then((m) => m.ComunicacionesSegurasComponent),
      },
      {
        path: "tienda-online-kit-digital",
        loadComponent: () =>
          import(
            "./core/pages/kit-digital/tienda-online/tienda-online.component"
          ).then((m) => m.TiendaOnlineComponent),
      },
      {
        path: "redes-sociales-kit-digital",
        loadComponent: () =>
          import(
            "./core/pages/kit-digital/redes-sociales/redes-sociales.component"
          ).then((m) => m.RedesSocialesComponent),
      },
      {
        path: "oficina-virtual-kit-digital",
        loadComponent: () =>
          import(
            "./core/pages/kit-digital/oficina-virtual/oficina-virtual.component"
          ).then((m) => m.OficinaVirtualComponent),
      },
      {
        path: "factura-electronica-kit-digital",
        loadComponent: () =>
          import(
            "./core/pages/kit-digital/factura-digital/factura-digital.component"
          ).then((m) => m.FacturaDigitalComponent),
      },
      {
        path: "erp-kit-digital",
        loadComponent: () =>
          import("./core/pages/kit-digital/erp/erp.component").then(
            (m) => m.ErpComponent
          ),
      },
      {
        path: "crm-kit-digital",
        loadComponent: () =>
          import("./core/pages/kit-digital/crm/crm.component").then(
            (m) => m.CrmComponent
          ),
      },
      {
        path: "bi-analitica-kit-digital",
        loadComponent: () =>
          import(
            "./core/pages/kit-digital/bi-analitica/bi-analitica.component"
          ).then((m) => m.BiAnaliticaComponent),
      },
      {
        path: "ciberseguridad-kit-digital",
        loadComponent: () =>
          import(
            "./core/pages/kit-digital/ciberseguridad/ciberseguridad.component"
          ).then((m) => m.CiberseguridadComponent),
      },
      {
        path: "presencia-avanzada-kit-digital",
        loadComponent: () =>
          import(
            "./core/pages/kit-digital/presencia-avanzada/presencia-avanzada.component"
          ).then((m) => m.PresenciaAvanzadaComponent),
      },
      {
        path: "marketplace-kit-digital",
        loadComponent: () =>
          import(
            "./core/pages/kit-digital/marketplace/marketplace.component"
          ).then((m) => m.MarketplaceComponent),
      },

      // Servicios
      {
        path: "agencia-de-desarrollo-web",
        loadComponent: () =>
          import(
            "./core/pages/servicios/diseño-web/disenio-web/disenio-web.component"
          ).then((m) => m.DisenioWebComponent),
      },
      {
        path: "agencia-de-ecommerce",
        loadComponent: () =>
          import(
            "./core/pages/servicios/diseño-web/tienda-online/tienda-online.component"
          ).then((m) => m.EcoommerceComponent),
      },
      {
        path: "agencia-de-funnels",
        loadComponent: () =>
          import(
            "./core/pages/servicios/diseño-web/funnels/funnels.component"
          ).then((m) => m.FunnelsComponent),
      },
      {
        path: "agencia-disenio-wordpress",
        loadComponent: () =>
          import(
            "./core/pages/servicios/diseño-web/disenio-wordpress/disenio-wordpress.component"
          ).then((m) => m.DisenioWordpressComponent),
      },
      {
        path: "agencia-disenio-web-corporativo",
        loadComponent: () =>
          import(
            "./core/pages/servicios/diseño-web/disenio-web-corporativo/disenio-web-corporativo.component"
          ).then((m) => m.DisenioWebCorporativoComponent),
      },

      {
        path: "gestion-redes-sociales",
        loadComponent: () =>
          import(
            "./core/pages/servicios/marketing-digital/redes-sociales/redes-sociales.component"
          ).then((m) => m.GestionRedesSocialesComponent),
      },
      {
        path: "agencia-marketing-contenidos",
        loadComponent: () =>
          import(
            "./core/pages/servicios/marketing-digital/agencia-marketing-contenidos/agencia-marketing-contenidos.component"
          ).then((m) => m.AgenciaMarketingContenidosComponent),
      },
      {
        path: "agencia-de-branding",
        loadComponent: () =>
          import(
            "./core/pages/servicios/marketing-digital/agencia-de-branding/agencia-de-branding.component"
          ).then((m) => m.AgenciaDeBrandingComponent),
      },
      {
        path: "email-marketing",
        loadComponent: () =>
          import(
            "./core/pages/servicios/marketing-digital/email-marketing/email-marketing.component"
          ).then((m) => m.EmailMarketingComponent),
      },

      {
        path: "agencia-adwords",
        loadComponent: () =>
          import(
            "./core/pages/servicios/publicidad/agencia-adwords/agencia-adwords.component"
          ).then((m) => m.AgenciaAdwordsComponent),
      },
      {
        path: "facebook-ads",
        loadComponent: () =>
          import(
            "./core/pages/servicios/publicidad/agencia-facebook-ads/agencia-facebook-ads.component"
          ).then((m) => m.AgenciaFacebookAdsComponent),
      },
      {
        path: "instagram-ads",
        loadComponent: () =>
          import(
            "./core/pages/servicios/publicidad/agencia-instagram-ads/agencia-instagram-ads.component"
          ).then((m) => m.AgenciaInstagramAdsComponent),
      },
      {
        path: "linkeding-ads",
        loadComponent: () =>
          import(
            "./core/pages/servicios/publicidad/agencia-linkeding-ads/agencia-linkeding-ads.component"
          ).then((m) => m.AgenciaLinkedingAdsComponent),
      },

      {
        path: "posicionamiento-seo-empresas",
        loadComponent: () =>
          import(
            "./core/pages/servicios/posicionamiento/posicionamiento-seo/posicionamiento-seo.component"
          ).then((m) => m.PosicionamientoSeoComponent),
      },
      {
        path: "agencia-sem",
        loadComponent: () =>
          import(
            "./core/pages/servicios/posicionamiento/posicionamiento-sem/posicionamiento-sem.component"
          ).then((m) => m.PosicionamientoSemComponent),
      },
      {
        path: "agencia-seo-local",
        loadComponent: () =>
          import(
            "./core/pages/servicios/posicionamiento/posicionamiento-seo-local/posicionamiento-seo-local.component"
          ).then((m) => m.PosicionamientoSeoLocalComponent),
      },
      {
        path: "auditoria-seo",
        loadComponent: () =>
          import(
            "./core/pages/servicios/posicionamiento/auditoria-seo/auditoria-seo.component"
          ).then((m) => m.AuditoriaSeoComponent),
      },
      {
        path: "agencia-de-linkbuilding",
        loadComponent: () =>
          import(
            "./core/pages/servicios/posicionamiento/agencia-linkbuilding/agencia-linkbuilding.component"
          ).then((m) => m.AgenciaLinkbuildingComponent),
      },
      {
        path: "agencia-seo-amazon",
        loadComponent: () =>
          import(
            "./core/pages/servicios/posicionamiento/posicionamiento-seo-amazon/posicionamiento-seo-amazon.component"
          ).then((m) => m.PosicionamientoSeoAmazonComponent),
      },

      {
        path: "posicionamiento-seo-empresas/:location",
        loadComponent: () =>
          import(
            "./core/pages/servicios/posicionamiento/posicionamiento-seo/posicionamiento-seo.component"
          ).then((m) => m.PosicionamientoSeoComponent),
      },
      {
        path: "agencia-sem/:location",
        loadComponent: () =>
          import(
            "./core/pages/servicios/posicionamiento/posicionamiento-sem/posicionamiento-sem.component"
          ).then((m) => m.PosicionamientoSemComponent),
      },
      {
        path: "agencia-seo-local/:location",
        loadComponent: () =>
          import(
            "./core/pages/servicios/posicionamiento/posicionamiento-seo-local/posicionamiento-seo-local.component"
          ).then((m) => m.PosicionamientoSeoLocalComponent),
      },
      {
        path: "auditoria-seo/:location",
        loadComponent: () =>
          import(
            "./core/pages/servicios/posicionamiento/auditoria-seo/auditoria-seo.component"
          ).then((m) => m.AuditoriaSeoComponent),
      },
      {
        path: "agencia-de-linkbuilding/:location",
        loadComponent: () =>
          import(
            "./core/pages/servicios/posicionamiento/agencia-linkbuilding/agencia-linkbuilding.component"
          ).then((m) => m.AgenciaLinkbuildingComponent),
      },
      {
        path: "agencia-seo-amazon/:location",
        loadComponent: () =>
          import(
            "./core/pages/servicios/posicionamiento/posicionamiento-seo-amazon/posicionamiento-seo-amazon.component"
          ).then((m) => m.PosicionamientoSeoAmazonComponent),
      },

      {
        path: "desarrollo-de-software",
        loadComponent: () =>
          import(
            "./core/pages/servicios/desarrollo/software-medida/software-medida.component"
          ).then((m) => m.SoftwareMedidaComponent),
      },
      {
        path: "diseño-web-app",
        loadComponent: () =>
          import(
            "./core/pages/servicios/desarrollo/app-web/app-web.component"
          ).then((m) => m.AppWebComponent),
      },

      // Blog
      {
        path: "blog",
        loadComponent: () =>
          import("./core/pages/blog/blog.component").then(
            (m) => m.MainBlogComponent
          ),
      },
      {
        path: "blog/:slug",
        loadComponent: () =>
          import(
            "./core/pages/blog/components/blog-detail/blog-detail.component"
          ).then((m) => m.BlogDetailComponent),
      },

      {
        path: "nosotros",
        loadComponent: () =>
          import("./core/pages/about-us/about-us.component").then(
            (m) => m.AboutUsComponent
          ),
      },

      // Misc
      {
        path: "preguntas-frequentes",
        loadComponent: () =>
          import("./core/pages/faq/faq.component").then((m) => m.FaqComponent),
      },
      {
        path: "contacto",
        loadComponent: () =>
          import("./core/pages/contacto/contacto.component").then(
            (m) => m.ContactoComponent
          ),
      },
      {
        path: "politica-de-privacidad",
        loadComponent: () =>
          import(
            "./core/pages/politicaprivacidad/politicaprivacidad.component"
          ).then((m) => m.PoliticaprivacidadComponent),
      },
      {
        path: "mapa-web",
        loadComponent: () =>
          import("./core/pages/mapa-web/mapa-web.component").then(
            (m) => m.MapaWebComponent
          ),
      },
    ],
  },

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
];
