import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenciaFacebookAdsComponent } from './agencia-facebook-ads.component';

describe('AgenciaFacebookAdsComponent', () => {
  let component: AgenciaFacebookAdsComponent;
  let fixture: ComponentFixture<AgenciaFacebookAdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgenciaFacebookAdsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgenciaFacebookAdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
