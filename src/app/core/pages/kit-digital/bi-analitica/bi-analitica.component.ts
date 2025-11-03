import { Component, OnInit } from "@angular/core";
import { ModalService } from "src/app/services/modal.service";

@Component({
    selector: "bi-analitica",
    templateUrl: "./bi-analitica.component.html",
    styleUrls: ["./bi-analitica.component.css"],
    imports: []
})
export class BiAnaliticaComponent implements OnInit {
  constructor(private mSvc: ModalService) {}

  ngOnInit(): void {}

  public subscribeOpen(content: any) {
    this.mSvc.Subscribeopen(content);
  }
}
