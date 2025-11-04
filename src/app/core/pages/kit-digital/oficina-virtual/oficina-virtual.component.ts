import { Component, OnInit } from "@angular/core";
import { ModalService } from "src/app/services/modal.service";
import { FormBottomComponent } from "src/app/shared/form-bottom/form-bottom.component";
import { FeatherModule } from "angular-feather";
import { ScrollToDirective as ngxScrollTo } from "src/app/shared/scroll-to.directive";

@Component({
  selector: "oficina-virtual",
  templateUrl: "./oficina-virtual.component.html",
  styleUrls: ["./oficina-virtual.component.css"],
  imports: [FeatherModule, ngxScrollTo, FormBottomComponent],
})
export class OficinaVirtualComponent implements OnInit {
  constructor(private mSvc: ModalService) {}

  ngOnInit(): void {}

  public subscribeOpen(content: any) {
    this.mSvc.Subscribeopen(content);
  }
}
