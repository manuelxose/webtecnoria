import { Component } from "@angular/core";
import { FeatherModule } from "angular-feather";
import { ScrollToDirective as ngxScrollTo } from "src/app/shared/scroll-to.directive";

@Component({
  selector: "app-politicaprivacidad",
  templateUrl: "./politicaprivacidad.component.html",
  styleUrls: ["./politicaprivacidad.component.css"],
  imports: [FeatherModule, ngxScrollTo],
})
export class PoliticaprivacidadComponent {}
