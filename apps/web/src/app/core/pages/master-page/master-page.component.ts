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

  addclass = "";
  buttonShow = false;
  TopbarShow = false;
  footerClass = "";
  developerPage = false;
  hideFooter = false;
  shopPages = false;
  Settingicon = true;
  appicons = false;
  Nfticons = false;
  Menuoption = "center";

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
    this.addclass = componentReference.navClass ?? "";
    this.buttonShow = componentReference.buttonList ?? false;
    this.TopbarShow = componentReference.sliderTopbar ?? false;
    this.footerClass = componentReference.footerVariant ?? "";
    this.developerPage = componentReference.isdeveloper ?? false;
    this.hideFooter = componentReference.hideFooter ?? false;
    this.shopPages = componentReference.shopPages ?? false;
    this.Settingicon = componentReference.Settingicon ?? true;
    this.appicons = componentReference.appicons ?? false;
    this.Nfticons = componentReference.Nfticons ?? false;
    this.Menuoption = componentReference.Menuoption ?? "center";
  }
}
