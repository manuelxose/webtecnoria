import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FeatherModule } from "angular-feather";
import { ScrollToDirective as ngxScrollTo } from "src/app/shared/scroll-to.directive";

@Component({
  selector: "app-arriba-flecha",
  templateUrl: "./arriba-flecha.component.html",
  styleUrls: ["./arriba-flecha.component.css"],
  standalone: true,
  imports: [CommonModule, FeatherModule, ngxScrollTo],
})
export class ArribaFlechaComponent {}
