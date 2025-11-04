import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ArribaFlechaComponent } from "src/app/shared/arriba-flecha/arriba-flecha.component";
import { ChatBotComponent } from "src/app/shared/chat-bot/chat-bot.component";
import { FooterComponent } from "src/app/shared/footer/footer.component";
import { HeaderComponent } from "src/app/shared/header/header.component";

@Component({
  selector: "app-master-page",
  templateUrl: "./master-page.component.html",
  styleUrls: ["./master-page.component.css"],
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ArribaFlechaComponent,
    FooterComponent,
    ChatBotComponent,
    RouterModule,
  ],
})
export class MasterPageComponent implements OnInit {
  showPreloader = true;

  addclass: string;
  buttonShow: boolean;
  TopbarShow: boolean;
  footerClass: string;
  developerPage: boolean;
  hideFooter: boolean;
  shopPages: boolean;
  Settingicon: boolean;
  appicons: boolean;
  Nfticons: boolean;
  Menuoption: string;

  constructor(private elementRef: ElementRef) {
    setTimeout(() => {
      this.showPreloader = true;
    }, 3000);
  }

  ngOnInit(): void {}

  /**
   * Router activation
   */
  onActivate(componentReference: any) {
    this.addclass = componentReference.navClass;
    this.buttonShow = componentReference.buttonList;
    this.TopbarShow = componentReference.sliderTopbar;
    this.footerClass = componentReference.footerVariant;
    this.developerPage = componentReference.isdeveloper;
    this.hideFooter = componentReference.hideFooter;
    this.shopPages = componentReference.shopPages;
    this.Settingicon = componentReference.Settingicon;
    this.appicons = componentReference.appicons;
    this.Nfticons = componentReference.Nfticons;
    this.Menuoption = componentReference.Menuoption;
  }
}
