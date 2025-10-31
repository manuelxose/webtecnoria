import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-ciberseguridad',
  templateUrl: './ciberseguridad.component.html',
  styleUrls: ['./ciberseguridad.component.css']
})
export class CiberseguridadComponent implements OnInit {

  constructor(private mSvc:ModalService) { }

  ngOnInit(): void {
  }

  public subscribeOpen(content:any){
    this.mSvc.Subscribeopen(content);
  }
}
