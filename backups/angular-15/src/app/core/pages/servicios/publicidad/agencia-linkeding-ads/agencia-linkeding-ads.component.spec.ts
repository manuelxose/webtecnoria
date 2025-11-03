import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenciaLinkedingAdsComponent } from './agencia-linkeding-ads.component';

describe('AgenciaLinkedingAdsComponent', () => {
  let component: AgenciaLinkedingAdsComponent;
  let fixture: ComponentFixture<AgenciaLinkedingAdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgenciaLinkedingAdsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgenciaLinkedingAdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
