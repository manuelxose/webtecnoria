import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthCoverLoginComponent } from './auth/auth-cover-login/auth-cover-login.component';
import { AuthCoverRePasswordComponent } from './auth/auth-cover-re-password/auth-cover-re-password.component';
import { AuthCoverSignupComponent } from './auth/auth-cover-signup/auth-cover-signup.component';
import { AuthLoginThreeComponent } from './auth/auth-login-three/auth-login-three.component';
import { AuthLoginComponent } from './auth/auth-login/auth-login.component';
import { AuthRePasswordThreeComponent } from './auth/auth-re-password-three/auth-re-password-three.component';
import { AuthRePasswordComponent } from './auth/auth-re-password/auth-re-password.component';
import { AuthSignupThreeComponent } from './auth/auth-signup-three/auth-signup-three.component';
import { AuthSignupComponent } from './auth/auth-signup/auth-signup.component';


import { PaginaWebComponent } from './core/pages/kit-digital/pagina-web/pagina-web.component';
import { BiAnaliticaComponent } from './core/pages/kit-digital/bi-analitica/bi-analitica.component';
import { CrmComponent } from './core/pages/kit-digital/crm/crm.component';
import { ErpComponent } from './core/pages/kit-digital/erp/erp.component';
import { FacturaDigitalComponent } from './core/pages/kit-digital/factura-digital/factura-digital.component';
import { OficinaVirtualComponent } from './core/pages/kit-digital/oficina-virtual/oficina-virtual.component';
import { RedesSocialesComponent } from './core/pages/kit-digital/redes-sociales/redes-sociales.component';
import { ComunicacionesSegurasComponent } from './core/pages/kit-digital/comunicaciones-seguras/comunicaciones-seguras.component';
import { CiberseguridadComponent } from './core/pages/kit-digital/ciberseguridad/ciberseguridad.component';
import { PresenciaAvanzadaComponent } from './core/pages/kit-digital/presencia-avanzada/presencia-avanzada.component';
import { MarketplaceComponent } from './core/pages/kit-digital/marketplace/marketplace.component';
import { DisenioWebComponent } from './core/pages/servicios/diseño-web/disenio-web/disenio-web.component';
import { EcoommerceComponent } from './core/pages/servicios/diseño-web/tienda-online/tienda-online.component';
import { FunnelsComponent } from './core/pages/servicios/diseño-web/funnels/funnels.component';
import { DisenioWordpressComponent } from './core/pages/servicios/diseño-web/disenio-wordpress/disenio-wordpress.component';
import { DisenioWebCorporativoComponent } from './core/pages/servicios/diseño-web/disenio-web-corporativo/disenio-web-corporativo.component';
import { GestionRedesSocialesComponent } from './core/pages/servicios/marketing-digital/redes-sociales/redes-sociales.component';
import { AgenciaMarketingContenidosComponent } from './core/pages/servicios/marketing-digital/agencia-marketing-contenidos/agencia-marketing-contenidos.component';
import { AgenciaDeBrandingComponent } from './core/pages/servicios/marketing-digital/agencia-de-branding/agencia-de-branding.component';
import { EmailMarketingComponent } from './core/pages/servicios/marketing-digital/email-marketing/email-marketing.component';
import { AgenciaAdwordsComponent } from './core/pages/servicios/publicidad/agencia-adwords/agencia-adwords.component';
import { AgenciaFacebookAdsComponent } from './core/pages/servicios/publicidad/agencia-facebook-ads/agencia-facebook-ads.component';
import { AgenciaInstagramAdsComponent } from './core/pages/servicios/publicidad/agencia-instagram-ads/agencia-instagram-ads.component';
import { AgenciaLinkedingAdsComponent } from './core/pages/servicios/publicidad/agencia-linkeding-ads/agencia-linkeding-ads.component';
import { PosicionamientoSeoComponent } from './core/pages/servicios/posicionamiento/posicionamiento-seo/posicionamiento-seo.component';
import { PosicionamientoSemComponent } from './core/pages/servicios/posicionamiento/posicionamiento-sem/posicionamiento-sem.component';
import { PosicionamientoSeoLocalComponent } from './core/pages/servicios/posicionamiento/posicionamiento-seo-local/posicionamiento-seo-local.component';
import { AuditoriaSeoComponent } from './core/pages/servicios/posicionamiento/auditoria-seo/auditoria-seo.component';
import { PosicionamientoSeoAmazonComponent } from './core/pages/servicios/posicionamiento/posicionamiento-seo-amazon/posicionamiento-seo-amazon.component';
import { AgenciaLinkbuildingComponent } from './core/pages/servicios/posicionamiento/agencia-linkbuilding/agencia-linkbuilding.component';
import { SoftwareMedidaComponent } from './core/pages/servicios/desarrollo/software-medida/software-medida.component';
import { AppWebComponent } from './core/pages/servicios/desarrollo/app-web/app-web.component';
import { IndexComponent } from './core/pages/index/index.component';
import { AboutUsComponent } from './core/pages/about-us/about-us.component';
import { MainBlogComponent } from './core/pages/blog/blog.component';
import { BlogDetailComponent } from './core/components/blog-detail/blog-detail.component';
import { MasterPageComponent } from './core/components/master-page/master-page.component';
import { FaqComponent } from './core/pages/faq/faq.component';
import { ContactoComponent } from './core/pages/contacto/contacto.component';
import { PoliticaprivacidadComponent } from './core/pages/politicaprivacidad/politicaprivacidad.component';
import { MapaWebComponent } from './core/pages/mapa-web/mapa-web.component';
import { TiendaOnlineComponent } from './core/pages/kit-digital/tienda-online/tienda-online.component';
import { AdminPanelComponent } from './core/admin/admin-panel/admin-panel.component';
import { AuthGuard } from './services/authguard.service';


