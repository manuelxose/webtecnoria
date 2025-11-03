import { Routes } from "@angular/router";

import { MasterPageComponent } from "./core/components/master-page/master-page.component";
import { HomeComponent } from "./core/pages/home/home.component";
import { PaginaWebComponent } from "./core/pages/kit-digital/pagina-web/pagina-web.component";
import { ComunicacionesSegurasComponent } from "./core/pages/kit-digital/comunicaciones-seguras/comunicaciones-seguras.component";
import { TiendaOnlineComponent } from "./core/pages/kit-digital/tienda-online/tienda-online.component";
import { RedesSocialesComponent } from "./core/pages/kit-digital/redes-sociales/redes-sociales.component";
import { OficinaVirtualComponent } from "./core/pages/kit-digital/oficina-virtual/oficina-virtual.component";
import { FacturaDigitalComponent } from "./core/pages/kit-digital/factura-digital/factura-digital.component";
import { ErpComponent } from "./core/pages/kit-digital/erp/erp.component";
import { CrmComponent } from "./core/pages/kit-digital/crm/crm.component";
import { BiAnaliticaComponent } from "./core/pages/kit-digital/bi-analitica/bi-analitica.component";
import { CiberseguridadComponent } from "./core/pages/kit-digital/ciberseguridad/ciberseguridad.component";
import { PresenciaAvanzadaComponent } from "./core/pages/kit-digital/presencia-avanzada/presencia-avanzada.component";
import { MarketplaceComponent } from "./core/pages/kit-digital/marketplace/marketplace.component";

import { DisenioWebComponent } from "./core/pages/servicios/diseño-web/disenio-web/disenio-web.component";
import { EcoommerceComponent } from "./core/pages/servicios/diseño-web/tienda-online/tienda-online.component";
import { FunnelsComponent } from "./core/pages/servicios/diseño-web/funnels/funnels.component";
import { DisenioWordpressComponent } from "./core/pages/servicios/diseño-web/disenio-wordpress/disenio-wordpress.component";
import { DisenioWebCorporativoComponent } from "./core/pages/servicios/diseño-web/disenio-web-corporativo/disenio-web-corporativo.component";

import { GestionRedesSocialesComponent } from "./core/pages/servicios/marketing-digital/redes-sociales/redes-sociales.component";
import { AgenciaMarketingContenidosComponent } from "./core/pages/servicios/marketing-digital/agencia-marketing-contenidos/agencia-marketing-contenidos.component";
import { AgenciaDeBrandingComponent } from "./core/pages/servicios/marketing-digital/agencia-de-branding/agencia-de-branding.component";
import { EmailMarketingComponent } from "./core/pages/servicios/marketing-digital/email-marketing/email-marketing.component";

import { AgenciaAdwordsComponent } from "./core/pages/servicios/publicidad/agencia-adwords/agencia-adwords.component";
import { AgenciaFacebookAdsComponent } from "./core/pages/servicios/publicidad/agencia-facebook-ads/agencia-facebook-ads.component";
import { AgenciaInstagramAdsComponent } from "./core/pages/servicios/publicidad/agencia-instagram-ads/agencia-instagram-ads.component";
import { AgenciaLinkedingAdsComponent } from "./core/pages/servicios/publicidad/agencia-linkeding-ads/agencia-linkeding-ads.component";

import { PosicionamientoSeoComponent } from "./core/pages/servicios/posicionamiento/posicionamiento-seo/posicionamiento-seo.component";
import { PosicionamientoSemComponent } from "./core/pages/servicios/posicionamiento/posicionamiento-sem/posicionamiento-sem.component";
import { PosicionamientoSeoLocalComponent } from "./core/pages/servicios/posicionamiento/posicionamiento-seo-local/posicionamiento-seo-local.component";
import { AuditoriaSeoComponent } from "./core/pages/servicios/posicionamiento/auditoria-seo/auditoria-seo.component";
import { PosicionamientoSeoAmazonComponent } from "./core/pages/servicios/posicionamiento/posicionamiento-seo-amazon/posicionamiento-seo-amazon.component";
import { AgenciaLinkbuildingComponent } from "./core/pages/servicios/posicionamiento/agencia-linkbuilding/agencia-linkbuilding.component";

import { SoftwareMedidaComponent } from "./core/pages/servicios/desarrollo/software-medida/software-medida.component";
import { AppWebComponent } from "./core/pages/servicios/desarrollo/app-web/app-web.component";

import { MainBlogComponent } from "./core/pages/blog/blog.component";
import { BlogDetailComponent } from "./core/components/blog-detail/blog-detail.component";
import { AboutUsComponent } from "./core/pages/about-us/about-us.component";
import { FaqComponent } from "./core/pages/faq/faq.component";
import { ContactoComponent } from "./core/pages/contacto/contacto.component";
import { PoliticaprivacidadComponent } from "./core/pages/politicaprivacidad/politicaprivacidad.component";
import { MapaWebComponent } from "./core/pages/mapa-web/mapa-web.component";

