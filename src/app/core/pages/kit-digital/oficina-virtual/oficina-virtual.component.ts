import { Component, OnInit } from "@angular/core";
import { ModalService } from "src/app/services/modal.service";

@Component({
    selector: "oficina-virtual",
    templateUrl: "./oficina-virtual.component.html",
    styleUrls: ["./oficina-virtual.component.css"],
    imports: []
})
export class OficinaVirtualComponent implements OnInit {
  constructor(private mSvc: ModalService) {}

  ngOnInit(): void {}

  public subscribeOpen(content: any) {
    this.mSvc.Subscribeopen(content);
  }
}
