import { Component, OnInit } from "@angular/core";
import { ModalService } from "src/app/services/modal.service";

@Component({
    selector: "factura-electronica",
    templateUrl: "./factura-digital.component.html",
    styleUrls: ["./factura-digital.component.css"],
    imports: []
})
export class FacturaDigitalComponent implements OnInit {
  constructor(private mSvc: ModalService) {}

  ngOnInit(): void {}

  public subscribeOpen(content: any) {
    this.mSvc.Subscribeopen(content);
  }
}
