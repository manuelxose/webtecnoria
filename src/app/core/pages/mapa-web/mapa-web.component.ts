import { Component } from "@angular/core";
import { FeatherModule } from "angular-feather";
import { ScrollToDirective as ngxScrollTo } from "src/app/shared/scroll-to.directive";

@Component({
  selector: "app-mapa-web",
  templateUrl: "./mapa-web.component.html",
  styleUrls: ["./mapa-web.component.css"],
  imports: [FeatherModule, ngxScrollTo],
})
export class MapaWebComponent {}
