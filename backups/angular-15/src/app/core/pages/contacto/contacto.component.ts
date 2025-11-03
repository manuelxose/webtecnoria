import { Component } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-contacto",
  templateUrl: "./contacto.component.html",
  styleUrls: ["./contacto.component.css"],
  standalone: true,
  imports: [],
})
export class ContactoComponent {
  constructor(private modalService: NgbModal) {}

  mapView(content) {
    this.modalService.open(content, {
      windowClass: "dark-modal",
      size: "lg",
      centered: true,
    });
  }
}
