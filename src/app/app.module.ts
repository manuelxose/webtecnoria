import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";
import { SharedModule } from "./shared/shared.module";

import {
  NgcCookieConsentConfig,
  NgcCookieConsentModule,
} from "ngx-cookieconsent";

// Componentes raíz y de páginas (tus declaraciones actuales)
import { AppComponent } from "./app.component";
import { HeaderComponent } from "./shared/header/header.component";
import { FooterComponent } from "./shared/footer/footer.component";
import { SwitcherComponent } from "./shared/switcher/switcher.component";

import { LoginComponent } from "./auth/login/login.component";
import { RegistrationComponent } from "./auth/registration/registration.component";
import { AuthCoverLoginComponent } from "./auth/auth-cover-login/auth-cover-login.component";
import { AuthCoverRePasswordComponent } from "./auth/auth-cover-re-password/auth-cover-re-password.component";
import { AuthCoverSignupComponent } from "./auth/auth-cover-signup/auth-cover-signup.component";
import { AuthLoginComponent } from "./auth/auth-login/auth-login.component";
import { AuthLoginThreeComponent } from "./auth/auth-login-three/auth-login-three.component";
import { AuthRePasswordComponent } from "./auth/auth-re-password/auth-re-password.component";
import { AuthRePasswordThreeComponent } from "./auth/auth-re-password-three/auth-re-password-three.component";
import { AuthSignupComponent } from "./auth/auth-signup/auth-signup.component";
import { AuthSignupThreeComponent } from "./auth/auth-signup-three/auth-signup-three.component";

import { EmailAlertComponent } from "./email/email-alert/email-alert.component";
import { EmailConfirmationComponent } from "./email/email-confirmation/email-confirmation.component";
import { EmailInvoiceComponent } from "./email/email-invoice/email-invoice.component";
import { EmailPasswordResetComponent } from "./email/email-password-reset/email-password-reset.component";

import { IndexComponent } from "./core/pages/index/index.component";
import { PaginaWebComponent } from "./core/pages/kit-digital/pagina-web/pagina-web.component";
import { RedesSocialesComponent } from "./core/pages/kit-digital/redes-sociales/redes-sociales.component";
import { CrmComponent } from "./core/pages/kit-digital/crm/crm.component";
import { ErpComponent } from "./core/pages/kit-digital/erp/erp.component";
import { FacturaDigitalComponent } from "./core/pages/kit-digital/factura-digital/factura-digital.component";
import { BiAnaliticaComponent } from "./core/pages/kit-digital/bi-analitica/bi-analitica.component";
import { OficinaVirtualComponent } from "./core/pages/kit-digital/oficina-virtual/oficina-virtual.component";
import { ComunicacionesSegurasComponent } from "./core/pages/kit-digital/comunicaciones-seguras/comunicaciones-seguras.component";
import { MarketplaceComponent } from "./core/pages/kit-digital/marketplace/marketplace.component";
import { CiberseguridadComponent } from "./core/pages/kit-digital/ciberseguridad/ciberseguridad.component";
import { PresenciaAvanzadaComponent } from "./core/pages/kit-digital/presencia-avanzada/presencia-avanzada.component";

import { DisenioWebComponent } from "./core/pages/servicios/diseño-web/disenio-web/disenio-web.component";
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
import { AboutUsComponent } from "./core/pages/about-us/about-us.component";
import { BlogDetailComponent } from "./core/components/blog-detail/blog-detail.component";
import { MasterPageComponent } from "./core/components/master-page/master-page.component";
import { FaqComponent } from "./core/pages/faq/faq.component";
import { ContactoComponent } from "./core/pages/contacto/contacto.component";
import { MapaWebComponent } from "./core/pages/mapa-web/mapa-web.component";
import { PoliticaprivacidadComponent } from "./core/pages/politicaprivacidad/politicaprivacidad.component";
import { AdminPanelComponent } from "./core/admin/admin-panel/admin-panel.component";
import { EcoommerceComponent } from "./core/pages/servicios/diseño-web/tienda-online/tienda-online.component";
import { TiendaOnlineComponent } from "./core/pages/kit-digital/tienda-online/tienda-online.component";

import { AuthService } from "./services/auth.service";
import { SWIPER_CONFIG, SwiperConfigInterface } from "ngx-swiper-wrapper";

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: "horizontal",
  slidesPerView: "auto",
};

const cookieConfig: NgcCookieConsentConfig = {
  cookie: { domain: "localhost" },
  palette: {
    popup: { background: "#000" },
    button: { background: "#f1d600" },
  },
  theme: "edgeless",
  type: "opt-out",
};

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SwitcherComponent,

    LoginComponent,
    RegistrationComponent,
    AuthCoverLoginComponent,
    AuthCoverRePasswordComponent,
    AuthCoverSignupComponent,
    AuthLoginComponent,
    AuthLoginThreeComponent,
    AuthRePasswordComponent,
    AuthRePasswordThreeComponent,
    AuthSignupComponent,
    AuthSignupThreeComponent,

    EmailAlertComponent,
    EmailConfirmationComponent,
    EmailInvoiceComponent,
    EmailPasswordResetComponent,

    IndexComponent,
    PaginaWebComponent,
    RedesSocialesComponent,
    CrmComponent,
    ErpComponent,
    FacturaDigitalComponent,
    BiAnaliticaComponent,
    OficinaVirtualComponent,
    ComunicacionesSegurasComponent,
    MarketplaceComponent,
    CiberseguridadComponent,
    PresenciaAvanzadaComponent,

    DisenioWebComponent,
    FunnelsComponent,
    DisenioWordpressComponent,
    DisenioWebCorporativoComponent,
    GestionRedesSocialesComponent,
    AgenciaMarketingContenidosComponent,
    AgenciaDeBrandingComponent,
    EmailMarketingComponent,
    AgenciaAdwordsComponent,
    AgenciaFacebookAdsComponent,
    AgenciaInstagramAdsComponent,
    AgenciaLinkedingAdsComponent,
    PosicionamientoSeoComponent,
    PosicionamientoSemComponent,
    PosicionamientoSeoLocalComponent,
    AuditoriaSeoComponent,
    PosicionamientoSeoAmazonComponent,
    AgenciaLinkbuildingComponent,
    SoftwareMedidaComponent,
    AppWebComponent,
    MainBlogComponent,
    AboutUsComponent,
    BlogDetailComponent,
    MasterPageComponent,
    FaqComponent,
    ContactoComponent,
    MapaWebComponent,
    PoliticaprivacidadComponent,
    EcoommerceComponent,
    TiendaOnlineComponent,
    AdminPanelComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // Routing centralizado en AppRoutingModule (internamente hace RouterModule.forRoot)
    AppRoutingModule,

    // Todas las libs UI y compartidos desde aquí
    SharedModule,

    // Cookie consent a nivel app
    NgcCookieConsentModule.forRoot(cookieConfig),
  ],
  providers: [
    AuthService,
    { provide: SWIPER_CONFIG, useValue: DEFAULT_SWIPER_CONFIG },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
