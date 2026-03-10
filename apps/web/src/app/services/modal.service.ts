import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private modalService: NgbModal) { }

prueba(){
  console.log("Prueba del modal")
}

/***
   * Model open
   */
 open(content) {
  this.modalService.open(content, { centered: true });
}
openLogin(content) {
  this.modalService.open(content, { size: 'lg', windowClass: 'modal-holder', centered: true });
}
Subscribeopen(content) {
  console.log(content);
  
  this.modalService.open(content, { size: 'lg', windowClass: 'modal-holder', centered: true });
}
Wishlistopen(content) {
  this.modalService.open(content, { size: 'lg', windowClass: 'modal-holder', centered: true });
}
Emptyopen(content) {
  this.modalService.open(content, { size: 'lg', windowClass: 'modal-holder', centered: true });
}



}
