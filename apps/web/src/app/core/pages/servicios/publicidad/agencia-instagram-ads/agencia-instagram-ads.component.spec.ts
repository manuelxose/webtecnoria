import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenciaInstagramAdsComponent } from './agencia-instagram-ads.component';

describe('AgenciaInstagramAdsComponent', () => {
  let component: AgenciaInstagramAdsComponent;
  let fixture: ComponentFixture<AgenciaInstagramAdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgenciaInstagramAdsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgenciaInstagramAdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
