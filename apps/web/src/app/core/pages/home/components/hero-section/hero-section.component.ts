import { Component } from "@angular/core";
import { BrowserDomAdapter } from "src/app/core/platform/browser-dom-adapter.service";

@Component({
  selector: "app-hero-section",
  templateUrl: "./hero-section.component.html",
  styleUrls: ["./hero-section.component.css"],
  standalone: true,
  imports: [],
})
export class HeroSectionComponent {
  phoneNumber = "682 04 78 02";
  ctaEmail = "info@tecnoria.com";

  constructor(private readonly dom: BrowserDomAdapter) {}

  scrollToContact(): void {
    this.dom.scrollToId("contact-form");
  }

  callPhone(): void {
    if (!this.dom.isBrowser) return;
    window.location.href = `tel:+34${this.phoneNumber.replace(/\s/g, "")}`;
  }
}
