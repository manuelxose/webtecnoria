import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ScrollToDirective as ngxScrollTo } from "src/app/shared/scroll-to.directive";
import { FeatherModule } from "angular-feather";
import { ClientsLogoComponent } from "src/app/shared/clients-logo/clients-logo.component";

@Component({
  selector: "app-about-us",
  templateUrl: "./about-us.component.html",
  styleUrls: ["./about-us.component.css"],
  standalone: true,
  imports: [CommonModule, ngxScrollTo, ClientsLogoComponent, FeatherModule],
})
export class AboutUsComponent {
  constructor() {}
}
