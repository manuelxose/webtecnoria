import { Component, OnInit } from "@angular/core";
import { FeatherModule } from "angular-feather";
import { ModalService } from "src/app/services/modal.service";
import { FormBottomComponent } from "src/app/shared/form-bottom/form-bottom.component";
import { ScrollToDirective as ngxScrollTo } from "src/app/shared/scroll-to.directive";

@Component({
  selector: "app-ciberseguridad",
  templateUrl: "./ciberseguridad.component.html",
  styleUrls: ["./ciberseguridad.component.css"],
  imports: [ngxScrollTo, FeatherModule, FormBottomComponent],
})
export class CiberseguridadComponent implements OnInit {
  constructor(private mSvc: ModalService) {}

  ngOnInit(): void {}

  public subscribeOpen(content: any) {
    this.mSvc.Subscribeopen(content);
  }
}
