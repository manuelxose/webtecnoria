import { Component, OnInit } from "@angular/core";
import { ModalService } from "src/app/services/modal.service";
import { FeatherModule } from "angular-feather";
import { ScrollToDirective as ngxScrollTo } from "src/app/shared/scroll-to.directive";
import { FormBottomComponent } from "src/app/shared/form-bottom/form-bottom.component";

@Component({
  selector: "app-pagina-web",
  templateUrl: "./pagina-web.component.html",
  styleUrls: ["./pagina-web.component.css"],
  imports: [FeatherModule, ngxScrollTo, FormBottomComponent],
})
export class PaginaWebComponent implements OnInit {
  constructor(private mSvc: ModalService) {}

  ngOnInit(): void {}

  public subscribeOpen(content: any) {
    this.mSvc.Subscribeopen(content);
  }
}
