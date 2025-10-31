import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'tienda-online',
  templateUrl: './tienda-online.component.html',
  styleUrls: ['./tienda-online.component.css']
})
export class TiendaOnlineComponent implements OnInit {

  constructor(private mSvc:ModalService) { }

  ngOnInit(): void {
  }

  public subscribeOpen(content:any){
    this.mSvc.Subscribeopen(content);
  }
}
