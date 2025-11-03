import { Component, OnInit } from "@angular/core";
import { ModalService } from "src/app/services/modal.service";

@Component({
  selector: "redes-sociales",
  templateUrl: "./redes-sociales.component.html",
  styleUrls: ["./redes-sociales.component.css"],
  standalone: true,
  imports: [],
})
export class RedesSocialesComponent implements OnInit {
  constructor(private mSvc: ModalService) {}

  ngOnInit(): void {}

  public subscribeOpen(content: any) {
    this.mSvc.Subscribeopen(content);
  }
}