export const routes: Routes = [
      {
        path:'',
        component: MasterPageComponent,
        children: [
          { path: '', component: IndexComponent },
          
          { path: 'pagina-web-kit-digital', component: PaginaWebComponent},
          { path: 'comunicaciones-seguras-kit-digital', component: ComunicacionesSegurasComponent },
          { path: 'tienda-online-kit-digital', component: TiendaOnlineComponent },
          { path: 'redes-sociales-kit-digital', component: RedesSocialesComponent },
          { path: 'oficina-virtual-kit-digital', component: OficinaVirtualComponent },
          { path: 'factura-electronica-kit-digital', component: FacturaDigitalComponent },
          { path: 'erp-kit-digital', component: ErpComponent },
          { path: 'crm-kit-digital', component: CrmComponent },
          { path: 'bi-analitica-kit-digital', component: BiAnaliticaComponent },
          { path: 'ciberseguridad-kit-digital', component: CiberseguridadComponent},
          { path: 'comunicaciones-seguras-kit-digital', component: ComunicacionesSegurasComponent},
          { path: 'presencia-avanzada-kit-digital', component: PresenciaAvanzadaComponent},
          { path: 'marketplace-kit-digital', component: MarketplaceComponent},

          // Seccion de servicios de desarrollo web
          { path: 'agencia-de-desarrollo-web', component: DisenioWebComponent},
          { path: 'agencia-de-ecommerce', component: EcoommerceComponent},
          { path: 'agencia-de-funnels', component: FunnelsComponent},
          { path: 'agencia-disenio-wordpress', component: DisenioWordpressComponent},
          { path: 'agencia-disenio-web-corporativo', component: DisenioWebCorporativoComponent},

          // Secction de servicios de marketing digital
          { path: 'gestion-redes-sociales', component: GestionRedesSocialesComponent},
          { path: 'agencia-marketing-contenidos', component: AgenciaMarketingContenidosComponent}, 
          { path: 'agencia-de-branding', component: AgenciaDeBrandingComponent},
          { path: 'email-marketing', component: EmailMarketingComponent},

          // Seccion de servicios de posicionamiento web

          { path: 'agencia-adwords', component: AgenciaAdwordsComponent},
          { path: 'facebook-ads', component: AgenciaFacebookAdsComponent},
          { path: 'instagram-ads', component: AgenciaInstagramAdsComponent},
          { path: 'linkeding-ads', component: AgenciaLinkedingAdsComponent},
          
          // seccion de servicios de posicionamiento web
          { path: 'posicionamiento-seo-empresas', component: PosicionamientoSeoComponent},
          { path: 'agencia-sem', component: PosicionamientoSemComponent},
          { path: 'agencia-seo-local', component: PosicionamientoSeoLocalComponent},
          { path: 'auditoria-seo', component: AuditoriaSeoComponent},
          { path: 'agencia-de-linkbuilding', component: AgenciaLinkbuildingComponent},
          { path: 'agencia-seo-amazon', component: PosicionamientoSeoAmazonComponent},
          ///seccion para el SEO programatico
          { path: 'posicionamiento-seo-empresas/:location', component: PosicionamientoSeoComponent},
          { path: 'agencia-sem/:location', component: PosicionamientoSemComponent},
          { path: 'agencia-seo-local/:location', component: PosicionamientoSeoLocalComponent},
          { path: 'auditoria-seo/:location', component: AuditoriaSeoComponent},
          { path: 'agencia-de-linkbuilding/:location', component: AgenciaLinkbuildingComponent},
          { path: 'agencia-seo-amazon/:location', component: PosicionamientoSeoAmazonComponent},
          
          // Seccion de desarrollo web
          { path: 'desarrollo-de-software', component: SoftwareMedidaComponent},
          { path: 'diseño-web-app', component: AppWebComponent},

          //SECCION DE BLOG
          { path: 'blog', 
            component: MainBlogComponent,
          },
          { path: 'blog/:?', component: BlogDetailComponent },

          { path: 'nosotros', component: AboutUsComponent},


          //SECION DE MISCELANEA

          { path: 'preguntas-frequentes', component: FaqComponent},
          { path: 'contacto', component: ContactoComponent},
          { path: 'politica-de-privacidad', component: PoliticaprivacidadComponent},
          { path: 'mapa-web', component: MapaWebComponent
        },

        ],
        
      },


      
    
  { path: 'dashboard', component: AdminPanelComponent , canActivate: [AuthGuard] },

  { path: 'auth-login', component: AuthLoginComponent  },
  { path: 'auth-cover-login', component: AuthCoverLoginComponent },
  { path: 'auth-cover-re-password', component: AuthCoverRePasswordComponent },
  { path: 'auth-cover-signup', component: AuthCoverSignupComponent },
  { path: 'auth-login-three', component: AuthLoginThreeComponent },
  { path: 'auth-re-password', component: AuthRePasswordComponent },
  { path: 'auth-re-password-three', component: AuthRePasswordThreeComponent },
  { path: 'auth-signup', component: AuthSignupComponent },
  { path: 'auth-signup-three', component: AuthSignupThreeComponent },
  
  

];


