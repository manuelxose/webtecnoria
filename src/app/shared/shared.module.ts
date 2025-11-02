import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

// 3rd party UI
import { FeatherModule } from "angular-feather";
import { allIcons } from "angular-feather/icons";
import { ScrollToModule } from "@nicky-lenaers/ngx-scroll-to";
import { CarouselModule } from "ngx-owl-carousel-o";
import { LightboxModule } from "ngx-lightbox";
import { SwiperModule } from "ngx-swiper-wrapper";
import { NgxTypedJsModule } from "ngx-typed-js";
import { CountToModule } from "angular-count-to";
import { NgxMasonryModule } from "ngx-masonry";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { NgxYoutubePlayerModule } from "ngx-youtube-player";
import { NgxPaginationModule } from "ngx-pagination";
import {
  NgbModule,
  NgbDropdownModule,
  NgbNavModule,
  NgbAccordionModule,
} from "@ng-bootstrap/ng-bootstrap";

// Declaraciones propias (compartidas)
import { ScrollspyDirective } from "./scrollspy.directive";
import { TestimonialComponent } from "./testimonial/testimonial.component";
import { ClientsLogoComponent } from "./clients-logo/clients-logo.component";
import { ServicesComponent } from "./services/services.component";
import { PricingComponent } from "./pricing/pricing.component";
import { FeaturesComponent } from "./features/features.component";
import { CustomerTestmonialComponent } from "./customer-testmonial/customer-testmonial.component";
import { ReviewTestmonialComponent } from "./review-testmonial/review-testmonial.component";
import { SimplePricingComponent } from "./simple-pricing/simple-pricing.component";
import { MemberComponent } from "./member/member.component";
import { BlogComponent } from "./blog/blog.component";
import { FormBottomComponent } from "./form-bottom/form-bottom.component";
import { PreloaderComponent } from "./preloader/preloader.component";
import { ChatBotComponent } from "./chat-bot/chat-bot.component";
import { ArribaFlechaComponent } from "./arriba-flecha/arriba-flecha.component";
import { LocationsComponent } from "./locations/locations.component";

@NgModule({
  declarations: [
    ScrollspyDirective,
    TestimonialComponent,
    ClientsLogoComponent,
    ServicesComponent,
    PricingComponent,
    FeaturesComponent,
    CustomerTestmonialComponent,
    ReviewTestmonialComponent,
    SimplePricingComponent,
    MemberComponent,
    BlogComponent,
    FormBottomComponent,
    PreloaderComponent,
    ChatBotComponent,
    ArribaFlechaComponent,
    LocationsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

    // UI libs (solo una vez aquí)
    FeatherModule.pick(allIcons),
    ScrollToModule.forRoot(),
    CarouselModule,
    LightboxModule,
    SwiperModule,
    NgxTypedJsModule,
    CountToModule,
    NgxMasonryModule,
    CKEditorModule,
    NgxYoutubePlayerModule,
    NgxPaginationModule,
    NgbModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbAccordionModule,
  ],
  exports: [
    // Re-export básicos para plantillas hijas
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

    // Re-export UI (directivas/elementos disponibles)
    FeatherModule,
    ScrollToModule,
    CarouselModule,
    LightboxModule,
    SwiperModule,
    NgxTypedJsModule,
    CountToModule,
    NgxMasonryModule,
    CKEditorModule,
    NgxYoutubePlayerModule,
    NgxPaginationModule,
    NgbModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbAccordionModule,

    // Componentes/directivas compartidos
    ScrollspyDirective,
    TestimonialComponent,
    ClientsLogoComponent,
    ServicesComponent,
    PricingComponent,
    FeaturesComponent,
    CustomerTestmonialComponent,
    ReviewTestmonialComponent,
    SimplePricingComponent,
    MemberComponent,
    BlogComponent,
    FormBottomComponent,
    PreloaderComponent,
    ChatBotComponent,
    ArribaFlechaComponent,
    LocationsComponent,
  ],
})
export class SharedModule {}
