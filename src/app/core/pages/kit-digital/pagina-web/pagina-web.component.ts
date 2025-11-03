import { Component, OnInit } from "@angular/core";
import { ModalService } from "src/app/services/modal.service";

@Component({
    selector: "app-pagina-web",
    templateUrl: "./pagina-web.component.html",
    styleUrls: ["./pagina-web.component.css"],
    imports: []
})
export class PaginaWebComponent implements OnInit {
  constructor(private mSvc: ModalService) {}

  ngOnInit(): void {}

  public subscribeOpen(content: any) {
    this.mSvc.Subscribeopen(content);
  }
}
