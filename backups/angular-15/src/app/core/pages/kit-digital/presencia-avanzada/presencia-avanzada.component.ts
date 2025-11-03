import { Component, OnInit } from "@angular/core";
import { ModalService } from "src/app/services/modal.service";

@Component({
  selector: "app-presencia-avanzada",
  templateUrl: "./presencia-avanzada.component.html",
  styleUrls: ["./presencia-avanzada.component.css"],
  standalone: true,
  imports: [],
})
export class PresenciaAvanzadaComponent implements OnInit {
  constructor(private mSvc: ModalService) {}

  ngOnInit(): void {}

  public subscribeOpen(content: any) {
    this.mSvc.Subscribeopen(content);
  }
}
