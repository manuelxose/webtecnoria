import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-comunicaciones-seguras',
  templateUrl: './comunicaciones-seguras.component.html',
  styleUrls: ['./comunicaciones-seguras.component.css']
})
export class ComunicacionesSegurasComponent implements OnInit {

  constructor(private mSvc:ModalService) { }

  ngOnInit(): void {
  }

  public subscribeOpen(content:any){
    this.mSvc.Subscribeopen(content);
  }

}