import { AdminPanelComponent } from "./core/admin/admin-panel/admin-panel.component";
import { AuthLoginComponent } from "./auth/auth-login/auth-login.component";
import { AuthCoverLoginComponent } from "./auth/auth-cover-login/auth-cover-login.component";
import { AuthCoverRePasswordComponent } from "./auth/auth-cover-re-password/auth-cover-re-password.component";
import { AuthCoverSignupComponent } from "./auth/auth-cover-signup/auth-cover-signup.component";
import { AuthLoginThreeComponent } from "./auth/auth-login-three/auth-login-three.component";
import { AuthRePasswordComponent } from "./auth/auth-re-password/auth-re-password.component";
import { AuthRePasswordThreeComponent } from "./auth/auth-re-password-three/auth-re-password-three.component";
import { AuthSignupComponent } from "./auth/auth-signup/auth-signup.component";
import { AuthSignupThreeComponent } from "./auth/auth-signup-three/auth-signup-three.component";

import { AuthGuard } from "./services/authguard.service";

export const routes: Routes = [
  {
    path: "",
    component: MasterPageComponent,
    children: [
      { path: "", component: HomeComponent },

      { path: "pagina-web-kit-digital", component: PaginaWebComponent },
      {
        path: "comunicaciones-seguras-kit-digital",
        component: ComunicacionesSegurasComponent,
      },
      { path: "tienda-online-kit-digital", component: TiendaOnlineComponent },
      { path: "redes-sociales-kit-digital", component: RedesSocialesComponent },
      {
        path: "oficina-virtual-kit-digital",
        component: OficinaVirtualComponent,
      },
      {
        path: "factura-electronica-kit-digital",
        component: FacturaDigitalComponent,
      },
      { path: "erp-kit-digital", component: ErpComponent },
      { path: "crm-kit-digital", component: CrmComponent },
      { path: "bi-analitica-kit-digital", component: BiAnaliticaComponent },
      {
        path: "ciberseguridad-kit-digital",
        component: CiberseguridadComponent,
      },
      {
        path: "presencia-avanzada-kit-digital",
        component: PresenciaAvanzadaComponent,
      },
      { path: "marketplace-kit-digital", component: MarketplaceComponent },

      // Servicios
      { path: "agencia-de-desarrollo-web", component: DisenioWebComponent },
      { path: "agencia-de-ecommerce", component: EcoommerceComponent },
      { path: "agencia-de-funnels", component: FunnelsComponent },
      {
        path: "agencia-disenio-wordpress",
        component: DisenioWordpressComponent,
      },
      {
        path: "agencia-disenio-web-corporativo",
        component: DisenioWebCorporativoComponent,
      },

      {
        path: "gestion-redes-sociales",
        component: GestionRedesSocialesComponent,
      },
      {
        path: "agencia-marketing-contenidos",
        component: AgenciaMarketingContenidosComponent,
      },
      { path: "agencia-de-branding", component: AgenciaDeBrandingComponent },
      { path: "email-marketing", component: EmailMarketingComponent },

      { path: "agencia-adwords", component: AgenciaAdwordsComponent },
      { path: "facebook-ads", component: AgenciaFacebookAdsComponent },
      { path: "instagram-ads", component: AgenciaInstagramAdsComponent },
      { path: "linkeding-ads", component: AgenciaLinkedingAdsComponent },

      {
        path: "posicionamiento-seo-empresas",
        component: PosicionamientoSeoComponent,
      },
      { path: "agencia-sem", component: PosicionamientoSemComponent },
      {
        path: "agencia-seo-local",
        component: PosicionamientoSeoLocalComponent,
      },
      { path: "auditoria-seo", component: AuditoriaSeoComponent },
      {
        path: "agencia-de-linkbuilding",
        component: AgenciaLinkbuildingComponent,
      },
      {
        path: "agencia-seo-amazon",
        component: PosicionamientoSeoAmazonComponent,
      },

      {
        path: "posicionamiento-seo-empresas/:location",
        component: PosicionamientoSeoComponent,
      },
      { path: "agencia-sem/:location", component: PosicionamientoSemComponent },
      {
        path: "agencia-seo-local/:location",
        component: PosicionamientoSeoLocalComponent,
      },
      { path: "auditoria-seo/:location", component: AuditoriaSeoComponent },
      {
        path: "agencia-de-linkbuilding/:location",
        component: AgenciaLinkbuildingComponent,
      },
      {
        path: "agencia-seo-amazon/:location",
        component: PosicionamientoSeoAmazonComponent,
      },

      { path: "desarrollo-de-software", component: SoftwareMedidaComponent },
      { path: "diseño-web-app", component: AppWebComponent },

      // Blog
      { path: "blog", component: MainBlogComponent },
      { path: "blog/:slug", component: BlogDetailComponent },

      { path: "nosotros", component: AboutUsComponent },

      // Misc
      { path: "preguntas-frequentes", component: FaqComponent },
      { path: "contacto", component: ContactoComponent },
      {
        path: "politica-de-privacidad",
        component: PoliticaprivacidadComponent,
      },
      { path: "mapa-web", component: MapaWebComponent },
    ],
  },

  {
    path: "dashboard",
    component: AdminPanelComponent,
    canActivate: [AuthGuard],
  },

  { path: "auth-login", component: AuthLoginComponent },
  { path: "auth-cover-login", component: AuthCoverLoginComponent },
  { path: "auth-cover-re-password", component: AuthCoverRePasswordComponent },
  { path: "auth-cover-signup", component: AuthCoverSignupComponent },
  { path: "auth-login-three", component: AuthLoginThreeComponent },
  { path: "auth-re-password", component: AuthRePasswordComponent },
  { path: "auth-re-password-three", component: AuthRePasswordThreeComponent },
  { path: "auth-signup", component: AuthSignupComponent },
  { path: "auth-signup-three", component: AuthSignupThreeComponent },
];
