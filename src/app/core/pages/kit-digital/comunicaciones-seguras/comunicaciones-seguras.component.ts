import { Component, OnInit } from "@angular/core";
import { ModalService } from "src/app/services/modal.service";
import { ScrollToDirective as ngxScrollTo } from "src/app/shared/scroll-to.directive";
import { FeatherModule } from "angular-feather";
import { FormBottomComponent } from "src/app/shared/form-bottom/form-bottom.component";

@Component({
  selector: "app-comunicaciones-seguras",
  templateUrl: "./comunicaciones-seguras.component.html",
  styleUrls: ["./comunicaciones-seguras.component.css"],
  imports: [ngxScrollTo, FeatherModule, FormBottomComponent],
})
export class ComunicacionesSegurasComponent implements OnInit {
  constructor(private mSvc: ModalService) {}

  ngOnInit(): void {}

  public subscribeOpen(content: any) {
    this.mSvc.Subscribeopen(content);
  }
}
