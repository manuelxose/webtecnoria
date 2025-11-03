import { Component, OnInit } from "@angular/core";
import { ModalService } from "src/app/services/modal.service";

@Component({
  selector: "erp",
  templateUrl: "./erp.component.html",
  styleUrls: ["./erp.component.css"],
  standalone: true,
  imports: [],
})
export class ErpComponent implements OnInit {
  constructor(private mSvc: ModalService) {}

  ngOnInit(): void {}

  public subscribeOpen(content: any) {
    this.mSvc.Subscribeopen(content);
  }
}
