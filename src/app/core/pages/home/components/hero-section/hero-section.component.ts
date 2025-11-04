import { Component } from "@angular/core";

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

  scrollToContact(): void {
    const contactSection = document.getElementById("contact-form");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  callPhone(): void {
    window.location.href = `tel:+34${this.phoneNumber.replace(/\s/g, "")}`;
  }
}
