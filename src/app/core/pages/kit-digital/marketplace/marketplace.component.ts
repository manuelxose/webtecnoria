import { Component, OnInit } from "@angular/core";
import { ModalService } from "src/app/services/modal.service";

@Component({
    selector: "app-marketplace",
    templateUrl: "./marketplace.component.html",
    styleUrls: ["./marketplace.component.css"],
    imports: []
})
export class MarketplaceComponent implements OnInit {
  constructor(private mSvc: ModalService) {}

  ngOnInit(): void {}

  public subscribeOpen(content: any) {
    this.mSvc.Subscribeopen(content);
  }
}