@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: "enabled",
    scrollOffset: [0, 0],
    // Enable scrolling to anchors
    anchorScrolling: "enabled", initialNavigation: 'enabledBlocking' })],
  exports: [RouterModule]
})
export class AppRoutingModule { 

  constructor(){


    // var pagina = "https://tecnoriasl.com/";
    // var date = new Date();
    // var priority = 0.8;
    // //formato 2023-02-06T15:51:20 + 00:00
    // date = new Date(date.getTime() + 1000 * 60 * 60 * 24 * 365 * 2);
    // console.log(date.toISOString());
    // var xml = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`
   
    // routes.forEach((route) => {

    //   if(route.children){

    //     route.children.forEach((child) => {
          
    //       if(child.path == ""){
    //         child.path = route.path;

    //         xml += `<url>
    //                   <loc>${pagina}${child.path}</loc>
    //                   <lastmod>${date.toISOString()}</lastmod>
    //                   <changefreq>monthly</changefreq>
    //                   <priority>${priority}</priority>
    //                 </url>`
    //       }
    //       if(child.path !== "blog/:?"){

    //         xml += `<url>
    //                   <loc>${pagina}${child.path}</loc>
    //                   <lastmod>${date.toISOString()}</lastmod>
    //                   <changefreq>monthly</changefreq>
    //                   <priority>${priority}</priority>
    //                 </url>`      
    //       }
    //     })

    // xml += `</urlset>`

    // console.log(xml);
    //   }
    // });

  }

}


  
    

  
  
