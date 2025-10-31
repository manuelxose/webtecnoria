import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'crm',
  templateUrl: './crm.component.html',
  styleUrls: ['./crm.component.css']
})
export class CrmComponent implements OnInit {

  constructor(private mSvc:ModalService) { }

  ngOnInit(): void {
  }

  public subscribeOpen(content:any){
    this.mSvc.Subscribeopen(content);
  }

}
